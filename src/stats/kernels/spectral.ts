/** Spectral analysis: periodogram, Daniell smoothing, Fisher's g and AR spectrum. */

export interface SpectralPoint {
  frequency: number;
  period: number;
  power: number;
}

export interface ArSpectrum {
  order: number;
  coefficients: number[];
  variance: number;
  aic: number[];
  points: SpectralPoint[];
}

export interface SpectralAnalysis {
  n: number;
  points: SpectralPoint[];
  smoothed: SpectralPoint[];
  span: number;
  fisher: { g: number; p: number; frequency: number; period: number };
  peaks: { frequency: number; period: number; power: number }[];
  ar: ArSpectrum | null;
}

const mean = (values: number[]): number => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Raw periodogram, matching R's spec.pgram with no taper/detrend and demeaning. */
export const periodogram = (values: number[]): SpectralPoint[] => {
  const n = values.length;
  if (n < 4) return [];
  const mu = mean(values);
  const points: SpectralPoint[] = [];
  const half = Math.floor(n / 2);
  for (let k = 1; k <= half; k++) {
    let real = 0;
    let imaginary = 0;
    const angleStep = (2 * Math.PI * k) / n;
    for (let time = 0; time < n; time++) {
      const angle = angleStep * time;
      const centered = values[time] - mu;
      real += centered * Math.cos(angle);
      imaginary -= centered * Math.sin(angle);
    }
    const frequency = k / n;
    points.push({
      frequency,
      period: 1 / frequency,
      power: (real * real + imaginary * imaginary) / n,
    });
  }
  return points;
};

/**
 * Modified Daniell smoothing: a moving average with weight 0.5 at both ends
 * and 1 in the interior, normalised by the span (R's kernel("modified.daniell")).
 */
export const smoothPeriodogram = (points: SpectralPoint[], span: number): SpectralPoint[] => {
  const width = Math.max(3, Math.floor(span) | 1);
  const weights: number[] = [];
  for (let index = 0; index < width; index++) {
    weights.push(index === 0 || index === width - 1 ? 0.5 : 1);
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return points.map((point, index) => {
    let weighted = 0;
    for (let offset = 0; offset < width; offset++) {
      const source = index + offset - Math.floor(width / 2);
      if (source >= 0 && source < points.length) weighted += weights[offset] * points[source].power;
    }
    return { ...point, power: weighted / total };
  });
};

/** Fisher's g test for a dominant periodic component (white-noise null). */
export const fisherTest = (
  points: SpectralPoint[]
): { g: number; p: number; frequency: number; period: number } => {
  if (points.length === 0) return { g: NaN, p: NaN, frequency: NaN, period: NaN };
  const total = points.reduce((sum, point) => sum + point.power, 0);
  if (!(total > 0)) return { g: NaN, p: NaN, frequency: NaN, period: NaN };
  let peak = points[0];
  points.forEach(point => {
    if (point.power > peak.power) peak = point;
  });
  const m = points.length;
  const g = peak.power / total;
  // p = Σ_{j=1..⌊1/g⌋} (-1)^{j-1} C(m,j) (1 − j g)^{m−1}
  let p = 0;
  const limit = Math.min(m, Math.floor(1 / g));
  for (let j = 1; j <= limit; j++) {
    const logBinomial = logGamma(m + 1) - logGamma(j + 1) - logGamma(m - j + 1);
    const term = Math.exp(logBinomial) * Math.pow(Math.max(0, 1 - j * g), m - 1);
    p += (j % 2 === 1 ? 1 : -1) * term;
  }
  return { g, p: Math.min(1, Math.max(0, p)), frequency: peak.frequency, period: peak.period };
};

const logGamma = (value: number): number => {
  // Lanczos approximation, enough for the binomial coefficients in Fisher's g.
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (value < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * value)) - logGamma(1 - value);
  const shifted = value - 1;
  let series = 0.99999999999980993;
  coefficients.forEach((coefficient, index) => {
    series += coefficient / (shifted + index + 1);
  });
  const t = shifted + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(t) - t + Math.log(series);
};

const autocovariance = (values: number[], lag: number): number => {
  const n = values.length;
  const mu = mean(values);
  let sum = 0;
  for (let index = lag; index < n; index++) sum += (values[index] - mu) * (values[index - lag] - mu);
  return sum / n;
};

/** Yule–Walker AR fit with AIC order selection (R's ar.yw convention). */
export const arSpectrum = (values: number[], maxOrder?: number): ArSpectrum | null => {
  const n = values.length;
  if (n < 8) return null;
  const pmax = Math.min(maxOrder ?? Math.min(20, Math.floor(10 * Math.log10(n))), Math.floor(n / 3), 20);
  if (pmax < 1) return null;
  const covariances = Array.from({ length: pmax + 1 }, (_, lag) => autocovariance(values, lag));
  if (!(covariances[0] > 0)) return null;

  const fits: { order: number; coefficients: number[]; variance: number }[] = [];
  let coefficients: number[] = [];
  let variance = covariances[0];
  for (let order = 1; order <= pmax; order++) {
    let numerator = covariances[order];
    for (let index = 1; index < order; index++) {
      numerator -= coefficients[index - 1] * covariances[order - index];
    }
    const reflection = variance > 0 ? numerator / variance : 0;
    const next = new Array<number>(order).fill(0);
    for (let index = 1; index < order; index++) {
      next[index - 1] = coefficients[index - 1] - reflection * coefficients[order - index - 1];
    }
    next[order - 1] = reflection;
    variance *= 1 - reflection * reflection;
    coefficients = next;
    fits.push({ order, coefficients: coefficients.slice(), variance });
  }

  const aic = fits.map(fit => n * Math.log(Math.max(fit.variance, 1e-12)) + 2 * (fit.order + 1));
  let best = 0;
  aic.forEach((value, index) => {
    if (value < aic[best]) best = index;
  });
  const chosen = fits[best];
  const grid = Array.from({ length: 256 }, (_, index) => index / 512);
  const points = grid.map(frequency => {
    let real = 1;
    let imaginary = 0;
    chosen.coefficients.forEach((coefficient, index) => {
      const angle = 2 * Math.PI * frequency * (index + 1);
      real -= coefficient * Math.cos(angle);
      imaginary += coefficient * Math.sin(angle);
    });
    const denominator = real * real + imaginary * imaginary;
    return {
      frequency,
      period: frequency > 0 ? 1 / frequency : Infinity,
      power: denominator > 0 ? chosen.variance / denominator : NaN,
    };
  });
  return {
    order: chosen.order,
    coefficients: chosen.coefficients,
    // R's ar.yw reports the unbiased residual variance (n − order − 1).
    variance:
      chosen.variance * (n / Math.max(1, n - chosen.order - 1)),
    aic,
    points,
  };
};

export const spectralAnalysis = (values: number[], span = 3): SpectralAnalysis => {
  const points = periodogram(values);
  const smoothed = smoothPeriodogram(points, span);
  const peaks = points
    .slice()
    .sort((left, right) => right.power - left.power)
    .slice(0, 5)
    .map(point => ({ frequency: point.frequency, period: point.period, power: point.power }));
  return {
    n: values.length,
    points,
    smoothed,
    span: Math.max(3, Math.floor(span) | 1),
    fisher: fisherTest(points),
    peaks,
    ar: arSpectrum(values),
  };
};
