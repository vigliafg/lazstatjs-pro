import test from 'node:test';
import assert from 'node:assert/strict';
import { multiControlChart } from '../kernels/mcontrol';
import { assertClose, assertCloseMatrix, assertCloseVector, loadFixture } from './harness';

interface MultiControlFixture {
  source: string;
  data: number[][];
  alpha: number;
  subgroup: number;
  variables: string[];
  center: number[];
  covariance: number[][];
  t2: number[];
  df1: number;
  df2: number;
  critical: number;
  ucl: number;
}

const fixture = loadFixture<MultiControlFixture>('mcontrol.json');

test('the T² chart matches the base-R pooled covariance formulation', () => {
  const result = multiControlChart({
    rows: fixture.data,
    variableNames: fixture.variables,
    subgroup: fixture.subgroup,
    alpha: fixture.alpha,
  });
  assert.ok(result);

  assertCloseVector(result!.center, fixture.center, { absolute: 1e-10 }, 'center');
  assertCloseMatrix(result!.covariance, fixture.covariance, { absolute: 1e-12 }, 'covariance');
  assertCloseVector(
    result!.points.map(point => point.t2),
    fixture.t2,
    { absolute: 1e-9 },
    'T²'
  );
  assert.equal(result!.df1, fixture.df1);
  assert.equal(result!.df2, fixture.df2);
  assertClose(result!.critical, fixture.critical, { absolute: 1e-10 }, 'critical F');
  assertClose(result!.ucl, fixture.ucl, { absolute: 1e-10 }, 'UCL');
});
