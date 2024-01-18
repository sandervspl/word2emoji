import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import { internal_runWithWaitUntil as waitUntil } from 'next/dist/server/web/internal-edge-wait-until';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { eq } from 'drizzle-orm';
import * as emoji from 'node-emoji';
import pRetry from 'p-retry';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';
import { validatePrompt } from 'src/utils/validation';
import { FormState, PromptForm } from 'modules/home/prompt-form';
import { RecentlyGenerated } from 'modules/home/recently-generated';

import { savePrompt, sendToOpenAI } from './actions';

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

  async function getEmojis(prevState: FormState, formdata: FormData) {
    'use server';

    // Prevent spamming
    const { success } = await ratelimit.limit(String(randomId));
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
    waitUntil(() => savePrompt(prompt, emojisResult));

    return emojisResult;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <main className="flex flex-grow flex-col items-center p-4 text-center md:p-16">
        <h1 className="mt-20 text-5xl font-bold text-gray-900 dark:text-gray-100">Word ➡️ Emoji</h1>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
          Turn your words into emojis in a snap!
        </p>

        <PromptForm action={getEmojis} />

        <div className="my-8" />

        <RecentlyGenerated />
      </main>
    </div>
  );
};

export default Page;
