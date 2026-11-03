import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures (compact it edition). */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: "competing", title: "Rischi competitivi", summary: "Stima l’incidenza cumulativa di una causa mentre le altre competono per lo stesso tempo.",
    goal: "Misurare quanto spesso compare una causa specifica quando i soggetti possono uscire per altre cause.",
    steps: ["Scegli tempo ed evento con i codici delle cause (0 = censurato).", "Indica il codice della causa di interesse.", "Seleziona le covariati ed esegui il modello di Fine–Gray.", "Leggi la curva di incidenza cumulativa e gli hazard ratio di sottodistribuzione."],
    expected: "Sintesi di eventi e cause, coefficienti di Fine–Gray con sHR e curva di incidenza cumulativa al profilo medio.",
    whenToUse: ["Quando un evento può avere più cause mutuamente esclusive e non indipendenti.", "Quando vuoi la probabilità di una causa nel tempo, non il rischio di un singolo tipo di evento."],
    assumptions: ["Le cause sono esaustive e mutuamente esclusive; la censura è non informativa.", "Gli hazard ratio di sottodistribuzione sono costanti nel tempo."],
    reading: ["La CIF è la probabilità di avere la causa scelta entro t convivendo con le altre cause.", "Kaplan–Meier tratta le cause competitive come censure e non stima la CIF."],
    pitfalls: ["Leggere la CIF come 1 − sopravvivenza della causa scelta.", "Scegliere la causa dopo aver visto i risultati."],
    charts: ["Curva di incidenza cumulativa per la causa scelta.", "Forest plot degli hazard ratio di sottodistribuzione."],
  }),
  procedureTopic({
    id: "recurrent", title: "Eventi ricorrenti", summary: "Modella eventi ripetuti per soggetto con Andersen–Gill o Wei–Lin–Weissfeld ed errori robusti.",
    goal: "Stimare l’effetto delle covariati sul tasso di eventi ripetuti senza trattare come indipendenti gli eventi dello stesso soggetto.",
    steps: ["Seleziona id soggetto e colonne start, stop ed evento in formato start–stop.", "Scegli Andersen–Gill per il processo complessivo o Wei–Lin–Weissfeld per strati per evento.", "Aggiungi le covariati ed esegui.", "Leggi gli hazard ratio e gli intervalli robusti."],
    expected: "Sintesi di soggetti ed episodi, hazard ratio con errori standard raggruppati e test globali.",
    whenToUse: ["Quando lo stesso soggetto può avere più eventi: ricadute, guasti, ricoveri.", "Quando gli eventi di un soggetto sono plausibilmente correlati."],
    assumptions: ["Censura non informativa e intervalli start–stop coerenti.", "AG assume un effetto comune tra eventi; WLW una baseline per numero di evento."],
    reading: ["AG mantiene il soggetto nel rischio dopo ogni evento e usa il tempo di calendario.", "WLW usa il tempo dal precedente evento e uno strato per numero di evento."],
    pitfalls: ["Trattare ogni riga come soggetto indipendente.", "Confondere tempo di calendario e tempo tra eventi."],
    charts: ["Forest plot degli hazard ratio robusti."],
  }),
  procedureTopic({
    id: "alt", title: "Test di vita accelerata", summary: "Lega la durata a una variabile di stress con un AFT di Weibull e riporta il fattore di accelerazione.",
    goal: "Stimare la vita allo stress d’uso da prove condotte a stress più alti.",
    steps: ["Seleziona tempo, evento e colonna dello stress.", "Scegli la relazione: Arrhenius (1/stress), potenza inversa (log stress) o esponenziale (stress).", "Inserisci lo stress d’uso e le eventuali covariati.", "Esegui e leggi il fattore di accelerazione e i time ratio."],
    expected: "Sintesi AFT di Weibull con fattore di accelerazione, time ratio e grafico a barre del fattore.",
    whenToUse: ["Quando i componenti sono provati a stress superiori alla condizione operativa.", "Quando si assume che il meccanismo di guasto non cambi con lo stress."],
    assumptions: ["La distribuzione di Weibull descrive i tempi e il meccanismo non cambia.", "Lo stress è misurato senza errore e i livelli sono ben separati."],
    reading: ["Il fattore confronta la vita allo stress d’uso con quella al più basso stress osservato.", "Il time ratio si riferisce a un’unità della variabile trasformata, non dello stress grezzo."],
    pitfalls: ["Estrapolare molto oltre l’intervallo provato senza giustificazione fisica.", "Leggere il time ratio come se fosse sullo stress grezzo."],
    charts: ["Forest plot dei time ratio.", "Grafico a barre del fattore di accelerazione."],
  }),
  procedureTopic({
    id: "reliability", title: "Crescita dell’affidabilità e RBD", summary: "Segui una curva di crescita Crow–AMSAA o combina affidabilità dei componenti in un diagramma serie/parallelo.",
    goal: "Capire se un sistema riparabile sta migliorando o calcolare l’affidabilità di un sistema dai componenti.",
    steps: ["Scegli crescita per i guasti cumulati nel tempo, oppure RBD per combinare le affidabilità.", "Per la crescita seleziona tempo e guasti cumulati ed esegui.", "Per l’RBD inserisci l’affidabilità di ogni componente, raggruppando in parallelo quelle dello stesso stadio.", "Leggi i parametri o l’affidabilità di sistema e individua lo stadio più debole."],
    expected: "Per la crescita: β, λ, MTBF cumulativo e istantaneo e grafico osservati/attesi. Per l’RBD: affidabilità per stadio e di sistema.",
    whenToUse: ["Quando un sistema riparabile viene migliorato e vuoi verificare che i guasti diminuiscano.", "Quando l’affidabilità di sistema va derivata da quella dei componenti."],
    assumptions: ["Crescita: processo di Poisson non omogeneo con intensità a legge di potenza e correzioni cumulative.", "RBD: componenti indipendenti e affidabilità note senza incertezza."],
    reading: ["β < 1 indica un tasso di guasto decrescente; β = 1 è un processo Poisson omogeneo.", "In serie l’affidabilità è il prodotto degli stadi; in parallelo ogni stadio vale 1 − Π(1 − r)."],
    pitfalls: ["Leggere la curva di crescita come previsione oltre il tempo osservato.", "Dimenticare che basta uno stadio in serie per fermare il sistema."],
    charts: ["Guasti cumulati osservati e attesi (crescita).", "Affidabilità per stadio (RBD)."],
  }),
];
