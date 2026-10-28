import test from 'node:test';
import assert from 'node:assert/strict';
import { ordinalStats } from './ordinal';

const rows = [
  ['1', '-0.962'], ['3', '-0.293'], ['1', '0.259'], ['1', '-1.152'],
  ['3', '0.196'], ['3', '0.030'], ['3', '0.085'], ['3', '1.117'],
  ['1', '-1.219'], ['2', '1.267'], ['1', '-0.745'], ['1', '-1.131'],
  ['3', '-0.716'], ['1', '0.253'], ['3', '0.152'], ['1', '-0.308'],
  ['2', '-0.953'], ['1', '-0.648'], ['3', '1.224'], ['2', '0.200'],
  ['1', '-0.578'], ['1', '-0.942'], ['3', '-0.204'], ['2', '-1.666'],
];

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('ordinal logistic matches ordinal::clm', () => {
  const stats = ordinalStats({ rows, depIdx: 0, indepIdxs: [1], level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.categories.length, 3);
  close(stats.coefficients[0].beta, 1.16501090, 1e-5);
  close(stats.coefficients[0].se, 0.55847194, 1e-5);
  close(stats.thresholds[0].alpha, -0.55886927, 1e-5);
  close(stats.thresholds[1].alpha, 0.26982855, 1e-5);
  close(stats.thresholds[0].se, 0.48738912, 1e-4);
  close(stats.thresholds[1].se, 0.47359939, 1e-4);
  close(stats.logLik, -21.95366302, 1e-4);
  close(stats.aic, 49.90732604, 1e-4);
});

test('ordinal logistic rejects too few categories or variables', () => {
  const binary = rows.map(row => [String(Number(row[0]) <= 2 ? 1 : 2), row[1]]);
  assert.equal(ordinalStats({ rows: binary, depIdx: 0, indepIdxs: [1], level: 95 }), null);
  assert.equal(ordinalStats({ rows, depIdx: 0, indepIdxs: [], level: 95 }), null);
});
