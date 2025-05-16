'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { Button, OverlayArrow, Tooltip, TooltipTrigger } from 'common/react-aria-components';

type Props = {
  emoji: string;
};

export const EmojiButton: React.FC<Props> = (props) => {
  return (
    <TooltipTrigger delay={300} closeDelay={200}>
      <Button
        type="button"
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
      </Button>
      <Tooltip className="rounded-md bg-blue-500 p-1 px-2 text-xs text-gray-100 shadow-sm">
        <OverlayArrow className="fill-blue-500">
          <svg width={8} height={8} viewBox="0 0 8 8">
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
        Click to copy
      </Tooltip>
    </TooltipTrigger>
  );
};
