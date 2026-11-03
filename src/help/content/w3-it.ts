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
];
