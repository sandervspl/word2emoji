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
      <div className="mt-8 grid w-full gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[0, 0, 0, 0].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center rounded-md border p-4 text-gray-900 dark:text-gray-100"
          >
            <div className="text-3xl">...</div>
            <p className="mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-8">
      {props.emojis.map((emoji, i) => (
        <button
          key={i}
          className="flex flex-col items-center rounded-md border p-4 text-gray-900 dark:text-gray-100"
          onClick={() => {
            navigator.clipboard.writeText(emoji);
          }}
        >
          <div className="text-3xl">{emoji}</div>
          <p className="mt-2">{unemojify(emoji)}</p>
        </button>
      ))}
    </div>
  );
};