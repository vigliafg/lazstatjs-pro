import test from 'node:test';
import assert from 'node:assert/strict';
import { barLayers, heatmapLayers, lineLayers, scatterOnly, survivalLayers } from './layers';
import { dotLayers, ecdfLayers, intervalLayers } from './descriptiveLayers';
import { riskLayers } from './riskLayers';
import { mosaicLayers } from './mosaicLayers';
import { factoryOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartOptions } from '../../stats/charts';

const barChart = makeChart({
  id: 'bar',
  kind: 'bar',
  title: 'Bar',
  data: { bars: [{ category: 'A', value: 10 }, { category: 'B', value: 1 }] },
});
const barOptions = (sort: 'none' | 'asc' | 'desc') =>
  ({ ...factoryOptions('bar'), sort }) as Extract<ChartOptions, { kind: 'bar' }>;

test('bar sort orders the nominal axis by value, not alphabetically', () => {
  const xOf = (sort: 'none' | 'asc' | 'desc') =>
    (barLayers(barChart, barOptions(sort))[0].encoding?.x as { sort?: unknown }).sort;
  assert.equal(xOf('none'), null);
  assert.deepEqual(xOf('asc'), ['B', 'A']);
  assert.deepEqual(xOf('desc'), ['A', 'B']);
});

test('bar sort is repeated on the error-bar and value-label layers', () => {
  const chart = makeChart({
    id: 'bar-sorted-labels',
    kind: 'bar',
    title: 'Sorted',
    data: {
      bars: [
        { category: 'A', value: 10, lo: 8, hi: 12 },
        { category: 'B', value: 1, lo: 0, hi: 2 },
      ],
    },
  });
  const options = { ...barOptions('asc'), error: 'ci', valueLabels: true } as Extract<
    ChartOptions,
    { kind: 'bar' }
  >;
  const layers = barLayers(chart, options);
  const categoryX = layers
    .map(layer => layer.encoding?.x as { field?: string; sort?: unknown } | undefined)
    .filter(x => x?.field === 'category');
  assert.equal(categoryX.length, 3);
  for (const x of categoryX) assert.deepEqual(x?.sort, ['B', 'A']);
});

test('heatmap sort orders both axes by their marginal mean', () => {
  const chart = makeChart({
    id: 'heat',
    kind: 'heatmap',
    title: 'Heat',
    data: {
      cells: [
        { x: 'A', y: 'A', value: 1, label: '1' },
        { x: 'A', y: 'B', value: 2, label: '2' },
        { x: 'B', y: 'A', value: 10, label: '10' },
        { x: 'B', y: 'B', value: 20, label: '20' },
      ],
    },
  });
  const options = (sort: 'none' | 'asc' | 'desc') =>
    ({ ...factoryOptions('heatmap'), sort }) as Extract<ChartOptions, { kind: 'heatmap' }>;
  const xOf = (sort: 'none' | 'asc' | 'desc') => {
    const layers = heatmapLayers(chart, options(sort));
    return (layers[0].encoding?.x as { sort?: unknown }).sort;
  };
  assert.equal(xOf('none'), null);
  assert.deepEqual(xOf('asc'), ['A', 'B']);
  assert.deepEqual(xOf('desc'), ['B', 'A']);
});

test('residual showPoints removes the point layer but keeps the zero rule', () => {
  const chart = makeChart({
    id: 'residual',
    kind: 'residual',
    title: 'Residual',
    data: { points: [{ x: 1, y: 2 }], rules: [{ y: 0 }] },
  });
  const base = factoryOptions('residual') as Extract<ChartOptions, { kind: 'residual' }>;
  const hidden = scatterOnly(chart, { ...base, showPoints: false, showZeroLine: true } as never);
  assert.equal(hidden.some(layer => layer.mark?.type === 'point'), false);
  assert.equal(hidden.some(layer => layer.mark?.type === 'rule'), true);
  const visible = scatterOnly(chart, { ...base, showPoints: true, showZeroLine: true } as never);
  assert.equal(visible.some(layer => layer.mark?.type === 'point'), true);
});

