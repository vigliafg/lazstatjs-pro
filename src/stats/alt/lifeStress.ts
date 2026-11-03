import type { AltFit, AltModel } from './types';

/**
 * Stress transform used by the accelerated-life kernel: Arrhenius 1/S,
 * inverse power log(S), exponential S. Kept here so the plot and the fit agree.
 */
export const altStressTransform = (stress: number, model: AltModel): number | null => {
  if (!Number.isFinite(stress) || stress <= 0) return null;
  if (model === 'arrhenius') return 1 / stress;
  if (model === 'inversePower') return Math.log(stress);
  return stress;
};

// A type alias, not an interface: chart rows are `Record<string, ChartValue>`
// and only aliases get the implicit index signature.
export type LifeStressPoint = { x: number; y: number };

/**
 * Life-stress line on the log10 scale.
 *
 * A Weibull AFT is linear in the transformed stress, so the fitted slope is
 * `beta` per unit of z. The intercept of the model cannot be placed without the
 * covariate means, so the line is anchored at the mean of the observed points:
 * additional covariates move the intercept, not the slope.
 */
export const altLifeStressLine = (
  fit: Pick<AltFit, 'model' | 'coefficients'>,
  samples: { stress: number; time: number }[]
): LifeStressPoint[] => {
  const beta = fit.coefficients[0]?.beta;
  if (!Number.isFinite(beta)) return [];
  const usable: { z: number; t: number }[] = [];
  for (const sample of samples) {
    const z = altStressTransform(sample.stress, fit.model);
    if (z === null || !Number.isFinite(sample.time) || sample.time <= 0) continue;
    usable.push({ z, t: Math.log10(sample.time) });
  }
  if (usable.length < 2) return [];
  const meanZ = usable.reduce((sum, point) => sum + point.z, 0) / usable.length;
  const meanT = usable.reduce((sum, point) => sum + point.t, 0) / usable.length;
  const zMin = Math.min(...usable.map(point => point.z));
  const zMax = Math.max(...usable.map(point => point.z));
  if (!(zMax > zMin)) return [];
  return [zMin, zMax].map(z => ({
    x: z,
    y: meanT + (beta * (z - meanZ)) / Math.LN10,
  }));
};
