import type { TableSpec } from '../types';
import type { OrdinalStats } from '../ordinal/types';

export const ordinalTables = (stats: OrdinalStats, level: number): TableSpec[] => [
  {
    id: 'ordinal-summary',
    title: 'Modello ordinale',
    subtitle: `${stats.categories.length} categorie · ${stats.n} casi · CI ${level}%`,
    columns: [
      { key: 'metric', label: 'Metrica', format: 'text' },
      { key: 'value', label: 'Valore', format: 'dec4' },
    ],
    rows: [
      { metric: 'N', value: stats.n },
      { metric: 'Categorie', value: stats.categories.length },
      { metric: 'Log-verosimiglianza', value: stats.logLik },
      { metric: 'LR vs nullo', value: stats.lr },
      { metric: 'p LR', value: stats.lrP },
      { metric: 'McFadden R²', value: stats.mcfadden },
      { metric: 'AIC', value: stats.aic },
      { metric: 'BIC', value: stats.bic },
    ],
    notes: [
      'Modello a odds proporzionali con link logit: l’effetto dei predittori è costante su tutti i tagli.',
      'Le categorie sono ordinate alfabeticamente/numericamente in base alle etichette.',
    ],
  },
  {
    id: 'ordinal-coefficients',
    title: 'Coefficienti',
    subtitle: 'OR e CI',
    columns: [
      { key: 'term', label: 'Termine', format: 'text' },
      { key: 'beta', label: 'β', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'z', label: 'z', format: 'dec3' },
      { key: 'p', label: 'p', format: 'p' },
      { key: 'or', label: 'OR', format: 'dec4' },
      { key: 'lo', label: 'OR low', format: 'dec4' },
      { key: 'hi', label: 'OR high', format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: ['OR > 1 indica uno spostamento verso le categorie più alte.'],
  },
  {
    id: 'ordinal-thresholds',
    title: 'Soglie',
    subtitle: 'Tagli tra categorie adiacenti',
    columns: [
      { key: 'index', label: 'Taglio', format: 'int' },
      { key: 'alpha', label: 'α', format: 'dec4' },
      { key: 'se', label: 'SE', format: 'dec4' },
      { key: 'lo', label: 'CI low', format: 'dec4' },
      { key: 'hi', label: 'CI high', format: 'dec4' },
    ],
    rows: stats.thresholds.map(threshold => ({ ...threshold })),
    notes: ['Le soglie sono in scala logit e devono restare ordinate.'],
  },
];
