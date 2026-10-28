import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNonParamOutput } from './run';

const grid = {
  cols: [
    { name: 'C1', type: 'num' as const },
    { name: 'C2', type: 'num' as const },
    { name: 'C3', type: 'num' as const },
    { name: 'B1', type: 'int' as const },
    { name: 'B2', type: 'int' as const },
  ],
  rows: [
    ['10', '12', '14', '0', '1'],
    ['11', '13', '15', '1', '1'],
    ['9', '11', '13', '0', '0'],
    ['10', '12', '14', '1', '0'],
    ['11', '13', '15', '0', '1'],
    ['8', '10', '12', '1', '0'],
  ],
};

const params = {
  mode: 'friedman' as const,
  selected: [0, 1, 2],
  left: 3,
  right: 4,
  outcome: 0,
  group: 3,
};

const base = { grid, params, ciLevel: 95 };

test('non-parametric builder runs Friedman and returns tables plus a report', () => {
  const result = buildNonParamOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
});

test('non-parametric builder dispatches to each mode validation', () => {
  const samePair = buildNonParamOutput({
    ...base,
    params: { ...params, mode: 'mcnemar', left: 3, right: 3 },
  });
  assert.ok('reason' in samePair);
  if ('reason' in samePair) assert.match(samePair.reason, /two different binary columns/);

  const notBinary = buildNonParamOutput({ ...base, params: { ...params, mode: 'cochran' } });
  assert.ok('reason' in notBinary);
  if ('reason' in notBinary) assert.match(notBinary.reason, /binary columns/);

  const sameOutcome = buildNonParamOutput({
    ...base,
    params: { ...params, mode: 'jonckheere', outcome: 3, group: 3 },
  });
  assert.ok('reason' in sameOutcome);
  if ('reason' in sameOutcome) assert.match(sameOutcome.reason, /must be different/);
});
