import * as React from 'react';

import { CopyableButton } from 'common/copyable-button';

type Props = {
  words: string[];
  pending: boolean;
};

export const WordResults: React.FC<Props> = ({ words, pending }) => {
  if (words.length === 0 && !pending) {
    return null;
  }

  if (pending) {
    return (
      <div className="mx-auto mt-8 flex w-full max-w-(--breakpoint-md) flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
          {[16, 20, 24, 18, 22, 20].map((width, i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
              style={{ width: `${width * 4}px` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Finding words...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 flex w-full max-w-(--breakpoint-md) flex-wrap justify-center gap-3">
      {words.map((word, i) => (
        <CopyableButton
          key={i}
          copyText={word}
          successMessage={`"${word}" copied to clipboard!`}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
        >
          {word}
        </CopyableButton>
      ))}
    </div>
  );
};
