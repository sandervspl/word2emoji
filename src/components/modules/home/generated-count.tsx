'use cache';

import { cacheLife } from 'next/cache';
import { count } from 'drizzle-orm';

import { db } from 'src/db';
import { emojis } from 'src/db/schema';

export const GeneratedCount = async () => {
  cacheLife('hours');

  const [amountGenerated] =
    process.env.NODE_ENV !== 'production'
      ? [{ count: 100 }]
      : await db.select({ count: count() }).from(emojis);

  return (
    <p className="text-sm text-gray-500 dark:text-gray-200">
      🤖 {Intl.NumberFormat().format((amountGenerated?.count ?? 0) * 4)} emojis generated
    </p>
  );
};
