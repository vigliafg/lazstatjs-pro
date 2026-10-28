import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { TimeDependentCoxSummary } from '../tables/tdcox';

export const tdCoxReport = (stats: TimeDependentCoxSummary, level: number): ReportSpec => ({
  id: 'tdcox',
  title: 'Report Cox tempo-dipendente',
  headline: `Modello di Cox start-stop su ${stats.intervals} intervalli e ${stats.events} eventi.`,
  badge: stats.lrP < 1 - level / 100 ? 'Covariate associate al rischio' : 'Nessuna associazione netta',
  tone: stats.lrP < 1 - level / 100 ? 'positive' : 'neutral',
  intro: [
    `LR χ² = ${fmtEst(stats.lr, 3)}, p = ${fmtP(stats.lrP)}.`,
    'Le covariate possono cambiare valore nel tempo: ogni riga descrive un intervallo start-stop.',
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        stats.lrP < 1 - level / 100
          ? 'Il modello nel complesso è significativo: almeno una covariata è associata al rischio.'
          : 'Il modello non mostra un’associazione complessiva significativa.',
        'Gli hazard ratio sono interpretati come effetto istantaneo della covariata corrente.',
        `Il livello di confidenza è ${level}%.`,
      ],
    },
  ],
  limitations: [
    'Il formato richiede intervalli start-stop coerenti e senza sovrapposizioni per soggetto.',
    'Non sono inclusi fragilità, rischi competitivi o baseline stratificate.',
  ],
});
