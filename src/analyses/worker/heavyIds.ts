/**
 * Analyses whose kernels are expensive enough to leave the main thread.
 *
 * Keep this list in sync with `cost: 'heavy'` in `analyses/registry.ts`;
 * `heavyIds.test.ts` enforces it.
 */
export const HEAVY_ANALYSIS_IDS = [
  'lmm',
  'gee',
  'cox',
  'stratcox',
  'tdcox',
  'parametric',
  'timeseries',
  'mi',
  'resampling',
] as const;

export type HeavyAnalysisId = (typeof HEAVY_ANALYSIS_IDS)[number];

export const isHeavyAnalysis = (id: string): id is HeavyAnalysisId =>
  (HEAVY_ANALYSIS_IDS as readonly string[]).includes(id);
