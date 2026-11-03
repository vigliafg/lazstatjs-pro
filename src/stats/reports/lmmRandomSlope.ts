import { copy } from '../reportCopy';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

export interface LmmRandomSlopeReportNames {
  dep: string;
  group: string;
  slope: string;
  level: number;
}

/** Reading report for the random-slope LMM. */
export const lmmRandomSlopeReport = (
  tables: TableSpec[],
  names: LmmRandomSlopeReportNames
): ReportSpec => {
  const summary = tables.find(table => table.id === 'lmm-summary')?.rows ?? [];
  const metric = (label: string): string =>
    String(summary.find(row => String(row.metric) === label)?.value ?? '—');
  const icc = Number(metric('ICC'));
  const slopeVariance = Number(metric('Varianza pendenza'));
  const correlation = Number(metric('Correlazione'));

  return {
    id: 'lmm',
    title: copy('Report del modello misto con pendenza casuale'),
    headline: copy(
      'ICC = {s1}: il {s2}% della variabilità è tra gruppi; la pendenza di {s3} varia tra gruppi (varianza {s4}).',
      {
        s1: metric('ICC'),
        s2: Number.isFinite(icc) ? (icc * 100).toFixed(1) : '—',
        s3: names.slope,
        s4: metric('Varianza pendenza'),
      }
    ),
    badge: copy('Struttura di gruppo rilevante'),
    tone: 'neutral',
    intro: [
      copy('Il modello stima un’intercetta e una pendenza per ogni gruppo, trattandole come estrazioni da una popolazione normale.'),
      copy('La pendenza media è un effetto fisso; la sua variabilità tra gruppi è un effetto casuale.'),
    ],
    sections: [
      {
        heading: copy('Lettura'),
        body: [
          copy('Varianza della pendenza = {s1}; correlazione intercetta–pendenza = {s2}.', {
            s1: metric('Varianza pendenza'),
            s2: metric('Correlazione'),
          }),
          copy(
            'Una varianza di pendenza vicina a zero indica che i gruppi crescono allo stesso modo; una correlazione positiva indica che i gruppi con intercetta più alta tendono ad avere pendenze più ripide.'
          ),
        ],
      },
      {
        heading: copy('Cautele'),
        body: [
          copy('Servono almeno 5–10 gruppi per stimare una varianza di pendenza con una precisione accettabile.'),
          copy('Con pochi punti per gruppo la stima della pendenza casuale è instabile e può collassare verso zero.'),
        ],
      },
    ],
    limitations: [
      copy('Il test z è asintotico: non usa gradi di libertà Satterthwaite o Kenward–Roger.'),
      copy('Il modello assume normalità degli effetti casuali e residui omoschedastici.'),
    ],
  };
};
