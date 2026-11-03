import test from 'node:test';
import assert from 'node:assert/strict';
import { adfTest } from '../kernels/arima';
import { kpssTest, phillipsPerronTest } from '../kernels/unitroot';
import { assertClose, loadFixture } from './harness';

interface UnitRootFixture {
  source: string;
  level: number[];
  difference: number[];
  levelTests: UnitRootCase;
  differenceTests: UnitRootCase;
}

interface UnitRootCase {
  adf: { stat: number; p: number; lags: number };
  kpssLevel: { stat: number; p: number; lags: number };
  kpssTrend: { stat: number; p: number; lags: number };
  pp: { stat: number; lags: number; cv5: number };
}

const fixture = loadFixture<UnitRootFixture>('unitroot.json');

const check = (values: number[], reference: UnitRootCase, label: string): void => {
  const adf = adfTest(values, { lags: reference.adf.lags, trend: true });
  assertClose(adf.stat, reference.adf.stat, { absolute: 1e-6 }, `${label} ADF stat`);
  assertClose(adf.p, reference.adf.p, { absolute: 0.01 }, `${label} ADF p`);

  const level = kpssTest(values, 'level');
  assertClose(level.stat, reference.kpssLevel.stat, { absolute: 1e-6 }, `${label} KPSS level`);
  assertClose(level.p, reference.kpssLevel.p, { absolute: 1e-12 }, `${label} KPSS level p`);
  assert.equal(level.lags, reference.kpssLevel.lags, `${label} KPSS level lags`);

  const trend = kpssTest(values, 'trend');
  assertClose(trend.stat, reference.kpssTrend.stat, { absolute: 1e-6 }, `${label} KPSS trend`);
  assertClose(trend.p, reference.kpssTrend.p, { absolute: 1e-12 }, `${label} KPSS trend p`);
  assert.equal(trend.lags, reference.kpssTrend.lags, `${label} KPSS trend lags`);

  const pp = phillipsPerronTest(values);
  assertClose(pp.stat, reference.pp.stat, { absolute: 1e-6 }, `${label} PP stat`);
  assert.equal(pp.lags, reference.pp.lags, `${label} PP lags`);
  assertClose(pp.cv5, reference.pp.cv5, { absolute: 1e-6 }, `${label} PP critical value`);
};

test('unit-root tests on the AirPassengers level match R', () => {
  check(fixture.level, fixture.levelTests, 'level');
});

test('unit-root tests on the first difference match R', () => {
  check(fixture.difference, fixture.differenceTests, 'difference');
});
