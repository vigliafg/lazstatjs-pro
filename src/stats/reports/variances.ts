import { copy } from '../reportCopy';
import type { ReportSpec } from './shared';
import { describeP, isDecided, show, showCI } from './shared';
import type { OneVarianceResult, TwoVarianceResult } from '../kernels/variances';

export type VarianceReportInput =
  | { mode: 'one'; result: OneVarianceResult; variableName: string; level: number }
  | {
      mode: 'two';
      result: TwoVarianceResult;
      variableName: string;
      groupName: string;
      level: number;
    };

export const variancesReport = (input: VarianceReportInput): ReportSpec => {
  const level = input.level;
  if (input.mode === 'one') {
    const { result } = input;
    return {
      id: 'report-variance-one',
      title: copy('Report di lettura — Varianza'),
      headline: copy('Varianza di {s1}: {s2} ({s3}).', {
        s1: input.variableName,
        s2: show(result.variance, 4),
        s3: showCI(result.lo, result.hi, 4),
      }),
      badge: copy('Confronto'),
      tone: isDecided(result.p, level) ? 'caution' : 'neutral',
      intro: [
        copy('Il test confronta la varianza osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.'),
        copy('La varianza è nella scala al quadrato: per leggere l’intervallo nella scala dei dati usa la deviazione standard.'),
      ],
      sections: [
        {
          heading: copy('Risultato'),
          bullets: [
            copy('{s1} osservazioni: varianza {s2}, deviazione standard {s3}.', {
              s1: result.n,
              s2: show(result.variance, 4),
              s3: show(result.sd, 4),
            }),
            copy('Varianza nulla {s1}: χ² = {s2}, df = {s3}, p = {s4}.', {
              s1: show(result.nullVariance, 4),
              s2: show(result.chi2, 3),
              s3: result.df,
              s4: describeP(result.p),
            }),
            copy('Intervallo della varianza: {s1}.', { s1: showCI(result.lo, result.hi, 4) }),
          ],
        },
        {
          heading: copy('Come leggere i numeri'),
          bullets: [
            copy('Il test χ² sulla varianza assume una popolazione normale: con distribuzioni asimmetriche il p non è affidabile.'),
            copy('L’intervallo è asimmetrico: la varianza stimata non sta al centro, perché la distribuzione di s² è asimmetrica.'),
            copy('Con pochi casi l’intervallo è molto largo: servono più osservazioni per stimare una varianza con precisione.'),
          ],
        },
      ],
      limitations: [
        copy('Le osservazioni devono essere indipendenti e normali.'),
        copy('La varianza è sensibile agli outlier: un solo valore estremo può dominarla.'),
      ],
    };
  }

  const { result } = input;
  const pair = result.groups.slice(0, 2);
  return {
    id: 'report-variance-two',
    title: copy('Report di lettura — Uguaglianza delle varianze'),
    headline: copy('Confronto delle varianze di {s1} tra i gruppi di {s2}.', {
      s1: input.variableName,
      s2: input.groupName,
    }),
    badge: copy('Confronto'),
    tone: isDecided(result.levene.p, level) ? 'caution' : 'positive',
    intro: [
      copy('F, Bartlett e Levene rispondono alla stessa domanda con assunzioni diverse: le varianze dei gruppi sono uguali?'),
      copy('Levene sulle mediane è la scelta più robusta quando i gruppi sono piccoli o la distribuzione non è normale.'),
    ],
    sections: [
      {
        heading: copy('Risultato'),
        bullets: [
          copy('Varianze: {s1} e {s2}; rapporto {s3} (CI {s4}).', {
            s1: show(pair[0]?.variance ?? Number.NaN, 4),
            s2: show(pair[1]?.variance ?? Number.NaN, 4),
            s3: show(result.ratio, 3),
            s4: showCI(result.fLo, result.fHi, 3),
          }),
          copy('F: p = {s1}; Bartlett: χ² = {s2}, p = {s3}; Levene: F = {s4}, p = {s5}.', {
            s1: describeP(result.fP),
            s2: show(result.bartlett.statistic, 3),
            s3: describeP(result.bartlett.p),
            s4: show(result.levene.statistic, 3),
            s5: describeP(result.levene.p),
          }),
        ],
      },
      {
        heading: copy('Come leggere i numeri'),
        bullets: [
          copy('Il test F è definito per due gruppi; con più gruppi usa Bartlett o Levene.'),
          copy('Bartlett è potente sotto normalità ma falsato da outlier e code pesanti.'),
          copy('Levene sulle mediane riduce l’effetto degli estremi ed è il default più sicuro.'),
        ],
      },
    ],
    limitations: [
      copy('I gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.'),
      copy('Nessuno dei tre test sostituisce l’ispezione grafica della dispersione: guarda le scatole.'),
    ],
  };
};
