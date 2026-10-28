import test from 'node:test';
import assert from 'node:assert/strict';
import { miStats } from './mi';

test('MI returns the observed mean and SD when nothing is missing', () => {
  const rows = [['1', '2'], ['2', '4'], ['3', '6'], ['4', '8'], ['5', '10']];
  const stats = miStats({ rows, variables: [0, 1], imputations: 3, iterations: 2, level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.variables[0].missing, 0);
  assert.ok(Math.abs(stats.variables[0].mean - 3) < 1e-9);
  assert.ok(Math.abs(stats.variables[0].sd - Math.sqrt(2.5)) < 1e-6);
  assert.ok(stats.variables[0].fmi < 1e-9);
});

test('MI imputes missing cells and pools means', () => {
  const rows = [
    ['1', '2'], ['2', ''], ['3', '6'], ['', '8'], ['5', '10'], ['6', '12'],
  ];
  const stats = miStats({ rows, variables: [0, 1], imputations: 5, iterations: 5, level: 95 });
  assert.ok(stats);
  if (!stats) return;
  assert.equal(stats.variables[0].missing, 1);
  assert.equal(stats.variables[1].missing, 1);
  for (const variable of stats.variables) {
    assert.ok(Number.isFinite(variable.mean));
    assert.ok(Number.isFinite(variable.sd));
    assert.ok(variable.lo < variable.mean && variable.mean < variable.hi);
  }
});

test('MI rejects variables with fewer than two observations', () => {
  assert.equal(
    miStats({ rows: [['1', ''], ['', '']], variables: [0, 1], imputations: 3, iterations: 2, level: 95 }),
    null
  );
});
