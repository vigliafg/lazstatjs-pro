import test from 'node:test';
import assert from 'node:assert/strict';
import type { AnalysisChart, ChartOptions } from '../stats/charts';
import { mergeOptions } from './defaults';
import {
  predictionPosition,
  predictSurface,
  surfaceModelOf,
  surfaceSlice,
} from './profiler';

const surface = (stats: Record<string, number | string | null>): AnalysisChart => ({
  version: 1,
  id: 'doe-surface',
  kind: 'surface',
  title: 'Surface',
  layout: 'full',
  data: { lines: [{ x1: 0, y1: 0, x2: 1, y2: 1 }] },
  fields: { xLabel: 'A', yLabel: 'B' },
  stats,
  options: mergeOptions('surface', undefined) as ChartOptions,
});

const quadratic: Record<string, number | string | null> = {
  aMin: 0,
  aMax: 10,
  bMin: -1,
  bMax: 1,
  zMin: 0,
  zMax: 100,
  coefIntercept: 1,
  coefA: 2,
  coefB: 3,
  coefAA: 0.5,
  coefAB: 0.25,
  coefBB: 0,
  model: 'quadratic',
};

test('surfaceModelOf reads a complete quadratic model', () => {
  const model = surfaceModelOf(surface(quadratic));
  assert.ok(model);
  assert.equal(model!.quadratic, true);
  assert.equal(model!.aMin, 0);
  assert.equal(model!.aMax, 10);
});

test('surfaceModelOf rejects incomplete or empty ranges', () => {
  assert.equal(surfaceModelOf(surface({ ...quadratic, coefB: null })), null);
  assert.equal(surfaceModelOf(surface({ ...quadratic, aMax: 0 })), null);
  assert.equal(surfaceModelOf(surface({ ...quadratic, coefAA: null })), null);
  assert.equal(surfaceModelOf({ ...surface(quadratic), kind: 'scatter' }), null);
  assert.equal(surfaceModelOf(surface({ ...quadratic, model: 'linear', coefAA: null, coefAB: null, coefBB: null }))?.quadratic, false);
});

test('predictSurface evaluates linear and quadratic terms and clamps the range', () => {
  const model = surfaceModelOf(surface(quadratic))!;
  assert.equal(predictSurface(model, 2, 0), 1 + 4 + 0 + 2 + 0 + 0);
  assert.equal(predictSurface(model, 2, 0.5), 1 + 4 + 1.5 + 2 + 0.25 + 0);
  // Out-of-range factors are clamped, not extrapolated.
  assert.equal(predictSurface(model, -100, 5), predictSurface(model, 0, 1));
});

test('predictionPosition maps the prediction onto the fitted range', () => {
  const model = surfaceModelOf(surface(quadratic))!;
  assert.equal(predictionPosition(model, 0), 0);
  assert.equal(predictionPosition(model, 100), 100);
  assert.equal(predictionPosition(model, 50), 50);
  assert.equal(predictionPosition({ ...model, zMin: Number.NaN, zMax: Number.NaN }, 50), 50);
});

test('surfaceSlice returns a cross-section for either factor', () => {
  const model = surfaceModelOf(surface(quadratic))!;
  const alongA = surfaceSlice(model, 'a', 0, 5);
  assert.equal(alongA.length, 5);
  assert.equal(alongA[0].x, 0);
  assert.equal(alongA[4].x, 10);
  const alongB = surfaceSlice(model, 'b', 0, 5);
  assert.equal(alongB[0].x, -1);
  assert.equal(alongB[4].x, 1);
});
