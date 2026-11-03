/** Wave 8 report and table copy: MSA, acceptance sampling, T² charts, DOE design and the new power designs. */
export const w8Copy: Record<string, string> = {
  'Report di lettura — Campionamento di accettazione': 'Reading report — Acceptance sampling',
  'Piano n = {s1}, c = {s2}: accetta lotti con AQL {s3}.': 'Plan n = {s1}, c = {s2}: accepts lots with AQL {s3}.',
  'n {s1} · c {s2}': 'n {s1} · c {s2}',
  'La curva operativa mostra la probabilità di accettare un lotto al variare della qualità in ingresso.':
    'The operating curve shows the probability of accepting a lot as incoming quality changes.',
  'Il piano non elimina i lotti cattivi: fissa il compromesso tra rischio del produttore e rischio del consumatore.':
    'A plan does not eliminate bad lots: it fixes the trade-off between producer and consumer risk.',
  'Il piano': 'The plan',
  'Con {s1} pezzi ispezionati si accetta il lotto se i difettosi sono al massimo {s2}.':
    'With {s1} units inspected the lot is accepted when defectives are at most {s2}.',
  'AQL = {s1} con rischio del produttore {s2}.': 'AQL = {s1} with producer risk {s2}.',
  'LTPD = {s1} con rischio del consumatore {s2}.': 'LTPD = {s1} with consumer risk {s2}.',
  'Qualità media in uscita': 'Average outgoing quality',
  'AOQL = {s1} in corrispondenza di una qualità in ingresso {s2}.':
    'AOQL = {s1} at an incoming quality of {s2}.',
  'La distribuzione usata è {s1}.': 'The distribution used is {s1}.',
  'ipergeometrica, perché il lotto è finito': 'hypergeometric, because the lot is finite',
  'binomiale, perché il lotto è trattato come infinito': 'binomial, because the lot is treated as infinite',
  'La dimensione del lotto è {s1}; l’ATI varia con la probabilità di accettazione.':
    'The lot size is {s1}; ATI changes with the probability of acceptance.',
  'Con lotto infinito l’ATI coincide con n.': 'With an infinite lot ATI equals n.',
  'Come scegliere il piano': 'How to choose the plan',
  'Aumentare n rende la curva più ripida; aumentare c sposta il piano verso l’accettazione.':
    'Increasing n makes the curve steeper; increasing c shifts the plan towards acceptance.',
  'Il piano va scelto prima di vedere i risultati e va registrato: cambiarlo dopo l’ispezione invalida il confronto con la qualità attesa.':
    'Choose and record the plan before seeing the results: changing it after inspection invalidates the comparison with expected quality.',
  'Il modello assume campionamento casuale e difettosi indipendenti; lotti selezionati o ispezioni non casuali cambiano le probabilità.':
    'The model assumes random sampling and independent defectives; selected lots or non-random inspection change the probabilities.',

  'Report di lettura — Disegno sperimentale': 'Reading report — Experimental design',
  '{s1} run per {s2} fattori.': '{s1} runs for {s2} factors.',
  '{s1} run': '{s1} runs',
  'La matrice elenca le combinazioni da provare in livelli codificati: −1 e +1 sono i livelli basso e alto, 0 il centro.':
    'The matrix lists the combinations to run in coded levels: −1 and +1 are the low and high levels, 0 the centre.',
  'Il disegno decisionale viene prima dei dati: stabilisce quali effetti sono stimabili e con quale precisione.':
    'The design comes before the data: it fixes which effects are estimable and with what precision.',
  'Punti ai vertici: {s1}; assiali: {s2}; centrali: {s3}.':
    'Corner points: {s1}; axial: {s2}; centre: {s3}.',
  'α assiale = {s1} per un disegno rotabile.': 'Axial α = {s1} for a rotatable design.',
  'Nessun punto assiale: i fattori restano ai livelli del disegno fattoriale.':
    'No axial points: factors stay at the factorial design levels.',
  'Risoluzione {s1}: gli effetti principali non sono confusi con altri effetti principali.':
    'Resolution {s1}: main effects are not confounded with other main effects.',
  'Disegno non frazionato: tutti gli effetti previsti sono stimabili.':
    'Unfractionated design: every planned effect is estimable.',
  'Esegui i run nell’ordine indicato e registra la risposta con lo stesso protocollo per ogni combinazione.':
    'Run the combinations in the order shown and record the response with the same protocol for every run.',
  'I punti centrali stimano la curvatura e l’errore puro; senza repliche il test degli effetti dipende dalle interazioni.':
    'Centre points estimate curvature and pure error; without replicates the effect tests depend on interactions.',
  'Il generatore descrive il piano, non garantisce che il processo sperimentale sia sotto controllo: randomizza l’ordine e controlla i fattori di disturbo.':
    'The builder describes the plan; it does not guarantee that the experimental process is in control: randomise the order and control nuisance factors.',

  'Report di lettura — Carta T²': 'Reading report — T² chart',
  'Nessun sottogruppo oltre il limite: il processo è stabile sul piano multivariato.':
    'No subgroup beyond the limit: the process is stable in the multivariate plane.',
  '{s1} sottogruppi oltre il limite: il processo mostra segnali multivariati.':
    '{s1} subgroups beyond the limit: the process shows multivariate signals.',
  variabili: 'variables',
  'La carta T² di Hotelling sorveglia insieme più variabili e segnala quando la combinazione esce dalla variabilità normale, anche se ogni variabile da sola sembra sotto controllo.':
    'The Hotelling T² chart monitors several variables together and signals when their combination leaves normal variability, even if each variable alone looks in control.',
  'La distanza è misurata con la covarianza tra le variabili: due misure correlate non vanno controllate con due carte separate.':
    'The distance uses the covariance between variables: two correlated measurements should not be monitored with two separate charts.',
  'Limiti e punti': 'Limits and points',
  'Sottogruppi: {s1} da {s2} osservazioni ciascuno.': 'Subgroups: {s1} of {s2} observations each.',
  'Limite superiore = {s1}; punti oltre il limite = {s2}.':
    'Upper limit = {s1}; points beyond it = {s2}.',
  'Come leggerla': 'How to read it',
  'Un punto alto dice che la combinazione delle variabili è insolita, non quale variabile ha causato il segnale: per quello servono i contributi e l’indagine sul processo.':
    'A high point says the combination of variables is unusual, not which variable caused the signal: that needs contributions and a process investigation.',
  'I limiti della fase I si stimano dai dati storici; con pochi sottogruppi sono instabili e vanno ricalcolati quando il processo cambia.':
    'Phase I limits are estimated from historical data; with few subgroups they are unstable and should be recomputed when the process changes.',
  'La carta assume osservazioni indipendenti e distribuzione approssimativamente normale; con dati molto asimmetrici o autocorrelati i limiti F non sono esatti.':
    'The chart assumes independent observations and an approximately normal distribution; with strongly skewed or autocorrelated data the F limits are not exact.',

  'Report di lettura — Gage R&R': 'Reading report — Gage R&R',
  'Il sistema di misura è accettabile: Gage R&R = {s1}%.':
    'The measurement system is acceptable: Gage R&R = {s1}%.',
  'Il sistema di misura è marginale: Gage R&R = {s1}%.':
    'The measurement system is marginal: Gage R&R = {s1}%.',
  'Il sistema di misura non è accettabile: Gage R&R = {s1}%.':
    'The measurement system is not acceptable: Gage R&R = {s1}%.',
  '%GRR {s1}': '%GRR {s1}',
  'Il Gage R&R separa la variabilità dovuta allo strumento e agli operatori da quella reale tra i pezzi.':
    'Gage R&R separates the variability due to the instrument and operators from the real variation between parts.',
  'La ripetibilità è la variabilità dello stesso operatore sullo stesso pezzo; la riproducibilità è la differenza tra operatori.':
    'Repeatability is the variability of the same operator on the same part; reproducibility is the difference between operators.',
  'Ripetibilità = {s1}, riproducibilità = {s2}.':
    'Repeatability = {s1}, reproducibility = {s2}.',
  'Gage R&R = {s1}% della variabilità totale dello studio.':
    'Gage R&R = {s1}% of total study variation.',
  'Il contributo alla varianza è {s1}%; il numero di categorie distinte è {s2}.':
    'Variance contribution is {s1}%; distinct categories = {s2}.',
  Diagnosi: 'Diagnosis',
  'p dell’operatore = {s1}: un p piccolo indica differenze tra operatori.':
    'Operator p = {s1}: a small p indicates differences between operators.',
  'p dell’interazione = {s1}: un’interazione significativa significa che gli operatori misurano i pezzi in modo diverso.':
    'Interaction p = {s1}: a significant interaction means operators measure parts differently.',
  'La variabile analizzata è {s1}.': 'The variable analysed is {s1}.',
  'Soglie AIAG': 'AIAG thresholds',
  'Sotto il 10% il sistema è accettabile; tra il 10% e il 30% è marginale e va migliorato se il processo è critico; sopra il 30% le decisioni sui pezzi sono a rischio.':
    'Below 10% the system is acceptable; between 10% and 30% it is marginal and should be improved when the process is critical; above 30% part decisions are at risk.',
  'Un numero di categorie distinte inferiore a 5 indica che il sistema non riesce a separare i pezzi in modo utile.':
    'Fewer than 5 distinct categories means the system cannot separate parts usefully.',
  'Lo studio richiede un disegno incrociato bilanciato: ogni parte deve essere misurata da ogni operatore con lo stesso numero di repliche.':
    'The study requires a balanced crossed design: every part measured by every operator with the same number of replicates.',
  'Le soglie sono linee guida, non test di significatività: vanno lette insieme all’uso previsto della misura.':
    'Thresholds are guidelines, not significance tests: read them together with the intended use of the measurement.',

  'n = {s1} · c = {s2}': 'n = {s1} · c = {s2}',
  'Dimensione del campione (n)': 'Sample size (n)',
  'Numero di accettazione (c)': 'Acceptance number (c)',
  'Dimensione del lotto (N)': 'Lot size (N)',
  infinito: 'infinite',
  Ipergeometrica: 'Hypergeometric',
  'AQL (Pa = 95%)': 'AQL (Pa = 95%)',
  'LTPD (Pa = 10%)': 'LTPD (Pa = 10%)',
  'Rischio del produttore (α)': 'Producer risk (α)',
  'Rischio del consumatore (β)': 'Consumer risk (β)',
  AOQL: 'AOQL',
  'Qualità al massimo AOQ': 'Quality at maximum AOQ',
  'Curva operativa': 'Operating curve',
  'Qualità in ingresso': 'Incoming quality',
  'Probabilità di accettazione': 'Probability of acceptance',

  'Fattoriale completo': 'Full factorial',
  'Fattoriale frazionario (metà)': 'Fractional factorial (half)',
  'Disegno composto centrale (CCD)': 'Central composite design (CCD)',
  'Box-Behnken': 'Box-Behnken',
  'Matrice del disegno': 'Design matrix',
  '{s1} run · {s2} fattori · livelli codificati': '{s1} runs · {s2} factors · coded levels',
  Run: 'Run',
  centro: 'centre',
  assiale: 'axial',
  vertice: 'corner',
  'Sintesi del disegno': 'Design summary',
  Disegno: 'Design',
  'Run totali': 'Total runs',
  'Punti ai vertici': 'Corner points',
  'Punti assiali': 'Axial points',
  'Punti centrali': 'Centre points',
  'α assiale (rotabile)': 'Axial α (rotatable)',
  Risoluzione: 'Resolution',
  'Relazioni di alias': 'Alias relations',
  'Termini confusi nel frazionamento': 'Terms confounded in the fraction',
  'Carta T² di Hotelling': 'Hotelling T² chart',
  '{s1} variabili · {s2} sottogruppi di {s3}': '{s1} variables · {s2} subgroups of {s3}',
  'Osservazioni complete': 'Complete observations',
  Sottogruppi: 'Subgroups',
  'T² per sottogruppo': 'T² by subgroup',
  'Fuori controllo': 'Out of control',
  'Centro e covarianza': 'Centre and covariance',
  'Media per variabile': 'Mean by variable',
  Parti: 'Parts',
  Operatori: 'Operators',
  'Interazione parte × operatore': 'Part × operator interaction',
  'Ripetibilità (errore)': 'Repeatability (error)',
  'ANOVA del sistema di misura': 'Measurement system ANOVA',
  '{s1} · {s2} parti × {s3} operatori × {s4} repliche':
    '{s1} · {s2} parts × {s3} operators × {s4} replicates',
  'Media quadratica': 'Mean square',
  'Gage R&R e variabilità delle parti': 'Gage R&R and part variation',
  'Contributo (%)': 'Contribution (%)',
  'Studio (%)': 'Study (%)',
  Ripetibilità: 'Repeatability',
  Riproducibilità: 'Reproducibility',
  'Sintesi dello studio': 'Study summary',
  'Repliche per cella': 'Replicates per cell',
  'Contributo del Gage R&R (%)': 'Gage R&R contribution (%)',
  'Numero di categorie distinte': 'Distinct categories',
  'p operatore': 'Operator p',
  'Regressione multipla': 'Multiple regression',
  'Regressione logistica': 'Logistic regression',
  'Numero di predittori': 'Number of predictors',
  "Cohen's f²": "Cohen's f²",
  'Odds ratio da rilevare': 'Odds ratio to detect',
};
