import { jStat } from '../jstat';

/**
 * Normality Tests: Jarque-Bera and Kolmogorov-Smirnov
 */
export interface NormalityResult {
  n: number;
  mean: number;
  stdev: number;
  jbStat: number;
  jbPValue: number;
  ksStat: number;
  ksPValue: number;
}

export const calcNormalityTests = (data: number[]): NormalityResult => {
  const n = data.length;
  if (n < 3) {
    return { n, mean: NaN, stdev: NaN, jbStat: NaN, jbPValue: NaN, ksStat: NaN, ksPValue: NaN };
  }
  
  const mean = jStat.mean(data);
  const stdev = jStat.stdev(data, true); // sample SD
  
  if (stdev === 0) {
    return { n, mean, stdev, jbStat: NaN, jbPValue: NaN, ksStat: NaN, ksPValue: NaN };
  }
  
  // 1. Jarque-Bera Test
  const skew = jStat.skewness(data);
  const excessKurt = jStat.kurtosis(data); // excess kurtosis (0 for normal)
  const jbStat = (n / 6) * (skew * skew + (excessKurt * excessKurt) / 4);
  const jbPValue = Math.exp(-jbStat / 2);
  
  // 2. Kolmogorov-Smirnov Test
  // Sort data ascending
  const sorted = [...data].sort((a, b) => a - b);
  let maxDiff = 0;
  
  for (let i = 0; i < n; i++) {
    const x = sorted[i];
    // Empirical CDF at current and previous steps
    const ecdfPlus = (i + 1) / n;
    const ecdfMinus = i / n;
    // Theoretical CDF
    const theoreticalCDF = jStat.normal.cdf(x, mean, stdev);
    
    const dPlus = Math.abs(ecdfPlus - theoreticalCDF);
    const dMinus = Math.abs(ecdfMinus - theoreticalCDF);
    
    if (dPlus > maxDiff) maxDiff = dPlus;
    if (dMinus > maxDiff) maxDiff = dMinus;
  }
  
  const ksStat = maxDiff;
  
  // KS p-value approximation
  // z = KS_statistic * (sqrt(n) + 0.12 + 0.11 / sqrt(n))
  const sqrtN = Math.sqrt(n);
  const z = ksStat * (sqrtN + 0.12 + 0.11 / sqrtN);
  
  let ksPValue = 1.0;
  if (z >= 0.2) {
    let sum = 0;
    for (let k = 1; k <= 50; k++) {
      const term = Math.pow(-1, k - 1) * Math.exp(-2 * k * k * z * z);
      sum += term;
    }
    ksPValue = 2 * sum;
    ksPValue = Math.max(0, Math.min(1, ksPValue));
  }
  
  return {
    n,
    mean,
    stdev,
    jbStat,
    jbPValue,
    ksStat,
    ksPValue
  };
};

