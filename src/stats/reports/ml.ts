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
  outcomeName: string,
  classNames: readonly string[] = []
): ReportSpec => {
  if (result.task === 'classification') {
    const labels = result.classes.length > 0 ? result.classes : classNames;
    const weakest = result.confusion
      .map((row, index) => ({
        label: labels[index] ?? `C${index + 1}`,
        recall: row.reduce((sum, value) => sum + value, 0) > 0
          ? row[index] / row.reduce((sum, value) => sum + value, 0)
          : NaN,
      }))
      .sort((a, b) => a.recall - b.recall)[0];
    const top = result.importance[0];
    return {
      id: 'ml',
      title: copy('Report di lettura — Machine learning'),
      headline: copy('{s1} per {s2}: accuratezza {s3}% su {s4} classi.', {
        s1: labelOf(result.mode),
        s2: outcomeName,
        s3: fmtEst(100 * result.accuracy, 1),
        s4: labels.length,
      }),
      badge: copy('Accuratezza {s1}%', { s1: fmtEst(100 * result.accuracy, 1) }),
      tone: result.accuracy >= 0.7 ? 'positive' : 'neutral',
      intro: [
        copy('Il modello impara a separare le classi dell’esito a partire dai predittori.'),
        copy('L’accuratezza da sola può ingannare con classi sbilanciate: guarda anche accuratezza bilanciata, sensibilità per classe e matrice di confusione.'),
      ],
      sections: [
        {
          heading: copy('Prestazioni'),
          bullets: [
            copy('Accuratezza: {s1}%; accuratezza bilanciata: {s2}%; log-loss: {s3}.', {
              s1: fmtEst(100 * result.accuracy, 1),
              s2: fmtEst(100 * result.balancedAccuracy, 1),
              s3: fmtEst(result.logLoss, 3),
            }),
            copy('Classi: {s1}; osservazioni: {s2}; predittori: {s3}.', {
              s1: labels.join(', '),
              s2: result.n,
              s3: result.p,
            }),
            weakest && Number.isFinite(weakest.recall)
              ? copy('La classe con sensibilità più bassa è {s1} ({s2}%).', {
                  s1: weakest.label,
                  s2: fmtEst(100 * weakest.recall, 1),
                })
              : copy('Nessuna classe con supporto sufficiente per la sensibilità.'),
          ],
        },
        {
          heading: copy('Variabili'),
          bullets: top
            ? result.importance.slice(0, 3).map(item =>
                copy('{s1}: {s2}% dell’importanza media.', {
                  s1: variableNames[item.variable] ?? `X${item.variable + 1}`,
                  s2: fmtEst(item.pct, 1),
                })
              )
            : [copy('La rete neurale non produce un’importanza delle variabili.')],
        },
        {
          heading: copy('Limiti'),
          body: [
            copy('La matrice di confusione descrive gli errori sui dati usati per l’addestramento: serve una validazione esterna per la generalizzazione.'),
            copy('L’importanza per impurità non prova una relazione causale e favorisce variabili con molti valori distinti.'),
            copy('Con classi rare l’accuratezza può essere alta anche se il modello non riconosce la classe rara.'),
          ],
        },
      ],
      limitations: [
        copy('Il modello è predittivo: non sostituisce un disegno causale né una verifica delle assunzioni.'),
      ],
    };
  }
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
