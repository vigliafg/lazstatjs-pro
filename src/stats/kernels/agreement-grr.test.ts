import test from 'node:test';
import assert from 'node:assert/strict';
import { iccStats } from './agreement';

const close = (actual: number, expected: number, tolerance = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

const DATA = [
  [10, 10.2, 10.1],
  [12, 12.4, 12.2],
  [9.5, 9.4, 9.6],
  [11, 11.5, 11.2],
  [13, 13.3, 13.1],
  [8, 8.3, 8.1],
];
const rows = DATA.map(row => row.map(value => String(value)) as string[]);

test('Gage R&R components match the AIAG formulas computed in R', () => {
  const stats = iccStats(rows, [0, 1, 2]);
  assert.ok(stats);
  // R 4.5.2: anova(aov(v ~ subj + rater)); EV = sqrt(MSE), AV = sqrt((MSR - MSE)/n),
  // PV = sqrt((MSB - MSE)/k), GRR = sqrt(EV^2 + AV^2), TV = sqrt(GRR^2 + PV^2).
  close(stats!.ev, 0.1125462868, 1e-8);
  close(stats!.av, 0.1251665557, 1e-8);
  close(stats!.pv, 1.8341513327, 1e-8);
  close(stats!.grr, 0.1683250823, 1e-8);
  close(stats!.tv, 1.8418589643, 1e-8);
  close(stats!.pctGrr, 9.1388692385, 1e-6);
});

test('ndc is the truncated number of distinct categories', () => {
  const stats = iccStats(rows, [0, 1, 2]);
  assert.ok(stats);
  assert.equal(stats!.ndc, Math.floor(1.41 * (stats!.pv / stats!.grr)));
  assert.ok(stats!.pctGrr > 0 && stats!.pctGrr < 100);
});
