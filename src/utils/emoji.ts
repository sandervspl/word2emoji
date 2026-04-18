// Extended regex pattern that matches:
// - Basic emojis with variation selectors
// - Compound emojis with Zero Width Joiners (ZWJ)
// - Skin tone modifiers (🏻-🏿)
// - Gender modifiers
// - Flag sequences
// - Keycap sequences
const EMOJI_REGEX =
  /(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*|\p{Emoji_Modifier_Base}(?:\p{Emoji_Modifier})?(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\u200D(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F))*)*/gu;
const EMOJI_SEGMENT_REGEX = /\p{Emoji_Presentation}/u;
const EMOJI_FORMATTING_REGEX = /[\u200D\uFE0F\u20E3\u{E0020}-\u{E007F}]/u;
const WHITESPACE_ONLY_REGEX = /^\s+$/u;

const graphemeSegmenter =
  typeof Intl !== 'undefined' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

function segmentGraphemes(text: string) {
  if (!graphemeSegmenter) {
    return Array.from(text);
  }

  return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
}

function isEmojiSegment(segment: string) {
  return EMOJI_SEGMENT_REGEX.test(segment) || EMOJI_FORMATTING_REGEX.test(segment);
}

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
  const graphemes = segmentGraphemes(text);
  const segmentedMatches = graphemes.filter((segment) => isEmojiSegment(segment));

  if (segmentedMatches.length > 0) {
    return segmentedMatches;
  }

  const regexMatches = text.match(EMOJI_REGEX);
  return regexMatches || [];
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
  const normalizedInput = input.trim();

  // Check for empty input
  if (!normalizedInput) {
    return {
      isValid: false,
      emojis: [],
      error: 'Please enter at least one emoji',
    };
  }

  // Extract emojis using compound emoji extraction
  const emojis = extractCompoundEmojis(normalizedInput);

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
  const hasNonEmojiContent = segmentGraphemes(normalizedInput).some(
    (segment) => !WHITESPACE_ONLY_REGEX.test(segment) && !isEmojiSegment(segment),
  );
  if (hasNonEmojiContent) {
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
