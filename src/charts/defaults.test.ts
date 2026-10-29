import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CHART_DEFAULTS,
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
