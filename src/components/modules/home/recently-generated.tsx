import { unstable_cache } from 'next/cache';
import { desc } from 'drizzle-orm';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

import { EmojiButton } from './emoji-button';

type Props = {};

const getRecentEmojis = unstable_cache(
  async () => {
    const result = await db.query.emojis.findMany({
      columns: { id: true, emoji: true, word: true },
      orderBy: desc(emojis.created_at),
      limit: 10,
    });

    return result;
  },
  ['recent-emojis'],
  {
    tags: ['recent-emojis'],
    revalidate: process.env.NODE_ENV === 'production' ? 300 : 1, // 5 minutes
  },
);

export const RecentlyGenerated = async (props: Props) => {
  const result = await getRecentEmojis();

  return (
    <div className="mt-8 w-full max-w-screen-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recently Generated</h2>
      <ul className="grid w-full grid-cols-2 gap-x-20 gap-y-4">
        {result.map((emoji) => (
          <li
            key={emoji.id}
            className="flex flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
          >
            <p className="font-medium capitalize dark:text-gray-400">{emoji.word}</p>
            <ul className="flex items-center justify-center gap-2">
              {emoji.emoji.split(',').map((e) => (
                <li key={e} className="text-3xl">
                  <EmojiButton emoji={e} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
