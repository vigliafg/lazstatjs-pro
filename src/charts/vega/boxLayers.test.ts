import test from 'node:test';
import assert from 'node:assert/strict';
import { boxLayers, notchBounds } from './boxLayers';
import { factoryOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartOptions, ChartRow } from '../../stats/charts';

const summary: ChartRow[] = [
  { category: 'B', n: 20, min: 1, q1: 2, median: 10, q3: 11, max: 12, mean: 6 },
  { category: 'A', n: 20, min: 1, q1: 2, median: 2, q3: 3, max: 4, mean: 2 },
];
const points: ChartRow[] = Array.from({ length: 20 }, (_, index) => [
  { category: 'A', value: 1 + index * 0.15 },
  { category: 'B', value: 5 + index * 0.3 },
]).flat();

const chart = makeChart({
  id: 'box',
  kind: 'box',
  title: 'Box',
  data: { summary, points, outliers: [] },
  fields: { xLabel: 'Group', yLabel: 'Value' },
});

const options = (patch: Partial<Extract<ChartOptions, { kind: 'box' }>>) =>
  ({ ...factoryOptions('box'), ...patch }) as Extract<ChartOptions, { kind: 'box' }>;

test('notchBounds returns null without n, with n<=1 or without IQR', () => {
  assert.equal(notchBounds(1, 2, 3, Number.NaN), null);
  assert.equal(notchBounds(1, 2, 3, 1), null);
  assert.equal(notchBounds(2, 2, 2, 20), null);
});

test('notchBounds folds the interval into the box and handles the median at a quartile', () => {
  const folded = notchBounds(0, 0.1, 10, 2);
  assert.deepEqual(folded, { lo: 0, hi: 10 });
  const atQuartile = notchBounds(2, 2, 4, 10);
  assert.ok(atQuartile);
  assert.equal(atQuartile!.lo, 2);
  assert.ok(atQuartile!.hi > 2 && atQuartile!.hi <= 4);
});

test('the standard box follows the sorted category order', () => {
  const layers = boxLayers(chart, options({ sort: 'asc' }));
  const x = layers[0].encoding?.x as { sort?: string[] };
  assert.deepEqual(x.sort, ['A', 'B']);
});

test('the percentile whiskers use p10/p90 instead of the Tukey min/max', () => {
  const withPercentiles = makeChart({
    id: 'percentile-box',
    kind: 'box',
    title: 'Percentile box',
    data: {
      summary: [
        {
          category: 'A',
          n: 20,
          min: 2,
          p10: 3,
          q1: 4,
          median: 5,
          q3: 6,
          p90: 7,
          max: 8,
          mean: 5,
          meanLo: 4.5,
          meanHi: 5.5,
        },
      ],
      points: [],
      outliers: [],
    },
  });
  const layers = boxLayers(withPercentiles, options({ whisker: 'percentile' }));
  const whisker = layers.find(
    layer => layer.mark?.type === 'rule' && layer.encoding?.y?.field === 'p10'
  );
  assert.ok(whisker);
  assert.equal(whisker!.encoding?.y2?.field, 'p90');
  assert.equal(
    layers.some(layer => layer.mark?.type === 'rule' && layer.encoding?.y?.field === 'min'),
    false
  );
});

test('the mean interval is drawn only when both bounds are finite', () => {
  const withInterval = makeChart({
    id: 'mean-interval',
    kind: 'box',
    title: 'Mean interval',
    data: {
      summary: [
        {
          category: 'A',
          n: 20,
          min: 1,
          p10: 2,
          q1: 3,
          median: 4,
          q3: 5,
          p90: 6,
          max: 7,
          mean: 4,
          meanLo: 3.5,
          meanHi: 4.5,
        },
      ],
      points: [],
      outliers: [],
    },
  });
  const layers = boxLayers(withInterval, options({ showMeanInterval: true }));
  const interval = layers.find(
    layer => layer.mark?.type === 'rule' && layer.encoding?.y?.field === 'meanLo'
  );
  assert.ok(interval);
  assert.equal(interval!.encoding?.y2?.field, 'meanHi');

  const missing = makeChart({
    id: 'no-interval',
    kind: 'box',
    title: 'No interval',
    data: { summary: [{ category: 'A', n: 1, min: 5, q1: 5, median: 5, q3: 5, max: 5, mean: 5 }] },
  });
  const missingLayers = boxLayers(missing, options({ showMeanInterval: true }));
  assert.equal(
    missingLayers.some(layer => layer.encoding?.y?.field === 'meanLo'),
    false
  );
});

