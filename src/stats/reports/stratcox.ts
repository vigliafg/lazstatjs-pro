import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { StratifiedCoxSummary } from '../tables/stratcox';

export const stratCoxReport = (stats: StratifiedCoxSummary, level: number): ReportSpec => ({
  id: 'stratcox',
  title: 'Report Cox stratificato',
  headline: `Modello di Cox con ${stats.strata} strati e ${stats.events} eventi.`,
  badge: stats.lrP < 1 - level / 100 ? 'Predittori associati al rischio' : 'Nessuna associazione netta',
  tone: stats.lrP < 1 - level / 100 ? 'positive' : 'neutral',
  intro: [
    `LR χ² = ${fmtEst(stats.lr, 3)}, p = ${fmtP(stats.lrP)}; concordanza = ${fmtEst(stats.concordance, 3)}.`,
    'La stratificazione permette una baseline di rischio diversa per strato, mantenendo un effetto comune dei predittori.',
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        stats.lrP < 1 - level / 100
          ? 'Il modello nel complesso è significativo: almeno un predittore è associato al rischio entro strato.'
          : 'Il modello non mostra un’associazione complessiva significativa.',
        'Gli hazard ratio sono comuni agli strati: la stratificazione non stima effetti diversi per strato.',
        `Il livello di confidenza è ${level}%.`,
      ],
    },
  ],
  limitations: [
    'Non sono incluse covariate tempo-dipendenti né fragilità.',
    'La baseline per strato non è riportata.',
  ],
});
