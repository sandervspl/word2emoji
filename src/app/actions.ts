'use server';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

export async function sendToOpenAI(prompt: string) {
  const response = await fetch(
    `https://api.prompt-nest.com/prompt/jd76k1t83vq0gvdbqqtw1wpeq973dda5`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PROMPT_NEST_API_KEY}`,
      },
      body: JSON.stringify({
        variables: {
          prompt,
        },
      }),
    },
  );

  if (!response.ok) {
    console.error('error prompt-nest', response.status, response.statusText);
    return;
  }

  const data = await response.text();

  return data;
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
