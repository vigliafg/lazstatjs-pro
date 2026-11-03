import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContingencyOutput } from './run';
import { chartOptions } from '../../charts/defaults';
import { DEFAULT_PARAMS } from '../../io/project';

test('contingency builder returns tables and a report for the trial preset', () => {
  const result = buildContingencyOutput({ params: DEFAULT_PARAMS.contingency, ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  const ids = (result.charts ?? []).map(chart => chart.id);
  assert.deepEqual(ids, [
    'contingency-residuals',
    'contingency-mosaic',
    'contingency-association',
    'contingency-ca',
    'contingency-ca-inertia',
  ]);
  const mosaic = (result.charts ?? []).find(chart => chart.id === 'contingency-mosaic');
  assert.equal(mosaic?.kind, 'mosaic');
  assert.ok((mosaic?.data.cells ?? []).length >= 4);
  assert.ok((mosaic?.data.cells ?? []).every(cell => cell.x0 !== undefined && cell.x1 !== undefined));
  const association = (result.charts ?? []).find(chart => chart.id === 'contingency-association');
  const assocOptions = association ? chartOptions(association) : undefined;
  assert.equal(assocOptions?.kind === 'bar' ? assocOptions.grouping : undefined, 'stacked');
});

test('contingency builder rejects negative frequencies and a zero total', () => {
  const negative = buildContingencyOutput({
    params: {
      ...DEFAULT_PARAMS.contingency,
      values: [
        ['-1', '2'],
        ['3', '4'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in negative);
  if ('reason' in negative) assert.match(negative.reason, /non-negative/);

  const empty = buildContingencyOutput({
    params: {
      ...DEFAULT_PARAMS.contingency,
      values: [
        ['0', '0'],
        ['0', '0'],
      ],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in empty);
  if ('reason' in empty) assert.match(empty.reason, /grand total/);
});

test('Mantel–Haenszel mode returns pooled and per-stratum tables plus a forest', () => {
  const params = {
    ...DEFAULT_PARAMS.contingency,
    mode: 'mantelHaenszel' as const,
    strata: [
      { label: 'A', values: [['12', '20'], ['18', '9']] },
      { label: 'B', values: [['0', '8'], ['6', '10']] },
    ],
  };
  const result = buildContingencyOutput({ params, ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.charts?.map(chart => chart.id), ['contingency-mh-forest']);
  assert.equal(result.charts?.[0].kind, 'forest');
  const ids = result.tables.map(table => table.id);
  assert.ok(ids.includes('cont-mh'));
  assert.ok(ids.includes('cont-mh-strata'));
  assert.equal(result.report?.id, 'contingency-mantel-haenszel');
  const pooled = result.tables.find(table => table.id === 'cont-mh');
  assert.ok((pooled?.rows.length ?? 0) >= 2);

  const noStrata = buildContingencyOutput({
    params: {
      ...params,
      strata: [{ label: 'empty', values: [['0', '0'], ['0', '0']] }],
    },
    ciLevel: 95,
  });
  assert.ok('reason' in noStrata);
  if ('reason' in noStrata) assert.match(noStrata.reason, /positive total/);
});

test('trend mode uses the first two columns, scores and a proportion line', () => {
  const params = {
    ...DEFAULT_PARAMS.contingency,
    mode: 'trend' as const,
    values: [
      ['18', '12', '0'],
      ['25', '15', '0'],
      ['32', '8', '0'],
      ['40', '5', '0'],
    ],
    rows: ['1', '2', '3', '4'],
    scores: ['1', '2', '3', '4'],
  };
  const result = buildContingencyOutput({ params, ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.charts?.map(chart => chart.id), ['contingency-trend-line']);
  assert.equal(result.charts?.[0].kind, 'line');
  assert.ok(result.tables.some(table => table.id === 'cont-trend'));
  assert.ok(result.tables.some(table => table.id === 'cont-trend-proportions'));
  assert.equal(result.report?.id, 'contingency-trend');
});

test('exact mode returns a dedicated table and residual heatmap', () => {
  const params = {
    ...DEFAULT_PARAMS.contingency,
    mode: 'exact' as const,
    rows: ['A', 'B', 'C'],
    cols: ['Yes', 'No'],
    values: [
      ['12', '7'],
      ['8', '10'],
      ['5', '13'],
    ],
  };
  const result = buildContingencyOutput({ params, ciLevel: 95 });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.deepEqual(result.charts?.map(chart => chart.id), ['contingency-exact-residuals', 'exact-observed-expected']);
  assert.equal(result.charts?.[0].kind, 'heatmap');
  const exact = result.tables.find(table => table.id === 'cont-exact');
  assert.ok(exact);
  assert.match(String(exact?.rows[0]?.method ?? ''), /Enumerazione/);
  assert.equal(result.report?.id, 'contingency-exact');
});
