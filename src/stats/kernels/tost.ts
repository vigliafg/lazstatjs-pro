import { jStat } from '../jstat';
import { pairedValues, parseNum, pooledTTest, welchTTest } from '../core';
import { tCrit } from '../distributions';

import type { TostDesign, TostKernelOptions, TostStats } from '../tost/types';

const finite = (values: number[]) => values.filter(value => Number.isFinite(value));

/** Two One-Sided Tests (TOST) per una media, due misure appaiate o due gruppi. */
export const tostStats = (options: TostKernelOptions): TostStats | null => {
  const { design, rows, var1, var2, mu, margin, equalVar, level } = options;
  if (!(margin > 0) || !Number.isFinite(margin)) return null;

  let a: number[] = [];
  let b: number[] = [];
  let diff = NaN;
  let se = NaN;
  let df = NaN;
  let meanA = NaN;
  let meanB = NaN;
  let sdA = NaN;
  let sdB = NaN;

  if (design === 'ind') {
    a = finite(rows.map(row => parseNum(row[var1])));
    b = finite(rows.map(row => parseNum(row[var2])));
    const test = equalVar ? pooledTTest(a, b) : welchTTest(a, b);
    if (!Number.isFinite(test.se) || !(test.se > 0) || !(test.df > 0)) return null;
    se = test.se;
    df = test.df;
    diff = jStat.mean(a) - jStat.mean(b);
    meanA = jStat.mean(a);
    meanB = jStat.mean(b);
    sdA = jStat.stdev(a, true);
    sdB = jStat.stdev(b, true);
  } else if (design === 'paired') {
    const pairs = pairedValues(rows, var1, var2);
    a = pairs.a;
    b = pairs.b;
    const differences = a.map((value, index) => value - b[index]);
    if (differences.length < 2) return null;
    diff = jStat.mean(differences);
    sdA = jStat.stdev(differences, true);
    sdB = sdA;
    se = sdA / Math.sqrt(differences.length);
    df = differences.length - 1;
    meanA = jStat.mean(a);
    meanB = jStat.mean(b);
  } else {
    a = finite(rows.map(row => parseNum(row[var1])));
    if (a.length < 2) return null;
    meanA = jStat.mean(a);
    sdA = jStat.stdev(a, true);
    diff = meanA - mu;
    se = sdA / Math.sqrt(a.length);
    df = a.length - 1;
    meanB = mu;
    sdB = NaN;
  }

  if (!Number.isFinite(diff) || !Number.isFinite(se) || !(se > 0) || !(df > 0)) return null;

  const crit = tCrit(level, df);
  const alpha = 1 - level / 100;
  const ciLo = diff - crit * se;
  const ciHi = diff + crit * se;

  const tLower = (diff + margin) / se;
  const tUpper = (diff - margin) / se;
  const pLower = Math.min(1, Math.max(0, 1 - jStat.studentt.cdf(tLower, df)));
  const pUpper = Math.min(1, Math.max(0, jStat.studentt.cdf(tUpper, df)));
  const pTost = Math.max(pLower, pUpper);

  return {
    design,
    n: design === 'ind' ? a.length + b.length : a.length,
    meanA,
    meanB,
    sdA,
    sdB,
    diff,
    se,
    df,
    crit,
    margin,
    alpha,
    ciLo,
    ciHi,
    tLower,
    pLower,
    tUpper,
    pUpper,
    pTost,
    equivalent: pTost < alpha && ciLo >= -margin && ciHi <= margin,
  };
};
