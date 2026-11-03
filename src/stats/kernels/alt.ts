import { parametricSurvivalStats } from './parametric';
import type { AltFit, AltModel, AltOptions } from '../alt/types';

const transform = (stress: number, model: AltModel): number => {
  if (model === 'arrhenius') return 1 / stress;
  if (model === 'inversePower') return Math.log(stress);
  return stress;
};

/**
 * Accelerated life testing as a Weibull AFT whose first predictor is a
 * transformed stress: 1/S (Arrhenius), log(S) (inverse power) or S.
 */
export const fitAlt = (options: AltOptions): AltFit | null => {
  const k = options.covariates.length + 1;
  if (options.time.length < k + 3) return null;
  const rows: number[][] = [];
  let referenceStress = Infinity;
  options.time.forEach((time, index) => {
    const stress = options.stress[index];
    const event = options.event[index];
    const values = options.covariates.map(covariate => covariate.values[index]);
    if (!Number.isFinite(stress) || stress <= 0) return;
    if (!Number.isFinite(time) || time <= 0) return;
    if (event !== 0 && event !== 1) return;
    if (values.some(value => !Number.isFinite(value))) return;
    rows.push([time, event, transform(stress, options.model), ...values]);
    referenceStress = Math.min(referenceStress, stress);
  });
  if (rows.length < k + 3) return null;

  const stats = parametricSurvivalStats({
    rows: rows.map(row => row.map(value => String(value))),
    timeIdx: 0,
    eventIdx: 1,
    indepIdxs: Array.from({ length: k }, (_, index) => index + 2),
    distribution: 'weibull',
    level: options.level ?? 95,
  });
  if (!stats) return null;

  const names = [
    options.model === 'arrhenius'
      ? '1/stress'
      : options.model === 'inversePower'
        ? 'log(stress)'
        : 'stress',
    ...options.covariates.map(covariate => covariate.name),
  ];
  const coefficients = stats.coefficients.map((coefficient, index) => ({
    ...coefficient,
    term: names[index] ?? coefficient.term,
  }));
  const stressBeta = coefficients[0]?.beta ?? 0;
  const useStress = options.useStress > 0 ? options.useStress : referenceStress;
  const accelerationFactor = Math.exp(
    stressBeta * (transform(useStress, options.model) - transform(referenceStress, options.model))
  );

  return {
    n: stats.n,
    events: stats.events,
    k,
    model: options.model,
    transformedName: names[0],
    mu: stats.mu,
    sigma: stats.sigma,
    logLik: stats.logLik,
    aic: stats.aic,
    coefficients,
    accelerationFactor,
    useStress,
    referenceStress,
    warnings: [],
  };
};
