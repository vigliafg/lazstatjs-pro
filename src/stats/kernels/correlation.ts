import { jStat } from '../jstat';
import { parseNum } from '../core';
import { calcKendallTau } from './index';
import {
  correlationP,
  fisherZCI,
  kendallP,
  rankValues,
  spearmanP,
  twoSidedTP,
} from '../distributions';

export interface CorrelationPair {
  a: number;
  b: number;
  n: number;
  pearson: number;
  pearsonP: number;
  pearsonLo: number;
  pearsonHi: number;
  r2: number;
  spearman: number;
  spearmanP: number;
  kendall: number;
  kendallP: number;
}

const pairedColumns = (rows: readonly (readonly string[])[], i: number, j: number) => {
  const xs: number[] = [];
  const ys: number[] = [];
  rows.forEach(row => {
    const x = parseNum(row[i]);
    const y = parseNum(row[j]);
    if (!isNaN(x) && !isNaN(y)) {
      xs.push(x);
      ys.push(y);
    }
  });
  return { xs, ys, n: xs.length };
};

/** Correlazioni pairwise (Pearson, Spearman, Kendall) per le variabili scelte. */
export const correlationPairs = (
  rows: readonly (readonly string[])[],
  varIdxs: number[],
  level: number
): CorrelationPair[] => {
  const pairs: CorrelationPair[] = [];
  for (let i = 0; i < varIdxs.length; i++) {
    for (let j = i + 1; j < varIdxs.length; j++) {
      const { xs, ys, n } = pairedColumns(rows, varIdxs[i], varIdxs[j]);
      const pearson = n >= 3 ? jStat.corrcoeff(xs, ys) : NaN;
      const ci = fisherZCI(pearson, n, level);
      const ranksX = n >= 3 ? rankValues(xs) : [];
      const ranksY = n >= 3 ? rankValues(ys) : [];
      const spearman = n >= 3 ? jStat.corrcoeff(ranksX, ranksY) : NaN;
      const kendall = n >= 3 ? calcKendallTau(xs, ys) : NaN;
      pairs.push({
        a: i,
        b: j,
        n,
        pearson,
        pearsonP: correlationP(pearson, n),
        pearsonLo: ci.lo,
        pearsonHi: ci.hi,
        r2: pearson * pearson,
        spearman,
        spearmanP: spearmanP(spearman, n),
        kendall,
        kendallP: kendallP(kendall, n),
      });
    }
  }
  return pairs;
};

export interface ColumnSummary {
  n: number;
  mean: number;
  sd: number;
  median: number;
  min: number;
  max: number;
}

export const columnSummaries = (
  rows: readonly (readonly string[])[],
  indexes: number[]
): ColumnSummary[] =>
  indexes.map(index => {
    const values = rows.map(row => parseNum(row[index])).filter(value => !isNaN(value));
    return {
      n: values.length,
      mean: jStat.mean(values),
      sd: jStat.stdev(values, true),
      median: jStat.median(values),
      min: values.length ? jStat.min(values) : NaN,
      max: values.length ? jStat.max(values) : NaN,
    };
  });

export interface PartialCorrelationRow {
  [key: string]: string | number;
  a: string;
  b: string;
  r: number;
  df: number;
  p: number;
  lo: number;
  hi: number;
  controls: string;
}

/** Correlazioni parziali su casi completi; [] se la matrice non è invertibile. */
export const partialCorrelations = (
  rows: readonly (readonly string[])[],
  varIdxs: number[],
  varNames: string[],
  level: number
): PartialCorrelationRow[] => {
  if (varIdxs.length < 3) return [];
  const completeRows = rows.filter(row =>
    varIdxs.every(index => !isNaN(parseNum(row[index])))
  );
  const n = completeRows.length;
  const q = varIdxs.length;
  if (n <= q + 2) return [];

  const data = varIdxs.map(index => completeRows.map(row => parseNum(row[index])));
  const corr: number[][] = data.map((left, i) =>
    data.map((right, j) => (i === j ? 1 : jStat.corrcoeff(left, right)))
  );

  try {
    const inverse = jStat.inv(corr);
    const rowsOut: PartialCorrelationRow[] = [];
    for (let i = 0; i < q; i++) {
      for (let j = i + 1; j < q; j++) {
        const denominator = Math.sqrt(inverse[i][i] * inverse[j][j]);
        const partial = denominator > 0 ? -inverse[i][j] / denominator : NaN;
        const df = n - (q - 2) - 2;
        const t = isFinite(partial) && Math.abs(partial) < 1
          ? partial * Math.sqrt(df / (1 - partial * partial))
          : NaN;
        const p = twoSidedTP(t, df);
        const ci = fisherZCI(partial, n - (q - 2), level);
        rowsOut.push({
          a: varNames[i],
          b: varNames[j],
          r: partial,
          df,
          p,
          lo: ci.lo,
          hi: ci.hi,
          controls: varNames.filter((_, index) => index !== i && index !== j).join(', '),
        });
      }
    }
    return rowsOut;
  } catch {
    return [];
  }
};
