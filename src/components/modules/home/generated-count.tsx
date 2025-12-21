'use cache';

import { cacheLife } from 'next/cache';
import { count } from 'drizzle-orm';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';
import { Mode } from 'src/utils/constants';

type Props = {
  mode: Mode;
};

export const GeneratedCount = async ({ mode }: Props) => {
  cacheLife('hours');

  const isProduction = process.env.NODE_ENV === 'production';

  if (mode === 'emoji-to-word') {
    const allEmojiWords = !isProduction
      ? []
      : await db.query.emojiWords.findMany({
          columns: { words: true },
        });

    const totalWords = !isProduction
      ? 400
      : allEmojiWords.reduce((sum, item) => {
          try {
            const words = JSON.parse(item.words) as string[];
            return sum + words.length;
          } catch {
            return sum;
          }
        }, 0);

    return (
      <p className="text-sm text-gray-500 dark:text-gray-200">
        🤖 {Intl.NumberFormat().format(totalWords)} words generated
      </p>
    );
  }

  const [amountGenerated] = !isProduction
    ? [{ count: 100 }]
    : await db.select({ count: count() }).from(emojis);

  return (
    <p className="text-sm text-gray-500 dark:text-gray-200">
      🤖 {Intl.NumberFormat().format((amountGenerated?.count ?? 0) * 4)} emojis generated
    </p>
  );
};
