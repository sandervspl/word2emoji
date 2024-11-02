export function extractEmojis(text: string) {
  // This regex pattern matches most emojis, including skin tone and gender variations
  const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu;

  // Use match() to find all emojis in the string
  const emojis = text.match(emojiRegex);

  // Return the array of emojis, or an empty array if no emojis were found
  return emojis || [];
}