test('score showLabels draws text and ellipse draws an outline', () => {
  const chart = makeChart({
    id: 'score',
    kind: 'score',
    title: 'Score',
    data: {
      points: [
        { x: -1, y: -1, label: 'case 1' },
        { x: 1, y: 1, label: 'case 2' },
        { x: 1, y: -1, label: 'case 3' },
        { x: -1, y: 1, label: 'case 4' },
      ],
    },
  });
  const base = factoryOptions('score') as Extract<ChartOptions, { kind: 'score' }>;
  const layers = scatterOnly(chart, { ...base, showLabels: true, ellipse: true } as never);
  assert.equal(layers.some(layer => layer.mark?.type === 'text'), true);
  assert.equal(layers.some(layer => layer.mark?.type === 'line'), true);
});

test('survival showMedian draws the computed median rules', () => {
  const chart = makeChart({
    id: 'survival',
    kind: 'survival',
    title: 'Survival',
    data: {
      curves: [
        { x: 1, y: 1, series: 'A' },
        { x: 2, y: 0.6, series: 'A' },
        { x: 3, y: 0.4, series: 'A' },
        { x: 1, y: 1, series: 'B' },
        { x: 2, y: 0.8, series: 'B' },
        { x: 3, y: 0.5, series: 'B' },
      ],
      censored: [],
    },
  });
  const base = factoryOptions('survival') as Extract<ChartOptions, { kind: 'survival' }>;
  const layers = survivalLayers(chart, { ...base, showMedian: true } as never);
  const medians = layers.find(
    layer =>
      layer.mark?.type === 'rule' &&
      (layer.data?.values as Array<Record<string, unknown>> | undefined)?.some(
        row => row.series !== undefined && row.x !== undefined
      )
  );
  assert.ok(medians);
  assert.deepEqual(
    (medians!.data?.values as Array<Record<string, unknown>>).map(row => row.x),
    [3, 3]
  );
});

test('interval, dot and ECDF layers expose their marks and options', () => {
  const interval = makeChart({
    id: 'interval',
    kind: 'interval',
    title: 'Interval',
    data: { intervals: [
      { category: 'A', estimate: 2, lo: 1, hi: 3 },
      { category: 'B', estimate: 5, lo: 4, hi: 6 },
    ] },
  });
  const intervalOptions = { ...factoryOptions('interval'), valueLabels: true, sort: 'asc' } as Extract<ChartOptions, { kind: 'interval' }>;
  const intervalLayersResult = intervalLayers(interval, intervalOptions);
  assert.equal(intervalLayersResult.some(layer => layer.mark?.type === 'rule'), true);
  assert.equal(intervalLayersResult.some(layer => layer.mark?.type === 'text'), true);
  assert.deepEqual((intervalLayersResult[0].encoding?.x as { sort?: unknown }).sort, ['A', 'B']);

  const dot = makeChart({
    id: 'dot',
    kind: 'dot',
    title: 'Dot',
    data: { points: [
      { category: 'A', value: 1 },
      { category: 'A', value: 2 },
      { category: 'B', value: 5 },
    ] },
  });
  const dotOptions = { ...factoryOptions('dot'), showMean: true } as Extract<ChartOptions, { kind: 'dot' }>;
  const dotLayersResult = dotLayers(dot, dotOptions);
  assert.equal(dotLayersResult.some(layer => layer.mark?.type === 'point'), true);
  assert.equal(dotLayersResult.some(layer => layer.mark?.shape === 'diamond'), true);

  const ecdf = makeChart({
    id: 'ecdf',
    kind: 'ecdf',
    title: 'ECDF',
    data: { points: [{ x: 1, y: 0.5 }, { x: 2, y: 1 }] },
  });
  const ecdfOptions = { ...factoryOptions('ecdf'), showPoints: true, showMedian: true } as Extract<ChartOptions, { kind: 'ecdf' }>;
  const ecdfLayersResult = ecdfLayers(ecdf, ecdfOptions);
  assert.equal(ecdfLayersResult.some(layer => layer.mark?.type === 'line'), true);
  assert.equal(ecdfLayersResult.some(layer => layer.mark?.type === 'point'), true);
  assert.equal(ecdfLayersResult.some(layer => layer.mark?.type === 'rule'), true);
});

