import test from 'node:test';
import assert from 'node:assert/strict';
import { lmmStats } from './lmm';

const rows = [
  ['2.8890', '2.287', '1'], ['1.3742', '-1.197', '1'], ['1.5615', '-0.694', '1'], ['1.0726', '-0.412', '1'],
  ['0.9683', '-0.971', '2'], ['0.7424', '-0.947', '2'], ['2.2258', '0.748', '2'], ['1.5500', '-0.117', '2'],
  ['2.0899', '0.153', '3'], ['2.9716', '2.190', '3'], ['1.9984', '0.357', '3'], ['3.8023', '2.717', '3'],
  ['0.5881', '2.281', '4'], ['-0.0053', '0.324', '4'], ['0.9636', '1.896', '4'], ['0.6110', '0.468', '4'],
  ['1.2916', '-0.894', '5'], ['1.7507', '-0.307', '5'], ['1.4912', '-0.005', '5'], ['2.3559', '0.988', '5'],
];

const close = (actual: number, expected: number, tolerance = 1e-4) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('random-intercept LMM matches lme4 REML estimates', () => {
  const stats = lmmStats({ rows, depIdx: 0, indepIdxs: [1], groupIdx: 2, level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.groups, 5);
  close(stats.coefficients[0].beta, 1.3856922, 1e-4);
  close(stats.coefficients[1].beta, 0.5165206, 1e-4);
  close(stats.coefficients[0].se, 0.381720094, 1e-5);
  close(stats.coefficients[1].se, 0.068794778, 1e-6);
  close(Math.sqrt(stats.sigmaU2), 0.83720470, 1e-4);
  close(Math.sqrt(stats.sigmaE2), 0.30325068, 1e-4);
  assert.ok(stats.icc > 0 && stats.icc < 1);
});

test('LMM rejects designs without groups or predictors', () => {
  const noGroups = lmmStats({ rows: [['1', '1', 'A'], ['2', '2', 'A']], depIdx: 0, indepIdxs: [1], groupIdx: 2, level: 95 });
  assert.equal(noGroups, null);
  assert.equal(lmmStats({ rows, depIdx: 0, indepIdxs: [], groupIdx: 2, level: 95 }), null);
});
