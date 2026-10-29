import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TostStats } from '../tost/types';
import type { TableSpec } from '../types';

export const tostReport = (tables: TableSpec[], stats: TostStats, level: number): ReportSpec => ({
  id: 'tost',
  title: copy('Report di equivalenza'),
  headline: stats.equivalent
    ? copy('La differenza è compatibile con l’equivalenza entro ±{s1} (TOST p = {s2}).', { s1: fmtEst(stats.margin, 3), s2: fmtP(stats.pTost) })
    : copy('Non c’è evidenza sufficiente di equivalenza entro ±{s1} (TOST p = {s2}).', { s1: fmtEst(stats.margin, 3), s2: fmtP(stats.pTost) }),
  badge: stats.equivalent ? copy('Equivalenza dimostrata') : copy('Equivalenza non dimostrata'),
  tone: stats.equivalent ? 'positive' : 'caution',
  intro: [
    copy('Il TOST verifica due ipotesi unilaterali: la differenza non è inferiore a −{s1} e non è superiore a +{s2}.', { s1: fmtEst(stats.margin, 3), s2: fmtEst(stats.margin, 3) }),
    copy('Intervallo di confidenza al {s1}%: {s2} – {s3}.', { s1: level, s2: fmtEst(stats.ciLo, 4), s3: fmtEst(stats.ciHi, 4) }),
  ],
  sections: [
    {
      heading: 'Decisione',
      body: [
        stats.equivalent
          ? copy('Poiché il CI è interamente dentro il margine, l’ipotesi di equivalenza non viene rifiutata: i due trattamenti sono compatibili con una differenza clinicamente irrilevante.')
          : copy('Il CI esce dal margine oppure il p TOST non è sotto alpha: non si può concludere l’equivalenza. Questo non dimostra che i trattamenti siano diversi.'),
        copy(`Il margine deve essere deciso prima di vedere i dati: un margine scelto a posteriori rende il test non interpretabile.`),
      ],
    },
  ],
  limitations: [
    copy('TOST non è un test di superiorità: “non equivalente” non significa “diverso”.'),
    copy('Il margine di equivalenza è una scelta clinica o pratica, non statistica.'),
  ],
});
