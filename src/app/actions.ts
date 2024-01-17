'use server';

import OpenAI from 'openai';
import wordsCount from 'words-count';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

export async function sendToOpenAI(prompt: string) {
  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Reply with 4 emojis that are relevant to the prompt. Separate them with commas.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 200,
    temperature: 1,
  });

  return response.choices[0]?.message.content;
}

export async function validatePrompt(prompt: string) {
  if (wordsCount(prompt) > 1) {
    return {
      error: 'Please enter a single word',
    };
  }

  if (/[^a-zA-Z]/.test(prompt)) {
    return {
      error: 'Please enter a word without special characters',
    };
  }

  if (prompt.length < 2) {
    return {
      error: 'Please enter a word longer than 3 characters',
    };
  }

  if (prompt.length > 20) {
    return {
      error: 'Please enter a word less than 20 characters',
    };
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
