import { jStat } from '../jstat';
import { parseNum } from '../core';
import { fSF, tCrit, twoSidedTP } from '../distributions';

import type {
  AgreementMode, BlandAltmanResult, IccResult, KappaResult, KappaWeight,
} from '../agreement/types';

export const iccStats = (
  rows: readonly (readonly string[])[],
  columns: number[]
): IccResult | null => {
  if (columns.length < 2) return null;
  const data = rows
    .map(row => columns.map(index => parseNum(row[index])))
    .filter(values => values.every(value => Number.isFinite(value)));
  const n = data.length;
  const k = columns.length;
  if (n < 2) return null;

  const grand = data.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0) / (n * k);
  const rowMeans = data.map(row => row.reduce((a, b) => a + b, 0) / k);
  const colMeans = columns.map((_, j) => data.reduce((sum, row) => sum + row[j], 0) / n);

  let sst = 0;
  let ssb = 0;
  let ssr = 0;
  data.forEach((row, i) => {
    row.forEach((value, j) => {
      sst += Math.pow(value - grand, 2);
      ssb += Math.pow(rowMeans[i] - grand, 2);
      ssr += Math.pow(colMeans[j] - grand, 2);
    });
  });
  // ssb above is k times the subject sum of squares; ssr is n times the rater SS.
  const ssResidual = sst - ssb - ssr;
  const dfB = n - 1;
  const dfR = k - 1;
  const dfE = (n - 1) * (k - 1);
  if (dfB <= 0 || dfE <= 0) return null;
  const msb = ssb / dfB;
  const msr = ssr / dfR;
  const mse = ssResidual / dfE;
  const msw = ssResidual / (n * (k - 1));

  const icc11 = msb + (k - 1) * msw > 0 ? (msb - msw) / (msb + (k - 1) * msw) : NaN;
  const icc21Denominator = msb + (k - 1) * mse + (k * (msr - mse)) / n;
  const icc21 = icc21Denominator > 0 ? (msb - mse) / icc21Denominator : NaN;
  const icc31Denominator = msb + (k - 1) * mse;
  const icc31 = icc31Denominator > 0 ? (msb - mse) / icc31Denominator : NaN;
  const f = mse > 0 ? msb / mse : NaN;

  return {
    n,
    k,
    icc11,
    icc21,
    icc31,
    msb,
    msr,
    mse,
    f,
    p: fSF(f, dfB, dfE),
  };
};

export const blandAltmanStats = (
  rows: readonly (readonly string[])[],
  first: number,
  second: number,
  level: number
): BlandAltmanResult | null => {
  const pairs = rows
    .map(row => [parseNum(row[first]), parseNum(row[second])] as [number, number])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  const n = pairs.length;
  if (n < 3) return null;

  const differences = pairs.map(([a, b]) => a - b);
  const means = pairs.map(([a, b]) => (a + b) / 2);
  const bias = jStat.mean(differences);
  const sd = jStat.stdev(differences, true);
  const crit = tCrit(level, n - 1);
  const seBias = sd / Math.sqrt(n);
  const seLoa = Math.sqrt((3 * sd * sd) / n);
  const loaUpper = bias + 1.96 * sd;
  const loaLower = bias - 1.96 * sd;

  const meanMean = jStat.mean(means);
  const sxx = means.reduce((sum, value) => sum + Math.pow(value - meanMean, 2), 0);
  const sxy = means.reduce(
    (sum, value, index) => sum + (value - meanMean) * (differences[index] - bias),
    0
  );
  const slope = sxx > 0 ? sxy / sxx : NaN;
  const residual = differences.map((value, index) => value - (bias + slope * (means[index] - meanMean)));
  const sse = residual.reduce((sum, value) => sum + value * value, 0);
  const df = n - 2;
  const seSlope = sxx > 0 && df > 0 ? Math.sqrt(sse / df / sxx) : NaN;
  const tSlope = seSlope > 0 ? slope / seSlope : NaN;

  return {
    n,
    bias,
    sd,
    loaUpper,
    loaLower,
    biasLo: bias - crit * seBias,
    biasHi: bias + crit * seBias,
    loaUpperLo: loaUpper - crit * seLoa,
    loaUpperHi: loaUpper + crit * seLoa,
    loaLowerLo: loaLower - crit * seLoa,
    loaLowerHi: loaLower + crit * seLoa,
    slope,
    slopeP: twoSidedTP(tSlope, df),
    points: means.map((mean, index) => ({ mean, diff: differences[index] })),
  };
};

