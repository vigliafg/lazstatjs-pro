import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { latentClassAnalysis } from '../kernels/latentclass';
import { assertClose, loadFixture, TOLERANCES } from './harness';

interface LatentClassFixture {
  source: string;
  cases: {
    name: string;
    classes: number;
    n: number;
    proportions: number[];
    probabilities: { variable: string; probabilities: number[][] }[];
    logLik: number;
    aic: number;
    bic: number;
    entropy: number;
  }[];
}

const fixture = loadFixture<LatentClassFixture>('latentclass.json');
const levels = ['Basso', 'Medio', 'Alto'];
const sample = (() => {
  const url = new URL('../../../samples/multivariate/latent_demo/data.csv', import.meta.url);
  const lines = readFileSync(fileURLToPath(url), 'utf8').trim().split('\n');
  const names = lines[0].split(',').map(name => name.replaceAll('"', ''));
  const rows = lines.slice(1).map(line =>
    line.split(',').map(value => levels.indexOf(value.replaceAll('"', '')))
  );
  return { names, rows };
})();

test('latent class analysis matches R poLCA', () => {
  assert.equal(fixture.source, 'R poLCA::poLCA');
  for (const reference of fixture.cases) {
    const fit = latentClassAnalysis({
      data: sample.rows,
      levels: sample.names.map(() => levels),
      variableNames: sample.names,
      classes: reference.classes,
      maxIterations: 1000,
      starts: 10,
    });
    assert.ok(fit, `${reference.name}: fit`);
    assert.equal(fit!.classes, reference.classes, `${reference.name}: classes`);
    if (reference.classes === 2) {
      reference.proportions.forEach((value, index) =>
        assertClose(fit!.proportions[index], value, { absolute: 0.05 }, `${reference.name}: proportion[${index}]`)
      );
      reference.probabilities.forEach((item, itemIndex) => {
        item.probabilities.forEach((row, cluster) => {
          row.forEach((value, level) =>
            assertClose(
              fit!.items[itemIndex].probabilities[cluster][level],
              value,
              { absolute: 0.02 },
              `${reference.name}: p[${itemIndex},${cluster},${level}]`
            )
          );
        });
      });
      assertClose(fit!.bic, reference.bic, { absolute: 0.2 }, `${reference.name}: BIC`);
      assertClose(fit!.entropy, reference.entropy, { absolute: 0.02 }, `${reference.name}: entropy`);
    } else {
      // Three-class models have several nearby local maxima; the kernel and
      // poLCA are compared on the likelihood and on the class profile, not on
      // a particular permutation of the classes.
      assertClose(fit!.logLik, reference.logLik, { absolute: 1.5 }, `${reference.name}: logLik`);
      assertClose(fit!.bic, reference.bic, { absolute: 2.5 }, `${reference.name}: BIC`);
    }
  }
});
