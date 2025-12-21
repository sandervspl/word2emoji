import { Mode } from 'src/utils/constants';

type Props = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export const ModeToggle = ({ mode, onModeChange }: Props) => {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => onModeChange('word-to-emoji')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
          mode === 'word-to-emoji'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        aria-pressed={mode === 'word-to-emoji'}
      >
        Word ➡️ Emoji
      </button>
      <button
        type="button"
        onClick={() => onModeChange('emoji-to-word')}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
          mode === 'emoji-to-word'
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`}
        aria-pressed={mode === 'emoji-to-word'}
      >
        Emoji ➡️ Word
      </button>
    </div>
  );
};
