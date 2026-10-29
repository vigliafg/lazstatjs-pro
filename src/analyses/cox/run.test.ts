import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCoxOutput } from './run';

const grid = {
  cols: [
    { name: 'T', type: 'num' as const },
    { name: 'E', type: 'int' as const },
    { name: 'X', type: 'num' as const },
  ],
  rows: [
    ['1', '1', '0.5'],
    ['2', '0', '1.2'],
    ['3', '1', '0.8'],
    ['4', '0', '1.5'],
    ['5', '1', '1.1'],
    ['6', '0', '0.9'],
    ['7', '1', '1.8'],
    ['8', '0', '1.3'],
    ['9', '1', '1.6'],
    ['10', '0', '1.0'],
  ],
};

const base = {
  grid,
  params: { timeVariable: 0, eventVariable: 1, covariates: [2] },
  ciLevel: 95,
};

test('cox builder returns tables, report and the hazard-ratio plot', () => {
  const result = buildCoxOutput(base);
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  assert.ok(result.tables.length > 0);
  assert.ok(result.report);
  const chart = result.charts?.[0];
  assert.equal(chart?.kind, 'forest');
  assert.match(result.header ?? '', /events/);
  // The worker sends this payload across structured clone.
  assert.doesNotThrow(() =>
    structuredClone({
      tables: result.tables,
      report: result.report,
      charts: result.charts,
      header: result.header,
    })
  );
});

test('cox builder validates covariates and the event column', () => {
  const noCovariates = buildCoxOutput({ ...base, params: { ...base.params, covariates: [] } });
  assert.ok('reason' in noCovariates);
  if ('reason' in noCovariates) assert.match(noCovariates.reason, /at least one covariate/);

  const timeAsCovariate = buildCoxOutput({ ...base, params: { ...base.params, covariates: [0] } });
  assert.ok('reason' in timeAsCovariate);
  if ('reason' in timeAsCovariate) assert.match(timeAsCovariate.reason, /cannot be used as covariates/);

  const nonBinary = buildCoxOutput({
    ...base,
    grid: {
      ...grid,
      rows: [['1', '0', '1'], ['2', '1', '2'], ['3', '2', '3'], ['4', '0', '4'], ['5', '1', '5']],
    },
  });
  assert.ok('reason' in nonBinary);
  if ('reason' in nonBinary) assert.match(nonBinary.reason, /exactly two values/);
});
