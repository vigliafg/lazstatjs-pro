import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TimeDependentCoxSummary } from '../tables/tdcox';

export const tdCoxReport = (stats: TimeDependentCoxSummary, level: number): ReportSpec => ({
  id: 'tdcox',
  title: copy('Report Cox tempo-dipendente'),
  headline: copy('Modello di Cox start-stop su {s1} intervalli e {s2} eventi.', { s1: stats.intervals, s2: stats.events }),
  badge: stats.lrP < 1 - level / 100 ? copy('Covariate associate al rischio') : copy('Nessuna associazione netta'),
  tone: stats.lrP < 1 - level / 100 ? 'positive' : 'neutral',
  intro: [
    copy('LR χ² = {s1}, p = {s2}.', { s1: fmtEst(stats.lr, 3), s2: fmtP(stats.lrP) }),
    copy('Le covariate possono cambiare valore nel tempo: ogni riga descrive un intervallo start-stop.'),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        stats.lrP < 1 - level / 100
          ? copy('Il modello nel complesso è significativo: almeno una covariata è associata al rischio.')
          : copy('Il modello non mostra un’associazione complessiva significativa.'),
        copy('Gli hazard ratio sono interpretati come effetto istantaneo della covariata corrente.'),
        copy('Il livello di confidenza è {s1}%.', { s1: level }),
      ],
    },
  ],
  limitations: [
    copy('Il formato richiede intervalli start-stop coerenti e senza sovrapposizioni per soggetto.'),
    copy('Non sono inclusi fragilità, rischi competitivi o baseline stratificate.'),
  ],
});
