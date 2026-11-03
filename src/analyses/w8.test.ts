import test from 'node:test';
import assert from 'node:assert/strict';
import { buildQualityOutput } from './quality/run';
import { buildDoeOutput } from './doe/run';
import { buildSampleSizeOutput } from './samplesize/run';
import { DEFAULT_PARAMS } from '../io/project';
import type { AnalysisRunResult } from './types';
import type { GridData } from '../grid/types';

const chartsOf = (result: AnalysisRunResult) => (result.ok ? result.charts ?? [] : []);

const qualityGrid: GridData = {
  cols: [
    { id: 'measurement', name: 'Measurement', type: 'num' },
    { id: 'part', name: 'Part', type: 'cat' },
    { id: 'operator', name: 'Operator', type: 'cat' },
    { id: 'length', name: 'Length', type: 'num' },
    { id: 'width', name: 'Width', type: 'num' },
  ],
  rows: (() => {
    const rows: string[][] = [];
    for (let part = 1; part <= 4; part += 1) {
      for (const operator of ['A', 'B', 'C']) {
        for (let rep = 0; rep < 2; rep += 1) {
          const shift = operator === 'A' ? 0 : operator === 'B' ? 0.2 : -0.1;
          const shock = part === 3 ? 1.5 : 0;
          rows.push([
            String(10 + part + shift + rep * 0.1 + shock),
            `P${part}`,
            operator,
            String(10 + part + shift + rep * 0.1 + shock),
            String(5 + part * 0.5 + shift + rep * 0.05),
          ]);
        }
      }
    }
    return rows;
  })(),
};

const doeGrid: GridData = {
  cols: [
    { id: 'y', name: 'Y', type: 'num' },
    { id: 'a', name: 'A', type: 'num' },
    { id: 'b', name: 'B', type: 'num' },
    { id: 'c', name: 'C', type: 'num' },
  ],
  rows: Array.from({ length: 20 }, (_, index) =>
    [
      10 + (index % 2) * 2 + ((index >> 1) % 2) * 3 + (index % 3),
      (index % 2) * 2 - 1,
      ((index >> 1) % 2) * 2 - 1,
      (index % 3) - 1,
    ].map(String)
  ),
};

test('quality wave 8 modes emit their charts, tables and reports', () => {
  const msa = buildQualityOutput({
    grid: qualityGrid,
    params: {
      ...DEFAULT_PARAMS.quality,
      mode: 'msa',
      variable: 0,
      part: 1,
      operator: 2,
    },
    ciLevel: 95,
  });
  assert.ok(msa.ok);
  assert.equal(chartsOf(msa)[0].id, 'msa-variance');
  assert.equal(chartsOf(msa)[0].kind, 'bar');
  assert.ok(msa.ok && msa.tables.some(table => table.id === 'msa-variance'));
  assert.ok(msa.ok && msa.report?.id === 'quality-msa');

  const acceptance = buildQualityOutput({
    grid: qualityGrid,
    params: {
      ...DEFAULT_PARAMS.quality,
      mode: 'acceptance',
      planN: 50,
      planC: 2,
      lotSize: 500,
    },
    ciLevel: 95,
  });
  assert.ok(acceptance.ok);
  assert.deepEqual(chartsOf(acceptance).map(chart => chart.id), ['accept-oc', 'accept-aoq']);
  assert.ok(acceptance.ok && acceptance.report?.id === 'quality-acceptance');

  const mcontrol = buildQualityOutput({
    grid: qualityGrid,
    params: {
      ...DEFAULT_PARAMS.quality,
      mode: 'mcontrol',
      variables: [0, 4],
      subgroup: 2,
    },
    ciLevel: 95,
  });
  assert.ok(mcontrol.ok);
  assert.equal(chartsOf(mcontrol)[0].id, 'mcontrol-chart');
  assert.equal(chartsOf(mcontrol)[0].kind, 'line');
});

test('the DOE design builder returns the matrix, summary and map', () => {
  const design = buildDoeOutput({
    grid: doeGrid,
    params: {
      ...DEFAULT_PARAMS.doe,
      mode: 'design',
      designType: 'ccd',
      factors: 3,
      centerPoints: 3,
    },
    ciLevel: 95,
  });
  assert.ok(design.ok);
  assert.equal(chartsOf(design)[0].id, 'doe-design-map');
  assert.equal(chartsOf(design)[0].kind, 'scatter');
  assert.ok(design.ok && design.tables.some(table => table.id === 'doe-design-matrix'));
  assert.ok(design.ok && design.report?.id === 'doe-design');
});

test('the new sample-size designs produce a full plan and a sensitivity curve', () => {
  for (const overrides of [
    { design: 'regression' as const, predictors: 3, f2: 0.15 },
    { design: 'logistic' as const, p1: 0.3, oddsRatio: 2 },
  ]) {
    const result = buildSampleSizeOutput({ ...DEFAULT_PARAMS.samplesize, ...overrides });
    assert.ok(result.ok, overrides.design);
    assert.ok(result.ok && result.tables.some(table => table.id === 'ss-result'));
    assert.ok(result.ok && result.tables.some(table => table.id === 'ss-curve'));
    assert.ok(chartsOf(result).some(chart => chart.id === 'samplesize-sensitivity'));
  }
});
