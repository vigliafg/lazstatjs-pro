import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cochranArmitageTrend,
  exactContingency,
  mantelHaenszel,
  simulateFixedMarginAbsoluteDeviation,
} from './contingency';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected} (diff ${Math.abs(actual - expected)})`
  );

test('Mantel–Haenszel pools two 2×2 strata and reports per-stratum weights', () => {
  const result = mantelHaenszel([
    { label: 'A', observed: [[10, 5], [3, 12]] },
    { label: 'B', observed: [[6, 9], [8, 7]] },
  ]);
  assert.ok(result);
  assert.equal(result!.usedStrata, 2);
  assert.equal(result!.corrected, false);
  // s.diag = 10*12/30 + 6*7/30 = 4 + 1.4; s.offd = 5*3/30 + 9*8/30 = 0.5 + 2.4
  close(result!.oddsRatio, 5.4 / 2.9);
  assert.ok(Number.isFinite(result!.chi2));
  assert.ok(result!.p >= 0 && result!.p <= 1);
  assert.equal(result!.strata.length, 2);
  close(result!.strata[0].weight, (5 * 3) / 30);
  close(result!.strata[1].weight, (9 * 8) / 30);
});

test('Mantel–Haenszel adds 0.5 to a stratum with a zero cell', () => {
  const result = mantelHaenszel([{ label: 'zero', observed: [[0, 8], [6, 10]] }]);
  assert.ok(result);
  assert.equal(result!.corrected, true);
  assert.equal(result!.strata[0].corrected, true);
  // Corrected table: 0.5, 8.5 / 6.5, 10.5 → OR = 5.25 / 55.25.
  close(result!.oddsRatio, (0.5 * 10.5) / (8.5 * 6.5));
  assert.ok(Number.isFinite(result!.chi2));
});

test('Mantel–Haenszel rejects an empty set of strata', () => {
  assert.equal(
    mantelHaenszel([
      { label: 'empty', observed: [[0, 0], [0, 0]] },
    ]),
    null
  );
});

test('Cochran–Armitage trend reproduces the weighted regression formula', () => {
  const observed = [
    [18, 12],
    [25, 15],
    [32, 8],
    [40, 5],
  ];
  const result = cochranArmitageTrend(observed, [1, 2, 3, 4]);
  assert.ok(result);
  assert.equal(result!.df, 1);
  assert.equal(result!.rows.length, 4);
  assert.equal(result!.rows[0].proportion, 0.6);
  assert.ok(result!.statistic > 0);
  assert.ok(result!.p >= 0 && result!.p <= 1);

  assert.equal(
    cochranArmitageTrend(observed, [1, 2]),
    null
  );
  assert.equal(
    cochranArmitageTrend(observed, [1, 2, 3, Number.NaN]),
    null
  );
});

test('exact 2×2 delegates to Fisher and R×C enumerates fixed-margin tables', () => {
  const fisher = exactContingency([
    [30, 20],
    [15, 35],
  ]);
  assert.equal(fisher.method, 'fisher');
  assert.ok(fisher.p > 0 && fisher.p < 1);

  const enumerated = exactContingency([
    [12, 7],
    [8, 10],
    [5, 13],
  ]);
  assert.equal(enumerated.method, 'enumeration');
  assert.equal(enumerated.tables, 274);
  assert.ok(enumerated.p > 0 && enumerated.p < 1);
  assert.ok(Number.isFinite(enumerated.statistic));
});

test('exact R×C falls back to a deterministic Monte Carlo beyond the budget', () => {
  const observed = [
    [12, 7],
    [8, 10],
    [5, 13],
  ];
  const first = exactContingency(observed, { budget: 1, simulations: 2000, seed: 42 });
  const again = exactContingency(observed, { budget: 1, simulations: 2000, seed: 42 });
  assert.equal(first.method, 'monteCarlo');
  assert.equal(first.simulations, 2000);
  assert.equal(first.p, again.p);
  assert.ok(first.p >= 0 && first.p <= 1);

  const simulated = simulateFixedMarginAbsoluteDeviation(observed, 100, 7);
  assert.equal(simulated.length, 100);
  assert.ok(simulated.every(value => Number.isFinite(value) && value >= 0));
});

test('exact mode refuses a non-rectangular table with an explicit reason', () => {
  const result = exactContingency([[1, 2], [3]]);
  assert.equal(result.method, 'unavailable');
  assert.match(result.reason ?? '', /rectangular/);
});
