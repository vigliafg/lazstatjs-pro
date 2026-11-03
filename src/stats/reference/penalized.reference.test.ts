import test from 'node:test';
import assert from 'node:assert/strict';
import { fitPenalized, type Penalty } from '../kernels/penalized';
import { assertClose, assertCloseVector, loadFixture, type Tolerance } from './harness';

interface PenalizedCase {
  name: string;
  penalty: Penalty;
  alpha: number;
  lambda: number;
  coefficients: number[];
  intercept: number;
  df: number;
  r2: number;
}

interface PenalizedFixture {
  source: string;
  generatedBy: string;
  y: number[];
  x: number[][];
  cases: PenalizedCase[];
}

const fixture = loadFixture<PenalizedFixture>('penalized.json');

// glmnet's coordinate descent stops at its own threshold, so the comparison is
// declared at 1e-4 absolute (observed differences are around 1e-5).
const TOLERANCE: Tolerance = { absolute: 1e-4, relative: 1e-5 };

test('penalized fits match the glmnet fixtures', () => {
  const design = fixture.y.map((_, row) => fixture.x.map(column => column[row]));
  for (const reference of fixture.cases) {
    const fit = fitPenalized({
      y: fixture.y,
      x: design,
      penalty: reference.penalty,
      alpha: reference.alpha,
      lambda: reference.lambda,
    });
    assert.ok(fit, `${reference.name}: fit returned null`);
    assertCloseVector(fit!.coefficients, reference.coefficients, TOLERANCE, `${reference.name} coefficients`);
    assertClose(fit!.intercept, reference.intercept, TOLERANCE, `${reference.name} intercept`);
    assert.equal(fit!.df, reference.df, `${reference.name} df`);
    assertClose(fit!.r2, reference.r2, TOLERANCE, `${reference.name} r2`);
  }
});
