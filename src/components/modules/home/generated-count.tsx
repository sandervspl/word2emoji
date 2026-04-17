import type { Mode } from 'src/utils/constants';

type Props = {
  mode: Mode;
  total: number;
};

export const GeneratedCount = ({ mode, total }: Props) => {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-200">
      🤖 {Intl.NumberFormat().format(total)}{' '}
      {mode === 'emoji-to-word' ? 'words generated' : 'emojis generated'}
    </p>
  );
};
