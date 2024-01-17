'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { XCircleIcon } from 'lucide-react';

import { Input } from 'common/input';

import { EmojiResults } from './emoji-results';

export type FormState = string[] | { error: string } | undefined;

type Props = {
  action: (prevState: FormState, formdata: FormData) => Promise<FormState>;
};

export const PromptForm = (props: Props) => {
  const [response, formAction] = ReactDOM.useFormState(props.action, []);

  return (
    <form className="mt-8 flex w-full flex-col justify-center" action={formAction}>
      <Input
        className="mx-auto w-full max-w-screen-sm [&>input]:py-2 [&>input]:text-lg"
        placeholder="Enter a word"
        name="prompt"
        autoFocus
        min={1}
        max={20}
      />

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
