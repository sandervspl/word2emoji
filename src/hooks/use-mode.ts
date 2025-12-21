'use client';

import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { DEFAULT_MODE, modes } from 'src/utils/constants';

/**
 * Custom hook for managing mode state via URL query parameters.
 * Uses nuqs for URL state management with shallow routing.
 *
 * @returns [mode, setMode] - Current mode and setter function
 *
 * @example
 * const [mode, setMode] = useMode();
 * // URL: ?mode=word-to-emoji or ?mode=emoji-to-word
 */
export function useMode() {
  return useQueryState(
    'mode',
    parseAsStringLiteral(modes).withDefault(DEFAULT_MODE).withOptions({
      shallow: false, // Trigger server-side re-render for RecentlyGenerated
      history: 'push', // Enable back/forward navigation
    }),
  );
}
