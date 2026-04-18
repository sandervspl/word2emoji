import * as React from 'react';
import { useServerFn } from '@tanstack/react-start';
import { XCircleIcon } from 'lucide-react';

import { EmojiResults } from './emoji-results';
import type { FormState } from './home.types';
import { PromptInput } from './prompt-input';

type Props = {
  action: (opts: { data: FormData }) => Promise<FormState>;
};

export const PromptForm = (props: Props) => {
  const submitPrompt = useServerFn(props.action);
  const [response, setResponse] = React.useState<FormState>([]);
  const [pending, startTransition] = React.useTransition();

  return (
    <form
      className="mt-8 flex w-full flex-col justify-center"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setResponse(
            await submitPrompt({
              data: formData,
            }),
          );
        });
      }}
    >
      <PromptInput pending={pending} />

      {response && 'error' in response && (
        <div className="mx-auto mt-2 flex items-center gap-2 text-sm text-red-500">
          <XCircleIcon size={14} />
          {response.error}
        </div>
      )}
      {Array.isArray(response) && <EmojiResults emojis={response || []} pending={pending} />}
    </form>
  );
};
