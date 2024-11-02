'use client';

import * as React from 'react';
import { XCircleIcon } from 'lucide-react';

import { EmojiResults } from './emoji-results';
import { PromptInput } from './prompt-input';

export type FormState = string[] | { error: string } | undefined;

type Props = {
  action: (prevState: FormState, formdata: FormData) => Promise<FormState>;
};

export const PromptForm = (props: Props) => {
  const [response, formAction] = React.useActionState(props.action, []);

  return (
    <form className="mt-8 flex w-full flex-col justify-center" action={formAction}>
      <PromptInput />

      {response && 'error' in response && (
        <div className="mx-auto mt-2 flex items-center gap-2 text-sm text-red-500">
          <XCircleIcon size={14} />
          {response.error}
        </div>
      )}
      {Array.isArray(response) && <EmojiResults emojis={response || []} />}
    </form>
  );
};
