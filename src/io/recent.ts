const KEY = 'lazstats.recentProjects';
const MAX_RECENT = 5;

/** Newest-first list, deduplicated and capped. */
export const addRecentProject = (list: readonly string[], name: string): string[] => {
  const clean = name.trim();
  if (!clean) return [...list];
  return [clean, ...list.filter(item => item !== clean)].slice(0, MAX_RECENT);
};

export const parseRecentProjects = (raw: string | null): string[] => {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      .map(item => item.trim())
      .filter((item, index, all) => all.indexOf(item) === index)
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
};

export const loadRecentProjects = (): string[] => {
  if (typeof localStorage === 'undefined') return [];
  return parseRecentProjects(localStorage.getItem(KEY));
};

export const saveRecentProjects = (list: readonly string[]): void => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    // Storage disabled: the list stays session-only.
  }
};

export const RECENT_PROJECTS_KEY = KEY;
