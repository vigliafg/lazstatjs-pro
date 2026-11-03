import { copy, sourceOf } from '../reportCopy';
import type { ReportSpec } from './shared';
import { num, rowsOf, show } from './shared';
import type { TableSpec } from '../types';

/**
 * Report discorsivo della regressione PLS1.
 *
 * Come gli altri report della wave, legge soltanto le righe delle tabelle già
 * mostrate all'utente: non importa il kernel e non ricalcola i numeri.
 */
export const plsReport = (tables: TableSpec[]): ReportSpec => {
  const coefficientRows = rowsOf(tables, 'pls-coefficients');
  const componentRows = rowsOf(tables, 'pls-components');
  const vipRows = rowsOf(tables, 'pls-vip');

  const predictors = coefficientRows.filter(
    row => sourceOf(String(row.predictor ?? '')) !== '(Intercept)'
  );
  const lastComponent = componentRows[componentRows.length - 1];
  const cumulativeR2 = num(lastComponent, 'cumulativeR2');
  const componentCount = componentRows.length;
  const rankedVip = [...vipRows].sort((left, right) => num(right, 'vip') - num(left, 'vip'));
  const topVip = rankedVip[0];
  const strongVip = vipRows.filter(row => num(row, 'vip') > 1);

  return {
    id: 'report-pls',
    title: copy('Report di lettura — Regressione PLS'),
    headline:
      componentCount === 0
        ? copy('Non ci sono componenti latenti da interpretare.')
        : !Number.isFinite(cumulativeR2)
          ? copy('Il modello non produce un R² leggibile: controlla i dati e il numero di componenti.')
          : cumulativeR2 >= 0.7
            ? copy('Il modello PLS spiega il {s1}% della varianza di Y con {s2} componenti.', {
                s1: show(cumulativeR2 * 100, 1),
                s2: componentCount,
              })
            : cumulativeR2 >= 0.4
              ? copy('Il modello PLS spiega il {s1}% della varianza di Y: il segnale c’è, ma resta molto non spiegato.', {
                  s1: show(cumulativeR2 * 100, 1),
                })
              : copy('Il modello PLS spiega solo il {s1}% della varianza di Y: le componenti estratte non riassumono bene la risposta.', {
                  s1: show(cumulativeR2 * 100, 1),
                }),
    badge:
      componentCount === 0
        ? copy('Nessuna componente')
        : cumulativeR2 >= 0.7
          ? copy('Modello informativo')
          : cumulativeR2 >= 0.4
            ? copy('Segnale moderato')
            : copy('Modello debole'),
    tone:
      componentCount === 0
        ? 'caution'
        : cumulativeR2 >= 0.7
          ? 'positive'
          : cumulativeR2 >= 0.4
            ? 'neutral'
            : 'caution',
    intro: [
      copy('La regressione PLS costruisce componenti latenti che riassumono insieme la variabilità dei predittori e la loro relazione con Y, utile quando i predittori sono molti e correlati tra loro.'),
      copy('A differenza della regressione lineare, le componenti sono estratte in ordine di capacità predittiva: le prime bastano spesso a descrivere il segnale, le ultime possono solo aggiungere rumore.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('Il modello usa {s1} predittori e {s2} componenti; il R² cumulato finale vale {s3}.', {
            s1: predictors.length,
            s2: componentCount,
            s3: show(cumulativeR2, 4),
          }),
          ...(topVip
            ? [
                copy('Il predittore con VIP più alto è {s1} (VIP = {s2}).', {
                  s1: String(topVip.predictor),
                  s2: show(num(topVip, 'vip'), 3),
                }),
              ]
            : []),
          ...(strongVip.length > 0
            ? [
                copy('{s1} predittori hanno VIP sopra 1: {s2}.', {
                  s1: strongVip.length,
                  s2: strongVip.map(row => String(row.predictor)).join(', '),
                }),
              ]
            : [copy('Nessun predittore supera un VIP di 1: il contributo è distribuito o il modello ha poca struttura.')]),
        ],
      },
      {
        heading: copy('Come scegliere il numero di componenti'),
        bullets: [
          copy('Guarda il R² cumulato e il Q²: aggiungere una componente conviene finché il Q² non peggiora.'),
          copy('Una componente che aumenta il R² ma abbassa il Q² sta adattando il rumore del campione.'),
          copy('Con pochi casi e molti predittori il PLS resta stabile, ma la scelta delle componenti va validata su dati nuovi.'),
        ],
      },
      {
        heading: copy('Come leggere coefficienti e VIP'),
        body: [
          copy('I coefficienti sono sulla scala originale: descrivono l’effetto complessivo di un predittore su Y attraverso tutte le componenti, non l’effetto di una singola componente.'),
          copy('Il VIP misura la partecipazione di un predittore alle componenti che spiegano Y: è utile per ordinare le variabili, non è un test di significatività.'),
          copy('Un coefficiente piccolo con VIP alto indica una variabile importante per costruire le componenti ma con effetto netto contenuto.'),
        ],
      },
      {
        heading: copy('Assunzioni e cautele'),
        bullets: [
          copy('Le osservazioni devono essere indipendenti tra loro (una riga = una unità).'),
          copy('PLS assume relazioni lineari tra predittori e risposta: curve e interazioni vanno aggiunte come termini espliciti.'),
          copy('Il modello è centrato ma non standardizzato: l’unità di misura dei predittori conta per l’interpretazione dei coefficienti, non per l’estrazione delle componenti.'),
          copy('La validazione incrociata qui è deterministica per riga; con campioni piccoli il Q² può essere instabile.'),
        ],
      },
    ],
    limitations: [
      copy('Non sono inclusi intervalli di confidenza, test di significatività o selezione automatica delle variabili.'),
      copy('PLS1 gestisce una sola variabile dipendente: più risposte richiedono PLS2, non coperto da questa procedura.'),
      copy('Il numero di componenti è scelto dall’utente: la procedura non lo ottimizza né confronta automaticamente tutti i modelli.'),
    ],
  };
};
