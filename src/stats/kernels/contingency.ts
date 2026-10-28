import { mulberry32 } from '../distributions';

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

