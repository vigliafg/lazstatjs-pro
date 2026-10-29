import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { MiStats } from '../mi/types';

export const miTables = (stats: MiStats, names: string[], level: number, predictorNames: string[] = []): TableSpec[] => [
  {
    id: 'mi-missing',
    title: copy('Dati mancanti'),
    subtitle: copy('{s1} righe · {s2} imputazioni · {s3} iterazioni', { s1: stats.n, s2: stats.imputations, s3: stats.iterations }),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      { key: 'observed', label: copy('Osservati'), format: 'int' },
      { key: 'missing', label: copy('Mancanti'), format: 'int' },
      { key: 'percent', label: copy('% mancante'), format: 'dec1' },
    ],
    rows: stats.variables.map((variable, index) => ({
      variable: names[index] ?? variable.name,
      observed: variable.observed,
      missing: variable.missing,
      percent: stats.n > 0 ? (variable.missing / stats.n) * 100 : NaN,
    })),
    notes: [copy('Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.')],
  },
  {
    id: 'mi-pooled',
    title: copy('Stime pooled (Rubin)'),
    subtitle: copy('CI {s1}%', { s1: level }),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      { key: 'mean', label: copy('Media'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
      { key: 'sd', label: copy('SD pooled'), format: 'dec4' },
      { key: 'df', label: copy('df Rubin'), format: 'dec1' },
      { key: 'fmi', label: copy('FMI'), format: 'dec3' },
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
      copy('Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.'),
      copy(`FMI = frazione di informazione mancante; df approssimati con la formula di Barnard–Rubin.`),
    ],
  },
  ...(stats.regression
    ? [{
        id: 'mi-regression',
        title: copy('Regressione pooled'),
        subtitle: copy('R² medio = {s1} · {s2}% CI', { s1: stats.regression.r2.toFixed(3), s2: level }),
        columns: [
          { key: 'term', label: copy('Termine'), format: 'text' as const },
          { key: 'beta', label: copy('β'), format: 'dec4' as const },
          { key: 'se', label: copy('SE'), format: 'dec4' as const },
          { key: 't', label: copy('t'), format: 'dec3' as const },
          { key: 'p', label: copy('p'), format: 'p' as const },
          { key: 'lo', label: copy('CI low'), format: 'dec4' as const },
          { key: 'hi', label: copy('CI high'), format: 'dec4' as const },
          { key: 'fmi', label: copy('FMI'), format: 'dec3' as const },
        ],
        rows: stats.regression.coefficients.map((coefficient, index) => ({
          ...coefficient,
          term: index === 0 ? '(Intercept)' : predictorNames[index - 1] ?? coefficient.term,
        })),
        notes: [copy('Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.')],
      }]
    : []),
];
