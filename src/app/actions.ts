'use server';

import OpenAI from 'openai';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

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
