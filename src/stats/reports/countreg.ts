import { fmtEst, fmtP } from '../format';
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
    title: 'Report di regressione per conteggi',
    headline:
      stats.family === 'poisson'
        ? `Modello di Poisson su ${stats.n} osservazioni; dispersione ${fmtEst(stats.dispersion, 3)}.`
        : `Modello binomiale negativo su ${stats.n} osservazioni (θ = ${fmtEst(stats.theta ?? NaN, 3)}).`,
    badge: stats.dispersion > 1.5 && stats.family === 'poisson' ? 'Overdispersion da valutare' : 'Modello stimato',
    tone: stats.dispersion > 1.5 && stats.family === 'poisson' ? 'caution' : 'neutral',
    intro: [
      `LR vs modello nullo: χ² = ${fmtEst(stats.lr, 3)}, p = ${fmtP(stats.lrP)}.`,
      main ? `Il primo predittore ha IRR = ${fmtEst(main.irr, 3)} (CI ${level}%: ${fmtEst(main.irrLo, 3)} – ${fmtEst(main.irrHi, 3)}).` : '',
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          significant.length > 0
            ? `${significant.length} predittore/i risultano significativi al livello scelto.`
            : 'Nessun predittore risulta significativo al livello scelto.',
          'IRR > 1 indica un tasso atteso più alto per un’unità in più del predittore; IRR < 1 un tasso più basso.',
          stats.family === 'poisson' && stats.dispersion > 1.5
            ? 'La dispersione è chiaramente sopra 1: il Poisson sottostima l’errore. Usa la negative binomiale.'
            : 'La dispersione è compatibile con il modello scelto.',
        ],
      },
    ],
    limitations: [
      'La regressione per conteggi assume osservazioni indipendenti e una relazione log-lineare.',
      'Con molti zeri può servire un modello zero-inflated, non disponibile.',
    ],
  };
};
