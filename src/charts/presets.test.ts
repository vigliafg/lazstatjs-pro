import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHART_PRESET_KEYS,
  MAX_CHART_PRESETS,
  MAX_CHART_PRESET_BYTES,
  MAX_CHART_PRESET_NAME,
  applyChartPreset,
  chartPresetMatches,
  createChartPreset,
  deleteChartPreset,
  matchingChartPreset,
  normalizeChartPresets,
  presetOptionsOf,
  renameChartPreset,
  saveChartPreset,
} from './presets';
import { factoryOptions } from './defaults';
import type { ChartOptions } from '../stats/charts';

const annotatedBox = (): ChartOptions => {
  const base = factoryOptions('box') as Extract<ChartOptions, { kind: 'box' }>;
  return {
    ...base,
    display: 'notched',
    showPoints: true,
    annotations: [{ id: 'a', type: 'text', x: 0.1, y: 0.1, text: 'note' }],
  };
};

test('a preset owns the 20 shared style keys and never annotations or specific options', () => {
  assert.equal(CHART_PRESET_KEYS.length, 20);
  assert.ok(!(CHART_PRESET_KEYS as readonly string[]).includes('preset'));
  assert.ok(!(CHART_PRESET_KEYS as readonly string[]).includes('annotations'));
  const options = presetOptionsOf(annotatedBox());
  assert.equal(Object.keys(options).length, 20);
  assert.equal('preset' in options, false);
  assert.equal('annotations' in options, false);
  assert.equal('display' in options, false);
  assert.equal(options.theme, 'dark');
});

test('normalizeChartPresets drops malformed entries and deduplicates ids and names', () => {
  const presets = normalizeChartPresets([
    { id: 'a', name: 'Paper', options: { theme: 'light' } },
    { id: 'a', name: 'Other', options: { theme: 'dark' } },
    { id: 'b', name: 'paper', options: { theme: 'dark' } },
    { id: 'c', name: '', options: { theme: 'dark' } },
    { id: 'd', name: 'No options' },
    null,
  ]);
  assert.equal(presets.length, 2);
  assert.deepEqual(presets.map(preset => preset.name), ['Paper', 'Other']);
  assert.notEqual(presets[0].id, presets[1].id);
  assert.equal(presets[0].options.theme, 'light');
  assert.equal(presets[0].options.gridY, true);
});

test('normalizeChartPresets caps the library and the serialized budget', () => {
  const many = Array.from({ length: MAX_CHART_PRESETS + 5 }, (_, index) => ({
    id: `p${index}`,
    name: `Preset ${index}`,
    options: { theme: 'dark' },
  }));
  const presets = normalizeChartPresets(many);
  assert.equal(presets.length, MAX_CHART_PRESETS);
  assert.ok(JSON.stringify(presets).length <= MAX_CHART_PRESET_BYTES);
});

test('createChartPreset trims the name and captures the 20 style keys', () => {
  const preset = createChartPreset('  Journal figure  ', annotatedBox(), []);
  assert.equal(preset.name, 'Journal figure');
  assert.equal(preset.id.length > 0, true);
  assert.equal(Object.keys(preset.options).length, 20);
  assert.equal('annotations' in preset.options, false);
  assert.equal('display' in preset.options, false);
});

test('createChartPreset limits the name length', () => {
  const preset = createChartPreset('x'.repeat(MAX_CHART_PRESET_NAME + 20), factoryOptions('bar'));
  assert.equal(preset.name.length, MAX_CHART_PRESET_NAME);
});

test('saveChartPreset creates, overwrites by name and respects the cap', () => {
  const first = saveChartPreset([], 'Paper', { ...factoryOptions('bar'), theme: 'light' });
  assert.equal(first.length, 1);
  assert.equal(first[0].options.theme, 'light');

  const overwritten = saveChartPreset(first, 'paper', { ...factoryOptions('bar'), theme: 'dark' });
  assert.equal(overwritten.length, 1);
  assert.equal(overwritten[0].options.theme, 'dark');
  assert.equal(overwritten[0].id, first[0].id);
  assert.equal(overwritten[0].name, 'Paper');

  const full = Array.from({ length: MAX_CHART_PRESETS }, (_, index) =>
    createChartPreset(`P${index}`, factoryOptions('bar'))
  );
  assert.equal(saveChartPreset(full, 'New', factoryOptions('bar')).length, MAX_CHART_PRESETS);
});

test('renameChartPreset refuses empty or duplicate names', () => {
  const presets = saveChartPreset(
    saveChartPreset([], 'One', factoryOptions('bar')),
    'Two',
    factoryOptions('line')
  );
  const id = presets[0].id;
  assert.equal(renameChartPreset(presets, id, 'Two')[0].name, 'One');
  assert.equal(renameChartPreset(presets, id, '   ')[0].name, 'One');
  assert.equal(renameChartPreset(presets, id, ' Renamed ')[0].name, 'Renamed');
});

test('deleteChartPreset removes only the requested entry', () => {
  const presets = saveChartPreset([], 'One', factoryOptions('bar'));
  assert.equal(deleteChartPreset(presets, presets[0].id).length, 0);
  assert.equal(deleteChartPreset(presets, 'missing').length, 1);
});

test('applyChartPreset replaces shared style and preserves kind, specific options and annotations', () => {
  const source = factoryOptions('box');
  const preset = createChartPreset('Print-like', {
    ...source,
    theme: 'light',
    palette: 'mono',
  });
  const applied = applyChartPreset(annotatedBox(), preset);
  assert.equal(applied.theme, 'light');
  assert.equal(applied.palette, 'mono');
  assert.equal(applied.kind, 'box');
  assert.equal(applied.kind === 'box' ? applied.display : null, 'notched');
  assert.equal(applied.kind === 'box' ? applied.showPoints : null, true);
  assert.equal(applied.annotations?.[0].text, 'note');
  // The built-in marker is not part of the custom preset payload.
  assert.equal(applied.preset, factoryOptions('box').preset);
});

test('matchingChartPreset compares only the 20 style keys', () => {
  const options = factoryOptions('scatter');
  const preset = createChartPreset('Scatter style', options);
  assert.equal(chartPresetMatches(options, preset), true);
  assert.equal(matchingChartPreset({ ...options, theme: 'light' }, [preset]), null);
  assert.equal(matchingChartPreset({ ...options, fit: 'both' } as ChartOptions, [preset])?.id, preset.id);
});

test('normalizeChartPresets accepts a project-shaped library and keeps order', () => {
  const presets = normalizeChartPresets([
    { id: 'b', name: 'B', options: { theme: 'light' } },
    { id: 'a', name: 'A', options: { theme: 'dark' } },
  ]);
  assert.deepEqual(presets.map(preset => preset.name), ['B', 'A']);
  assert.deepEqual(presets.map(preset => preset.id), ['b', 'a']);
});
