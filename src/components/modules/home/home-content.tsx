'use client';

import { useMode } from 'src/hooks/use-mode';

import { ModeToggle } from './mode-toggle';
import { FormState, PromptForm } from './prompt-form';
import { ReverseFormState, ReverseLookupForm } from './reverse-lookup-form';

type Props = {
  getEmojis: (prevState: FormState, formdata: FormData) => Promise<FormState>;
  getWords: (prevState: ReverseFormState, formdata: FormData) => Promise<ReverseFormState>;
};

export const HomeContent = ({ getEmojis, getWords }: Props) => {
  const [mode, setMode] = useMode();

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
        <ModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {mode === 'word-to-emoji' ? (
        <PromptForm action={getEmojis} />
      ) : (
        <ReverseLookupForm action={getWords} />
      )}
    </>
  );
};
