'use client';

import * as React from 'react';
import { XCircleIcon } from 'lucide-react';

import { EmojiInput } from './emoji-input';
import { WordResults } from './word-results';

export type ReverseFormState = string[] | { error: string } | undefined;

type Props = {
  action: (prevState: ReverseFormState, formdata: FormData) => Promise<ReverseFormState>;
};

export const ReverseLookupForm = (props: Props) => {
  const [randomId, setRandomId] = React.useState('');
  const [response, formAction] = React.useActionState(props.action, undefined);

  React.useEffect(() => {
    setRandomId(crypto.randomUUID());
  }, []);

  return (
    <form className="mt-8 flex w-full flex-col justify-center" action={formAction}>
      <EmojiInput />
      <input type="hidden" name="randomId" value={randomId} />

      {response && 'error' in response && (
        <div className="mx-auto mt-2 flex items-center gap-2 text-sm text-red-500">
          <XCircleIcon size={14} />
          {response.error}
        </div>
      )}
      {Array.isArray(response) && <WordResults words={response} />}
    </form>
  );
};