test('line markers fall back to the series rows when no marker layer exists', () => {
  const chart = makeChart({
    id: 'calibration',
    kind: 'line',
    title: 'Calibration',
    data: { series: [{ x: 10, y: 20, series: 'Cal' }, { x: 20, y: 30, series: 'Cal' }] },
  });
  const options = { ...factoryOptions('line'), showMarkers: true } as Extract<
    ChartOptions,
    { kind: 'line' }
  >;
  const layers = lineLayers(chart, options);
  const points = layers.filter(layer => layer.mark?.type === 'point');
  assert.equal(points.length, 1);
  assert.equal((points[0].data?.values as unknown[]).length, 2);
});

test('step lines keep step:0 rows as a straight segment', () => {
  const chart = makeChart({
    id: 'roc',
    kind: 'line',
    title: 'ROC',
    data: {
      series: [
        { x: 0, y: 0, series: 'ROC' },
        { x: 50, y: 80, series: 'ROC' },
        { x: 100, y: 100, series: 'ROC' },
        { x: 0, y: 0, series: 'Diagonal', step: 0 },
        { x: 100, y: 100, series: 'Diagonal', step: 0 },
      ],
    },
  });
  const options = { ...factoryOptions('line'), step: true } as Extract<ChartOptions, { kind: 'line' }>;
  const layers = lineLayers(chart, options);
  const stepped = layers.find(layer => layer.mark?.interpolate === 'step-after');
  const smooth = layers.find(layer => layer.mark?.type === 'line' && layer.mark?.interpolate === undefined);
  assert.ok(stepped);
  assert.ok(smooth);
  assert.equal((stepped!.data?.values as unknown[]).length, 3);
  assert.deepEqual(
    (smooth!.data?.values as Array<Record<string, unknown>>).map(row => row.series),
    ['Diagonal', 'Diagonal']
  );
});

test('line charts draw the configured horizontal rules', () => {
  const chart = makeChart({
    id: 'line-rule',
    kind: 'line',
    title: 'Line',
    data: {
      series: [{ x: 1, y: 2 }, { x: 2, y: 3 }],
      rules: [{ value: 2.5 }],
    },
  });
  const options = factoryOptions('line') as Extract<ChartOptions, { kind: 'line' }>;
  const rules = lineLayers(chart, options).filter(layer => layer.mark?.type === 'rule');
  assert.equal(rules.length, 1);
  assert.equal((rules[0].encoding?.y as { field?: string }).field, 'value');
});

test('the risk table shows counts and optional cumulative events', () => {
  const chart = makeChart({
    id: 'risk',
    kind: 'risk',
    title: 'Risk',
    data: {
      rows: [
        { time: 0, group: 'A', atRisk: 10, events: 0 },
        { time: 5, group: 'A', atRisk: 4, events: 6 },
        { time: 0, group: 'B', atRisk: 8, events: 0 },
        { time: 5, group: 'B', atRisk: 2, events: 6 },
      ],
    },
  });
  const base = factoryOptions('risk') as Extract<ChartOptions, { kind: 'risk' }>;
  const plain = riskLayers(chart, { ...base, showEvents: false });
  const plainText = (plain[0].data?.values as Array<Record<string, unknown>>).map(row => row.text);
  assert.deepEqual(plainText, ['10', '4', '8', '2']);
  const detailed = riskLayers(chart, { ...base, showEvents: true });
  const detailedText = (detailed[0].data?.values as Array<Record<string, unknown>>).map(row => row.text);
  assert.deepEqual(detailedText, ['10 (0)', '4 (6)', '8 (0)', '2 (6)']);
});

