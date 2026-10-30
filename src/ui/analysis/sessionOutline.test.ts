import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSessionOutline, outlineRunIds, type OutlineSource } from './sessionOutline';

const run = (id: string, title: string, analysisId?: string, runNumber?: number): OutlineSource => ({
  id,
  title,
  ...(analysisId ? { analysisId } : {}),
  ...(runNumber !== undefined ? { runNumber } : {}),
});

const sample: OutlineSource[] = [
  run('a1', 'ANOVA — Score', 'anova', 1),
  run('t1', 'T-Test — Score', 'ttest', 2),
  run('a2', 'ANOVA — Score by Group', 'anova', 4),
  run('legacy', 'Legacy result', undefined, 3),
];

test('groups runs into registry families and analyses', () => {
  const outline = buildSessionOutline(sample);
  assert.deepEqual(
    outline.families.map(family => family.label),
    ['Compare groups', 'Other']
  );
  const compare = outline.families[0];
  assert.deepEqual(
    compare.analyses.map(analysis => [analysis.id, analysis.runs.length]),
    [
      ['anova', 2],
      ['ttest', 1],
    ]
  );
  assert.deepEqual(
    compare.analyses[0].runs.map(item => item.runNumber),
    [1, 4]
  );
  assert.equal(outline.total, 4);
});

test('uses the stable run number and falls back to the position for legacy entries', () => {
  const outline = buildSessionOutline([
    run('x', 'First'),
    run('y', 'Third', undefined, 3),
    run('z', 'Second'),
  ]);
  const numbers = new Map(
    outline.families[0].analyses[0].runs.map(item => [item.id, item.runNumber])
  );
  assert.equal(numbers.get('x'), 1);
  assert.equal(numbers.get('y'), 3);
  assert.equal(numbers.get('z'), 3);
});

test('rejects invalid persisted numbers instead of corrupting the outline', () => {
  const outline = buildSessionOutline([
    run('a', 'A', 'anova', 0),
    run('b', 'B', 'anova', 2.5),
    run('c', 'C', 'anova', 7),
  ]);
  const runs = outline.families[0].analyses[0].runs;
  assert.equal(runs.find(item => item.id === 'a')?.runNumber, 1);
  assert.equal(runs.find(item => item.id === 'b')?.runNumber, 2);
  assert.equal(runs.find(item => item.id === 'c')?.runNumber, 7);
});

test('exposes pinned runs both as shortcuts and as real nodes', () => {
  const outline = buildSessionOutline(sample, { pinnedIds: new Set(['a2']) });
  assert.deepEqual(outline.pinned.map(item => item.id), ['a2']);
  assert.ok(outlineRunIds(outline).has('a2'));
  assert.equal(outline.counts.pinned, 1);
});

test('filters by state and keeps counts from the query set', () => {
  const options = {
    pinnedIds: new Set(['t1']),
    staleIds: new Set(['a2']),
    warningIds: new Set(['a1']),
  };
  const stale = buildSessionOutline(sample, { ...options, filter: 'stale' });
  assert.deepEqual(outlineRunIds(stale), new Set(['a2']));
  assert.deepEqual(stale.counts, { all: 4, pinned: 1, stale: 1, warning: 1 });

  const pinned = buildSessionOutline(sample, { ...options, filter: 'pinned' });
  assert.deepEqual(outlineRunIds(pinned), new Set(['t1']));

  const warning = buildSessionOutline(sample, { ...options, filter: 'warning' });
  assert.deepEqual(outlineRunIds(warning), new Set(['a1']));
});

test('searches title, analysis, family and run number', () => {
  const byTitle = buildSessionOutline(sample, { query: 'legacy' });
  assert.deepEqual(outlineRunIds(byTitle), new Set(['legacy']));

  const byAnalysis = buildSessionOutline(sample, { query: 't-test' });
  assert.deepEqual(outlineRunIds(byAnalysis), new Set(['t1']));

  const byFamily = buildSessionOutline(sample, { query: 'compare' });
  assert.deepEqual(outlineRunIds(byFamily), new Set(['a1', 't1', 'a2']));

  const byNumber = buildSessionOutline(sample, { query: '04' });
  assert.deepEqual(outlineRunIds(byNumber), new Set(['a2']));
});

test('applies every search term and ignores accents', () => {
  const outline = buildSessionOutline(
    [run('c1', 'Correlazione — Età', 'correlation', 1)],
    { query: 'correlazione eta' }
  );
  assert.equal(outline.total, 1);
  assert.equal(buildSessionOutline(sample, { query: 'anova missing' }).total, 0);
});

test('drops empty groups after filtering', () => {
  const outline = buildSessionOutline(sample, { query: 'legacy' });
  assert.equal(outline.families.length, 1);
  assert.equal(outline.families[0].id, 'other');
  assert.equal(outline.families[0].analyses[0].runs.length, 1);
});

test('returns an empty, well-formed outline for an empty session', () => {
  const outline = buildSessionOutline([]);
  assert.deepEqual(outline.pinned, []);
  assert.deepEqual(outline.families, []);
  assert.equal(outline.total, 0);
  assert.deepEqual(outline.counts, { all: 0, pinned: 0, stale: 0, warning: 0 });
  assert.equal(outlineRunIds(outline).size, 0);
});
