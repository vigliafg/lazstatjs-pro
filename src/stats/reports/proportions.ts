import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show, showCI } from './shared';
import type { OneProportionResult, TwoProportionsResult } from '../kernels/proportions';
import type { PoissonRateResult, TwoPoissonResult } from '../kernels/poissonTests';

export type ProportionReportInput =
  | {
      mode: 'oneProp';
      result: OneProportionResult;
      variableName: string;
      successLevel: string;
      level: number;
    }
  | {
      mode: 'twoProp';
      result: TwoProportionsResult;
      variableName: string;
      groupName: string;
      level: number;
    }
  | {
      mode: 'oneRate';
      result: PoissonRateResult;
      variableName: string;
      level: number;
    }
  | {
      mode: 'twoRate';
      result: TwoPoissonResult;
      variableName: string;
      groupName: string;
      level: number;
    };

const reading = (bullets: string[]): { heading: string; bullets: string[] } => ({
  heading: copy('Come leggere i numeri'),
  bullets,
});

export const proportionsReport = (input: ProportionReportInput): ReportSpec => {
  const level = input.level;

  if (input.mode === 'oneProp') {
    const { result } = input;
    return {
      id: 'report-proportions-one',
      title: copy('Report di lettura — Proporzione'),
      headline: copy('Proporzione di “{s1}” in {s2}: {s3} ({s4}).', {
        s1: input.successLevel,
        s2: input.variableName,
        s3: show(result.estimate, 3),
        s4: showCI(result.interval.wilsonLo, result.interval.wilsonHi, 3),
      }),
      badge: copy('Confronto'),
      tone: isDecided(result.exactP, level) ? 'caution' : 'neutral',
      intro: [
        copy('Il test confronta la proporzione osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.'),
        copy('Con pochi successi o insuccessi l’approssimazione normale non è affidabile: leggi il p esatto e l’intervallo di Clopper–Pearson.'),
      ],
      sections: [
        {
          heading: copy('Risultato'),
          bullets: [
            copy('{s1} successi su {s2} osservazioni: proporzione {s3}.', {
              s1: result.successes,
              s2: result.trials,
              s3: show(result.estimate, 4),
            }),
            copy('Valore nullo {s1}: p esatto {s2}, p asintotico {s3}.', {
              s1: show(result.nullValue, 3),
              s2: describeP(result.exactP),
              s3: describeP(result.asymptoticP),
            }),
            copy('Intervallo di Wilson: {s1}; intervallo esatto: {s2}.', {
              s1: showCI(result.interval.wilsonLo, result.interval.wilsonHi, 4),
              s2: showCI(result.interval.clopperLo, result.interval.clopperHi, 4),
            }),
          ],
        },
        reading([
          copy('Il p esatto somma le probabilità di tutti gli esiti almeno così improbabili quanto quello osservato: è la definizione di binom.test.'),
          copy('L’intervallo di Wilson è più stretto e stabile del Wald; quello di Clopper–Pearson garantisce la copertura nominale anche con pochi casi.'),
        ]),
      ],
      limitations: [
        copy('Le osservazioni devono essere indipendenti: con misure ripetute o cluster la variabilità è sottostimata.'),
        copy('Un p grande non dimostra che la proporzione sia uguale al valore nullo: guarda l’intervallo.'),
      ],
    };
  }

  if (input.mode === 'twoProp') {
    const { result } = input;
    return {
      id: 'report-proportions-two',
      title: copy('Report di lettura — Due proporzioni'),
      headline: copy('Differenza tra {s1} e {s2}: {s3} ({s4}).', {
        s1: input.groupName,
        s2: input.variableName,
        s3: show(result.difference, 3),
        s4: showCI(result.lo, result.hi, 3),
      }),
      badge: copy('Confronto'),
      tone: isDecided(result.pValue, level) ? 'caution' : 'positive',
      intro: [
        copy('Il test confronta due proporzioni indipendenti; la differenza è riportata nella scala originale (rischio assoluto).'),
        copy('Rischio relativo e odds ratio descrivono l’associazione, ma non sostituiscono la differenza assoluta: un RR grande può nascondere un effetto piccolo.'),
      ],
      sections: [
        {
          heading: copy('Risultato'),
          bullets: [
            copy('Primo gruppo: {s1} su {s2} ({s3}); secondo gruppo: {s4} su {s5} ({s6}).', {
              s1: result.first.successes,
              s2: result.first.trials,
              s3: show(result.first.estimate, 3),
              s4: result.second.successes,
              s5: result.second.trials,
              s6: show(result.second.estimate, 3),
            }),
            copy('Differenza {s1} (CI {s2}); χ² = {s3}, p = {s4}.', {
              s1: show(result.difference, 4),
              s2: showCI(result.lo, result.hi, 4),
              s3: show(result.chi2, 3),
              s4: describeP(result.pValue),
            }),
            copy('Rischio relativo {s1}; odds ratio {s2}.', {
              s1: show(result.riskRatio, 3),
              s2: show(result.oddsRatio, 3),
            }),
          ],
        },
        reading([
          copy('Il test z pooled è equivalente al χ² di Pearson senza correzione di continuità; con tavole 2×2 e celle piccole preferisci il test esatto di Fisher.'),
          copy('L’intervallo è di Wald: con proporzioni vicine a 0 o 1 e gruppi piccoli tende a sottocoprire.'),
        ]),
      ],
      limitations: [
        copy('I due gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.'),
        copy('La differenza assoluta dipende dalla scala: riportala insieme agli indici relativi, non al posto loro.'),
      ],
    };
  }

  if (input.mode === 'oneRate') {
    const { result } = input;
    return {
      id: 'report-rates-one',
      title: copy('Report di lettura — Tasso di Poisson'),
      headline: copy('Tasso di {s1}: {s2} per unità di esposizione ({s3}).', {
        s1: input.variableName,
        s2: show(result.rate, 3),
        s3: showCI(result.lo, result.hi, 3),
      }),
      badge: copy('Confronto'),
      tone: isDecided(result.exactP, level) ? 'caution' : 'neutral',
      intro: [
        copy('Un tasso di Poisson conta eventi per unità di esposizione: tempo, persone, lotti o righe.'),
        copy('L’esposizione va dichiarata: lo stesso numero di eventi su esposizioni diverse produce tassi diversi.'),
      ],
      sections: [
        {
          heading: copy('Risultato'),
          bullets: [
            copy('{s1} eventi su esposizione {s2}: tasso {s3}.', {
              s1: result.events,
              s2: show(result.exposure, 3),
              s3: show(result.rate, 4),
            }),
            copy('Tasso nullo {s1}: p esatto {s2}.', {
              s1: show(result.nullRate, 3),
              s2: describeP(result.exactP),
            }),
            copy('Intervallo esatto: {s1}.', { s1: showCI(result.lo, result.hi, 4) }),
          ],
        },
        reading([
          copy('Il p esatto somma le probabilità di Poisson degli esiti almeno così improbabili quanto quello osservato.'),
          copy('L’intervallo usa la relazione con la χ² (Garwood): è lo stesso di poisson.test.'),
        ]),
      ],
      limitations: [
        copy('Gli eventi devono essere indipendenti e rari rispetto all’esposizione; con eventi molto frequenti la varianza supera la media.'),
        copy('Sovradispersione e cluster violano l’assunzione di Poisson e rendono il p troppo piccolo.'),
      ],
    };
  }

  const { result } = input;
  return {
    id: 'report-rates-two',
    title: copy('Report di lettura — Due tassi di Poisson'),
    headline: copy('Rapporto tra i tassi di {s1}: {s2} ({s3}).', {
      s1: input.variableName,
      s2: show(result.ratio, 3),
      s3: showCI(result.lo, result.hi, 3),
    }),
    badge: copy('Confronto'),
    tone: isDecided(result.exactP, level) ? 'caution' : 'positive',
    intro: [
      copy('Il confronto tra due tassi condiziona sul numero totale di eventi: sotto l’ipotesi nulla i conteggi si distribuiscono come un binomiale.'),
      copy('Il rapporto tra tassi è la misura naturale dell’effetto; 1 significa tassi uguali.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Primo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.', {
            s1: result.first.events,
            s2: show(result.first.exposure, 3),
            s3: show(result.first.rate, 4),
          }),
          copy('Secondo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.', {
            s1: result.second.events,
            s2: show(result.second.exposure, 3),
            s3: show(result.second.rate, 4),
          }),
          copy('Rapporto {s1} (CI {s2}); p esatto {s3}.', {
            s1: show(result.ratio, 4),
            s2: showCI(result.lo, result.hi, 4),
            s3: describeP(result.exactP),
          }),
        ],
      },
      reading([
        copy('Il test condizionale esatto è lo stesso di poisson.test applicato a due gruppi.'),
        copy('L’intervallo trasforma l’intervallo esatto di Clopper–Pearson della proporzione condizionata.'),
      ]),
    ],
    limitations: [
      copy('I due gruppi devono essere indipendenti e i conteggi non devono essere correlati nel tempo.'),
      copy('Un rapporto di 1 non prova l’assenza di differenza: guarda l’intervallo.'),
    ],
  };
};
