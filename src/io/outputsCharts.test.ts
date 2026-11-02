import test from 'node:test';
import assert from 'node:assert/strict';
import { capStoredOutputs, parseStoredOutputs, storedOutputChars, type StoredOutput } from './outputs';
import { createProjectSnapshot, DEFAULT_PARAMS, DEFAULT_SETTINGS, parseProject, serializeProject } from './project';
import { DEFAULT_PREFS } from './prefs';
import { makeChart } from '../charts/kits/common';
import type { PanelChart } from '../stats/charts';

const chart = () =>
  makeChart({
    id: 'c1',
    kind: 'bar',
    title: 'Means',
    data: { bars: [{ category: 'A', value: 1 }, { category: 'B', value: 2 }] },
    fields: { xLabel: 'Group', yLabel: 'Mean' },
  });

const entry = (index: number): StoredOutput => ({
  id: `run-${index}`,
  title: `Run ${index}`,
  createdAt: '2026-10-19T10:00:00.000Z',
  html: '<div>tables and prose</div>',
  charts: [chart()],
});

test('stored outputs keep chart models and charge them to the character budget', () => {
  const saved = parseStoredOutputs([entry(0)]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].charts?.length, 1);
  assert.equal(saved[0].charts?.[0].kind, 'bar');
  assert.ok(storedOutputChars(saved[0]) > saved[0].html.length);
});

test('legacy cards without charts stay readable', () => {
  const saved = parseStoredOutputs([{ id: 'old', title: 'Old', createdAt: '', html: '<div>Victory</div>' }]);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].charts, undefined);
});

test('malformed chart models are dropped without losing tables and prose', () => {
  const saved = parseStoredOutputs([
    { ...entry(0), charts: [{ kind: 'scatter' }, chart()] },
  ]);
  assert.equal(saved[0].html, entry(0).html);
  assert.equal(saved[0].charts?.length, 1);
});

test('chart JSON counts towards the stored-output cap', () => {
  const blocks = Array.from({ length: 4 }, (_, i) => entry(i));
  const capped = capStoredOutputs(blocks);
  assert.ok(capped.length >= 1 && capped.length <= blocks.length);
  const total = capped.reduce((sum, block) => sum + storedOutputChars(block), 0);
  assert.ok(total <= 1_500_000);
});

test('a project round-trips chart annotations', () => {
  const annotated = makeChart({
    id: 'c-annotated',
    kind: 'bar',
    title: 'Annotated',
    data: { bars: [{ category: 'A', value: 1 }] },
    options: {
      kind: 'bar',
      annotations: [
        { id: 'note', type: 'text', x: 0.25, y: 0.2, text: 'p = 0.03' },
        { id: 'arrow', type: 'arrow', x: 0.2, y: 0.3, x2: 0.6, y2: 0.5, strokeWidth: 3 },
      ],
    },
  });
  const snapshot = createProjectSnapshot({
    grid: { cols: [{ name: 'X', type: 'num' }], rows: [['1'], ['2']] },
    prefs: DEFAULT_PREFS,
    settings: DEFAULT_SETTINGS,
    params: DEFAULT_PARAMS,
    outputs: [{ ...entry(0), charts: [annotated] }],
  });
  const parsed = parseProject(serializeProject(snapshot));
  const annotations = parsed.outputs[0].charts?.[0].options.annotations;
  assert.equal(annotations?.length, 2);
  assert.equal(annotations?.[0].text, 'p = 0.03');
  assert.equal(annotations?.[1].type, 'arrow');
  assert.equal(annotations?.[1].strokeWidth, 3);
});

const panel = (): PanelChart => ({
  version: 1,
  id: 'panel-distribution',
  kind: 'panel',
  title: 'Distribution',
  layout: 'stack',
  children: [chart()],
  tables: [
    {
      id: 'summary',
      title: 'Summary',
      columns: [{ key: 'mean', label: 'Mean', format: 'dec2' }],
      rows: [{ mean: 1.5 }],
    },
  ],
});

test('stored outputs round-trip L3 panels and charge them to the budget', () => {
  const saved = parseStoredOutputs([{ ...entry(0), panels: [panel()] }]);
  assert.equal(saved[0].panels?.length, 1);
  assert.equal(saved[0].panels?.[0].kind, 'panel');
  assert.equal(saved[0].panels?.[0].children[0].kind, 'bar');
  assert.equal(saved[0].panels?.[0].tables?.[0].rows[0].mean, 1.5);
  assert.ok(storedOutputChars(saved[0]) > saved[0].html.length);
});

test('a project round-trips panels and their children', () => {
  const snapshot = createProjectSnapshot({
    grid: { cols: [{ name: 'X', type: 'num' }], rows: [['1'], ['2']] },
    prefs: DEFAULT_PREFS,
    settings: DEFAULT_SETTINGS,
    params: DEFAULT_PARAMS,
    outputs: [{ ...entry(0), panels: [panel()] }],
  });
  const parsed = parseProject(serializeProject(snapshot));
  assert.equal(parsed.outputs[0].panels?.[0].title, 'Distribution');
  assert.equal(parsed.outputs[0].panels?.[0].children[0].title, 'Means');
});

test('a v3 project round-trips chart models and still accepts v1/v2 files', () => {
  const snapshot = createProjectSnapshot({
    grid: { cols: [{ name: 'X', type: 'num' }], rows: [['1'], ['2']] },
    prefs: DEFAULT_PREFS,
    settings: DEFAULT_SETTINGS,
    params: DEFAULT_PARAMS,
    outputs: [entry(0)],
  });
  const parsed = parseProject(serializeProject(snapshot));
  assert.equal(parsed.version, 3);
  assert.equal(parsed.outputs[0].charts?.[0].title, 'Means');

  const legacy = { ...JSON.parse(serializeProject(snapshot)), version: 2 };
  assert.equal(parseProject(JSON.stringify(legacy)).version, 3);
});
