import test from 'node:test';
import assert from 'node:assert/strict';
import { blandAltmanStats, iccStats, kappaStats } from './agreement';

const close = (actual: number, expected: number, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);

test('ICC is 1 when measurements agree exactly', () => {
  const rows = [['10', '10'], ['20', '20'], ['30', '30'], ['40', '40']];
  const stats = iccStats(rows, [0, 1]);
  assert.ok(stats);
  if (!stats) return;
  close(stats.icc11, 1);
  close(stats.icc21, 1);
  close(stats.icc31, 1);
});

test('Bland–Altman returns bias and limits of agreement', () => {
  const stats = blandAltmanStats(
    [['10', '10'], ['20', '22'], ['30', '29'], ['40', '41'], ['50', '50']],
    0,
    1,
    95
  );
  assert.ok(stats);
  if (!stats) return;
  close(stats.bias, -0.4);
  assert.ok(stats.loaLower < stats.bias && stats.loaUpper > stats.bias);
  assert.ok(Number.isFinite(stats.slopeP));
});

test('Cohen kappa matches the classic 2x2 example', () => {
  const rows: string[][] = [];
  // [[20, 5], [10, 15]] -> po 0.7, pe 0.5, kappa 0.4
  for (let i = 0; i < 20; i++) rows.push(['A', 'A']);
  for (let i = 0; i < 5; i++) rows.push(['A', 'B']);
  for (let i = 0; i < 10; i++) rows.push(['B', 'A']);
  for (let i = 0; i < 15; i++) rows.push(['B', 'B']);
  const stats = kappaStats(rows, [0, 1], 'none', 95);
  assert.ok(stats);
  if (!stats) return;
  close(stats.po, 0.7);
  close(stats.pe, 0.5);
  close(stats.kappa, 0.4);
});

test('Fleiss kappa is 1 with unanimous raters', () => {
  const rows = [['A', 'A', 'A'], ['B', 'B', 'B'], ['A', 'A', 'A']];
  const stats = kappaStats(rows, [0, 1, 2], 'none', 95);
  assert.ok(stats);
  if (!stats) return;
  close(stats.kappa, 1);
});

test('agreement procedures reject insufficient data', () => {
  assert.equal(iccStats([['1', '2']], [0, 1]), null);
  assert.equal(blandAltmanStats([['1', '2'], ['3', '4']], 0, 1, 95), null);
  assert.equal(kappaStats([['A', 'A']], [0, 1]), null);
});
