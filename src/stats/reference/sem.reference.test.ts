import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { semAnalysis } from '../kernels/sem';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface SemFixtureCase {
  name: string;
  structural: boolean;
  n: number;
  loadings: { lhs: string; rhs: string; est: number; "std.all": number; se: number; z: number | null; pvalue: number | null }[];
  uniqueness: { lhs: string; est: number; se: number }[];
  factors: { lhs: string; rhs: string; est: number; "std.all": number; se: number }[];
  path: { lhs: string; rhs: string; est: number; "std.all": number; se: number; z: number; pvalue: number } | null;
  fit: { chisq: number; df: number; pvalue: number; cfi: number; tli: number; rmsea: number; srmr: number; aic: number; bic: number };
}

interface SemFixture {
  source: string;
  cases: SemFixtureCase[];
}

const fixture = loadFixture<SemFixture>('sem.json');

const sample = (() => {
  const url = new URL('../../../samples/multivariate/sem_demo/data.csv', import.meta.url);
  const lines = readFileSync(fileURLToPath(url), 'utf8').trim().split('\n');
  const names = lines[0].split(',').map(name => name.replaceAll('"', ''));
  const rows = lines.slice(1).map(line => line.split(',').map(Number));
  return { names, rows };
})();

test('CFA and structural SEM match the R lavaan fixture', () => {
  assert.ok(fixture.source.startsWith('R lavaan'));
  for (const reference of fixture.cases) {
    const fit = semAnalysis({
      data: sample.rows,
      variableNames: sample.names,
      groups: [0, 0, 0, 1, 1, 1],
      factorNames: ['F1', 'F2'],
      structural: reference.structural,
    });
    assert.ok(fit, `${reference.name}: fit`);
    assert.equal(fit!.fit.df, reference.fit.df, `${reference.name}: df`);
    assertClose(fit!.fit.chi2, reference.fit.chisq, { absolute: 0.05, relative: 0.01 }, `${reference.name}: chi2`);
    assertClose(fit!.fit.cfi, reference.fit.cfi, { absolute: 0.005 }, `${reference.name}: CFI`);
    assertClose(fit!.fit.rmsea, reference.fit.rmsea, { absolute: 0.005 }, `${reference.name}: RMSEA`);
    assertClose(fit!.fit.srmr, reference.fit.srmr, { absolute: 0.005 }, `${reference.name}: SRMR`);
    reference.loadings.forEach(expected => {
      const actual = fit!.loadings.find(item => item.variable === expected.rhs);
      assert.ok(actual, `${reference.name}: loading ${expected.rhs}`);
      assertClose(actual!.standardized, expected["std.all"], { absolute: 0.01 }, `${reference.name}: loading ${expected.rhs}`);
    });
    reference.uniqueness.forEach(expected => {
      const actual = fit!.uniqueness.find(item => item.variable === expected.lhs);
      assert.ok(actual, `${reference.name}: uniqueness ${expected.lhs}`);
      assertClose(actual!.uniqueness, expected.est, { absolute: 0.01 }, `${reference.name}: uniqueness ${expected.lhs}`);
    });
    if (reference.structural && reference.path) {
      assert.ok(fit!.path, `${reference.name}: path`);
      assertClose(fit!.path!.beta, reference.path["std.all"], { absolute: 0.01 }, `${reference.name}: path`);
    }
  }
});
