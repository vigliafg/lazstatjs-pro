import type { HelpTopic } from '../types';

/** Chapters that explain the application itself, before the procedures. */
export const areaTopics: HelpTopic[] = [
  {
    id: 'start-tour',
    area: 'start',
    title: 'Primi passi: dati, analisi, risultati',
    summary: 'Il giro completo in tre mosse, per capire dove si trova ogni cosa.',
    tutorial: {
      goal: 'Fare la prima analisi dall’inizio alla fine, senza sapere nulla del programma.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri la scheda DATI: è un foglio di calcolo con una riga di intestazione e una colonna per variabile.',
        'Premi Importa e scegli score-groups.csv: il programma riconosce separatore e decimali da solo.',
        'Controlla il tipo sotto ogni intestazione: num per i numeri, cat per i gruppi.',
        'Passa ad ANALISI, cerca «Test t», compila il pannello Impostazione e premi Esegui analisi.',
        'Leggi la scheda «Report di lettura» che chiude ogni esecuzione e scarica il report HTML dalla barra dell’output.',
      ],
      expected: 'Nell’output compaiono tabelle, eventuali grafici e un commento in parole semplici; nulla viene sovrascritto se esegui di nuovo.',
    },
    advanced: {
      whenToUse: [
        'Quando vuoi un flusso unico per dati, calcolo e report, senza esportare file tra programmi.',
        'Quando ti serve un risultato riproducibile: parametri e dati restano nel progetto .lzs.',
      ],
      reading: [
        'Le schede dell’output sono snapshot: restano come sono state prodotte, anche se poi cambi i dati.',
        'Il badge «obsoleto» segnala che la griglia è cambiata dopo quel risultato.',
      ],
      pitfalls: [
        'Non correggere i numeri nel report: correggi i dati e riesegui.',
        'Salva il progetto prima di esperimenti lunghi: il salvataggio automatico vive nel browser.',
      ],
      glossary: [
        { term: 'Procedura', definition: 'Una singola analisi statistica (per esempio il test t).' },
        { term: 'Scheda di risultato', definition: 'Il blocco che contiene tabelle, grafici e report di una singola esecuzione.' },
      ],
    },
    seeAlso: ['data-import', 'analysis-workflow', 'output-console'],
  },
  {
    id: 'data-import',
    area: 'data',
    title: 'Importare file CSV, TSV, Excel, SPSS e Stata',
    summary: 'Come portare i dati dentro il programma senza rovinare numeri e categorie.',
    tutorial: {
      goal: 'Importare un file con decimali italiani e gruppi scritti a parole.',
      dataset: 'score-groups.csv',
      steps: [
        'Da DATI premi Importa e scegli il file: CSV, TSV, TXT, JSON, Excel (.xlsx) e SPSS/Stata (.sav/.dta); l’anteprima mostra le prime righe.',
        'Verifica il delimitatore rilevato (virgola, punto e virgola, tab) e il separatore decimale.',
        'Indica se la prima riga è l’intestazione e scegli Applica come = Sostituisci la griglia.',
        'Premi Importa e controlla nel riepilogo quante righe e colonne sono entrate.',
      ],
      expected: 'La griglia mostra una colonna per variabile e una riga per osservazione, con i tipi dedotti correttamente.',
    },
    advanced: {
      assumptions: [
        'Ogni riga è una osservazione completa; le variabili sono colonne.',
        'I codici mancanti vanno dichiarati dopo l’importazione (es. -9, NA).',
      ],
      whenToUse: [
        'File esportati da Excel, R, SPSS o da un questionario online.',
        'Più file con le stesse colonne da aggiungere in verticale (Aggiungi righe).',
      ],
      whenNotToUse: [
        'Dati già organizzati in un formato diverso da «una riga per caso»: prima riorganizzali.',
      ],
      reading: [
        '«righe e colonne importate» conferma la dimensione; «intestazioni duplicate rinominate» segnala nomi ripetuti.',
        '«BOM rimosso» è normale nei file salvati da Excel.',
      ],
      pitfalls: [
        'Un separatore decimale sbagliato trasforma i numeri in testo: controlla il tipo dopo l’importazione.',
        'Le celle vuote sono sempre mancanti: non servono codici speciali.',
      ],
      glossary: [
        { term: 'Delimitatore', definition: 'Il carattere che separa le colonne nel file di testo.' },
        { term: 'Codice mancante', definition: 'Un valore convenzionale (es. -9) che il programma deve trattare come assente.' },
      ],
    },
    seeAlso: ['data-editor', 'data-clean', 'projects'],
  },
  {
    id: 'data-editor',
    area: 'data',
    title: 'Modificare i dati nella griglia',
    summary: 'Tipi di colonna, validazione, annullamento e riempimento rapido.',
    tutorial: {
      goal: 'Correggere un valore e convertire una colonna da testo a numero.',
      dataset: 'score-groups.csv',
      steps: [
        'Fai doppio clic su una cella e scrivi il nuovo valore; Invio conferma e scende.',
        'Cambia il tipo dalla tendina sotto l’intestazione (num, int, cat, str).',
        'Premi Valida per elencare le celle non valide; Auto-fix tenta la conversione.',
        'Usa Ctrl+Z per annullare, Ctrl+Y per ripetere; seleziona un intervallo e premi Ctrl+D per riempire in basso.',
      ],
      expected: 'La cella mostra il nuovo valore, il contatore di stato aggiorna le celle non valide e l’annullamento ripristina lo stato precedente.',
    },
    advanced: {
      whenToUse: [
        'Correzioni puntuali o sistematiche su poche righe prima di un’analisi.',
        'Aggiunta di colonne calcolate con una formula (es. Score_Post - Score_Pre).',
      ],
      reading: [
        'Il tipo di colonna guida validazione, correzione automatica ed export Excel; le analisi deducono comunque i numeri dai valori.',
        'L’ispettore delle variabili mostra mancanti, valori distinti e ruoli.',
      ],
      pitfalls: [
        'Rinominare una colonna aggiorna le formule, ma i parametri di analisi che la usavano vanno riselezionati.',
        'Ordinare la griglia cambia l’ordine delle righe: le analisi appaiate dipendono dall’ordine.',
      ],
      glossary: [
        { term: 'Validazione', definition: 'Controllo che ogni cella sia compatibile con il tipo dichiarato.' },
        { term: 'Colonna calcolata', definition: 'Colonna il cui valore è una formula, ricalcolata a ogni modifica.' },
      ],
    },
    seeAlso: ['data-import', 'data-clean', 'levels'],
  },
  {
    id: 'data-clean',
    area: 'data',
    title: 'Pulire e trasformare i dati',
    summary: 'Trova e sostituisci, valori mancanti, righe vuote e duplicati.',
    tutorial: {
      goal: 'Sostituire un’etichetta scritta in modi diversi e riempire le celle vuote con la media.',
      dataset: 'score-groups.csv',
      steps: [
        'Premi Pulisci e apri Trova / Sostituisci; scegli la colonna o Tutte le colonne.',
        'Scrivi il testo da cercare e quello nuovo, poi Applica.',
        'Nella sezione Mancanti scegli Media e premi Riempi per la colonna numerica.',
        'In Riordina elimina righe vuote e duplicati, uno alla volta, controllando il messaggio di esito.',
      ],
      expected: 'Un messaggio riporta quante sostituzioni o celle sono state cambiate; ogni operazione è annullabile con Ctrl+Z.',
    },
    advanced: {
      whenToUse: [
        'Prima di qualsiasi analisi, per evitare categorie duplicate (Sì/No, SI/si).',
        'Per eliminare righe che sono copie esatte e gonfiano ingiustificatamente i conteggi.',
      ],
      whenNotToUse: [
        'Non imputare la media se i dati mancanti sono molti o non casuali: valuta l’imputazione multipla.',
      ],
      reading: [
        '«Nessuna corrispondenza» significa che il testo cercato non esiste, non che l’operazione è fallita.',
        '«celle riempite con» indica il valore usato per l’imputazione.',
      ],
      pitfalls: [
        'La sostituzione con espressioni regolari è potente: prova prima su una colonna sola.',
        'Imputare la media riduce la variabilità e sottostima gli errori standard.',
      ],
      glossary: [
        { term: 'Imputazione semplice', definition: 'Sostituzione di un valore mancante con media, mediana, moda o costante.' },
        { term: 'Duplicato', definition: 'Riga identica a un’altra in tutte le colonne.' },
      ],
    },
    seeAlso: ['data-editor', 'levels', 'mi'],
  },
  {
    id: 'levels',
    area: 'data',
    title: 'Livelli dei gruppi ed etichette',
    summary: 'Dare nomi leggibili ai codici, scegliere l’ordine e il livello di riferimento.',
    tutorial: {
      goal: 'Far comparire «Trattamento» e «Controllo» al posto di 1 e 0 nelle tabelle.',
      dataset: 'score-groups.csv',
      steps: [
        'Nella colonna del gruppo apri il menu e scegli Modifica livelli.',
        'Scrivi l’etichetta accanto a ogni codice e ordinali con le frecce.',
        'Marca come riferimento il gruppo che vuoi come base nei modelli.',
        'Premi Applica livelli e riesegui l’analisi.',
      ],
      expected: 'Tabelle, grafici e report usano le etichette; l’analisi basata su modello riporta i confronti rispetto al riferimento.',
    },
    advanced: {
      whenToUse: [
        'Ogni volta che un gruppo ha codici numerici poco parlanti.',
        'Nei modelli con intercetta: il riferimento decide l’interpretazione dei coefficienti.',
      ],
      reading: [
        'Il codice resta nelle celle; l’etichetta è solo presentazione.',
        'Le celle con valori non elencati compaiono come «non in elenco» e restano nei dati.',
      ],
      pitfalls: [
        'Rimuovere un livello non cancella le osservazioni: cambia solo come vengono mostrate.',
        'Cambiare il riferimento cambia i coefficienti, non la bontà del modello.',
      ],
      glossary: [
        { term: 'Livello di riferimento', definition: 'La categoria rispetto a cui si leggono gli altri gruppi nel modello.' },
        { term: 'Codifica treatment', definition: 'Schema in cui ogni gruppo è confrontato con il riferimento.' },
      ],
    },
    seeAlso: ['data-editor', 'anova', 'regression'],
  },
  {
    id: 'analysis-workflow',
    area: 'analysis',
    title: 'Scegliere ed eseguire un’analisi',
    summary: 'Libreria, ricerca, pannello di impostazione, livello di confidenza e riesecuzione.',
    tutorial: {
      goal: 'Trovare la procedura giusta e ottenere un risultato completo.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri ANALISI: la libreria elenca le procedure per famiglia.',
        'Scrivi nella ricerca il nome del test o il problema (es. «confrontare due gruppi»).',
        'Seleziona la procedura: il pannello Impostazione mostra solo i parametri necessari.',
        'Scegli le variabili, imposta il livello di confidenza e premi Esegui analisi (Ctrl/⌘+Invio).',
        'Usa Live per rieseguire automaticamente quando cambi dati o parametri.',
      ],
      expected: 'Una nuova scheda si aggiunge all’output; quella precedente resta per il confronto.',
    },
    advanced: {
      whenToUse: [
        'Sempre: è il percorso unico verso tabelle, grafici e report.',
        'Live è comodo in esplorazione, ma va spento con procedure pesanti.',
      ],
      reading: [
        'Il badge «pesante» segnala procedure da eseguire esplicitamente.',
        'Se una colonna è stata modificata, la procedura chiede di riselezionare le variabili.',
      ],
      pitfalls: [
        'Cambiare il livello di confidenza non cambia i dati, ma tutte le stime successive.',
        'Rieseguire senza cambiare nulla crea schede duplicate: usa Applica per riusare i parametri.',
      ],
      glossary: [
        { term: 'Livello di confidenza', definition: 'La copertura degli intervalli: 95% è la scelta abituale.' },
        { term: 'Snapshot', definition: 'Copia statica del risultato, indipendente dai dati successivi.' },
      ],
    },
    seeAlso: ['choosing-test', 'output-console', 'start-tour'],
  },
  {
    id: 'choosing-test',
    area: 'analysis',
    title: 'Quale test scelgo?',
    summary: 'Una guida rapida dalla domanda alla procedura, con la procedura guidata.',
    tutorial: {
      goal: 'Scegliere la procedura partendo dal tipo di domanda e di dati.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri la procedura guidata (famiglia Guidata).',
        'Scegli la domanda: descrivere, confrontare gruppi o prevedere un esito.',
        'Indica variabile di esito e gruppi, e se le misure sono indipendenti o appaiate.',
        'Leggi la raccomandazione e premi Apri per caricare la procedura con i parametri già pronti.',
      ],
      expected: 'La procedura suggerita si apre nel pannello con le variabili impostate; devi solo eseguirla.',
    },
    advanced: {
      whenToUse: ['Quando sei all’inizio e non vuoi sbagliare la famiglia di test.'],
      reading: [
        'Esito numerico + 2 gruppi indipendenti → test t o Mann-Whitney; più gruppi → ANOVA o Kruskal-Wallis.',
        'Esito numerico + misure appaiate → test t appaiato o Wilcoxon.',
        'Esito binario → logistico o chi-quadro; tempo fino a un evento → sopravvivenza.',
      ],
      pitfalls: [
        'La raccomandazione non controlla le assunzioni: verifica normalità, indipendenza e dimensione campionaria.',
        'Con pochi casi i test non parametrici sono spesso più adatti.',
      ],
      glossary: [
        { term: 'Appaiato', definition: 'Misure ripetute sulla stessa unità (prima/dopo).' },
        { term: 'Non parametrico', definition: 'Test che non assume una forma precisa della distribuzione.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'ttest', 'nonparamrm'],
  },
  {
    id: 'output-console',
    area: 'output',
    title: 'Leggere ed esportare i risultati',
    summary: 'Schede, indice, annotazioni, preset grafici, grafici PNG, report HTML/Word e cartella Excel.',
    tutorial: {
      goal: 'Portare fuori i risultati in un formato utilizzabile.',
      dataset: 'score-groups.csv',
      steps: [
        'Esegui un’analisi e osserva la scheda: tabelle, poi il Report di lettura, poi i grafici modificabili.',
        'Clicca un grafico per aprire l’editor: cambia tema, colori, preset e opzioni della procedura, poi premi Fatto.',
        'Premi Annotazioni per aggiungere testo, linee, frecce o rettangoli sul grafico; trascina per spostare, usa le maniglie per ridimensionare e annulla con Ctrl/⌘+Z.',
        'Apri l’Indice per saltare a una scheda o comprimerla con la freccia.',
        'Premi Report per scaricare un HTML stampabile, o Word per un file modificabile.',
        'Usa XLSX per avere dataset e tabelle in una cartella di lavoro; Grafici scarica i PNG.',
      ],
      expected: 'I file scaricati contengono gli stessi numeri e le stesse annotazioni mostrati a schermo, con titoli e intestazioni coerenti.',
    },
    advanced: {
      whenToUse: [
        'Per condividere un risultato con chi non usa il programma.',
        'Per archiviare una versione congelata di un’analisi.',
      ],
      reading: [
        '«obsoleto» indica che i dati sono cambiati dopo l’esecuzione: riesegui prima di esportare.',
        'I grafici restano modificabili dopo il reload; le schede salvate con il vecchio motore sono statiche: rilanciale per ottenere un grafico modificabile.',
        'Impostazioni → Grafici imposta lo stile predefinito dei grafici futuri; le schede esistenti non cambiano.',
        'Le annotazioni usano coordinate relative all’area del grafico (0–1), quindi seguono ridimensionamento ed export nello stesso SVG di Vega.',
        'Ogni gesto sulle annotazioni è un passo di annulla; su mobile l’editor del grafico si divide nei tab Grafico, Proprietà e Annotazioni.',
        'I preset con nome sono legati al progetto e compaiono nel selettore Preset di ogni editor grafico del progetto.',
      ],
      pitfalls: [
        'Esportare una scheda obsoleta produce un report formalmente corretto ma non aggiornato.',
        'Il filtro righe «solo vista» non cambia i numeri esportati delle analisi.',
        'Le annotazioni appartengono a una singola scheda: un preset non le copia su un altro grafico.',
      ],
      glossary: [
        { term: 'Report di lettura', definition: 'Il commento in parole semplici che chiude ogni analisi.' },
        { term: 'Cartella di lavoro', definition: 'Il file .xlsx con più fogli, uno per tabella.' },
        { term: 'Annotazione', definition: 'Testo, linea, freccia o rettangolo disegnato sopra un grafico e salvato con esso.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'projects'],
  },
  {
    id: 'projects',
    area: 'output',
    title: 'Salvare e riaprire un progetto',
    summary: 'Nuovo progetto, file .lzs, Salva con nome, salvataggio automatico e ripristino di un backup.',
    tutorial: {
      goal: 'Conservare dati, impostazioni e parametri per riprendere domani.',
      dataset: 'score-groups.csv',
      steps: [
        'Da DATI premi Nuovo progetto per partire da zero: dataset, parametri e output vengono azzerati, mentre impostazioni e preferenze restano.',
        'Premi Salva progetto per scrivere il file .lzs; Salva con nome… chiede un nuovo nome e lascia invariato il file corrente.',
        'Premi Apri progetto e scegli un file per sostituire la sessione corrente.',
        'Ricarica la pagina: il salvataggio automatico ripristina la sessione dal browser.',
        'Da Impostazioni puoi ripristinare un backup IndexedDB se il salvataggio automatico è fallito.',
      ],
      expected: 'Dopo l’apertura ritrovi griglia, livelli, parametri, schede di output, temi personalizzati e preset grafici.',
    },
    advanced: {
      whenToUse: [
        'Prima di cambiare dataset o di esperimenti rischiosi.',
        'Per condividere un caso con un collega, insieme a dati e parametri.',
      ],
      reading: [
        'Il progetto contiene anche gli snapshot dell’output: restano leggibili ma non ricalcolabili.',
        'I temi personalizzati e i preset grafici sono dentro il progetto e viaggiano nel file .lzs.',
        'I campi aggiunti nelle versioni nuove sono opzionali: i file vecchi si aprono con i default.',
      ],
      pitfalls: [
        'Il salvataggio automatico vive nel browser: cancellare i dati del sito lo elimina.',
        'Un file .lzs non è un backup dei dati originali: conserva anche il CSV di partenza.',
        'Nuovo progetto azzera le schede di output: esportale o salvale prima, se ti servono ancora.',
        'Salva con nome… crea una copia; i salvataggi successivi usano il nome scelto nel prompt.',
      ],
      glossary: [
        { term: '.lzs', definition: 'Formato di progetto del programma: JSON con dati, impostazioni e parametri.' },
        { term: 'Backup IndexedDB', definition: 'Copia locale usata come rete di sicurezza dal salvataggio automatico.' },
        { term: 'Salva con nome', definition: 'Comando che scrive una copia del progetto con un nuovo nome .lzs.' },
      ],
    },
    seeAlso: ['data-import', 'output-console', 'appearance'],
  },
  {
    id: 'appearance',
    area: 'output',
    title: 'Temi, preset grafici e theme creator',
    summary: 'Dieci temi incorporati, temi personalizzati del progetto con anteprima live e preset grafici con nome.',
    tutorial: {
      goal: 'Creare un tema di progetto e un preset grafico, poi riutilizzarli.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri IMPOSTAZIONI → Aspetto e scegli uno dei cinque temi scuri o cinque chiari incorporati; il selettore nell’Header lo applica subito.',
        'Premi Crea tema: assegna un nome, scegli tema di base e modalità, modifica i colori e segui l’anteprima live.',
        'Controlla il pannello Contrasto WCAG, poi premi Salva tema: entra in Temi personalizzati, viene selezionato e resta nel progetto.',
        'Esegui un’analisi, apri un grafico e usa il selettore Preset: scegli Predefinito, Minimale, Stampa chiara o uno dei tuoi preset.',
        'Premi Salva preset per memorizzare lo stile condiviso corrente, poi rinomina o elimina i preset da IMPOSTAZIONI → Grafici.',
      ],
      expected: 'Il nuovo tema si applica a tutta l’interfaccia e il preset compare in ogni editor grafico del progetto.',
    },
    advanced: {
      whenToUse: [
        'Quando serve una palette leggibile per un output specifico, per esempio una rivista, un proiettore o la stampa.',
        'Quando più grafici devono condividere lo stesso stile senza ripetere le stesse scelte.',
      ],
      whenNotToUse: [
        'Non usare un preset per copiare annotazioni o dati: contiene solo le opzioni di stile condivise.',
        'Non aspettarti che i temi personalizzati cambino font, spaziature o il CSS di stampa del report: il creator modifica solo i colori.',
      ],
      reading: [
        'I temi personalizzati sono legati al progetto, al massimo 20, e compaiono in un gruppo dedicato del selettore nell’Header.',
        'L’anteprima del theme creator è circoscritta al suo pannello: il resto dell’applicazione mantiene il tema corrente finché non salvi.',
        'I controlli di contrasto coprono 11 coppie, tra cui testo su superfici, accenti, testo dei grafici e il colore peggiore della palette sullo sfondo del grafico.',
        'I preset grafici memorizzano le 20 opzioni di stile condivise e mai le annotazioni per scheda o le impostazioni specifiche della procedura.',
      ],
      pitfalls: [
        'Salvare un tema sotto il contrasto consigliato chiede conferma: leggi i badge AA/AAA prima di usarlo in un report.',
        'Eliminare il tema personalizzato attivo riporta al tema predefinito; i grafici mantengono le proprie opzioni.',
        'Applicare un preset sostituisce lo stile condiviso di quel grafico; annotazioni e opzioni della procedura restano come sono.',
        'Rinominare o eliminare un preset in Impostazioni aggiorna il progetto ma non riscrive le schede che lo avevano già usato.',
      ],
      glossary: [
        { term: 'Tema personalizzato', definition: 'Palette dell’interfaccia legata al progetto e creata a partire da un tema incorporato.' },
        { term: 'Preset grafico', definition: 'Insieme con nome di opzioni di stile condivise, riutilizzabile tra le schede.' },
        { term: 'Contrasto WCAG', definition: 'Rapporto tra colore del testo e dello sfondo, usato per controllare la leggibilità.' },
      ],
    },
    seeAlso: ['projects', 'output-console'],
  },
];
