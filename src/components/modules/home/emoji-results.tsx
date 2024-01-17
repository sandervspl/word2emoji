'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { unemojify } from 'node-emoji';

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
      <div className="mx-auto mt-8 grid w-full max-w-screen-md gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[0, 0, 0, 0].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-md p-4 text-gray-900 transition-colors dark:text-gray-100"
          >
            <div className="text-3xl">...</div>
            <p className="mt-2 text-sm">...</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 grid w-full max-w-screen-md gap-8 md:grid-cols-2 lg:grid-cols-4">
      {props.emojis.map((emoji, i) => (
        <button
          key={i}
          className="flex flex-col items-center rounded-md p-4 text-gray-900 transition-colors hover:bg-gray-800 dark:text-gray-100"
          onClick={() => {
            navigator.clipboard.writeText(emoji);
          }}
        >
          <div className="text-3xl">{emoji}</div>
          <p className="mt-2 text-sm">{unemojify(emoji)}</p>
        </button>
      ))}
    </div>
  );
};
