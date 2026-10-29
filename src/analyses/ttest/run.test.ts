import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTTestOutput } from './run';

const grid = {
  cols: [{ name: 'X', type: 'num' as const }],
  rows: [['1'], ['2'], ['3'], ['4'], ['5']],
};

const base = {
  grid,
  ttestParams: {
    type: 'one' as const,
    var1: 0,
    var2: 0,
    mu: 0,
    useNonParam: false,
    equalVar: true,
  },
  ciLevel: 95,
};

test('one-sample t-test rejects a non-finite test mean', () => {
  for (const mu of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    const result = buildTTestOutput({ ...base, ttestParams: { ...base.ttestParams, mu } });
    assert.ok('reason' in result);
    if ('reason' in result) assert.match(result.reason, /finite number/);
  }
});

test('one-sample t-test still runs with a finite test mean', () => {
  const result = buildTTestOutput(base);
  assert.ok('ok' in result && result.ok);
  if ('ok' in result && result.ok) assert.ok(result.tables.length > 0);
});
