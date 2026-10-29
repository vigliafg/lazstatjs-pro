import {
  DEFAULT_THEME_ID,
  cssVariablesOf,
  isThemeId,
  themeById,
  type ThemeDefinition,
  type ThemeId,
} from './themes';

/** Kept separate from the project snapshot so the first paint is themed. */
export const THEME_STORAGE_KEY = 'lazstats.ui.theme';

let active: ThemeDefinition = themeById(DEFAULT_THEME_ID);

/** Theme currently applied to the document and used by the chart renderer. */
export const activeTheme = (): ThemeDefinition => active;

const storage = (): Storage | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

export const loadStoredTheme = (): ThemeId | null => {
  try {
    const raw = storage()?.getItem(THEME_STORAGE_KEY);
    return isThemeId(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const saveStoredTheme = (theme: ThemeId): void => {
  try {
    storage()?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or full storage: the project autosave still carries it.
  }
};

/**
 * Applies a theme to `document.documentElement`. Safe outside the browser: the
 * chart renderer and unit tests only need the in-memory `activeTheme`.
 */
export const applyTheme = (value: unknown): ThemeDefinition => {
  const theme = themeById(value);
  active = theme;
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.dataset.theme = theme.id;
    root.style.colorScheme = theme.mode;
    for (const [name, value] of Object.entries(cssVariablesOf(theme))) {
      root.style.setProperty(name, value);
    }
  }
  return theme;
};
