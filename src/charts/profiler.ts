/**
 * Interactive response-surface prediction.
 *
 * The DOE kernel stores the fitted coefficients on the surface chart. The
 * profiler evaluates that polynomial in the browser: moving a factor never
 * re-runs the analysis and never touches the observed data.
 */

import type { AnalysisChart } from '../stats/charts';

export interface SurfaceModel {
  aMin: number;
  aMax: number;
  bMin: number;
  bMax: number;
  /** z range of the fitted grid, used by the profiler bar. */
  zMin: number;
  zMax: number;
  intercept: number;
  a: number;
  b: number;
  aa: number;
  ab: number;
  bb: number;
  quadratic: boolean;
}

const numberAt = (stats: Record<string, number | string | null>, key: string): number => {
  const value = stats[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : Number.NaN;
};

/** Read the fitted model from a surface chart, or null when it is incomplete. */
export const surfaceModelOf = (chart: AnalysisChart): SurfaceModel | null => {
  if (chart.kind !== 'surface' || !chart.stats) return null;
  const stats = chart.stats;
  const model: SurfaceModel = {
    aMin: numberAt(stats, 'aMin'),
    aMax: numberAt(stats, 'aMax'),
    bMin: numberAt(stats, 'bMin'),
    bMax: numberAt(stats, 'bMax'),
    zMin: numberAt(stats, 'zMin'),
    zMax: numberAt(stats, 'zMax'),
    intercept: numberAt(stats, 'coefIntercept'),
    a: numberAt(stats, 'coefA'),
    b: numberAt(stats, 'coefB'),
    aa: numberAt(stats, 'coefAA'),
    ab: numberAt(stats, 'coefAB'),
    bb: numberAt(stats, 'coefBB'),
    quadratic: stats.model === 'quadratic',
  };
  const required = [
    model.aMin,
    model.aMax,
    model.bMin,
    model.bMax,
    model.intercept,
    model.a,
    model.b,
  ];
  if (required.some(value => !Number.isFinite(value))) return null;
  if (!(model.aMax > model.aMin) || !(model.bMax > model.bMin)) return null;
  if (model.quadratic && [model.aa, model.ab, model.bb].some(value => !Number.isFinite(value))) {
    return null;
  }
  if (!Number.isFinite(model.zMin) || !Number.isFinite(model.zMax)) {
    model.zMin = Number.NaN;
    model.zMax = Number.NaN;
  }
  return model;
};

export const clampFactor = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Evaluate the fitted response at (a, b), clamped to the observed factor range. */
export const predictSurface = (model: SurfaceModel, aValue: number, bValue: number): number => {
  const a = clampFactor(Number.isFinite(aValue) ? aValue : model.aMin, model.aMin, model.aMax);
  const b = clampFactor(Number.isFinite(bValue) ? bValue : model.bMin, model.bMin, model.bMax);
  return (
    model.intercept +
    model.a * a +
    model.b * b +
    (model.quadratic ? model.aa * a * a + model.ab * a * b + model.bb * b * b : 0)
  );
};

/** Percentage of the fitted z range occupied by the prediction (0-100). */
export const predictionPosition = (model: SurfaceModel, prediction: number): number => {
  if (!Number.isFinite(model.zMin) || !Number.isFinite(model.zMax) || model.zMax === model.zMin) {
    return 50;
  }
  return Math.min(100, Math.max(0, ((prediction - model.zMin) / (model.zMax - model.zMin)) * 100));
};

export interface ProfilePoint {
  x: number;
  y: number;
}

/**
 * Cross-section of the surface at a fixed value of one factor. `axis` is the
 * factor that moves; the other factor stays at `fixed`.
 */
export const surfaceSlice = (
  model: SurfaceModel,
  axis: 'a' | 'b',
  fixed: number,
  steps = 31
): ProfilePoint[] => {
  const count = Math.max(2, Math.round(steps));
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const value = axis === 'a' ? model.aMin + t * (model.aMax - model.aMin) : model.bMin + t * (model.bMax - model.bMin);
    return {
      x: value,
      y: axis === 'a' ? predictSurface(model, value, fixed) : predictSurface(model, fixed, value),
    };
  });
};
