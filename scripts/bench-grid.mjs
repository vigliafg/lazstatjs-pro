import { performance } from 'node:perf_hooks';
import { recalculateFormulas } from '../src/grid/formulas.ts';

const makeGrid = (rows) => ({
  cols: [
    { id: 'pre', name: 'Pre', type: 'num' },
    { id: 'post', name: 'Post', type: 'num' },
    { id: 'diff', name: 'Diff', type: 'num', formula: 'Post - Pre' },
    { id: 'extra', name: 'Extra', type: 'num' },
  ],
  rows: Array.from({ length: rows }, (_, r) => [
    String(r % 100),
    String((r * 2) % 100),
    '',
    String(r % 7),
  ]),
});

for (const rows of [5_000, 50_000]) {
  const base = makeGrid(rows);
  const independent = {
    cols: base.cols,
    rows: base.rows.map((row, index) => (index === 0 ? [row[0], row[1], row[2], '99'] : row)),
  };
  const dependent = {
    cols: base.cols,
    rows: base.rows.map((row, index) => (index === 0 ? ['99', row[1], row[2], row[3]] : row)),
  };

  for (const [label, grid, changedCol] of [
    ['independent (not referenced)', independent, 3],
    ['dependent (referenced)', dependent, 0],
  ]) {
    const start = performance.now();
    recalculateFormulas(grid, changedCol);
    const ms = performance.now() - start;
    console.log(`${rows.toLocaleString()} rows · ${label}: ${ms.toFixed(1)} ms`);
  }
}
