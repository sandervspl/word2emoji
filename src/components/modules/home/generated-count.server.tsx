import * as React from 'react';

import { parseModeFromParam } from 'src/utils/parse';

import { GeneratedCount } from './generated-count';

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export const GeneratedCountServer = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const mode = parseModeFromParam(params.mode);

  return <GeneratedCount mode={mode} />;
};

export const GeneratedCountFallback = () => {
  return <div className="h-5 w-[155px] animate-pulse bg-gray-300" />;
};
