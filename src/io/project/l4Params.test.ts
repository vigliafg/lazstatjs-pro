import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS, parseParams } from './index';

test('L4 parameters parse, clamp and fall back safely', () => {
  const parsed = parseParams(
    {
      partition: { response: 0, predictors: [1, 2, 99], maxDepth: 99, minSplit: 1 },
      quality: {
        mode: 'capability',
        variable: 0,
        category: 1,
        group: -1,
        chart: 'ewma',
        subgroup: 99,
        lsl: 1,
        usl: 9,
        target: 5,
      },
      cluster: { selected: [0, 1], method: 'ward', clusters: 4, standardize: false },
      discriminant: { mode: 'classic', group: 2, predictors: [0, 1], covariates: [] },
      doe: { response: 0, factorA: 1, factorB: 2, model: 'linear' },
    },
    3
  );
  assert.deepEqual(parsed.partition, { response: 0, predictors: [1, 2], maxDepth: 6, minSplit: 2 });
  assert.equal(parsed.quality.mode, 'capability');
  assert.equal(parsed.quality.chart, 'ewma');
  assert.equal(parsed.quality.subgroup, 10);
  assert.equal(parsed.cluster.method, 'ward');
  assert.equal(parsed.cluster.clusters, 4);
  assert.equal(parsed.cluster.standardize, false);
  assert.deepEqual(parsed.discriminant, { mode: 'classic', group: 2, predictors: [0, 1], covariates: [] });
  assert.equal(parsed.doe.model, 'linear');
});

test('invalid L4 enums fall back to the stored defaults', () => {
  const parsed = parseParams(
    {
      quality: { mode: 'nope', chart: 'nope' },
      cluster: { method: 'nope' },
      doe: { model: 'nope' },
    },
    4
  );
  assert.equal(parsed.quality.mode, DEFAULT_PARAMS.quality.mode);
  assert.equal(parsed.quality.chart, DEFAULT_PARAMS.quality.chart);
  assert.equal(parsed.cluster.method, DEFAULT_PARAMS.cluster.method);
  assert.equal(parsed.doe.model, DEFAULT_PARAMS.doe.model);
});
