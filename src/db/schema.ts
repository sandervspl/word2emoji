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

// Table for emoji-to-words reverse lookup cache
export const emojiWords = sqliteTable(
  'emoji_words',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    emoji: text('emoji').notNull(),
    words: text('words').notNull(), // JSON array of word suggestions
    created_at: text('created_at').notNull(),
  },
  (table) => ({
    emoji_unq: unique('emoji_unq').on(table.emoji),
    emoji_idx: index('emoji_idx').on(table.emoji),
  }),
);
