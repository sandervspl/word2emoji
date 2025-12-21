'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { toast } from 'sonner';

type Props = {
  words: string[];
};

export const WordResults: React.FC<Props> = (props) => {
  const { pending } = ReactDOM.useFormStatus();

  if (props.words.length === 0 && !pending) {
    return null;
  }

  if (pending) {
    return (
      <div className="mx-auto mt-8 flex w-full max-w-(--breakpoint-md) flex-wrap justify-center gap-3">
        {[0, 0, 0, 0, 0, 0].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 flex w-full max-w-(--breakpoint-md) flex-wrap justify-center gap-3">
      {props.words.map((word, i) => (
        <button
          key={i}
          type="button"
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
          onClick={() => {
            toast.promise(navigator.clipboard.writeText(word), {
              success: `"${word}" copied to clipboard!`,
              error: 'Failed to copy to clipboard',
              loading: 'Copying to clipboard...',
            });
          }}
        >
          {word}
        </button>
      ))}
    </div>
  );
};
