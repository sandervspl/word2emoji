// Extended regex pattern that matches:
// - Basic emojis with variation selectors
// - Compound emojis with Zero Width Joiners (ZWJ)
// - Skin tone modifiers (🏻-🏿)
// - Gender modifiers
// - Flag sequences
// - Keycap sequences
const EMOJI_REGEX =
  /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*|\p{Emoji_Modifier_Base}(?:\p{Emoji_Modifier})?(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*)*/gu;

export function extractEmojis(text: string) {
  // This regex pattern matches most emojis, including skin tone and gender variations
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

  // Use match() to find all emojis in the string
  const emojis = text.match(emojiRegex);

  // Return the array of emojis, or an empty array if no emojis were found
  return emojis || [];
}

/**
 * Extracts compound emojis (including ZWJ sequences like 👨‍💻, 🏳️‍🌈)
 * and skin tone/gender variations from text
 */
export function extractCompoundEmojis(text: string): string[] {
  const matches = text.match(EMOJI_REGEX);
  return matches || [];
}

/**
 * Validates if a string contains valid emojis
 * Returns an object with validation result and extracted emojis
 */
export function validateEmojiInput(input: string): {
  isValid: boolean;
  emojis: string[];
  error?: string;
} {
  // Check for empty input
  if (!input || input.trim().length === 0) {
    return {
      isValid: false,
      emojis: [],
      error: 'Please enter at least one emoji',
    };
  }

  // Extract emojis using compound emoji extraction
  const emojis = extractCompoundEmojis(input.trim());

  // Check if any emojis were found
  if (emojis.length === 0) {
    return {
      isValid: false,
      emojis: [],
      error: 'No valid emojis found. Please enter emojis only',
    };
  }

  // Limit to reasonable number of emojis
  if (emojis.length > 10) {
    return {
      isValid: false,
      emojis: [],
      error: 'Please enter at most 10 emojis',
    };
  }

  // Check if input contains non-emoji characters (excluding whitespace)
  const strippedInput = input.replace(/\s/g, '');
  const emojiJoined = emojis.join('');

  // Allow some flexibility for variation selectors and ZWJ that might not be captured
  if (strippedInput.length > emojiJoined.length * 2) {
    return {
      isValid: false,
      emojis: [],
      error: 'Please enter emojis only, without text',
    };
  }

  return {
    isValid: true,
    emojis,
  };
}
