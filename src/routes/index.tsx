import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';

import { parseModeFromParam } from 'src/utils/parse';
import { GeneratedCount } from 'modules/home/generated-count';
import { HomeContent } from 'modules/home/home-content';
import { getHomePageData } from 'modules/home/home.functions';
import { RecentlyGenerated } from 'modules/home/recently-generated';

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: parseModeFromParam(search.mode as string | string[] | undefined),
  }),
  loaderDeps: ({ search }) => ({
    mode: search.mode,
  }),
  loader: ({ deps }) =>
    getHomePageData({
      data: { mode: deps.mode },
    }),
  staleTime: 5 * 60 * 1000,
  head: () => ({
    meta: [
      { title: 'Word 2 Emoji' },
      { name: 'description', content: 'Turn your words into emojis in a snap!' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const data = Route.useLoaderData();
  const navigate = Route.useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <main className="flex grow flex-col items-center p-4 text-center md:p-16">
        <HomeContent
          mode={data.mode}
          onModeChange={(mode) =>
            navigate({
              search: (prev) => ({
                ...prev,
                mode,
              }),
            })
          }
        />

        <div className="mt-4 mb-8">
          <GeneratedCount mode={data.mode} total={data.generatedCount} />
        </div>

        <div className="mt-8 w-full max-w-(--breakpoint-md) space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ✨ Recently Generated
          </h2>
          <RecentlyGenerated mode={data.mode} recentlyGenerated={data.recentlyGenerated} />
        </div>
      </main>
    </div>
  );
}
