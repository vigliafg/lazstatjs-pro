import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStratifiedCoxOutput } from './run';

const grid = {
  cols: [
    { name: 'T', type: 'num' as const },
    { name: 'E', type: 'int' as const },
    { name: 'S', type: 'cat' as const },
    { name: 'X', type: 'num' as const },
  ],
  rows: [
    ['1', '1', 'A', '0.5'],
    ['2', '0', 'A', '1.2'],
    ['3', '1', 'B', '0.8'],
    ['4', '0', 'B', '1.5'],
  ],
};

const base = {
  grid,
  params: { time: 0, event: 1, covariates: [3], stratum: 2 },
  ciLevel: 95,
};

test('stratified Cox rejects time and event as covariates', () => {
  for (const covariate of [0, 1]) {
    const result = buildStratifiedCoxOutput({
      ...base,
      params: { ...base.params, covariates: [3, covariate] },
    });
    assert.ok('reason' in result);
    if ('reason' in result) assert.match(result.reason, /Time and event columns cannot be covariates/);
  }
});

test('stratified Cox still rejects the stratum as a covariate', () => {
  const result = buildStratifiedCoxOutput({
    ...base,
    params: { ...base.params, covariates: [3, 2] },
  });
  assert.ok('reason' in result);
  if ('reason' in result) assert.match(result.reason, /stratum cannot also be a covariate/);
});
