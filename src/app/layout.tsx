import 'styles/globals.css';

import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Script from 'next/script';
import { Toaster } from 'sonner';

import { GithubIcon } from 'common/github';
import { SizeIndicator } from 'common/size-indicator';

type Props = i.NextLayoutProps;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Word2Emoji',
  metadataBase: new URL('https://word2emoji.com'),
};

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <html lang="en" className="h-full bg-white antialiased dark:bg-gray-900">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>😃</text></svg>"
        />
        <Script data-domain="word2emoji.com" src="https://plausible.sandervspl.dev/js/script.js" />
      </head>
      <body className={`h-full min-h-full bg-white dark:bg-gray-900 ${inter.className}`}>
        {children}
        {process.env.NODE_ENV !== 'production' && <SizeIndicator />}
        <div className="fixed bottom-2 right-2 items-center justify-end p-2">
          <Link
            href="https://github.com/sandervspl/word2emoji"
            target="_blank"
            className="block size-6"
          >
            <GithubIcon className="dark:fill-white" />
          </Link>
        </div>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
