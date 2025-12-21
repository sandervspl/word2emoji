'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { unemojify } from 'node-emoji';

import { CopyableButton } from 'common/copyable-button';

type Props = {
  emojis: string[];
};

export const EmojiResults: React.FC<Props> = (props) => {
  const { pending } = ReactDOM.useFormStatus();

  if (props.emojis.length === 0 && !pending) {
    return null;
  }

  if (pending) {
    return (
      <div className="mx-auto mt-8 flex w-full max-w-(--breakpoint-md) flex-col items-center gap-6">
        <div className="grid w-full grid-cols-2 gap-8 md:grid-cols-4">
          {[0, 0, 0, 0].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Finding emojis...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 grid w-full max-w-(--breakpoint-md) grid-cols-2 gap-8 md:grid-cols-4">
      {props.emojis.map((emoji, i) => (
        <CopyableButton
          key={i}
          copyText={emoji}
          className="flex flex-col items-center rounded-md p-4 text-gray-900 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          <div className="text-3xl">{emoji}</div>
          <p className="mt-2 text-sm">{unemojify(emoji)}</p>
        </CopyableButton>
      ))}
    </div>
  );
};
