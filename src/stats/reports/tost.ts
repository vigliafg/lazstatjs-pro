import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { TostStats } from '../tost/types';
import type { TableSpec } from '../types';

export const tostReport = (tables: TableSpec[], stats: TostStats, level: number): ReportSpec => ({
  id: 'tost',
  title: 'Report di equivalenza',
  headline: stats.equivalent
    ? `La differenza è compatibile con l’equivalenza entro ±${fmtEst(stats.margin, 3)} (TOST p = ${fmtP(stats.pTost)}).`
    : `Non c’è evidenza sufficiente di equivalenza entro ±${fmtEst(stats.margin, 3)} (TOST p = ${fmtP(stats.pTost)}).`,
  badge: stats.equivalent ? 'Equivalenza dimostrata' : 'Equivalenza non dimostrata',
  tone: stats.equivalent ? 'positive' : 'caution',
  intro: [
    `Il TOST verifica due ipotesi unilaterali: la differenza non è inferiore a −${fmtEst(stats.margin, 3)} e non è superiore a +${fmtEst(stats.margin, 3)}.`,
    `Intervallo di confidenza al ${level}%: ${fmtEst(stats.ciLo, 4)} – ${fmtEst(stats.ciHi, 4)}.`,
  ],
  sections: [
    {
      heading: 'Decisione',
      body: [
        stats.equivalent
          ? 'Poiché il CI è interamente dentro il margine, l’ipotesi di equivalenza non viene rifiutata: i due trattamenti sono compatibili con una differenza clinicamente irrilevante.'
          : 'Il CI esce dal margine oppure il p TOST non è sotto alpha: non si può concludere l’equivalenza. Questo non dimostra che i trattamenti siano diversi.',
        `Il margine deve essere deciso prima di vedere i dati: un margine scelto a posteriori rende il test non interpretabile.`,
      ],
    },
  ],
  limitations: [
    'TOST non è un test di superiorità: “non equivalente” non significa “diverso”.',
    'Il margine di equivalenza è una scelta clinica o pratica, non statistica.',
  ],
});
