/** Wave 9 report and table copy: survey, ML, text, choice, meta, Bayes and spatial. */
export const w9Copy: Record<string, string> = {
  Adattamento: 'Fit',
  Alberi: 'Trees',
  Alternativa: 'Alternative',
  Argomenti: 'Topics',
  Argomento: 'Topic',
  'Argomento {s1}': 'Topic {s1}',
  'Autocorrelazione globale': 'Global autocorrelation',
  'Bias e limiti': 'Bias and limits',
  'Blocchi validi': 'Valid blocks',
  'Burn-in': 'Burn-in',
  'C vicino a 1 indica assenza di autocorrelazione; valori sotto 1 indicano similarità tra vicini, sopra 1 dissimilarità.':
    'C near 1 means no autocorrelation; values below 1 mean neighbours are similar, above 1 that they differ.',
  Caratteristica: 'Attribute',
  Catene: 'Chains',
  Classifica: 'Ranking',
  'Coefficienti del modello SAR': 'SAR model coefficients',
  'Coefficienti delle caratteristiche che variano tra alternative':
    'Coefficients of the attributes that vary across alternatives',
  'Con molti punti e permutazioni limitate, qualche p piccolo può comparire per caso: valuta la correzione per confronti multipli.':
    'With many points and few permutations a small p can appear by chance: consider a multiple-comparison correction.',
  'Con pochi blocchi le differenze sono instabili; aumenta i blocchi o il numero di rispondenti.':
    'With few blocks the differences are unstable; add blocks or respondents.',
  'Con pochi studi le stime di τ² e del bias di pubblicazione sono instabili.':
    'With few studies the estimates of τ² and of publication bias are unstable.',
  'Conteggio, documenti in cui compaiono e TF-IDF medio':
    'Count, documents containing the term and mean TF-IDF',
  Corpus: 'Corpus',
  Coseno: 'Cosine',
  'Coseno sui vettori TF-IDF': 'Cosine on the TF-IDF vectors',
  'DEFF {s1}': 'DEFF {s1}',
  'Diagnostica del campionatore': 'Sampler diagnostics',
  'Disegno del campione': 'Sample design',
  'Distribuzione a posteriori': 'Posterior distribution',
  Documenti: 'Documents',
  'Documenti e argomenti': 'Documents and topics',
  'Documenti: {s1}.': 'Documents: {s1}.',
  Documento: 'Document',
  'Documento A': 'Document A',
  'Documento B': 'Document B',
  'Documento {s1}': 'Document {s1}',
  'Effetti casuali ({s1})': 'Random effects ({s1})',
  'Effetto disegno': 'Design effect',
  Elemento: 'Item',
  'Errori standard robusti al disegno': 'Design-robust standard errors',
  Eterogeneità: 'Heterogeneity',
  'Frequenze e TF-IDF': 'Frequencies and TF-IDF',
  'Geary C': 'Geary C',
  'Geary C = {s1}, p per permutazione {s2}.': 'Geary C = {s1}, permutation p {s2}.',
  'Geary C = {s1}.': 'Geary C = {s1}.',
  Globale: 'Global',
  'HDI inferiore': 'HDI lower',
  'HDI superiore': 'HDI upper',
  'HH = valore alto circondato da alti; LL = basso circondato da bassi; HL e LH = valori discordanti dai vicini.':
    'HH = high value surrounded by highs; LL = low surrounded by lows; HL and LH = values that disagree with their neighbours.',
  'I gradi di libertà del disegno determinano il moltiplicatore dell’intervallo: con pochi PSU l’intervallo è più prudente.':
    'The design degrees of freedom set the interval multiplier: with few PSUs the interval is more conservative.',
  'I indicatori locali scompongono l’autocorrelazione per punto e permettono di individuare cluster e valori anomali spaziali.':
    'Local indicators decompose autocorrelation by point and reveal spatial clusters and outliers.',
  'I locale': 'Local I',
  'I pesi collegano ogni punto ai k vicini più prossimi; la standardizzazione per riga rende confrontabili punti con densità diversa.':
    'Weights link each point to its k nearest neighbours; row standardisation makes points with different density comparable.',
  'I pesi dei documenti sono normalizzati a uno: indicano la mescolanza di argomenti, non il numero di parole.':
    'Document weights are normalised to one: they describe the mixture of topics, not the number of words.',
  'I risultati dipendono dal seme e dagli iperparametri: confronta più configurazioni prima di scegliere.':
    'Results depend on the seed and the hyperparameters: compare several configurations before choosing.',
  'I risultati dipendono dalla lingua, dalle stopword e dalla pulizia del testo: documenta la pipeline prima di confrontare corpus diversi.':
    'Results depend on the language, stopwords and text cleaning: document the pipeline before comparing corpora.',
  'I set devono essere costruiti prima di vedere le scelte e contenere alternative reali.':
    'Choice sets must be built before seeing the choices and contain realistic alternatives.',
  'Il calcolo assume che i pesi siano corretti e che le PSU siano state campionate con probabilità nota.':
    'The calculation assumes correct weights and PSUs sampled with known probabilities.',
  'Il campionatore copre i modelli coniugati e la regressione gaussiana; modelli gerarchici o non lineari richiedono un motore dedicato.':
    'The sampler covers conjugate models and Gaussian regression; hierarchical or non-linear models need a dedicated engine.',
  'Il disegno dei blocchi conta: elementi mai confrontati non sono ordinabili con certezza.':
    'The block design matters: items never compared cannot be ranked with certainty.',
  'Il divario di {s1} punti tra R² interno ed esterno suggerisce sovradattamento.':
    'A gap of {s1} points between internal and external R² suggests overfitting.',
  'Il divario tra R² interno ed esterno è {s1} punti: contenuto.':
    'The gap between internal and external R² is {s1} points: limited.',
  'Il logit condizionale spiega la scelta dentro ogni set confrontando le caratteristiche delle alternative.':
    'The conditional logit explains the choice within each set by comparing the attributes of the alternatives.',
  'Il modello SAR assume una struttura lineare e un unico parametro di dipendenza spaziale.':
    'The SAR model assumes a linear structure and a single spatial-dependence parameter.',
  'Il modello SAR stima l’effetto dei vicini oltre a quello dei predittori: ρ misura l’intensità del ritardo spaziale.':
    'The SAR model estimates the neighbours’ effect beyond the predictors: ρ measures the strength of the spatial lag.',
  'Il modello a effetti fissi assume un unico effetto vero; il modello a effetti casuali assume che gli studi stimino effetti diversi attorno a una media.':
    'The fixed-effects model assumes one true effect; the random-effects model assumes that studies estimate different effects around a mean.',
  'Il modello assume indipendenza dalle alternative irrilevanti (IIA): se un’opzione nuova cambia le quote in modo non proporzionale, il logit condizionale non basta.':
    'The model assumes independence from irrelevant alternatives (IIA): if a new option changes shares disproportionately, the conditional logit is not enough.',
  'Il modello di argomenti è esplorativo: il numero di argomenti va scelto e confrontato, non accettato come verità.':
    'The topic model is exploratory: the number of topics must be chosen and compared, not accepted as truth.',
  'Il modello impara una relazione non lineare tra i predittori e l’esito, senza imporre una forma parametrica.':
    'The model learns a non-linear relation between predictors and outcome without imposing a parametric form.',
  'Il modello non ha un parametro di scala residua.': 'The model has no residual scale parameter.',
  'Il modello non produce una stima out-of-bag.': 'The model does not produce an out-of-bag estimate.',
  'Il modello è predittivo: non sostituisce un disegno causale né una verifica delle assunzioni.':
    'The model is predictive: it does not replace a causal design or an assumption check.',
  'Il test di Egger richiede almeno tre studi.': 'Egger’s test needs at least three studies.',
  'Il testo è stato normalizzato in minuscolo, privato della punteggiatura e diviso in gettoni; le stopword sono state rimosse se richiesto.':
    'Text was lower-cased, stripped of punctuation and split into tokens; stopwords were removed when requested.',
  'Il testo è trattato come una borsa di parole: l’ordine e la sintassi non entrano nel modello.':
    'Text is treated as a bag of words: order and syntax do not enter the model.',
  'Indicatori locali (LISA)': 'Local indicators (LISA)',
  'Indice di Moran con pesi k-nearest standardizzati per riga':
    'Moran index with row-standardised k-nearest weights',
  'Intervallo di previsione': 'Prediction interval',
  'Iterazioni dopo il burn-in': 'Iterations after burn-in',
  'I² = {s1}%; τ² = {s2}.': 'I² = {s1}%; τ² = {s2}.',
  'I² {s1}%': 'I² {s1}%',
  'I² è la quota di variabilità totale attribuita all’eterogeneità piuttosto che al caso; τ² è la varianza tra studi.':
    'I² is the share of total variability attributed to heterogeneity rather than chance; τ² is the between-study variance.',
  'La configurazione non mostra un clustering positivo netto.':
    'The configuration does not show clear positive clustering.',
  'La deviazione standard residua σ ha media {s1} e HDI {s2}–{s3}.':
    'The residual standard deviation σ has mean {s1} and HDI {s2}–{s3}.',
  'La matrice dei pesi è una scelta di modello: k diverso o una soglia di distanza diversa cambiano i risultati.':
    'The weights matrix is a modelling choice: a different k or distance threshold changes the results.',
  'La matrice termine-documento conta quante volte ogni termine compare in ciascun documento; il TF-IDF riduce il peso dei termini presenti ovunque.':
    'The term-document matrix counts how often each term appears in each document; TF-IDF downweights terms present everywhere.',
  'La meta-analisi combina gli effetti dei singoli studi pesandoli per la loro precisione.':
    'Meta-analysis combines study effects weighting them by their precision.',
  'La meta-analisi eredita i limiti degli studi inclusi: selezione, qualità e misure diverse non si correggono con il pooling.':
    'Meta-analysis inherits the limits of the included studies: selection, quality and different measures are not fixed by pooling.',
  'La permutazione non rifiuta l’assenza di autocorrelazione: i dati sono compatibili con una disposizione casuale.':
    'The permutation test does not reject the absence of autocorrelation: the data are compatible with a random arrangement.',
  'La permutazione rifiuta l’assenza di autocorrelazione: i valori non sono distribuiti a caso nello spazio.':
    'The permutation test rejects the absence of autocorrelation: values are not randomly arranged in space.',
  'La quota di preferenza trasforma i conteggi in una scala confrontabile tra elementi.':
    'The preference share turns counts into a scale comparable across items.',
  'La quota non è una probabilità di acquisto: è una preferenza relativa dentro i blocchi mostrati.':
    'The share is not a purchase probability: it is a relative preference within the blocks shown.',
  'La quota usa un correttivo di Laplace per evitare zeri e uni; la SE è quella di una proporzione.':
    'The share uses a Laplace correction to avoid zeros and ones; the SE is that of a proportion.',
  'La regressione ponderata è descrittiva: non corregge endogeneità né selezione.':
    'The weighted regression is descriptive: it corrects neither endogeneity nor selection.',
  'La rete neurale non produce un’importanza delle variabili.':
    'The neural network does not produce variable importance.',
  'La scelta della distribuzione a priori conta con pochi dati: dichiarala e verifica la sensibilità delle conclusioni.':
    'The prior matters with few data: state it and check the sensitivity of the conclusions.',
  'La similarità è il coseno tra vettori TF-IDF: 1 significa documenti identici in vocabolario e pesi, 0 nessuna sovrapposizione.':
    'Similarity is the cosine between TF-IDF vectors: 1 means identical vocabulary and weights, 0 no overlap.',
  'La statistica spaziale verifica se valori vicini nello spazio tendono a somigliarsi più di quanto farebbe un’assegnazione casuale.':
    'Spatial statistics test whether nearby values resemble each other more than a random assignment would.',
  'La tokenizzazione non riconosce lemmi, negazioni o entità: “non buono” e “buono” restano termini diversi o vicini a seconda del contesto.':
    'Tokenisation does not recognise lemmas, negations or entities: “not good” and “good” stay different or close depending on context.',
  'La varianza di linearizzazione tratta ogni unità primaria come un’osservazione indipendente dentro il proprio strato.':
    'Linearisation variance treats each primary sampling unit as an independent observation within its stratum.',
  'Le caratteristiche che non variano dentro un set non sono identificabili: il modello usa solo la variazione interna.':
    'Attributes that do not vary within a set are not identified: the model uses only within-set variation.',
  'Le catene non si sono mescolate bene: aumenta le iterazioni o ricontrolla il modello prima di leggere le stime.':
    'The chains did not mix well: increase iterations or recheck the model before reading the estimates.',
  'Le catene si sono mescolate: le stime sono stabili rispetto al numero di iterazioni.':
    'The chains mixed: estimates are stable with respect to the number of iterations.',
  'Le conclusioni valgono condizionatamente al modello e alla prior scelti, non solo ai dati.':
    'Conclusions hold conditional on the chosen model and prior, not on the data alone.',
  'Le conclusioni valgono per la matrice dei pesi e l’insieme di punti analizzati; non generalizzano automaticamente ad altre scale.':
    'Conclusions hold for the weights matrix and the analysed points; they do not automatically generalise to other scales.',
  'Le frequenze grezze sono dominanti nei documenti lunghi: il TF-IDF e la similarità aiutano a correggere questa asimmetria.':
    'Raw frequencies dominate long documents: TF-IDF and similarity help correct this asymmetry.',
  'Le misure sui dati di addestramento sono ottimistiche: servono il test out-of-bag o una validazione esterna per stimare la generalizzazione.':
    'Training-data measures are optimistic: out-of-bag testing or external validation is needed to estimate generalisation.',
  'Le quote previste dipendono dal disegno dei set e dalle caratteristiche incluse.':
    'Predicted shares depend on the set design and the included attributes.',
  'Le stime usano i pesi di campionamento e la struttura del disegno: strati, cluster e unità primarie.':
    'Estimates use the sampling weights and the design structure: strata, clusters and primary units.',
  Locale: 'Local',
  'Logit condizionale': 'Conditional logit',
  'Logit condizionale su {s1} set: il coefficiente di “{s2}” è {s3}.':
    'Conditional logit on {s1} sets: the coefficient of “{s2}” is {s3}.',
  'Lunghezza media: {s1} gettoni per documento.': 'Average length: {s1} tokens per document.',
  'L’analisi bayesiana combina la verosimiglianza dei dati con una distribuzione a priori e restituisce una distribuzione a posteriori.':
    'Bayesian analysis combines the data likelihood with a prior and returns a posterior distribution.',
  'L’autocorrelazione spaziale non implica una relazione causale: variabili omesse con struttura spaziale producono lo stesso segnale.':
    'Spatial autocorrelation does not imply causation: omitted variables with spatial structure produce the same signal.',
  'L’effetto disegno confronta la varianza del disegno con quella di un campione casuale semplice della stessa numerosità ponderata.':
    'The design effect compares the design variance with that of a simple random sample of the same weighted size.',
  'L’effetto disegno è {s1}: valori sopra 1 indicano che il disegno è meno efficiente di un campione casuale semplice.':
    'The design effect is {s1}: values above 1 mean the design is less efficient than a simple random sample.',
  'L’elemento con il punteggio più alto è “{s1}” ({s2}%).':
    'The highest-scoring item is “{s1}” ({s2}%).',
  'L’eterogeneità è contenuta: il modello a effetti fissi e quello a effetti casuali danno risultati simili.':
    'Heterogeneity is limited: fixed- and random-effects models give similar results.',
  'L’eterogeneità è sostanziale: il modello a effetti casuali è più appropriato e l’effetto medio va letto con cautela.':
    'Heterogeneity is substantial: the random-effects model is more appropriate and the average effect needs care.',
  'L’importanza per impurità favorisce variabili con molti valori distinti e non prova una relazione causale.':
    'Impurity importance favours variables with many distinct values and does not prove causation.',
  'L’intervallo contiene lo zero: i dati non escludono l’ipotesi nulla al livello scelto.':
    'The interval contains zero: the data do not rule out the null at the chosen level.',
  'L’intervallo credibile descrive la probabilità a posteriori che il parametro cada nell’intervallo; non è un intervallo di confidenza frequentista.':
    'The credible interval describes the posterior probability that the parameter lies inside it; it is not a frequentist confidence interval.',
  'L’intervallo di previsione descrive dove cadrebbe l’effetto di un nuovo studio simile, non la precisione della media.':
    'The prediction interval describes where the effect of a similar new study would fall, not the precision of the mean.',
  'L’intervallo di previsione, quando disponibile, descrive la variabilità attesa in un nuovo studio.':
    'The prediction interval, when available, describes the variability expected in a new study.',
  'L’intervallo non contiene lo zero: la stima è distinta dall’ipotesi nulla al livello scelto.':
    'The interval does not contain zero: the estimate differs from the null at the chosen level.',
  'MaxDiff chiede di indicare il migliore e il peggiore di ogni blocco: il punteggio è la differenza tra le due frequenze.':
    'MaxDiff asks for the best and worst item in each block: the score is the difference between the two frequencies.',
  'MaxDiff misura preferenze dichiarate in un compito di scelta, non comportamenti reali.':
    'MaxDiff measures stated preferences in a choice task, not real behaviour.',
  'McFadden R² {s1}': 'McFadden R² {s1}',
  'McFadden R²: {s1}; AIC: {s2}; BIC: {s3}.': 'McFadden R²: {s1}; AIC: {s2}; BIC: {s3}.',
  'Media, deviazione standard, intervallo centrale e HDI':
    'Mean, standard deviation, central interval and HDI',
  Migliore: 'Best',
  'Migliori meno peggiori, con quota di preferenza': 'Best minus worst, with preference share',
  'Misure calcolate sui dati usati per l’addestramento': 'Measures computed on the training data',
  'Modello a effetti fissi e modello a effetti casuali': 'Fixed-effects and random-effects models',
  'Modello di ritardo spaziale': 'Spatial lag model',
  'Moran I = {s1}, atteso {s2}, z {s3}.': 'Moran I = {s1}, expected {s2}, z {s3}.',
  'Moran I per {s1} = {s2} (p {s3}).': 'Moran I for {s1} = {s2} (p {s3}).',
  'Nessun coefficiente stimabile.': 'No estimable coefficient.',
  'Nessun confronto interno/esterno disponibile.': 'No internal/external comparison available.',
  'Nessun effetto disegno calcolabile.': 'No computable design effect.',
  'Nessun elemento disponibile.': 'No item available.',
  'Nessun indicatore locale calcolato.': 'No local indicator computed.',
  'Nessun indice globale disponibile.': 'No global index available.',
  'Nessun termine disponibile.': 'No term available.',
  'Nessuna distribuzione a posteriori disponibile.': 'No posterior distribution available.',
  'Nessuna stima disponibile.': 'No estimate available.',
  'Numerosità ponderata': 'Weighted size',
  'Numerosità ponderata: {s1}.': 'Weighted size: {s1}.',
  'Osservata %': 'Observed %',
  'Osservazioni: {s1}.': 'Observations: {s1}.',
  Peggiore: 'Worst',
  'Pesi molto variabili o strati con una sola PSU rendono la varianza instabile.':
    'Highly variable weights or strata with a single PSU make the variance unstable.',
  'Peso %': 'Weight %',
  'Peso dell’argomento in ciascun documento': 'Topic weight in each document',
  'Peso nel modello usato e intervallo al livello scelto':
    'Weight in the fitted model and interval at the chosen level',
  Predizione: 'Prediction',
  'Predizioni e residui': 'Predictions and residuals',
  Prestazioni: 'Performance',
  'Prestazioni del modello': 'Model performance',
  'Prevalenza %': 'Prevalence %',
  'Prevista %': 'Predicted %',
  'Prime osservazioni in ordine di riga': 'First observations in row order',
  'Punteggi MaxDiff': 'MaxDiff scores',
  'Punteggi vicini indicano elementi non distinguibili con questo numero di blocchi: guarda anche la SE.':
    'Close scores mean items are not distinguishable with this number of blocks: check the SE too.',
  'Punti con p bassa e quadrante HH o LL formano cluster; HL e LH segnalano valori discordanti dai vicini.':
    'Points with low p and HH or LL quadrant form clusters; HL and LH flag values that disagree with neighbours.',
  Punto: 'Point',
  'Q = {s1} con {s2} gradi di libertà (p {s3}).': 'Q = {s1} with {s2} degrees of freedom (p {s3}).',
  Quadrante: 'Quadrant',
  'Quota %': 'Share %',
  'Quota di scelta per alternativa': 'Choice share per alternative',
  'Quote osservate e previste': 'Observed and predicted shares',
  'RMSE out-of-bag': 'Out-of-bag RMSE',
  'Regressione ponderata': 'Weighted regression',
  'Report di lettura — Analisi bayesiana': 'Reading report — Bayesian analysis',
  'Report di lettura — Campione complesso': 'Reading report — Complex sample',
  'Report di lettura — Machine learning': 'Reading report — Machine learning',
  'Report di lettura — MaxDiff': 'Reading report — MaxDiff',
  'Report di lettura — Meta-analisi': 'Reading report — Meta-analysis',
  'Report di lettura — Scelta discreta': 'Reading report — Discrete choice',
  'Report di lettura — Statistica spaziale': 'Reading report — Spatial statistics',
  'Report di lettura — Text mining': 'Reading report — Text mining',
  'Residuo standardizzato': 'Standardised residual',
  'Rhat massimo {s1}; ESS minimo {s2}; {s3} catene con {s4} iterazioni dopo il burn-in.':
    'Maximum Rhat {s1}; minimum ESS {s2}; {s3} chains with {s4} iterations after burn-in.',
  'Rhat vicino a 1 e ESS alto indicano che le catene si sono mescolate; valori sopra 1.05 richiedono più iterazioni.':
    'Rhat near 1 and high ESS mean the chains mixed; values above 1.05 need more iterations.',
  'Rhat {s1}': 'Rhat {s1}',
  Riduzione: 'Reduction',
  'Riduzione di impurità attribuita a ciascun predittore': 'Impurity reduction attributed to each predictor',
  Righe: 'Rows',
  'Ritardo spaziale: ρ = {s1} (p {s2}).': 'Spatial lag: ρ = {s1} (p {s2}).',
  'R² out-of-bag': 'Out-of-bag R²',
  'R² out-of-bag: {s1}; RMSE out-of-bag: {s2}.': 'Out-of-bag R²: {s1}; out-of-bag RMSE: {s2}.',
  'R² ponderato: {s1}.': 'Weighted R²: {s1}.',
  'R²: {s1}; RMSE: {s2}; MAE: {s3}.': 'R²: {s1}; RMSE: {s2}; MAE: {s3}.',
  'SE di ρ': 'SE of ρ',
  'Senza il disegno completo (probabilità di inclusione e frazioni di campionamento) le stime restano condizionate ai pesi forniti.':
    'Without the full design (inclusion probabilities and sampling fractions) estimates remain conditional on the supplied weights.',
  'Senza validazione incrociata o un insieme di test separato le prestazioni restano una stima ottimistica.':
    'Without cross-validation or a separate test set the performance remains an optimistic estimate.',
  'Set di scelta': 'Choice set',
  Similarità: 'Similarity',
  'Similarità tra documenti': 'Document similarity',
  'Statistica LR': 'LR statistic',
  'Stima pooled': 'Pooled estimate',
  'Stime e intervalli di confidenza': 'Estimates and confidence intervals',
  'Strati: {s1}; unità primarie: {s2}.': 'Strata: {s1}; primary units: {s2}.',
  Studi: 'Studies',
  Studio: 'Study',
  Termini: 'Terms',
  'Termini con peso più alto e prevalenza media': 'Highest-weight terms and mean prevalence',
  'Termini più frequenti': 'Most frequent terms',
  'Termini rari ma discriminanti possono essere esclusi dalla soglia di frequenza minima: controlla il vocabolario prima di interpretare.':
    'Rare but discriminating terms can be excluded by the minimum frequency: check the vocabulary before interpreting.',
  'Test di Egger': 'Egger test',
  'Test di Egger: intercetta {s1}, p {s2}.': 'Egger test: intercept {s1}, p {s2}.',
  'Un coefficiente positivo aumenta la probabilità di scelta dell’alternativa con quella caratteristica.':
    'A positive coefficient increases the probability of choosing the alternative with that attribute.',
  'Unità primarie': 'Primary units',
  'Un’intercetta significativa suggerisce asimmetria del funnel plot e possibile bias di pubblicazione; con pochi studi il test ha scarsa potenza.':
    'A significant intercept suggests funnel-plot asymmetry and possible publication bias; with few studies the test has low power.',
  'Valore atteso': 'Expected value',
  'Valori alti tendono a raggrupparsi con valori alti e valori bassi con valori bassi.':
    'High values tend to cluster with high values and low values with low values.',
  'Valori alti tra documenti brevi sono comuni: confronta anche la lunghezza e il numero di termini condivisi.':
    'High similarity between short documents is common: compare length and the number of shared terms too.',
  'Variabile analizzata: {s1}.': 'Analysed variable: {s1}.',
  'Varianza di linearizzazione con PSU aggregate dentro lo strato':
    'Linearisation variance with PSUs aggregated within strata',
  'Vocabolario: {s1} termini.': 'Vocabulary: {s1} terms.',
  'gradient boosting': 'gradient boosting',
  'media di una variabile gaussiana': 'mean of a Gaussian variable',
  'p di LR': 'LR p',
  'p di Q': 'Q p',
  'p normale': 'normal p',
  'p per permutazione': 'permutation p',
  'proporzione binomiale': 'binomial proportion',
  'random forest': 'random forest',
  'regressione lineare': 'linear regression',
  'rete neurale a uno strato nascosto': 'one-hidden-layer neural network',
  'tasso di Poisson': 'Poisson rate',
  'y = ρ W y + X β + ε, verosimiglianza concentrata': 'y = ρ W y + X β + ε, concentrated likelihood',
  '{s1} blocchi': '{s1} blocks',
  '{s1} documenti, {s2} termini: il termine più frequente è “{s3}”.':
    '{s1} documents, {s2} terms: the most frequent term is “{s3}”.',
  '{s1} documenti, {s2} termini: l’argomento 1 pesa il {s3}%.':
    '{s1} documents, {s2} terms: topic 1 weighs {s3}%.',
  '{s1} gettoni': '{s1} tokens',
  '{s1} per {s2}: R² {s3}, RMSE {s4}.': '{s1} for {s2}: R² {s3}, RMSE {s4}.',
  '{s1} studi: effetto pooled {s2} (IC {s3}–{s4}).':
    '{s1} studies: pooled effect {s2} (CI {s3}–{s4}).',
  '{s1} vicini': '{s1} neighbours',
  '{s1}: effetto {s2}, peso {s3}%.': '{s1}: effect {s2}, weight {s3}%.',
  '{s1}: media {s2}, mediana {s3}, HDI {s4}–{s5}.':
    '{s1}: mean {s2}, median {s3}, HDI {s4}–{s5}.',
  '{s1}: punteggio {s2}, quota {s3}%.': '{s1}: score {s2}, share {s3}%.',
  '{s1}: {s2} (SE {s3}, IC {s4}–{s5}).': '{s1}: {s2} (SE {s3}, CI {s4}–{s5}).',
  '{s1}: {s2} (z {s3}, p {s4}).': '{s1}: {s2} (z {s3}, p {s4}).',
  '{s1}: {s2} con HDI {s3}–{s4}.': '{s1}: {s2} with HDI {s3}–{s4}.',
  '{s1}: {s2}% dell’importanza.': '{s1}: {s2}% of importance.',
  'modello gerarchico normale': 'hierarchical normal model',
  'Modello gerarchico: μ = {s1}, τ = {s2} su {s3} gruppi.': 'Hierarchical model: μ = {s1}, τ = {s2} across {s3} groups.',
  'Il modello gerarchico stima una media per gruppo e le lega a una media generale μ, con varianza tra gruppi τ².':
    'The hierarchical model estimates one mean per group and links them to an overall mean μ with between-group variance τ².',
  'Le medie dei gruppi sono stimate con shrinkage: i gruppi con pochi dati si avvicinano di più alla media generale.':
    'Group means are estimated with shrinkage: groups with little data move closer to the overall mean.',
  '{s1}: media {s2}, HDI {s3}–{s4}.': '{s1}: mean {s2}, HDI {s3}–{s4}.',
  'σ = {s1} (HDI {s2}–{s3}).': 'σ = {s1} (HDI {s2}–{s3}).',
  'Nessuna deviazione residua disponibile.': 'No residual deviation available.',
  'τ = {s1} (HDI {s2}–{s3}): descrive quanto le medie dei gruppi si allontanano da μ.':
    'τ = {s1} (HDI {s2}–{s3}): it describes how far group means move from μ.',
  'Nessuna varianza tra gruppi disponibile.': 'No between-group variance available.',
  'Il gruppo con media più alta è {s1}.': 'The group with the highest mean is {s1}.',
  'Nessun gruppo disponibile.': 'No group available.',
  'Rhat massimo {s1}; ESS minimo {s2}; {s3} catene.': 'Maximum Rhat {s1}; minimum ESS {s2}; {s3} chains.',
  'Il modello assume scambiabilità dei gruppi e normalità dentro i gruppi.':
    'The model assumes exchangeable groups and normality within groups.',
  'Con pochi gruppi la varianza τ² è difficile da stimare e l’intervallo è ampio.':
    'With few groups τ² is hard to estimate and the interval is wide.',
  'La scelta della distribuzione a priori conta con pochi dati: dichiarala e verifica la sensibilità.':
    'The prior matters with few data: state it and check sensitivity.',
  'Le conclusioni valgono condizionatamente al modello gerarchico e alla prior scelti.':
    'Conclusions hold conditional on the chosen hierarchical model and prior.',
  '{s1} per {s2}: accuratezza {s3}% su {s4} classi.': '{s1} for {s2}: accuracy {s3}% across {s4} classes.',
  'Il modello impara a separare le classi dell’esito a partire dai predittori.':
    'The model learns to separate the outcome classes from the predictors.',
  'L’accuratezza da sola può ingannare con classi sbilanciate: guarda anche accuratezza bilanciata, sensibilità per classe e matrice di confusione.':
    'Accuracy alone can mislead with imbalanced classes: check balanced accuracy, per-class recall and the confusion matrix too.',
  'Accuratezza: {s1}%; accuratezza bilanciata: {s2}%; log-loss: {s3}.':
    'Accuracy: {s1}%; balanced accuracy: {s2}%; log-loss: {s3}.',
  'Classi: {s1}; osservazioni: {s2}; predittori: {s3}.': 'Classes: {s1}; observations: {s2}; predictors: {s3}.',
  'La classe con sensibilità più bassa è {s1} ({s2}%).': 'The lowest-recall class is {s1} ({s2}%).',
  'Nessuna classe con supporto sufficiente per la sensibilità.': 'No class has enough support for recall.',
  '{s1}: {s2}% dell’importanza media.': '{s1}: {s2}% of the mean importance.',
  'La matrice di confusione descrive gli errori sui dati usati per l’addestramento: serve una validazione esterna per la generalizzazione.':
    'The confusion matrix describes errors on the training data: external validation is needed for generalisation.',
  'L’importanza per impurità non prova una relazione causale e favorisce variabili con molti valori distinti.':
    'Impurity importance does not prove causation and favours variables with many distinct values.',
  'Con classi rare l’accuratezza può essere alta anche se il modello non riconosce la classe rara.':
    'With rare classes accuracy can be high even when the model does not recognise the rare class.',
  'Il modello LDA (latent Dirichlet allocation) stima argomenti come distribuzioni di termini e pesi per documento.':
    'The LDA model estimates topics as distributions of terms and weights per document.',
  'La perplessità del corpus è {s1}: valori più bassi indicano un modello che descrive meglio i testi.':
    'The corpus perplexity is {s1}: lower values mean the model describes the texts better.',
  'Shrinkage verso la media generale μ': 'Shrinkage towards the overall mean μ',
  'Misure calcolate sulle classi osservate e predette': 'Measures computed on observed and predicted classes',
  'Accuratezza bilanciata': 'Balanced accuracy',
  'Log-loss': 'Log-loss',
  'Matrice di confusione': 'Confusion matrix',
  'Riga: classe osservata; colonna: classe predetta': 'Row: observed class; column: predicted class',
  Osservata: 'Observed',
  'Media della riduzione di impurità sulle classi': 'Mean impurity reduction across classes',
};
