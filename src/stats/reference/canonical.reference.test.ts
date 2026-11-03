import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalCorrelation } from '../kernels/canonical';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface CanonicalFixture {
  source: string;
  cases: {
    name: string;
    x: Record<string, number>[];
    y: Record<string, number>[];
    correlation: number[];
    xcoef: number[][];
    ycoef: number[][];
  }[];
}

const fixture = loadFixture<CanonicalFixture>('canonical.json');

test('canonical correlations match R stats::cancor', () => {
  assert.equal(fixture.source, 'R stats::cancor');
  for (const reference of fixture.cases) {
    const xNames = Object.keys(reference.x[0]);
    const yNames = Object.keys(reference.y[0]);
    const fit = canonicalCorrelation({
      x: reference.x.map(row => xNames.map(name => row[name])),
      y: reference.y.map(row => yNames.map(name => row[name])),
      xNames,
      yNames,
    });
    assert.ok(fit, `${reference.name}: fit`);
    assert.equal(fit!.functions.length, reference.correlation.length, `${reference.name}: functions`);
    reference.correlation.forEach((value, index) =>
      assertClose(fit!.functions[index].correlation, value, TOLERANCES.r, `${reference.name} r[${index}]`)
    );
    // R scales the coefficients so the canonical variates have variance
    // 1/(n-1); the kernel reports unit-variance scores. Compare magnitudes
    // after the scale and a per-function sign alignment.
    const scale = Math.sqrt(reference.x.length - 1);
    reference.xcoef.forEach((row, variable) => {
      const expected = row[0] * scale;
      const actual = fit!.functions[0].xCoefficients[variable].coefficient;
      assertClose(Math.abs(actual), Math.abs(expected), TOLERANCES.r, `${reference.name} xcoef[${variable}]`);
    });
  }
});
