import { copy } from '../reportCopy';
import type { MiStats } from '../mi/types';
import type { TableSpec } from '../types';

/**
 * Tables for the categorical MICE path: one summary per variable, the observed
 * and completed counts per category, and the Rubin-pooled proportions with
 * their confidence intervals.
 */
export const miCategoricalTables = (stats: MiStats, names: string[], level: number): TableSpec[] => {
  const variables = stats.categories ?? [];
  if (variables.length === 0) return [];

  return [
    {
      id: 'mi-categorical-summary',
      title: copy('Riepilogo per variabile'),
      subtitle: copy('{s1} righe · {s2} imputazioni · {s3} iterazioni', {
        s1: stats.n,
        s2: stats.imputations,
        s3: stats.iterations,
      }),
      columns: [
        { key: 'variable', label: copy('Variabile'), format: 'text' },
        { key: 'observed', label: copy('Osservati'), format: 'int' },
        { key: 'missing', label: copy('Mancanti'), format: 'int' },
        { key: 'percent', label: copy('% mancante'), format: 'dec1' },
        { key: 'categoryCount', label: copy('Categorie'), format: 'int' },
        { key: 'categories', label: copy('Codici osservati'), format: 'text' },
      ],
      rows: variables.map((variable, index) => ({
        variable: names[index] ?? variable.name,
        observed: variable.observed,
        missing: variable.missing,
        percent: stats.n > 0 ? (variable.missing / stats.n) * 100 : NaN,
        categoryCount: variable.categories.length,
        categories: variable.categories.join(', '),
      })),
      notes: [
        copy('Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.'),
        copy('Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.'),
      ],
    },
    {
      id: 'mi-categorical-counts',
      title: copy('Conteggi osservati e completati per categoria'),
      subtitle: copy('Dopo l’ultima delle {s1} imputazioni', { s1: stats.imputations }),
      columns: [
        { key: 'variable', label: copy('Variabile'), format: 'text' },
        { key: 'category', label: copy('Categoria'), format: 'text' },
        { key: 'observed', label: copy('Osservati'), format: 'int' },
        { key: 'completed', label: copy('Completati'), format: 'int' },
        { key: 'observedProportion', label: copy('Prop. osservata'), format: 'dec4' },
        { key: 'completedProportion', label: copy('Prop. completata'), format: 'dec4' },
      ],
      rows: variables.flatMap((variable, index) =>
        variable.proportions.map(entry => ({
          variable: names[index] ?? variable.name,
          category: String(entry.category),
          observed: entry.observed,
          completed: entry.completed,
          observedProportion: entry.observedProportion,
          completedProportion: entry.completedProportion,
        }))
      ),
      notes: [
        copy('I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.'),
        copy('Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.'),
      ],
    },
    {
      id: 'mi-categorical-pooled',
      title: copy('Proporzioni pooled (Rubin)'),
      subtitle: copy('CI {s1}% · pooling sulle {s2} imputazioni', { s1: level, s2: stats.imputations }),
      columns: [
        { key: 'variable', label: copy('Variabile'), format: 'text' },
        { key: 'category', label: copy('Categoria'), format: 'text' },
        { key: 'proportion', label: copy('Proporzione'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 'lo', label: copy('CI low'), format: 'dec4' },
        { key: 'hi', label: copy('CI high'), format: 'dec4' },
        { key: 'df', label: copy('df Rubin'), format: 'dec1' },
        { key: 'fmi', label: copy('FMI'), format: 'dec3' },
      ],
      rows: variables.flatMap((variable, index) =>
        variable.proportions.map(entry => ({
          variable: names[index] ?? variable.name,
          category: String(entry.category),
          proportion: entry.proportion,
          se: entry.se,
          lo: entry.lo,
          hi: entry.hi,
          df: entry.df,
          fmi: entry.fmi,
        }))
      ),
      notes: [
        copy('Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.'),
        copy('Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.'),
      ],
    },
  ];
};
