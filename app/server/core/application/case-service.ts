import { ALIASES, MODES, resolveMode } from "../domain/case-modes";

export function createCaseService() {
  return {
    modes: (): string[] => Object.keys(MODES),
    aliases: (): Record<string, string> => ALIASES,
    resolve: resolveMode,
    convert: (mode: string, input: string): string => MODES[mode](input),
  };
}

export type CaseService = ReturnType<typeof createCaseService>;
