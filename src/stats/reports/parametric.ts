import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { ParametricSurvivalStats } from '../parametric/types';

export const parametricReport = (stats: ParametricSurvivalStats, predNames: string[], level: number): ReportSpec => ({
  id: 'parametric',
  title: copy('Report di sopravvivenza parametrica'),
  headline: copy('{s1} AFT su {s2} osservazioni e {s3} eventi.', { s1: stats.distribution === 'weibull' ? 'Weibull' : 'Esponenziale', s2: stats.n, s3: stats.events }),
  badge: stats.events >= 10 ? copy('Modello stimato') : copy('Pochi eventi'),
  tone: stats.events >= 10 ? 'neutral' : 'caution',
  intro: [
    copy('Predictori: {s1}.', { s1: predNames.join(', ') }),
    copy('Scala σ = {s1}; log-verosimiglianza = {s2}.', { s1: fmtEst(stats.sigma, 3), s2: fmtEst(stats.logLik, 3) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('Il modello AFT stima l’effetto dei predittori sul log del tempo di sopravvivenza: un time ratio maggiore di 1 indica tempi più lunghi.'),
        copy('La forma della distribuzione (Weibull o esponenziale) è un’assunzione: va confrontata con KM e con l’AIC rispetto ad altre famiglie.'),
        copy('Il livello di confidenza è {s1}%; con pochi eventi le stime sono instabili.', { s1: level }),
      ],
    },
  ],
  limitations: [
    copy('Non sono inclusi effetti casuali, fragilità o rischi competitivi.'),
    copy('La censura è assunta non informativa.'),
  ],
});
