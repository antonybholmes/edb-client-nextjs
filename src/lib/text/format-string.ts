const CURRENT_YEAR = new Date().getFullYear().toString()

/**
 * Performs some cleanups on strings.
 *
 * Replaces ${CURRENT_YEAR} with the actual current 4 digit year.
 *
 * @param text some text to format
 * @returns text with any replacements and formats applied
 */
export function formatString(text: string): string {
  text = text.replaceAll("${CURRENT_YEAR}", CURRENT_YEAR)

  return text
}
