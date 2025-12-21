'use server';

import OpenAI from 'openai';

import { db } from 'src/db';
import { emojis, emojiWords } from 'src/db/schema';

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
