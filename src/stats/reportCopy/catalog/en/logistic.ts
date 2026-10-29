/** English prose of the logistic report and its tables. */
export const logisticCopy: Record<string, string> = {
  'p del modello':
    'model p',
  '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.':
    '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: one more unit {s6} the chances of the outcome by about {s7}%.',
  'I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.':
    'The data separate the outcomes almost perfectly: the estimates are not reliable.',
  'Il modello è significativo (LR p = {s1}) e {s2} sul risultato.':
    'The model is significant (LR p = {s1}) and {s2} on the result.',
  '1 predittore pesa':
    '1 predictor weighs',
  '{s1} predittori pesano':
    '{s1} predictors weigh',
  'Il modello non è significativo (LR p = {s1}).':
    'The model is not significant (LR p = {s1}).',
  'Modello informativo':
    'Informative model',
  'Modello debole':
    'Weak model',
  'La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.':
    'Logistic regression models the probability of a binary outcome (yes/no) as a function of one or more predictors, instead of modelling the mean value directly as linear regression does.',
  'L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.':
    'The null hypothesis of the LR test is “no predictor adds information beyond the intercept alone”; each coefficient instead answers the question “does this predictor matter, net of the others?”.',
  'Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.':
    'The model contains {s1} predictor(s) on {s2} observations and {s3} events.',
  'Eventi (Y = 1)':
    'Events (Y = 1)',
  'Il test LR vale {s1} con {s2} gradi di libertà: {s3}':
    'The LR test is {s1} with {s2} degrees of freedom: {s3}',
  'rifiuta l’ipotesi che nessun predittore conti.':
    'it rejects the hypothesis that no predictor counts.',
  'non rifiuta l’ipotesi che nessun predittore conti.':
    'it does not reject the hypothesis that no predictor counts.',
  'non calcolabile.':
    'not computable.',
  'Come leggere gli odds ratio':
    'How to read the odds ratios',
  'L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.':
    'The odds ratio is not a relative risk: OR = 2 means the odds double, not that the probability doubles. With frequent outcomes the difference between the two readings is large, with rare outcomes it is small.',
  'Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.':
    'The ORs are estimated net of the other predictors and with a CI at {s1}%: an interval containing 1 corresponds to a non-significant effect.',
  'Quanto discrimina il modello':
    'How well the model discriminates',
  'AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.':
    'AUC = {s1}: probability that a case with a positive outcome gets a higher score than a negative case. Accuracy at the chosen threshold: {s2}.',
  'McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.':
    'McFadden R² = {s1}: values above 0.2 indicate a model with real explanatory power, but they should not be compared with the R² of linear regression.',
  'Gli esiti devono essere indipendenti tra loro (una riga = una unità).':
    'The outcomes must be independent of one another (one row = one unit).',
  'La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.':
    'The relationship between predictor and logit of the probability is linear: with continuous predictors check the shape or use transformations.',
  'Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).':
    'Enough events are needed: fewer than 10 events per parameter makes the estimates unstable (EPV rule of thumb).',
  'La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.':
    'Separation (outcome predicted perfectly) inflates the coefficients and invalidates the tests.',
  'L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.':
    'Accuracy depends on the threshold: always report it together with sensitivity and specificity.',
  'Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.':
    'Models with random effects, interactions, penalised regression or adjustment for unbalanced data are not included.',
  'La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.':
    'Goodness of fit is summarised by pseudo-R² and AUC: they do not replace a check of the residuals for the shape of the relationship.',
  'Modello logistico':
    'Logistic model',
  '{s1} · N = {s2}':
    '{s1} · N = {s2}',
  'Firth penalized likelihood':
    'Firth penalized likelihood',
  'stima di massima verosimiglianza':
    'maximum likelihood estimate',
  'Eventi per parametro':
    'Events per parameter',
  'LR χ² (vs modello nullo)':
    'LR χ² (vs null model)',
  'McFadden R²':
    'McFadden R²',
  'Cox–Snell R²':
    'Cox–Snell R²',
  'Nagelkerke R²':
    'Nagelkerke R²',
  'Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.':
    'The LR test compares the model with the one containing only the intercept: small p = at least one predictor adds information.',
  'Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.':
    'Pseudo-R² do not have the meaning of linear R²: values around 0.2–0.4 already indicate a good fit.',
  'Coefficienti e odds ratio':
    'Coefficients and odds ratios',
  'Predittore':
    'Predictor',
  'Wald z':
    'Wald z',
  'OR':
    'OR',
  'OR CI low':
    'OR CI low',
  'OR CI high':
    'OR CI high',
  'OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.':
    'OR > 1 increases the chances of the outcome for one more unit of the predictor; OR < 1 reduces them. OR = 1 has no effect.',
  'L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.':
    'The OR interval is computed on the logarithmic scale: exp(B ± z·SE). If it contains 1, the effect is not significant.',
  'Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.':
    'The p is a Wald one (z = B/SE): with small samples or strong effects it can be less reliable than the LR test.',
  'Classificazione':
    'Classification',
  'soglia p ≥ {s1} → Y = 1':
    'threshold p ≥ {s1} → Y = 1',
  'Accuratezza':
    'Accuracy',
  '{s1}%':
    '{s1}%',
  'Sensibilità':
    'Sensitivity',
  'Specificità':
    'Specificity',
  'AUC':
    'AUC',
  'L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.':
    'AUC does not depend on the threshold: 0.5 is chance, 0.7 acceptable, 0.8 good, 0.9 excellent.',
  'La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.':
    'The 0.5 threshold is arbitrary: if the cost of a false negative is high, lower it and see how sensitivity and specificity change.',
  'Separazione gestita da Firth':
    'Separation handled by Firth',
  'Attenzione: separazione':
    'Warning: separation',
  'Diagnostica':
    'Diagnostics',
  'Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.':
    'At least one coefficient is very large: the data separate the outcomes almost perfectly and the estimates/SEs are not reliable.',
  'La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.':
    'Firth\'s penalised likelihood keeps the estimates finite; the standard errors remain approximate.',
  'Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).':
    'Collect more cases, reduce the predictors or use a penalised regression (Firth).',
};
