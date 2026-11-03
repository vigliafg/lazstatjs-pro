import test from 'node:test';
import assert from 'node:assert/strict';
import { fitHoltWinters, type HoltWintersSeasonal } from '../kernels/holtwinters';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface HoltWintersFixture {
  source: string;
  data: number[];
  period: number;
  models: Record<
    'additive' | 'multiplicative',
    {
      seasonal: HoltWintersSeasonal;
      alpha: number;
      beta: number;
      gamma: number;
      sse: number;
      level: number;
      trend: number;
      seasonalFinal: number[];
      forecast: number[];
    }
  >;
}

const fixture = loadFixture<HoltWintersFixture>('holtwinters.json');

for (const key of ['additive', 'multiplicative'] as const) {
  test(`Holt–Winters ${key} matches stats::HoltWinters`, () => {
    const reference = fixture.models[key];
    const fit = fitHoltWinters({
      values: fixture.data,
      period: fixture.period,
      horizon: reference.forecast.length,
      seasonal: key,
    });
    assert.ok(fit);
    assertClose(fit!.alpha, reference.alpha, { absolute: 1e-4 }, 'alpha');
    assertClose(fit!.beta, reference.beta, { absolute: 1e-4 }, 'beta');
    assertClose(fit!.gamma, reference.gamma, { absolute: 1e-4 }, 'gamma');
    assertClose(fit!.sse, reference.sse, { absolute: 1e-2 }, 'SSE');
    assertClose(fit!.level, reference.level, { absolute: 1e-2 }, 'final level');
    assertClose(fit!.trend, reference.trend, { absolute: 1e-2 }, 'final trend');
    assertCloseVector(fit!.seasonalFinal, reference.seasonalFinal, { absolute: 1e-2 }, 'final seasonal');
    assertCloseVector(
      fit!.forecast.map(point => point.mean),
      reference.forecast,
      { absolute: 5e-2 },
      'forecast'
    );
  });
}
