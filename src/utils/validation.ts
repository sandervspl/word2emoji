import { modes, type Mode } from './constants';

export async function validatePrompt(prompt: string) {
  // check for profanity
  const response = await fetch(
    `https://www.purgomalum.com/service/containsprofanity?text=${prompt}`,
  );
  const isProfane = await response.text();

  if (isProfane === 'true') {
    return {
      error: 'Please keep it reasonable! Try something friendlier 😄',
    };
  }

  if (/[^a-zA-Z0-9 ]/.test(prompt)) {
    return {
      error: 'Please enter a word without special characters',
    };
  }

  if (prompt.length < 2) {
    return {
      error: 'Please enter a word longer than 3 characters',
    };
  }

  if (prompt.length > 20) {
    return {
      error: 'Please enter a prompt less than 20 characters',
    };
  }
}

/**
 * Validates if a string is a valid mode value.
 * Useful for server-side validation of URL parameters.
 */
export function isValidMode(value: unknown): value is Mode {
  return typeof value === 'string' && modes.includes(value as Mode);
}
