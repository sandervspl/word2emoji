'use client';

import * as React from 'react';

type Props = {
  pending: boolean;
};

export const EmojiInput = ({ pending }: Props) => {
  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-sm) overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-700 dark:bg-gray-800">
      <input
        className="flex-1 bg-transparent px-4 py-2 text-lg outline-hidden placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
        placeholder="Enter emoji(s) 😊👨‍💻🌅"
        name="emoji"
        autoFocus
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Lookup
      </button>
    </div>
  );
};
