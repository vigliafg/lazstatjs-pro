import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { conjointAnalysis } from '../kernels/conjoint';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface ConjointFixture {
  source: string;
  cases: {
    attributes: string[];
    levels: string[][];
    utilities: { attribute: string; level: string; utility: number }[];
    importance: number[];
    r2: number;
    adjR2: number;
    rmse: number;
    f: number;
    fP: number;
    intercept: number;
  }[];
}

const fixture = loadFixture<ConjointFixture>('conjoint.json');
const sample = (() => {
  const url = new URL('../../../samples/multivariate/conjoint_demo/data.csv', import.meta.url);
  const lines = readFileSync(fileURLToPath(url), 'utf8').trim().split('\n');
  const names = lines[0].split(',').map(name => name.replaceAll('"', ''));
  const rows = lines.slice(1).map(line => line.split(',').map(value => value.replaceAll('"', '')));
  return { names, rows };
})();

test('conjoint part-worths match the R conjoint/lm reference', () => {
  assert.ok(fixture.source.startsWith('R conjoint'));
  for (const reference of fixture.cases) {
    const attributeIndexes = reference.attributes.map(name => sample.names.indexOf(name));
    const responseIndex = sample.names.indexOf('Rating');
    const fit = conjointAnalysis({
      profiles: sample.rows.map(row => attributeIndexes.map(index => row[index])),
      response: sample.rows.map(row => Number(row[responseIndex])),
      attributeNames: reference.attributes,
      levels: reference.levels,
    });
    assert.ok(fit, 'fit');
    reference.utilities.forEach(expected => {
      const actual = fit!.levels.find(
        item => item.attribute === expected.attribute && item.level === expected.level
      );
      assert.ok(actual, `missing ${expected.attribute}=${expected.level}`);
      assertClose(actual!.utility, expected.utility, { absolute: 1e-6 }, `${expected.attribute}=${expected.level}`);
    });
    reference.importance.forEach((value, index) =>
      assertClose(fit!.attributes[index].importance, value, { absolute: 1e-6 }, `importance[${index}]`)
    );
    assertClose(fit!.r2, reference.r2, { absolute: 1e-6 }, 'R²');
    assertClose(fit!.rmse, reference.rmse, { absolute: 1e-6 }, 'RMSE');
    assertClose(fit!.intercept, reference.intercept, { absolute: 1e-6 }, 'intercept');
  }
});
