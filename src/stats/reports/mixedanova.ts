import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { MixedAnovaStats } from '../mixedanova/types';

export const mixedAnovaReport = (stats: MixedAnovaStats, groupName: string, level: number): ReportSpec => {
  const [group, , time, interaction] = stats.effects;
  return {
    id: 'mixedanova',
    title: copy('Report ANOVA mista'),
    headline: copy('Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}.', { s1: groupName, s2: group.df, s3: stats.n - stats.groups.length, s4: fmtEst(group.f, 3), s5: fmtP(group.p) }),
    badge: group.p < 1 - level / 100 ? copy('Effetto between significativo') : copy('Effetto between non significativo'),
    tone: group.p < 1 - level / 100 ? 'positive' : 'neutral',
    intro: [
      copy('{s1} soggetti, {s2} gruppi, {s3} condizioni within.', { s1: stats.n, s2: stats.groups.length, s3: stats.conditions.length }),
      copy('Within: F({s1}, {s2}) = {s3}, p = {s4}; interazione F({s5}, {s6}) = {s7}, p = {s8}.', { s1: time.df, s2: stats.effects[4].df, s3: fmtEst(time.f, 3), s4: fmtP(time.p), s5: interaction.df, s6: stats.effects[4].df, s7: fmtEst(interaction.f, 3), s8: fmtP(interaction.p) }),
      copy('Sfericità: Mauchly p = {s1}, ε GG = {s2}; p corretti GG: tempo {s3}, interazione {s4}.', { s1: fmtP(stats.sphericity.p), s2: fmtEst(stats.sphericity.ggEpsilon, 3), s3: fmtP(stats.pGGTime), s4: fmtP(stats.pGGInteraction) })
    ],
    sections: [
      {
        heading: 'Lettura',
        body: [
          copy('Il fattore between confronta i gruppi sulle medie delle condizioni; il fattore within confronta le condizioni dentro soggetto.'),
          interaction.p < 1 - level / 100
            ? copy('L’interazione è significativa: l’effetto del tempo cambia tra i gruppi, quindi vanno lette le medie cella più che gli effetti principali.')
            : copy('L’interazione non è significativa: gli effetti principali sono interpretabili separatamente.'),
          copy('Il modello assume sfericità per il fattore within con più di due livelli; la tabella riporta Mauchly, epsilon e p corrette GG.'),
          copy('Le EM means marginali non pesate valgono {s1} come media complessiva; in caso di gruppi sbilanciati sono la lettura corretta degli effetti principali.', { s1: fmtEst(stats.emMeans.grand, 3) }),
        ],
      },
    ],
    limitations: [
      copy('Una sola osservazione per soggetto e condizione: nessun effetto casuale oltre al soggetto.'),
      copy('Con gruppi sbilanciati l’ANOVA split-plot classica non è banale: qui è riportata la decomposizione standard.'),
    ],
  };
};
