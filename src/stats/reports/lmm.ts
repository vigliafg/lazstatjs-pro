import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { LmmStats } from '../lmm/types';

export const lmmReport = (stats: LmmStats, predNames: string[], groupName: string, level: number): ReportSpec => ({
  id: 'lmm',
  title: 'Report del modello misto',
  headline: `ICC = ${fmtEst(stats.icc, 3)}: il ${fmtEst(stats.icc * 100, 1)}% della variabilità è tra gruppi (${groupName}).`,
  badge: stats.icc >= 0.2 ? 'Struttura di gruppo rilevante' : 'Struttura di gruppo modesta',
  tone: 'neutral',
  intro: [
    `Modello: esito ~ ${predNames.join(' + ')} + (1 | ${groupName}), ${stats.groups} gruppi, ${stats.n} osservazioni.`,
    `Varianza dell’intercetta = ${fmtEst(stats.sigmaU2, 4)}; varianza residua = ${fmtEst(stats.sigmaE2, 4)}.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        `L’ICC misura la quota di varianza attribuibile alle differenze tra gruppi. Un ICC alto indica che le osservazioni dello stesso gruppo si somigliano e che ignorare il gruppo gonfia l’errore.`,
        `Gli effetti fissi sono stimati con REML; il modello assume normalità degli effetti casuali e residui omoschedastici.`,
      ],
    },
  ],
  limitations: [
    'Solo intercetta casuale: non sono stimati slope casuali.',
    'Con meno di 5–10 gruppi la varianza tra gruppi è imprecisa.',
    `Il p dei coefficienti è approssimato e non tiene conto dei gradi di libertà Satterthwaite.`,
  ],
});
