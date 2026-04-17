'use client';

import * as React from 'react';
import { useServerFn } from '@tanstack/react-start';
import { XCircleIcon } from 'lucide-react';

import { EmojiInput } from './emoji-input';
import { WordResults } from './word-results';
import type { ReverseFormState } from './home.types';

type Props = {
  action: (opts: { data: FormData }) => Promise<ReverseFormState>;
};

export const ReverseLookupForm = (props: Props) => {
  const submitLookup = useServerFn(props.action);
  const [randomId, setRandomId] = React.useState('');
  const [response, setResponse] = React.useState<ReverseFormState>(undefined);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setRandomId(crypto.randomUUID());
  }, []);

  return (
    <form
      className="mt-8 flex w-full flex-col justify-center"
      onSubmit={(event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          setResponse(
            await submitLookup({
              data: formData,
            }),
          );
        });
      }}
    >
      <EmojiInput pending={pending} />
      <input type="hidden" name="randomId" value={randomId} />

      {response && 'error' in response && (
        <div className="mx-auto mt-2 flex items-center gap-2 text-sm text-red-500">
          <XCircleIcon size={14} />
          {response.error}
        </div>
      )}
      {Array.isArray(response) && <WordResults words={response} pending={pending} />}
    </form>
  );
};
