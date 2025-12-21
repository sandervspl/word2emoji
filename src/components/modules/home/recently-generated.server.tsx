'use cache';

import * as React from 'react';
import { cacheLife } from 'next/cache';

import { parseModeFromParam } from 'src/utils/parse';

import { RecentlyGenerated } from './recently-generated';

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export const RecentlyGeneratedServer = async ({ searchParams }: Props) => {
  cacheLife('seconds');
  const params = await searchParams;
  const mode = parseModeFromParam(params.mode);

  return (
    <React.Suspense key={mode} fallback={<RecentlyGeneratedFallback />}>
      <RecentlyGenerated mode={mode} />
    </React.Suspense>
  );
};

const RecentlyGeneratedFallback = () => {
  return Array.from({ length: 4 }).map((_, i) => (
    <li
      key={i}
      className="flex h-[116px] w-full animate-pulse flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
    />
  ));
};
