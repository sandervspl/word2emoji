import { env } from 'cloudflare:workers';
import { count, desc, eq } from 'drizzle-orm';
import * as emoji from 'node-emoji';
import OpenAI from 'openai';
import pRetry from 'p-retry';
import { getRequest } from '@tanstack/react-start/server';

import { getDb } from 'src/db';
import { emojis, emojiWords } from 'src/db/schema';
import { getCachedValue } from 'src/utils/cache.server';
import type { Mode } from 'src/utils/constants';
import { extractEmojis, validateEmojiInput } from 'src/utils/emoji';
import { validatePrompt } from 'src/utils/validation';

import type {
  EmojiToWordRecentItem,
  FormState,
  HomePageData,
  ReverseFormState,
  WordToEmojiRecentItem,
} from './home.types';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

let openai: OpenAI | undefined;

const EMOJI_SYSTEM_PROMPT = `You are an emoji generator. Given a word or short phrase, respond with at most 4 relevant emojis that represent or relate to the input.

Rules:
- Only respond with emojis, separated by commas
- Do not include any text or explanations
- Choose emojis that are visually representative and commonly used
- Aim for variety while staying relevant to the input
- If the input is abstract, use metaphorical or symbolic emojis

Example:
Input: "happy"
Output: 😊,😄,🎉,✨

Input: "coffee"
Output: ☕,🫘,😌,🌅`;

const EMOJI_TO_WORDS_SYSTEM_PROMPT = `You are a word/description generator for emojis. Given one or more emojis, respond with relevant words, phrases, or descriptions that match the emoji(s).

Rules:
- Respond with a JSON array of word suggestions
- Each suggestion should be a single word or short phrase (2-3 words max)
- Provide 4-8 suggestions per emoji or emoji combination
- Include both literal meanings and contextual interpretations
- Order suggestions by relevance (most relevant first)
- For compound emojis (with skin tones, genders, ZWJ sequences), consider the full meaning
- For multiple emojis, consider both individual meanings and their combined context
- Do not include any explanations outside the JSON array
- Only output valid JSON

Example:
Input: 😊
Output: ["happy", "smile", "joy", "friendly", "pleased", "cheerful"]

Input: 👨‍💻
Output: ["programmer", "developer", "coding", "tech worker", "software engineer", "hacker"]

Input: 🌅☕
Output: ["morning", "sunrise coffee", "peaceful", "dawn", "early bird", "relaxing", "serene"]

Input: 🏳️‍🌈
Output: ["pride", "LGBTQ", "rainbow flag", "equality", "diversity", "inclusion", "celebration"]`;

function getOpenAI() {
  openai ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
}

function getRateLimitKey(scope: 'word-to-emoji' | 'emoji-to-word') {
  try {
    const request = getRequest();
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp =
      request.headers.get('cf-connecting-ip') ??
      request.headers.get('true-client-ip') ??
      forwardedFor?.split(',')[0]?.trim();
    const userAgent = request.headers.get('user-agent') ?? 'unknown-user-agent';

    return `${scope}:${clientIp ?? userAgent}`;
  } catch {
    return `${scope}:unknown-client`;
  }
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/\s+/g, ' ');
}

async function sendToOpenAI(prompt: string): Promise<string | undefined> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EMOJI_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content?.trim();

    if (!result) {
      console.error('OpenAI returned empty response');
      return undefined;
    }

    return result;
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      const { status, message } = error;
      console.error('OpenAI API error:', status, message);
    } else {
      console.error('Unexpected error during emoji generation:', error);
    }

    return undefined;
  }
}

async function sendEmojiToOpenAI(emojiInput: string): Promise<string[] | undefined> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EMOJI_TO_WORDS_SYSTEM_PROMPT },
        { role: 'user', content: emojiInput },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const result = completion.choices[0]?.message?.content?.trim();

    if (!result) {
      console.error('OpenAI returned empty response for emoji-to-words');
      return undefined;
    }

    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
    } catch {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          if (Array.isArray(extracted) && extracted.every((item) => typeof item === 'string')) {
            return extracted;
          }
        } catch {
          console.error('Failed to parse extracted JSON from emoji-to-words response');
        }
      }
    }

    console.error('Failed to parse emoji-to-words response as JSON:', result);
    return undefined;
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      const { status, message } = error;
      console.error('OpenAI API error (emoji-to-words):', status, message);
    } else {
      console.error('Unexpected error during emoji-to-words generation:', error);
    }

    return undefined;
  }
}

