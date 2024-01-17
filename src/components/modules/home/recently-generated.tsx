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
  console.log(result);

  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recently Generated</h2>
      <ul className="flex flex-col">
        {result.map((emoji) => (
          <li
            key={emoji.id}
            className="flex items-center justify-between rounded-md p-4 text-gray-900 dark:text-gray-100"
          >
            <p className="mt-2">{emoji.word}</p>
            <ul className="flex items-center justify-center gap-4">
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
