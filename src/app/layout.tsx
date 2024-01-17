import 'styles/globals.css';

import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

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
      </head>
      <body className={`h-full min-h-full bg-white dark:bg-gray-900 ${inter.className}`}>
        {children}
        <Toaster />
        {process.env.NODE_ENV !== 'production' && <SizeIndicator />}
      </body>
    </html>
  );
};

export default RootLayout;
