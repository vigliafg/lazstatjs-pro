import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show } from './shared';
import type { MoodResult } from '../analysisResults';

export const moodReport = (
  result: MoodResult,
  depName: string,
  groupName: string,
  level: number
): ReportSpec => ({
  id: 'report-mood',
  title: copy('Report di lettura — Test della mediana di Mood'),
  headline: copy(
    'Mediana comune di {s1}: {s2}; il test χ² confronta {s3} gruppi di {s4} (p = {s5}).',
    {
      s1: depName,
      s2: show(result.median, 3),
      s3: result.groups.length,
      s4: groupName,
      s5: describeP(result.p),
    }
  ),
  badge: copy('Confronto'),
  tone: isDecided(result.p, level) ? 'caution' : 'positive',
  intro: [
    copy('Il test di Mood classifica ogni osservazione rispetto alla mediana comune e confronta quanti casi cadono sopra e sotto in ogni gruppo.'),
    copy('È un test non parametrico sull’uguaglianza delle mediane: non assume la normalità e resiste agli outlier.'),
  ],
  sections: [
    {
      heading: copy('Risultato'),
      bullets: [
        copy('Osservazioni sopra la mediana: {s1}; sotto o uguali: {s2}.', {
          s1: result.above,
          s2: result.below,
        }),
        copy('χ² = {s1}, df = {s2}, p = {s3}.', {
          s1: show(result.chi2, 3),
          s2: result.df,
          s3: describeP(result.p),
        }),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        copy('Il test χ² confronta le frequenze osservate sopra/sotto con quelle attese se le mediane fossero uguali.'),
        copy('La correzione (N − 1)/N è quella di coin::median_test; con gruppi molto piccoli il p è approssimato.'),
        copy('Con molti valori uguali alla mediana il test diventa conservativo.'),
      ],
    },
  ],
  limitations: [
    copy('I gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.'),
    copy('Il test confronta le mediane, non le medie: una differenza di media può non emergere.'),
    copy('Un p non significativo non dimostra l’uguaglianza delle mediane.'),
  ],
});
