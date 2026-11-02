import test from 'node:test';
import assert from 'node:assert/strict';
import { factoryOptions } from '../defaults';
import { makeChart } from '../kits/common';
import type { ChartOptions } from '../../stats/charts';
import {
  bubbleLayers,
  circleLayers,
  diamondLayers,
  scatter3dLayers,
  scatterMatrixLayers,
  shadowgramLayers,
} from './objectLayers';

const intervals = [
  { category: 'A', estimate: 2, lo: 1, hi: 3 },
  { category: 'B', estimate: 5, lo: 4, hi: 8 },
];

const diamondChart = makeChart({
  id: 'diamond',
  kind: 'diamond',
  title: 'Diamond',
  data: { intervals },
});
const options = <K extends ChartOptions['kind']>(kind: K, patch: Record<string, unknown> = {}) =>
  ({ ...factoryOptions(kind), ...patch }) as Extract<ChartOptions, { kind: K }>;

test('the mean diamond draws a diamond per estimate and scales it to the CI', () => {
  const fixed = diamondLayers(diamondChart, options('diamond'));
  const marker = fixed.find(layer => layer.mark?.shape === 'diamond');
  assert.ok(marker);
  assert.equal(marker!.mark?.size, Math.max(60, factoryOptions('diamond').pointSize));
  assert.equal(marker!.encoding?.size, undefined);

  const scaled = diamondLayers(diamondChart, options('diamond', { scaleToCI: true }));
  const scaledMarker = scaled.find(layer => layer.mark?.shape === 'diamond');
  assert.ok(scaledMarker);
  assert.equal(scaledMarker!.encoding?.size?.field, 'span');
  const values = scaledMarker!.data.values as Array<{ span: number }>;
  assert.deepEqual(values.map(row => row.span), [2, 4]);
});

test('comparison circles encode the interval width and keep the labels optional', () => {
  const layers = circleLayers(diamondChart, options('circles', { showLabels: true }));
  const circles = layers.find(layer => layer.mark?.type === 'point');
  assert.ok(circles);
  assert.equal(circles!.encoding?.size?.field, 'span');
  assert.equal(circles!.encoding?.x?.field, 'estimate');
  assert.ok(layers.some(layer => layer.mark?.type === 'rule'));
  assert.ok(layers.some(layer => layer.mark?.type === 'text'));
  const compact = circleLayers(diamondChart, options('circles', { showLabels: false, showIntervals: false }));
  assert.equal(compact.some(layer => layer.mark?.type === 'text'), false);
  assert.equal(compact.some(layer => layer.mark?.type === 'rule'), false);
});

test('the shadowgram is an area with an optional rug and mean line', () => {
  const chart = makeChart({
    id: 'shadow',
    kind: 'shadowgram',
    title: 'Shadowgram',
    data: { values: [1, 1.2, 2, 2.3, 3, 3.5, 4, 5].map(value => ({ value })) },
  });
  const layers = shadowgramLayers(
    chart,
    options('shadowgram', { showRug: true, showMeanLine: true })
  );
  const area = layers.find(layer => layer.mark?.type === 'area');
  assert.ok(area);
  assert.ok((area!.data.values as unknown[]).length > 10);
  assert.ok(layers.some(layer => layer.mark?.type === 'tick'));
  const mean = layers
    .filter(layer => layer.mark?.type === 'rule')
    .map(layer => (layer.data.values as Array<{ value: number }>)[0].value);
  assert.equal(mean.length, 1);
  assert.ok(Math.abs(mean[0] - 2.75) < 0.001);

  const bare = shadowgramLayers(chart, options('shadowgram', { showRug: false, showMeanLine: false }));
  assert.equal(bare.some(layer => layer.mark?.type === 'tick'), false);
  assert.equal(bare.some(layer => layer.mark?.type === 'rule'), false);
});

test('the scatter matrix draws panel frames, points and ellipses from the prepared data', () => {
  const chart = makeChart({
    id: 'matrix',
    kind: 'scattermatrix',
    title: 'Matrix',
    data: {
      points: [{ x: 0.3, y: 1.4 }, { x: 0.7, y: 1.6 }],
      panels: [
        { px: 0, px2: 1, py: 0, py2: 1 },
        { px: 1, px2: 2, py: 0, py2: 1 },
      ],
      ellipses: [{ x: 0.5, y: 1.5 }, { x: 0.6, y: 1.4 }],
      labels: [{ x: 0.5, y: 2.1, label: 'A' }],
    },
    stats: { dim: 2 },
  });
  const layers = scatterMatrixLayers(chart, options('scattermatrix', { showEllipses: true }));
  assert.ok(layers.some(layer => layer.mark?.type === 'rect'));
  assert.ok(layers.some(layer => layer.mark?.type === 'line'));
  assert.ok(layers.some(layer => layer.mark?.type === 'text'));
  const frame = layers.find(layer => layer.mark?.type === 'rect');
  assert.equal(frame!.encoding?.x2?.field, 'px2');

  const without = scatterMatrixLayers(
    chart,
    options('scattermatrix', { showEllipses: false })
  );
  assert.equal(without.some(layer => layer.mark?.type === 'line'), false);
});

test('the bubble plot encodes the size channel and keeps the size legend optional', () => {
  const chart = makeChart({
    id: 'bubble',
    kind: 'bubble',
    title: 'Bubble',
    data: {
      points: [
        { x: 1, y: 2, size: 4 },
        { x: 2, y: 3, size: 9 },
      ],
    },
  });
  const layers = bubbleLayers(chart, options('bubble', { showSizeLegend: true }));
  const points = layers[0];
  assert.equal(points.encoding?.size?.field, 'size');
  assert.ok(points.encoding?.size?.legend);
  const without = bubbleLayers(chart, options('bubble', { showSizeLegend: false }));
  assert.equal(without[0].encoding?.size?.legend, null);
});

test('the 3D scatter projects z and can show a density ellipse', () => {
  const chart = makeChart({
    id: 'space',
    kind: 'scatter3d',
    title: '3D',
    data: {
      points: [
        { x: 1, y: 2, z: 1 },
        { x: 2, y: 3, z: 2 },
        { x: 3, y: 1, z: 3 },
        { x: 4, y: 4, z: 4 },
      ],
    },
  });
  const layers = scatter3dLayers(chart, options('scatter3d', { showEllipsoid: true }));
  const ellipse = layers.find(layer => layer.mark?.type === 'line');
  assert.ok(ellipse);
  const points = layers.find(layer => layer.mark?.type === 'point');
  assert.ok(points);
  assert.equal(points!.encoding?.size?.field, 'z');
  const values = points!.data.values as Array<{ x: number; y: number; z: number }>;
  assert.ok(values.every(row => row.x >= 0 && row.y >= 0 && row.z >= 0));
  assert.ok(values.some(row => row.x > 1.45 - 0.45));

  const noPoints = scatter3dLayers(chart, options('scatter3d', { showPoints: false }));
  assert.equal(noPoints.some(layer => layer.mark?.type === 'point'), false);
});
