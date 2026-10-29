import type { TableSpec } from '../types';
import { copy } from '../reportCopy';
import type { OrdinalStats } from '../ordinal/types';

export const ordinalTables = (stats: OrdinalStats, level: number): TableSpec[] => [
  {
    id: 'ordinal-summary',
    title: copy('Modello ordinale'),
    subtitle: copy('{s1} categorie · {s2} casi · CI {s3}%', { s1: stats.categories.length, s2: stats.n, s3: level }),
    columns: [
      { key: 'metric', label: copy('Metrica'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'dec4' },
    ],
    rows: [
      { metric: copy('N'), value: stats.n },
      { metric: copy('Categorie'), value: stats.categories.length },
      { metric: copy('Log-verosimiglianza'), value: stats.logLik },
      { metric: copy('LR vs nullo'), value: stats.lr },
      { metric: copy('p LR'), value: stats.lrP },
      { metric: copy('McFadden R²'), value: stats.mcfadden },
      { metric: copy('AIC'), value: stats.aic },
      { metric: copy('BIC'), value: stats.bic },
    ],
    notes: [
      copy('Modello a odds proporzionali con link logit: l’effetto dei predittori è costante su tutti i tagli.'),
      copy('Le categorie sono ordinate alfabeticamente/numericamente in base alle etichette.'),
    ],
  },
  {
    id: 'ordinal-coefficients',
    title: copy('Coefficienti'),
    subtitle: copy('OR e CI'),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'or', label: copy('OR'), format: 'dec4' },
      { key: 'lo', label: copy('OR low'), format: 'dec4' },
      { key: 'hi', label: copy('OR high'), format: 'dec4' },
    ],
    rows: stats.coefficients.map(coefficient => ({ ...coefficient })),
    notes: [copy('OR > 1 indica uno spostamento verso le categorie più alte.')],
  },
  {
    id: 'ordinal-thresholds',
    title: copy('Soglie'),
    subtitle: copy('Tagli tra categorie adiacenti'),
    columns: [
      { key: 'index', label: copy('Taglio'), format: 'int' },
      { key: 'alpha', label: copy('α'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'lo', label: copy('CI low'), format: 'dec4' },
      { key: 'hi', label: copy('CI high'), format: 'dec4' },
    ],
    rows: stats.thresholds.map(threshold => ({ ...threshold })),
    notes: [copy('Le soglie sono in scala logit e devono restare ordinate.')],
  },
];
