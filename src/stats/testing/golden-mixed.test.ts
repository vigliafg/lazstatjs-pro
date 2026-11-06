/**
 * Golden test di contratto per quality, cluster, lmm e glmm.
 *
 * Congelano le `TableSpec[]` prodotte dai builder delle quattro famiglie
 * allineate a JMP: se un refactor cambia titoli, colonne, formati od ordine
 * delle righe, il test fallisce. I numeri sono già coperti dai test dei kernel.
 */
import { test } from 'node:test';
import { expectGolden } from './golden';
import { controlChart } from '../kernels/quality';
import { controlTables } from '../tables/quality';
import { hierarchicalClusters } from '../kernels/cluster';
import { clusterTables } from '../tables/cluster';
import { lmmStats } from '../kernels/lmm';
import { lmmTables } from '../tables/lmm';
import { fitGlmm } from '../kernels/glmm';
import { glmmTables } from '../tables/glmm';

const GROUPS = ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D'];
const X = [1, 2, 3, 4, 1.5, 2.5, 3.5, 4.5, 0.5, 1.5, 2.5, 3.5, 1.2, 2.2, 3.2, 4.2];
const Y = [2.0, 3.8, 6.1, 8.0, 1.3, 2.6, 4.2, 6.0, 2.5, 4.1, 6.2, 8.2, 1.5, 3.0, 4.8, 6.7];

test('golden: quality con sottogruppi di dimensione variabile', () => {
  const result = controlChart([2, 3, 4, 5, 6, 3, 4, 5, 6, 1, 2, 3], 'xbar', 3);
  expectGolden('quality-xbar', controlTables({ result: result!, variableName: 'Peso' }));
});

test('golden: cluster gerarchico con pseudo-F e CCC', () => {
  const data = [[1, 1], [1.4, 1.2], [1.1, 0.8], [4, 4], [4.3, 4.1], [3.8, 4.4], [7, 1], [7.4, 1.3], [6.7, 0.7]];
  const variableNames = ['V1', 'V2'];
  const result = hierarchicalClusters({ data, variableNames, method: 'ward', clusters: 3, standardize: false })!;
  expectGolden(
    'cluster-ward',
    clusterTables({ result, variableNames, rowLabels: data.map((_, index) => `Riga ${index + 1}`) })
  );
});

test('golden: lmm con componenti di varianza e test degli effetti fissi', () => {
  const rows = Y.map((value, index) => [String(value), String(X[index]), GROUPS[index]]);
  const stats = lmmStats({ rows, depIdx: 0, indepIdxs: [1], groupIdx: 2, level: 95 })!;
  expectGolden('lmm-tables', lmmTables(stats, 'Y', ['X'], 'G', 95));
});

test('golden: glmm gaussiano con SE e IC dei componenti di varianza', () => {
  const fit = fitGlmm({
    y: Y,
    x: X.map(value => [1, value]),
    groups: GROUPS,
    family: 'gaussian',
    link: 'identity',
    level: 95,
  })!;
  expectGolden('glmm-tables', glmmTables(fit, { dep: 'Y', predictors: ['X'], group: 'G', factor: 0 }, 95));
});
