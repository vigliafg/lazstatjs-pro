import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show } from './shared';
import type { SignTestResult } from '../analysisResults';

export const signTestReport = (
  result: SignTestResult,
  name1: string,
  name2: string,
  level: number
): ReportSpec => ({
  id: 'report-sign-test',
  title: copy('Report di lettura — Test dei segni'),
  headline: copy(
    'Differenze {s1} − {s2}: {s3} positive e {s4} negative su {s5} coppie, p = {s6}.',
    {
      s1: name1,
      s2: name2,
      s3: result.positive,
      s4: result.negative,
      s5: result.n,
      s6: describeP(result.exactP),
    }
  ),
  badge: copy('Confronto'),
  tone: isDecided(result.exactP, level) ? 'caution' : 'positive',
  intro: [
    copy('Il test dei segni usa solo la direzione delle differenze: è robusto agli outlier e alle distribuzioni asimmetriche.'),
    copy('È la scelta quando la normalità è dubbia e le differenze non possono essere trasformate; in cambio ha meno potenza del t-test.'),
  ],
  sections: [
    {
      heading: copy('Risultato'),
      bullets: [
        copy('{s1} differenze non nulle: {s2} positive, {s3} negative; {s4} zeri esclusi.', {
          s1: result.n,
          s2: result.positive,
          s3: result.negative,
          s4: result.zeros,
        }),
        copy('p esatto {s1}; p asintotico {s2} (z = {s3}).', {
          s1: describeP(result.exactP),
          s2: describeP(result.asymptoticP),
          s3: show(result.z, 3),
        }),
        copy('Mediana delle differenze: {s1}.', { s1: show(result.median, 4) }),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        copy('L’ipotesi nulla è che metà delle differenze sia positiva: il p esatto è un binomiale con p = 0,5.'),
        copy('Gli zeri non contano: riducono il campione e possono rendere il test molto conservativo.'),
        copy('Con molte coppie l’approssimazione normale è adeguata; con poche coppie leggi il p esatto.'),
      ],
    },
  ],
  limitations: [
    copy('Le coppie devono essere indipendenti tra loro.'),
    copy('Il test ignora la grandezza delle differenze: una differenza enorme e una minima contano uguale.'),
    copy('Un risultato non significativo non dimostra l’assenza di effetto: guarda la mediana delle differenze.'),
  ],
});
