'use client';

import * as React from 'react';

import { CopyableButton } from 'common/copyable-button';

type Props = {
  emoji: string;
};

export const EmojiButton: React.FC<Props> = (props) => {
  return (
    <CopyableButton
      copyText={props.emoji}
      className="aspect-square rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {props.emoji}
    </CopyableButton>
  );
};
