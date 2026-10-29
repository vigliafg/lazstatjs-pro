import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import {
  descriptiveDispersionRows,
  descriptiveLocationRows,
  descriptiveQuantileRows,
  descriptiveShapeRows,
  summarizeVariables,
} from '../kernels/descriptive';

export const descriptiveTables = (
  rows: readonly (readonly string[])[],
  variableIndices: number[],
  columnNames: string[],
  level = 95
): TableSpec[] => {
  const summaries = summarizeVariables(rows, variableIndices, columnNames);
  const valid = summaries.filter(summary => summary.values.length > 0);
  if (valid.length === 0) return [];

  const locationRows = descriptiveLocationRows(valid, level);
  const dispersionRows = descriptiveDispersionRows(valid);
  const shapeRows = descriptiveShapeRows(valid);
  const quantileRows = descriptiveQuantileRows(valid);
  return [
    {
      id: 'desc-location',
      title: copy('Campione e misure di posizione'),
      subtitle: copy('CI {s1}%', { s1: level }),
      columns: [
        { key: 'variable', label: copy('Variable'), format: 'text' },
        { key: 'n', label: copy('N'), format: 'int' },
        { key: 'missing', label: copy('Missing'), format: 'int' },
        { key: 'sum', label: copy('Sum'), format: 'dec3' },
        { key: 'mean', label: copy('Mean'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
        { key: 'median', label: copy('Median'), format: 'dec4' },
        { key: 'medianLo', label: copy('Median CI low'), format: 'dec4' },
        { key: 'medianHi', label: copy('Median CI high'), format: 'dec4' },
        { key: 'trimmed', label: copy('Trimmed mean 5%'), format: 'dec4' },
      ],
      rows: locationRows,
      notes: [
        copy(`CI della media: t di Student con df = N − 1. CI della mediana: metodo distribution-free basato sulle statistiche d'ordine (Binomiale(n, 0.5)).`),
        copy('Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).'),
      ],
    },
    {
      id: 'desc-dispersion',
      title: copy('Dispersione e valori anomali'),
      columns: [
        { key: 'variable', label: copy('Variable'), format: 'text' },
        { key: 'sd', label: copy('SD'), format: 'dec4' },
        { key: 'variance', label: copy('Variance'), format: 'dec4' },
        { key: 'cv', label: copy('CV %'), format: 'dec2' },
        { key: 'min', label: copy('Min'), format: 'dec4' },
        { key: 'q1', label: copy('Q1'), format: 'dec4' },
        { key: 'q3', label: copy('Q3'), format: 'dec4' },
        { key: 'max', label: copy('Max'), format: 'dec4' },
        { key: 'range', label: copy('Range'), format: 'dec4' },
        { key: 'iqr', label: copy('IQR'), format: 'dec4' },
        { key: 'mad', label: copy('MAD'), format: 'dec4' },
        { key: 'madScaled', label: copy('MAD scalata'), format: 'dec4' },
        { key: 'outliers', label: copy('Outlier 1.5 IQR'), format: 'int' },
        { key: 'outliersPct', label: copy('Outlier %'), format: 'dec1' },
        { key: 'extreme', label: copy('Estremi 3 IQR'), format: 'int' },
      ],
      rows: dispersionRows,
      notes: [
        copy('Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.'),
        copy('Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.'),
        copy('MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.'),
      ],
    },
    {
      id: 'desc-shape',
      title: copy('Forma e test di normalità'),
      columns: [
        { key: 'variable', label: copy('Variable'), format: 'text' },
        { key: 'skew', label: copy('Skewness'), format: 'dec3' },
        { key: 'skewSe', label: copy('SE'), format: 'dec3' },
        { key: 'zSkew', label: copy('z'), format: 'dec2' },
        { key: 'pSkew', label: copy('p'), format: 'p' },
        { key: 'kurt', label: copy('Excess kurtosis'), format: 'dec3' },
        { key: 'kurtSe', label: copy('SE'), format: 'dec3' },
        { key: 'zKurt', label: copy('z'), format: 'dec2' },
        { key: 'pKurt', label: copy('p'), format: 'p' },
        { key: 'jb', label: copy('Jarque–Bera'), format: 'dec3' },
        { key: 'jbP', label: copy('JB p'), format: 'p' },
        { key: 'ksD', label: copy('KS D'), format: 'dec3' },
        { key: 'ksP', label: copy('KS p (Lilliefors)'), format: 'p' },
        { key: 'k2', label: copy("D'Agostino K²"), format: 'dec3' },
        { key: 'k2P', label: copy('K² p'), format: 'p' },
      ],
      rows: shapeRows,
      notes: [
        copy('SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.'),
        copy('KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.'),
        copy("D'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df."),
      ],
    },
    {
      id: 'desc-quantiles',
      title: copy('Quantili'),
      columns: [
        { key: 'variable', label: copy('Variable'), format: 'text' },
        { key: 'p1', label: copy('P1'), format: 'dec3' },
        { key: 'p5', label: copy('P5'), format: 'dec3' },
        { key: 'p10', label: copy('P10'), format: 'dec3' },
        { key: 'p25', label: copy('P25'), format: 'dec3' },
        { key: 'p50', label: copy('P50'), format: 'dec3' },
        { key: 'p75', label: copy('P75'), format: 'dec3' },
        { key: 'p90', label: copy('P90'), format: 'dec3' },
        { key: 'p95', label: copy('P95'), format: 'dec3' },
        { key: 'p99', label: copy('P99'), format: 'dec3' },
      ],
      rows: quantileRows,
      notes: [copy('Quantili interpolati (metodo jStat.percentile).')],
    },
  ];
};
