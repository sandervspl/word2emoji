import { EmojiButton } from './emoji-button';
import type { HomePageData } from './home.types';

type Props = Pick<HomePageData, 'mode' | 'recentlyGenerated'>;

export const RecentlyGenerated = ({ mode, recentlyGenerated }: Props) => {
  return (
    <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-20">
      {mode === 'word-to-emoji'
        ? recentlyGenerated.map((item) => (
            <li
              key={item.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              <p className="font-medium capitalize dark:text-gray-400">{item.word}</p>
              <ul className="flex flex-wrap items-center justify-center gap-2">
                {item.emojis.map((value) => (
                  <li key={value} className="text-3xl">
                    <EmojiButton emoji={value} />
                  </li>
                ))}
              </ul>
            </li>
          ))
        : recentlyGenerated.map((item) => (
            <li
              key={item.id}
              className="flex flex-col items-center justify-between space-y-2 rounded-md bg-gray-100 p-4 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            >
              <p className="text-3xl">{item.emoji}</p>
              <ul className="flex flex-wrap items-center justify-center gap-1">
                {item.words.slice(0, 3).map((word) => (
                  <li
                    key={word}
                    className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium capitalize dark:bg-gray-700 dark:text-gray-300"
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </li>
          ))}
    </ul>
  );
};
