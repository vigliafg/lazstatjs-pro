const KEY = 'lazstats.analysisFavorites';

/** Parse a stored favorites list, dropping unknown or duplicated ids. */
export const parseFavorites = (raw: string | null, validIds: readonly string[]): string[] => {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of value) {
      if (typeof id !== 'string' || !validIds.includes(id) || seen.has(id)) continue;
      seen.add(id);
      out.push(id);
    }
    return out;
  } catch {
    return [];
  }
};

export const loadFavorites = (validIds: readonly string[]): string[] => {
  if (typeof localStorage === 'undefined') return [];
  return parseFavorites(localStorage.getItem(KEY), validIds);
};

export const saveFavorites = (ids: readonly string[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage disabled/full: favorites stay session-only.
  }
};

export const FAVORITES_KEY = KEY;
