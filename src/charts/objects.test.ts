import test from 'node:test';
import assert from 'node:assert/strict';
import { makeChart } from './kits/common';
import { featuresFor } from './features';
import { objectFeatureIds, panelObjects } from './objects';
import type { ChartKind } from '../stats/charts';

const chartOf = (kind: ChartKind) =>
  makeChart({
    id: kind,
    kind,
    title: kind,
    data: {
      bars: [{ category: 'A', value: 1 }],
      points: [{ x: 1, y: 2 }],
      series: [{ x: 1, y: 2, series: 'A' }],
      summary: [{ category: 'A', min: 0, q1: 1, median: 2, q3: 3, max: 4, mean: 2, n: 5 }],
      curves: [{ x: 1, y: 1, series: 'A' }],
    },
  });

const specificIds = (kind: ChartKind): string[] =>
  featuresFor(chartOf(kind))
    .filter(feature => feature.group === 'specific')
    .map(feature => feature.id);

const flattenIds = (kind: ChartKind): string[] =>
  panelObjects(chartOf(kind)).flatMap(objectFeatureIds);

test('pilot objects assign every specific feature exactly once', () => {
  for (const kind of ['box', 'scatter', 'line', 'bar', 'survival'] as const) {
    const expected = specificIds(kind);
    const ids = flattenIds(kind).filter(id => expected.includes(id));
    assert.deepEqual([...ids].sort(), [...expected].sort(), kind);
    assert.equal(new Set(ids).size, ids.length, `${kind}: duplicate feature`);
  }
});

test('pilot objects expose the real visibility toggles', () => {
  const box = panelObjects(chartOf('box')).find(node => node.id === 'box');
  assert.ok(box);
  const whiskers = box!.children?.find(node => node.id === 'box-whiskers');
  assert.equal(whiskers?.visibility, 'showWhiskers');
  const scatter = panelObjects(chartOf('scatter')).find(node => node.id === 'scatter');
  const fit = scatter!.children?.find(node => node.id === 'scatter-fit');
  assert.equal(fit?.visibility, 'showFit');
  const bar = panelObjects(chartOf('bar')).find(node => node.id === 'bar');
  const errors = bar!.children?.find(node => node.id === 'bar-errors');
  assert.equal(errors?.visibility, 'showErrorBars');
});

test('non-pilot kinds fall back to feature sections without losing controls', () => {
  const kind: ChartKind = 'histogram';
  const objects = panelObjects(chartOf(kind));
  const expected = specificIds(kind);
  const ids = objects.flatMap(objectFeatureIds).filter(id => expected.includes(id));
  assert.deepEqual([...ids].sort(), [...expected].sort());
  assert.ok(objects.some(object => object.id.startsWith('section-')));
});

test('common properties are always in the panel', () => {
  const ids = panelObjects(chartOf('box')).flatMap(objectFeatureIds);
  assert.ok(ids.includes('general.showTitle'));
  assert.ok(ids.includes('general.showLegend'));
  assert.ok(ids.includes('style.pointSize'));
});
