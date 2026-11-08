import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AXIS_KEYS,
  axisChannels,
  axisPropertyPatch,
  axisScalePatch,
} from './axisModel';
import { factoryOptions, mergeOptions } from './defaults';
import { featuresFor } from './features';
import { makeChart } from './kits/common';

test('factory options start with every axis on automatic', () => {
  const options = factoryOptions('scatter');
  assert.equal(options.xMin, null);
  assert.equal(options.yMax, null);
  assert.equal(options.xScaleType, 'auto');
  assert.equal(options.yNice, false);
  assert.equal(AXIS_KEYS.length, 16);
});

test('invalid stored axis values degrade to automatic', () => {
  const inverted = mergeOptions('scatter', { xMin: 10, xMax: 2 } as never);
  assert.equal(inverted.xMin, null);
  assert.equal(inverted.xMax, null);

  const nan = mergeOptions('scatter', { xMax: Number.NaN } as never);
  assert.equal(nan.xMax, null);

  const log = mergeOptions('scatter', { yScaleType: 'log', yMin: -4, yMax: 100 } as never);
  assert.equal(log.yScaleType, 'log');
  assert.equal(log.yMin, null);
  assert.equal(log.yMax, 100);

  const bogus = mergeOptions('scatter', { xScaleType: 'nope' } as never);
  assert.equal(bogus.xScaleType, 'auto');
});

test('the scale patch is empty until something is set', () => {
  assert.equal(axisScalePatch(factoryOptions('scatter'), 'x'), null);
  const limited = mergeOptions('scatter', { xMin: 1, xScaleType: 'log', xNice: true } as never);
  assert.deepEqual(axisScalePatch(limited, 'x'), {
    domainMin: 1,
    zero: false,
    type: 'log',
    nice: true,
  });
});

test('derived axes are excluded per chart kind', () => {
  assert.deepEqual(axisChannels('qq'), ['y']);
  assert.deepEqual(axisChannels('forest'), ['x']);
  assert.deepEqual(axisChannels('pareto'), []);
  assert.deepEqual(axisChannels('scatter'), ['x', 'y']);
});

test('axis controls are registered and accept an empty limit', () => {
  const chart = makeChart({
    id: 'c',
    kind: 'scatter',
    title: 'c',
    data: { points: [{ x: 1, y: 2 }] },
  });
  const xMin = featuresFor(chart).find(feature => feature.id === 'general.xMin');
  assert.ok(xMin);
  assert.equal(xMin!.type, 'numberInput');
  assert.equal(xMin!.get(factoryOptions('scatter')), '');

  const withLimit = xMin!.set(factoryOptions('scatter'), 4.5);
  assert.equal(withLimit.xMin, 4.5);
  assert.equal(xMin!.get(withLimit), 4.5);
  assert.equal(xMin!.set(withLimit, '').xMin, null);
});

test('the editor hides the controls of a derived axis', () => {
  const qq = makeChart({ id: 'qq', kind: 'qq', title: 'qq', data: { points: [{ x: 1, y: 2 }] } });
  const qqFeatures = featuresFor(qq);
  assert.equal(qqFeatures.find(feature => feature.id === 'general.xMin')!.visible?.(factoryOptions('qq'), qq), false);
  assert.equal(qqFeatures.find(feature => feature.id === 'general.yMin')!.visible?.(factoryOptions('qq'), qq), true);

  const pareto = makeChart({
    id: 'p',
    kind: 'pareto',
    title: 'p',
    data: { bars: [{ category: 'A', value: 1 }] },
  });
  assert.equal(
    featuresFor(pareto).find(feature => feature.id === 'general.xMin')!.visible?.(factoryOptions('pareto'), pareto),
    false
  );
});

test('tick count and label format are sanitised', () => {
  const rounded = mergeOptions('scatter', { xTickCount: 4.6, yLabelFormat: 'banana' } as never);
  assert.equal(rounded.xTickCount, 5);
  assert.equal(rounded.yLabelFormat, 'auto');

  const outOfRange = mergeOptions('scatter', { xTickCount: 1, yTickCount: 99 } as never);
  assert.equal(outOfRange.xTickCount, null);
  assert.equal(outOfRange.yTickCount, null);
});

test('the axis object patch carries ticks and the d3 format', () => {
  const options = mergeOptions('scatter', { xTickCount: 4, xLabelFormat: 'compact' } as never);
  assert.deepEqual(axisPropertyPatch(options, 'x'), { tickCount: 4, format: '~s' });
  assert.equal(axisPropertyPatch(factoryOptions('scatter'), 'x'), null);
});
