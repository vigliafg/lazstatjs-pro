import {
  createContext,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ChartPreset } from '../../charts/presets';

interface ChartPresetsValue {
  presets: ChartPreset[];
  setPresets: Dispatch<SetStateAction<ChartPreset[]>>;
  /** False outside the app shell (isolated component or test). */
  available: boolean;
}

const noop: Dispatch<SetStateAction<ChartPreset[]>> = () => undefined;
const defaultValue: ChartPresetsValue = {
  presets: [],
  setPresets: noop,
  available: false,
};

const ChartPresetsContext = createContext<ChartPresetsValue | null>(null);

/**
 * Project-scoped chart presets, shared by the chart editor and Settings.
 * `App` owns the persisted array; the provider only exposes it and its setter.
 */
export const ChartPresetsProvider = ({
  presets,
  setPresets,
  children,
}: {
  presets: ChartPreset[];
  setPresets: Dispatch<SetStateAction<ChartPreset[]>>;
  children: ReactNode;
}) => {
  const value = useMemo(
    () => ({ presets, setPresets, available: true }),
    [presets, setPresets]
  );
  return <ChartPresetsContext.Provider value={value}>{children}</ChartPresetsContext.Provider>;
};

export const useChartPresets = (): ChartPresetsValue =>
  useContext(ChartPresetsContext) ?? defaultValue;
