/**
 * Golden test di contratto per le sei analisi storiche.
 *
 * Queste sei non avevano alcun test: vivono inline in `App.tsx` ed erano le più
 * esposte al refactor. I file in `golden/` sono la fotografia esatta di
 * `TableSpec[]` (titoli, colonne, ordine delle righe, formati, note).
 *
 * Non verificano la correttezza statistica (già coperta altrove): verificano
 * che lo spostamento di codice non cambi ciò che l'utente vede.
 */
import { test } from 'node:test';
import { COL, fixtureRows } from './fixture';
import { expectGolden } from './golden';
import { descriptiveTables } from '../descriptive';
import { ttestTables } from '../ttest';
import { anovaTables } from '../anova';
import { regressionTables } from '../regression';
import { correlationTables } from '../correlation';
import { chiSquareTables } from '../chisquare';

const rows = fixtureRows();
const names = ['score', 'age', 'income', 'pre', 'group', 'sex', 'post'];

test('golden: descriptive', () => {
  const tables = descriptiveTables(rows, [COL.score, COL.age, COL.income], names, 95);
  expectGolden('descriptive', tables);
});

test('golden: t-test indipendente', () => {
  const tables = ttestTables({
    type: 'ind',
    rows,
    i1: COL.score,
    i2: COL.pre,
    name1: 'score',
    name2: 'pre',
    mu: 0,
    equalVar: false,
    level: 95,
    useNonParam: false,
  });
  expectGolden('ttest-ind', tables);
});

test('golden: t-test indipendente non parametrico', () => {
  const tables = ttestTables({
    type: 'ind',
    rows,
    i1: COL.score,
    i2: COL.pre,
    name1: 'score',
    name2: 'pre',
    mu: 0,
    equalVar: false,
    level: 95,
    useNonParam: true,
  });
  expectGolden('ttest-ind-nonparam', tables);
});

test('golden: t-test appaiato', () => {
  const tables = ttestTables({
    type: 'dep',
    rows,
    i1: COL.pre,
    i2: COL.post,
    name1: 'pre',
    name2: 'post',
    mu: 0,
    equalVar: true,
    level: 95,
    useNonParam: false,
  });
  expectGolden('ttest-paired', tables);
});

test('golden: ANOVA a una via con post-hoc', () => {
  const tables = anovaTables({
    rows,
    depIdx: COL.score,
    grpIdx: COL.group,
    depName: 'score',
    grpName: 'group',
    posthoc: 'tukey',
    kwPosthoc: 'holm',
    level: 95,
    useNonParam: false,
  });
  expectGolden('anova', tables);
});

test('golden: ANOVA non parametrica (Kruskal-Wallis)', () => {
  const tables = anovaTables({
    rows,
    depIdx: COL.score,
    grpIdx: COL.group,
    depName: 'score',
    grpName: 'group',
    posthoc: 'none',
    kwPosthoc: 'holm',
    level: 95,
    useNonParam: true,
  });
  expectGolden('anova-nonparam', tables);
});

test('golden: regressione multipla', () => {
  const tables = regressionTables({
    rows,
    depIdx: COL.score,
    indepIdxs: [COL.age, COL.income],
    depName: 'score',
    predNames: ['age', 'income'],
    level: 95,
  });
  expectGolden('regression', tables);
});

test('golden: correlazioni', () => {
  const tables = correlationTables({
    rows,
    varIdxs: [COL.score, COL.age, COL.income],
    varNames: ['score', 'age', 'income'],
    level: 95,
    method: 'pearson',
    showSpearman: true,
    showKendall: true,
  });
  expectGolden('correlation', tables);
});

test('golden: chi-quadro 2x2 con Fisher', () => {
  const tables = chiSquareTables({
    o11: 18,
    o12: 7,
    o21: 9,
    o22: 16,
    row1: 'Trattato',
    row2: 'Controllo',
    col1: 'Evento',
    col2: 'Nessun evento',
    level: 95,
    runFisher: true,
  });
  expectGolden('chisquare', tables);
});
