import type { TableSpec } from '../types';
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
      title: 'Campione e misure di posizione',
      subtitle: `CI ${level}%`,
      columns: [
        { key: 'variable', label: 'Variable', format: 'text' },
        { key: 'n', label: 'N', format: 'int' },
        { key: 'missing', label: 'Missing', format: 'int' },
        { key: 'sum', label: 'Sum', format: 'dec3' },
        { key: 'mean', label: 'Mean', format: 'dec4' },
        { key: 'se', label: 'SE', format: 'dec4' },
        { key: 'ciLo', label: 'CI low', format: 'dec4' },
        { key: 'ciHi', label: 'CI high', format: 'dec4' },
        { key: 'median', label: 'Median', format: 'dec4' },
        { key: 'medianLo', label: 'Median CI low', format: 'dec4' },
        { key: 'medianHi', label: 'Median CI high', format: 'dec4' },
        { key: 'trimmed', label: 'Trimmed mean 5%', format: 'dec4' },
      ],
      rows: locationRows,
      notes: [
        `CI della media: t di Student con df = N − 1. CI della mediana: metodo distribution-free basato sulle statistiche d'ordine (Binomiale(n, 0.5)).`,
        'Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).',
      ],
    },
    {
      id: 'desc-dispersion',
      title: 'Dispersione e valori anomali',
      columns: [
        { key: 'variable', label: 'Variable', format: 'text' },
        { key: 'sd', label: 'SD', format: 'dec4' },
        { key: 'variance', label: 'Variance', format: 'dec4' },
        { key: 'cv', label: 'CV %', format: 'dec2' },
        { key: 'min', label: 'Min', format: 'dec4' },
        { key: 'q1', label: 'Q1', format: 'dec4' },
        { key: 'q3', label: 'Q3', format: 'dec4' },
        { key: 'max', label: 'Max', format: 'dec4' },
        { key: 'range', label: 'Range', format: 'dec4' },
        { key: 'iqr', label: 'IQR', format: 'dec4' },
        { key: 'mad', label: 'MAD', format: 'dec4' },
        { key: 'madScaled', label: 'MAD scalata', format: 'dec4' },
        { key: 'outliers', label: 'Outlier 1.5 IQR', format: 'int' },
        { key: 'outliersPct', label: 'Outlier %', format: 'dec1' },
        { key: 'extreme', label: 'Estremi 3 IQR', format: 'int' },
      ],
      rows: dispersionRows,
      notes: [
        'Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.',
        'Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.',
        'MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.',
      ],
    },
    {
      id: 'desc-shape',
      title: 'Forma e test di normalità',
      columns: [
        { key: 'variable', label: 'Variable', format: 'text' },
        { key: 'skew', label: 'Skewness', format: 'dec3' },
        { key: 'skewSe', label: 'SE', format: 'dec3' },
        { key: 'zSkew', label: 'z', format: 'dec2' },
        { key: 'pSkew', label: 'p', format: 'p' },
        { key: 'kurt', label: 'Excess kurtosis', format: 'dec3' },
        { key: 'kurtSe', label: 'SE', format: 'dec3' },
        { key: 'zKurt', label: 'z', format: 'dec2' },
        { key: 'pKurt', label: 'p', format: 'p' },
        { key: 'jb', label: 'Jarque–Bera', format: 'dec3' },
        { key: 'jbP', label: 'JB p', format: 'p' },
        { key: 'ksD', label: 'KS D', format: 'dec3' },
        { key: 'ksP', label: 'KS p (Lilliefors)', format: 'p' },
        { key: 'k2', label: "D'Agostino K²", format: 'dec3' },
        { key: 'k2P', label: 'K² p', format: 'p' },
      ],
      rows: shapeRows,
      notes: [
        'SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.',
        'KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.',
        "D'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df.",
      ],
    },
    {
      id: 'desc-quantiles',
      title: 'Quantili',
      columns: [
        { key: 'variable', label: 'Variable', format: 'text' },
        { key: 'p1', label: 'P1', format: 'dec3' },
        { key: 'p5', label: 'P5', format: 'dec3' },
        { key: 'p10', label: 'P10', format: 'dec3' },
        { key: 'p25', label: 'P25', format: 'dec3' },
        { key: 'p50', label: 'P50', format: 'dec3' },
        { key: 'p75', label: 'P75', format: 'dec3' },
        { key: 'p90', label: 'P90', format: 'dec3' },
        { key: 'p95', label: 'P95', format: 'dec3' },
        { key: 'p99', label: 'P99', format: 'dec3' },
      ],
      rows: quantileRows,
      notes: ['Quantili interpolati (metodo jStat.percentile).'],
    },
  ];
};
