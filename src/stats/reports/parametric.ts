import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { ParametricSurvivalStats } from '../parametric/types';

export const parametricReport = (stats: ParametricSurvivalStats, predNames: string[], level: number): ReportSpec => ({
  id: 'parametric',
  title: 'Report di sopravvivenza parametrica',
  headline: `${stats.distribution === 'weibull' ? 'Weibull' : 'Esponenziale'} AFT su ${stats.n} osservazioni e ${stats.events} eventi.`,
  badge: stats.events >= 10 ? 'Modello stimato' : 'Pochi eventi',
  tone: stats.events >= 10 ? 'neutral' : 'caution',
  intro: [
    `Predictori: ${predNames.join(', ')}.`,
    `Scala σ = ${fmtEst(stats.sigma, 3)}; log-verosimiglianza = ${fmtEst(stats.logLik, 3)}.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'Il modello AFT stima l’effetto dei predittori sul log del tempo di sopravvivenza: un time ratio maggiore di 1 indica tempi più lunghi.',
        'La forma della distribuzione (Weibull o esponenziale) è un’assunzione: va confrontata con KM e con l’AIC rispetto ad altre famiglie.',
        `Il livello di confidenza è ${level}%; con pochi eventi le stime sono instabili.`,
      ],
    },
  ],
  limitations: [
    'Non sono inclusi effetti casuali, fragilità o rischi competitivi.',
    'La censura è assunta non informativa.',
  ],
});
