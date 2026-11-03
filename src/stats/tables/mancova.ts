import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { MancovaResult } from '../kernels/mancova';

export const mancovaTables = (result: MancovaResult, level: number): TableSpec[] => [
  {
    id: 'mancova-multivariate',
    title: copy('Test multivariato'),
    subtitle: copy('Wilk’s lambda · CI {s1}%', { s1: level }),
    columns: [
      { key: 'test', label: copy('Test'), format: 'text' },
      { key: 'lambda', label: 'λ', format: 'dec4' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'df1', label: 'df1', format: 'int' },
      { key: 'df2', label: 'df2', format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: [
      {
        test: copy('Wilk’s lambda'),
        lambda: result.wilks.lambda,
        f: result.wilks.f,
        df1: result.wilks.df1,
        df2: result.wilks.df2,
        p: result.wilks.p,
      },
    ],
    notes: [
      copy('Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.'),
      copy('L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.'),
    ],
  },
  {
    id: 'mancova-univariate',
    title: copy('ANCOVA univariata per variabile'),
    subtitle: copy('Effetto del gruppo al netto delle covariate'),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      { key: 'f', label: 'F', format: 'dec3' },
      { key: 'df1', label: 'df1', format: 'int' },
      { key: 'df2', label: 'df2', format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
    ],
    rows: result.univariate.map(item => ({
      variable: item.variable,
      f: item.f,
      df1: item.df1,
      df2: item.df2,
      p: item.p,
    })),
  },
  {
    id: 'mancova-adjusted',
    title: copy('Medie aggiustate'),
    subtitle: copy('Valori attesi alle medie delle covariate'),
    columns: [
      { key: 'variable', label: copy('Variabile'), format: 'text' },
      { key: 'group', label: copy('Gruppo'), format: 'text' },
      { key: 'mean', label: copy('Media aggiustata'), format: 'dec4' },
    ],
    rows: result.univariate.flatMap(item =>
      item.adjusted.map(entry => ({
        variable: item.variable,
        group: entry.group,
        mean: entry.mean,
      }))
    ),
  },
];
