import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Procedure della wave 7: VAR/VECM, GARCH e modelli state-space. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Modella più serie temporali insieme, verifica la causalità di Granger e stima la correzione dell’errore.',
    goal: 'Descrivere come ogni serie dipende dal proprio passato e da quello delle altre, separando relazioni di lungo periodo e dinamica di breve periodo.',
    steps: [
      'Seleziona almeno due serie numeriche nell’ordine temporale.',
      'Lascia i ritardi a 0 per la scelta automatica con l’AIC, oppure inserisci un ordine fisso.',
      'Scegli VAR per serie stazionarie o VECM per serie I(1) cointegrate.',
      'Leggi i coefficienti, i test di Granger, le risposte impulsive e la scomposizione della varianza.',
    ],
    expected:
      'Una sintesi del VAR con stabilità, tabella dei coefficienti, test di Granger, risposte impulsive e scomposizione della varianza; il VECM aggiunge il vettore di cointegrazione e le velocità di aggiustamento.',
    whenToUse: [
      'Quando più serie evolvono insieme e vuoi modellarne la dinamica congiunta.',
      'Quando devi verificare se il passato di una serie aiuta a prevederne un’altra.',
      'Quando sospetti una relazione stabile di lungo periodo tra serie non stazionarie.',
    ],
    assumptions: [
      'Le serie sono stazionarie o differenziate fino alla stazionarietà; il VECM richiede serie I(1) con una relazione di cointegrazione.',
      'I residui non hanno autocorrelazione dopo l’ordine di ritardi scelto.',
      'Le osservazioni sono sufficienti rispetto al numero di parametri.',
    ],
    whenNotToUse: [
      'Con serie molto corte: il numero di parametri cresce rapidamente con ritardi e serie.',
      'Quando la domanda riguarda un solo esito: un ARIMA o una regressione univariata è più semplice.',
      'Quando dominano cambi strutturali non modellati.',
    ],
    reading: [
      'Un VAR stabile ha tutte le radici caratteristiche fuori dal cerchio unitario: le risposte impulsive si esauriscono.',
      'Un test di Granger significativo indica che il passato della causa migliora la previsione dell’effetto, non che lo causi.',
      'Le risposte impulsive dipendono dall’ordine di Cholesky: la prima serie reagisce solo al proprio shock contemporaneo.',
      'In un VECM un α negativo e significativo indica che la serie corregge gli scostamenti dalla relazione di lungo periodo.',
    ],
    pitfalls: [
      'Stimare un VAR su livelli con trend senza verificare la stazionarietà.',
      'Leggere la causalità di Granger come causalità strutturale.',
      'Interpretare le risposte impulsive senza dichiarare l’ordine di identificazione.',
      'Usare Engle–Granger quando possono esistere più relazioni di cointegrazione.',
    ],
    charts: ['Risposte impulsive per shock e risposta.', 'Quote della varianza dell’errore all’orizzonte finale.'],
    glossary: [
      { term: 'VAR', definition: 'Sistema di autoregressioni, una equazione per serie, con i ritardi di tutte le serie come regressori.' },
      { term: 'Cointegrazione', definition: 'Combinazione lineare stazionaria di serie non stazionarie.' },
      { term: 'Risposta impulsiva', definition: 'Variazione delle serie dopo uno shock di una deviazione standard.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Stima la volatilità condizionale che si addensa nel tempo con un modello GARCH(1,1).',
    goal: 'Separare il livello di una serie dalla volatilità che cambia nel tempo e prevedere la scala delle oscillazioni future.',
    steps: [
      'Seleziona la serie dei rendimenti o delle variazioni nell’ordine temporale.',
      'Imposta l’orizzonte di previsione.',
      'Esegui il modello e leggi persistenza, varianza di lungo periodo ed emivita.',
      'Controlla il test di Ljung–Box sui residui standardizzati.',
    ],
    expected:
      'Sintesi del modello, tabella dei coefficienti con errori standard, diagnostica dei residui e previsioni della varianza condizionale.',
    whenToUse: [
      'Quando l’ampiezza delle oscillazioni cambia nel tempo e si addensa in periodi calmi e turbolenti.',
      'Quando serve una previsione di volatilità o una scala variabile per misure di rischio.',
      'Quando i residui di un modello per la media mostrano ancora autocorrelazione nei quadrati.',
    ],
    assumptions: [
      'La varianza condizionale segue la ricorsione GARCH con ω, α, β positivi e α + β < 1 per la stazionarietà.',
      'Le innovazioni standardizzate sono approssimativamente incorrelate; la normalità è comoda ma non necessaria per la consistenza.',
      'La media è costante o già rimossa.',
    ],
    whenNotToUse: [
      'Quando la volatilità reagisce diversamente a shock positivi e negativi: serve un modello asimmetrico.',
      'Quando la serie ha trend o stagionalità deterministica nella media.',
      'Con meno di una trentina di osservazioni.',
    ],
    reading: [
      'α misura la reazione all’ultima innovazione; β la memoria della volatilità passata.',
      'Una persistenza vicina a 1 indica che gli shock di volatilità durano a lungo; l’emivita è il numero di periodi per dimezzare uno shock.',
      'La varianza di lungo periodo è ω/(1 − α − β) quando α + β < 1.',
      'La DS condizionale è la scala attesa delle oscillazioni, non un intervallo di confidenza sulla media.',
    ],
    pitfalls: [
      'Confondere le previsioni di varianza con previsioni di prezzo.',
      'Ignorare l’autocorrelazione residua nei quadrati.',
      'Riportare l’emivita quando α + β ≥ 1, dove non è definita.',
      'Trattare il modello come descrizione completa di code e asimmetrie.',
    ],
    charts: ['Serie con la deviazione standard condizionale.', 'Autocorrelazione dei residui standardizzati.'],
    glossary: [
      { term: 'Effetto ARCH', definition: 'Dipendenza della varianza corrente dalle innovazioni quadrate recenti.' },
      { term: 'Persistenza', definition: 'α + β nel GARCH(1,1): la velocità con cui gli shock di volatilità si dissolvono.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'State-space e Markov switching',
    summary: 'Stima un livello o un trend latente con il filtro di Kalman, oppure due regimi con un AR(1) a Markov switching.',
    goal: 'Separare segnale e rumore e descrivere serie che alternano fasi diverse.',
    steps: [
      'Scegli il modello locale di livello/trend oppure il Markov switching a due regimi.',
      'Seleziona la serie e l’orizzonte di previsione.',
      'Per il modello locale decidi se includere il trend stocastico.',
      'Leggi gli stati smussati e la previsione, oppure le probabilità dei regimi e la matrice di transizione.',
    ],
    expected:
      'Per il modello locale: stime delle varianze, stati filtrati e smussati, previsioni con intervalli. Per il Markov switching: medie e varianze dei regimi, matrice di transizione, probabilità smussate e previsioni.',
    whenToUse: [
      'Quando la serie osservata è una misura rumorosa di una quantità latente più liscia.',
      'Quando la serie sembra alternare fasi calme e turbolente, o basse e alte.',
      'Quando serve un’interpolazione fondata di storia rumorosa o mancante.',
    ],
    assumptions: [
      'Il modello locale è lineare e gaussiano con innovazioni indipendenti.',
      'Il modello di Markov ha due regimi, probabilità di transizione costanti e una media AR(1) dentro ciascun regime.',
      'Il numero di regimi è noto e le etichette sono identificate dai valori iniziali.',
    ],
    whenNotToUse: [
      'Quando i cambi di regime dipendono da covariariate osservate: un modello a soglia o con interazioni è più chiaro.',
      'Quando la serie è molto corta: varianze ed etichette dei regimi sono instabili.',
      'Quando una semplice regressione sul trend risponde alla domanda.',
    ],
    reading: [
      'Lo stato filtrato usa solo il passato; lo stato smussato usa tutta la serie.',
      'Nel modello locale una varianza di osservazione grande indica che gran parte della variabilità è rumore di misura.',
      'Nel modello di Markov la durata attesa di un regime è 1/(1 − p).',
      'La previsione media media i regimi con le probabilità di transizione.',
    ],
    pitfalls: [
      'Leggere lo stato filtrato come se usasse osservazioni future.',
      'Imporre un trend stocastico quando il modello a solo livello ha AIC/BIC migliori.',
      'Interpretare le etichette dei regimi senza verificarne il senso sostantivo.',
      'Ignorare l’incertezza sulla classificazione dei regimi.',
    ],
    charts: ['Serie osservata, livello smussato e previsione.', 'Probabilità smussata del secondo regime.'],
    glossary: [
      { term: 'Filtro di Kalman', definition: 'Aggiornamento ricorsivo di uno stato latente da osservazioni rumorose.' },
      { term: 'Smoother', definition: 'Stima dello stato latente che usa tutta la serie, passato e futuro.' },
      { term: 'Markov switching', definition: 'Modello in cui i parametri cambiano secondo una catena di Markov nascosta.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
