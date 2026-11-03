import test from 'node:test';
import assert from 'node:assert/strict';
import { correspondenceAnalysis } from '../kernels/correspondence';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface CorrespondenceFixture {
  source: string;
  cases: {
    name: string;
    observed: number[][];
    rows: string[];
    cols: string[];
    sv: number[];
    inertia: number[];
    totalInertia: number;
    chi2: number;
    df: number;
    rowcoord: number[][];
    colcoord: number[][];
  }[];
}

const fixture = loadFixture<CorrespondenceFixture>('correspondence.json');

const sign = (value: number, reference: number): number =>
  value === 0 || reference === 0 || Math.sign(value) === Math.sign(reference) ? value : -value;

test('correspondence analysis matches R ca::ca', () => {
  assert.equal(fixture.source, 'R ca::ca');
  for (const reference of fixture.cases) {
    const fit = correspondenceAnalysis({
      observed: reference.observed,
      rowLabels: reference.rows,
      colLabels: reference.cols,
    });
    assert.ok(fit, `${reference.name}: fit`);
    assertClose(fit!.totalInertia, reference.totalInertia, TOLERANCES.r, `${reference.name} inertia`);
    assertClose(fit!.chi2, reference.chi2, TOLERANCES.r, `${reference.name} chi2`);
    assert.equal(fit!.df, reference.df, `${reference.name} df`);
    fit!.axes.forEach((axis, index) => {
      assertClose(axis.eigenvalue, reference.inertia[index], TOLERANCES.r, `${reference.name} axis[${index}]`);
    });
    // ca::ca reports standard coordinates; multiplying by the singular value
    // gives the principal coordinates used by the kernel. Each axis has an
    // arbitrary sign, so align it before comparing.
    const principalRow = reference.rowcoord.map((row, i) =>
      row.map((value, axis) => value * reference.sv[axis])
    );
    const principalCol = reference.colcoord.map((row, j) =>
      row.map((value, axis) => value * reference.sv[axis])
    );
    principalRow.forEach((row, i) => {
      const actual = fit!.rowPrincipal[i];
      row.forEach((value, axis) => {
        const flipped = sign(actual[axis], value);
        assertClose(flipped, value, { absolute: 1e-6, relative: 1e-8 }, `${reference.name} row[${i},${axis}]`);
      });
    });
    principalCol.forEach((row, j) => {
      const actual = fit!.colPrincipal[j];
      row.forEach((value, axis) => {
        const flipped = sign(actual[axis], value);
        assertClose(flipped, value, { absolute: 1e-6, relative: 1e-8 }, `${reference.name} col[${j},${axis}]`);
      });
    });
  }
});
