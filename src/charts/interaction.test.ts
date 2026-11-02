import test from 'node:test';
import assert from 'node:assert/strict';
import type { TopLevelSpec } from 'vega-lite';
import type { AnalysisChart, ChartOptions } from '../stats/charts';
import { mergeOptions } from './defaults';
import {
  DIM_OPACITY,
  HIDDEN_OPACITY,
  applyChartLink,
  brushRect,
  chartHasRowKeys,
  chartLinkable,
  chartRowKeys,
  interactionPoints,
  keysInPolygon,
  keysInRect,
  linkSignature,
  normalizeKeys,
  rowKeyOf,
} from './interaction';

const chart = (data: AnalysisChart['data'], kind: AnalysisChart['kind'] = 'scatter'): AnalysisChart => ({
  version: 1,
  id: 'c1',
  kind,
  title: 'Test',
  layout: 'full',
  data,
  fields: {},
  options: mergeOptions(kind, undefined) as ChartOptions,
});

const pointLayer = () => ({
  mark: { type: 'point' },
  encoding: { x: { field: 'x' }, y: { field: 'y' } },
});

const specOf = (layers: Record<string, unknown>[]): TopLevelSpec =>
  ({ layer: layers, width: 100, height: 100 }) as unknown as TopLevelSpec;

test('rowKeyOf reads string and numeric keys and rejects empty values', () => {
  assert.equal(rowKeyOf({ __row: '3' }), '3');
  assert.equal(rowKeyOf({ __row: 3 }), '3');
  assert.equal(rowKeyOf({ __row: '' }), null);
  assert.equal(rowKeyOf({ __row: null }), null);
  assert.equal(rowKeyOf({ __row: Number.NaN }), null);
  assert.equal(rowKeyOf({ x: 1 }), null);
});

test('chartHasRowKeys and chartRowKeys cover every layer', () => {
  const linked = chart({
    points: [{ x: 1, y: 2, __row: '1' }],
    summary: [{ category: 'A', value: 2, __row: 9 }],
  });
  assert.equal(chartHasRowKeys(linked), true);
  assert.deepEqual(chartRowKeys(linked), ['1', '9']);
  assert.equal(chartHasRowKeys(chart({ points: [{ x: 1, y: 2 }] })), false);
  assert.deepEqual(chartRowKeys(chart({ points: [{ x: 1, y: 2 }] })), []);
});

test('normalizeKeys dedupes, drops invalid values and caps the list', () => {
  assert.deepEqual(normalizeKeys(['a', 'a', '', 'b']), ['a', 'b']);
  assert.deepEqual(normalizeKeys(undefined), []);
  assert.equal(normalizeKeys(Array.from({ length: 30_000 }, (_, index) => String(index))).length, 20_000);
});

test('linkSignature is empty without a selection or hidden rows', () => {
  assert.equal(linkSignature(undefined), '');
  assert.equal(linkSignature({ keys: [], hidden: [] }), '');
  assert.notEqual(linkSignature({ keys: ['1'], hidden: [] }), '');
  assert.notEqual(linkSignature({ keys: [], hidden: ['1'] }), '');
});

test('interactionPoints prefers the observation layer and reads category/value', () => {
  const scatter = chart({ points: [{ x: 1, y: 2, __row: '0' }, { x: 2, y: 3, __row: '1' }] });
  assert.deepEqual(interactionPoints(scatter), [
    { key: '0', x: 1, y: 2 },
    { key: '1', x: 2, y: 3 },
  ]);

  const box = chart({ points: [{ category: 'A', value: 5, __row: '4' }] }, 'box');
  assert.deepEqual(interactionPoints(box), [{ key: '4', x: 'A', y: 5 }]);

  const keyless = chart({ points: [{ x: 1, y: 2 }] });
  assert.deepEqual(interactionPoints(keyless), []);
});

test('chartLinkable accepts point-based charts and rejects bins and plain lines', () => {
  const keyed = [{ x: 1, y: 2, __row: '0' }];
  assert.equal(chartLinkable(chart({ points: keyed })), true);
  assert.equal(chartLinkable(chart({ points: keyed }, 'residual')), true);
  const box = chart({ points: keyed }, 'box');
  assert.equal(chartLinkable(box), false);
  assert.equal(
    chartLinkable({ ...box, options: { ...box.options, showPoints: true } as ChartOptions }),
    true
  );
  assert.equal(chartLinkable(chart({ points: keyed }, 'dot')), true);
  assert.equal(chartLinkable(chart({ points: keyed }, 'qq')), true);
  assert.equal(chartLinkable(chart({ points: keyed }, 'histogram')), false);
  assert.equal(chartLinkable(chart({ values: keyed }, 'histogram')), false);
  assert.equal(chartLinkable(chart({ series: [{ x: 1, y: 2, __row: '0' }] }, 'line')), false);
  const line = chart({ series: [{ x: 1, y: 2, __row: '0' }] }, 'line');
  assert.equal(
    chartLinkable({ ...line, options: { ...line.options, showMarkers: true } as ChartOptions }),
    true
  );
  assert.equal(chartLinkable(chart({ points: [{ x: 1, y: 2 }] })), false);
});

