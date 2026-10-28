import { useEffect, useState } from 'react';

const STORAGE_KEY = 'lazstats.recent.analyses.v1';
const MAX_RECENT = 5;

const readRecent = (): string[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX_RECENT);
  } catch {
    return [];
  }
};

/** Last analyses opened by the user, persisted outside the project file. */
export const useRecentAnalyses = (activeAnalysis: string): readonly string[] => {
  const [recent, setRecent] = useState<string[]>(readRecent);

  useEffect(() => {
    setRecent(previous => {
      const next = [activeAnalysis, ...previous.filter(id => id !== activeAnalysis)].slice(
        0,
        MAX_RECENT
      );
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode or quota: recents are a convenience, not project data.
      }
      return next;
    });
  }, [activeAnalysis]);

  return recent;
};