const kappaWeights = (categories: number, weight: KappaWeight): number[][] => {
  if (weight === 'none') {
    return Array.from({ length: categories }, (_, i) =>
      Array.from({ length: categories }, (_, j) => (i === j ? 1 : 0))
    );
  }
  return Array.from({ length: categories }, (_, i) =>
    Array.from({ length: categories }, (_, j) => {
      const distance = Math.abs(i - j) / Math.max(1, categories - 1);
      return weight === 'linear' ? 1 - distance : 1 - distance * distance;
    })
  );
};

export const kappaStats = (
  rows: readonly (readonly string[])[],
  columns: number[],
  weight: KappaWeight = 'none',
  level = 95
): KappaResult | null => {
  if (columns.length < 2) return null;
  const ratings = rows
    .map(row => columns.map(index => String(row[index] ?? '').trim()))
    .filter(values => values.every(value => value !== ''));
  const n = ratings.length;
  if (n === 0) return null;

  const categories = Array.from(
    new Set(ratings.flatMap(row => row))
  ).sort();
  const C = categories.length;
  if (C < 2) return null;
  const indexOf = new Map(categories.map((category, index) => [category, index]));
  const weights = kappaWeights(C, weight);

  if (columns.length === 2) {
    const counts = Array.from({ length: C }, () => new Array<number>(C).fill(0));
    ratings.forEach(([a, b]) => {
      counts[indexOf.get(a)!][indexOf.get(b)!] += 1;
    });
    const rowTotals = counts.map(row => row.reduce((sum, value) => sum + value, 0));
    const colTotals = Array.from({ length: C }, (_, j) =>
      counts.reduce((sum, row) => sum + row[j], 0)
    );
    let po = 0;
    let pe = 0;
    for (let i = 0; i < C; i++) {
      for (let j = 0; j < C; j++) {
        po += weights[i][j] * counts[i][j];
        pe += weights[i][j] * rowTotals[i] * colTotals[j];
      }
    }
    po /= n;
    pe /= n * n;
    const kappa = pe < 1 ? (po - pe) / (1 - pe) : NaN;
    const se = po < 1 && po > 0 && pe < 1
      ? Math.sqrt((po * (1 - po)) / (n * Math.pow(1 - pe, 2)))
      : NaN;
    const z = se > 0 ? kappa / se : NaN;
    const crit = 1.959963984540054; // 95% normal quantile for the kappa CI
    return {
      raters: 2,
      categories: C,
      n,
      po,
      pe,
      kappa,
      se,
      z,
      p: twoSidedTP(z, n - 1),
      lo: kappa - crit * se,
      hi: kappa + crit * se,
      weighted: weight,
    };
  }

  const counts = ratings.map(row => {
    const perCategory = new Array<number>(C).fill(0);
    row.forEach(value => {
      perCategory[indexOf.get(value)!] += 1;
    });
    return perCategory;
  });
  const k = columns.length;
  const P = counts.reduce((sum, row) => {
    const squares = row.reduce((total, count) => total + count * count, 0);
    return sum + (squares - k) / (k * (k - 1));
  }, 0) / n;
  const pCategory = Array.from({ length: C }, (_, j) =>
    counts.reduce((sum, row) => sum + row[j], 0) / (n * k)
  );
  const Pe = pCategory.reduce((sum, value) => sum + value * value, 0);
  const kappa = Pe < 1 ? (P - Pe) / (1 - Pe) : NaN;
  const se = Pe < 1 && P > 0 && P < 1
    ? Math.sqrt((P * (1 - P)) / (n * Math.pow(1 - Pe, 2)))
    : NaN;
  const z = se > 0 ? kappa / se : NaN;
  const crit = 1.959963984540054;
  return {
    raters: k,
    categories: C,
    n,
    po: P,
    pe: Pe,
    kappa,
    se,
    z,
    p: twoSidedTP(z, n - 1),
    lo: kappa - crit * se,
    hi: kappa + crit * se,
    weighted: weight,
  };
};
