export const modes = ['word-to-emoji', 'emoji-to-word'] as const;
export type Mode = (typeof modes)[number];

export const DEFAULT_MODE: Mode = 'word-to-emoji';
