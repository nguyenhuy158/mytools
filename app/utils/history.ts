import { useState, useEffect, useCallback } from "react";
import { safeJsonParse, safeJsonStringify } from "./storage";

export function useLocalStorageHistory<T>(key: string, initialHistory: T[] = []) {
  const [history, setHistoryState] = useState<T[]>(initialHistory);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setHistoryState(safeJsonParse(saved, initialHistory));
    }
  }, [key, initialHistory]);

  const setHistory = useCallback((action: T[] | ((prev: T[]) => T[])) => {
    setHistoryState((prev) => {
      const next = typeof action === "function" ? (action as (prev: T[]) => T[])(prev) : action;
      localStorage.setItem(key, safeJsonStringify(next));
      return next;
    });
  }, [key]);

  const clearHistory = useCallback(() => {
    setHistoryState([]);
    localStorage.removeItem(key);
  }, [key]);

  const removeFromHistory = useCallback((index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, [setHistory]);

  return { history, setHistory, clearHistory, removeFromHistory };
}
