import type { HelpTopic } from './types';

/** Procedure wave 3: modelli lineari generalizzati misti. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Modello lineare generalizzato misto (GLMM)',
    summary:
      'Intercette e pendenze casuali per esiti binari, di conteggio e continui con famiglia non gaussiana.',
    tutorial: {
      goal: 'Stimare l’effetto di un trattamento su un esito binario o di conteggio quando le osservazioni sono raggruppate (visite ripetute, centri, nidiate) e il raggruppamento non può essere ignorato.',
      steps: [
        'Variabile dipendente: l’esito sulla sua scala naturale, per esempio una risposta 0/1 o un conteggio per visita.',
        'Famiglia e link: binomiale con logit per 0/1, Poisson con log per i conteggi, gaussiana con identità per un esito approssimativamente normale.',
        'Effetti fissi: i predittori di cui vuoi l’effetto sulla popolazione, come trattamento, tempo e la loro interazione.',
        'Colonna di raggruppamento: l’identificativo del cluster (soggetto, centro, lotto). Ogni riga deve portare il livello a cui appartiene.',
        'Effetti casuali: parti da un’intercetta casuale per la colonna di raggruppamento, poi aggiungi una pendenza casuale per il tempo solo se il disegno ha cluster sufficienti e osservazioni ripetute.',
        'Esegui il modello e leggi i coefficienti fissi sulla scala del link, le componenti di varianza, l’ICC e le stime condizionate (BLUP) per cluster.',
      ],
      expected:
        'Tabella degli effetti fissi con errori standard, valori z e intervalli di confidenza sulla scala del link; componenti di varianza degli effetti casuali (varianza dell’intercetta, varianza della pendenza, correlazione intercetta-pendenza); parametro di dispersione o residuo quando la famiglia lo richiede; ICC; BLUP per ogni livello della colonna di raggruppamento; criteri di informazione (AIC, BIC) per confrontare i modelli.',
    },
    advanced: {
      assumptions: [
        'Indipendenza condizionata: dato il proprio effetto casuale, ogni osservazione segue la famiglia scelta ed è indipendente dalle altre.',
        'Gli effetti casuali sono distribuiti normalmente con media zero e matrice di covarianza costante tra i cluster.',
        'I cluster sono indipendenti tra loro e scambiabili: nessuna variabile di livello cluster è stata omessa dalla parte fissa.',
        'Il predittore lineare è specificato correttamente sulla scala del link: link giusto, forma funzionale giusta, nessuna interazione importante trascurata.',
        'Cluster sufficienti per stimare una varianza: 20–30 livelli sono un minimo pratico per un’intercetta casuale, molti di più per una pendenza casuale.',
      ],
      whenToUse: [
        'Esiti binari, di conteggio o asimmetrici misurati ripetutamente sugli stessi soggetti, dove un modello marginale nasconderebbe la correlazione entro soggetto.',
        'Disegni multicentrici o raggruppati in cui l’effetto del cluster è un disturbo da modellare, non un insieme di contrasti fissi.',
        'Conteggi con sovradispersione spiegata dal raggruppamento invece che da un termine di dispersione aggiuntivo.',
        'Quando servono previsioni specifiche per cluster, cioè il BLUP di ogni soggetto o centro, accanto agli effetti medi di popolazione.',
      ],
      whenNotToUse: [
        'Esiti continui approssimativamente normali con dati raggruppati: un modello lineare misto è più semplice e non richiede approssimazioni.',
        'Un solo esito binario o di conteggio per soggetto, senza raggruppamento: bastano la regressione logistica o quella per conteggi ordinarie.',
        'Pochissimi cluster (meno di una decina): le componenti di varianza sono stimate male e gli errori standard degli effetti fissi non sono affidabili; valuta effetti fissi per il cluster o un approccio marginale con correzioni per piccoli campioni.',
        'Quando servono solo effetti medi di popolazione e sei disposto a modellare direttamente la correlazione: GEE è più robusto rispetto a effetti casuali mal specificati.',
      ],
      reading: [
        'I coefficienti fissi sono effetti condizionati, specifici del cluster: con link logit exp(β) è un odds ratio per un soggetto con effetto casuale fissato, e in modulo è più grande dell’odds ratio marginale di una logistica semplice.',
        'Con link log exp(β) è un rapporto di tassi; con link identità il coefficiente è una variazione additiva della media.',
        'La varianza dell’intercetta σ²ᵤ misura quanto varia il livello di base tra i cluster; la varianza della pendenza misura quanto varia l’effetto di un predittore, e la correlazione intercetta-pendenza dice se i cluster che partono più in alto cambiano anche più in fretta.',
        'L’ICC è la quota di varianza sulla scala latente attribuibile al cluster: σ²ᵤ / (σ²ᵤ + π²/3) per il logit, σ²ᵤ / (σ²ᵤ + 1) per il log, σ²ᵤ / (σ²ᵤ + σ²) per il modello gaussiano a identità. Descrive il raggruppamento, non la varianza spiegata.',
        'Il BLUP è lo scostamento stimato di un cluster dalla retta di popolazione, ridotto verso zero in proporzione alla poca informazione che quel cluster porta: è una previsione, non un parametro testato.',
      ],
      pitfalls: [
        'Leggere un odds ratio condizionato come se fosse quello marginale riportato dalla regressione logistica, o viceversa, e confrontarli numericamente.',
        'Stimare una pendenza casuale con pochi cluster: la varianza collassa a zero o il modello non converge, e gli errori standard perdono senso.',
        'Trattare i BLUP come dati in un’analisi di seconda fase: sono stime ridotte e portano con sé la propria incertezza.',
        'Dimenticare che l’approssimazione di Laplace resta un’approssimazione: con dati binari e poche osservazioni per cluster le componenti di varianza possono essere sottostimate; rifai il modello con quadratura di Gauss-Hermite adattiva o controlla la sensibilità.',
        'Verificare una componente di varianza contro zero con un test del rapporto di verosimiglianza ordinario: il null è sul bordo dello spazio dei parametri e il p-value è conservativo.',
      ],
      charts: [
        'Osservati e stimati: punti colorati per cluster con la diagonale come riferimento, per vedere dove il modello è calibrato e quali cluster si discostano.',
        'Grafico caterpillar degli effetti casuali: BLUP ordinati per dimensione con barre di confidenza approssimate, per individuare cluster anomali e l’entità della riduzione.',
        'Residui rispetto ai valori stimati: residui di Pearson o quantili randomizzati contro il predittore lineare, per scoprire un link sbagliato, curvatura residua o eteroschedasticità.',
      ],
      glossary: [
        {
          term: 'Intercetta casuale',
          definition:
            'Scostamento del livello di base specifico del cluster sulla scala del link, estratto da una distribuzione normale la cui varianza viene stimata.',
        },
        {
          term: 'Pendenza casuale',
          definition:
            'Scostamento specifico del cluster nell’effetto di un predittore, con varianza propria e correlazione con l’intercetta.',
        },
        {
          term: 'Componente di varianza',
          definition:
            'Varianza o covarianza stimata degli effetti casuali, che descrive la variabilità tra cluster.',
        },
        {
          term: 'ICC',
          definition:
            'Correlazione intraclasse: proporzione di varianza sulla scala latente che sta tra i cluster.',
        },
        {
          term: 'BLUP',
          definition:
            'Migliore predittore lineare non distorto: stima condizionata e ridotta dell’effetto di un cluster.',
        },
        {
          term: 'Approssimazione di Laplace',
          definition:
            'Sviluppo di Taylor al secondo ordine attorno al modo condizionato degli effetti casuali, usato per integrare la verosimiglianza.',
        },
        {
          term: 'Modello condizionato',
          definition:
            'Modello i cui coefficienti descrivono un singolo cluster, in contrapposizione al modello marginale mediato sulla popolazione.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
  {
    id: 'pls',
    area: 'procedures',
    title: 'Minimi quadrati parziali (PLS)',
    summary:
      'Componenti latenti che massimizzano la covarianza con l’esito, pensate per molti predittori correlati.',
    tutorial: {
      goal: 'Prevedere un esito continuo da molti predittori fortemente correlati, dove la regressione OLS dà coefficienti instabili o poco leggibili.',
      steps: [
        'Variabile dipendente: l’esito continuo da prevedere.',
        'Predittori: le misure correlate, come bande spettrali, canali di sensori o item di un questionario.',
        'Componenti: parti da due o tre e aumenta finché il Q² in cross-validazione migliora.',
        'Fold di cross-validazione: cinque è una scelta comune; zero disattiva il Q².',
        'Esegui il modello e leggi i coefficienti, la varianza spiegata per componente, R² e Q² cumulati e i punteggi VIP.',
      ],
      expected:
        'Una tabella dei coefficienti sulla scala originale, una tabella delle componenti con R², R² cumulato e Q², una tabella VIP con la soglia a uno e i grafici osservati-predetti e dell’adattamento per componente.',
    },
    advanced: {
      assumptions: [
        'La relazione tra componenti ed esito è lineare.',
        'I predittori sono centrati o misurati su una scala confrontabile.',
        'Le osservazioni bastano per stimare le componenti e per la cross-validazione.',
        'Le componenti che predicono l’esito sono stabili nella popolazione, non un artefatto del campione.',
      ],
      whenToUse: [
        'Molti predittori con collinearità forte, come in spettroscopia, chemiometria, omica o dati da sensori.',
        'L’obiettivo è la previsione e i singoli coefficienti non sono oggetto di inferenza.',
        'Il numero di predittori è vicino o superiore al numero di osservazioni.',
        'Vuoi poche direzioni latenti interpretabili invece di un modello scatola nera.',
      ],
      whenNotToUse: [
        'Servono p-value o un effetto causale per ogni predittore: usa una regressione con un disegno chiaro.',
        'I predittori sono pochi e poco correlati: l’OLS è più semplice e leggibile.',
        'La relazione è fortemente non lineare: spline o modelli ad albero possono adattarsi meglio.',
        'Non puoi fare cross-validazione perché il campione è minuscolo o le osservazioni sono raggruppate.',
      ],
      reading: [
        'Un coefficiente è la variazione dell’esito per unità di quel predittore quando gli altri sono tenuti ai valori osservati attraverso le componenti; non è un effetto parziale nel senso della regressione.',
        'R² è la quota di varianza dell’esito spiegata nel campione; Q² è la stessa quantità in cross-validazione ed è la misura onesta del valore predittivo.',
        'Una componente spiega covarianza tra predittori ed esito, non solo varianza dei predittori; il R² cumulato mostra quante componenti servono.',
        'VIP sopra uno segnala predittori che contribuiscono più della media; è un criterio di selezione, non un test di significatività.',
        'Scegli il numero più piccolo di componenti dopo il quale Q² smette di migliorare: oltre si adatta soprattutto il rumore.',
      ],
      pitfalls: [
        'Scegliere le componenti solo con R², che cresce sempre e nasconde l’overfitting.',
        'Leggere un coefficiente PLS come pendenza parziale OLS o come effetto causale.',
        'Dimenticare di centrare i predittori, così la prima componente cattura soprattutto la media.',
        'Usare fold che fanno trapelare informazioni tra addestramento e test in dati raggruppati.',
        'Riportare il VIP come p-value o come prova che un predittore è importante.',
      ],
      charts: [
        'Osservati contro predetti, con la diagonale come riferimento e i punti colorati per dimensione del residuo.',
        'R² e Q² per numero di componenti, per scegliere il modello più piccolo utile.',
        'Punteggi VIP per predittore, con la linea a uno che separa gli importanti dai marginali.',
      ],
      glossary: [
        {
          term: 'Componente',
          definition:
            'Direzione latente nello spazio dei predittori scelta per massimizzare la covarianza con l’esito.',
        },
        {
          term: 'Caricamento',
          definition: 'Correlazione tra un predittore e una componente.',
        },
        {
          term: 'VIP',
          definition:
            'Importanza variabile in proiezione: quota della varianza dell’esito spiegata dalle componenti attribuita a ciascun predittore.',
        },
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (spline adattive)',
    summary:
      'Funzioni hinge lineari a tratti scelte automaticamente, con interazioni opzionali e potatura via GCV.',
    tutorial: {
      goal: 'Adattare una relazione non lineare flessibile tra un esito continuo e uno o più predittori senza fissare in anticipo la forma funzionale.',
      steps: [
        'Variabile dipendente: l’esito continuo.',
        'Predittori: le variabili continue il cui effetto può curvarsi o cambiare direzione.',
        'Grado massimo: uno per effetti additivi, due per ammettere il prodotto di due funzioni hinge.',
        'Termini massimi: un budget per le funzioni di base; parti da circa venti e lascia che la potatura riduca il modello.',
        'Penale e potatura: mantieni la penale predefinita a due e attiva la potatura GCV salvo che serva il modello forward completo.',
        'Esegui il modello e leggi i termini selezionati, i nodi, GCV e R², e l’importanza dei predittori.',
      ],
      expected:
        'Una tabella dei termini hinge con nodi e coefficienti, una tabella di adattamento con RSS, GCV, R² e R² aggiustato, una tabella di importanza e i grafici osservati-predetti e dell’effetto parziale del predittore principale.',
    },
    advanced: {
      assumptions: [
        'L’effetto è continuo e approssimabile con segmenti lineari a tratti.',
        'Le interazioni, quando attive, sono prodotti di al massimo due funzioni hinge.',
        'Gli errori sono indipendenti e con varianza roughly costante.',
        'Ci sono abbastanza osservazioni attorno a ogni nodo per stimare il cambio di pendenza.',
      ],
      whenToUse: [
        'La forma dell’effetto è ignota o cambia direzione lungo il range del predittore.',
        'Vuoi un’alternativa automatica alla scelta del grado di un polinomio.',
        'Devi selezionare molti predittori per effetti non lineari e interazioni.',
        'La previsione conta più di un singolo coefficiente interpretabile.',
      ],
      whenNotToUse: [
        'Serve un coefficiente per predittore con interpretazione causale chiara.',
        'Devi estrapolare molto oltre il range osservato: le funzioni hinge sono locali e fuori diventano lineari.',
        'Il campione è molto piccolo o i predittori sono tutti categorici.',
        'Un modello lineare o polinomiale semplice già si adatta ed è più facile da comunicare.',
      ],
      reading: [
        'Ogni termine hinge è un cambio di pendenza a un nodo: un coefficiente positivo aumenta la pendenza dopo il nodo, uno negativo la riduce.',
        'La GCV bilancia la somma dei quadrati residui con il numero di termini; più bassa è meglio ed è il criterio usato per potare.',
        'I termini selezionati sono i pezzi sopravvissuti alla potatura; un predittore senza termini non ha un contributo non lineare rilevabile.',
        'Il grafico dell’effetto parziale tiene gli altri predittori ai valori osservati e mostra la forma attribuita a un predittore.',
        'R² misura l’adattamento in campione; poiché i termini sono scelti sugli stessi dati, confronta i modelli con GCV o un campione esterno.',
      ],
      pitfalls: [
        'Costruire un modello forward enorme e dimenticare la potatura, così l’adattamento segue il rumore.',
        'Estrapolare oltre i nodi osservati, dove la forma a tratti è arbitraria.',
        'Leggere un coefficiente hinge come pendenza complessiva invece che come cambio locale.',
        'Ignorare le interazioni quando il grafico dei residui mostra ancora struttura.',
        'Confrontare GCV calcolate su numeri diversi di righe complete.',
      ],
      charts: [
        'Osservati contro predetti con la diagonale, per controllare la calibrazione e individuare outlier.',
        'Profilo dell’effetto parziale del primo predittore, con gli altri tenuti ai valori osservati.',
        'Importanza dei predittori, misurata dalla perdita di adattamento quando il predittore è rimosso dai termini selezionati.',
      ],
      glossary: [
        {
          term: 'Funzione hinge',
          definition:
            'Funzione di base del tipo (x − t)+ o (t − x)+, nulla da un lato del nodo t e lineare dall’altro.',
        },
        {
          term: 'Nodo',
          definition: 'Valore osservato di un predittore dove cambia la pendenza della relazione adattata.',
        },
        {
          term: 'GCV',
          definition:
            'Cross-validazione generalizzata: criterio di adattamento che penalizza il numero di parametri efficaci.',
        },
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Variabili strumentali (2SLS)',
    summary:
      'Un effetto consistente per un regressore endogeno, usando strumenti che lo influenzano ma non agiscono direttamente sull’esito.',
    tutorial: {
      goal: 'Stimare l’effetto di un predittore correlato con l’errore per variabili omesse, errore di misura o simultaneità.',
      steps: [
        'Esito: la variabile dipendente continua.',
        'Predittori endogeni: i regressori di cui vuoi l’effetto ma che non sono esogeni.',
        'Strumenti: variabili che predicono i regressori endogeni e agiscono sull’esito solo attraverso di essi.',
        'Predittori esogeni: controlli già validi come strumenti di sé stessi.',
        'Errori robusti: attiva HC1 quando la varianza dei residui non è costante.',
        'Esegui il modello e leggi i coefficienti strutturali, la F parziale di primo stadio, il test di Sargan e il test di Wu–Hausman.',
      ],
      expected:
        'Un’equazione strutturale con coefficienti, errori standard, t e intervalli, una tabella di primo stadio con gli strumenti esclusi e la F parziale, una tabella di diagnostica con Sargan e Wu–Hausman e i grafici osservati-predetti e OLS contro 2SLS.',
    },
    advanced: {
      assumptions: [
        'Rilevanza: gli strumenti esclusi predicono congiuntamente i regressori endogeni dopo i controlli esogeni.',
        'Esclusione: gli strumenti agiscono sull’esito solo attraverso i regressori endogeni, non direttamente né tramite variabili omesse.',
        'Indipendenza: gli strumenti non sono correlati con l’errore strutturale.',
        'Linearità e specificazione corretta dell’equazione strutturale e di quella di primo stadio.',
        'Con effetti eterogenei il 2SLS stima un effetto locale medio per i complier, non per tutti.',
      ],
      whenToUse: [
        'Variabili omesse non osservate ma correlate con un regressore.',
        'Errore di misura in un regressore chiave, quando è disponibile una seconda misura o uno strumento.',
        'Simultaneità, come in domanda e offerta o prezzo e quantità.',
        'Esperimenti naturali, disegni di incoraggiamento casuale e strumenti di politica.',
      ],
      whenNotToUse: [
        'Gli strumenti sono deboli: una F di primo stadio sotto circa dieci rende il 2SLS distorto e gli errori standard inaffidabili.',
        'L’ipotesi di esclusione non è credibile: la validità di uno strumento non si può verificare dai soli dati.',
        'Serve l’effetto medio della popolazione e gli effetti sono eterogenei.',
        'Non esiste uno strumento credibile: una stima IV con un cattivo strumento è peggio di un’OLS onesta con un’avvertenza.',
      ],
      reading: [
        'Il coefficiente 2SLS è l’effetto di una variazione unitaria del regressore endogeno per la parte di variazione guidata dagli strumenti.',
        'La F parziale di primo stadio verifica se gli strumenti esclusi aggiungono potere esplicativo; valori sotto dieci segnalano strumenti deboli.',
        'Sargan verifica le restrizioni di sovraidentificazione quando ci sono più strumenti che regressori endogeni; un p alto è compatibile con la validità, ma non è una prova.',
        'Wu–Hausman confronta OLS e 2SLS; un p basso suggerisce che il regressore è endogeno e che serve il 2SLS.',
        'Con un regressore endogeno e uno strumento il modello è esattamente identificato e Sargan non è calcolabile.',
      ],
      pitfalls: [
        'Usare uno strumento debole, che sposta il 2SLS verso l’OLS e gonfia gli errori standard.',
        'Includere l’esito o una variabile post-trattamento tra gli strumenti.',
        'Trattare un Sargan non significativo come prova che gli strumenti sono validi.',
        'Dimenticare che l’esclusione è un’ipotesi, non un test.',
        'Confrontare OLS e 2SLS senza riportare primo stadio e diagnostica.',
      ],
      charts: [
        'Osservati contro predetti dall’equazione strutturale.',
        'Coefficienti OLS e 2SLS per il regressore endogeno affiancati, con intervalli di confidenza.',
        'Residui contro predetti, per controllare struttura residua ed eteroschedasticità.',
      ],
      glossary: [
        {
          term: 'Regressore endogeno',
          definition:
            'Predittore correlato con l’errore strutturale, per cui l’OLS è distorto e inconsistente.',
        },
        {
          term: 'Strumento',
          definition:
            'Variabile che predice il regressore endogeno ma agisce sull’esito solo attraverso di esso.',
        },
        {
          term: 'LATE',
          definition:
            'Effetto medio locale per i complier, la cui esposizione è spostata dallo strumento.',
        },
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Modello panel (effetti fissi e casuali)',
    summary:
      'Effetti fissi within e effetti casuali GLS per osservazioni ripetute sulle stesse unità.',
    tutorial: {
      goal: 'Stimare l’effetto di predittori che variano nel tempo controllando per differenze stabili e non osservate tra le unità.',
      steps: [
        'Esito: la variabile dipendente continua misurata più volte.',
        'Predittori: i regressori che variano nel tempo.',
        'Entità: la colonna che identifica l’unità (persona, impresa, paese).',
        'Tempo: la colonna che ordina le osservazioni ripetute dentro ogni entità.',
        'Modello: effetti fissi, effetti casuali, oppure entrambi per confrontarli con il test di Hausman.',
        'Esegui il modello e leggi i coefficienti within, le componenti di varianza, il test di Hausman e gli effetti per entità.',
      ],
      expected:
        'Una tabella a effetti fissi con coefficienti within ed errori clusterizzati, una a effetti casuali con coefficienti GLS, le componenti di varianza per entità ed errore, il test di Hausman e i grafici osservati-predetti e degli effetti per entità.',
    },
    advanced: {
      assumptions: [
        'Gli effetti fissi ammettono correlazione tra effetto non osservato e predittori; gli effetti casuali richiedono che non ci sia.',
        'Esogeneità stretta: l’errore idiosincratico non è correlato con i predittori in nessun periodo.',
        'Nessuna variabile omessa che varia nel tempo e sia correlata con predittori ed esito.',
        'Gli identificatori di entità e tempo sono coerenti e la struttura panel è dichiarata correttamente.',
        'La correlazione seriale dentro l’entità è gestita con errori clusterizzati.',
      ],
      whenToUse: [
        'Dati longitudinali con osservazioni ripetute sulle stesse unità.',
        'Vuoi rimuovere tutto il confondimento stabile tra entità, osservato o no.',
        'Dati panel aggregati, come paesi o imprese negli anni.',
        'Devi confrontare la variazione within e between.',
      ],
      whenNotToUse: [
        'Il predittore di interesse è invariante nel tempo: gli effetti fissi lo assorbono completamente.',
        'Il test di Hausman rifiuta gli effetti casuali: la stima RE è inconsistente.',
        'Ci sono pochissime entità, quindi componenti di varianza ed errori clusterizzati non sono affidabili.',
        'Il modello è dinamico e include la variabile dipendente ritardata: lo stimatore within standard è distorto.',
      ],
      reading: [
        'Un coefficiente a effetti fissi è la variazione media dentro un’entità quando il predittore cambia, quindi identifica l’effetto dalla sola variazione within.',
        'Un coefficiente a effetti casuali è una combinazione pesata per precisione di variazione within e between, più efficiente quando l’ipotesi regge.',
        'Il test di Hausman confronta i due: un p basso dice che le stime FE e RE differiscono sistematicamente, a favore degli effetti fissi.',
        'La componente di varianza per entità misura quanto è persistente la variabilità tra unità; quella idiosincratica è il rumore within rimanente.',
        'R² within, between e overall descrivono parti diverse della variazione e vanno letti insieme.',
      ],
      pitfalls: [
        'Interpretare un coefficiente FE come confronto tra entità.',
        'Includere un predittore invariante nel tempo in un modello a effetti fissi e chiedersi perché sparisce.',
        'Usare effetti casuali quando Hausman li rifiuta.',
        'Ignorare la correlazione seriale e riportare errori standard non clusterizzati.',
        'Trattare un panel corto come se avesse molte entità.',
      ],
      charts: [
        'Osservati contro predetti, per controllare la calibrazione su tutto il panel.',
        'Grafico caterpillar degli effetti per entità, ordinati, per individuare unità anomale.',
        'Coefficienti a effetti fissi e casuali con intervalli di confidenza.',
      ],
      glossary: [
        {
          term: 'Stimatore within',
          definition:
            'Stimatore a effetti fissi ottenuto sottraendo la media di entità, che elimina gli effetti stabili non osservati.',
        },
        {
          term: 'Effetti casuali',
          definition:
            'Stimatore GLS che tratta l’effetto di entità come estrazione casuale non correlata con i predittori.',
        },
        {
          term: 'Test di Hausman',
          definition:
            'Confronto tra effetti fissi e casuali; il rifiuto favorisce il modello a effetti fissi.',
        },
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit e selezione di Heckman',
    summary:
      'Regressione censurata per esiti limitati e correzione a due passi per la selezione del campione.',
    tutorial: {
      goal: 'Stimare l’effetto dei predittori quando l’esito è osservato solo sopra o sotto una soglia, oppure solo per un sottogruppo selezionato.',
      steps: [
        'Modello: Tobit per un esito censurato, Heckman per un campione selezionato.',
        'Esito: la variabile censurata per Tobit, oppure l’esito osservato per Heckman.',
        'Predittori: i regressori dell’equazione dell’esito.',
        'Limiti di censura: la soglia inferiore e, se serve, quella superiore per Tobit.',
        'Indicatore di selezione e predittori della selezione: la variabile 0/1 di inclusione e le variabili che spiegano l’inclusione per Heckman; includi almeno una variabile che non sta nell’equazione dell’esito.',
        'Esegui il modello e leggi coefficienti, sigma, rho e il coefficiente del rapporto di Mills inverso.',
      ],
      expected:
        'Per Tobit, coefficienti sulla scala latente con errori standard, sigma, log-verosimiglianza e AIC. Per Heckman, equazione dell’esito, equazione di selezione, sigma, rho, lambda, rapporto di Mills inverso e test di Wald della correzione. I grafici mostrano osservati-predetti e il pattern di censura o selezione.',
    },
    advanced: {
      assumptions: [
        'Tobit: modello lineare latente con errori normali e omoschedastici e soglia di censura nota.',
        'Heckman: equazione di selezione probit ed errori normali bivariati tra selezione ed esito.',
        'Restrizione di esclusione: almeno una variabile influenza la selezione ma non l’esito direttamente.',
        'Forma funzionale corretta in entrambe le equazioni e osservazioni indipendenti.',
        'Il meccanismo di censura o selezione non dipende dall’esito stesso.',
      ],
      whenToUse: [
        'Salari osservati solo per chi lavora, con la non partecipazione come meccanismo di selezione.',
        'Spese o ore con un limite inferiore significativo e censura reale.',
        'Limiti di rilevazione nelle misure di laboratorio.',
        'Selezione su variabili non osservabili che il matching sui covariati non può gestire.',
      ],
      whenNotToUse: [
        'Gli zeri sono esiti veri e non valori censurati: un modello a due parti o hurdle è più adatto.',
        'Si ritiene che la selezione dipenda solo da covariati osservati: il matching per propensione è più trasparente.',
        'Non c’è restrizione di esclusione: Heckman è identificato solo dalla non linearità del rapporto di Mills ed è fragile.',
        'Gli errori sono fortemente non normali o eteroschedastici: Tobit e Heckman sono inconsistenti.',
      ],
      reading: [
        'I coefficienti Tobit sono effetti sull’esito latente non censurato, non sulla media osservata; l’effetto sulla media osservata si riduce con la probabilità di non essere censurati.',
        'Sigma è la deviazione standard dell’errore latente; un sigma grande indica censura sostanziale.',
        'In Heckman rho è la correlazione tra gli errori di selezione ed esito; un rho non nullo indica che la selezione conta.',
        'Lambda è il coefficiente del rapporto di Mills inverso nell’equazione dell’esito; è il termine di correzione, non un effetto causale.',
        'L’equazione di selezione dovrebbe contenere uno strumento che predice l’inclusione ma può essere escluso dall’esito; senza di esso l’identificazione poggia solo sulla forma funzionale.',
      ],
      pitfalls: [
        'Leggere i coefficienti Tobit come effetti sull’esito osservato invece che su quello latente.',
        'Usare Heckman senza restrizione di esclusione e trattare il risultato come robusto.',
        'Usare l’OLS sul campione selezionato ignorando il bias di selezione.',
        'Confondere censura e troncamento: nel campione censurato le unità oltre la soglia sono osservate come zeri, in quello troncato sono assenti.',
        'Credere che Heckman a due passi sia massima verosimiglianza: è consistente ma meno efficiente e gli errori standard richiedono la correzione.',
      ],
      charts: [
        'Osservati contro predetti sulla scala osservata.',
        'Tobit: media latente contro esito osservato, con la linea di censura.',
        'Heckman: distribuzione del rapporto di Mills inverso e probabilità di selezione per esito.',
      ],
      glossary: [
        {
          term: 'Censura',
          definition:
            'L’esito è registrato a un limite invece che al suo valore latente, come un salario zero per chi non partecipa.',
        },
        {
          term: 'Troncamento',
          definition:
            'Le unità fuori dal limite non sono osservate affatto, a differenza della censura dove restano nel campione.',
        },
        {
          term: 'Rapporto di Mills inverso',
          definition:
            'Rapporto tra densità normale e funzione di sopravvivenza normale all’indice di selezione; corregge l’equazione dell’esito.',
        },
        {
          term: 'Restrizione di esclusione',
          definition:
            'Variabile che influenza la selezione ma non l’esito direttamente, e che identifica il modello di selezione.',
        },
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Analisi di mediazione',
    summary:
      'Effetti indiretti, diretti e totali di un predittore attraverso un mediatore, con Sobel e bootstrap.',
    tutorial: {
      goal: 'Quantificare quanta parte dell’effetto di un predittore sull’esito passa attraverso una variabile intermedia.',
      steps: [
        'Esito: la risposta finale continua.',
        'Predittore: l’esposizione o variabile indipendente.',
        'Mediatore: la variabile intermedia che si assume stia sul percorso.',
        'Covariati: confondenti opzionali delle relazioni predittore-mediatore, predittore-esito e mediatore-esito.',
        'Replicazioni bootstrap: 1000 è un punto di partenza ragionevole; zero lascia solo gli intervalli Sobel e delta.',
        'Esegui il modello e leggi i percorsi a, b e c′, gli effetti indiretto e totale, la proporzione mediata e l’intervallo bootstrap.',
      ],
      expected:
        'Una tabella dei percorsi con i coefficienti a, b e c′, una tabella degli effetti totale, diretto e indiretto con errori standard e intervalli, la proporzione mediata e un grafico delle dimensioni degli effetti e della distribuzione bootstrap dell’effetto indiretto.',
    },
    advanced: {
      assumptions: [
        'Nessun confondimento non osservato delle relazioni predittore-esito, predittore-mediatore e mediatore-esito.',
        'Ordine temporale: il predittore precede il mediatore, che precede l’esito.',
        'I modelli sono lineari e specificati correttamente, senza interazione predittore × mediatore non modellata.',
        'Le osservazioni sono indipendenti, oppure la dipendenza è gestita dal disegno.',
        'Il mediatore è misurato senza errore sostanziale.',
      ],
      whenToUse: [
        'Domande sul meccanismo: non solo se X influenza Y, ma attraverso quale percorso.',
        'Valutazione di processo e percorsi clinici o psicologici.',
        'Hai un ordine temporale credibile e hai misurato i principali confondenti.',
        'L’effetto indiretto è la quantità di interesse, non un singolo coefficiente di regressione.',
      ],
      whenNotToUse: [
        'I dati sono trasversali e l’ordine temporale è solo assunto: parla di associazione, non di mediazione.',
        'Esiste un confondente mediatore-esito non misurato e influenzato dall’esposizione.',
        'Predittore e mediatore interagiscono: serve un modello di mediazione moderata.',
        'L’effetto totale è vicino a zero, il che rende la proporzione mediata instabile e non interpretabile.',
      ],
      reading: [
        'L’effetto indiretto è a × b; l’effetto totale è c′ + a × b; l’effetto diretto è c′.',
        'La proporzione mediata è l’effetto indiretto diviso quello totale; è instabile quando il totale è piccolo e può uscire dall’intervallo 0–1.',
        'L’errore standard di Sobel usa il metodo delta ed è conservativo; l’intervallo bootstrap percentile è di solito preferito.',
        'Un intervallo bootstrap che esclude zero è evidenza di un effetto indiretto; non è una probabilità a posteriori bayesiana.',
        'Con covariati i percorsi sono aggiustati per essi, quindi gli effetti sono condizionali ai valori dei covariati.',
      ],
      pitfalls: [
        'Chiamare mediazione un’associazione trasversale senza ordine temporale credibile.',
        'Ignorare il confondimento della relazione mediatore-esito.',
        'Riportare la proporzione mediata quando l’effetto totale è vicino a zero.',
        'Usare il test di Sobel come unica inferenza quando l’effetto indiretto è asimmetrico.',
        'Dimenticare di fissare il seme del bootstrap, così l’intervallo cambia a ogni esecuzione.',
      ],
      charts: [
        'Dimensioni degli effetti diretto, indiretto e totale, con intervalli di confidenza.',
        'Distribuzione bootstrap dell’effetto indiretto, con l’intervallo percentile e lo zero evidenziato.',
        'Coefficienti dei percorsi a, b e c′, per leggere il meccanismo a colpo d’occhio.',
      ],
      glossary: [
        {
          term: 'Effetto indiretto',
          definition:
            'Parte dell’effetto del predittore che passa attraverso il mediatore, stimata come a × b.',
        },
        {
          term: 'Effetto diretto',
          definition:
            'Parte dell’effetto del predittore che non passa attraverso il mediatore, stimata come c′.',
        },
        {
          term: 'Bootstrap percentile',
          definition:
            'Intervallo dai quantili empirici della distribuzione bootstrap dell’effetto indiretto.',
        },
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Propensity score',
    summary:
      'Matching e ponderazione per probabilità inversa per stimare effetti del trattamento in dati osservazionali.',
    tutorial: {
      goal: 'Confrontare un gruppo trattato e uno non trattato quando il trattamento non è casuale ma i confondenti rilevanti sono stati misurati.',
      steps: [
        'Trattamento: l’indicatore 0/1 di ricevere il trattamento.',
        'Esito: la risposta continua.',
        'Covariati: le variabili pre-trattamento che predicono sia il trattamento sia l’esito.',
        'Metodo: matching del vicino più prossimo oppure ponderazione per probabilità inversa.',
        'Caliper e rapporto: per il matching, la distanza massima in deviazioni standard del punteggio logit e il numero di controlli per unità trattata.',
        'Esegui il modello e leggi il modello di propensione, la tabella di bilanciamento prima e dopo, l’ATT e il numero di osservazioni appaiate o efficaci.',
      ],
      expected:
        'Una tabella del modello di propensione, una tabella di bilanciamento con differenze standardizzate prima e dopo matching o ponderazione, l’ATT con errore standard e intervallo, il numero di unità appaiate o la dimensione efficace del campione e i grafici di sovrapposizione dei punteggi e del miglioramento del bilanciamento.',
    },
    advanced: {
      assumptions: [
        'Scambiabilità condizionata: il trattamento è indipendente dagli esiti potenziali dati i covariati misurati.',
        'Positività: ogni unità trattata ha probabilità positiva di non essere trattata e viceversa, quindi i gruppi si sovrappongono.',
        'Il modello di propensione è specificato correttamente e include solo covariati pre-trattamento.',
        'Stable unit treatment value: il trattamento di un’unità non influisce sull’esito di un’altra.',
        'Il modello dell’esito, quando usato per l’effetto, è corretto oppure il matching è bilanciato.',
      ],
      whenToUse: [
        'Studi osservazionali in cui l’assegnazione dipende da confondenti misurati.',
        'Valutazione di programmi e ricerca di efficacia comparativa.',
        'Vuoi rendere comparabili i gruppi trattato e non trattato prima di stimare l’effetto.',
        'L’estimando di interesse è l’effetto sui trattati (ATT).',
      ],
      whenNotToUse: [
        'Il confondimento non misurato è plausibile: il matching non lo rimuove.',
        'I gruppi hanno poca sovrapposizione, quindi molte unità trattate non hanno controlli comparabili.',
        'È disponibile uno strumento credibile: le variabili strumentali mirano a un effetto diverso, spesso più credibile.',
        'Il trattamento varia nel tempo o i covariati sono misurati dopo il trattamento.',
      ],
      reading: [
        'L’ATT è l’effetto medio per le unità trattate, non per tutta la popolazione; l’ATE richiede di pesare l’intero campione.',
        'Una differenza standardizzata delle medie sotto 0,1 dopo l’aggiustamento è la regola pratica per un buon bilanciamento.',
        'Il caliper scarta le unità trattate senza un controllo vicino; un caliper più piccolo migliora il bilanciamento ma cambia l’estimando e riduce il campione.',
        'La ponderazione per probabilità inversa dà peso 1/e ai trattati e 1/(1−e) ai controlli; pesi molto grandi segnalano scarsa sovrapposizione.',
        'Riporta sempre il bilanciamento prima e dopo l’aggiustamento, non solo l’effetto del trattamento.',
      ],
      pitfalls: [
        'Giudicare il bilanciamento con test di significatività invece che con differenze standardizzate.',
        'Ignorare il supporto comune ed estrapolare a unità trattate senza controlli comparabili.',
        'Includere variabili post-trattamento o l’esito nel modello di propensione.',
        'Riportare l’ATT come se fosse l’effetto medio per tutti.',
        'Usare il matching senza controllare il bilanciamento del campione appaiato.',
      ],
      charts: [
        'Sovrapposizione dei punteggi di propensione tra trattati e controlli, per controllare il supporto comune.',
        'Love plot delle differenze standardizzate delle medie prima e dopo l’aggiustamento.',
        'ATT con intervallo di confidenza e numero di osservazioni appaiate o efficaci.',
      ],
      glossary: [
        {
          term: 'Propensity score',
          definition:
            'Probabilità di ricevere il trattamento dati i covariati misurati.',
        },
        {
          term: 'ATT',
          definition:
            'Effetto medio del trattamento sui trattati: l’effetto per le unità che hanno effettivamente ricevuto il trattamento.',
        },
        {
          term: 'Differenza standardizzata delle medie',
          definition:
            'Differenza tra medie dei gruppi divisa per una deviazione standard comune; misura di bilanciamento senza scala.',
        },
        {
          term: 'Caliper',
          definition:
            'Distanza massima consentita tra un’unità trattata e il suo controllo sul punteggio di propensione.',
        },
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
