import type { HelpTopic } from './types';

/** Procedure dell'ondata 4: modelli log-lineari per tabelle a due vie. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Modello log-lineare per tabelle a due vie',
    summary: 'Modello di Poisson per i conteggi di una tabella a due vie: indipendenza o interazione satura.',
    tutorial: {
      goal: 'Decidere se le categorie di riga e di colonna di una tabella a due vie sono associate e quantificare l’associazione.',
      steps: [
        'Scegli le etichette di riga e colonna e inserisci i conteggi osservati cella per cella.',
        'Parti dal modello di indipendenza: stima solo gli effetti principali di riga e colonna.',
        'Esegui e leggi G², i suoi gradi di libertà e il p-value.',
        'Se il modello di indipendenza non si adatta, passa al modello saturo per vedere quanto le celle si allontanano dall’indipendenza.',
        'Leggi i coefficienti sulla scala log e exp(β) come fattori moltiplicativi.',
        'Per una tabella 2×2 leggi l’esponenziale dell’interazione come odds ratio con il suo intervallo di confidenza.',
      ],
      expected:
        'Una tabella di adattamento con G², df, p, devianza nulla e AIC; una tabella dei coefficienti con β, SE, z, p, exp(β) e CI; attese e residui standardizzati; una heatmap dei residui e barre osservato/atteso.',
    },
    advanced: {
      assumptions: [
        'I conteggi sono osservazioni indipendenti, una per cella, e ogni unità cade in una sola cella.',
        'L’attesa di ogni cella è positiva; la varianza di Poisson coincide con la media.',
        'Il logaritmo dell’attesa è una funzione lineare degli effetti di riga e colonna, e della loro interazione nel modello saturo.',
        'Con attese piccole l’approssimazione χ² di G² è fragile.',
      ],
      whenToUse: [
        'Due variabili categoriche incrociate, quando serve un test di indipendenza basato su un modello.',
        'Quando servono attese, residui e una lettura dell’associazione a livello di coefficienti.',
        'Per confrontare il modello di indipendenza con quello saturo in una tabella 2×2 e ottenere l’odds ratio.',
      ],
      whenNotToUse: [
        'Tre o più fattori categorici: servono interazioni di ordine superiore e questa pagina copre solo le tabelle a due vie.',
        'Tabelle molto rade con molte celle nulle: i metodi esatti o penalizzati sono più sicuri.',
      ],
      reading: [
        'G² è la statistica del rapporto di verosimiglianza: valori grandi rispetto ai gradi di libertà indicano che le attese del modello sono lontane dai conteggi osservati.',
        'In una tabella a due vie il modello di indipendenza ha (R−1)(C−1) gradi di libertà residui; il modello saturo non ne ha e riproduce esattamente i dati.',
        'I coefficienti sono sulla scala log: exp(β) è il fattore di cui cambia l’attesa quando cambia la categoria, a parità dell’altro fattore.',
        'Per una tabella 2×2 il coefficiente di interazione è il log odds ratio; exp(β) = 1 significa indipendenza.',
      ],
      pitfalls: [
        'Leggere il p di un coefficiente come test dell’intero modello: parti da G² e dai gradi di libertà residui.',
        'Interpretare l’associazione come causalità: l’ordine riga/colonna è arbitrario e il modello non dice quale variabile influenzi l’altra.',
        'Ignorare le attese piccole: il p di G² può essere anti-conservativo.',
        'Usare il modello saturo come prova: si adatta sempre e non ha un test.',
      ],
      charts: [
        'Heatmap dei residui standardizzati, con le celle lontane da zero in evidenza.',
        'Barre osservato/atteso per cella, per vedere dove il modello sbaglia.',
      ],
      glossary: [
        { term: 'G²', definition: 'Statistica del rapporto di verosimiglianza tra conteggi osservati e attese del modello.' },
        { term: 'Modello saturo', definition: 'Modello con un parametro per cella; riproduce i dati e ha zero gradi di libertà residui.' },
        { term: 'Odds ratio', definition: 'Rapporto tra gli odds di un gruppo e quelli dell’altro; exp(interazione) in un modello log-lineare 2×2.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
