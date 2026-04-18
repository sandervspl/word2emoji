import { modes, type Mode } from './constants';

export async function validatePrompt(prompt: string) {
  const normalizedPrompt = prompt.trim();

  if (normalizedPrompt.length < 2) {
    return {
      error: 'Please enter a word or phrase with at least 2 characters',
    };
  }

  if (normalizedPrompt.length > 20) {
    return {
      error: 'Please enter a prompt shorter than 20 characters',
    };
  }

  if (/[^a-zA-Z0-9 ]/.test(normalizedPrompt)) {
    return {
      error: 'Please enter a word without special characters',
    };
  }

  try {
    const profanityUrl = new URL('https://www.purgomalum.com/service/containsprofanity');
    profanityUrl.searchParams.set('text', normalizedPrompt);

    const response = await fetch(profanityUrl);
    if (response.ok) {
      const isProfane = await response.text();

      if (isProfane === 'true') {
        return {
          error: 'Please keep it reasonable! Try something friendlier 😄',
        };
      }
    } else {
      console.error('Profanity check failed with status:', response.status);
    }
  } catch (error) {
    console.error('Profanity check failed:', error);
  }

  return undefined;
}

/**
 * Validates if a string is a valid mode value.
 * Useful for server-side validation of URL parameters.
 */
export function isValidMode(value: unknown): value is Mode {
  return typeof value === 'string' && modes.includes(value as Mode);
}
