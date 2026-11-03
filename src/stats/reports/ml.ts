import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { MlResult } from '../w9Results';
import type { ReportSpec } from '../report';

const labelOf = (mode: MlResult['mode']): string =>
  mode === 'rf'
    ? copy('random forest')
    : mode === 'boosting'
      ? copy('gradient boosting')
      : copy('rete neurale a uno strato nascosto');

export const mlReport = (
  result: MlResult,
  variableNames: readonly string[],
  outcomeName: string
): ReportSpec => {
  const top = result.importance[0];
  const overfit = result.oobR2 !== null && Number.isFinite(result.oobR2)
    ? result.r2 - result.oobR2
    : null;
  return {
    id: 'ml',
    title: copy('Report di lettura — Machine learning'),
    headline: copy('{s1} per {s2}: R² {s3}, RMSE {s4}.', {
      s1: labelOf(result.mode),
      s2: outcomeName,
      s3: fmtEst(result.r2, 3),
      s4: fmtEst(result.rmse, 3),
    }),
    badge: copy('R² {s1}', { s1: fmtEst(result.r2, 2) }),
    tone: Number.isFinite(result.r2) && result.r2 >= 0.5 ? 'positive' : 'neutral',
    intro: [
      copy('Il modello impara una relazione non lineare tra i predittori e l’esito, senza imporre una forma parametrica.'),
      copy('Le misure sui dati di addestramento sono ottimistiche: servono il test out-of-bag o una validazione esterna per stimare la generalizzazione.'),
    ],
    sections: [
      {
        heading: copy('Prestazioni'),
        bullets: [
          copy('R²: {s1}; RMSE: {s2}; MAE: {s3}.', {
            s1: fmtEst(result.r2, 3),
            s2: fmtEst(result.rmse, 3),
            s3: fmtEst(result.mae, 3),
          }),
          result.oobR2 !== null && Number.isFinite(result.oobR2)
            ? copy('R² out-of-bag: {s1}; RMSE out-of-bag: {s2}.', {
                s1: fmtEst(result.oobR2, 3),
                s2: fmtEst(result.oobRmse ?? NaN, 3),
              })
            : copy('Il modello non produce una stima out-of-bag.'),
          overfit !== null
            ? overfit > 0.1
              ? copy('Il divario di {s1} punti tra R² interno ed esterno suggerisce sovradattamento.', {
                  s1: fmtEst(100 * overfit, 1),
                })
              : copy('Il divario tra R² interno ed esterno è {s1} punti: contenuto.', {
                  s1: fmtEst(100 * overfit, 1),
                })
            : copy('Nessun confronto interno/esterno disponibile.'),
        ],
      },
      {
        heading: copy('Variabili'),
        bullets: top
          ? result.importance.slice(0, 3).map(item =>
              copy('{s1}: {s2}% dell’importanza.', {
                s1: variableNames[item.variable] ?? `X${item.variable + 1}`,
                s2: fmtEst(item.pct, 1),
              })
            )
          : [copy('La rete neurale non produce un’importanza delle variabili.')],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('L’importanza per impurità favorisce variabili con molti valori distinti e non prova una relazione causale.'),
          copy('Senza validazione incrociata o un insieme di test separato le prestazioni restano una stima ottimistica.'),
          copy('I risultati dipendono dal seme e dagli iperparametri: confronta più configurazioni prima di scegliere.'),
        ],
      },
    ],
    limitations: [
      copy('Il modello è predittivo: non sostituisce un disegno causale né una verifica delle assunzioni.'),
    ],
  };
};
