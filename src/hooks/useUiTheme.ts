import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_THEME_ID,
  applyTheme,
  loadStoredTheme,
  saveStoredTheme,
  themeById,
  type ThemeId,
} from '../theme';
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
 * Output appearance lives here too because its fallbacks depend on the active
 * theme, but it only affects the result window.
 */
export const useUiTheme = (fallback?: ThemeId, outputFallback?: OutputAppearance) => {
  const [theme, setTheme] = useState<ThemeId>(
    () => loadStoredTheme() ?? fallback ?? DEFAULT_THEME_ID
  );
  const [outputAppearance, setOutputAppearance] = useState<OutputAppearance>(() =>
    normalizeOutputAppearance(outputFallback)
  );
  useEffect(() => {
    applyTheme(theme);
    saveStoredTheme(theme);
  }, [theme]);
  const outputStyle = useMemo(
    () => outputAppearanceStyle(outputAppearance, themeById(theme)),
    [outputAppearance, theme]
  );
  return { theme, setTheme, outputAppearance, setOutputAppearance, outputStyle };
};
