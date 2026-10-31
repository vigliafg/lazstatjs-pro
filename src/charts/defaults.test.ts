import test from 'node:test';
import assert from 'node:assert/strict';
import type { ChartOptions } from '../stats/charts';
import {
  COMMON_DEFAULTS,
  DEFAULT_CHART_DEFAULTS,
  applyPreset,
  commonOptionsOf,
  factoryOptions,
  mergeOptions,
  normalizeChartDefaults,
  withChartDefaults,
} from './defaults';

test('user defaults are merged between factory and per-card options', () => {
  const defaults = { ...DEFAULT_CHART_DEFAULTS, theme: 'light' as const, gridY: false };
  const options = withChartDefaults(defaults, () =>
    mergeOptions('bar', { valueLabels: true } as never)
  );
  assert.equal(options.theme, 'light');
  assert.equal(options.gridY, false);
  assert.equal(options.kind, 'bar');
  assert.equal(options.kind === 'bar' ? options.valueLabels : null, true);
});

test('the run-scoped defaults are restored after the run', () => {
  withChartDefaults({ ...DEFAULT_CHART_DEFAULTS, theme: 'light' }, () => undefined);
  assert.equal(factoryOptions('line').theme, DEFAULT_CHART_DEFAULTS.theme);
});

test('commonOptionsOf keeps only the shared chart options', () => {
  const options = { ...factoryOptions('scatter'), pointSize: 100, fit: 'both' } as never;
  const common = commonOptionsOf(options);
  assert.equal(common.pointSize, 100);
  assert.equal('fit' in common, false);
});

test('built-in presets are snapshots: Print then Default returns to the factory style', () => {
  const printed = applyPreset(factoryOptions('bar'), 'print');
  assert.equal(printed.theme, 'light');
  assert.equal(printed.palette, 'mono');
  const reset = applyPreset(printed, 'default');
  assert.deepEqual(commonOptionsOf(reset), DEFAULT_CHART_DEFAULTS);
});

test('switching Minimal to Print restores the options Minimal turned off', () => {
  const minimal = applyPreset(factoryOptions('box'), 'minimal');
  assert.equal(minimal.showLegend, false);
  assert.equal(minimal.showSubtitle, false);
  assert.equal(minimal.showNote, false);
  const printed = applyPreset(minimal, 'print');
  assert.equal(printed.showLegend, true);
  assert.equal(printed.showSubtitle, true);
  assert.equal(printed.showNote, true);
  assert.equal(printed.theme, 'light');
  assert.equal(printed.palette, 'mono');
});

test('built-in presets preserve specific options, kind and annotations', () => {
  const options = {
    ...factoryOptions('box'),
    display: 'violin' as const,
    showPoints: true,
    annotations: [{ id: 'a', type: 'text' as const, x: 0.1, y: 0.1, text: 'note' }],
  } as ChartOptions;
  const next = applyPreset(options, 'print');
  assert.equal(next.kind, 'box');
  assert.equal(next.kind === 'box' ? next.display : null, 'violin');
  assert.equal(next.kind === 'box' ? next.showPoints : null, true);
  assert.equal(next.annotations?.[0].text, 'note');
  assert.equal(next.theme, 'light');
});

test('the preset select covers exactly the common option keys', () => {
  const reset = applyPreset(factoryOptions('line'), 'default');
  assert.equal(Object.keys(commonOptionsOf(reset)).length, Object.keys(COMMON_DEFAULTS).length);
  assert.equal(commonOptionsOf(reset).preset, 'default');
});

test('normalizeChartDefaults rejects invalid values and clamps ranges', () => {
  const parsed = normalizeChartDefaults({
    theme: 'neon',
    gridOpacity: 9,
    pointSize: 1,
    palette: 'mono',
    size: 'huge',
  });
  assert.equal(parsed.theme, DEFAULT_CHART_DEFAULTS.theme);
  assert.equal(parsed.gridOpacity, 1);
  assert.equal(parsed.pointSize, 16);
  assert.equal(parsed.palette, 'mono');
  assert.equal(parsed.size, DEFAULT_CHART_DEFAULTS.size);
});
