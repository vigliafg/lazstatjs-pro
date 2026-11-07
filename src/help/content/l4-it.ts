import type { HelpTopic } from './types';

/**
 * Pagine di procedura L4 (versione italiana).
 *
 * Riprendono la struttura di `l4.ts`: stessi identificatori, stesso ordine,
 * stesso contratto a due livelli (tutoriale poi lettura avanzata).
 */
export const l4Topics: HelpTopic[] = [
  {
    id: 'partition',
    area: 'procedures',
    title: 'Partizione (albero di regressione)',
    summary: 'Dividere i dati in foglie omogenee con un albero di regressione.',
    tutorial: {
      goal: 'Spiegare un risultato numerico con una breve serie di regole se-allora.',
      steps: [
        'Scegli la risposta numerica e uno o più predittori numerici.',
        'Imposta la profondità massima e il numero minimo di casi per suddivisione.',
        'Eseguilo e leggi l\'albero, l\'elenco diviso e il rapporto sulle foglie.',
      ],
      expected: 'Un diagramma ad albero, regole di suddivisione, medie fogliari e importanza variabile.',
    },
    advanced: {
      assumptions: [
        'La risposta è numerica; i predittori sono numerici e completi.',
      ],
      whenToUse: [
        'Spiegazione esplorativa, segmentazione ed effetti non lineari.',
      ],
      whenNotToUse: [
        'Inferenza formale o affermazioni causali; utilizzare invece un modello di regressione.',
      ],
      reading: [
        'Ogni nodo interno è una soglia; la media fogliare è la previsione.',
        'L\'importanza variabile somma la riduzione dell\'errore attribuita a ciascun predittore.',
      ],
      pitfalls: [
        'Sovraadattamento degli alberi profondi: convalidare su un campione separato prima di fidarsi delle regole.',
        'Le soglie dipendono dai dati e possono cambiare con un campione diverso.',
      ],
      charts: [
        'Diagramma ad albero',
        'Osservato vs previsto',
        'Importanza variabile',
      ],
      glossary: [
        { term: 'Foglia', definition: 'Un gruppo finale la cui media è la previsione.' },
        { term: 'SSE', definition: 'Somma delle differenze al quadrato tra i valori osservati e quelli previsti.' },
      ],
    },
    seeAlso: [
      'regression',
      'cluster',
    ],
  },
  {
    id: 'quality',
    area: 'procedures',
    title: 'Qualità (SPC)',
    summary: 'Carte di controllo, capacità, Pareto, sistemi di misura, campionamento di accettazione e controllo multivariato.',
    tutorial: {
      goal: 'Verificare se un processo è stabile, capace e misurato in modo affidabile.',
      steps: [
        'Scegli la modalità: carta di controllo, capacità, Pareto, variabilità, intervallo di tolleranza, CUSUM, Gage R&R, campionamento di accettazione o grafico T².',
        'Seleziona la variabile numerica (o la categoria per Pareto).',
        'Per Gage R&R scegliere le colonne della parte e dell\'operatore; per l\'accettazione il set di campionamento n, c e la dimensione del lotto; per T² selezionare due o più variabili misurate negli stessi sottogruppi.',
        'Impostare i limiti delle specifiche, la dimensione del sottogruppo e la proporzione della popolazione per l\'intervallo di tolleranza, quando necessario.',
        'Eseguilo e leggi il grafico, gli indici e il rapporto di lettura.',
      ],
      expected: 'Una carta di controllo con limiti, indici di capacità, una tabella Gage R&R, una curva OC o un grafico T², oltre a tabelle.',
    },
    advanced: {
      assumptions: [
        'Le osservazioni sono nel loro ordine in tempo reale; i sottogruppi sono significativi.',
      ],
      whenToUse: [
        'Monitorare un processo, confrontare la variabilità tra i gruppi, dare priorità ai difetti.',
      ],
      whenNotToUse: [
        'Capacità di giudicare prima della stabilità; un indice di capacità su un processo instabile è fuorviante.',
      ],
      reading: [
        'I punti fuori dai limiti di controllo sono segnali, non prova di un cambiamento.',
        'Cp è il margine potenziale; Cpk penalizza anche una media lontana dal centro della specifica.',
        'La linea cumulativa di Pareto mostra quali categorie affrontare per prime.',
        'L\'intervallo di tolleranza copre una quota della popolazione, non la media; CUSUM accumula piccoli spostamenti persistenti.',
        'Il Gage R&R inferiore al 10% è accettabile, il 10-30% è marginale e superiore al 30% mette a rischio le decisioni parziali.',
        'Sulla curva OC, AQL è la qualità accettata il 95% delle volte e LTPD la qualità accettata solo il 10% delle volte.',
        'Un punto T² fuori dal limite significa che la combinazione di variabili è insolita, non quale variabile si è spostata.',
        'Gage R&R riporta %GRR, la quota della variazione totale dovuta al misuratore, e ndc, il numero di categorie distinte che separa: sotto il 10% con cinque o più categorie il sistema è utilizzabile, sopra il 30% o meno di due categorie non lo è.',
        'Quando i sottogruppi hanno dimensioni diverse, i limiti di controllo vengono calcolati punto per punto invece che una volta per l’intero grafico: un incremento nei limiti riflette la dimensione del campione, non un cambiamento nel processo.',
      ],
      pitfalls: [
        'I limiti di controllo non sono limiti di specifica.',
        'La capacità presuppone la normalità e un processo stabile.',
        'Uno studio R&R di Gage necessita di una progettazione incrociata equilibrata: ogni parte misurata da ogni operatore.',
        'Un grafico T² presuppone osservazioni indipendenti, approssimativamente normali.',
      ],
      charts: [
        'Carta di controllo',
        'Istogramma delle capacità',
        'Grafico di Pareto',
        'Box plot della variabilità',
        'Intervallo di tolleranza',
        'Componenti della varianza R&R di Gage',
        'Curve OC e AOQ',
        'Grafico Hotelling T²',
      ],
      glossary: [
        { term: 'UCL/LCL', definition: 'Limiti di controllo superiore e inferiore a ±3 sigma dal centro.' },
        { term: 'Cpk', definition: 'Indice di capacità che tiene conto della distanza tra la media e i limiti delle specifiche.' },
        { term: 'Ricerca e sviluppo di Gage', definition: 'Quota di variazione totale dovuta al sistema di misurazione: ripetibilità più riproducibilità.' },
        { term: 'AQL', definition: 'Livello di qualità accettabile: difettosità in entrata accettate con il 95% di probabilità.' },
        { term: 'ndc', definition: 'Numero di categorie distinte: quanti diversi livelli della quantità misurata il misuratore può distinguere.' },
      ],
    },
    seeAlso: [
      'descriptive',
      'distfit',
    ],
  },
  {
    id: 'cluster',
    area: 'procedures',
    title: 'Analisi dei cluster',
    summary: 'Raggruppamento gerarchico con un dendrogramma e profili di cluster.',
    tutorial: {
      goal: 'Trova gruppi di osservazioni simili su diverse variabili numeriche.',
      steps: [
        'Seleziona almeno due variabili numeriche.',
        'Scegli il collegamento e il numero di cluster.',
        'Eseguitelo e leggete il dendrogramma, le medie dei cluster e i profili.',
      ],
      expected: 'Un dendrogramma, dimensioni dei cluster, medie dei cluster e profili standardizzati.',
    },
    advanced: {
      assumptions: [
        'Le variabili sono su scale comparabili oppure la standardizzazione è abilitata.',
      ],
      whenToUse: [
        'Segmentazione, tipologie esplorative, ricerca di gruppi naturali.',
      ],
      whenNotToUse: [
        'Testare se esistono gruppi; il clustering non ha valore p per questo.',
      ],
      reading: [
        'L\'altezza di un\'unione è la distanza tra i gruppi da unire.',
        'I profili standardizzati mostrano quali variabili caratterizzano ciascun cluster.',
        'La tabella della fusione riporta pseudo-F e CCC a ogni passo: si vede dove i cluster iniziano a mescolarsi.',
      ],
      pitfalls: [
        'Collegamenti o tagli diversi producono cluster diversi.',
        'Cluster molto piccoli possono essere valori anomali piuttosto che gruppi reali.',
      ],
      charts: [
        'Dendrogramma',
        'Profili di cluster',
        'Dimensioni dei cluster',
      ],
      glossary: [
        { term: 'Collegamento', definition: 'La regola che misura la distanza tra due ammassi.' },
        { term: 'Dendrogramma', definition: 'Un albero che mostra l\'ordine e l\'altezza delle fusioni.' },
      ],
    },
    seeAlso: [
      'multivariate',
      'partition',
    ],
  },
  {
    id: 'discriminant',
    area: 'procedures',
    title: 'Discriminante/MANOVA',
    summary: 'Separare i gruppi noti e testarne la differenza media multivariata.',
    tutorial: {
      goal: 'Controlla se i gruppi differiscono su più variabili numeriche insieme.',
      steps: [
        'Selezionare la colonna di raggruppamento e almeno un predittore numerico.',
        'Eseguilo e leggi Wilks lambda, i test univariati e la trama canonica.',
        'Controlla la matrice di confusione per vedere quanto bene si classificano i gruppi.',
      ],
      expected: 'Tabella MANOVA, coefficienti discriminanti, dispersione canonica e diagramma del profilo.',
    },
    advanced: {
      assumptions: [
        'Osservazioni indipendenti, covarianze di gruppi simili, predittori continui.',
      ],
      whenToUse: [
        'Gruppi noti, regole di classificazione, confronto tra gruppi multivariati.',
      ],
      whenNotToUse: [
        'Scoperta di gruppi sconosciuti (utilizzare il clustering) o di più variabili rispetto ai casi.',
      ],
      reading: [
        'Una piccola lambda di Wilks e una piccola p indicano la separazione del gruppo.',
        'Gli assi canonici sono le direzioni che meglio separano i gruppi.',
        'L\'accuratezza dell\'addestramento è ottimistica: convalidare su un campione separato.',
      ],
      pitfalls: [
        'I gruppi sbilanciati possono pregiudicare la precisione.',
        'I predittori collineari rendono singolare la matrice di covarianza.',
      ],
      charts: [
        'Dispersione canonica',
        'Profili di gruppo',
        'Mappa termica dei coefficienti',
      ],
      glossary: [
        { term: 'Wilks lambda', definition: 'Una statistica di test multivariato vicina allo zero quando i gruppi differiscono.' },
        { term: 'Funzione canonica', definition: 'Una combinazione lineare di variabili che massimizza la separazione del gruppo.' },
      ],
    },
    seeAlso: [
      'multivariate',
      'anova',
    ],
  },
  {
    id: 'doe',
    area: 'procedures',
    title: 'Superficie di risposta e design DOE',
    summary: 'Superficie quadratica per due fattori, più un costruttore per progetti fattoriali e superfici di risposta.',
    tutorial: {
      goal: 'Trova la combinazione di due fattori che ottimizza una risposta o pianifica le corse da raccogliere.',
      steps: [
        'Scegli la modalità: superficie di risposta per analizzare i dati esistenti, costruttore di progetti per generare una matrice di esecuzione.',
        'Per la superficie selezionare la risposta numerica e due fattori numerici e scegliere un modello lineare o quadratico.',
        'Per il costruttore scegliere il tipo di progetto, il numero di fattori e i punti centrali.',
        'Eseguilo e leggi la superficie, i contorni e il punto stazionario, oppure la matrice di progetto e la sua mappa.',
      ],
      expected: 'Una superficie proiettata e un punto stazionario oppure una matrice di progettazione con tratti, punti assiali, punti centrali e alias.',
    },
    advanced: {
      assumptions: [
        'La risposta è continua; i fattori sono numerici; i residui sono indipendenti.',
      ],
      whenToUse: [
        'Ottimizzazione del processo, curvatura e interazione tra due fattori.',
      ],
      whenNotToUse: [
        'Affermazioni causali senza disegno sperimentale, replica e randomizzazione.',
      ],
      reading: [
        'Le linee di contorno collegano combinazioni di fattori con la stessa risposta prevista.',
        'Un punto di sella non è ottimale: sale in una direzione e scende nell’altra.',
        'Un fattoriale completo enumera ogni angolo; una mezza frazione scambia alcuni effetti con meno esecuzioni.',
        'In un disegno composito centrale i punti assiali stimano la curvatura; i punti centrali stimano l\'errore puro.',
      ],
      pitfalls: [
        'La superficie è valida solo all\'interno dell\'intervallo dei fattori osservati.',
        'Un adattamento quadratico non sostituisce un esperimento progettato.',
        'Le corse generate devono comunque essere randomizzate e protette da fattori di disturbo.',
      ],
      charts: [
        'Superficie di risposta',
        'Mappa dei contorni',
        'Coefficienti del modello',
        'Mappa di progettazione',
      ],
      glossary: [
        { term: 'Punto stazionario', definition: 'Dove la pendenza della superficie è zero.' },
        { term: 'Contorno', definition: 'Una linea di risposta prevista costante.' },
        { term: 'CCD', definition: 'Disegno composito centrale: angoli fattoriali, punti assiali e percorsi centrali.' },
        { term: 'Risoluzione', definition: 'Quanto gravemente gli effetti principali vengono confusi con le interazioni in una frazione.' },
      ],
    },
    seeAlso: [
      'factorial',
      'regression',
    ],
  },
  {
    id: 'proportions',
    area: 'procedures',
    title: 'Proporzioni e tariffe',
    summary: 'Test a uno e due campioni per proporzioni e tassi di Poisson.',
    tutorial: {
      goal: 'Decidere se una proporzione o un tasso di eventi differisce da un obiettivo o tra due gruppi.',
      dataset: 'two_groups_binary.csv',
      steps: [
        'Scegli una o due proporzioni oppure uno o due tassi di Poisson.',
        'Selezionare il risultato binario (o la colonna del conteggio) e la colonna del gruppo per le modalità a due campioni.',
        'Scegli il livello di successo, il valore nullo e l\'esposizione per riga quando necessario.',
        'Eseguilo e leggi il test esatto, l\'intervallo e la dimensione dell\'effetto.',
      ],
      expected: 'Una tabella con successi, prove, stima, p esatto e intervallo, più la differenza o il rapporto di frequenza quando sono presenti due gruppi.',
    },
    advanced: {
      assumptions: [
        'Le osservazioni sono indipendenti all\'interno e tra i gruppi.',
        'I conteggi di Poisson sono eventi interi con esposizione nota e varianza pari alla media.',
      ],
      whenToUse: [
        'Confrontando tassi di conversione, tassi di difetto, incidenza o conteggi di eventi per unità di esposizione.',
      ],
      whenNotToUse: [
        'Misure ripetute o dati clusterizzati: il presupposto di indipendenza è violato.',
      ],
      reading: [
        'Il valore p esatto è il riferimento con conteggi piccoli; l\'asintotico p è un\'approssimazione normale.',
        'L\'intervallo di Wilson è più stabile dell\'intervallo di Wald; Clopper–Pearson garantisce una copertura nominale.',
        'Il rapporto di rischio e l’odds ratio non sostituiscono la differenza assoluta.',
      ],
      pitfalls: [
        'Un elevato rapporto di probabilità può nascondere una piccola differenza assoluta quando gli eventi sono rari.',
        'L\'esposizione deve essere dichiarata: lo stesso conteggio su esposizioni diverse dà tassi diversi.',
      ],
      charts: [
        'Trama dell\'intervallo',
      ],
      glossary: [
        { term: 'Valore p esatto', definition: 'Probabilità di ogni risultato improbabile almeno quanto quello osservato sotto il valore nullo.' },
        { term: 'Rapporto tariffario', definition: 'Rapporto tra due tassi di eventi; 1 significa tassi uguali.' },
      ],
    },
    seeAlso: [
      'chisquare',
      'ttest',
    ],
  },
  {
    id: 'variances',
    area: 'procedures',
    title: 'Variazioni',
    summary: 'Una varianza, il test F e Bartlett/Levene per l\'uguaglianza degli spread.',
    tutorial: {
      goal: 'Controllare se una varianza differisce da un obiettivo o tra gruppi.',
      dataset: 'plantgrowth.csv',
      steps: [
        'Scegli una varianza o due o più varianze.',
        'Selezionare la variabile numerica e, per due o più, la colonna del gruppo.',
        'Immettere la varianza nulla per il test a campione singolo.',
        'Eseguilo e confronta F, Bartlett e Levene prima di scegliere un test per le medie.',
      ],
      expected: 'Una tabella della varianza con un intervallo esatto e valori p F/Bartlett/Levene quando sono presenti gruppi.',
    },
    advanced: {
      assumptions: [
        'Le osservazioni sono indipendenti e, per gli intervalli chi quadrato e F, distribuite normalmente.',
        'Levene sulle mediane è più robusto ma necessita ancora di gruppi indipendenti.',
      ],
      whenToUse: [
        'Controllo dell\'omoschedasticità prima di un test t o ANOVA o confronto della diffusione del processo.',
      ],
      whenNotToUse: [
        'Con gruppi molto piccoli i test hanno poca potenza; preferiscono le procedure Welch a prescindere.',
      ],
      reading: [
        'Il test F copre due gruppi; con più gruppi utilizzare Bartlett o Levene.',
        'Bartlett è potente in condizioni normali ma distorto da valori anomali e code pesanti.',
        'Levene sulle mediane riduce l’influenza degli estremi ed è il default più sicuro.',
        'O’Brien aggiunge un robusto test di varianza uguale: mantiene il suo livello quando valori anomali o code pesanti distorcerebbero Bartlett.',
      ],
      pitfalls: [
        'Un test non significativo non dimostra varianze uguali: guarda l\'intervallo e le caselle.',
        'La varianza è su scala quadrata: riporta la deviazione standard per l\'interpretabilità.',
      ],
      charts: [
        'Trama a scatola',
        'Trama dell\'intervallo',
      ],
      glossary: [
        { term: 'Omoschedasticità', definition: 'Uguaglianza delle varianze tra i gruppi, presupposto di t aggregato e ANOVA.' },
        { term: 'Prova di Leven', definition: 'ANOVA sulle deviazioni assolute dal centro del gruppo; la versione mediana è Brown-Forsythe.' },
      ],
    },
    seeAlso: [
      'ttest',
      'anova',
    ],
  },
];
