import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { ResamplingStats } from '../resampling/types';

export const resamplingReport = (stats: ResamplingStats, level: number): ReportSpec => ({
  id: 'resampling',
  title: 'Report di resampling',
  headline: `Differenza ${stats.statistic === 'mean' ? 'delle medie' : 'delle mediane'} = ${fmtEst(stats.difference, 3)}; permutazione p = ${fmtP(stats.pPermutation)}.`,
  badge: stats.pPermutation < 0.05 ? 'Differenza oltre il caso' : 'Differenza compatibile con il caso',
  tone: stats.pPermutation < 0.05 ? 'positive' : 'neutral',
  intro: [
    `Gruppi: ${stats.groups[0]} (N = ${stats.n1}) e ${stats.groups[1]} (N = ${stats.n2}).`,
    `CI bootstrap ${level}%: ${fmtEst(stats.ciLo, 3)} – ${fmtEst(stats.ciHi, 3)}.`,
  ],
  sections: [
    {
      heading: 'Lettura',
      body: [
        'La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.',
        stats.ciLo > 0 || stats.ciHi < 0
          ? 'Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.'
          : 'Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.',
      ],
    },
  ],
  limitations: [
    'Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.',
    'Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.',
  ],
});
