import { modes, type Mode } from './constants';

/**
 * Validates if a string is a valid mode value.
 * Useful for server-side validation of URL parameters.
 */
export function isValidMode(value: unknown): value is Mode {
  return typeof value === 'string' && modes.includes(value as Mode);
}
