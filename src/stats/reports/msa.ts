import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { MsaResult } from '../analysisResults';

export const msaReport = (result: MsaResult, variableName: string): ReportSpec => {
  const acceptable = result.pctStudyVariation < 10;
  const marginal = result.pctStudyVariation < 30;
  return {
    id: 'quality-msa',
    title: copy('Report di lettura — Gage R&R'),
    headline: acceptable
      ? copy('Il sistema di misura è accettabile: Gage R&R = {s1}%.', {
          s1: fmtEst(result.pctStudyVariation, 1),
        })
      : marginal
        ? copy('Il sistema di misura è marginale: Gage R&R = {s1}%.', {
            s1: fmtEst(result.pctStudyVariation, 1),
          })
        : copy('Il sistema di misura non è accettabile: Gage R&R = {s1}%.', {
            s1: fmtEst(result.pctStudyVariation, 1),
          }),
    badge: copy('%GRR {s1}', { s1: fmtEst(result.pctStudyVariation, 1) }),
    tone: acceptable ? 'positive' : marginal ? 'caution' : 'neutral',
    intro: [
      copy('Il Gage R&R separa la variabilità dovuta allo strumento e agli operatori da quella reale tra i pezzi.'),
      copy('La ripetibilità è la variabilità dello stesso operatore sullo stesso pezzo; la riproducibilità è la differenza tra operatori.'),
    ],
    sections: [
      {
        heading: copy('Componenti'),
        bullets: [
          copy('Ripetibilità = {s1}, riproducibilità = {s2}.', {
            s1: fmtEst(result.sd.repeatability, 4),
            s2: fmtEst(result.sd.reproducibility, 4),
          }),
          copy('Gage R&R = {s1}% della variabilità totale dello studio.', {
            s1: fmtEst(result.pctStudyVariation, 1),
          }),
          copy('Il contributo alla varianza è {s1}%; il numero di categorie distinte è {s2}.', {
            s1: fmtEst(result.pctContribution, 1),
            s2: result.ndc,
          }),
        ],
      },
      {
        heading: copy('Diagnosi'),
        bullets: [
          copy('p dell’operatore = {s1}: un p piccolo indica differenze tra operatori.', {
            s1: fmtP(result.operatorP ?? NaN),
          }),
          copy('p dell’interazione = {s1}: un’interazione significativa significa che gli operatori misurano i pezzi in modo diverso.', {
            s1: fmtP(result.interactionP ?? NaN),
          }),
          copy('La variabile analizzata è {s1}.', { s1: variableName }),
        ],
      },
      {
        heading: copy('Soglie AIAG'),
        body: [
          copy('Sotto il 10% il sistema è accettabile; tra il 10% e il 30% è marginale e va migliorato se il processo è critico; sopra il 30% le decisioni sui pezzi sono a rischio.'),
          copy('Un numero di categorie distinte inferiore a 5 indica che il sistema non riesce a separare i pezzi in modo utile.'),
        ],
      },
    ],
    limitations: [
      copy('Lo studio richiede un disegno incrociato bilanciato: ogni parte deve essere misurata da ogni operatore con lo stesso numero di repliche.'),
      copy('Le soglie sono linee guida, non test di significatività: vanno lette insieme all’uso previsto della misura.'),
    ],
  };
};
