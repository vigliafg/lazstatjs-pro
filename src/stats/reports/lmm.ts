import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { LmmStats } from '../lmm/types';

export const lmmReport = (stats: LmmStats, predNames: string[], groupName: string, level: number): ReportSpec => ({
  id: 'lmm',
  title: copy('Report del modello misto'),
  headline: copy('ICC = {s1}: il {s2}% della variabilità è tra gruppi ({s3}).', { s1: fmtEst(stats.icc, 3), s2: fmtEst(stats.icc * 100, 1), s3: groupName }),
  badge: stats.icc >= 0.2 ? copy('Struttura di gruppo rilevante') : copy('Struttura di gruppo modesta'),
  tone: 'neutral',
  intro: [
    copy('Modello: esito ~ {s1} + (1 | {s2}), {s3} gruppi, {s4} osservazioni.', { s1: predNames.join(' + '), s2: groupName, s3: stats.groups, s4: stats.n }),
    copy('Varianza dell’intercetta = {s1}; varianza residua = {s2}.', { s1: fmtEst(stats.sigmaU2, 4), s2: fmtEst(stats.sigmaE2, 4) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy(`L’ICC misura la quota di varianza attribuibile alle differenze tra gruppi. Un ICC alto indica che le osservazioni dello stesso gruppo si somigliano e che ignorare il gruppo gonfia l’errore.`),
        copy(`Gli effetti fissi sono stimati con REML; il modello assume normalità degli effetti casuali e residui omoschedastici.`),
      ],
    },
  ],
  limitations: [
    copy('Solo intercetta casuale: non sono stimati slope casuali.'),
    copy('Con meno di 5–10 gruppi la varianza tra gruppi è imprecisa.'),
    copy(`Il p dei coefficienti è approssimato e non tiene conto dei gradi di libertà Satterthwaite.`),
  ],
});
