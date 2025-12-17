import { useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse, safeJsonStringify } from "./storage";

export function useLocalStorageHistory<T>(key: string, initialHistory: T[] = []) {
  const [history, setHistoryState] = useState<T[]>(initialHistory);
  
  // Use a ref to hold the initialHistory to avoid dependency cycles if it's unstable
  const initialHistoryRef = useRef(initialHistory);

  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      setHistoryState(safeJsonParse(saved, initialHistoryRef.current));
    } else {
      // If nothing in storage, ensure we are using the initialHistory
      setHistoryState(initialHistoryRef.current);
    }
  }, [key]);

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
