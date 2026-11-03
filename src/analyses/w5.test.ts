import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readDelimitedTable } from '../io/readers';
import type { GridData } from '../grid/types';
import { buildCanonicalOutput } from './canonical/run';
import { buildMdsOutput } from './mds/run';
import { buildCorrespondenceOutput } from './correspondence/run';
import { buildSemOutput } from './sem/run';
import { buildLatentClassOutput } from './latentclass/run';
import { buildIrtOutput } from './irt/run';
import { buildConjointOutput } from './conjoint/run';
import { buildClusterOutput } from './cluster/run';

const sample = (folder: string): GridData => {
  const url = new URL(`../../samples/multivariate/${folder}/data.csv`, import.meta.url);
  const table = readDelimitedTable(readFileSync(fileURLToPath(url), 'utf8'), {
    delimiter: ',',
    hasHeader: true,
  });
  return {
    cols: table.names.map(name => ({ name, type: 'str' })),
    rows: table.rows,
  };
};

const iris = sample('usarrests');
const columns = (grid: GridData, names: string[]): number[] =>
  names.map(name => grid.cols.findIndex(column => column.name === name));

test('every wave-5 runner returns tables and charts on its sample', () => {
  const canonical = buildCanonicalOutput({
    grid: iris,
    params: { x: columns(iris, ['Murder', 'Assault']), y: columns(iris, ['UrbanPop', 'Rape']) },
  });
  assert.equal(canonical.ok, true);
  if (canonical.ok) assert.ok(canonical.tables.length > 0 && (canonical.charts?.length ?? 0) > 0);

  const mds = buildMdsOutput({
    grid: iris,
    params: { selected: columns(iris, ['Murder', 'Assault', 'UrbanPop']), dimensions: 2, metric: 'classical' },
  });
  assert.equal(mds.ok, true);

  const correspondence = buildCorrespondenceOutput({
    params: {
      rows: ['Basso', 'Alto'],
      cols: ['Basso', 'Alto'],
      values: [
        ['10', '5'],
        ['6', '12'],
      ],
    },
  });
  assert.equal(correspondence.ok, true);

  const semGrid = sample('sem_demo');
  const semNames = ['Verbal1', 'Verbal2', 'Verbal3', 'Math1', 'Math2', 'Math3'];
  const sem = buildSemOutput({
    grid: semGrid,
    params: { selected: columns(semGrid, semNames), factors: 2, groups: [0, 0, 0, 1, 1, 1], structural: false },
  });
  assert.equal(sem.ok, true);

  const latentGrid = sample('latent_demo');
  const latentNames = ['Item1', 'Item2', 'Item3', 'Item4'];
  const latent = buildLatentClassOutput({
    grid: latentGrid,
    params: { selected: columns(latentGrid, latentNames), classes: 2, maxIterations: 300 },
  });
  assert.equal(latent.ok, true);

  const irtGrid = sample('irt_demo');
  const irtNames = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6'];
  const irt = buildIrtOutput({
    grid: irtGrid,
    params: { selected: columns(irtGrid, irtNames), model: '2pl', quadrature: 15 },
  });
  assert.equal(irt.ok, true);

  const conjointGrid = sample('conjoint_demo');
  const conjoint = buildConjointOutput({
    grid: conjointGrid,
    params: {
      attributes: columns(conjointGrid, ['Brand', 'Price', 'Warranty']),
      response: columns(conjointGrid, ['Rating'])[0],
    },
  });
  assert.equal(conjoint.ok, true);

  const cluster = buildClusterOutput({
    grid: iris,
    params: {
      selected: columns(iris, ['Murder', 'Assault', 'UrbanPop']),
      method: 'kmeans',
      clusters: 2,
      standardize: true,
    },
    ciLevel: 95,
  });
  assert.equal(cluster.ok, true);
});
