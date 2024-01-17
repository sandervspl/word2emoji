import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const emojis = sqliteTable(
  'emojis',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    word: text('word').notNull(),
    emoji: text('emoji').notNull(),
    created_at: text('created_at').notNull(),
  },
  (table) => ({
    word_unq: unique('word_unq').on(table.word),
    word_idx: index('word_idx').on(table.word),
  }),
);