test('jitter is deterministic, cycles after 101 points and is off by default', () => {
  const repeated = makeChart({
    id: 'jitter',
    kind: 'box',
    title: 'Jitter',
    data: {
      summary: [{ category: 'A', n: 120, min: 1, q1: 2, median: 3, q3: 4, max: 5, mean: 3 }],
      points: Array.from({ length: 120 }, () => ({ category: 'A', value: 3 })),
      outliers: [],
    },
  });
  const jittered = boxLayers(repeated, options({ showPoints: true, jitter: true })).find(
    layer => layer.encoding?.xOffset !== undefined
  );
  assert.ok(jittered);
  const rows = jittered!.data.values as ChartRow[];
  assert.equal(jittered!.encoding?.xOffset?.field, 'jitter');
  assert.equal(rows[0].jitter, rows[101].jitter);
  assert.ok(rows.every(row => Number(row.jitter) >= -0.2 && Number(row.jitter) <= 0.2));

  const plain = boxLayers(repeated, options({ showPoints: true })).find(
    layer => layer.mark?.filled === true
  );
  assert.ok(plain);
  assert.equal(plain!.encoding?.xOffset, undefined);
});

test('the notched layer narrows at the median and keeps full width at Q1/Q3', () => {
  const layers = boxLayers(chart, options({ display: 'notched' }));
  const area = layers[0];
  const rows = area.data.values as ChartRow[];
  const b = rows.filter(row => row.category === 'B');
  const bounds = notchBounds(2, 10, 11, 20);
  assert.ok(bounds);
  assert.deepEqual(
    b.map(row => row.y),
    [2, bounds!.lo, 10, bounds!.hi, 11]
  );
  const median = b.find(row => row.y === 10);
  assert.equal(median?.x1, median?.x2);
  assert.ok(Number(b[0].x2) - Number(b[0].x1) > 0);
});

test('a constant group in violin mode is drawn as an explicit point, not a hole', () => {
  const constant = makeChart({
    id: 'constant',
    kind: 'box',
    title: 'Constant',
    data: {
      summary: [
        { category: 'A', n: 3, min: 5, q1: 5, median: 5, q3: 5, max: 5, mean: 5 },
        { category: 'B', n: 8, min: 1, q1: 2, median: 3, q3: 4, max: 5, mean: 3 },
      ],
      points: [
        { category: 'A', value: 5 },
        { category: 'A', value: 5 },
        { category: 'B', value: 1 },
        { category: 'B', value: 2 },
        { category: 'B', value: 3 },
        { category: 'B', value: 4 },
        { category: 'B', value: 5 },
      ],
      outliers: [],
    },
  });
  const layers = boxLayers(constant, options({ display: 'violin' }));
  assert.ok(layers.some(layer => layer.mark?.type === 'point'));
});

test('the violin layer is symmetric and uses the summary order for its centres', () => {
  const layers = boxLayers(chart, options({ display: 'violin' }));
  const area = layers[0];
  const rows = area.data.values as ChartRow[];
  assert.ok(rows.length > 0);
  assert.equal(rows[0].category, 'B');
  assert.equal(rows[rows.length - 1].category, 'A');
  rows.forEach(row => {
    assert.ok(Math.abs((Number(row.x1) + Number(row.x2)) / 2 - (row.category === 'B' ? 0 : 1)) < 1e-9);
  });
});
