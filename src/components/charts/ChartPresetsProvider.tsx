import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ChartPreset } from '../../charts/presets';
import type { UserChartStyle } from '../../charts/styles';
import type { ChartKind } from '../../stats/charts';

export type ChartStyleDefaults = Partial<Record<ChartKind, string>>;
export type ChartStyleOverrides = Record<string, Partial<Record<ChartKind, string>>>;

interface ChartLibraryValue {
  presets: ChartPreset[];
  setPresets: Dispatch<SetStateAction<ChartPreset[]>>;
  styles: UserChartStyle[];
  setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
  styleDefaults: ChartStyleDefaults;
  setStyleDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
  styleOverrides: ChartStyleOverrides;
  setStyleOverrides: Dispatch<SetStateAction<ChartStyleOverrides>>;
  /** False outside the app shell (isolated component or test). */
  available: boolean;
}

const noop = () => undefined;
const defaultValue: ChartLibraryValue = {
  presets: [],
  setPresets: noop,
  styles: [],
  setStyles: noop,
  styleDefaults: {},
  setStyleDefaults: noop,
  styleOverrides: {},
  setStyleOverrides: noop,
  available: false,
};

const ChartLibraryContext = createContext<ChartLibraryValue | null>(null);

/**
 * Project-scoped chart library: named presets, user styles and the per-kind
 * style defaults. `App` owns the persisted state; the provider only exposes it
 * and the setters.
 */
export const ChartLibraryProvider = ({
  presets,
  setPresets,
  styles,
  setStyles,
  styleDefaults,
  setStyleDefaults,
  styleOverrides,
  setStyleOverrides,
  children,
}: {
  presets: ChartPreset[];
  setPresets: Dispatch<SetStateAction<ChartPreset[]>>;
  styles: UserChartStyle[];
  setStyles: Dispatch<SetStateAction<UserChartStyle[]>>;
  styleDefaults: ChartStyleDefaults;
  setStyleDefaults: Dispatch<SetStateAction<ChartStyleDefaults>>;
  styleOverrides: ChartStyleOverrides;
  setStyleOverrides: Dispatch<SetStateAction<ChartStyleOverrides>>;
  children: ReactNode;
}) => {
  const value = useMemo(
    () => ({
      presets,
      setPresets,
      styles,
      setStyles,
      styleDefaults,
      setStyleDefaults,
      styleOverrides,
      setStyleOverrides,
      available: true,
    }),
    [presets, setPresets, styles, setStyles, styleDefaults, setStyleDefaults, styleOverrides, setStyleOverrides]
  );
  return <ChartLibraryContext.Provider value={value}>{children}</ChartLibraryContext.Provider>;
};

export const useChartLibrary = (): ChartLibraryValue =>
  useContext(ChartLibraryContext) ?? defaultValue;

/** Named presets only: used by the quick toolbar selector. */
export const useChartPresets = (): Pick<ChartLibraryValue, 'presets' | 'setPresets' | 'available'> => {
  const { presets, setPresets, available } = useChartLibrary();
  return { presets, setPresets, available };
};
