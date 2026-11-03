import test from 'node:test';
import assert from 'node:assert/strict';
import { fitArima, type ArimaOrder } from '../kernels/arima';
import { assertClose, assertCloseVector, loadFixture } from './harness';

interface ArimaxFixture {
  source: string;
  y: number[];
  x: number[];
  models: {
    order: [number, number, number];
    coefficients: { ar1?: number; ma1?: number; intercept: number; xreg: number };
    sse: number;
    forecast: number[];
  }[];
}

const fixture = loadFixture<ArimaxFixture>('arimax.json');

for (const reference of fixture.models) {
  test(`ARIMAX(${reference.order.join(',')}) matches forecast::Arima`, () => {
    const order: ArimaOrder = {
      p: reference.order[0],
      d: reference.order[1],
      q: reference.order[2],
      P: 0,
      D: 0,
      Q: 0,
      s: 0,
    };
    const fit = fitArima(fixture.y, order, {
      horizon: reference.forecast.length,
      xreg: fixture.x.map(value => [value]),
      xregNames: ['Solar.R'],
      xregFuture: Array.from({ length: reference.forecast.length }, () => [fixture.x[fixture.x.length - 1]]),
    });
    assert.ok(fit);

    const term = (name: string): number =>
      Number(fit!.coefficients.find(coefficient => coefficient.term === name)?.estimate ?? NaN);
    if (reference.coefficients.ar1 !== undefined) {
      assertClose(term('AR(1)'), reference.coefficients.ar1, { absolute: 1e-5 }, 'AR(1)');
    }
    if (reference.coefficients.ma1 !== undefined) {
      assertClose(term('MA(1)'), reference.coefficients.ma1, { absolute: 5e-4 }, 'MA(1)');
    }
    assertClose(term('Solar.R'), reference.coefficients.xreg, { absolute: 5e-4 }, 'xreg');

    // R reports c / (1 - sum(phi)) as the intercept.
    const phi = order.p > 0 ? term('AR(1)') : 0;
    assertClose(term('Costante') / (1 - phi), reference.coefficients.intercept, { absolute: 1e-1 }, 'intercept');

    assertClose(fit!.sse, reference.sse, { relative: 1e-3 }, 'SSE');
    assertCloseVector(
      fit!.forecast.map(point => point.mean),
      reference.forecast,
      { absolute: 1e-1 },
      'forecast'
    );
  });
}
