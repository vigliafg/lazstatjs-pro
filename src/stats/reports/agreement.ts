import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';
import type { BlandAltmanResult, IccResult, KappaResult } from '../agreement/types';

export const iccReport = (tables: TableSpec[], stats: IccResult, level: number): ReportSpec => ({
  id: 'agreement-icc',
  title: copy('Report di affidabilità'),
  headline: copy('ICC(2,1) = {s1} su {s2} misure e {s3} soggetti.', { s1: fmtEst(stats.icc21, 3), s2: stats.k, s3: stats.n }),
  badge: stats.icc21 >= 0.75 ? copy('Affidabilità buona') : stats.icc21 >= 0.5 ? copy('Affidabilità moderata') : copy('Affidabilità bassa'),
  tone: stats.icc21 >= 0.75 ? 'positive' : stats.icc21 >= 0.5 ? 'neutral' : 'caution',
  intro: [
    copy(`Il modello two-way random valuta l’accordo assoluto tra rater o misure ripetute.`),
    copy('ICC(3,1) di consistenza = {s1}; F = {s2}, p = {s3}.', { s1: fmtEst(stats.icc31, 3), s2: fmtEst(stats.f, 3), s3: fmtP(stats.p) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.'),
        copy('Il livello di confidenza richiesto è {s1}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.', { s1: level }),
      ],
    },
  ],
  limitations: [copy('L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.')],
});

export const blandAltmanReport = (stats: BlandAltmanResult, level: number): ReportSpec => ({
  id: 'agreement-bland',
  title: copy('Report Bland–Altman'),
  headline: copy('Bias = {s1} (CI {s2}%: {s3} – {s4}).', { s1: fmtEst(stats.bias, 3), s2: level, s3: fmtEst(stats.biasLo, 3), s4: fmtEst(stats.biasHi, 3) }),
  badge: Math.abs(stats.bias) < stats.sd ? copy('Bias contenuto') : copy('Bias da valutare'),
  tone: Math.abs(stats.bias) < stats.sd ? 'neutral' : 'caution',
  intro: [
    copy('Limiti di accordo: {s1} – {s2}.', { s1: fmtEst(stats.loaLower, 3), s2: fmtEst(stats.loaUpper, 3) }),
    copy('Pendenza del bias sulla media = {s1} (p = {s2}).', { s1: fmtEst(stats.slope, 3), s2: fmtP(stats.slopeP) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.'),
        stats.slopeP < 0.05
          ? copy('La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.')
          : copy('Non c’è evidenza di un bias proporzionale al livello della misura.'),
      ],
    },
  ],
  limitations: [copy('I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.')],
});

export const kappaReport = (stats: KappaResult, level: number): ReportSpec => ({
  id: 'agreement-kappa',
  title: copy('Report di accordo categorico'),
  headline: copy('Kappa = {s1} (CI {s2}%: {s3} – {s4}).', { s1: fmtEst(stats.kappa, 3), s2: level, s3: fmtEst(stats.lo, 3), s4: fmtEst(stats.hi, 3) }),
  badge:
    stats.kappa >= 0.8 ? copy('Accordo quasi perfetto')
      : stats.kappa >= 0.6 ? copy('Accordo sostanziale')
        : stats.kappa >= 0.4 ? copy('Accordo moderato')
          : copy('Accordo debole'),
  tone: stats.kappa >= 0.6 ? 'positive' : stats.kappa >= 0.4 ? 'neutral' : 'caution',
  intro: [
    copy('Accordo osservato = {s1}; accordo atteso per caso = {s2}.', { s1: fmtEst(stats.po, 3), s2: fmtEst(stats.pe, 3) }),
    copy('p = {s1} contro kappa = 0.', { s1: fmtP(stats.p) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.'),
        stats.raters > 2
          ? copy('Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.')
          : copy('Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.'),
      ],
    },
  ],
  limitations: [copy('Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.')],
});
