import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from '../../charts/vega/buildSpec';
import { DEFAULT_PARAMS } from '../../io/project';
import { buildQualityOutput } from './run';

/** Balanced crossed Gage R&R: 3 parts × 2 operators × 2 replicates. */
const values = [10.1, 10.2, 10.3, 10.2, 10.2, 10.3, 10.4, 10.3, 10.2, 10.4, 10.5, 10.4];
const grid = {
  cols: [
    { name: 'Y', type: 'num' as const },
    { name: 'Part', type: 'cat' as const },
    { name: 'Operator', type: 'cat' as const },
  ],
  rows: values.map((value, index) => [
    String(value),
    `P${Math.floor(index / 4) + 1}`,
    index % 2 === 0 ? 'O1' : 'O2',
  ]),
};

test('quality emits the part by operator profile for the MSA mode', () => {
  const result = buildQualityOutput({
    grid,
    params: { ...DEFAULT_PARAMS.quality, mode: 'msa', variable: 0, part: 1, operator: 2 },
    ciLevel: 95,
  });
  assert.ok('ok' in result && result.ok, 'reason' in result ? result.reason : 'failed');
  if (!('ok' in result) || !result.ok) return;
  const chart = result.charts.find(item => item.id === 'msa-operator-profile');
  assert.ok(chart, 'missing msa-operator-profile');
  assert.equal(chart.kind, 'line');
  const series = chart.data.series ?? [];
  assert.equal(series.length, 6, '3 parts × 2 operators');
  for (const item of result.charts) {
    assert.doesNotThrow(() => compile(buildVegaSpec(item)), item.id);
  }
});
