'use client';

import * as React from 'react';
import { toast } from 'sonner';

type Props = {
  emoji: string;
};

export const EmojiButton: React.FC<Props> = (props) => {
  return (
    <button
      className="aspect-square rounded-md p-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
      onClick={() => {
        toast.promise(navigator.clipboard.writeText(props.emoji), {
          success: 'Copied to clipboard!',
          error: 'Failed to copy to clipboard',
          loading: 'Copying to clipboard...',
        });
      }}
    >
      {props.emoji}
    </button>
  );
};
