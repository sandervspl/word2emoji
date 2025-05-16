'use cache';

import { unstable_cacheLife as cacheLife } from 'next/cache';
import { desc } from 'drizzle-orm';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

import { EmojiButton } from './emoji-button';

export const RecentlyGenerated = async () => {
  cacheLife('minutes');

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
};