test('applyChartLink dims point layers and leaves statistical layers alone', () => {
  const linked = chart({ points: [{ x: 1, y: 2, __row: '0' }] });
  const spec = specOf([
    pointLayer(),
    { mark: { type: 'line' }, encoding: {} },
    { mark: { type: 'rule' }, encoding: {} },
  ]);
  const out = applyChartLink(spec, linked, { keys: ['0'], hidden: ['1'] }) as unknown as {
    params: { name: string; value: string[] }[];
    layer: { transform?: { calculate: string }[]; encoding: { opacity?: unknown } }[];
  };
  assert.equal(out.layer[0].transform?.length, 1);
  assert.match(out.layer[0].transform?.[0].calculate ?? '', /__row/);
  assert.match(out.layer[0].transform?.[0].calculate ?? '', new RegExp(String(DIM_OPACITY)));
  assert.match(out.layer[0].transform?.[0].calculate ?? '', new RegExp(String(HIDDEN_OPACITY)));
  assert.match(out.layer[0].transform?.[0].calculate ?? '', /linkKeys/);
  assert.deepEqual(out.layer[0].encoding.opacity, {
    field: '__linkOpacity',
    type: 'quantitative',
    scale: null,
    legend: null,
  });
  assert.equal(out.layer[1].transform, undefined);
  assert.equal(out.layer[2].transform, undefined);
  assert.deepEqual(
    out.params.map(param => [param.name, param.value]),
    [
      ['linkKeys', ['0']],
      ['hiddenKeys', ['1']],
    ]
  );
});

test('applyChartLink scaffolds signals even without a selection, so later brushes reuse the view', () => {
  const linked = chart({ points: [{ x: 1, y: 2, __row: '0' }] });
  const spec = specOf([pointLayer()]);
  const out = applyChartLink(spec, linked, undefined) as unknown as {
    params: { name: string; value: string[] }[];
    layer: { transform?: { calculate: string }[] }[];
  };
  assert.deepEqual(
    out.params.map(param => [param.name, param.value]),
    [
      ['linkKeys', []],
      ['hiddenKeys', []],
    ]
  );
  assert.equal(out.layer[0].transform?.length, 1);
  assert.equal(
    applyChartLink(spec, chart({ points: [{ x: 1, y: 2 }] }), { keys: ['0'], hidden: [] }),
    spec
  );
});

test('applyChartLink keeps hidden rows dim when no brush is active', () => {
  const linked = chart({ points: [{ x: 1, y: 2, __row: '0' }] });
  const out = applyChartLink(specOf([pointLayer()]), linked, {
    keys: [],
    hidden: ['1'],
  }) as unknown as {
    params: { name: string; value: string[] }[];
    layer: { transform: { calculate: string }[] }[];
  };
  const hidden = out.params.find(param => param.name === 'hiddenKeys');
  assert.deepEqual(hidden?.value, ['1']);
});

test('keysInRect selects the points inside the brush', () => {
  const points = [
    { key: 'a', x: 10, y: 10 },
    { key: 'b', x: 50, y: 50 },
    { key: 'c', x: 90, y: 90 },
  ];
  assert.deepEqual(keysInRect(points, { x0: 5, y0: 5, x1: 60, y1: 60 }), ['a', 'b']);
  assert.deepEqual(keysInRect(points, { x0: 60, y0: 60, x1: 5, y1: 5 }), ['a', 'b']);
});

test('keysInPolygon selects the points inside a lasso and rejects degenerate shapes', () => {
  const points = [
    { key: 'a', x: 10, y: 10 },
    { key: 'b', x: 50, y: 50 },
    { key: 'c', x: 90, y: 90 },
  ];
  const polygon = [
    { x: 0, y: 0 },
    { x: 60, y: 0 },
    { x: 60, y: 60 },
    { x: 0, y: 60 },
  ];
  assert.deepEqual(keysInPolygon(points, polygon), ['a', 'b']);
  assert.deepEqual(keysInPolygon(points, polygon.slice(0, 2)), []);
});

test('brushRect ignores a click and normalises a drag', () => {
  assert.equal(brushRect({ x: 10, y: 10 }, { x: 11, y: 12 }), null);
  assert.deepEqual(brushRect({ x: 10, y: 10 }, { x: 40, y: 50 }), {
    x0: 10,
    y0: 10,
    x1: 40,
    y1: 50,
  });
});
