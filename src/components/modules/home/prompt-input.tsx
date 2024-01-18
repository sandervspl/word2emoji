'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Input } from 'common/input';

type Props = {};

export const PromptInput: React.FC<Props> = (props) => {
  const { pending } = ReactDOM.useFormStatus();

  return (
    <Input
      className="mx-auto w-full max-w-screen-sm [&>input]:py-2 [&>input]:text-lg"
      placeholder="Enter a word"
      name="prompt"
      autoFocus
      min={1}
      max={20}
      disabled={pending}
    />
  );
};
