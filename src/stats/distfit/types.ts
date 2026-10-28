/**
 * Maximum-likelihood fitting of the distributions Statgraphics offers in its
 * "Distribution fitting" procedure (normal, lognormal, exponential, gamma,
 * Weibull), ranked by AIC. The probability plot uses the fitted quantiles.
 */

export type DistributionName = 'normal' | 'lognormal' | 'exponential' | 'gamma' | 'weibull';

export const DISTRIBUTION_LABEL: Record<DistributionName, string> = {
  normal: 'Normale',
  lognormal: 'Lognormale',
  exponential: 'Esponenziale',
  gamma: 'Gamma',
  weibull: 'Weibull',
};

export interface DistributionFit {
  name: DistributionName;
  params: Record<string, number>;
  logLik: number;
  k: number;
  aic: number;
  bic: number;
  ks: number;
  ksP: number;
  ad: number;
  n: number;
}
