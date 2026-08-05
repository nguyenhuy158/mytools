/**
 * Case conversion helpers.
 *
 * All matching is Unicode-aware (`\p{L}` + the `u` flag) so text with
 * diacritics — Vietnamese in particular — is handled correctly. The ASCII
 * shorthands `\w` and `\b` must not be used here: `"đường"` has no ASCII word
 * boundary before `đ`, so `/\b\w/` would match the `n` instead.
 */

/** Any letter or digit, i.e. a character that can start a word. */
const WORD_CHAR = /[\p{L}\p{N}]/u;

/** Words kept lowercase inside a title (English minor words). */
const MINOR_WORDS = new Set([
  "a", "an", "the", "and", "but", "or", "for", "nor",
  "on", "at", "to", "from", "by", "over", "in", "of", "with",
]);

const upperFirst = (word: string) =>
  word.replace(WORD_CHAR, (c) => c.toUpperCase());

/** Lowercase everything, then capitalize the first letter of every sentence. */
export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[.!?])(\P{L}*)(\p{L})/gu,
      (_, sep, gap, letter) => sep + gap + letter.toUpperCase(),
    );
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

/** Lowercase everything, then capitalize the first letter of every word. */
export function toCapitalizedCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, upperFirst);
}

/** Lowercase/uppercase alternately, starting with lowercase. */
export function toAlternatingCase(text: string): string {
  return Array.from(text)
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}

/**
 * Title case: capitalize every word except minor words that are not first.
 * Whitespace (including newlines) is preserved as typed.
 */
export function toTitleCase(text: string): string {
  let wordIndex = 0;
  return text
    .toLowerCase()
    .replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (word) => {
      const isFirst = wordIndex++ === 0;
      return !isFirst && MINOR_WORDS.has(word) ? word : upperFirst(word);
    });
}

/** Swap the case of every letter. */
export function toInverseCase(text: string): string {
  return Array.from(text)
    .map((c) => {
      const lower = c.toLowerCase();
      return c === lower ? c.toUpperCase() : lower;
    })
    .join("");
}
