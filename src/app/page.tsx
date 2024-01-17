import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import { internal_runWithWaitUntil as waitUntil } from 'next/dist/server/web/internal-edge-wait-until';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { FlagIcon } from 'lucide-react';
import OpenAI from 'openai';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';
import { Input } from 'common/input';
import { PromptForm } from 'modules/home/prompt-form';

type Props = i.NextPageProps;

export const metadata: Metadata = {
  title: 'Home',
};

const Page: React.FC<Props> = async () => {
  async function getEmojis(prevState: string[] | undefined, formdata: FormData) {
    'use server';

    const prompt = formdata.get('prompt') as string;
    const cached = await db.query.emojis.findFirst({
      columns: { emoji: true },
      where: eq(emojis.word, prompt),
    });

    if (cached) {
      return cached.emoji.split(',').map((e) => e.trim());
    }

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

    const result = response.choices[0]?.message.content;

    waitUntil(async () => {
      if (!prompt || !result) {
        throw new Error('Invalid prompt');
      }

      await db
        .insert(emojis)
        .values({ word: prompt, emoji: result })
        .onConflictDoNothing()
        .execute();
    });

    return result?.split(',').map((e) => e.trim());
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <main className="flex flex-grow flex-col items-center justify-center p-4 text-center md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Emoji Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Turn your words into emojis in a snap!
        </p>

        <PromptForm action={getEmojis} />

        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recently Generated
          </h2>
        </div>
      </main>
    </div>
  );
};

export default Page;
