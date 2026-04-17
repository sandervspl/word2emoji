'use client';

import type { Mode } from 'src/utils/constants';

import { getEmojis, getWords } from './home.functions';
import { ModeToggle } from './mode-toggle';
import { PromptForm } from './prompt-form';
import { ReverseLookupForm } from './reverse-lookup-form';

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export const HomeContent = ({ mode, onModeChange }: Props) => {
  return (
    <>
      <h1 className="mt-20 text-5xl font-bold text-gray-900 dark:text-gray-100">
        {mode === 'word-to-emoji' ? 'Word' : 'Emoji'} ➡️{' '}
        {mode === 'word-to-emoji' ? 'Emoji' : 'Word'}
      </h1>
      <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
        {mode === 'word-to-emoji'
          ? 'Turn your words into emojis in a snap!'
          : 'Discover words that match your emojis!'}
      </p>

      <div className="mt-6">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>

      {mode === 'word-to-emoji' ? (
        <PromptForm action={getEmojis} />
      ) : (
        <ReverseLookupForm action={getWords} />
      )}
    </>
  );
};
