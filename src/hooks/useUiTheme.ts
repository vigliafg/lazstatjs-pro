import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_THEME_ID,
  applyThemeDefinition,
  loadStoredTheme,
  saveStoredTheme,
} from '../theme';
import {
  normalizeCustomThemes,
  resolveThemeDefinition,
  resolveThemeId,
  type CustomTheme,
} from '../theme/custom';
import {
  normalizeOutputAppearance,
  outputAppearanceStyle,
  type OutputAppearance,
} from '../theme/outputAppearance';

/**
 * Theme state: the stored preference wins on boot so an immediate reload
 * cannot be overwritten by a slightly older autosave, then every change is
 * applied to the document and remembered outside the project snapshot.
 *
 * Custom themes are project-scoped: the project snapshot owns the definitions
 * and the active theme id. The stored preference only remembers the id; an id
 * that is no longer available falls back to the default theme.
 */
export const useUiTheme = (
  fallbackTheme?: string,
  customFallback?: readonly CustomTheme[],
  outputFallback?: OutputAppearance
) => {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() =>
    normalizeCustomThemes(customFallback)
  );
  const [theme, setThemeState] = useState<string>(() => {
    const stored = loadStoredTheme();
    return resolveThemeId(stored ?? fallbackTheme, customThemes);
  });
  const [outputAppearance, setOutputAppearance] = useState<OutputAppearance>(() =>
    normalizeOutputAppearance(outputFallback)
  );

  const themeDefinition = useMemo(
    () => resolveThemeDefinition(theme, customThemes),
    [theme, customThemes]
  );

  useEffect(() => {
    applyThemeDefinition(themeDefinition);
    saveStoredTheme(theme);
  }, [themeDefinition, theme]);

  const setTheme = useCallback(
    (next: string) => {
      setThemeState(resolveThemeId(next, customThemes));
    },
    [customThemes]
  );

  const saveCustomTheme = useCallback((next: CustomTheme) => {
    setCustomThemes(previous => {
      const without = previous.filter(theme => theme.id !== next.id);
      return normalizeCustomThemes([...without, next]);
    });
    setThemeState(next.id);
  }, []);

  const deleteCustomTheme = useCallback((id: string) => {
    setCustomThemes(previous => previous.filter(theme => theme.id !== id));
    setThemeState(current => (current === id ? DEFAULT_THEME_ID : current));
  }, []);

  /** Project restore: replace the library and the active id in one render. */
  const restoreTheme = useCallback((themeId: string | undefined, themes: unknown) => {
    const normalized = normalizeCustomThemes(themes);
    setCustomThemes(normalized);
    setThemeState(resolveThemeId(themeId, normalized));
  }, []);

  const outputStyle = useMemo(
    () => outputAppearanceStyle(outputAppearance, themeDefinition),
    [outputAppearance, themeDefinition]
  );

  return {
    theme,
    setTheme,
    themeDefinition,
    customThemes,
    saveCustomTheme,
    deleteCustomTheme,
    restoreTheme,
    outputAppearance,
    setOutputAppearance,
    outputStyle,
  };
};
