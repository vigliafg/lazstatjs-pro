import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { ResamplingStats } from '../resampling/types';

export const resamplingReport = (stats: ResamplingStats, level: number): ReportSpec => ({
  id: 'resampling',
  title: copy('Report di resampling'),
  headline: copy('Differenza {s1} = {s2}; permutazione p = {s3}.', { s1: stats.statistic === 'mean' ? copy('delle medie') : copy('delle mediane'), s2: fmtEst(stats.difference, 3), s3: fmtP(stats.pPermutation) }),
  badge: stats.pPermutation < 0.05 ? copy('Differenza oltre il caso') : copy('Differenza compatibile con il caso'),
  tone: stats.pPermutation < 0.05 ? 'positive' : 'neutral',
  intro: [
    copy('Gruppi: {s1} (N = {s2}) e {s3} (N = {s4}).', { s1: stats.groups[0], s2: stats.n1, s3: stats.groups[1], s4: stats.n2 }),
    copy('CI bootstrap {s1}%: {s2} – {s3}.', { s1: level, s2: fmtEst(stats.ciLo, 3), s3: fmtEst(stats.ciHi, 3) }),
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        copy('La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.'),
        stats.ciLo > 0 || stats.ciHi < 0
          ? copy('Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.')
          : copy('Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.'),
      ],
    },
  ],
  limitations: [
    copy('Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.'),
    copy('Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.'),
  ],
});
