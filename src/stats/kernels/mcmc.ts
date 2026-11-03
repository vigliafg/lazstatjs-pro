import { mulberry32 } from './distributions';

export const normalDraw = (rng: () => number): number => {
  const u = Math.max(1e-12, rng());
  const v = Math.max(1e-12, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Marsaglia–Tsang gamma sampler (shape ≥ 1; smaller shapes are boosted). */
export const gammaDraw = (shape: number, rate: number, rng: () => number): number => {
  if (shape < 1) {
    const u = Math.max(1e-12, rng());
    return gammaDraw(shape + 1, rate, rng) * u ** (1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x = 0;
    let v = 0;
    do {
      x = normalDraw(rng);
      v = 1 + c * x;
    } while (v <= 0);
    v = v ** 3;
    const u = rng();
    if (u < 1 - 0.0331 * x ** 4) return (d * v) / rate;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return (d * v) / rate;
  }
};

export const chiSquareDraw = (df: number, rng: () => number): number =>
  df >= 1 ? gammaDraw(df / 2, 0.5, rng) : 0;

export const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

export const variance = (values: readonly number[]): number => {
  if (values.length < 2) return NaN;
  const m = mean(values);
  return values.reduce((sum, value) => sum + (value - m) ** 2, 0) / (values.length - 1);
};

export const quantile = (values: readonly number[], probability: number): number => {
  if (values.length === 0) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * Math.max(0, Math.min(1, probability));
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
};

/** Shortest interval containing `level` of the posterior draws. */
export const hdi = (
  values: readonly number[],
  level = 0.95
): { lo: number; hi: number } => {
  if (values.length === 0) return { lo: NaN, hi: NaN };
  const sorted = [...values].sort((a, b) => a - b);
  const width = Math.max(1, Math.floor(sorted.length * Math.min(1, Math.max(0, level))));
  let best = 0;
  let bestWidth = Infinity;
  for (let start = 0; start + width - 1 < sorted.length; start += 1) {
    const span = sorted[start + width - 1] - sorted[start];
    if (span < bestWidth) {
      bestWidth = span;
      best = start;
    }
  }
  return { lo: sorted[best], hi: sorted[best + width - 1] };
};

/** Integrated autocorrelation time with Geyer's initial positive sequence. */
export const autocorrelationTime = (chain: readonly number[]): number => {
  const n = chain.length;
  if (n < 10) return 1;
  const m = mean(chain);
  const centered = chain.map(value => value - m);
  const denominator = centered.reduce((sum, value) => sum + value ** 2, 0);
  if (denominator === 0) return 1;
  let sum = 0;
  let previous = 1;
  for (let lag = 1; lag < Math.min(n - 1, Math.floor(n / 2)); lag += 1) {
    let numerator = 0;
    for (let index = 0; index + lag < n; index += 1) {
      numerator += centered[index] * centered[index + lag];
    }
    const rho = numerator / denominator;
    if (rho < 0) break;
    sum += rho;
    previous = rho;
  }
  void previous;
  return Math.max(1, 1 + 2 * sum);
};

/** Effective sample size of one or more chains. */
export const effectiveSampleSize = (chains: readonly (readonly number[])[]): number => {
  const usable = chains.filter(chain => chain.length > 1);
  if (usable.length === 0) return 0;
  const total = usable.reduce((sum, chain) => sum + chain.length, 0);
  const times = usable.map(chain => autocorrelationTime(chain));
  return total / Math.max(1, mean(times));
};

/** Gelman–Rubin R-hat after splitting each chain in two halves. */
export const rHat = (chains: readonly (readonly number[])[]): number => {
  const split: number[][] = [];
  for (const chain of chains) {
    if (chain.length < 4) continue;
    const half = Math.floor(chain.length / 2);
    split.push(chain.slice(0, half), chain.slice(half));
  }
  if (split.length < 2) return NaN;
  const n = Math.min(...split.map(chain => chain.length));
  const means = split.map(chain => mean(chain));
  const variances = split.map(chain => variance(chain));
  const within = mean(variances);
  const between = n * variance(means);
  if (within <= 0) return NaN;
  const varianceHat = ((n - 1) / n) * within + between / n;
  return Math.sqrt(varianceHat / within);
};

export interface PosteriorSummary {
  mean: number;
  sd: number;
  median: number;
  lo: number;
  hi: number;
  hdiLo: number;
  hdiHi: number;
  rhat: number;
  ess: number;
}

export const summarise = (
  chains: readonly (readonly number[])[],
  level: number
): PosteriorSummary => {
  const draws = chains.flat();
  const lower = quantile(draws, (1 - level) / 2);
  const upper = quantile(draws, 1 - (1 - level) / 2);
  const interval = hdi(draws, level);
  return {
    mean: mean(draws),
    sd: Math.sqrt(variance(draws)),
    median: quantile(draws, 0.5),
    lo: lower,
    hi: upper,
    hdiLo: interval.lo,
    hdiHi: interval.hi,
    rhat: rHat(chains),
    ess: effectiveSampleSize(chains),
  };
};

/** Multivariate normal draw through the Cholesky factor of the covariance. */
export const normalVectorDraw = (
  average: readonly number[],
  covariance: readonly (readonly number[])[],
  rng: () => number
): number[] => {
  const n = average.length;
  const lower = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j <= i; j += 1) {
      let sum = covariance[i][j];
      for (let k = 0; k < j; k += 1) sum -= lower[i][k] * lower[j][k];
      if (i === j) lower[i][j] = Math.sqrt(Math.max(0, sum));
      else lower[i][j] = lower[j][j] > 0 ? sum / lower[j][j] : 0;
    }
  }
  return average.map((value, i) => {
    let draw = value;
    for (let j = 0; j <= i; j += 1) draw += lower[i][j] * normalDraw(rng);
    return draw;
  });
};
