import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { StratifiedCoxSummary } from '../tables/stratcox';

export const stratCoxReport = (stats: StratifiedCoxSummary, level: number): ReportSpec => ({
  id: 'stratcox',
  title: copy('Report Cox stratificato'),
  headline: copy('Modello di Cox con {s1} strati e {s2} eventi.', { s1: stats.strata, s2: stats.events }),
  badge: stats.lrP < 1 - level / 100 ? copy('Predittori associati al rischio') : copy('Nessuna associazione netta'),
  tone: stats.lrP < 1 - level / 100 ? 'positive' : 'neutral',
  intro: [
    copy('LR χ² = {s1}, p = {s2}; concordanza = {s3}.', { s1: fmtEst(stats.lr, 3), s2: fmtP(stats.lrP), s3: fmtEst(stats.concordance, 3) }),
    copy('La stratificazione permette una baseline di rischio diversa per strato, mantenendo un effetto comune dei predittori.'),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        stats.lrP < 1 - level / 100
          ? copy('Il modello nel complesso è significativo: almeno un predittore è associato al rischio entro strato.')
          : copy('Il modello non mostra un’associazione complessiva significativa.'),
        copy('Gli hazard ratio sono comuni agli strati: la stratificazione non stima effetti diversi per strato.'),
        copy('Il livello di confidenza è {s1}%.', { s1: level }),
      ],
    },
  ],
  limitations: [
    copy('Non sono incluse covariate tempo-dipendenti né fragilità.'),
    copy('La baseline per strato non è riportata.'),
  ],
});
