import * as React from 'react';
import { toast } from 'sonner';

import { Button, OverlayArrow, Tooltip, TooltipTrigger } from 'common/react-aria-components';

type Props = {
  copyText: string;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
} & React.ComponentProps<typeof Button>;

export const CopyableButton: React.FC<Props> = ({
  copyText,
  children,
  className,
  successMessage = 'Copied to clipboard!',
  ...buttonProps
}) => {
  return (
    <TooltipTrigger delay={300} closeDelay={200}>
      <Button
        {...buttonProps}
        type="button"
        className={className}
        onClick={() => {
          toast.promise(navigator.clipboard.writeText(copyText), {
            success: successMessage,
            error: 'Failed to copy to clipboard',
            loading: 'Copying to clipboard...',
          });
        }}
      >
        {children}
      </Button>
      <Tooltip className="rounded-md bg-blue-500 p-1 px-2 text-xs text-gray-100 shadow-xs transition-all duration-150 data-[entering]:transform-(--origin) data-[entering]:opacity-0 data-[exiting]:transform-(--origin) data-[exiting]:opacity-0 data-[placement=top]:mb-2 data-[placement=top]:[--origin:translateY(4px)]">
        <OverlayArrow className="fill-blue-500">
          <svg
            width={8}
            height={8}
            viewBox="0 0 8 8"
            className="block fill-(--highlight-background)"
          >
            <path d="M0 0 L4 4 L8 0" />
          </svg>
        </OverlayArrow>
        Click to copy
      </Tooltip>
    </TooltipTrigger>
  );
};
