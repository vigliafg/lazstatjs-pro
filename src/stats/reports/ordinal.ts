import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { OrdinalStats } from '../ordinal/types';

export const ordinalReport = (stats: OrdinalStats, predNames: string[], level: number): ReportSpec => {
  const significant = stats.coefficients.filter(coefficient => coefficient.p < 1 - level / 100);
  return {
    id: 'ordinal',
    title: 'Report di regressione ordinale',
    headline: `Modello a odds proporzionali su ${stats.categories.length} categorie e ${stats.n} casi.`,
    badge: significant.length > 0 ? 'Predittori associati all’esito' : 'Nessun predittore significativo',
    tone: significant.length > 0 ? 'neutral' : 'caution',
    intro: [
      `LR vs modello nullo: χ² = ${fmtEst(stats.lr, 3)}, p = ${fmtP(stats.lrP)}.`,
      `Predittori: ${predNames.join(', ')}.`,
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          significant.length > 0
            ? `${significant.length} predittore/i spostano significativamente la probabilità verso le categorie più alte.`
            : 'Nessun predittore raggiunge la significatività al livello scelto.',
          'L’ipotesi di odds proporzionali assume che l’effetto di ogni predittore sia lo stesso su tutti i tagli: se non regge, servono modelli ordinali non proporzionali.',
        ],
      },
    ],
    limitations: [
      'Con poche osservazioni per categoria le stime sono instabili.',
      'Il modello assume categorie ordinate: l’ordine è quello alfabetico/numerico delle etichette.',
    ],
  };
};
