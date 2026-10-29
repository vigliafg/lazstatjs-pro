import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { OrdinalStats } from '../ordinal/types';

export const ordinalReport = (stats: OrdinalStats, predNames: string[], level: number): ReportSpec => {
  const significant = stats.coefficients.filter(coefficient => coefficient.p < 1 - level / 100);
  return {
    id: 'ordinal',
    title: copy('Report di regressione ordinale'),
    headline: copy('Modello a odds proporzionali su {s1} categorie e {s2} casi.', { s1: stats.categories.length, s2: stats.n }),
    badge: significant.length > 0 ? copy('Predittori associati all’esito') : copy('Nessun predittore significativo'),
    tone: significant.length > 0 ? 'neutral' : 'caution',
    intro: [
      copy('LR vs modello nullo: χ² = {s1}, p = {s2}.', { s1: fmtEst(stats.lr, 3), s2: fmtP(stats.lrP) }),
      copy('Predittori: {s1}.', { s1: predNames.join(', ') }),
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          significant.length > 0
            ? copy('{s1} predittore/i spostano significativamente la probabilità verso le categorie più alte.', { s1: significant.length })
            : copy('Nessun predittore raggiunge la significatività al livello scelto.'),
          copy('L’ipotesi di odds proporzionali assume che l’effetto di ogni predittore sia lo stesso su tutti i tagli: se non regge, servono modelli ordinali non proporzionali.'),
        ],
      },
    ],
    limitations: [
      copy('Con poche osservazioni per categoria le stime sono instabili.'),
      copy('Il modello assume categorie ordinate: l’ordine è quello alfabetico/numerico delle etichette.'),
    ],
  };
};
