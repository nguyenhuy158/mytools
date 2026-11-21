import * as textCase from "./text-case";

export type Converter = (input: string) => string;

/** Case name → converter. Keys double as the URL path and the `mode` field. */
export const MODES: Record<string, Converter> = {
  upper: textCase.toUpperCase,
  lower: textCase.toLowerCase,
  sentence: textCase.toSentenceCase,
  capitalized: textCase.toCapitalizedCase,
  title: textCase.toTitleCase,
  alternating: textCase.toAlternatingCase,
  inverse: textCase.toInverseCase,
};

/** Short forms, so `curl host/u -d ...` works. */
export const ALIASES: Record<string, string> = {
  u: "upper",
  uc: "upper",
  l: "lower",
  lc: "lower",
  s: "sentence",
  c: "capitalized",
  cap: "capitalized",
  t: "title",
  a: "alternating",
  alt: "alternating",
  i: "inverse",
  inv: "inverse",
};

export function resolveMode(name: string | undefined): string | undefined {
  if (name === undefined) return undefined;
  const mode = Object.hasOwn(ALIASES, name) ? ALIASES[name] : name;
  return Object.hasOwn(MODES, mode) ? mode : undefined;
}