async function savePrompt(prompt: string, result: string[]) {
  const db = getDb();

  await db
    .insert(emojis)
    .values({
      word: prompt,
      emoji: result.join(','),
      created_at: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .execute();
}

async function saveEmojiWords(emojiValue: string, words: string[]) {
  const db = getDb();

  await db
    .insert(emojiWords)
    .values({
      emoji: emojiValue,
      words: JSON.stringify(words),
      created_at: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .execute();
}

async function loadGeneratedCount(mode: Mode) {
  const db = getDb();

  return getCachedValue({
    key: `generated-count:${mode}`,
    revalidateAfterMs: HOUR_MS,
    expireAfterMs: DAY_MS,
    load: async () => {
      const isProduction = process.env.NODE_ENV === 'production';

      if (mode === 'emoji-to-word') {
        const allEmojiWords = !isProduction
          ? []
          : await db.query.emojiWords.findMany({
              columns: { words: true },
            });

        if (!isProduction) {
          return 400;
        }

        return allEmojiWords.reduce((sum, item) => {
          try {
            const words = JSON.parse(item.words) as string[];
            return sum + words.length;
          } catch {
            return sum;
          }
        }, 0);
      }

      const [amountGenerated] = !isProduction
        ? [{ count: 100 }]
        : await db.select({ count: count() }).from(emojis);

      return (amountGenerated?.count ?? 0) * 4;
    },
  });
}

async function loadWordToEmojiRecentlyGenerated(): Promise<WordToEmojiRecentItem[]> {
  const db = getDb();

  return getCachedValue({
    key: 'recently-generated:word-to-emoji',
    revalidateAfterMs: MINUTE_MS,
    expireAfterMs: HOUR_MS,
    load: async () => {
      const result = await db.query.emojis.findMany({
        columns: { id: true, emoji: true, word: true },
        orderBy: desc(emojis.created_at),
        limit: 10,
      });

      return result.map((item) => ({
        id: item.id,
        word: item.word,
        emojis: item.emoji.split(',').map((value) => value.trim()),
      }));
    },
  });
}

async function loadEmojiToWordRecentlyGenerated(): Promise<EmojiToWordRecentItem[]> {
  const db = getDb();

  return getCachedValue({
    key: 'recently-generated:emoji-to-word',
    revalidateAfterMs: MINUTE_MS,
    expireAfterMs: HOUR_MS,
    load: async () => {
      const result = await db.query.emojiWords.findMany({
        columns: { id: true, emoji: true, words: true },
        orderBy: desc(emojiWords.created_at),
        limit: 10,
      });

      return result.map((item) => {
        let words: string[] = [];
        try {
          words = JSON.parse(item.words) as string[];
        } catch {
          words = [];
        }

        return {
          id: item.id,
          emoji: item.emoji,
          words,
        };
      });
    },
  });
}

export async function loadHomePageData(mode: Mode): Promise<HomePageData> {
  if (mode === 'word-to-emoji') {
    const [generatedCount, recentlyGenerated] = await Promise.all([
      loadGeneratedCount(mode),
      loadWordToEmojiRecentlyGenerated(),
    ]);

    return {
      mode,
      generatedCount,
      recentlyGenerated,
    };
  }

  const [generatedCount, recentlyGenerated] = await Promise.all([
    loadGeneratedCount(mode),
    loadEmojiToWordRecentlyGenerated(),
  ]);

  return {
    mode,
    generatedCount,
    recentlyGenerated,
  };
}

export async function generateEmojis(formData: FormData): Promise<FormState> {
  const db = getDb();

  const { success } = await env.RATE_LIMITER.limit({
    key: getRateLimitKey('word-to-emoji'),
  });
  if (!success) {
    return {
      error: 'Please wait a few seconds before trying again',
    };
  }

  const prompt = normalizePrompt(String(formData.get('prompt') ?? ''));
  const validation = await validatePrompt(prompt);

  if (validation && 'error' in validation) {
    return validation;
  }

  const cached = await db.query.emojis.findFirst({
    columns: { emoji: true },
    where: eq(emojis.word, prompt),
  });

  if (cached) {
    return cached.emoji.split(',').map((value) => value.trim());
  }

  let emojisResult: string[];
  try {
    emojisResult = await pRetry(
      async () => {
        const result = await sendToOpenAI(prompt);

        if (!result || emoji.strip(result) === result) {
          throw new Error('No emojis found');
        }

        if (result.length > 20) {
          throw new Error('Text too long');
        }

        const commaSeparated = result.split(',').map((value) => value.trim());
        if (commaSeparated.length > 1) {
          return commaSeparated;
        }

        const emojisFromString = extractEmojis(result);
        if (emojisFromString.length > 1) {
          return emojisFromString;
        }

        throw new Error('No emojis found');
      },
      { retries: 3 },
    );
  } catch {
    return {
      error: 'Something went wrong, please try again',
    };
  }

  await savePrompt(prompt, emojisResult);

  return emojisResult;
}

export async function generateWords(formData: FormData): Promise<ReverseFormState> {
  const db = getDb();

  const { success } = await env.RATE_LIMITER.limit({
    key: getRateLimitKey('emoji-to-word'),
  });
  if (!success) {
    return {
      error: 'Please wait a few seconds before trying again',
    };
  }

  const emojiInput = String(formData.get('emoji') ?? '').trim();
  const validation = validateEmojiInput(emojiInput);

  if (!validation.isValid) {
    return {
      error: validation.error || 'Invalid emoji input',
    };
  }

  const cacheKey = validation.emojis.join('');
  const cached = await db.query.emojiWords.findFirst({
    columns: { words: true },
    where: eq(emojiWords.emoji, cacheKey),
  });

  if (cached) {
    try {
      return JSON.parse(cached.words) as string[];
    } catch {
      // Ignore invalid cache rows and fall through to regeneration.
    }
  }

  let wordsResult: string[];
  try {
    wordsResult = await pRetry(
      async () => {
        const result = await sendEmojiToOpenAI(cacheKey);
        if (!result || result.length === 0) {
          throw new Error('No words found');
        }

        return result;
      },
      { retries: 3 },
    );
  } catch {
    return {
      error: 'Something went wrong, please try again',
    };
  }

  await saveEmojiWords(cacheKey, wordsResult);

  return wordsResult;
}
