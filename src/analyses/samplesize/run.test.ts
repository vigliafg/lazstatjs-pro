import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSampleSizeOutput } from './run';
import { DEFAULT_PARAMS } from '../../io/project';

test('sample-size builder returns tables, a report and the power curve', () => {
  const result = buildSampleSizeOutput(DEFAULT_PARAMS.samplesize);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  assert.ok(result.tables.some(spec => spec.id === 'ss-curve'));
  const precision = (result.charts ?? []).find(chart => chart.id === 'samplesize-precision');
  assert.ok(precision);
  assert.ok((precision?.data.series ?? []).length >= 2);
  assert.ok(
    (precision?.data.series ?? []).every(
      row => Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y))
    )
  );
  const sensitivity = (result.charts ?? []).find(chart => chart.id === 'samplesize-sensitivity');
  assert.ok(sensitivity);
  assert.ok((sensitivity?.data.series ?? []).length > 1);
});

test('sample-size builder rejects a zero effect size with the panel message', () => {
  const result = buildSampleSizeOutput({ ...DEFAULT_PARAMS.samplesize, delta: 0 });
  assert.ok('reason' in result);
  if (!('reason' in result)) return;
  assert.match(result.reason, /greater than zero/);
});
