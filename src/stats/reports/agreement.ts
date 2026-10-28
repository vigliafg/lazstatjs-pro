import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { BlandAltmanResult, IccResult, KappaResult } from '../agreement/types';

export const iccReport = (tables: TableSpec[], stats: IccResult, level: number): ReportSpec => ({
  id: 'agreement-icc',
  title: 'Report di affidabilità',
  headline: `ICC(2,1) = ${fmtEst(stats.icc21, 3)} su ${stats.k} misure e ${stats.n} soggetti.`,
  badge: stats.icc21 >= 0.75 ? 'Affidabilità buona' : stats.icc21 >= 0.5 ? 'Affidabilità moderata' : 'Affidabilità bassa',
  tone: stats.icc21 >= 0.75 ? 'positive' : stats.icc21 >= 0.5 ? 'neutral' : 'caution',
  intro: [
    `Il modello two-way random valuta l’accordo assoluto tra rater o misure ripetute.`,
    `ICC(3,1) di consistenza = ${fmtEst(stats.icc31, 3)}; F = ${fmtEst(stats.f, 3)}, p = ${fmtP(stats.p)}.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.',
        `Il livello di confidenza richiesto è ${level}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.`,
      ],
    },
  ],
  limitations: ['L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.'],
});

export const blandAltmanReport = (stats: BlandAltmanResult, level: number): ReportSpec => ({
  id: 'agreement-bland',
  title: 'Report Bland–Altman',
  headline: `Bias = ${fmtEst(stats.bias, 3)} (CI ${level}%: ${fmtEst(stats.biasLo, 3)} – ${fmtEst(stats.biasHi, 3)}).`,
  badge: Math.abs(stats.bias) < stats.sd ? 'Bias contenuto' : 'Bias da valutare',
  tone: Math.abs(stats.bias) < stats.sd ? 'neutral' : 'caution',
  intro: [
    `Limiti di accordo: ${fmtEst(stats.loaLower, 3)} – ${fmtEst(stats.loaUpper, 3)}.`,
    `Pendenza del bias sulla media = ${fmtEst(stats.slope, 3)} (p = ${fmtP(stats.slopeP)}).`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.',
        stats.slopeP < 0.05
          ? 'La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.'
          : 'Non c’è evidenza di un bias proporzionale al livello della misura.',
      ],
    },
  ],
  limitations: ['I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.'],
});

export const kappaReport = (stats: KappaResult, level: number): ReportSpec => ({
  id: 'agreement-kappa',
  title: 'Report di accordo categorico',
  headline: `Kappa = ${fmtEst(stats.kappa, 3)} (CI ${level}%: ${fmtEst(stats.lo, 3)} – ${fmtEst(stats.hi, 3)}).`,
  badge:
    stats.kappa >= 0.8 ? 'Accordo quasi perfetto'
      : stats.kappa >= 0.6 ? 'Accordo sostanziale'
        : stats.kappa >= 0.4 ? 'Accordo moderato'
          : 'Accordo debole',
  tone: stats.kappa >= 0.6 ? 'positive' : stats.kappa >= 0.4 ? 'neutral' : 'caution',
  intro: [
    `Accordo osservato = ${fmtEst(stats.po, 3)}; accordo atteso per caso = ${fmtEst(stats.pe, 3)}.`,
    `p = ${fmtP(stats.p)} contro kappa = 0.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.',
        stats.raters > 2
          ? 'Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.'
          : 'Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.',
      ],
    },
  ],
  limitations: ['Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.'],
});
