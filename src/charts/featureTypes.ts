import type { MessageKey } from '../i18n';
import type { AnalysisChart, ChartOptions } from '../stats/charts';

/**
 * Descriptor vocabulary shared by the registry (`features.ts`) and the
 * satellites that add controls for one area (`axisFeatures.ts`).
 *
 * Kept separate from `features.ts` so the satellites can type their entries
 * without importing the registry back, which would close a dependency cycle.
 */
export type FeatureGroup = 'general' | 'style' | 'specific';
export type FeatureType = 'checkbox' | 'select' | 'number' | 'range' | 'numberInput';

export interface FeatureChoice {
  value: string | number;
  labelKey: MessageKey;
}

export interface FeatureDescriptor {
  id: string;
  labelKey: MessageKey;
  group: FeatureGroup;
  type: FeatureType;
  /** Shown in the compact toolbar instead of "More style". */
  prominent?: boolean;
  section?: MessageKey;
  choices?: FeatureChoice[];
  /** Choices that depend on the chart data (e.g. SE/SD only when present). */
  choicesFor?: (chart: AnalysisChart) => FeatureChoice[];
  min?: number;
  max?: number;
  step?: number;
  visible?: (options: ChartOptions, chart: AnalysisChart) => boolean;
  get: (options: ChartOptions) => string | number | boolean;
  set: (options: ChartOptions, value: string | number | boolean) => ChartOptions;
}
