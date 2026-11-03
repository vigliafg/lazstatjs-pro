import type { HelpTopic } from './types';

/** Procedure wave 2: GLM, quantilica, non lineare e multinomiale. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Modello lineare generalizzato (GLM)',
    summary: 'Famiglie gaussiana, binomiale, Poisson e Gamma con scelta del link.',
    tutorial: {
      goal: 'Stimare come cambia un punteggio con l’età quando l’esito non è una semplice media continua.',
      dataset: 'score-groups.csv',
      steps: [
        'Variabile dipendente = Score, indipendenti = Age.',
        'Scegli la famiglia: gaussiana per un punteggio continuo, binomiale per 0/1, Poisson per i conteggi, Gamma per importi positivi e asimmetrici.',
        'Scegli un link coerente con la famiglia: identità, log, logit, probit o inverso.',
        'Esegui e leggi i coefficienti sulla scala del link insieme a devianza e AIC.',
      ],
      expected: 'Tabella dei coefficienti sulla scala del link, bontà del modello (devianza, AIC), residui e, con un solo predittore, il profilo della media stimata.',
    },
    advanced: {
      assumptions: [
        'Osservazioni indipendenti e risposta con varianza conforme alla famiglia scelta.',
        'Il link lega il valore atteso a un predittore lineare: la parte lineare deve essere corretta.',
        'Binomiale richiede risposta 0/1, Poisson conteggi non negativi, Gamma valori strettamente positivi.',
      ],
      whenToUse: [
        'Esito continuo ma asimmetrico o eteroschedastico, tipicamente Gamma con link log.',
        'Esito binario quando serve un link probit o una famiglia fuori dal menu logistico classico.',
        'Conteggi quando vuoi confrontare il link log di Poisson con la diagnostica di devianza.',
      ],
      whenNotToUse: [
        'Esito binario che rientra nella procedura logistica dedicata, con odds ratio e analisi del cutoff.',
        'Conteggi sovradispersi: il binomiale negativo della Regressione per conteggi è di solito migliore.',
        'Misure ripetute o raggruppate: usa modelli misti o GEE.',
      ],
      reading: [
        'I coefficienti vivono sulla scala del link: con link log exp(β) è un rapporto moltiplicativo, con link logit è un odds ratio.',
        'Una devianza residua molto maggiore dei gradi di libertà segnala sovradispersione, soprattutto per Poisson e binomiale.',
        'L’AIC confronta modelli sulla stessa risposta e famiglia; non è una misura assoluta di adattamento.',
      ],
      pitfalls: [
        'Leggere un coefficiente con link log come variazione additiva dell’esito.',
        'Tenere la famiglia gaussiana con una risposta 0/1 o di conteggio solo perché il modello gira.',
        'Scegliere il link probit e poi interpretare i coefficienti come odds ratio.',
      ],
      charts: [
        'Valori osservati e stimati: punti vicini alla diagonale indicano buona calibrazione.',
        'Residui rispetto ai valori stimati: un imbuto o una curva rivelano famiglia o link sbagliati.',
        'Profilo della media stimata: con un solo predittore, la curva stimata nell’intervallo osservato.',
      ],
      glossary: [
        { term: 'Link', definition: 'La funzione che collega il valore atteso al predittore lineare.' },
        { term: 'Devianza', definition: 'Misura di bontà del modello: più bassa è meglio ed è confrontabile tra modelli annidati.' },
        { term: 'Sovradispersione', definition: 'Varianza maggiore di quella prevista dalla famiglia, che gonfia gli errori standard.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Regressione quantilica',
    summary: 'Modella un quantile condizionato (τ) invece della media, robusta agli outlier.',
    tutorial: {
      goal: 'Vedere se l’età sposta il punteggio mediano, non solo la media.',
      dataset: 'score-groups.csv',
      steps: [
        'Variabile dipendente = Score, indipendenti = Age.',
        'Imposta τ: 0,5 è la mediana, 0,1 e 0,9 descrivono le code inferiore e superiore.',
        'Esegui e leggi il coefficiente di ogni predittore a quel quantile.',
        'Ripeti con un altro τ e confronta le due rette stimate.',
      ],
      expected: 'Coefficienti, errori standard e IC per il quantile scelto; con un solo predittore, la retta del quantile e il grafico dei residui.',
    },
    advanced: {
      assumptions: [
        'Osservazioni indipendenti; al τ scelto il quantile condizionato è lineare nei predittori.',
        'Nessun requisito di residui normali o varianza costante.',
      ],
      whenToUse: [
        'Esiti asimmetrici, outlier o interesse per le code (redditi, latenze, punteggi).',
        'Quando l’effetto di un predittore può cambiare lungo la distribuzione.',
      ],
      whenNotToUse: [
        'Quando serve un unico effetto medio e l’obiettivo è la media.',
        'Con campioni molto piccoli: ogni quantile di coda usa poche osservazioni efficaci.',
      ],
      reading: [
        'Il coefficiente è la variazione del quantile τ per una unità in più del predittore.',
        'Pendenze diverse tra i τ indicano che il predittore agisce in modo diverso sul centro e sulle code.',
        'Gli errori standard vengono dalla teoria dei quantili (tipo sandwich); con pochi casi gli intervalli sono larghi.',
      ],
      pitfalls: [
        'Leggere un coefficiente mediano come effetto medio: la media può stare altrove.',
        'Rette di quantili che si incrociano (τ1 < τ2 ma la retta di τ1 sta sopra) suggeriscono un modello mal specificato.',
      ],
      charts: [
        'Retta del quantile: osservazioni con la retta del τ stimato; la pendenza è l’effetto sul quantile.',
        'Residui rispetto ai quantili stimati: una struttura indica che il modello quantilico lineare è sbagliato.',
      ],
      glossary: [
        { term: 'Quantile τ', definition: 'Il valore sotto il quale cade una proporzione τ della distribuzione condizionata.' },
        { term: 'Regressione mediana', definition: 'Regressione quantilica con τ = 0,5, robusta alle osservazioni estreme.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Regressione non lineare',
    summary: 'Curve esponenziale, logistica, Gompertz, potenza e Michaelis–Menten ai minimi quadrati.',
    tutorial: {
      goal: 'Adattare una curva che sale in fretta e poi si appiattisce, e leggerne i parametri.',
      dataset: 'score-groups.csv',
      steps: [
        'Variabile dipendente = Score, predittore = Time.',
        'Scegli la forma: esponenziale, logistica, Gompertz, potenza o Michaelis–Menten.',
        'Esegui e verifica che la stima sia convergente, poi leggi i parametri con i loro IC.',
        'Guarda la curva e i residui; prova un’altra forma se il pattern è sistematico.',
      ],
      expected: 'Tabella dei parametri con SE, t, p e IC, R², RMSE, curva stimata e grafico dei residui.',
    },
    advanced: {
      assumptions: [
        'La forma funzionale scelta è corretta; i residui sono indipendenti e circa omoschedastici.',
        'L’intervallo del predittore copre la parte di curva che vuoi descrivere.',
        'Abbastanza valori distinti del predittore per identificare tutti i parametri.',
      ],
      whenToUse: [
        'Forme di crescita, decadimento, saturazione e dose–risposta che una retta non descrive.',
        'Quando i parametri hanno un significato: asintoto, velocità, semisaturazione.',
      ],
      whenNotToUse: [
        'Quando una trasformazione rende la relazione lineare e interpretabile, come il log–log per una legge di potenza.',
        'Con pochi punti o un intervallo stretto del predittore: i parametri sono debolmente identificati.',
      ],
      reading: [
        'Esponenziale y = a·exp(b·x): b > 0 è crescita, b < 0 è decadimento.',
        'Logistica L/(1+exp(−k(x−x0))): L è l’asintoto superiore, k la pendenza, x0 il punto di flesso.',
        'Gompertz a·exp(−b·exp(−c·x)): crescita asimmetrica che si avvicina più lentamente all’asintoto.',
        'Potenza a·x^b: b è l’esponente; Michaelis–Menten vmax·x/(km+x): km è il valore di semisaturazione.',
      ],
      pitfalls: [
        'Confrontare R² tra curve diverse senza controllare il pattern dei residui.',
        'Fidarsi di una stima convergente con intervalli dei parametri larghi o implausibili.',
        'Estrarre oltre l’intervallo osservato del predittore, soprattutto per la crescita esponenziale.',
      ],
      charts: [
        'Curva stimata: osservazioni con la curva adattata sovrapposta.',
        'Residui rispetto ai valori stimati: archi sistematici indicano che la curva scelta è sbagliata.',
      ],
      glossary: [
        { term: 'Asintoto', definition: 'Il valore a cui la curva tende quando il predittore cresce.' },
        { term: 'Semisaturazione', definition: 'Il valore del predittore a cui la risposta raggiunge metà del massimo (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Regressione logistica multinomiale',
    summary: 'Esito nominale con tre o più classi, ciascuna confrontata con una classe di riferimento.',
    tutorial: {
      goal: 'Stimare come i predittori cambiano la probabilità di appartenere a ogni classe di un esito nominale.',
      steps: [
        'Esito = la colonna categorica con almeno tre classi, per esempio basso/medio/alto.',
        'Seleziona i predittori numerici.',
        'Esegui e leggi un blocco di coefficienti per classe rispetto alla classe di riferimento.',
        'Controlla l’accuratezza complessiva e quella per classe prima di fidarti della classificazione.',
      ],
      expected: 'Coefficienti e rapporti di rischio relativo con IC per ogni classe verso il riferimento, accuratezza complessiva e tabella di classificazione.',
    },
    advanced: {
      assumptions: [
        'Osservazioni indipendenti; il log-odds di ogni classe verso il riferimento è lineare nei predittori.',
        'Indipendenza dalle alternative irrilevanti: aggiungere o togliere una classe non deve cambiare le altre.',
        'Ogni classe ha abbastanza osservazioni per il numero di parametri.',
      ],
      whenToUse: [
        'Esito nominale con più di due categorie non ordinate, come mezzo di trasporto o scelta di prodotto.',
        'Quando servono effetti specifici per classe invece di un solo contrasto binario.',
      ],
      whenNotToUse: [
        'Classi ordinate: la logistica ordinale è più parsimoniosa.',
        'Esito binario: usa la regressione logistica.',
        'Classi molto rare: le stime sono instabili.',
      ],
      reading: [
        'Ogni classe è confrontata con quella di riferimento: exp(β) è un rapporto di rischio relativo, non una probabilità.',
        'Un rapporto sopra 1 significa che il predittore aumenta le odds di quella classe rispetto al riferimento.',
        'L’accuratezza complessiva può essere alta solo perché una classe domina: leggi anche quella per classe.',
      ],
      pitfalls: [
        'Interpretare i rapporti di rischio relativo come probabilità o come rapporti di rischio.',
        'Cambiare la classe di riferimento e aspettarsi gli stessi numeri: il confronto cambia.',
        'Usare la multinomiale quando le classi sono ordinate.',
      ],
      charts: [
        'Distribuzione delle classi predette: ogni barra conta quante osservazioni il modello assegna a quella classe.',
        'Accuratezza per classe: percentuale classificata correttamente in ogni classe, con l’accuratezza complessiva come linea di riferimento.',
      ],
      glossary: [
        { term: 'Classe di riferimento', definition: 'La classe rispetto alla quale vengono confrontate tutte le altre.' },
        { term: 'Rapporto di rischio relativo', definition: 'La variazione moltiplicativa delle odds di una classe verso il riferimento per una unità in più del predittore.' },
        { term: 'Softmax', definition: 'La funzione che trasforma i punteggi delle classi in probabilità che sommano a uno.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
