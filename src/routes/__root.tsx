import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { Toaster } from 'sonner';

import appCss from 'styles/globals.css?url';
import { GithubIcon } from 'common/github';
import { SizeIndicator } from 'common/size-indicator';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Word2Emoji' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-white antialiased dark:bg-gray-900">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>😃</text></svg>"
        />
        <script
          async
          data-domain="word2emoji.com"
          src="https://plausible.sandervspl.dev/js/script.js"
        />
        <HeadContent />
      </head>
      <body className="h-full min-h-full bg-white dark:bg-gray-900">
        {children}
        {process.env.NODE_ENV !== 'production' && <SizeIndicator />}
        <div className="fixed right-2 bottom-2 items-center justify-end p-2">
          <a
            href="https://github.com/sandervspl/word2emoji"
            target="_blank"
            rel="noreferrer"
            className="block size-6"
          >
            <GithubIcon className="dark:fill-white" />
          </a>
        </div>
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
