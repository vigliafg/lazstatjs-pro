import type { TableSpec } from '../types';
import { fmtEst } from '../format';
import type { MiStats } from '../mi/types';

export const miTables = (stats: MiStats, names: string[], level: number, predictorNames: string[] = []): TableSpec[] => [
  {
    id: 'mi-missing',
    title: 'Dati mancanti',
    subtitle: `${stats.n} righe · ${stats.imputations} imputazioni · ${stats.iterations} iterazioni`,
    columns: [
      { key: 'variable', label: 'Variabile', format: 'text' },
      { key: 'observed', label: 'Osservati', format: 'int' },
      { key: 'missing', label: 'Mancanti', format: 'int' },
      { key: 'percent', label: '% mancante', format: 'dec1' },
    ],
    rows: stats.variables.map((variable, index) => ({
      variable: names[index] ?? variable.name,
      observed: variable.observed,
      missing: variable.missing,
      percent: stats.n > 0 ? (variable.missing / stats.n) * 100 : NaN,
    })),
    notes: ['Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.'],
  },
  {
    id: 'mi-pooled',
    title: 'Stime pooled (Rubin)',
    subtitle: `CI ${level}%`,
    columns: [
      { key: 'variable', label: 'Variabile', format: 'text' },
      { key: 'mean', label: 'Media', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'lo', label: 'CI low', format: 'dec4' },
      { key: 'hi', label: 'CI high', format: 'dec4' },
      { key: 'sd', label: 'SD pooled', format: 'dec4' },
      { key: 'df', label: 'df Rubin', format: 'dec1' },
      { key: 'fmi', label: 'FMI', format: 'dec3' },
    ],
    rows: stats.variables.map((variable, index) => ({
      variable: names[index] ?? variable.name,
      mean: variable.mean,
      se: variable.se,
      lo: variable.lo,
      hi: variable.hi,
      sd: variable.sd,
      df: variable.df,
      fmi: variable.fmi,
    })),
    notes: [
      'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.',
      `FMI = frazione di informazione mancante; df approssimati con la formula di Barnard–Rubin.`,
    ],
  },
  ...(stats.regression
    ? [{
        id: 'mi-regression',
        title: 'Regressione pooled',
        subtitle: `R² medio = ${stats.regression.r2.toFixed(3)} · ${level}% CI`,
        columns: [
          { key: 'term', label: 'Termine', format: 'text' as const },
          { key: 'beta', label: 'β', format: 'dec4' as const },
          { key: 'se', label: 'SE', format: 'dec4' as const },
          { key: 't', label: 't', format: 'dec3' as const },
          { key: 'p', label: 'p', format: 'p' as const },
          { key: 'lo', label: 'CI low', format: 'dec4' as const },
          { key: 'hi', label: 'CI high', format: 'dec4' as const },
          { key: 'fmi', label: 'FMI', format: 'dec3' as const },
        ],
        rows: stats.regression.coefficients.map((coefficient, index) => ({
          ...coefficient,
          term: index === 0 ? '(Intercept)' : predictorNames[index - 1] ?? coefficient.term,
        })),
        notes: ['Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.'],
      }]
    : []),
];
