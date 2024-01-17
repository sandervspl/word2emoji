import * as i from 'types';
import * as React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Clock1Icon, FlagIcon, Heading4Icon, Music3Icon, User2Icon } from 'lucide-react';

import { Input } from 'common/input';

type Props = i.NextPageProps;

export const metadata: Metadata = {
  title: 'Home',
};

const Page: React.FC<Props> = async () => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <FlagIcon className="h-8 w-8 text-gray-900 dark:text-gray-100" />
        </Link>
      </header>
      <main className="flex flex-grow flex-col items-center justify-center p-4 text-center md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Emoji Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Turn your words into emojis in a snap!
        </p>
        <div className="mt-8 w-full max-w-md">
          <Input className="w-full" placeholder="Enter a word" />
        </div>
        <div className="mt-8 grid w-full max-w-4xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
            <Clock1Icon className="h-12 w-12" />
            <p className="mt-2">Emoji 1</p>
          </div>
          <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
            <User2Icon className="h-12 w-12" />
            <p className="mt-2">Emoji 2</p>
          </div>
          <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
            <Music3Icon className="h-12 w-12" />
            <p className="mt-2">Emoji 3</p>
          </div>
          <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
            <Heading4Icon className="h-12 w-12" />
            <p className="mt-2">Emoji 4</p>
          </div>
        </div>
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recently Generated
          </h2>
          <div className="mt-4 grid gap-4">
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <Clock1Icon className="h-6 w-6" />
              <p className="ml-4">Emoji 1</p>
            </div>
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <User2Icon className="h-6 w-6" />
              <p className="ml-4">Emoji 2</p>
            </div>
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <Music3Icon className="h-6 w-6" />
              <p className="ml-4">Emoji 3</p>
            </div>
            <div className="flex items-center text-gray-900 dark:text-gray-100">
              <Heading4Icon className="h-6 w-6" />
              <p className="ml-4">Emoji 4</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="flex h-16 items-center justify-center bg-gray-100 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 Emoji Generator</p>
      </footer>
    </div>
  );
};

export default Page;
