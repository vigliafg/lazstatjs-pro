import test from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'vega-lite';
import { buildVegaSpec } from './buildSpec';
import { factoryOptions } from '../defaults';
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
  points: [{ x: 1, y: 2, z: 3, size: 4 }, { x: 2, y: 3, z: 4, size: 6 }],
  intervals: [
    { category: 'A', estimate: 2, lo: 1, hi: 3 },
    { category: 'B', estimate: 3, lo: 2, hi: 5 },
  ],
  panels: [{ px: 0, px2: 1, py: 0, py2: 1 }],
  ellipses: [{ x: 0.4, y: 0.5 }, { x: 0.6, y: 0.5 }],
  labels: [{ x: 0.5, y: 1.1, label: 'A' }],
  fit: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
  robust: [{ x: 1, y: 1.1 }, { x: 2, y: 2.1 }],
  series: [{ x: 1, y: 2, series: 'A' }, { x: 2, y: 3, series: 'A' }],
  markers: [{ x: 1, y: 2, series: 'A' }],
  bars: [{ category: 'A', value: 2 }, { category: 'B', value: 3 }],
  summary: [{ category: 'A', min: 1, q1: 1.5, median: 2, q3: 2.5, max: 3, mean: 2 }],
  values: [{ value: 1 }, { value: 2 }, { value: 3 }],
  reference: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
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

const layersOf = (spec: unknown): any[] => {
  const layers = (spec as any)?.layer;
  return Array.isArray(layers) ? layers : [spec as any];
};

const channelScales = (spec: unknown, channel: 'x' | 'y'): any[] =>
  layersOf(spec)
    .map(layer => layer?.encoding?.[channel]?.scale)
    .filter(scale => scale && typeof scale === 'object');

const channelAxes = (spec: unknown, channel: 'x' | 'y'): any[] =>
  layersOf(spec)
    .map(layer => layer?.encoding?.[channel]?.axis)
    .filter(axis => axis && typeof axis === 'object');

const build = (kind: ChartKind, options: Partial<ChartOptions>) =>
  buildVegaSpec(chartOf(kind), { ...factoryOptions(kind), ...options } as never);

test('explicit limits set domainMin and domainMax on every layer', () => {
  const spec = build('scatter', { xMin: 1, xMax: 5 });
  const scales = channelScales(spec, 'x');
  assert.ok(scales.length > 0);
  for (const scale of scales) {
    assert.equal(scale.domainMin, 1);
    assert.equal(scale.domainMax, 5);
    // An explicit limit must win over the automatic zero baseline.
    assert.equal(scale.zero, false);
  }
  assert.deepEqual(channelScales(spec, 'y').filter(scale => 'domainMin' in scale), []);
});

test('one limit leaves the other edge automatic', () => {
  const spec = build('line', { yMax: 10 });
  const scales = channelScales(spec, 'y');
  assert.ok(scales.length > 0);
  for (const scale of scales) {
    assert.equal(scale.domainMax, 10);
    assert.equal('domainMin' in scale, false);
  }
});

test('the requested scale type reaches the spec', () => {
  const spec = build('scatter', { xScaleType: 'log' });
  for (const scale of channelScales(spec, 'x')) assert.equal(scale.type, 'log');
});

test('reverse, clamp and nice travel with the limits', () => {
  const spec = build('scatter', { xReverse: true, xClamp: true, xNice: true });
  for (const scale of channelScales(spec, 'x')) {
    assert.equal(scale.reverse, true);
    assert.equal(scale.clamp, true);
    assert.equal(scale.nice, true);
  }
});

test('an explicit limit overrides a fixed internal domain', () => {
  const spec = build('survival', { yMin: 0.2, yMax: 0.8 });
  assert.ok(
    channelScales(spec, 'y').some(scale => scale.domainMin === 0.2 && scale.domainMax === 0.8)
  );
});

test('derived axes stay automatic', () => {
  const qq = build('qq', { xMin: 1, xMax: 5, yMin: 0.1, yMax: 0.9 });
  for (const scale of channelScales(qq, 'x')) assert.equal('domainMin' in scale, false);
  assert.ok(channelScales(qq, 'y').some(scale => scale.domainMin === 0.1));

  const pareto = build('pareto', { xMin: 1, xMax: 5, yMin: 1, yMax: 5 });
  for (const channel of ['x', 'y'] as const) {
    for (const scale of channelScales(pareto, channel)) {
      assert.equal('domainMin' in scale, false);
      assert.equal('domainMax' in scale, false);
    }
  }

  const forest = build('forest', { xMin: 0.5, xMax: 2, yMin: 1, yMax: 2 });
  assert.ok(channelScales(forest, 'x').every(scale => scale.domainMin === 0.5));
  assert.ok(channelScales(forest, 'y').every(scale => scale.domainMin === undefined));

  const matrix = build('missingness', { xMin: 1, xMax: 5, yMin: 1, yMax: 5 });
  for (const channel of ['x', 'y'] as const) {
    for (const scale of channelScales(matrix, channel)) {
      assert.equal('domainMin' in scale, false);
    }
  }
});

test('tick count and label format reach the axis object', () => {
  const spec = build('scatter', { xTickCount: 4, xLabelFormat: 'compact' });
  const axes = channelAxes(spec, 'x');
  assert.ok(axes.length > 0);
  for (const axis of axes) {
    assert.equal(axis.tickCount, 4);
    assert.equal(axis.format, '~s');
  }
});

test('automatic labels leave the axis format alone', () => {
  const spec = build('scatter', { xTickCount: null, xLabelFormat: 'auto' });
  for (const axis of channelAxes(spec, 'x')) assert.equal(axis.format, undefined);
});

test('an explicit format wins over the tiny-domain default', () => {
  const chart = makeChart({
    id: 'tiny',
    kind: 'line',
    title: 'tiny',
    data: { series: [{ x: 1, y: 3e-13 }, { x: 2, y: 6e-13 }] },
    fields: { xLabel: 'X', yLabel: 'Y' },
  });
  const spec = buildVegaSpec(chart, {
    ...factoryOptions('line'),
    yLabelFormat: 'percent',
  } as never);
  const axes = channelAxes(spec, 'y');
  assert.ok(axes.length > 0);
  for (const axis of axes) assert.equal(axis.format, '.1%');
});

test('every kind compiles without warnings with axis settings', () => {
  const settings: Partial<ChartOptions> = {
    xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6,
    xScaleType: 'linear', yScaleType: 'linear',
    xReverse: true, yReverse: true,
    xClamp: true, yClamp: true,
    xNice: true, yNice: true,
  };
  for (const kind of kinds) {
    const warnings: string[] = [];
    compile(build(kind, settings) as never, {
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
