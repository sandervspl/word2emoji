'use client';

import * as React from 'react';

type Props = {
  emoji: string;
};

export const EmojiButton: React.FC<Props> = (props) => {
  return (
    <button
      className="aspect-square rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => {
        navigator.clipboard.writeText(props.emoji);
      }}
    >
      {props.emoji}
    </button>
  );
};
