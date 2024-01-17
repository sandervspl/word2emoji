'use client';

import * as React from 'react';

type Props = {
  emoji: string;
};

export const EmojiButton: React.FC<Props> = (props) => {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(props.emoji);
      }}
    >
      {props.emoji}
    </button>
  );
};
