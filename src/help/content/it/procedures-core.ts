import type { HelpTopic } from '../types';

/** Procedure chapters: description, comparison of means and regression models. */
export const coreTopics: HelpTopic[] = [
  {
    id: 'descriptive',
    area: 'procedures',
    title: 'Statistiche descrittive',
    summary: 'Media, dispersione, quantili, mancanti e controlli di normalità per ogni variabile.',
    tutorial: {
      goal: 'Riassumere le variabili numeriche di uno studio prima di scegliere un test.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri la procedura Descrittive dalla famiglia Descrittive.',
        'Seleziona le variabili numeriche (Score, Age) e lascia il livello di confidenza al 95%.',
        'Premi Esegui analisi e leggi la riga di ogni variabile.',
        'Controlla la colonna dei mancanti e il test di normalità prima di passare ai confronti.',
      ],
      expected: 'Una riga per variabile con N, media, deviazione standard, mediana, quartili, minimo e massimo, più l’esito dei controlli di normalità.',
    },
    advanced: {
      assumptions: ['Per media e deviazione standard la variabile deve essere quantitativa.'],
      whenToUse: [
        'Sempre, come primo passo: racconta la forma dei dati e i valori anomali.',
        'Per decidere tra test parametrici e non parametrici.',
      ],
      whenNotToUse: ['Con variabili categoriche: usa le frequenze, non la media.'],
      reading: [
        'Media molto diversa dalla mediana suggerisce asimmetria o valori estremi.',
        'Il test di normalità è indicativo: con N grande diventa iper-sensibile, con N piccolo ha poca potenza.',
      ],
      pitfalls: [
        'Non riportare la deviazione standard come errore standard: sono grandezze diverse.',
        'Un massimo isolato può dominare media e deviazione standard.',
      ],
      glossary: [
        { term: 'Deviazione standard', definition: 'Dispersione media dei valori attorno alla media, nella stessa unità dei dati.' },
        { term: 'Quantile', definition: 'Il valore sotto il quale cade una certa percentuale delle osservazioni.' },
      ],
    },
    seeAlso: ['distfit', 'ttest'],
  },
  {
    id: 'distfit',
    area: 'procedures',
    title: 'Adattamento di distribuzioni',
    summary: 'Confronta la distribuzione osservata con famiglie teoriche e scegli la migliore.',
    tutorial: {
      goal: 'Capire quale distribuzione teorica descrive meglio una variabile.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri la procedura e seleziona la variabile numerica.',
        'Spunta le distribuzioni da confrontare (normale, lognormale, gamma, Weibull…).',
        'Esegui e osserva la tabella con i criteri di bontà di adattamento.',
        'Riesegui con la sola distribuzione migliore per ottenere il grafico di confronto.',
      ],
      expected: 'La distribuzione con il criterio migliore è evidenziata; il grafico sovrappone densità teorica e istogramma osservato.',
    },
    advanced: {
      assumptions: ['Le osservazioni devono essere indipendenti.'],
      whenToUse: ['Per scegliere una famiglia prima di modellare tempi, conteggi o importi.'],
      whenNotToUse: ['Con meno di qualche decina di casi: le differenze tra distribuzioni sono poco distinguibili.'],
      reading: [
        'Valori più bassi di AIC/BIC indicano adattamento migliore.',
        'Il p-value di un test di adattamento non «prova» la normalità: misura solo l’evidenza contraria.',
      ],
      pitfalls: ['Scegliere la distribuzione guardando i dati e poi testarla sugli stessi dati gonfia l’ottimismo.'],
      glossary: [
        { term: 'AIC', definition: 'Criterio che premia l’adattamento e penalizza il numero di parametri.' },
        { term: 'Lognormale', definition: 'Distribuzione il cui logaritmo è normale; tipica di importi e tempi.' },
      ],
    },
    seeAlso: ['descriptive', 'parametric'],
  },
  {
    id: 'ttest',
    area: 'procedures',
    title: 'Test t',
    summary: 'Confronta due medie o due misurazioni appaiate, con alternativa non parametrica.',
    tutorial: {
      goal: 'Verificare se il punteggio medio differisce tra due gruppi indipendenti.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri Test t e scegli Tipo di test = Campioni indipendenti.',
        'Variabile 1 = Score, Variabile 2 = Group.',
        'Lascia Varianze su Welch se non sai se le varianze sono uguali.',
        'Esegui e leggi differenza, intervallo di confidenza e p-value.',
      ],
      expected: 'Due righe descrittive, il test t con gradi di libertà, la differenza con IC e il report di lettura.',
    },
    advanced: {
      assumptions: [
        'Osservazioni indipendenti; per il test appaiato, legame tra le due misure dello stesso soggetto.',
        'Con N piccolo serve normalità o almeno assenza di asimmetria forte.',
      ],
      whenToUse: ['Due gruppi o due tempi, esito numerico.'],
      whenNotToUse: ['Più di due gruppi (usa ANOVA) o esito categoriale.'],
      reading: [
        'Il p-value risponde a «quanto è compatibile con l’assenza di differenza», non alla probabilità che l’ipotesi nulla sia vera.',
        'L’intervallo di confidenza dice anche quanto grande può essere la differenza: valuta la rilevanza pratica.',
      ],
      pitfalls: [
        'Confrontare molte coppie di gruppi senza correzione aumenta i falsi positivi.',
        'Un risultato non significativo non dimostra l’uguaglianza: guarda l’intervallo.',
      ],
      glossary: [
        { term: 'Welch', definition: 'Versione del test t che non assume varianze uguali.' },
        { term: 'd di Cohen', definition: 'Dimensione dell’effetto espressa in deviazioni standard.' },
      ],
    },
    seeAlso: ['anova', 'nonparamrm', 'tost'],
  },
  {
    id: 'anova',
    area: 'procedures',
    title: 'ANOVA a una via',
    summary: 'Confronta le medie di due o più gruppi con post-hoc e alternativa di Kruskal-Wallis.',
    tutorial: {
      goal: 'Sapere se il punteggio medio cambia tra tre gruppi di trattamento.',
      dataset: 'score-groups.csv',
      steps: [
        'Apri ANOVA, scegli Variabile dipendente = Score e Variabile di gruppo = Group.',
        'Lascia Post-hoc = Holm e attiva l’alternativa non parametrica.',
        'Esegui e controlla la tabella principale, poi i confronti post-hoc.',
      ],
      expected: 'Tabella ANOVA con F, gradi di libertà e p; confronti post-hoc con differenze e IC; Kruskal-Wallis come controllo.',
    },
    advanced: {
      assumptions: ['Indipendenza, normalità dei residui, varianze simili tra gruppi.'],
      whenToUse: ['Un fattore tra soggetti con tre o più livelli.'],
      whenNotToUse: ['Misure ripetute (usa ANOVA per misure ripetute) o due soli gruppi (test t è equivalente).'],
      reading: [
        'Un p significativo dice che almeno una media differisce: i post-hoc dicono quale.',
        'Levene significativo suggerisce varianze diverse: preferisci Welch o Kruskal-Wallis.',
      ],
      pitfalls: [
        'Il post-hoc va scelto prima di guardare i dati, non dopo.',
        'Ripetere l’ANOVA su sottogruppi scelti a posteriori gonfia i falsi positivi.',
      ],
      glossary: [
        { term: 'Post-hoc', definition: 'Confronti a coppie eseguiti dopo un test globale significativo.' },
        { term: 'Holm', definition: 'Correzione dei p-value che controlla l’errore di famiglia senza essere troppo conservativa.' },
      ],
    },
    seeAlso: ['factorial', 'ancova', 'nonparamrm'],
  },
  {
    id: 'factorial',
    area: 'procedures',
    title: 'ANOVA fattoriale',
    summary: 'Due fattori tra soggetti, effetti principali e interazione.',
    tutorial: {
      goal: 'Verificare se l’effetto di un trattamento dipende dal sesso dei partecipanti.',
      dataset: 'score-groups.csv',
      steps: [
        'Seleziona la variabile dipendente e i due fattori (Fattore A, Fattore B).',
        'Attiva «Includi l’interazione A × B».',
        'Esegui e leggi la tabella degli effetti: A, B e A × B.',
        'Se l’interazione è significativa, commenta le medie per cella e non solo gli effetti principali.',
      ],
      expected: 'Una riga per effetto con F, gradi di libertà, p e dimensione dell’effetto, più le medie delle celle.',
    },
    advanced: {
      assumptions: ['Indipendenza, normalità dei residui, varianze simili nelle celle.'],
      whenToUse: ['Due fattori categorici tra soggetti, con abbastanza casi per cella.'],
      whenNotToUse: ['Celle con pochissimi casi: la stima dell’interazione diventa instabile.'],
      reading: [
        'Un effetto principale significativo in presenza di interazione significativa va letto con cautela.',
        'Le medie delle celle mostrano la direzione dell’interazione.',
      ],
      pitfalls: ['Con disegni sbilanciati l’ordine dei termini cambia i risultati: controlla il tipo di somme dei quadrati.'],
      glossary: [
        { term: 'Interazione', definition: 'Quando l’effetto di un fattore cambia a seconda del livello dell’altro.' },
        { term: 'Effetto principale', definition: 'L’effetto medio di un fattore ignorando l’altro.' },
      ],
    },
    seeAlso: ['anova', 'mixedanova'],
  },
  {
    id: 'ancova',
    area: 'procedures',
    title: 'ANCOVA',
    summary: 'Confronta gruppi correggendo per covariate continue, con medie aggiustate.',
    tutorial: {
      goal: 'Confrontare i gruppi tenendo conto dell’età dei partecipanti.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli variabile dipendente, fattore di gruppo e covariate (almeno una).',
        'Esegui e verifica il test di omogeneità delle pendenze.',
        'Leggi le medie corrette con intervalli di confidenza e i confronti Holm.',
      ],
      expected: 'Tabella con effetto del gruppo al netto delle covariate, medie aggiustate e diagnosi sulle pendenze.',
    },
    advanced: {
      assumptions: [
        'Relazione lineare tra covariata ed esito in ogni gruppo.',
        'Pendenze omogenee: se il test è significativo, l’ANCOVA classica non è adatta.',
      ],
      whenToUse: ['Gruppi non bilanciati su una variabile continua che influenza l’esito.'],
      whenNotToUse: ['Covariata misurata dopo il trattamento: rischio di aggiustare via l’effetto.'],
      reading: ['Le medie aggiustate sono quelle da riportare, non le medie grezze.'],
      pitfalls: ['Una covariata correlata con il gruppo rende l’interpretazione fragile.'],
      glossary: [
        { term: 'Medie aggiustate', definition: 'Medie stimate come se tutti i gruppi avessero lo stesso valore medio della covariata.' },
        { term: 'Pendenze omogenee', definition: 'La relazione covariata-esito ha la stessa inclinazione in tutti i gruppi.' },
      ],
    },
    seeAlso: ['anova', 'regression'],
  },
  {
    id: 'repeatedanova',
    area: 'procedures',
    title: 'ANOVA per misure ripetute',
    summary: 'Confronta condizioni misurate sugli stessi soggetti, con correzioni di sfericità.',
    tutorial: {
      goal: 'Confrontare tre misurazioni fatte sugli stessi partecipanti.',
      dataset: 'score-groups.csv',
      steps: [
        'Organizza i dati in formato largo: una riga per soggetto, una colonna per condizione.',
        'Seleziona le colonne delle condizioni (almeno tre).',
        'Esegui e controlla Mauchly e le correzioni Greenhouse–Geisser o Huynh–Feldt.',
        'Se il test globale è significativo, leggi i confronti a coppie corretti.',
      ],
      expected: 'Tabella entro i soggetti con F, sfericità e p corretto, più i confronti post-hoc.',
    },
    advanced: {
      assumptions: ['Sfericità: le differenze tra condizioni hanno la stessa variabilità.'],
      whenToUse: ['Stesse unità misurate in tre o più occasioni.'],
      whenNotToUse: ['Dati mancanti numerosi: meglio un modello misto.'],
      reading: [
        'Se Mauchly è significativo usa i gradi di libertà corretti.',
        'La correzione cambia i gradi di libertà, non le medie.',
      ],
      pitfalls: ['Un ordine delle colonne sbagliato produce un confronto tra condizioni sbagliate.'],
      glossary: [
        { term: 'Sfericità', definition: 'Assunzione che le varianze delle differenze tra condizioni siano uguali.' },
        { term: 'Greenhouse–Geisser', definition: 'Correzione conservativa dei gradi di libertà quando la sfericità è violata.' },
      ],
    },
    seeAlso: ['mixedanova', 'nonparamrm'],
  },
  {
    id: 'mixedanova',
    area: 'procedures',
    title: 'ANOVA mista',
    summary: 'Un fattore tra soggetti e condizioni entro i soggetti, con interazione.',
    tutorial: {
      goal: 'Confrontare l’andamento di due gruppi in tre tempi.',
      dataset: 'score-groups.csv',
      steps: [
        'Prepara il formato largo: una riga per soggetto e una colonna per ogni tempo.',
        'Indica il gruppo tra soggetti e le colonne delle condizioni entro i soggetti.',
        'Esegui e leggi gli effetti tempo, gruppo e interazione tempo × gruppo.',
      ],
      expected: 'Tre righe di effetti con p corretti e medie per gruppo e tempo.',
    },
    advanced: {
      assumptions: ['Sfericità entro i soggetti, normalità dei residui, indipendenza tra soggetti.'],
      whenToUse: ['Disegno longitudinale con un gruppo di confronto.'],
      whenNotToUse: ['Gruppi molto piccoli o dati mancanti strutturali.'],
      reading: ['L’interazione significativa indica che i gruppi cambiano in modo diverso nel tempo.'],
      pitfalls: ['Confondere il formato largo con quello lungo produce colonne sbagliate e risultati privi di senso.'],
      glossary: [
        { term: 'Tra soggetti', definition: 'Fattore i cui livelli sono assegnati a unità diverse.' },
        { term: 'Entro i soggetti', definition: 'Fattore misurato più volte sulla stessa unità.' },
      ],
    },
    seeAlso: ['repeatedanova', 'lmm'],
  },
  {
    id: 'nonparamrm',
    area: 'procedures',
    title: 'Test non parametrici per misure ripetute',
    summary: 'Friedman, McNemar, Cochran Q e Jonckheere–Terpstra.',
    tutorial: {
      goal: 'Confrontare tre condizioni senza assumere la normalità.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli il test in base al disegno: Friedman per ranghi su più condizioni, McNemar per due misure binarie appaiate.',
        'Seleziona le colonne o le variabili richieste.',
        'Esegui e leggi la statistica con il p e, per Friedman, il post-hoc di Nemenyi.',
      ],
      expected: 'Statistica, gradi di libertà e p; per Friedman i confronti a coppie con le differenze di rango.',
    },
    advanced: {
      assumptions: ['Osservazioni appaiate; per Cochran Q esito binario.'],
      whenToUse: ['Campioni piccoli, esiti ordinali o distribuzioni molto asimmetriche.'],
      whenNotToUse: ['Dati continui e numerosi con distribuzione regolare: i parametrici sono più potenti.'],
      reading: ['Un p significativo indica che almeno una condizione differisce; i post-hoc dicono quale.'],
      pitfalls: ['I ranghi perdono informazione sulla grandezza: riporta anche le mediane.'],
      glossary: [
        { term: 'Friedman', definition: 'Alternativa non parametrica all’ANOVA per misure ripetute.' },
        { term: 'McNemar', definition: 'Test per due misure binarie appaiate.' },
      ],
    },
    seeAlso: ['repeatedanova', 'ttest'],
  },
  {
    id: 'tost',
    area: 'procedures',
    title: 'Equivalenza (TOST)',
    summary: 'Verifica che due trattamenti siano equivalenti entro un margine dichiarato in anticipo.',
    tutorial: {
      goal: 'Dimostrare che un generico è equivalente al farmaco di riferimento entro ±0,5.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli il disegno (due gruppi o misure appaiate).',
        'Indica il margine di equivalenza (es. 0,5) prima di guardare i dati.',
        'Esegui e leggi i due test a una coda e l’intervallo di confidenza.',
      ],
      expected: 'Due p-value a una coda e la conclusione di equivalenza solo se il margine cade fuori dall’intervallo.',
    },
    advanced: {
      assumptions: ['Le stesse del test t corrispondente; il margine deve essere clinicamente giustificato.'],
      whenToUse: ['Studi di bioequivalenza, non inferiorità, confronto tra versioni di uno strumento.'],
      whenNotToUse: ['Per «provare» che non c’è differenza senza un margine pre-specificato.'],
      reading: ['L’equivalenza richiede che l’intero intervallo stia dentro ±margine.'],
      pitfalls: ['Scegliere il margine dopo aver visto i dati invalida la procedura.'],
      glossary: [
        { term: 'TOST', definition: 'Two One-Sided Tests: due test a una coda che insieme verificano l’equivalenza.' },
        { term: 'Margine', definition: 'La differenza massima considerata clinicamente accettabile.' },
      ],
    },
    seeAlso: ['ttest', 'samplesize'],
  },
  {
    id: 'correlation',
    area: 'procedures',
    title: 'Correlazione',
    summary: 'Pearson, Spearman e Kendall con intervalli di confidenza e matrice.',
    tutorial: {
      goal: 'Misurare l’associazione tra due variabili continue.',
      dataset: 'score-groups.csv',
      steps: [
        'Seleziona due o più variabili.',
        'Scegli il metodo principale: Pearson se la relazione è lineare, Spearman se ci sono valori estremi o ranghi.',
        'Esegui e leggi coefficiente, IC e p; la matrice mostra tutte le coppie.',
      ],
      expected: 'Coefficiente con intervallo di confidenza, p-value e matrice di correlazione con la diagonale a 1.',
    },
    advanced: {
      assumptions: ['Pearson: relazione lineare e assenza di valori estremi dominanti. Spearman: solo monotonia.'],
      whenToUse: ['Esplorare associazioni prima di un modello, o verificare collinearità.'],
      whenNotToUse: ['Per inferenza causale: la correlazione non identifica la direzione.'],
      reading: [
        'Il segno indica la direzione, il valore assoluto la forza.',
        'Con molte variabili i p-value non corretti sono troppi: interpreta con cautela.',
      ],
      pitfalls: ['Una correlazione forte può sparire o invertirsi dentro i sottogruppi (paradosso di Simpson).'],
      glossary: [
        { term: 'Pearson r', definition: 'Misura di associazione lineare tra due variabili quantitative.' },
        { term: 'Spearman ρ', definition: 'Correlazione calcolata sui ranghi, robusta agli outlier.' },
      ],
    },
    seeAlso: ['regression', 'multivariate'],
  },
  {
    id: 'regression',
    area: 'procedures',
    title: 'Regressione lineare',
    summary: 'Minimi quadrati con diagnostica, errori standard robusti e retta di Theil-Sen.',
    tutorial: {
      goal: 'Stimare di quanto cambia il punteggio al crescere dell’età.',
      dataset: 'score-groups.csv',
      steps: [
        'Variabile dipendente = Score, indipendenti = Age.',
        'Lascia OLS e, in Avanzate, attiva gli errori standard robusti se sospetti eteroschedasticità.',
        'Esegui e leggi coefficiente, errore standard, IC e R².',
        'Controlla i grafici diagnostici dei residui.',
      ],
      expected: 'Tabella dei coefficienti con IC, statistiche di bontà di adattamento e diagnostica dei residui.',
    },
    advanced: {
      assumptions: [
        'Linearità, indipendenza degli errori, omoschedasticità, normalità dei residui (per i test).',
        'Assenza di collinearità estrema tra predittori.',
      ],
      whenToUse: ['Esito continuo e relazione approssimativamente lineare.'],
      whenNotToUse: ['Esito binario (logistica), conteggi (Poisson/NB), tempi con censura (sopravvivenza).'],
      reading: [
        'Il coefficiente è il cambiamento atteso dell’esito per una unità in più del predittore, a parità degli altri.',
        'R² descrive la quota di variabilità spiegata, non la qualità causale del modello.',
      ],
      pitfalls: [
        'Estrapolare fuori dall’intervallo osservato dei predittori.',
        'Interpretare un coefficiente di un modello con interazione come effetto medio.',
      ],
      glossary: [
        { term: 'HC3', definition: 'Stima robusta degli errori standard valida anche con eteroschedasticità.' },
        { term: 'Theil-Sen', definition: 'Retta robusta basata sulla mediana delle pendenze a coppie.' },
      ],
    },
    seeAlso: ['correlation', 'logistic', 'ancova'],
  },
  {
    id: 'logistic',
    area: 'procedures',
    title: 'Regressione logistica',
    summary: 'Esito binario con odds ratio, analisi della soglia e opzione Firth.',
    tutorial: {
      goal: 'Stimare l’effetto dell’età sulla probabilità di un evento.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli Esito (0/1) e i predittori.',
        'Esegui e leggi gli odds ratio con intervallo di confidenza.',
        'Guarda la tabella di classificazione e la soglia proposta.',
        'Attiva Firth se ci sono pochi eventi o separazione.',
      ],
      expected: 'Coefficienti, odds ratio con IC, misure di discriminazione e tabella di classificazione.',
    },
    advanced: {
      assumptions: ['Indipendenza delle osservazioni; logit lineare nei predittori.'],
      whenToUse: ['Esito dicotomico (sì/no, vivo/morto, successo/fallimento).'],
      whenNotToUse: ['Esito con più di due categorie ordinate (usa la logistica ordinale).'],
      reading: [
        'Odds ratio 1 = nessuna associazione; 2 = raddoppio dell’odds, non della probabilità.',
        'Con eventi rari l’odds ratio approssima il rischio relativo.',
      ],
      pitfalls: [
        'Pochi eventi per parametro rendono le stime instabili.',
        'La soglia che massimizza l’accuratezza non è necessariamente quella clinicamente utile.',
      ],
      glossary: [
        { term: 'Odds', definition: 'Rapporto tra probabilità che l’evento avvenga e che non avvenga.' },
        { term: 'Firth', definition: 'Correzione penalizzata che riduce il bias con eventi rari.' },
      ],
    },
    seeAlso: ['regression', 'ordinal', 'chisquare'],
  },
  {
    id: 'countreg',
    area: 'procedures',
    title: 'Regressione per conteggi',
    summary: 'Modelli Poisson e binomiale negativa per esiti di conteggio.',
    tutorial: {
      goal: 'Modellare il numero di eventi in funzione di un predittore.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli l’esito di conteggio e i predittori.',
        'Parti da Poisson; se la dispersione stimata è molto maggiore di 1 passa alla binomiale negativa.',
        'Esegui e leggi i rapporti di tasso con IC.',
      ],
      expected: 'Coefficienti, rapporti di tasso, test di sovradispersione e bontà di adattamento.',
    },
    advanced: {
      assumptions: ['Conteggi non negativi; per Poisson media uguale varianza.'],
      whenToUse: ['Numero di eventi, chiamate, difetti per unità.'],
      whenNotToUse: ['Conteggi con molti zeri strutturali: valuta modelli a eccesso di zeri.'],
      reading: ['Un rapporto di tasso 1,2 significa un aumento atteso del 20% nel numero di eventi.'],
      pitfalls: ['Usare la regressione lineare su conteggi piccoli produce previsioni negative.'],
      glossary: [
        { term: 'Sovradispersione', definition: 'Varianza maggiore della media, tipica di dati di conteggio reali.' },
        { term: 'NB2', definition: 'Binomiale negativa con varianza quadratica nella media.' },
      ],
    },
    seeAlso: ['logistic', 'regression'],
  },
  {
    id: 'ordinal',
    area: 'procedures',
    title: 'Regressione logistica ordinale',
    summary: 'Modello logit cumulativo per esiti con categorie ordinate.',
    tutorial: {
      goal: 'Studiare come un predittore sposta la distribuzione tra livelli ordinati di soddisfazione.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli l’esito ordinale (almeno tre categorie ordinate).',
        'Seleziona i predittori e verifica l’ordine dei livelli nella colonna.',
        'Esegui e leggi gli odds ratio cumulativi con IC.',
      ],
      expected: 'Coefficienti con odds ratio cumulativi e test dell’assunzione di proporzionalità.',
    },
    advanced: {
      assumptions: ['Pendenze proporzionali: l’effetto del predittore è lo stesso su tutti i tagli.'],
      whenToUse: ['Scale Likert, gravità in classi ordinate.'],
      whenNotToUse: ['Categorie non ordinate: usa la multinomiale o il chi-quadro.'],
      reading: ['L’odds ratio cumulativo descrive la probabilità di stare in una categoria superiore o uguale.'],
      pitfalls: ['Se la proporzionalità è violata servono modelli diversi, non la semplice lettura degli OR.'],
      glossary: [
        { term: 'Logit cumulativo', definition: 'Modello che confronta ogni categoria con tutte le superiori.' },
        { term: 'Proporzionalità', definition: 'Assunzione che l’effetto dei predittori non cambi tra i tagli.' },
      ],
    },
    seeAlso: ['logistic', 'contingency'],
  },
  {
    id: 'lmm',
    area: 'procedures',
    title: 'Modello lineare misto (LMM)',
    summary: 'Intercetta casuale per misure ripetute o soggetti raggruppati.',
    tutorial: {
      goal: 'Analizzare misure ripetute gestendo la correlazione dentro il soggetto.',
      dataset: 'score-groups.csv',
      steps: [
        'Scegli l’esito, i predittori fissi e la colonna del gruppo o del soggetto.',
        'Esegui e leggi i coefficienti fissi con IC.',
        'Confronta la varianza residua con quella dell’intercetta casuale.',
      ],
      expected: 'Effetti fissi con errori standard, stima della varianza casuale e criteri di adattamento.',
    },
    advanced: {
      assumptions: ['Residui approssimativamente normali; struttura di covarianza corretta.'],
      whenToUse: ['Dati longitudinali, cluster, misure ripetute con dati mancanti.'],
      whenNotToUse: ['Pochi cluster: le stime della varianza sono instabili.'],
      reading: ['I coefficienti fissi si leggono come in una regressione, ma gli errori tengono conto del raggruppamento.'],
      pitfalls: ['Trattare misure ripetute come indipendenti sottostima gli errori standard.'],
      glossary: [
        { term: 'Effetto fisso', definition: 'Effetto medio valido per la popolazione.' },
        { term: 'Effetto casuale', definition: 'Variazione tra unità (soggetti o cluster).' },
      ],
    },
    seeAlso: ['gee', 'repeatedanova'],
  },
];
