import type { HelpTopic } from './types';
import { procedureTopic } from './template';

export const w5Topics: HelpTopic[] = [
  procedureTopic({
    id: 'canonical',
    title: 'Correlazione canonica',
    summary: 'Trova le combinazioni lineari di due blocchi di variabili che correlano di più.',
    goal: 'Misurare come due gruppi di variabili numeriche sono legati e quali variabili guidano il legame.',
    steps: [
      'Metti le variabili predittive nel blocco X e quelle di esito nel blocco Y.',
      'Esegui l’analisi e leggi la prima correlazione canonica, il legame più forte tra i blocchi.',
      'Controlla lambda di Wilks, il test χ² e il p-value prima di interpretare le funzioni successive.',
      'Usa le correlazioni di struttura per capire quali variabili contribuiscono a ciascun punteggio.',
    ],
    expected:
      'Tabella delle funzioni con correlazioni, autovalori, lambda di Wilks e test; coefficienti standardizzati e correlazioni di struttura; scatter dei primi punteggi canonici.',
    whenToUse: [
      'Quando entrambi i lati della domanda sono insiemi di variabili continue.',
      'Per riassumere in poche funzioni il legame tra due blocchi.',
    ],
    assumptions: [
      'I due blocchi sono misurati sulle stesse righe e le righe sono indipendenti.',
      'Le relazioni sono approssimativamente lineari.',
      'Con molte variabili e poche righe i coefficienti diventano instabili.',
    ],
    whenNotToUse: [
      'Quando un lato è un singolo esito categorico: usa regressione o analisi discriminante.',
      'Quando l’obiettivo è la previsione e serve una validazione.',
    ],
    reading: [
      'La correlazione canonica è la correlazione tra i due punteggi; il quadrato è la varianza condivisa.',
      'Lambda di Wilks testa tutte le funzioni insieme.',
      'Il coefficiente è il peso nella combinazione, la correlazione di struttura è il legame semplice con il punteggio.',
    ],
    pitfalls: [
      'Leggere i coefficienti senza controllare la collinearità.',
      'Trattare una funzione significativa come prova di causalità.',
    ],
    charts: ['Scatter dei primi punteggi canonici.', 'Barre delle correlazioni di struttura.'],
    glossary: [
      { term: 'Punteggio canonico', definition: 'Combinazione lineare di un blocco costruita per correlare con un punteggio dell’altro blocco.' },
    ],
    seeAlso: ['multivariate', 'correlation'],
  }),
  procedureTopic({
    id: 'mds',
    title: 'Scaling multidimensionale',
    summary: 'Colloca le osservazioni su una mappa a poche dimensioni conservando le distanze.',
    goal: 'Vedere la struttura di somiglianza delle osservazioni senza assumere un modello di misura.',
    steps: [
      'Seleziona le variabili numeriche che definiscono la somiglianza.',
      'Scegli due o tre dimensioni e la scalatura classica o non metrica.',
      'Esegui l’analisi e leggi lo stress: più è basso, più la mappa è fedele.',
      'Cerca gruppi ed estremi sulla mappa e confrontali con la tabella delle coordinate.',
    ],
    expected:
      'Mappa delle osservazioni, stress, tabella delle coordinate, distanze a coppie e scree plot degli autovalori classici.',
    whenToUse: [
      'Per un quadro esplorativo delle somiglianze tra osservazioni.',
      'Per controllare se una matrice di distanze ha una struttura semplice.',
    ],
    assumptions: [
      'Le dissimilarità sono misurate su una scala confrontabile.',
      'La MDS classica assume distanze euclidee; quella non metrica usa solo l’ordine.',
      'La mappa è definita a meno di rotazioni e riflessioni.',
    ],
    whenNotToUse: [
      'Quando le distanze non hanno senso o sono dominate da una variabile con unità diversa.',
      'Quando serve un test di ipotesi: la MDS è descrittiva.',
    ],
    reading: [
      'Punti vicini sono simili; gli assi non hanno significato intrinseco.',
      'Lo stress è un indice di cattivo adattamento: sotto 0,1 è di solito buono.',
      'Gli autovalori classici mostrano il contributo di ogni dimensione.',
    ],
    pitfalls: [
      'Interpretare la direzione di un asse come una variabile reale.',
      'Confrontare lo stress tra insiemi con numeri di punti diversi.',
    ],
    charts: ['Scatter delle prime due dimensioni.', 'Scree plot degli autovalori classici.'],
    glossary: [
      { term: 'Stress', definition: 'Misura di quanto le distanze della mappa riproducono le dissimilarità originali.' },
    ],
    seeAlso: ['multivariate', 'cluster'],
  }),
  procedureTopic({
    id: 'correspondence',
    title: 'Analisi delle corrispondenze',
    summary: 'Mappa righe e colonne di una tabella a due vie in uno spazio comune.',
    goal: 'Descrivere quali modalità di riga e colonna si attraggono o si respingono rispetto all’indipendenza.',
    steps: [
      'Inserisci le etichette di righe e colonne e i conteggi della tabella.',
      'Esegui l’analisi e leggi l’inerzia dei primi assi.',
      'Guarda insieme la mappa e i residui standardizzati.',
      'Usa contributi e cos² per capire quali modalità costruiscono ogni asse.',
    ],
    expected:
      'Tabella dell’inerzia con χ² e gradi di libertà; coordinate, masse, contributi e cos²; heatmap dei residui.',
    whenToUse: [
      'Quando una tabella di contingenza è grande e una sola statistica nasconde la struttura.',
      'Per visualizzare quali modalità producono l’associazione.',
    ],
    assumptions: [
      'I conteggi sono non negativi e la tabella ha almeno due righe e due colonne.',
      'I totali di riga e colonna sono positivi.',
      'L’analisi è descrittiva; l’approssimazione χ² richiede conteggi attesi adeguati.',
    ],
    whenNotToUse: [
      'Con molte celle nulle o conteggi attesi molto piccoli.',
      'Quando serve una spiegazione causale dell’associazione.',
    ],
    reading: [
      'L’inerzia totale è χ² diviso il totale dei conteggi.',
      'Riga e colonna vicine compaiono insieme più spesso dell’atteso.',
      'Il contributo dice quanto una modalità costruisce un asse; il cos² quanto l’asse la rappresenta.',
    ],
    pitfalls: [
      'Leggere la mappa come un test.',
      'Ignorare i conteggi attesi piccoli.',
    ],
    charts: ['Mappa righe/colonne per i primi due assi.', 'Heatmap dei residui standardizzati.'],
    glossary: [
      { term: 'Inerzia', definition: 'Parte di variabilità della tabella spiegata dagli assi.' },
    ],
    seeAlso: ['contingency', 'loglinear'],
  }),
  procedureTopic({
    id: 'sem',
    title: 'SEM / CFA',
    summary: 'Adatta un modello fattoriale confermativo o un modello strutturale a due fattori.',
    goal: 'Verificare se un modello di misura con fattori latenti riproduce la covarianza degli indicatori.',
    steps: [
      'Seleziona gli indicatori numerici e assegna ciascuno a un fattore latente.',
      'Scegli il numero di fattori e, se vuoi, regredisci il secondo fattore sul primo.',
      'Esegui l’analisi e leggi χ², CFI, TLI, RMSEA e SRMR prima dei carichi.',
      'Controlla i carichi standardizzati e i residui di covarianza per il disadattamento locale.',
    ],
    expected:
      'Tabella di adattamento, carichi standardizzati con errori standard, unicità, correlazioni tra fattori o percorso strutturale, heatmap dei residui.',
    whenToUse: [
      'Quando la teoria specifica quali indicatori appartengono a quale costrutto.',
      'Per verificare un modello di misura prima di usare i punteggi fattoriali.',
    ],
    assumptions: [
      'Gli indicatori sono continui o quasi continui e il campione è sufficiente.',
      'Ogni fattore ha almeno due indicatori e il modello è identificato.',
      'Il test di massima verosimiglianza assume normalità multivariata.',
    ],
    whenNotToUse: [
      'Per un’analisi fattoriale esplorativa senza assegnazione: usa Multivariate.',
      'Con campioni molto piccoli o molti parametri rispetto alle righe.',
    ],
    reading: [
      'χ² testa l’adattamento esatto ed è sensibile alla numerosità; CFI/TLI sopra 0,95 e RMSEA sotto 0,06 sono soglie convenzionali.',
      'Un carico standardizzato è la correlazione tra indicatore e fattore.',
      'Il percorso strutturale è una regressione tra fattori latenti.',
    ],
    pitfalls: [
      'Trattare un buon adattamento come prova che il modello è vero.',
      'Aggiungere percorsi solo per migliorare l’adattamento.',
    ],
    charts: ['Barre dei carichi per fattore.', 'Heatmap dei residui di covarianza.'],
    glossary: [
      { term: 'CFA', definition: 'Analisi fattoriale confermativa con indicatori assegnati ai fattori.' },
    ],
    seeAlso: ['multivariate', 'cluster'],
  }),
  procedureTopic({
    id: 'latentclass',
    title: 'Classi latenti',
    summary: 'Raggruppa le righe in classi non osservate usando indicatori categorici.',
    goal: 'Trovare profili di risposta ricorrenti e classificare le righe in base a essi.',
    steps: [
      'Seleziona almeno due indicatori categorici con livelli osservati.',
      'Scegli il numero di classi e il massimo di iterazioni EM.',
      'Esegui l’analisi e confronta AIC/BIC tra modelli con numeri diversi di classi.',
      'Leggi proporzioni, probabilità condizionate ed entropia.',
    ],
    expected:
      'Tabella di adattamento, proporzioni delle classi, probabilità condizionate, classificazione a posteriori e grafici dei profili.',
    whenToUse: [
      'Quando si sospetta che la popolazione contenga sottogruppi con profili diversi.',
      'Per costruire una tipologia da item di survey o diagnostici.',
    ],
    assumptions: [
      'Gli indicatori sono categorici e misurati sulle stesse righe.',
      'Vale l’indipendenza condizionale dentro ogni classe.',
      'Il numero di classi è una scelta di modellazione.',
    ],
    whenNotToUse: [
      'Con indicatori continui: usa l’analisi fattoriale o il SEM.',
      'Con campioni molto piccoli o classi con pochissime righe.',
    ],
    reading: [
      'Le proporzioni danno la dimensione di ogni profilo.',
      'Le probabilità condizionate mostrano quali risposte distinguono le classi.',
      'BIC penalizza la complessità più di AIC; valori più bassi sono migliori.',
      'Entropia vicina a 1 indica assegnazioni nette.',
    ],
    pitfalls: [
      'Scegliere il numero di classi solo in base all’adattamento.',
      'Trattare le classi come tipi reali.',
    ],
    charts: ['Barre delle proporzioni delle classi.', 'Profili lineari delle probabilità condizionate.'],
    glossary: [
      { term: 'Entropia', definition: 'Misura 0–1 della nettezza delle assegnazioni alle classi.' },
    ],
    seeAlso: ['multivariate', 'mi'],
  }),
  procedureTopic({
    id: 'irt',
    title: 'Teoria della risposta all’item',
    summary: 'Adatta un modello 2PL o Rasch a item binari e stima l’abilità.',
    goal: 'Descrivere il comportamento di item binari lungo un tratto latente e stimare l’abilità di ogni persona.',
    steps: [
      'Seleziona almeno due item codificati 0/1.',
      'Scegli 2PL per discriminazione libera o Rasch per discriminazione unitaria.',
      'Esegui l’analisi e leggi discriminazione e difficoltà degli item.',
      'Controlla la curva di informazione e i punteggi di abilità con i loro errori standard.',
    ],
    expected:
      'Tabella degli item con discriminazione, difficoltà ed errori standard; affidabilità; punteggi di abilità; curva di informazione.',
    whenToUse: [
      'Quando un insieme di item binari misura un unico tratto latente.',
      'Per valutare difficoltà e discriminazione prima di costruire una scala.',
    ],
    assumptions: [
      'Unidimensionalità: un solo tratto spiega le risposte.',
      'Indipendenza locale condizionata all’abilità.',
      'Le curve seguono il modello logistico scelto.',
    ],
    whenNotToUse: [
      'Con tratti multidimensionali o item che misurano costrutti diversi.',
      'Con campioni molto piccoli o item senza variabilità.',
    ],
    reading: [
      'La difficoltà b è il livello di abilità con probabilità di risposta corretta del 50%.',
      'La discriminazione a è la pendenza: valori alti separano meglio abilità vicine.',
      'La curva di informazione mostra dove il test misura con più precisione.',
    ],
    pitfalls: [
      'Ignorare la multidimensionalità e forzare tutti gli item su un tratto.',
      'Leggere la difficoltà come qualità dell’item.',
    ],
    charts: ['Barre delle difficoltà degli item.', 'Curva di informazione del test.'],
    glossary: [
      { term: '2PL', definition: 'Modello logistico a due parametri con discriminazione e difficoltà libere.' },
    ],
    seeAlso: ['multivariate', 'descriptive'],
  }),
  procedureTopic({
    id: 'conjoint',
    title: 'Analisi congiunta',
    summary: 'Stima le utilità parziali dei livelli degli attributi dalle valutazioni dei profili.',
    goal: 'Capire quali attributi guidano la preferenza e quali livelli sono preferiti.',
    steps: [
      'Seleziona gli attributi categorici e la colonna numerica di valutazione.',
      'Esegui l’analisi e leggi le utilità di ogni livello.',
      'Confronta l’importanza degli attributi come ampiezza delle utilità.',
      'Controlla R² e l’errore residuo prima di fidarti della graduatoria.',
    ],
    expected: 'Tabella delle utilità per attributo e livello, importanza, R² e RMSE, barre di utilità e importanza.',
    whenToUse: [
      'Quando i rispondenti valutano o ordinano profili completi descritti da più attributi.',
      'Per quantificare l’importanza relativa delle caratteristiche di un prodotto.',
    ],
    assumptions: [
      'Le preferenze sono additive tra gli attributi.',
      'I profili coprono adeguatamente i livelli.',
      'La scala di valutazione è usata in modo coerente.',
    ],
    whenNotToUse: [
      'Quando gli attributi interagiscono fortemente.',
      'Con troppo pochi profili per stimare tutti gli effetti.',
    ],
    reading: [
      'Un’utilità positiva indica un livello preferito rispetto alla media dell’attributo.',
      'L’importanza è l’ampiezza dell’attributo divisa per la somma delle ampiezze.',
      'R² misura quanto il modello additivo riproduce le valutazioni.',
    ],
    pitfalls: [
      'Leggere le utilità come gradimento assoluto.',
      'Ignorare interazioni che il modello additivo non rappresenta.',
    ],
    charts: ['Barre delle utilità parziali.', 'Barre dell’importanza degli attributi.'],
    glossary: [
      { term: 'Utilità parziale', definition: 'Contributo di un livello di attributo alla preferenza complessiva.' },
    ],
    seeAlso: ['multivariate', 'regression'],
  }),
];
