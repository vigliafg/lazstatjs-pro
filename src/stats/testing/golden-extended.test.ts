/**
 * Golden test di contratto — analisi fuori da App.tsx.
 *
 * Coprono i builder puri che alimentano i pannelli (`src/analyses/*`). Come per
 * le sei analisi storiche, congelano `TableSpec[]`: titoli, colonne, formati,
 * ordine delle righe, note. Non sostituiscono i test numerici già presenti,
 * ma impediscono che un refactor cambi ciò che l'utente vede.
 */
import { test } from 'node:test';
import { COL, fixtureRows } from './fixture';
import { expectGolden } from './golden';
import { contingencyTables } from '../contingency';
import { factorialTables } from '../factorial';
import { ancovaTables } from '../ancova';
import { sampleSizeTables } from '../samplesize';
import { survivalTables } from '../survival';
import { timeSeriesTables } from '../timeseries';
import { distributionFitTables } from '../distfit';
import type { DistributionName } from '../distfit';

const rows = fixtureRows();
const col = (index: number): number[] =>
  rows.map(row => Number(row[index])).filter(value => Number.isFinite(value));
const labels = (index: number): string[] => rows.map(row => row[index]);

/** Righe con un punteggio valido: tutte le colonne restano allineate. */
const aligned = rows.filter(row => Number.isFinite(Number(row[COL.score])));

test('golden: tabella di contingenza 2x2 con Fisher', () => {
  const tables = contingencyTables({
    observed: [
      [18, 7],
      [9, 16],
    ],
    rowLabels: ['Trattato', 'Controllo'],
    colLabels: ['Evento', 'Nessun evento'],
    level: 95,
    exact: true,
  });
  expectGolden('contingency-2x2', tables);
});

test('golden: tabella di contingenza 3x2 con Monte Carlo riproducibile', () => {
  const tables = contingencyTables({
    observed: [
      [12, 3],
      [8, 7],
      [9, 6],
    ],
    rowLabels: ['A', 'B', 'C'],
    colLabels: ['Sì', 'No'],
    level: 95,
    monteCarlo: true,
    simulations: 500,
    seed: 20240101,
  });
  expectGolden('contingency-montecarlo', tables);
});

test('golden: ANOVA fattoriale 3x2 con interazione', () => {
  const tables = factorialTables({
    response: aligned.map(row => Number(row[COL.score])),
    factorA: aligned.map(row => row[COL.group]),
    factorB: aligned.map(row => row[COL.sex]),
    responseName: 'score',
    aName: 'group',
    bName: 'sex',
    level: 95,
    interaction: true,
  });
  expectGolden('factorial', tables);
});

test('golden: ANCOVA con una covariata', () => {
  const tables = ancovaTables({
    response: aligned.map(row => Number(row[COL.score])),
    factor: aligned.map(row => row[COL.group]),
    covariates: [aligned.map(row => Number(row[COL.age]))],
    responseName: 'score',
    factorName: 'group',
    covariateNames: ['age'],
    level: 95,
  });
  expectGolden('ancova', tables);
});

test('golden: numerosità campionaria (due medie)', () => {
  const { tables } = sampleSizeTables({
    design: 'twoMeans',
    alpha: 0.05,
    power: 0.8,
    tails: 2,
    delta: 0.5,
    sd: 1,
  });
  expectGolden('samplesize-two-means', tables);
});

test('golden: sopravvivenza Kaplan-Meier con log-rank', () => {
  const tables = survivalTables({
    time: aligned.map(row => Number(row[COL.post])),
    event: aligned.map(row => (row[COL.sex] === 'M' ? 1 : 0)),
    groups: aligned.map(row => row[COL.group]),
    level: 95,
  });
  expectGolden('survival-km', tables);
});

test('golden: serie storica', () => {
  const tables = timeSeriesTables({
    values: col(COL.post),
    period: 0,
    horizon: 5,
    level: 95,
  });
  expectGolden('timeseries', tables);
});

test('golden: fit delle distribuzioni', () => {
  const selected: DistributionName[] = ['normal', 'lognormal', 'gamma', 'weibull'];
  const tables = distributionFitTables(col(COL.score), selected, 95);
  expectGolden('distfit', tables);
});

// --- Analisi con risultato intermedio (fit -> tabelle) ---

test('golden: regressione logistica', async () => {
  const { fitLogistic, logisticTables } = await import('../logistic');
  const y = aligned.map(row => (row[COL.sex] === 'M' ? 1 : 0));
  const model = fitLogistic(y, [
    { name: 'age', values: aligned.map(row => Number(row[COL.age])) },
    { name: 'income', values: aligned.map(row => Number(row[COL.income])) },
  ]);
  if (!model) throw new Error('fit logistico non riuscito');
  expectGolden('logistic', logisticTables(model, 95, 0.5));
});

test('golden: Cox proportional hazards', async () => {
  const { fitCox, coxTables } = await import('../cox');
  const fit = fitCox({
    time: aligned.map(row => Number(row[COL.post])),
    event: aligned.map(row => (row[COL.sex] === 'M' ? 1 : 0)),
    covariates: [
      { name: 'age', values: aligned.map(row => Number(row[COL.age])) },
      { name: 'group', values: aligned.map(row => (row[COL.group] === 'A' ? 0 : 1)) },
    ],
    level: 95,
  });
  if (!fit) throw new Error('fit Cox non riuscito');
  expectGolden('cox', coxTables(fit, 95));
});

test('golden: PCA', async () => {
  const { principalComponents, pcaTables } = await import('../multivariate');
  const result = principalComponents(
    aligned.map(row => [Number(row[COL.score]), Number(row[COL.age]), Number(row[COL.income])]),
    ['score', 'age', 'income'],
    true
  );
  if (!result) throw new Error('PCA non riuscita');
  expectGolden('pca', pcaTables(result));
});

test('golden: Friedman con Nemenyi', async () => {
  const { friedmanTest, nemenyiPosthoc, friedmanTables } = await import('../repeated');
  const blocks = aligned.map(row => [Number(row[COL.score]), Number(row[COL.pre]), Number(row[COL.post])]);
  const test = friedmanTest(blocks);
  if (!test) throw new Error('Friedman non riuscito');
  expectGolden('friedman', friedmanTables(test, nemenyiPosthoc(test, 95), ['score', 'pre', 'post'], 95));
});

test('golden: ANOVA a misure ripetute', async () => {
  const { repeatedMeasuresAnova, repeatedAnovaTables } = await import('../repeatedAnova');
  const blocks = aligned.map(row => [Number(row[COL.score]), Number(row[COL.pre]), Number(row[COL.post])]);
  const result = repeatedMeasuresAnova(blocks);
  if (!result) throw new Error('ANOVA RM non riuscita');
  expectGolden('repeated-anova', repeatedAnovaTables(result, ['score', 'pre', 'post'], 95));
});

test('golden: wizard (confronto tra gruppi)', async () => {
  const { runWizard } = await import('../wizard');
  const analysis = runWizard({
    columns: ['score', 'age', 'income', 'pre', 'group', 'sex', 'post'].map(name => ({ name })),
    rows,
    selection: { goal: 'compare', outcome: COL.score, group: COL.group, second: -1, paired: false },
    level: 95,
  });
  expectGolden('wizard', analysis.tables);
});
