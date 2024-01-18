'use server';

import OpenAI from 'openai';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

export async function sendToOpenAI(prompt: string) {
  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'The user will send you a phrase. Reply with 4 unique emojis that are relevant to the prompt. Separate them with commas. Do NOT reply like this a conversation.x',
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
