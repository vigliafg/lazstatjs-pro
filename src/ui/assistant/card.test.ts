import assert from 'node:assert/strict';
import test from 'node:test';
import type { AnalysisRunResult } from '../../analyses/types';
import type { TableRow, TableSpec } from '../../stats/types';
import { buildAssistantCard } from './card';

const run = (tables: TableSpec[]): AnalysisRunResult => ({ ok: true, tables, report: null });

const table = (id: string, rows: TableRow[]): TableSpec => ({
  id,
  title: id,
  columns: Object.keys(rows[0] ?? {}).map(key => ({ key, label: key })),
  rows,
});

test('the t-test card flags a small group and a violated assumption', () => {
  const card = buildAssistantCard(
    run([
      table('ttest-sample', [{ n: 12 }, { n: 18 }]),
      table('ttest-assumptions', [{ check: 'Lilliefors', p: 0.02 }, { check: 'Levene', p: 0.4 }]),
    ]),
    'ttest',
    { leafId: 'ttest-ind', path: ['compare'], ciLevel: 95 }
  );
  assert.ok(card);
  assert.equal(card.status, 'warn');
  assert.equal(card.checks.find(check => check.id === 'sample')?.status, 'warn');
  assert.equal(card.checks.find(check => check.id === 'assumptions')?.status, 'warn');
  assert.ok(card.nextSteps.length >= 1);
  assert.equal(card.leafId, 'ttest-ind');
});

test('15 observations per group and no significant assumption pass', () => {
  const card = buildAssistantCard(
    run([
      table('ttest-sample', [{ n: 15 }, { n: 20 }]),
      table('ttest-assumptions', [{ check: 'Lilliefors', p: 0.3 }]),
    ]),
    'ttest',
    { leafId: 'ttest-ind', path: [] }
  );
  assert.ok(card);
  assert.equal(card.status, 'ok');
});

test('descriptive summaries below 30 observations are a warning, not a failure', () => {
  const card = buildAssistantCard(run([table('desc-location', [{ n: 29 }])]), 'descriptive');
  assert.ok(card);
  assert.equal(card.checks[0]?.status, 'warn');
});

test('a chi-square with expected counts below 5 asks for an exact test', () => {
  const card = buildAssistantCard(
    run([table('chisq-assumptions', [{ value: 3.2 }, { value: 2 }, { value: 40 }])]),
    'chisquare'
  );
  assert.ok(card);
  assert.equal(card.checks.find(check => check.id === 'expected')?.status, 'warn');
});

test('a sample size with power below 0.80 is flagged', () => {
  const tableSpec: TableSpec = {
    id: 'ss-result',
    title: 'result',
    columns: [{ key: 'power', label: 'Power' }],
    rows: [{ power: 0.62 }],
  };
  const card = buildAssistantCard(run([tableSpec]), 'samplesize');
  assert.ok(card);
  assert.equal(card.checks[0]?.id, 'power');
  assert.equal(card.checks[0]?.status, 'warn');
});

test('a procedure without usable tables gets an explicit manual-review note', () => {
  const card = buildAssistantCard(run([]), 'cox', { leafId: 'cox', path: [] });
  assert.ok(card);
  assert.equal(card.status, 'info');
  assert.equal(card.checks[0]?.id, 'info');
});

test('a refused run produces no card', () => {
  const card = buildAssistantCard({ ok: false, reason: 'nope' }, 'ttest');
  assert.equal(card, null);
});