test('bar grouping switches between stacked and side-by-side series', () => {
  const chart = makeChart({
    id: 'bar-grouped',
    kind: 'bar',
    title: 'Grouped',
    data: {
      bars: [
        { category: 'A', value: 2, series: 'S1' },
        { category: 'A', value: 3, series: 'S2' },
      ],
    },
  });
  const base = factoryOptions('bar') as Extract<ChartOptions, { kind: 'bar' }>;
  const stacked = barLayers(chart, { ...base, grouping: 'stacked' });
  assert.equal(stacked[0].encoding?.xOffset, undefined);
  assert.equal(stacked[0].encoding?.y?.stack, undefined);
  const grouped = barLayers(chart, { ...base, grouping: 'grouped' });
  assert.equal(grouped[0].encoding?.xOffset?.field, 'series');
  assert.equal(grouped[0].encoding?.y?.stack, null);
});

test('the mosaic draws one rect per cell, value labels and category labels', () => {
  const chart = makeChart({
    id: 'mosaic',
    kind: 'mosaic',
    title: 'Mosaic',
    data: {
      cells: [
        { row: 'A', col: 'X', value: 10, residual: -1, x0: 0, x1: 0.25, y0: 0.6, y1: 1, label: '10' },
        { row: 'A', col: 'Y', value: 30, residual: 1, x0: 0.25, x1: 1, y0: 0.6, y1: 1, label: '30' },
        { row: 'B', col: 'X', value: 20, residual: -0.5, x0: 0, x1: 0.33, y0: 0, y1: 0.6, label: '20' },
        { row: 'B', col: 'Y', value: 40, residual: 0.5, x0: 0.33, x1: 1, y0: 0, y1: 0.6, label: '40' },
      ],
    },
  });
  const base = factoryOptions('mosaic') as Extract<ChartOptions, { kind: 'mosaic' }>;
  const layers = mosaicLayers(chart, { ...base, showValues: true, residualColor: true });
  assert.equal(layers[0].mark?.type, 'rect');
  assert.equal(layers[0].encoding?.color?.field, 'residual');
  assert.equal(layers.some(layer => layer.mark?.type === 'text'), true);
  const texts = layers
    .filter(layer => layer.mark?.type === 'text')
    .flatMap(layer => (layer.data?.values as Array<Record<string, unknown>>).map(row => row.text));
  assert.ok(texts.includes('A') && texts.includes('B') && texts.includes('X') && texts.includes('10'), JSON.stringify(texts));
  const nominal = mosaicLayers(chart, { ...base, residualColor: false });
  assert.equal(nominal[0].encoding?.color?.field, 'row');
});

test('score showVectors draws variable arrows and labels', () => {
  const chart = makeChart({
    id: 'biplot',
    kind: 'score',
    title: 'Biplot',
    data: {
      points: [{ x: 1, y: 2 }, { x: -1, y: 0.5 }, { x: 0, y: -1 }],
      vectors: [
        { x: 0, y: 0, x2: 1, y2: 0.5, label: 'X1' },
        { x: 0, y: 0, x2: -0.5, y2: 1, label: 'X2' },
      ],
    },
  });
  const base = factoryOptions('score') as Extract<ChartOptions, { kind: 'score' }>;
  const hidden = scatterOnly(chart, { ...base, showVectors: false } as never);
  assert.equal(hidden.some(layer => layer.mark?.type === 'rule'), false);
  const shown = scatterOnly(chart, { ...base, showVectors: true } as never);
  assert.equal(shown.filter(layer => layer.mark?.type === 'rule').length, 1);
  assert.equal(
    shown.some(
      layer =>
        layer.mark?.type === 'text' &&
        (layer.data?.values as Array<Record<string, unknown>>).some(row => row.label === 'X1')
    ),
    true
  );
});
