import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from './buildSpec';
import { factoryOptions, mergeOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartKind, ChartOptions } from '../../stats/charts';

const kinds: ChartKind[] = [
  'scatter', 'line', 'bar', 'box', 'histogram', 'interval', 'dot', 'ecdf', 'qq',
  'forest', 'survival', 'risk', 'mosaic', 'acf', 'heatmap', 'residual', 'scree',
  'score', 'bland', 'power', 'bootstrap', 'missingness', 'diamond', 'circles',
  'shadowgram', 'scattermatrix', 'bubble', 'scatter3d', 'tree', 'pareto',
  'dendrogram', 'surface',
];

const data = {
  points: [{ x: 1, y: 2, z: 3, size: 4, __row: '0' }, { x: 2, y: 3, z: 4, size: 6, __row: '1' }],
  intervals: [{ category: 'A', estimate: 2, lo: 1, hi: 3 }],
  panels: [{ px: 0, px2: 1, py: 0, py2: 1 }],
  ellipses: [{ x: 0.4, y: 0.5 }],
  labels: [{ x: 0.5, y: 1.1, label: 'A' }],
  fit: [{ x: 1, y: 1 }],
  robust: [{ x: 1, y: 1.1 }],
  series: [{ x: 1, y: 2, series: 'A' }],
  markers: [{ x: 1, y: 2, series: 'A' }],
  bars: [{ category: 'A', value: 2 }],
  summary: [{ category: 'A', min: 1, q1: 1.5, median: 2, q3: 2.5, max: 3, mean: 2 }],
  values: [{ value: 1 }, { value: 2 }],
  reference: [{ x: 1, y: 1 }],
  curves: [{ x: 1, y: 0.8, series: 'A', lo: 0.7, hi: 0.9 }],
  censored: [{ x: 1, y: 0.8, series: 'A' }],
  medians: [{ x: 1, series: 'A' }],
  band: [{ lag: 1, value: 0.2 }],
  cells: [{ x: 'A', y: 'B', value: 2, label: '2', x0: 0, x1: 0.5, y0: 0, y1: 1 }],
  line: [{ x: 1, y: 2 }],
  targets: [{ value: 80 }],
  rules: [{ y: 0 }],
  rows: [{ time: 0, group: 'A', atRisk: 10, events: 0 }],
};

const chartOf = (kind: ChartKind, options: Partial<ChartOptions> = {}) =>
  makeChart({
    id: kind,
    kind,
    title: kind,
    data,
    fields: { xLabel: 'X', yLabel: 'Y', series: 'Series' },
    stats: { df: 10, equation: 'y = 1 + x', r2: 0.9, n: 20, dim: 2, residSd: 0.5 },
    options: options as never,
  });

const build = (kind: ChartKind, options: Partial<ChartOptions>) =>
  buildVegaSpec(chartOf(kind), { ...factoryOptions(kind), ...options } as never);

/** Top-level parameters plus the ones declared on a layer. */
const paramsOf = (spec: unknown): any[] => {
  const record = spec as { params?: unknown; layer?: unknown };
  const top = Array.isArray(record.params) ? (record.params as any[]) : [];
  const nested = Array.isArray(record.layer)
    ? (record.layer as any[]).flatMap(layer => (Array.isArray(layer?.params) ? layer.params : []))
    : [];
  return [...top, ...nested];
};

const zoomParam = (spec: unknown): any | undefined =>
  paramsOf(spec).find(param => param?.name === 'chartZoom');

test('zoom binds the view scales when enabled', () => {
  const spec = build('scatter', { enableZoom: true });
  const zoom = zoomParam(spec);
  assert.ok(zoom);
  assert.equal(zoom.bind, 'scales');
  // No channel projection: `select: 'interval'` binds the view scales.
  assert.equal(zoom.select, 'interval');
  assert.equal(zoom.select.encodings, undefined);
});

test('the zoom parameter sits on a layer that has both axes', () => {
  const spec = build('scatter', { enableZoom: true }) as any;
  assert.equal((spec.params ?? []).some((param: any) => param?.name === 'chartZoom'), false);
  const zoomLayer = spec.layer.find((layer: any) =>
    (layer.params ?? []).some((param: any) => param?.name === 'chartZoom')
  );
  assert.ok(zoomLayer);
  assert.equal(zoomLayer.encoding.x.type, 'quantitative');
  assert.equal(zoomLayer.encoding.y.type, 'quantitative');
});

test('zoom is off by default and when disabled', () => {
  assert.equal(zoomParam(build('scatter', {})), undefined);
  assert.equal(zoomParam(build('scatter', { enableZoom: false })), undefined);
});

test('zoom needs continuous, unbinned scales', () => {
  // Q-Q keeps the probability axis, but both drawn scales are continuous.
  assert.ok(zoomParam(build('qq', { enableZoom: true })));
  assert.ok(zoomParam(build('line', { enableZoom: true })));
  // Scale binding covers the whole view: a nominal x or a binned x cannot be
  // bound, so those charts stay without zoom instead of failing to compile.
  assert.equal(zoomParam(build('bar', { enableZoom: true })), undefined);
  assert.equal(zoomParam(build('histogram', { enableZoom: true })), undefined);
  // Pareto and the matrices are excluded by `axisChannels`.
  assert.equal(zoomParam(build('pareto', { enableZoom: true })), undefined);
  assert.equal(zoomParam(build('missingness', { enableZoom: true })), undefined);
});

test('zoom coexists with the link signals', () => {
  const chart = chartOf('scatter', { enableZoom: true } as never);
  const spec = buildVegaSpec(chart, { ...factoryOptions('scatter'), enableZoom: true } as never, {
    keys: ['0'],
    hidden: [],
  });
  const names = paramsOf(spec).map(param => param?.name);
  assert.ok(names.includes('chartZoom'));
  assert.ok(names.includes('linkKeys'));
  assert.ok(names.includes('hiddenKeys'));
});

test('zoom is stored as a per-card boolean', () => {
  assert.equal(factoryOptions('scatter').enableZoom, false);
  assert.equal(mergeOptions('scatter', { enableZoom: true } as never).enableZoom, true);
  assert.equal(mergeOptions('scatter', { enableZoom: 'yes' } as never).enableZoom, false);
});

test('every kind compiles without warnings with zoom on', () => {
  for (const kind of kinds) {
    const warnings: string[] = [];
    compile(build(kind, { enableZoom: true }) as never, {
      logger: {
        warn: (message: string) => warnings.push(message),
        info: () => {},
        debug: () => {},
        level: () => ({ warn: () => {}, info: () => {}, debug: () => {} }),
      },
    } as never);
    assert.deepEqual(warnings, [], `${kind}: ${warnings.join(' · ')}`);
  }
});
