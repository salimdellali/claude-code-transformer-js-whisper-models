"use client";

import { useState, useEffect, useCallback } from "react";
import type { HistoryEntry } from "@/types";

const STORAGE_KEY = "whisper-benchmark-history";

export function useTranscriptionHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // Corrupted storage — start fresh
    }
  }, []);

  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, "id">) => {
      const newEntry: HistoryEntry = { ...entry, id: crypto.randomUUID() };
      setEntries((prev) => {
        const updated = [newEntry, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { entries, addEntry, deleteEntry };
}
