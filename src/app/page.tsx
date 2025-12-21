import * as React from 'react';
import { Metadata } from 'next';

import { GeneratedCountFallback, GeneratedCountServer } from 'modules/home/generated-count.server';
import { HomeContent } from 'modules/home/home-content';
import {
  RecentlyGeneratedFallback,
  RecentlyGeneratedServer,
} from 'modules/home/recently-generated.server';

export const metadata: Metadata = {
  title: 'Word 2 Emoji',
  description: 'Turn your words into emojis in a snap!',
};

type PageProps = {
  searchParams: Promise<{ mode?: string }>;
};

const Page = async ({ searchParams }: PageProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <main className="flex grow flex-col items-center p-4 text-center md:p-16">
        <HomeContent />

        <div className="mt-4 mb-8">
          <React.Suspense fallback={<GeneratedCountFallback />}>
            <GeneratedCountServer searchParams={searchParams} />
          </React.Suspense>
        </div>

        <div className="mt-8 w-full max-w-(--breakpoint-md) space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ✨ Recently Generated
          </h2>
          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-20">
            <React.Suspense fallback={<RecentlyGeneratedFallback />}>
              <RecentlyGeneratedServer searchParams={searchParams} />
            </React.Suspense>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Page;
