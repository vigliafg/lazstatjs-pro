import test from 'node:test';
import assert from 'node:assert/strict';
import { anovaStats } from './anova';

const close = (actual: number, expected: number, tolerance = 1e-4) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const rowsOf = (groups: number[][]) =>
  groups.flatMap((values, index) => values.map(value => [`G${index + 1}`, String(value)]));

const GROUPS = [
  [10.1, 9.8, 10.5, 10.2, 9.9],
  [12.0, 12.6, 11.4, 12.2, 12.9],
  [8.4, 8.1, 8.9, 8.3, 8.6],
];

const base = {
  rows: rowsOf(GROUPS),
  depIdx: 1,
  grpIdx: 0,
  posthoc: 'none' as const,
  kwPosthoc: 'none' as const,
  level: 95,
  useNonParam: false,
};

test('Bartlett matches R bartlett.test on three groups', () => {
  const stats = anovaStats(base);
  assert.ok(stats);
  const row = stats!.assumptions.find(item => item.kind === 'bartlett');
  assert.ok(row);
  // R 4.5.2: bartlett.test(list(g1, g2, g3)) -> 2.493953, df 2, p 0.2873723
  close(row!.statistic, 2.493953, 1e-5);
  assert.equal(row!.df1, 2);
  close(row!.p, 0.2873723, 1e-6);
});

test("O'Brien compares the spread of the groups on transformed deviations", () => {
  const stats = anovaStats(base);
  assert.ok(stats);
  const row = stats!.assumptions.find(item => item.kind === 'obrien');
  assert.ok(row);
  // R 4.5.2: anova(lm(r ~ g)) on the O'Brien transform -> F 1.522218, p 0.2575325
  close(row!.statistic, 1.522218, 1e-5);
  close(row!.p, 0.2575325, 1e-6);
  assert.equal(row!.df1, 2);
  assert.equal(row!.df2, 12);
});

test('Steel–Dwass with two groups equals the Mann–Whitney normal approximation', () => {
  const left = [1, 2, 4, 6, 8, 10, 12, 14];
  const right = [20, 22, 24, 26, 28, 30, 32, 34];
  const stats = anovaStats({
    ...base,
    rows: [...left.map(value => ['A', String(value)]), ...right.map(value => ['B', String(value)])],
    posthoc: 'steeldwass',
  });
  assert.ok(stats);
  const pair = stats!.posthocPairs?.[0];
  assert.ok(pair);
  // R 4.5.2: wilcox.test(left, right, exact = FALSE, correct = FALSE) -> p 0.0007775304
  // Steel–Dwass uses the z statistic without Yates' continuity correction.
  close(pair!.pRaw, 0.0007775304, 1e-8);
  close(pair!.pAdj, 0.0007775304, 1e-8);
});

test('Steel–Dwass keeps the family-wise error below the raw p for three groups', () => {
  const stats = anovaStats({ ...base, posthoc: 'steeldwass' });
  assert.ok(stats);
  const pairs = stats!.posthocPairs ?? [];
  assert.equal(pairs.length, 3);
  assert.ok(pairs.every(pair => pair.pAdj >= pair.pRaw));
  assert.ok(pairs.every(pair => pair.pAdj <= 1));
});
