/**
 * Single-sampling acceptance plans and their operating characteristic (OC).
 *
 * A lot is accepted when at most `c` defectives appear in a sample of `n`.
 * With a finite lot the count is hypergeometric (sampling without replacement);
 * with an infinite lot it is binomial. The AOQ and ATI follow the standard
 * acceptance-sampling definitions.
 */
import { logFactorial } from './exact';
import type { AcceptanceOptions, AcceptancePoint, AcceptanceResult } from '../analysisResults';

export type {
  AcceptanceOptions,
  AcceptancePoint,
  AcceptanceResult,
} from '../analysisResults';

const logChoose = (n: number, k: number): number => {
  if (k < 0 || k > n || n < 0) return -Infinity;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
};

const binomialCdf = (k: number, n: number, p: number): number => {
  if (!(p >= 0 && p <= 1) || n < 1) return NaN;
  if (p === 0) return k >= 0 ? 1 : 0;
  if (p === 1) return k >= n ? 1 : 0;
  let total = 0;
  for (let j = 0; j <= Math.min(k, n); j += 1) {
    total += Math.exp(logChoose(n, j) + j * Math.log(p) + (n - j) * Math.log(1 - p));
  }
  return Math.min(1, Math.max(0, total));
};

const hypergeometricCdf = (k: number, lotSize: number, defectives: number, n: number): number => {
  if (lotSize <= 0 || n < 0) return NaN;
  const total = logChoose(lotSize, n);
  if (!Number.isFinite(total)) return NaN;
  let sum = 0;
  for (let j = Math.max(0, n - (lotSize - defectives)); j <= Math.min(k, defectives, n); j += 1) {
    const logMass = logChoose(defectives, j) + logChoose(lotSize - defectives, n - j) - total;
    if (Number.isFinite(logMass)) sum += Math.exp(logMass);
  }
  return Math.min(1, Math.max(0, sum));
};

/** Probability of acceptance for an incoming defective share `p`. */
export const acceptancePa = (options: AcceptanceOptions, p: number): number => {
  const n = Math.max(1, Math.round(options.n));
  const c = Math.max(0, Math.round(options.c));
  const lotSize = Math.max(0, Math.round(options.lotSize));
  if (!(p >= 0 && p <= 1)) return NaN;
  if (lotSize > n) {
    const defectives = Math.max(0, Math.min(lotSize, Math.round(p * lotSize)));
    return hypergeometricCdf(c, lotSize, defectives, n);
  }
  return binomialCdf(c, n, p);
};

const clampP = (value: number): number => Math.min(0.999999, Math.max(1e-9, value));

const solveQuality = (options: AcceptanceOptions, targetPa: number): number => {
  // Pa(p) is monotone decreasing: above the target below the crossing, below
  // the target above it.
  let lo = 1e-9;
  let hi = 0.999999;
  for (let iteration = 0; iteration < 80; iteration += 1) {
    const mid = (lo + hi) / 2;
    if (acceptancePa(options, mid) > targetPa) lo = mid;
    else hi = mid;
  }
  return clampP((lo + hi) / 2);
};

/** OC, AOQ and ATI for a plan; `null` when the plan itself is invalid. */
export const acceptancePlan = (options: AcceptanceOptions): AcceptanceResult | null => {
  const n = Math.round(options.n);
  const c = Math.round(options.c);
  const lotSize = Math.max(0, Math.round(options.lotSize));
  if (!(n >= 1) || !(c >= 0) || c >= n) return null;
  if (lotSize > 0 && lotSize < n) return null;
  const finiteLot = lotSize > n;
  const distribution = finiteLot ? 'hypergeometric' : 'binomial';

  const maxP = Math.min(0.6, Math.max(0.08, (3 * (c + 1)) / n));
  const points: AcceptancePoint[] = [];
  for (let index = 0; index <= 60; index += 1) {
    const p = (maxP * index) / 60;
    const pa = acceptancePa(options, p);
    const fractionInspected = finiteLot ? (lotSize - n) / lotSize : 1;
    const aoq = pa * p * fractionInspected;
    const ati = finiteLot ? n + (1 - pa) * (lotSize - n) : n;
    points.push({ p, pa, aoq, ati });
  }

  const aql = solveQuality(options, 0.95);
  const ltpd = solveQuality(options, 0.1);
  const alpha = 1 - acceptancePa(options, aql);
  const beta = acceptancePa(options, ltpd);
  const aoqAt = (p: number): number => {
    const pa = acceptancePa(options, p);
    const fractionInspected = finiteLot ? (lotSize - n) / lotSize : 1;
    return pa * p * fractionInspected;
  };
  // The AOQ curve is unimodal; a coarse scan followed by a local refinement is
  // enough and avoids relying on the grid density.
  let aoqlP = 0;
  let aoql = 0;
  for (let index = 0; index <= 200; index += 1) {
    const p = (0.8 * index) / 200;
    const aoq = aoqAt(p);
    if (aoq > aoql) {
      aoql = aoq;
      aoqlP = p;
    }
  }
  for (let index = -20; index <= 20; index += 1) {
    const p = clampP(aoqlP + index * 0.001);
    const aoq = aoqAt(p);
    if (aoq > aoql) {
      aoql = aoq;
      aoqlP = p;
    }
  }

  return {
    n,
    c,
    lotSize,
    distribution,
    points,
    aql,
    ltpd,
    alpha,
    beta,
    aoql,
    aoqlP,
  };
};
