'use server';

import { after } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { eq } from 'drizzle-orm';
import * as emoji from 'node-emoji';
import OpenAI from 'openai';
import pRetry from 'p-retry';

import { db } from 'src/db';
import { emojis, emojiWords } from 'src/db/schema';
import { extractEmojis, validateEmojiInput } from 'src/utils/emoji';
import { validatePrompt } from 'src/utils/validation';
import { FormState } from 'modules/home/prompt-form';
import { ReverseFormState } from 'modules/home/reverse-lookup-form';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  prefix: 'word2emoji',
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for emoji generation
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

// System prompt for emoji-to-words reverse lookup
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

/**
 * Generates emojis for a given prompt using OpenAI's GPT model.
 * Falls back to a predefined set of emojis if the API call fails.
 */
export async function sendToOpenAI(prompt: string): Promise<string | undefined> {
  try {
    const completion = await openai.chat.completions.create({
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
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      const { status, message } = error;
      console.error('OpenAI API error:', status, message);

      // Rate limit or quota exceeded - don't retry immediately
      if (status === 429) {
        console.error('OpenAI rate limit exceeded');
      }

      // Authentication error
      if (status === 401) {
        console.error('OpenAI authentication failed - check API key');
      }
    } else {
      console.error('Unexpected error during emoji generation:', error);
    }

    return undefined;
  }
}

export async function savePrompt(prompt: string, result: string[] | undefined) {
  if (!prompt || !result) {
    throw new Error('Invalid prompt');
  }

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

/**
 * Generates word suggestions for given emoji(s) using OpenAI's GPT model.
 */
export async function sendEmojiToOpenAI(emojiInput: string): Promise<string[] | undefined> {
  try {
    const completion = await openai.chat.completions.create({
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

    // Parse JSON array from response
    try {
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed;
      }
      console.error('OpenAI returned invalid format for emoji-to-words');
      return undefined;
    } catch {
      // Try to extract JSON array from response if it contains extra text
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
      console.error('Failed to parse emoji-to-words response as JSON:', result);
      return undefined;
    }
  } catch (error: unknown) {
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      const { status, message } = error;
      console.error('OpenAI API error (emoji-to-words):', status, message);

      if (status === 429) {
        console.error('OpenAI rate limit exceeded');
      }

      if (status === 401) {
        console.error('OpenAI authentication failed - check API key');
      }
    } else {
      console.error('Unexpected error during emoji-to-words generation:', error);
    }

    return undefined;
  }
}

/**
 * Saves emoji-to-words result to database for caching
 */
export async function saveEmojiWords(emoji: string, words: string[]) {
  if (!emoji || !words || words.length === 0) {
    throw new Error('Invalid emoji or words');
  }

  await db
    .insert(emojiWords)
    .values({
      emoji: emoji,
      words: JSON.stringify(words),
      created_at: new Date().toISOString(),
    })
    .onConflictDoNothing()
    .execute();
}

export async function getEmojis(_prevState: FormState, formdata: FormData) {
  'use server';

  // Prevent spamming
  const { success } = await ratelimit.limit(String(formdata.get('randomId')));
  if (!success) {
    return {
      error: 'Please wait a few seconds before trying again',
    };
  }

  const prompt = formdata.get('prompt') as string;
  const validateResult = await validatePrompt(prompt);

  // Validate prompt
  if (validateResult && 'error' in validateResult) {
    return validateResult;
  }

  // Check if the prompt is stored in db
  const cached = await db.query.emojis.findFirst({
    columns: { emoji: true },
    where: eq(emojis.word, prompt),
  });

  if (cached) {
    return cached.emoji.split(',').map((e) => e.trim());
  }

  // Max 3 tries to get a result
  const emojisResult = await pRetry(
    async () => {
      const result = await sendToOpenAI(prompt);

      // Check if we got a result and result contains emojis
      if (!result || emoji.strip(result) === result) {
        throw new Error('No emojis found');
      }

      if (result.length > 20) {
        throw new Error('Text too long');
      }

      const tempResult = result?.split(',').map((e) => e.trim());

      if (tempResult && tempResult.length > 1) {
        return tempResult;
      }

      // try extracting from string
      const emojisFromString = extractEmojis(result);

      if (emojisFromString && emojisFromString.length > 1) {
        return emojisFromString;
      }

      throw new Error('No emojis found');
    },
    { retries: 3 },
  );

  if (emojisResult == null) {
    return {
      error: 'Something went wrong, please try again',
    };
  }

  // Insert to db in the background while returning the result to the user
  after(() => savePrompt(prompt, emojisResult));

  return emojisResult;
}

export async function getWords(_prevState: ReverseFormState, formdata: FormData) {
  'use server';

  // Prevent spamming
  const { success } = await ratelimit.limit(String(formdata.get('randomId')));
  if (!success) {
    return {
      error: 'Please wait a few seconds before trying again',
    };
  }

  const emojiInput = formdata.get('emoji') as string;

  // Validate emoji input
  const validation = validateEmojiInput(emojiInput);
  if (!validation.isValid) {
    return {
      error: validation.error || 'Invalid emoji input',
    };
  }

  // Use the joined emojis as the cache key
  const cacheKey = validation.emojis.join('');

  // Check if the emoji is stored in db
  const cached = await db.query.emojiWords.findFirst({
    columns: { words: true },
    where: eq(emojiWords.emoji, cacheKey),
  });

  if (cached) {
    try {
      return JSON.parse(cached.words) as string[];
    } catch {
      // If parsing fails, continue to fetch from AI
    }
  }

  // Max 3 tries to get a result
  const wordsResult = await pRetry(
    async () => {
      const result = await sendEmojiToOpenAI(cacheKey);

      if (!result || result.length === 0) {
        throw new Error('No words found');
      }

      return result;
    },
    { retries: 3 },
  );

  if (wordsResult == null) {
    return {
      error: 'Something went wrong, please try again',
    };
  }

  // Insert to db in the background while returning the result to the user
  after(() => saveEmojiWords(cacheKey, wordsResult));

  return wordsResult;
}
