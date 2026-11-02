import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { ReportSpec } from '../report';
import type { DoeResult } from '../analysisResults';

/** Reading report for the quadratic response surface. */
export const doeReport = (
  result: DoeResult,
  responseName: string,
  factorAName: string,
  factorBName: string
): ReportSpec => {
  const best = result.terms
    .filter(term => term.name !== 'Intercetta')
    .sort((a, b) => (a.p || 1) - (b.p || 1))[0];
  const stationary = result.stationary;
  return {
    id: 'doe',
    title: copy('Report di lettura — Superficie di risposta'),
    headline: stationary
      ? copy('La superficie ha un {s1} in {s2} = {s3}, {s4} = {s5}.', {
          s1:
            stationary.kind === 'minimum'
              ? copy('minimo')
              : stationary.kind === 'maximum'
                ? copy('massimo')
                : copy('punto di sella'),
          s2: factorAName,
          s3: fmtEst(stationary.a, 3),
          s4: factorBName,
          s5: fmtEst(stationary.b, 3),
        })
      : copy('Il modello spiega {s1} della variabilità di {s2}.', {
          s1: `${(result.r2 * 100).toFixed(1)}%`,
          s2: responseName,
        }),
    badge: copy('R² = {s1}', { s1: fmtEst(result.r2, 3) }),
    tone: result.r2 >= 0.5 ? 'positive' : 'neutral',
    intro: [
      copy('La superficie di risposta descrive come la risposta cambia al variare di due fattori continui, includendo curvature e interazione.'),
      copy('Il grafico 3D è una proiezione: serve a vedere la forma della superficie, non a leggere con precisione i valori, che restano nelle tabelle.'),
    ],
    sections: [
      {
        heading: copy('Il modello'),
        bullets: [
          copy('R² = {s1}, R² corretto = {s2}, RMSE = {s3}.', {
            s1: fmtEst(result.r2, 3),
            s2: fmtEst(result.adjR2, 3),
            s3: fmtEst(result.rmse, 3),
          }),
          best
            ? copy('Il termine più significativo è {s1} (p = {s2}).', {
                s1: best.name.replace('A', factorAName).replace('B', factorBName),
                s2: fmtP(best.p),
              })
            : copy('Nessun termine raggiunge la significatività.'),
          copy('F = {s1}, p = {s2}.', { s1: fmtEst(result.f, 3), s2: fmtP(result.fP) }),
        ],
      },
      {
        heading: copy('Come leggere la superficie'),
        body: [
          copy('Le curve di livello collegano combinazioni di fattori con la stessa risposta prevista: curve vicine indicano che la risposta cambia rapidamente, curve chiuse indicano un massimo o un minimo.'),
          copy('Un punto di sella sale in una direzione e scende nell’altra: non è un ottimo e va interpretato con cautela.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('La superficie è valida solo nell’intervallo dei fattori osservati: fuori da quell’area il modello estrapola.'),
          copy('Un modello quadratico non sostituisce un disegno sperimentale: senza repliche e randomizzazione non separa l’effetto dei fattori dal rumore.'),
        ],
      },
    ],
    limitations: [
      copy('La significatività dei termini assume residui indipendenti e varianza costante; controlla i grafici dei residui prima di fidarti delle previsioni.'),
    ],
  };
};
