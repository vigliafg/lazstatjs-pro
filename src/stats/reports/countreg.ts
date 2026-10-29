import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { CountStats } from '../countreg/types';

export const countReport = (_tables: TableSpec[], stats: CountStats, level: number): ReportSpec => {
  const significant = stats.coefficients.filter(
    coefficient => coefficient.term !== '(Intercept)' && coefficient.p < 1 - level / 100
  );
  const main = stats.coefficients[1];
  return {
    id: 'countreg',
    title: copy('Report di regressione per conteggi'),
    headline:
      stats.family === 'poisson'
        ? copy('Modello di Poisson su {s1} osservazioni; dispersione {s2}.', { s1: stats.n, s2: fmtEst(stats.dispersion, 3) })
        : copy('Modello binomiale negativo su {s1} osservazioni (θ = {s2}).', { s1: stats.n, s2: fmtEst(stats.theta ?? NaN, 3) }),
    badge: stats.dispersion > 1.5 && stats.family === 'poisson' ? copy('Overdispersion da valutare') : copy('Modello stimato'),
    tone: stats.dispersion > 1.5 && stats.family === 'poisson' ? 'caution' : 'neutral',
    intro: [
      copy('LR vs modello nullo: χ² = {s1}, p = {s2}.', { s1: fmtEst(stats.lr, 3), s2: fmtP(stats.lrP) }),
      main ? copy('Il primo predittore ha IRR = {s1} (CI {s2}%: {s3} – {s4}).', { s1: fmtEst(main.irr, 3), s2: level, s3: fmtEst(main.irrLo, 3), s4: fmtEst(main.irrHi, 3) }) : '',
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          significant.length > 0
            ? copy('{s1} predittore/i risultano significativi al livello scelto.', { s1: significant.length })
            : copy('Nessun predittore risulta significativo al livello scelto.'),
          copy('IRR > 1 indica un tasso atteso più alto per un’unità in più del predittore; IRR < 1 un tasso più basso.'),
          stats.family === 'poisson' && stats.dispersion > 1.5
            ? copy('La dispersione è chiaramente sopra 1: il Poisson sottostima l’errore. Usa la negative binomiale.')
            : copy('La dispersione è compatibile con il modello scelto.'),
        ],
      },
    ],
    limitations: [
      copy('La regressione per conteggi assume osservazioni indipendenti e una relazione log-lineare.'),
      copy('Con molti zeri può servire un modello zero-inflated, non disponibile.'),
    ],
  };
};
