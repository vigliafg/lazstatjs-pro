import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { MixedAnovaStats } from '../mixedanova/types';

export const mixedAnovaReport = (stats: MixedAnovaStats, groupName: string, level: number): ReportSpec => {
  const [group, , time, interaction] = stats.effects;
  return {
    id: 'mixedanova',
    title: 'Report ANOVA mista',
    headline: `Fattore ${groupName}: F(${group.df}, ${stats.n - stats.groups.length}) = ${fmtEst(group.f, 3)}, p = ${fmtP(group.p)}.`,
    badge: group.p < 1 - level / 100 ? 'Effetto between significativo' : 'Effetto between non significativo',
    tone: group.p < 1 - level / 100 ? 'positive' : 'neutral',
    intro: [
      `${stats.n} soggetti, ${stats.groups.length} gruppi, ${stats.conditions.length} condizioni within.`,
      `Within: F(${time.df}, ${stats.effects[4].df}) = ${fmtEst(time.f, 3)}, p = ${fmtP(time.p)}; interazione F(${interaction.df}, ${stats.effects[4].df}) = ${fmtEst(interaction.f, 3)}, p = ${fmtP(interaction.p)}.`,
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          'Il fattore between confronta i gruppi sulle medie delle condizioni; il fattore within confronta le condizioni dentro soggetto.',
          interaction.p < 1 - level / 100
            ? 'L’interazione è significativa: l’effetto del tempo cambia tra i gruppi, quindi vanno lette le medie cella più che gli effetti principali.'
            : 'L’interazione non è significativa: gli effetti principali sono interpretabili separatamente.',
          'Il modello assume sfericità per il fattore within con più di due livelli; senza correzione i test within possono essere anti-conservativi.',
        ],
      },
    ],
    limitations: [
      'Una sola osservazione per soggetto e condizione: nessun effetto casuale oltre al soggetto.',
      'Con gruppi sbilanciati l’ANOVA split-plot classica non è banale: qui è riportata la decomposizione standard.',
    ],
  };
};
