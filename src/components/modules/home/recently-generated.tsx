'use cache';

import { cacheLife } from 'next/cache';
import { desc } from 'drizzle-orm';

import { db } from 'src/db';
import { emojis, emojiWords } from 'src/db/schema';
import { Mode } from 'src/utils/constants';

import { EmojiButton } from './emoji-button';

type Props = {
  mode: Mode;
};

export const RecentlyGenerated = async ({ mode }: Props) => {
  cacheLife('minutes');

  if (mode === 'word-to-emoji') {
    const result = await db.query.emojis.findMany({
      columns: { id: true, emoji: true, word: true },
      orderBy: desc(emojis.created_at),
      limit: 10,
    });

    return result.map((emoji) => (
      <li
        key={emoji.id}
        className="flex flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
        <p className="font-medium capitalize dark:text-gray-400">{emoji.word}</p>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {emoji.emoji.split(',').map((e) => (
            <li key={e} className="text-3xl">
              <EmojiButton emoji={e} />
            </li>
          ))}
        </ul>
      </li>
    ));
  }

  // emoji-to-word mode
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

    return (
      <li
        key={item.id}
        className="flex flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
        <p className="text-3xl">{item.emoji}</p>
        <ul className="flex flex-wrap items-center justify-center gap-1">
          {words.slice(0, 3).map((word) => (
            <li
              key={word}
              className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium capitalize dark:bg-gray-700 dark:text-gray-300"
            >
              {word}
            </li>
          ))}
        </ul>
      </li>
    );
  });
};
