'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Input } from 'common/input';

import { EmojiResults } from './emoji-results';

type Props = {
  action: (prevState: string[] | undefined, formdata: FormData) => Promise<string[] | undefined>;
};

export const PromptForm = (props: Props) => {
  const [emojis, formAction] = ReactDOM.useFormState(props.action, []);

  return (
    <form className="mt-8 w-full" action={formAction}>
      <Input
        className="mx-auto w-full max-w-screen-sm [&>input]:py-2 [&>input]:text-lg"
        placeholder="Enter a word"
        name="prompt"
        autoFocus
      />

      <EmojiResults emojis={emojis || []} />
    </form>
  );
};
