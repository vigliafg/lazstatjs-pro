import test from 'node:test';
import assert from 'node:assert/strict';
import { featuresFor, specificFeatures } from './features';
import { factoryOptions } from './defaults';
import { makeChart } from './kits/common';
import type { ChartKind } from '../stats/charts';

const chartOf = (kind: ChartKind) =>
  makeChart({ id: 'c', kind, title: kind, data: { points: [{ x: 1, y: 2 }] } });

test('partial runner options are merged over the factory defaults', () => {
  const chart = makeChart({
    id: 'c',
    kind: 'box',
    title: 'Box',
    data: { summary: [{ category: 'A', min: 1, q1: 2, median: 3, q3: 4, max: 5 }] },
    options: { showPoints: true, showMean: true } as never,
  });
  assert.equal(chart.options.kind, 'box');
  assert.equal(chart.options.kind === 'box' ? chart.options.showPoints : null, true);
  assert.equal(chart.options.kind === 'box' ? chart.options.showMean : null, true);
});

test('the feature registry has general and specific controls', () => {
  const chart = chartOf('scatter');
  const features = featuresFor(chart);
  assert.ok(features.some(feature => feature.id === 'general.theme'));
  assert.ok(features.some(feature => feature.id === 'style.pointSize'));
  assert.ok(specificFeatures(chart).some(feature => feature.id === 'fit'));
});

test('specific controls are declared per kind', () => {
  assert.ok(specificFeatures(chartOf('box')).some(feature => feature.id === 'showOutliers'));
  assert.ok(specificFeatures(chartOf('survival')).some(feature => feature.id === 'showCensoring'));
  assert.equal(specificFeatures(chartOf('score')).some(feature => feature.id === 'showR2'), false);
});

test('setters update the option they describe and preserve the discriminant', () => {
  const options = factoryOptions('scatter');
  const fit = featuresFor(chartOf('scatter')).find(feature => feature.id === 'fit');
  assert.ok(fit);
  const next = fit!.set(options, 'both');
  assert.equal(next.kind, 'scatter');
  assert.equal(next.kind === 'scatter' ? next.fit : null, 'both');
});
