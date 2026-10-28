import type { TableSpec } from '../types';
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
    pairMap.set(`${pair.a}-${pair.b}`, pair);
    pairMap.set(`${pair.b}-${pair.a}`, pair);
  });

  const tables: TableSpec[] = [];

  const pairColumns = [
    { key: 'a', label: 'Variabile A', format: 'text' as const },
    { key: 'b', label: 'Variabile B', format: 'text' as const },
    { key: 'n', label: 'N', format: 'int' as const },
    { key: 'pearson', label: 'Pearson r', format: 'dec3' as const },
    { key: 'pearsonP', label: 'p', format: 'p' as const },
    { key: 'lo', label: 'CI low', format: 'dec3' as const },
    { key: 'hi', label: 'CI high', format: 'dec3' as const },
    { key: 'r2', label: 'r²', format: 'dec3' as const },
    ...(showSpearman
      ? [
          { key: 'spearman', label: 'Spearman ρ', format: 'dec3' as const },
          { key: 'spearmanP', label: 'p', format: 'p' as const },
        ]
      : []),
    ...(showKendall
      ? [
          { key: 'kendall', label: 'Kendall τ', format: 'dec3' as const },
          { key: 'kendallP', label: 'p', format: 'p' as const },
        ]
      : []),
  ];

  tables.push({
    id: 'corr-pairs',
    title: 'Correlazioni a coppie',
    subtitle: `Metodo primario: ${method} · CI ${level}% · eliminazione pairwise`,
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
      'Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.',
      'p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.',
      'CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).',
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
      { key: 'variable', label: 'Variable', format: 'text' },
      ...varNames.map((name, index) => ({ key: `v${index}`, label: name, format: 'text' as const, align: 'right' as const })),
    ],
    rows: varNames.map((name, i) => {
      const row: { [key: string]: string } = { variable: name };
      varNames.forEach((_, j) => {
        if (i === j) {
          row[`v${j}`] = '1';
          return;
        }
        const pair = pairMap.get(`${i}-${j}`);
        if (!pair || pair.n < 3) {
          row[`v${j}`] = '—';
          return;
        }
        if (j < i) {
          const value = coefficient(pair);
          row[`v${j}`] = `${isFinite(value) ? value.toFixed(3) : '—'}${stars(pValue(pair))}`;
        } else {
          row[`v${j}`] = `n=${pair.n}`;
        }
      });
      return row;
    }),
    notes: [
      note,
      'Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.',
    ],
  });

  const matrices: TableSpec[] = [];
  if (method === 'spearman' && showSpearman) {
    matrices.push(matrixTable('corr-matrix-spearman', 'Matrice di correlazione di Spearman (ρ)', p => p.spearman, p => p.spearmanP, 'Rho di Spearman sui ranghi.'));
  }
  matrices.push(matrixTable('corr-matrix-pearson', 'Matrice di correlazione di Pearson (r)', p => p.pearson, p => p.pearsonP, 'Coefficiente lineare di Pearson.'));
  if (method !== 'spearman' && showSpearman) {
    matrices.push(matrixTable('corr-matrix-spearman', 'Matrice di correlazione di Spearman (ρ)', p => p.spearman, p => p.spearmanP, 'Rho di Spearman sui ranghi.'));
  }
  if (showKendall) {
    matrices.push(matrixTable('corr-matrix-kendall', "Matrice di correlazione di Kendall (τ-b)", p => p.kendall, p => p.kendallP, 'Tau-b di Kendall con correzione dei ranghi pari.'));
  }
  tables.push(...matrices);

  tables.push({
    id: 'corr-descriptives',
    title: 'Descrittive delle variabili',
    columns: [
      { key: 'variable', label: 'Variable', format: 'text' },
      { key: 'n', label: 'N', format: 'int' },
      { key: 'mean', label: 'Mean', format: 'dec4' },
      { key: 'sd', label: 'SD', format: 'dec4' },
      { key: 'median', label: 'Median', format: 'dec4' },
      { key: 'min', label: 'Min', format: 'dec4' },
      { key: 'max', label: 'Max', format: 'dec4' },
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
      title: 'Correlazioni parziali',
      subtitle: `controllando per le altre ${q - 2} variabili · CI ${level}%`,
      columns: [
        { key: 'a', label: 'Variabile A', format: 'text' },
        { key: 'b', label: 'Variabile B', format: 'text' },
        { key: 'controls', label: 'Controllate', format: 'text' },
        { key: 'r', label: 'r parziale', format: 'dec3' },
        { key: 'df', label: 'df', format: 'int' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'lo', label: 'CI low', format: 'dec3' },
        { key: 'hi', label: 'CI high', format: 'dec3' },
      ],
      rows: partialRows,
      notes: [
        'Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.',
        'r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).',
      ],
    });
  }

  return tables;
};
