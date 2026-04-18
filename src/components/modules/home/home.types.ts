import type { Mode } from 'src/utils/constants';

export type FormState = string[] | { error: string } | undefined;
export type ReverseFormState = string[] | { error: string } | undefined;

export type WordToEmojiRecentItem = {
  id: number;
  word: string;
  emojis: string[];
};

export type EmojiToWordRecentItem = {
  id: number;
  emoji: string;
  words: string[];
};

export type HomePageData =
  | {
      mode: Extract<Mode, 'word-to-emoji'>;
      generatedCount: number;
      recentlyGenerated: WordToEmojiRecentItem[];
    }
  | {
      mode: Extract<Mode, 'emoji-to-word'>;
      generatedCount: number;
      recentlyGenerated: EmojiToWordRecentItem[];
    };
