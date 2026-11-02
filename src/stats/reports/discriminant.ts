import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { DiscriminantResult } from '../analysisResults';

/** Reading report for discriminant analysis and the paired MANOVA. */
export const discriminantReport = (
  result: DiscriminantResult,
  variableNames: string[],
  groupName: string
): ReportSpec => {
  const overall = result.wilks[0];
  const significant = overall ? overall.p < 0.05 : false;
  const top = result.univariate
    .map((entry, index) => ({ ...entry, name: variableNames[index] ?? `V${index + 1}` }))
    .sort((a, b) => (a.p || 1) - (b.p || 1))[0];
  const accuracy = result.accuracy * 100;
  const baseline = 100 / Math.max(1, result.groups.length);

  return {
    id: 'discriminant',
    title: copy('Report di lettura — Discriminante / MANOVA'),
    headline: significant
      ? copy('I gruppi di {s1} si separano sulle variabili considerate (Wilks p = {s2}).', {
          s1: groupName,
          s2: fmtP(overall?.p ?? NaN),
        })
      : copy('I gruppi di {s1} non si separano in modo chiaro sulle variabili considerate.', {
          s1: groupName,
        }),
    badge: copy('Accuratezza {s1}%', { s1: fmtEst(accuracy, 1) }),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('La MANOVA chiede se i vettori delle medie dei gruppi differiscono su tutte le variabili insieme; l’analisi discriminante descrive poi come i gruppi si separano e quanto bene si classificano.'),
      copy('La classificazione è calcolata sugli stessi dati che hanno stimato il modello: è una misura ottimistica, non una previsione fuori campione.'),
    ],
    sections: [
      {
        heading: copy('Separazione tra gruppi'),
        bullets: [
          copy('Lambda di Wilks = {s1}, chi-quadro = {s2}, df = {s3}, p = {s4}.', {
            s1: fmtEst(overall?.lambda ?? NaN, 3),
            s2: fmtEst(overall?.chi2 ?? NaN, 2),
            s3: overall?.df ?? 0,
            s4: fmtP(overall?.p ?? NaN),
          }),
          copy('Pillai = {s1}: quota della variabilità tra gruppi non spiegata dalle differenze individuali.', {
            s1: fmtEst(result.pillai, 3),
          }),
          top
            ? copy('La variabile più discriminante è {s1} (F = {s2}, p = {s3}).', {
                s1: top.name,
                s2: fmtEst(top.f, 2),
                s3: fmtP(top.p),
              })
            : copy('Nessuna variabile discrimina in modo netto.'),
        ],
      },
      {
        heading: copy('Classificazione'),
        body: [
          copy('L’accuratezza è {s1}% contro un {s2}% atteso assegnando i casi a caso. Un vantaggio piccolo rispetto a questa soglia indica che le variabili separano poco.', {
            s1: fmtEst(accuracy, 1),
            s2: fmtEst(baseline, 1),
          }),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La funzione discriminante assume covarianze simili nei gruppi e variabili continue; con gruppi molto sbilanciati l’accuratezza può essere dominata dal gruppo più numeroso.'),
          copy('La MANOVA richiede osservazioni indipendenti e una matrice di covarianza non singolare: con più variabili che casi il risultato non è affidabile.'),
        ],
      },
    ],
    limitations: [
      copy('Ripetere la classificazione su un campione separato è il modo corretto di stimare quanto il modello generalizza.'),
    ],
  };
};
