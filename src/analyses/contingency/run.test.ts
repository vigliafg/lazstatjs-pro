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
