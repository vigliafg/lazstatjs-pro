import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { ProjectSettings } from '../io/project';
import { CHART_KINDS, type ChartKind } from '../stats/charts';
import type { ChartStylePatches } from '../charts/defaults';
import {
  defaultChartStyle,
  normalizeUserStyles,
  resolvedStyle,
  styleAvailable,
  type UserChartStyle,
} from '../charts/styles';

export type ChartStyleDefaults = Partial<Record<ChartKind, string>>;
export type ChartStyleOverrides = Record<string, Partial<Record<ChartKind, string>>>;

export interface ChartStyleLibrary {
  styles: UserChartStyle[];
  setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
  defaults: ChartStyleDefaults;
  setDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
  overrides: ChartStyleOverrides;
  setOverrides: Dispatch<SetStateAction<ChartStyleOverrides>>;
  /** Stable slice spread into `ProjectSettings`. */
  settings: Pick<ProjectSettings, 'chartStyles' | 'chartStyleDefaults' | 'chartStyleOverrides'>;
  /** Ready-made props for the chart library provider. */
  providerProps: {
    styles: UserChartStyle[];
    setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
    styleDefaults: ChartStyleDefaults;
    setStyleDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
    styleOverrides: ChartStyleOverrides;
    setStyleOverrides: Dispatch<SetStateAction<ChartStyleOverrides>>;
  };
  /** Ready-made props for Settings → Charts. */
  settingsProps: {
    chartStyles: UserChartStyle[];
    setChartStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
    chartStyleDefaults: ChartStyleDefaults;
    setChartStyleDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
  };
  /** Per-kind patches for one procedure, ready for the run. */
  patchesFor: (analysisId: string) => ChartStylePatches;
  restore: (settings: ProjectSettings) => void;
}

/**
 * Project-scoped style gallery state: the styles saved by the user, the
 * per-kind defaults and the per-procedure overrides.
 *
 * Kept out of `App` so the composition root stays readable; the run resolves
 * the effective patch map here and hands it to the chart builder.
 */
export const useChartStyleLibrary = (initial?: ProjectSettings): ChartStyleLibrary => {
  const [styles, setStyles] = useState<UserChartStyle[]>(() =>
    normalizeUserStyles(initial?.chartStyles)
  );
  const [defaults, setDefaults] = useState<ChartStyleDefaults>(
    () => initial?.chartStyleDefaults ?? {}
  );
  const [overrides, setOverrides] = useState<ChartStyleOverrides>(
    () => initial?.chartStyleOverrides ?? {}
  );

  const settings = useMemo(
    () => ({
      chartStyles: styles,
      chartStyleDefaults: defaults,
      chartStyleOverrides: overrides,
    }),
    [styles, defaults, overrides]
  );

  const patchesFor = useCallback(
    (analysisId: string): ChartStylePatches => {
      const patches: ChartStylePatches = {};
      for (const kind of CHART_KINDS) {
        const selected = resolvedStyle(
          kind,
          defaults[kind],
          overrides[analysisId]?.[kind],
          styles
        );
        // A style meant for another procedure (or missing its data) must not be
        // applied silently: the run falls back to the kind's built-in default.
        const style =
          selected && styleAvailable(selected, { analysisId })
            ? selected
            : defaultChartStyle(kind);
        if (style) patches[kind] = style.options;
      }
      return patches;
    },
    [styles, defaults, overrides]
  );

  const restore = useCallback((next: ProjectSettings) => {
    setStyles(normalizeUserStyles(next.chartStyles));
    setDefaults(next.chartStyleDefaults ?? {});
    setOverrides(next.chartStyleOverrides ?? {});
  }, []);

  const providerProps = useMemo(
    () => ({
      styles,
      setStyles,
      styleDefaults: defaults,
      setStyleDefaults: setDefaults,
      styleOverrides: overrides,
      setStyleOverrides: setOverrides,
    }),
    [styles, setStyles, defaults, setDefaults, overrides, setOverrides]
  );

  const settingsProps = useMemo(
    () => ({
      chartStyles: styles,
      setChartStyles: setStyles,
      chartStyleDefaults: defaults,
      setChartStyleDefaults: setDefaults,
    }),
    [styles, setStyles, defaults, setDefaults]
  );

  return {
    styles,
    setStyles,
    defaults,
    setDefaults,
    overrides,
    setOverrides,
    settings,
    providerProps,
    settingsProps,
    patchesFor,
    restore,
  };
};
