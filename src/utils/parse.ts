import { DEFAULT_MODE, Mode } from './constants';
import { isValidMode } from './validation';

/**
 * Parses a mode value from URL parameters with fallback.
 * Handles invalid or missing mode values gracefully.
 */
export function parseModeFromParam(param: string | string[] | undefined): Mode {
  if (typeof param === 'string' && isValidMode(param)) {
    return param as Mode;
  }
  return DEFAULT_MODE;
}
