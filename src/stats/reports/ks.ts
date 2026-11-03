import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show } from './shared';
import type { TwoSampleKsResult } from '../analysisResults';

export const ksReport = (
  result: TwoSampleKsResult,
  variableName: string,
  groupName: string,
  firstName: string,
  secondName: string,
  level: number
): ReportSpec => ({
  id: 'report-ks-two',
  title: copy('Report di lettura — Kolmogorov–Smirnov'),
  headline: copy(
    'Distanza massima tra {s1} e {s2} per {s3}: {s4} (p = {s5}).',
    {
      s1: firstName,
      s2: secondName,
      s3: variableName,
      s4: show(result.d, 3),
      s5: describeP(result.p),
    }
  ),
  badge: copy('Confronto'),
  tone: isDecided(result.p, level) ? 'caution' : 'positive',
  intro: [
    copy('Il test di Kolmogorov–Smirnov confronta le due distribuzioni cumulative: è sensibile a differenze di posizione, dispersione e forma.'),
    copy('A differenza di un test sulla media, non richiede la normalità: descrive tutta la distribuzione, non solo il centro.'),
  ],
  sections: [
    {
      heading: copy('Risultato'),
      bullets: [
        copy('{s1}: {s2} osservazioni; {s3}: {s4} osservazioni.', {
          s1: firstName,
          s2: result.n1,
          s3: secondName,
          s4: result.n2,
        }),
        copy('D = {s1}; p = {s2} ({s3}).', {
          s1: show(result.d, 4),
          s2: describeP(result.p),
          s3: result.method === 'exact' ? copy('esatto') : copy('asintotico'),
        }),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        copy('D è la distanza verticale massima tra le due curve: 0 significa distribuzioni identiche, 1 nessuna sovrapposizione.'),
        copy('Il p esatto enumera i ranghi possibili; con campioni grandi si usa l’approssimazione di Kolmogorov.'),
        copy('Il test è bilaterale: rifiuta sia uno spostamento sia una differenza di forma.'),
      ],
    },
  ],
  limitations: [
    copy('I due campioni devono essere indipendenti.'),
    copy('Con molti valori uguali il p è approssimato: i ranghi con ties riducono la precisione.'),
    copy('Un p piccolo non dice quale aspetto differisca: guarda le due curve cumulative.'),
  ],
});
