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

test('visibility flags preserve the statistical variant', () => {
  const scatter = specificFeatures(chartOf('scatter'));
  const fit = scatter.find(feature => feature.id === 'showFit');
  const band = scatter.find(feature => feature.id === 'showBand');
  assert.ok(fit);
  assert.ok(band);
  const scatterOptions = { ...factoryOptions('scatter'), fit: 'none', band: 'none' } as never;
  assert.equal(fit!.visible?.(scatterOptions, chartOf('scatter')), false);
  assert.equal(band!.visible?.(scatterOptions, chartOf('scatter')), false);

  const bar = specificFeatures(chartOf('bar'));
  assert.ok(bar.some(feature => feature.id === 'showErrorBars'));
  assert.ok(bar.some(feature => feature.id === 'capSize'));

  const box = specificFeatures(chartOf('box'));
  const whiskers = box.find(feature => feature.id === 'showWhiskers');
  assert.ok(whiskers);
  assert.equal(whiskers!.visible?.({ ...factoryOptions('box'), display: 'box' } as never, chartOf('box')), true);
  assert.equal(whiskers!.visible?.({ ...factoryOptions('box'), display: 'violin' } as never, chartOf('box')), false);
});

test('box display offers four modes and normalizes an unknown stored value', () => {
  const chart = chartOf('box');
  const display = specificFeatures(chart).find(feature => feature.id === 'display');
  assert.ok(display);
  assert.deepEqual(
    display!.choices?.map(item => item.value),
    ['box', 'notched', 'violin', 'raincloud']
  );
  const factory = factoryOptions('box');
  assert.equal(factory.kind === 'box' ? factory.display : null, 'box');
  assert.equal(display!.get(factory), 'box');

  const dirty = { ...factory, display: 'bogus' } as never;
  assert.equal(display!.get(dirty), 'box');
  const next = display!.set(dirty, 'violin');
  assert.equal(next.kind === 'box' ? next.display : null, 'violin');
});

test('box-specific toggles are hidden for the violin display', () => {
  const chart = chartOf('box');
  const violin = { ...factoryOptions('box'), display: 'violin' } as never;
  const box = factoryOptions('box');
  for (const id of ['showPoints', 'showOutliers', 'showMean', 'labelMedian']) {
    const feature = specificFeatures(chart).find(item => item.id === id);
    assert.ok(feature);
    assert.equal(feature!.visible?.(violin, chart), false);
    assert.equal(feature!.visible?.(box, chart), true);
  }
  const pointSize = featuresFor(chart).find(feature => feature.id === 'style.pointSize');
  assert.ok(pointSize);
  assert.equal(pointSize!.visible?.(violin, chart), false);
  assert.equal(pointSize!.visible?.(box, chart), true);
});

test('setters update the option they describe and preserve the discriminant', () => {
  const options = factoryOptions('scatter');
  const fit = featuresFor(chartOf('scatter')).find(feature => feature.id === 'fit');
  assert.ok(fit);
  const next = fit!.set(options, 'both');
  assert.equal(next.kind, 'scatter');
  assert.equal(next.kind === 'scatter' ? next.fit : null, 'both');
});

test('point labels are exposed only when the chart carries labels', () => {
  const scatter = specificFeatures(chartOf('scatter')).find(feature => feature.id === 'pointLabels');
  assert.ok(scatter);
  assert.equal(scatter!.visible?.(factoryOptions('scatter'), chartOf('scatter')), false);

  const labelled = makeChart({
    id: 'labels',
    kind: 'scatter',
    title: 'Labels',
    data: { points: [{ x: 1, y: 2, label: 'A' }] },
  });
  assert.equal(scatter!.visible?.(factoryOptions('scatter'), labelled), true);

  const score = makeChart({
    id: 'score',
    kind: 'score',
    title: 'Score',
    data: { points: [{ x: 1, y: 2, label: 'A' }] },
  });
  const scoreLabels = specificFeatures(score).find(feature => feature.id === 'showLabels');
  assert.ok(scoreLabels);
  assert.equal(scoreLabels!.visible?.(factoryOptions('score'), score), true);
  assert.equal(scoreLabels!.visible?.(factoryOptions('score'), chartOf('score')), false);
});

test('score vectors are offered only when the chart carries them', () => {
  const score = makeChart({
    id: 'biplot',
    kind: 'score',
    title: 'Biplot',
    data: { points: [{ x: 1, y: 2 }], vectors: [{ x: 0, y: 0, x2: 1, y2: 1, label: 'X' }] },
  });
  const vectors = specificFeatures(score).find(feature => feature.id === 'showVectors');
  assert.ok(vectors);
  assert.equal(vectors!.visible?.(factoryOptions('score'), score), true);
  assert.equal(vectors!.visible?.(factoryOptions('score'), chartOf('score')), false);
});
