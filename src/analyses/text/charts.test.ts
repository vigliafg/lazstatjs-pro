import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTextOutput } from './run';
import type { TextParams } from '../../io/project';

const grid = {
  cols: [{ name: 'Text', type: 'cat' as const }],
  rows: [
    ['gatto cane topo'],
    ['gatto gatto cane'],
    ['topo topo'],
    ['cane topo'],
    ['gatto topo'],
    ['cane cane gatto'],
  ],
};

const params = (overrides: Partial<TextParams> = {}): TextParams => ({
  mode: 'frequency',
  text: 0,
  group: -1,
  maxTerms: 20,
  minDocFreq: 1,
  topics: 3,
  iterations: 100,
  seed: 20261109,
  stopwords: false,
  ...overrides,
});

test('term frequencies name the axis and drop the colour claim', () => {
  const result = buildTextOutput({ grid, params: params() });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), ['text-terms']);
  assert.equal(charts[0]?.kind, 'bar');
  assert.equal(charts[0]?.fields.xLabel, 'Termine');
  assert.equal(charts[0]?.fields.yLabel, 'Frequenza');
  assert.doesNotMatch(charts[0]?.note ?? '', /colore/);
});

test('the topic model draws prevalence and the document × topic map', () => {
  const result = buildTextOutput({ grid, params: params({ mode: 'topics' }) });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const charts = result.charts ?? [];
  assert.deepEqual(charts.map(chart => chart.id), [
    'text-terms',
    'text-topic-prevalence',
    'text-document-topics',
  ]);
  assert.equal(charts[1]?.kind, 'bar');
  const map = charts[2];
  assert.equal(map?.kind, 'heatmap');
  assert.equal(map?.fields.xLabel, 'Argomento');
  assert.equal(map?.fields.yLabel, 'Documento');
  assert.ok((map?.data.cells ?? []).length > 0);
});

test('the similarity heat map omits the diagonal it does not compute', () => {
  const result = buildTextOutput({ grid, params: params({ mode: 'similarity' }) });
  assert.ok('ok' in result && result.ok);
  if (!('ok' in result) || !result.ok) return;
  const map = (result.charts ?? []).find(chart => chart.id === 'text-similarity');
  assert.ok(map);
  if (!map) return;
  const cells = map.data.cells ?? [];
  // Six documents: 15 unordered pairs, written in both directions.
  assert.equal(cells.length, 30);
  assert.ok(cells.every(cell => String(cell.x) !== String(cell.y)));
  assert.match(map.note ?? '', /non è disegnata/);
  assert.equal(map.fields.xLabel, 'Documento');
  assert.equal(map.fields.yLabel, 'Documento');
});
