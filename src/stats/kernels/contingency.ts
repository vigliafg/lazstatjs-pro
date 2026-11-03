import { chi2SF, mulberry32, zCrit } from '../distributions';
import { calcFisherExact } from './exact';
import type {
  ContingencyStratumInput,
  ExactContingencyResult,
  MantelHaenszelResult,
  MantelHaenszelStratumResult,
  TrendResult,
} from '../contingency/types';

export const EPS = 1e-12;

export const isRectangular = (observed: number[][]): boolean => {
  if (observed.length < 2) return false;
  const width = observed[0]?.length ?? 0;
  if (width < 2) return false;
  if (!observed.every(row => row.length === width)) return false;
  return observed.every(row => row.every(value => Number.isFinite(value) && value >= 0));
};

/**
 * Simulates the chi-square statistic with both margins fixed: the column
 * slots are shuffled and dealt to the rows, so every simulated table has the
 * same row and column totals as the observed one.
 */
export const simulateFixedMarginChi2 = (
  observed: number[][],
  simulations: number,
  seed = 20240517
): number[] => {
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colCount = observed[0].length;
  const colTotals = Array.from({ length: colCount }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  const random = mulberry32(seed);
  const results: number[] = [];

  for (let s = 0; s < simulations; s++) {
    const slots: number[] = [];
    colTotals.forEach((count, j) => {
      for (let k = 0; k < count; k++) slots.push(j);
    });
    // Fisher-Yates shuffle
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    const table = observed.map(row => row.map(() => 0));
    let cursor = 0;
    rowTotals.forEach((rowTotal, i) => {
      for (let k = 0; k < rowTotal; k++) {
        const col = slots[cursor];
        if (col === undefined) break;
        table[i][col] += 1;
        cursor += 1;
      }
    });
    let statistic = 0;
    for (let i = 0; i < table.length; i++) {
      const rowTotal = rowTotals[i];
      for (let j = 0; j < colCount; j++) {
        const expected = (rowTotal * colTotals[j]) / n;
        if (expected > 0) {
          statistic += Math.pow(table[i][j] - expected, 2) / expected;
        }
      }
    }
    results.push(statistic);
  }
  return results;
};

/** Expected counts under independence. */
const expectedCounts = (observed: number[][]): number[][] => {
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = observed[0].map((_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  return observed.map((_, i) => colTotals.map(total => (rowTotals[i] * total) / n));
};

/** Σ |O − E| — the fixed-margin statistic used by the exact R×C mode. */
export const absoluteDeviation = (observed: number[][]): number => {
  if (!isRectangular(observed)) return NaN;
  const expected = expectedCounts(observed);
  return observed.reduce(
    (sum, row, i) => sum + row.reduce((inner, value, j) => inner + Math.abs(value - expected[i][j]), 0),
    0
  );
};

/**
 * Same fixed-margin permutation scheme as `simulateFixedMarginChi2`, but the
 * statistic is Σ |O − E|.
 */
export const simulateFixedMarginAbsoluteDeviation = (
  observed: number[][],
  simulations: number,
  seed = 20240517
): number[] => {
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colCount = observed[0].length;
  const colTotals = Array.from({ length: colCount }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  const expected = rowTotals.map(total => colTotals.map(col => (total * col) / n));
  const random = mulberry32(seed);
  const results: number[] = [];

  for (let s = 0; s < simulations; s++) {
    const slots: number[] = [];
    colTotals.forEach((count, j) => {
      for (let k = 0; k < count; k++) slots.push(j);
    });
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    const table = observed.map(row => row.map(() => 0));
    let cursor = 0;
    rowTotals.forEach((rowTotal, i) => {
      for (let k = 0; k < rowTotal; k++) {
        const col = slots[cursor];
        if (col === undefined) break;
        table[i][col] += 1;
        cursor += 1;
      }
    });
    let statistic = 0;
    for (let i = 0; i < table.length; i++) {
      for (let j = 0; j < colCount; j++) {
        statistic += Math.abs(table[i][j] - expected[i][j]);
      }
    }
    results.push(statistic);
  }
  return results;
};

const logAdd = (a: number, b: number): number => {
  if (a === -Infinity) return b;
  if (b === -Infinity) return a;
  const max = Math.max(a, b);
  return max + Math.log1p(Math.exp(-Math.abs(a - b)));
};

const logFactorialTable = (n: number): number[] => {
  const table = new Array<number>(n + 1).fill(0);
  for (let i = 2; i <= n; i++) table[i] = table[i - 1] + Math.log(i);
  return table;
};

interface EnumerationResult {
  tables: number;
  statistic: number;
  p: number;
}

/**
 * Exact p-value for an R×C table by enumerating every table with the observed
 * margins. The statistic is Σ|O−E| and the probability of a table is the
 * multivariate hypergeometric mass. Returns `null` when the enumeration
 * exceeds `budget`.
 */
const enumerateExact = (observed: number[][], budget: number): EnumerationResult | null => {
  const rowCount = observed.length;
  const colCount = observed[0].length;
  const rowTotals = observed.map(row => row.reduce((sum, value) => sum + value, 0));
  const colTotals = Array.from({ length: colCount }, (_, j) =>
    observed.reduce((sum, row) => sum + row[j], 0)
  );
  const n = rowTotals.reduce((sum, value) => sum + value, 0);
  const expected = expectedCounts(observed);
  const observedStatistic = absoluteDeviation(observed);
  const logFact = logFactorialTable(n);

  const logProbability = (table: number[][]): number => {
    let value = 0;
    for (const total of rowTotals) value += logFact[total];
    for (const total of colTotals) value += logFact[total];
    value -= logFact[n];
    for (const row of table) {
      for (const cell of row) value -= logFact[cell];
    }
    return value;
  };

  let count = 0;
  let logTotal = -Infinity;
  let logTail = -Infinity;
  let aborted = false;
  const table = Array.from({ length: rowCount }, () => new Array<number>(colCount).fill(0));
  const remaining = [...colTotals];

  const visit = (rowIndex: number): void => {
    if (aborted) return;
    if (rowIndex === rowCount - 1) {
      table[rowIndex] = [...remaining];
      count += 1;
      if (count > budget) {
        aborted = true;
        return;
      }
      const probability = logProbability(table);
      logTotal = logAdd(logTotal, probability);
      let statistic = 0;
      for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
          statistic += Math.abs(table[i][j] - expected[i][j]);
        }
      }
      if (statistic >= observedStatistic - EPS) logTail = logAdd(logTail, probability);
      return;
    }

    const distribute = (colIndex: number, left: number): void => {
      if (aborted) return;
      if (colIndex === colCount - 1) {
        if (left <= remaining[colIndex]) {
          table[rowIndex][colIndex] = left;
          remaining[colIndex] -= left;
          visit(rowIndex + 1);
          remaining[colIndex] += left;
          table[rowIndex][colIndex] = 0;
        }
        return;
      }
      const maximum = Math.min(left, remaining[colIndex]);
      for (let value = 0; value <= maximum; value++) {
        table[rowIndex][colIndex] = value;
        remaining[colIndex] -= value;
        distribute(colIndex + 1, left - value);
        remaining[colIndex] += value;
        if (aborted) return;
      }
      table[rowIndex][colIndex] = 0;
    };

    distribute(0, rowTotals[rowIndex]);
  };

  visit(0);

  if (aborted || count === 0 || !Number.isFinite(logTotal)) return null;
  return {
    tables: count,
    statistic: observedStatistic,
    p: Math.min(1, Math.max(0, Math.exp(logTail - logTotal))),
  };
};

export interface ExactOptions {
  simulations?: number;
  seed?: number;
  budget?: number;
}

/** Exact p-value: Fisher for 2×2, fixed-margin enumeration or Monte Carlo for R×C. */
export const exactContingency = (
  observed: number[][],
  options: ExactOptions = {}
): ExactContingencyResult => {
  if (!isRectangular(observed)) {
    return {
      method: 'unavailable',
      statistic: NaN,
      df: NaN,
      p: NaN,
      reason: 'The exact test needs a rectangular table with at least two rows and two columns',
    };
  }
  if (!observed.every(row => row.every(value => Number.isInteger(value)))) {
    return {
      method: 'unavailable',
      statistic: NaN,
      df: NaN,
      p: NaN,
      reason: 'The exact test needs integer frequencies',
    };
  }

  const statistic = absoluteDeviation(observed);
  if (observed.length === 2 && observed[0].length === 2) {
    const [a, b, c, d] = observed.flat();
    return {
      method: 'fisher',
      statistic,
      df: 1,
      p: calcFisherExact(a, b, c, d),
    };
  }

  const budget = options.budget ?? 200000;
  const enumerated = enumerateExact(observed, budget);
  if (enumerated) {
    return {
      method: 'enumeration',
      statistic: enumerated.statistic,
      df: (observed.length - 1) * (observed[0].length - 1),
      p: enumerated.p,
      tables: enumerated.tables,
    };
  }

  const simulations = options.simulations ?? 10000;
  const simulated = simulateFixedMarginAbsoluteDeviation(
    observed,
    simulations,
    options.seed ?? 20240517
  );
  const atLeast = simulated.filter(value => value >= statistic - EPS).length;
  return {
    method: 'monteCarlo',
    statistic,
    df: (observed.length - 1) * (observed[0].length - 1),
    p: (1 + atLeast) / (simulated.length + 1),
    simulations,
  };
};

export interface MantelHaenszelOptions {
  correct?: boolean;
  level?: number;
}

/** Mantel–Haenszel pooled odds ratio and chi-square test across 2×2 strata. */
export const mantelHaenszel = (
  strata: ContingencyStratumInput[],
  options: MantelHaenszelOptions = {}
): MantelHaenszelResult | null => {
  const correct = options.correct ?? true;
  const level = options.level ?? 95;
  const z = zCrit(level);

  const usable = strata
    .map((stratum, index) => {
      const rows = stratum.observed;
      if (!Array.isArray(rows) || rows.length !== 2) return null;
      if (!rows.every(row => Array.isArray(row) && row.length === 2)) return null;
      const [a, b] = rows[0];
      const [c, d] = rows[1];
      if (![a, b, c, d].every(value => Number.isFinite(value) && value >= 0)) return null;
      const total = a + b + c + d;
      if (total <= 0) return null;
      return {
        label: stratum.label?.trim() || `Stratum ${index + 1}`,
        a,
        b,
        c,
        d,
        total,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (usable.length === 0) return null;

  const prepared = usable.map(entry => {
    const zeroCell = entry.a === 0 || entry.b === 0 || entry.c === 0 || entry.d === 0;
    const shift = zeroCell ? 0.5 : 0;
    const a = entry.a + shift;
    const b = entry.b + shift;
    const c = entry.c + shift;
    const d = entry.d + shift;
    const n = entry.total + (zeroCell ? 2 : 0);
    return { entry, a, b, c, d, n, zeroCell };
  });

  let sDiag = 0;
  let sOff = 0;
  let delta = 0;
  let varianceSum = 0;
  let term1 = 0;
  let term2 = 0;
  let term3 = 0;

  const rows: MantelHaenszelStratumResult[] = prepared.map(({ entry, a, b, c, d, n, zeroCell }) => {
    const oddsRatio = (a * d) / (b * c);
    const standardError = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
    const logOddsRatio = Math.log(oddsRatio);
    sDiag += (a * d) / n;
    sOff += (b * c) / n;
    delta += a - ((a + b) * (a + c)) / n;
    if (n > 1) {
      varianceSum +=
        ((a + b) * (c + d) * (a + c) * (b + d)) / (n * n * (n - 1));
    }
    term1 += ((a + d) * a * d) / (n * n);
    term2 += ((a + d) * b * c + (b + c) * a * d) / (n * n);
    term3 += ((b + c) * b * c) / (n * n);
    return {
      label: entry.label,
      a: entry.a,
      b: entry.b,
      c: entry.c,
      d: entry.d,
      n: entry.total,
      oddsRatio,
      logOddsRatio,
      standardError,
      lo: logOddsRatio - z * standardError,
      hi: logOddsRatio + z * standardError,
      weight: (b * c) / n,
      corrected: zeroCell,
    };
  });

  const oddsRatio = sDiag / sOff;
  const logOddsRatio = Math.log(oddsRatio);
  const standardError = Math.sqrt(
    term1 / (2 * sDiag * sDiag) +
      term2 / (2 * sDiag * sOff) +
      term3 / (2 * sOff * sOff)
  );
  const yates = correct && Math.abs(delta) >= 0.5 ? 0.5 : 0;
  const chi2 =
    varianceSum > 0 ? Math.pow(Math.abs(delta) - yates, 2) / varianceSum : NaN;
  const p = chi2SF(chi2, 1);

  return {
    oddsRatio,
    logOddsRatio,
    standardError,
    lo: logOddsRatio - z * standardError,
    hi: logOddsRatio + z * standardError,
    chi2,
    df: 1,
    p,
    strata: rows,
    usedStrata: rows.length,
    corrected: prepared.some(entry => entry.zeroCell),
  };
};

/**
 * Cochran–Armitage trend test on an R×2 table, equivalent to
 * `prop.trend.test(x = observed[, 1], n = rowSums(observed), score)`.
 */
export const cochranArmitageTrend = (
  observed: number[][],
  scores: number[]
): TrendResult | null => {
  if (!isRectangular(observed) || observed[0].length !== 2) return null;
  if (scores.length !== observed.length || scores.some(value => !Number.isFinite(value))) {
    return null;
  }

  const rows = observed.map(row => {
    const successes = row[0];
    const total = row[0] + row[1];
    return {
      successes,
      total,
      proportion: total > 0 ? successes / total : NaN,
    };
  });
  const n = rows.reduce((sum, row) => sum + row.total, 0);
  if (!(n > 0)) return null;
  const successes = rows.reduce((sum, row) => sum + row.successes, 0);
  const overall = successes / n;
  const weightedScore = rows.reduce((sum, row, index) => sum + row.total * scores[index], 0) / n;
  const sx = rows.reduce(
    (sum, row, index) => sum + row.successes * (scores[index] - weightedScore),
    0
  );
  const sxx = rows.reduce(
    (sum, row, index) => sum + row.total * Math.pow(scores[index] - weightedScore, 2),
    0
  );
  const variance = overall * (1 - overall) * sxx;
  const statistic = variance > 0 ? (sx * sx) / variance : NaN;

  return {
    statistic,
    df: 1,
    p: chi2SF(statistic, 1),
    overall,
    scores: [...scores],
    rows,
  };
};
