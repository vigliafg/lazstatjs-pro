import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { IrtResult } from '../irt/types';
import type { ReportSpec } from '../report';

export const irtReport = (result: IrtResult): ReportSpec => {
  const hardest = [...result.items].sort((a, b) => b.difficulty - a.difficulty)[0];
  const easiest = [...result.items].sort((a, b) => a.difficulty - b.difficulty)[0];
  const quality =
    result.reliability >= 0.8
      ? copy('buona')
      : result.reliability >= 0.6
        ? copy('moderata')
        : copy('bassa');
  return {
    id: 'irt',
    title: copy('Report di lettura — Teoria della risposta all’item'),
    headline: copy('Affidabilità {s1} ({s2}); il test ha {s3} item.', {
      s1: fmtEst(result.reliability, 3),
      s2: quality,
      s3: result.items.length,
    }),
    badge: result.model === '2pl' ? '2PL' : 'Rasch',
    tone: result.reliability >= 0.7 ? 'neutral' : 'caution',
    intro: [
      copy('Il modello di risposta all’item descrive la probabilità di rispondere correttamente in funzione dell’abilità latente della persona e delle caratteristiche dell’item.'),
      copy('La difficoltà b è il livello di abilità in cui la probabilità di risposta corretta è il 50%; la discriminazione a dice quanto rapidamente la curva sale.'),
    ],
    sections: [
      {
        heading: copy('Gli item'),
        bullets: [
          easiest
            ? copy('Item più facile: {s1} (b = {s2}).', {
                s1: easiest.variable,
                s2: fmtEst(easiest.difficulty, 2),
              })
            : copy('Nessun item disponibile.'),
          hardest
            ? copy('Item più difficile: {s1} (b = {s2}).', {
                s1: hardest.variable,
                s2: fmtEst(hardest.difficulty, 2),
              })
            : copy('Nessun item disponibile.'),
        ],
      },
      {
        heading: copy('Come leggere i punteggi'),
        body: [
          copy('L’abilità θ è standardizzata sulla popolazione di riferimento: valori positivi indicano abilità sopra la media.'),
          copy('L’errore standard è più piccolo per punteggi vicini al centro della scala e più grande agli estremi.'),
        ],
      },
      {
        heading: copy('Limiti'),
        body: [
          copy('Il modello assume un unico tratto latente e indipendenza locale tra gli item.'),
          copy('Con pochi item o campioni piccoli le stime sono instabili.'),
        ],
      },
    ],
    limitations: [
      copy('La curva caratteristica descrive la probabilità di risposta corretta, non la qualità dell’item in assoluto.'),
    ],
  };
};
