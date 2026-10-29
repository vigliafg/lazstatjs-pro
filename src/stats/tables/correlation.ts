import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { stars, interpretR } from '../format';
import {
  columnSummaries,
  correlationPairs,
  partialCorrelations,
  type CorrelationPair,
} from '../kernels/correlation';

export interface CorrelationTablesOptions {
  rows: readonly (readonly string[])[];
  varIdxs: number[];
  varNames: string[];
  level: number;
  method: 'pearson' | 'spearman' | 'kendall';
  showSpearman: boolean;
  showKendall: boolean;
}

export const correlationTables = (options: CorrelationTablesOptions): TableSpec[] => {
  const { rows, varIdxs, varNames, level, method, showSpearman, showKendall } = options;
  if (varIdxs.length < 2) return [];

  const pairs = correlationPairs(rows, varIdxs, level);
  const pairMap = new Map<string, CorrelationPair>();
  pairs.forEach(pair => {
    pairMap.set(copy('{s1}-{s2}', { s1: pair.a, s2: pair.b }), pair);
    pairMap.set(copy('{s1}-{s2}', { s1: pair.b, s2: pair.a }), pair);
  });

  const tables: TableSpec[] = [];

  const pairColumns = [
    { key: 'a', label: copy('Variabile A'), format: 'text' as const },
    { key: 'b', label: copy('Variabile B'), format: 'text' as const },
    { key: 'n', label: copy('N'), format: 'int' as const },
    { key: 'pearson', label: copy('Pearson r'), format: 'dec3' as const },
    { key: 'pearsonP', label: copy('p'), format: 'p' as const },
    { key: 'lo', label: copy('CI low'), format: 'dec3' as const },
    { key: 'hi', label: copy('CI high'), format: 'dec3' as const },
    { key: 'r2', label: copy('r²'), format: 'dec3' as const },
    ...(showSpearman
      ? [
          { key: 'spearman', label: copy('Spearman ρ'), format: 'dec3' as const },
          { key: 'spearmanP', label: copy('p'), format: 'p' as const },
        ]
      : []),
    ...(showKendall
      ? [
          { key: 'kendall', label: copy('Kendall τ'), format: 'dec3' as const },
          { key: 'kendallP', label: copy('p'), format: 'p' as const },
        ]
      : []),
  ];

  tables.push({
    id: 'corr-pairs',
    title: copy('Correlazioni a coppie'),
    subtitle: copy('Metodo primario: {s1} · CI {s2}% · eliminazione pairwise', { s1: method, s2: level }),
    columns: pairColumns,
    rows: pairs.map(pair => ({
      a: varNames[pair.a],
      b: varNames[pair.b],
      n: pair.n,
      pearson: pair.pearson,
      pearsonP: pair.pearsonP,
      lo: pair.pearsonLo,
      hi: pair.pearsonHi,
      r2: pair.r2,
      spearman: showSpearman ? pair.spearman : undefined,
      spearmanP: showSpearman ? pair.spearmanP : undefined,
      kendall: showKendall ? pair.kendall : undefined,
      kendallP: showKendall ? pair.kendallP : undefined,
    })),
    notes: [
      copy('Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.'),
      copy('p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.'),
      copy('CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).'),
    ],
  });

  const matrixTable = (
    id: string,
    title: string,
    coefficient: (pair: CorrelationPair) => number,
    pValue: (pair: CorrelationPair) => number,
    note: string
  ): TableSpec => ({
    id,
    title,
    columns: [
      { key: 'variable', label: copy('Variable'), format: 'text' },
      ...varNames.map((name, index) => ({ key: copy('v{s1}', { s1: index }), label: name, format: 'text' as const, align: 'right' as const })),
    ],
    rows: varNames.map((name, i) => {
      const row: { [key: string]: string } = { variable: name };
      varNames.forEach((_, j) => {
        if (i === j) {
          row[copy('v{s1}', { s1: j })] = '1';
          return;
        }
        const pair = pairMap.get(copy('{s1}-{s2}', { s1: i, s2: j }));
        if (!pair || pair.n < 3) {
          row[copy('v{s1}', { s1: j })] = '—';
          return;
        }
        if (j < i) {
          const value = coefficient(pair);
          row[copy('v{s1}', { s1: j })] = copy('{s1}{s2}', { s1: isFinite(value) ? value.toFixed(3) : '—', s2: stars(pValue(pair)) });
        } else {
          row[copy('v{s1}', { s1: j })] = copy('n={s1}', { s1: pair.n });
        }
      });
      return row;
    }),
    notes: [
      note,
      copy('Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.'),
    ],
  });

  const matrices: TableSpec[] = [];
  if (method === 'spearman' && showSpearman) {
    matrices.push(matrixTable('corr-matrix-spearman', copy('Matrice di correlazione di Spearman (ρ)'), p => p.spearman, p => p.spearmanP, copy('Rho di Spearman sui ranghi.')));
  }
  matrices.push(matrixTable('corr-matrix-pearson', copy('Matrice di correlazione di Pearson (r)'), p => p.pearson, p => p.pearsonP, copy('Coefficiente lineare di Pearson.')));
  if (method !== 'spearman' && showSpearman) {
    matrices.push(matrixTable('corr-matrix-spearman', copy('Matrice di correlazione di Spearman (ρ)'), p => p.spearman, p => p.spearmanP, copy('Rho di Spearman sui ranghi.')));
  }
  if (showKendall) {
    matrices.push(matrixTable('corr-matrix-kendall', copy("Matrice di correlazione di Kendall (τ-b)"), p => p.kendall, p => p.kendallP, copy('Tau-b di Kendall con correzione dei ranghi pari.')));
  }
  tables.push(...matrices);

  tables.push({
    id: 'corr-descriptives',
    title: copy('Descrittive delle variabili'),
    columns: [
      { key: 'variable', label: copy('Variable'), format: 'text' },
      { key: 'n', label: copy('N'), format: 'int' },
      { key: 'mean', label: copy('Mean'), format: 'dec4' },
      { key: 'sd', label: copy('SD'), format: 'dec4' },
      { key: 'median', label: copy('Median'), format: 'dec4' },
      { key: 'min', label: copy('Min'), format: 'dec4' },
      { key: 'max', label: copy('Max'), format: 'dec4' },
    ],
    rows: columnSummaries(rows, varIdxs).map((summary, position) => ({
      variable: varNames[position],
      ...summary,
    })),
  });

  // -------------------------------------------------------------------------
  // Partial correlations (controlling for the other selected variables)
  // -------------------------------------------------------------------------
  const partialRows = partialCorrelations(rows, varIdxs, varNames, level);
  if (partialRows.length > 0) {
    const q = varIdxs.length;
    tables.push({
      id: 'corr-partial',
      title: copy('Correlazioni parziali'),
      subtitle: copy('controllando per le altre {s1} variabili · CI {s2}%', { s1: q - 2, s2: level }),
      columns: [
        { key: 'a', label: copy('Variabile A'), format: 'text' },
        { key: 'b', label: copy('Variabile B'), format: 'text' },
        { key: 'controls', label: copy('Controllate'), format: 'text' },
        { key: 'r', label: copy('r parziale'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'int' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'lo', label: copy('CI low'), format: 'dec3' },
        { key: 'hi', label: copy('CI high'), format: 'dec3' },
      ],
      rows: partialRows,
      notes: [
        copy('Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.'),
        copy('r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).'),
      ],
    });
  }

  return tables;
};
