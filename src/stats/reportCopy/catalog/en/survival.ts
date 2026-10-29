/** English prose of the survival report and its tables. */
export const survivalCopy: Record<string, string> = {
  'Le curve dei gruppi differiscono (log-rank p = {s1}).':
    'The curves of the groups differ (log-rank p = {s1}).',
  'Nessuna differenza tra le curve dei gruppi (log-rank p = {s1}).':
    'No difference between the curves of the groups (log-rank p = {s1}).',
  'Mediana di sopravvivenza: {s1} ({s2} eventi su {s3}).':
    'Median survival: {s1} ({s2} events out of {s3}).',
  'La mediana non viene raggiunta: {s1} eventi su {s2}.':
    'The median is not reached: {s1} events out of {s2}.',
  'L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.':
    'Survival analysis estimates how long it takes before an event (recovery, failure, dropout), allowing for censored observations, that is, for those who have not yet had the event when the study ends.',
  'Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.':
    'Here there are {s1} observations, {s2} events and {s3} censored: treating the censored as “no event” or excluding them would give biased estimates, while Kaplan–Meier keeps them at risk as long as they are observed.',
  'La curva e la mediana':
    'The curve and the median',
  'La mediana di sopravvivenza è {s1}: a quel tempo la curva scende sotto 0,50.{s2}':
    'The median survival is {s1}: at that time the curve falls below 0.50.{s2}',
  ' Intervallo {s1} – {s2}.':
    ' Interval {s1} – {s2}.',
  'La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).':
    'The curve does not fall below 0.50 within the last observed time: the median is not reached (it is not “infinite”, simply not estimable with this follow-up).',
  'All’ultimo tempo osservato la sopravvivenza stimata è {s1} ({s2}%).':
    'At the last observed time the estimated survival is {s1} ({s2}%).',
  'La sopravvivenza finale non è calcolabile.':
    'The final survival cannot be computed.',
  'RMST = {s1}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.':
    'RMST = {s1}: mean area under the curve up to the last time, that is, the average time spent without an event within the observed horizon.',
  'RMST non calcolabile.':
    'RMST not computable.',
  'Confronto tra gruppi':
    'Comparison between groups',
  'Confronto tra gruppi non richiesto':
    'Comparison between groups not requested',
  'Gruppi: {s1}. Il log-rank dà χ² = {s2} con p = {s3}: {s4}':
    'Groups: {s1}. The log-rank gives χ² = {s2} with p = {s3}: {s4}',
  'le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.':
    'the curves are not compatible with the hypothesis of equal survival.',
  'non c’è evidenza che le curve differiscano.':
    'there is no evidence that the curves differ.',
  'Hazard ratio = {s1} ({s2} – {s3}): {s4}':
    'Hazard ratio = {s1} ({s2} – {s3}): {s4}',
  'HR CI low':
    'HR CI low',
  'HR CI high':
    'HR CI high',
  'il primo gruppo ha un rischio di evento maggiore.':
    'the first group has a higher risk of the event.',
  'il primo gruppo ha un rischio di evento minore.':
    'the first group has a lower risk of the event.',
  'Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.':
    'With more than two groups the hazard ratio is not reported: use Cox regression for an adjusted HR.',
  'Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.':
    'Select a group variable to compare two or more curves with the log-rank.',
  'Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.':
    'Non-informative censoring: those who leave the study must not have a risk different from those who stay.',
  'Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.':
    'Time zero must be defined consistently for all observations.',
  'La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.':
    'The curve becomes imprecise in the tails, where few observations remain at risk: look at the “at risk” column.',
  'Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.':
    'The log-rank gives the same weight to all times; if the risk changes over time (crossing curves) it can miss real differences.',
  'Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.':
    'With few events per group the test has little power and the HR is unstable.',
  'Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).':
    'The log-rank does not adjust for covariates: for adjusted hazard ratios or for more than two groups use the Cox (PH) sheet.',
  'Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.':
    'Parametric models (Weibull, exponential) with censored data are not estimated.',
  'Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.':
    'The log-rank assumes proportional hazards: crossing curves need other tests.',
  'L’hazard ratio è riportato solo per due gruppi.':
    'The hazard ratio is reported only for two groups.',
  'I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).':
    'Censoring times coinciding with an event are treated as events at the same time (no tie correction beyond the standard handling of the risk set).',
  'Sintesi di sopravvivenza':
    'Survival summary',
  'N = {s1} · eventi = {s2} · censurati = {s3}':
    'N = {s1} · events = {s2} · censored = {s3}',
  'RMST':
    'RMST',
  'La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.':
    'The median is the time at which the curve falls to 0.50: if it is not reached it remains not computable.',
  'Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.':
    'The CI of the median comes from the log-log intervals of the curve; RMST is the area under the curve up to the last observed time.',
  'Curva di Kaplan–Meier':
    'Kaplan–Meier curve',
  'CI {s1}% log-log · stima prodotto-limite':
    'CI {s1}% log-log · product-limit estimate',
  'S(t)':
    'S(t)',
  'S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.':
    'S(t) is the estimated probability of still being “alive” (event-free) at time t.',
  'I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.':
    'The censored leave the risk set without lowering the curve: this is why a survival analysis is needed instead of an average.',
  'Log-rank test':
    'Log-rank test',
  'Hazard ratio (Mantel–Haenszel)':
    'Hazard ratio (Mantel–Haenszel)',
  'Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.':
    'The log-rank compares the number of events observed in each group with those expected if the curves were equal.',
  'L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.':
    'The hazard ratio is estimated with the Mantel–Haenszel approach: HR > 1 indicates a higher risk in the first group.',
  'Life table (tutta la coorte)':
    'Life table (whole cohort)',
  '{s1} intervalli di uguale ampiezza':
    '{s1} intervals of equal width',
  'Da':
    'From',
  'Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.':
    'In the life table the censored within the interval contribute half of their time at risk.',
};
