import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedure dell'ondata 9: survey, machine learning, testo, scelta, Bayes, meta e spaziale. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Campione complesso',
    summary: 'Medie, totali, proporzioni e regressione basati sul disegno con pesi, strati e cluster.',
    goal: 'Stimare una quantità della popolazione da un campione non casuale semplice, usando pesi e struttura del disegno.',
    steps: [
      'Scegli la variabile e la stima: media, totale, proporzione o regressione ponderata.',
      'Nella sezione avanzata imposta peso, strato e cluster quando il disegno li prevede.',
      'Esegui e leggi stima, errore standard, intervallo di confidenza ed effetto disegno.',
    ],
    expected: 'Una tabella del disegno, le stime con intervalli basati sul disegno e, per la regressione, i coefficienti ponderati.',
    whenToUse: [
      'Quando le probabilità di inclusione non sono uguali o il campione è stato raccolto per strati e cluster.',
      'Quando una media grezza sarebbe distorta da gruppi sovra- o sotto-rappresentati.',
    ],
    reading: [
      'Un effetto disegno sopra 1 indica che il disegno è meno efficiente di un campione casuale semplice di pari numerosità ponderata.',
      'La stratificazione di solito riduce la varianza; il clustering la aumenta perché unità vicine si somigliano.',
    ],
    pitfalls: [
      'Trattare i pesi di campionamento come pesi di frequenza: la stima cambia e l’errore standard è sbagliato.',
      'Ignorare la colonna dei cluster e fingere che ogni riga sia indipendente.',
    ],
    charts: ['Stima e intervallo di confidenza.', 'Forest plot dei coefficienti della regressione ponderata.'],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Machine learning',
    summary: 'Random forest, gradient boosting e rete neurale a uno strato nascosto per esiti numerici.',
    goal: 'Prevedere un esito numerico da più predittori senza imporre una forma lineare o parametrica.',
    steps: [
      'Seleziona l’esito numerico e almeno un predittore numerico.',
      'Scegli random forest, gradient boosting o rete neurale.',
      'Imposta alberi, dimensione minima dei nodi, riduzione o unità nascoste e mantieni un seme fisso.',
    ],
    expected: 'Misure di adattamento, importanza delle variabili per i modelli ad albero, predizioni e grafici dei residui.',
    whenToUse: [
      'Quando la relazione è non lineare o contiene interazioni che una regressione non coglierebbe.',
      'Quando l’obiettivo è la previsione e non servono coefficienti interpretabili.',
    ],
    reading: [
      'Confronta R² interno e R² out-of-bag: un divario ampio indica sovradattamento.',
      'L’importanza misura quanto ogni predittore riduce l’errore negli alberi; non è un effetto causale.',
    ],
    pitfalls: [
      'Scegliere il modello sugli stessi dati usati per dichiararne le prestazioni.',
      'Usare pochi dati: alberi e reti memorizzano presto il rumore.',
    ],
    charts: ['Osservato e predetto.', 'Residui e predizioni.', 'Importanza delle variabili.'],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Text mining',
    summary: 'Frequenze dei termini, TF-IDF, similarità tra documenti e modello di argomenti non negativo.',
    goal: 'Descrivere un corpus di testi brevi e trovare i termini e gli argomenti che distinguono i documenti.',
    steps: [
      'Seleziona la colonna di testo e, se serve, una colonna di gruppo.',
      'Scegli frequenze, TF-IDF, similarità tra documenti o argomenti.',
      'Imposta dimensione del vocabolario, frequenza minima nei documenti e numero di argomenti.',
    ],
    expected: 'Una tabella dei termini, una vista documento-termine, una matrice di similarità o una tabella di argomenti con i termini principali.',
    whenToUse: [
      'Quando i dati contengono risposte aperte, commenti, titoli o documenti brevi.',
      'Quando serve una mappa esplorativa del vocabolario prima di leggere i testi uno per uno.',
    ],
    reading: [
      'Il TF-IDF riduce il peso dei termini presenti quasi ovunque, facendo emergere le parole distintive.',
      'Argomenti e similarità sono misure relative al corpus: non valgono automaticamente per testi raccolti con altri filtri.',
    ],
    pitfalls: [
      'Dimenticare che le stopword dipendono dalla lingua e dalle scelte di pulizia.',
      'Leggere il numero di argomenti come una verità scoperta invece che come una scelta di modello.',
    ],
    charts: ['Termini più frequenti.', 'Prevalenza degli argomenti.', 'Mappa documento-argomento o similarità.'],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Scelta / MaxDiff',
    summary: 'Logit condizionale per set di scelta e punteggi best-worst per esperimenti MaxDiff.',
    goal: 'Spiegare quali caratteristiche guidano la scelta tra alternative o ordinare elementi da compiti best-worst.',
    steps: [
      'Per un esperimento di scelta seleziona set, alternativa, indicatore di scelta e caratteristiche che variano tra alternative.',
      'Per MaxDiff seleziona le colonne blocco, elemento, migliore e peggiore.',
      'Esegui e leggi coefficienti, quote previste o classifica MaxDiff.',
    ],
    expected: 'Una tabella di coefficienti con errori standard, quote osservate e previste, oppure una tabella di punteggi MaxDiff.',
    whenToUse: [
      'Quando il rispondente sceglie un’alternativa da un set e le caratteristiche variano tra alternative.',
      'Quando un compito best-worst ordina molti elementi senza chiedere una classifica completa.',
    ],
    reading: [
      'Un coefficiente positivo aumenta la probabilità di scegliere l’alternativa con quella caratteristica.',
      'Il logit condizionale usa solo la variazione dentro il set: le caratteristiche costanti si semplificano.',
    ],
    pitfalls: [
      'Includere caratteristiche che non variano dentro i set: non sono identificabili.',
      'Lasciare set senza alternativa scelta o con più di una scelta.',
    ],
    charts: ['Forest plot dei coefficienti.', 'Quote osservate e previste.', 'Punteggi MaxDiff e intervalli.'],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Analisi bayesiana',
    summary: 'Sintesi a posteriori e diagnostica MCMC per modelli coniugati e regressione gaussiana.',
    goal: 'Combinare la verosimiglianza con una distribuzione a priori e descrivere il parametro con la sua distribuzione a posteriori.',
    steps: [
      'Scegli il modello: media normale, proporzione binomiale, tasso di Poisson o regressione lineare.',
      'Seleziona l’esito e, per la regressione, i predittori.',
      'Imposta la prior, le iterazioni, il burn-in e il numero di catene.',
    ],
    expected: 'Una tabella a posteriori con media, mediana, intervallo centrale, HDI, Rhat ed ESS, più istogramma e grafico degli intervalli.',
    whenToUse: [
      'Quando informazioni pregresse o pochi dati rendono naturale una sintesi a posteriori.',
      'Quando serve l’incertezza completa del parametro, non solo una stima puntuale.',
    ],
    reading: [
      'L’HDI al 95% è l’intervallo più corto che contiene il 95% della massa a posteriori.',
      'Rhat vicino a 1 ed ESS alto indicano catene mescolate; Rhat sopra 1.05 chiede più iterazioni.',
    ],
    pitfalls: [
      'Usare una prior vaga con pochissime osservazioni e leggere il risultato come oggettivo.',
      'Riportare stime da catene che non hanno convergato.',
    ],
    charts: ['Istogramma a posteriori.', 'Intervalli a posteriori con HDI.', 'Posteriori congiunte di due parametri.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Meta-analisi',
    summary: 'Pooling a effetti fissi e casuali con eterogeneità, forest e funnel plot.',
    goal: 'Combinare gli effetti di più studi e quantificare quanto sono discordanti.',
    steps: [
      'Seleziona la colonna dell’effetto e quella del suo errore standard; facoltativamente l’etichetta dello studio.',
      'Scegli DerSimonian–Laird, REML o effetti fissi per la varianza tra studi.',
      'Esegui e leggi effetto pooled, Q, I², τ², intervallo di previsione e test di Egger.',
    ],
    expected: 'Tabella pooled, tabella dell’eterogeneità, tabella degli studi, forest plot e funnel plot.',
    whenToUse: [
      'Quando più studi stimano lo stesso effetto e serve una sintesi con la sua incertezza.',
      'Quando la domanda riguarda la coerenza delle prove, non solo la media.',
    ],
    reading: [
      'I² è la quota di variabilità totale dovuta all’eterogeneità; sopra il 50% è di solito considerata sostanziale.',
      'L’intervallo di previsione descrive dove cadrebbe l’effetto di un nuovo studio, non la precisione della media.',
    ],
    pitfalls: [
      'Unire effetti misurati su scale diverse senza convertirli prima.',
      'Leggere il test di Egger come prova di bias di pubblicazione: è un’evidenza di asimmetria, non un verdetto.',
    ],
    charts: ['Forest plot di studi ed effetto pooled.', 'Funnel plot.', 'Peso degli studi.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Statistica spaziale',
    summary: 'Test di Moran e Geary, indicatori locali e modello di ritardo spaziale sulle coordinate.',
    goal: 'Verificare se unità vicine si somigliano più di quanto farebbe una disposizione casuale e modellare la dipendenza spaziale.',
    steps: [
      'Seleziona la variabile numerica e le due colonne delle coordinate.',
      'Scegli Moran I, Geary C, indicatori locali o modello di ritardo spaziale.',
      'Imposta i vicini più prossimi e le permutazioni; per il modello SAR aggiungi i predittori.',
    ],
    expected: 'Tabella dell’autocorrelazione globale, mappa, indicatori locali e, per SAR, coefficiente di ritardo e tabella di regressione.',
    whenToUse: [
      'Quando le osservazioni sono georeferenziate e la vicinanza può creare dipendenza.',
      'Quando serve individuare cluster o valori anomali locali prima di modellare.',
    ],
    reading: [
      'Moran I sopra il valore atteso indica autocorrelazione positiva; sotto indica autocorrelazione negativa.',
      'I p per permutazione non richiedono normalità ma dipendono dal numero di permutazioni.',
    ],
    pitfalls: [
      'Trattare la matrice dei pesi come data: k o soglia di distanza diversi cambiano i risultati.',
      'Leggere l’autocorrelazione spaziale come effetto causale dei vicini.',
    ],
    charts: ['Mappa dei valori o dei cluster LISA.', 'Indicatori locali.', 'Coefficienti SAR.'],
    seeAlso: ['correlation', 'regression'],
  }),
];
