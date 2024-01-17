import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import { internal_runWithWaitUntil as waitUntil } from 'next/dist/server/web/internal-edge-wait-until';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import wordsCount from 'words-count';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';
import { FormState, PromptForm } from 'modules/home/prompt-form';
import { RecentlyGenerated } from 'modules/home/recently-generated';

type Props = i.NextPageProps;

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Word 2 Emoji',
  description: 'Turn your words into emojis in a snap!',
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  prefix: 'word2emoji',
});

const Page: React.FC<Props> = async () => {
  const randomId = Math.floor(Math.random() * 1000000);

  async function sendToOpenAI(prompt: string) {
    'use server';

    const openai = new OpenAI();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Reply with 4 emojis that are relevant to the prompt. Separate them with commas.',
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

  async function getEmojis(prevState: FormState, formdata: FormData) {
    'use server';

    const { success } = await ratelimit.limit(String(randomId));
    if (!success) {
      return {
        error: 'Please wait a few seconds before trying again',
      };
    }

    const prompt = formdata.get('prompt') as string;

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

    const cached = await db.query.emojis.findFirst({
      columns: { emoji: true },
      where: eq(emojis.word, prompt),
    });

    if (cached) {
      return cached.emoji.split(',').map((e) => e.trim());
    }

    let emojisResult: undefined | string[] = undefined;

    for await (const i of [0, 1, 2]) {
      const result = await sendToOpenAI(prompt);
      emojisResult = result?.split(',').map((e) => e.trim());

      if (emojisResult && emojisResult.length > 1) {
        break;
      }
    }

    waitUntil(async () => {
      if (!prompt || !emojisResult) {
        throw new Error('Invalid prompt');
      }

      await db
        .insert(emojis)
        .values({
          word: prompt,
          emoji: emojisResult.join(','),
          created_at: new Date().toISOString(),
        })
        .onConflictDoNothing()
        .execute();
    });

    return emojisResult;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <main className="flex flex-grow flex-col items-center p-4 text-center md:p-16">
        <h1 className="mt-20 text-5xl font-bold text-gray-900 dark:text-gray-100">Word 2 Emoji</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
          Turn your words into emojis in a snap!
        </p>

        <div className="my-10" />

        <PromptForm action={getEmojis} />

        <div className="my-8" />

        <RecentlyGenerated />
      </main>
    </div>
  );
};

export default Page;
