import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMiOutput } from './run';

const grid = {
  cols: [
    { name: 'X', type: 'num' as const },
    { name: 'Y', type: 'num' as const },
  ],
  rows: [
    ['1', '2'],
    ['', '3'],
    ['3', ''],
    ['4', '5'],
    ['', '6'],
    ['6', '7'],
  ],
};

const base = {
  grid,
  params: {
    variables: [0, 1],
    imputations: 3,
    iterations: 2,
    model: 'descriptives' as const,
    outcome: 0,
    predictors: [1],
  },
  ciLevel: 95,
};

test('multiple imputation rejects non-finite imputations and iterations', () => {
  const badImputations = buildMiOutput({
    ...base,
    params: { ...base.params, imputations: Number.NaN },
  });
  assert.ok('reason' in badImputations);
  if ('reason' in badImputations) assert.match(badImputations.reason, /Imputations/);

  const badIterations = buildMiOutput({
    ...base,
    params: { ...base.params, iterations: Number.NaN },
  });
  assert.ok('reason' in badIterations);
  if ('reason' in badIterations) assert.match(badIterations.reason, /Iterations/);
});

test('multiple imputation still runs with finite settings', () => {
  const result = buildMiOutput(base);
  assert.ok('ok' in result && result.ok);
  if ('ok' in result && result.ok) assert.ok(result.tables.length > 0);
});
