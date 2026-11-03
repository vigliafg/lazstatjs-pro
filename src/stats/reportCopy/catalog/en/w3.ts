/** English prose of the W3 GLMM report and its tables. */
export const w3Copy: Record<string, string> = {
  'Binomiale':
    'Binomial',
  'BLUP di intercetta e pendenza':
    'Intercept and slope BLUPs',
  'CI {s1}% · z di Wald':
    '{s1}% CI · Wald z',
  'Con pochi gruppi le componenti di varianza sono instabili e l’ICC va letto con prudenza.':
    'With few groups the variance components are unstable and the ICC should be read with caution.',
  'Con pochi punti per gruppo la stima della pendenza casuale è instabile e può collassare verso zero.':
    'With few points per group the random-slope estimate is unstable and may collapse towards zero.',
  'Convergenza non raggiunta: le stime non sono affidabili.':
    'Convergence not reached: the estimates are not reliable.',
  'Convergenza raggiunta.':
    'Convergence reached.',
  'Correlazione':
    'Correlation',
  'Correlazione (intercetta–pendenza)':
    'Correlation (intercept–slope)',
  'Covarianza':
    'Covariance',
  'Covarianza (intercetta–pendenza)':
    'Covariance (intercept–slope)',
  'Effetti casuali per gruppo':
    'Random effects by group',
  'Famiglia {s1} · link {s2} · effetti casuali per {s3}':
    'Family {s1} · link {s2} · random effects for {s3}',
  'Gaussiana':
    'Gaussian',
  'Gli effetti casuali sono assunti normali e la verosimiglianza è approssimata: AIC e BIC vanno confrontati solo tra modelli con la stessa risposta e struttura.':
    'The random effects are assumed normal and the likelihood is approximate: AIC and BIC should only be compared across models with the same response and structure.',
  'Gruppi con pochi casi sono stimati con maggiore incertezza: la colonna N aiuta a pesare la lettura.':
    'Groups with few cases are estimated with greater uncertainty: the N column helps to weight the reading.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso: i gruppi con pochi casi sono tirati verso la media generale.':
    'BLUPs are group-conditional estimates, shrunk towards the fixed effect: groups with few cases are pulled towards the overall mean.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso (shrinkage).':
    'BLUPs are group-conditional estimates, shrunk towards the fixed effect (shrinkage).',
  'I BLUP sono stime condizionate al gruppo: la loro variabilità non va confrontata con i coefficienti fissi.':
    'BLUPs are group-conditional estimates: their variability should not be compared with the fixed coefficients.',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi; la pendenza di {s3} varia tra gruppi (varianza {s4}).':
    'ICC = {s1}: {s2}% of the variability is between groups; the slope of {s3} varies across groups (variance {s4}).',
  'I coefficienti fissi sono sulla scala del link: con logit B è un log-odds, con log è una differenza di log-medie, con identity coincide con la scala della risposta.':
    'The fixed coefficients are on the link scale: with logit B is a log-odds, with log it is a difference of log-means, with identity it coincides with the response scale.',
  'Identità':
    'Identity',
  'Il modello assume normalità degli effetti casuali e residui omoschedastici.':
    'The model assumes normal random effects and homoscedastic residuals.',
  'Il modello non ha raggiunto la convergenza: le stime degli effetti e delle varianze non sono affidabili.':
    'The model did not converge: the estimates of the effects and variances are not reliable.',
  'Il modello stima un’intercetta e una pendenza per ogni gruppo, trattandole come estrazioni da una popolazione normale.':
    'The model estimates an intercept and a slope for each group, treating them as draws from a normal population.',
  'Il motore copre famiglie gaussiana, binomiale e Poisson con un solo fattore di raggruppamento e al più una pendenza casuale.':
    'The engine covers the Gaussian, binomial and Poisson families with a single grouping factor and at most one random slope.',
  'Il test z è asintotico: con pochi gruppi i gradi di libertà effettivi sono incerti.':
    'The z test is asymptotic: with few groups the effective degrees of freedom are uncertain.',
  'Il test z è asintotico: non usa gradi di libertà Satterthwaite o Kenward–Roger.':
    'The z test is asymptotic: it does not use Satterthwaite or Kenward–Roger degrees of freedom.',
  'Il test z è di Wald: con gruppi piccoli l’approssimazione può divergere dal test di verosimiglianza.':
    'The z test is a Wald test: with small groups the approximation may diverge from the likelihood-ratio test.',
  'Intercetta':
    'Intercept',
  'La covarianza tra intercetta e pendenza descrive se i gruppi che partono più alti tendono a crescere più o meno rapidamente.':
    'The covariance between intercept and slope describes whether groups that start higher tend to grow faster or more slowly.',
  'La pendenza media è un effetto fisso; la sua variabilità tra gruppi è un effetto casuale.':
    'The mean slope is a fixed effect; its variability across groups is a random effect.',
  'La verosimiglianza è approssimata con Laplace: con gruppi piccoli o risposte estreme l’approssimazione può essere imprecisa.':
    'The likelihood is approximated with Laplace: with small groups or extreme responses the approximation may be imprecise.',
  'Le varianze sono sulla scala del predittore lineare: per binomiale e Poisson non sono componenti di varianza della risposta osservata.':
    'The variances are on the linear predictor scale: for binomial and Poisson they are not variance components of the observed response.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: un ICC alto indica che ignorare il gruppo sottostima l’errore standard degli effetti fissi.':
    'The ICC is the share of variance attributable to groups: a high ICC indicates that ignoring the group underestimates the standard error of the fixed effects.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: valori alti indicano osservazioni molto correlate entro gruppo.':
    'The ICC is the share of variance attributable to groups: high values indicate observations that are strongly correlated within group.',
  'Log':
    'Log',
  'Logit':
    'Logit',
  'Modello lineare misto con pendenza casuale':
    'Linear mixed model with random slope',
  'Nella famiglia binomiale la separazione (esiti perfettamente separati) rende le stime instabili o divergenti.':
    'In the binomial family, separation (perfectly separated outcomes) makes the estimates unstable or divergent.',
  'Non estrapolare oltre i livelli osservati dei predittori né a gruppi nuovi non rappresentati nel campione.':
    'Do not extrapolate beyond the observed predictor levels or to new groups not represented in the sample.',
  'Pendenza':
    'Slope',
  'Poisson':
    'Poisson',
  'Report del modello misto con pendenza casuale':
    'Random-slope mixed model report',
  'Report di lettura — Modello lineare generalizzato misto':
    'Reading report — Generalized linear mixed model',
  'Rispetto al GLM, il GLMM aggiunge effetti casuali che assorbono la correlazione entro gruppo; rispetto al LMM, estende il modello a risposte non normali tramite famiglia e link.':
    'Compared with the GLM, the GLMM adds random effects that absorb within-group correlation; compared with the LMM, it extends the model to non-normal responses through family and link.',
  '{s1} ~ {s2} + (1 + {s3} | {s4}) · CI {s5}%':
    '{s1} ~ {s2} + (1 + {s3} | {s4}) · CI {s5}%',
  '{s1} ~ {s2} · effetti casuali per {s3} · CI {s4}%':
    '{s1} ~ {s2} · random effects for {s3} · CI {s4}%',
  '{s1} gruppi hanno effetti casuali stimati (BLUP); famiglia {s2}, link {s3}.':
    '{s1} groups have estimated random effects (BLUPs); family {s2}, link {s3}.',
  '{s1} gruppi · pendenza casuale su {s2}':
    '{s1} groups · random slope on {s2}',
  '{s1}: nessun predittore risulta significativo al livello scelto, con effetti casuali per {s2}; ICC = {s3}.':
    '{s1}: no predictor is significant at the chosen level, with random effects for {s2}; ICC = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello di confidenza del {s3}%.':
    '{s1} predictor(s) out of {s2} are significant at the {s3}% confidence level.',
  '{s1} spiegato da {s2} predittore/i con effetti casuali per {s3}; ICC = {s4}.':
    '{s1} explained by {s2} predictor(s) with random effects for {s3}; ICC = {s4}.',
  'SE intercetta':
    'Intercept SE',
  'SE pendenza':
    'Slope SE',
  'Servono almeno 5–10 gruppi per stimare una varianza di pendenza con una precisione accettabile.':
    'At least 5–10 groups are needed to estimate a slope variance with acceptable precision.',
  'Stima di massima verosimiglianza con effetti casuali normali e residui omoschedastici.':
    'Maximum likelihood estimate with normal random effects and homoscedastic residuals.',
  'Una varianza di pendenza vicina a zero indica che i gruppi crescono allo stesso modo; una correlazione positiva indica che i gruppi con intercetta più alta tendono ad avere pendenze più ripide.':
    'A slope variance close to zero indicates that groups grow in the same way; a positive correlation indicates that groups with a higher intercept tend to have steeper slopes.',
  'Una varianza stimata al bordo (vicina a zero) o una correlazione vicina a ±1 segnala un modello al limite dello spazio dei parametri.':
    'An estimated variance at the boundary (close to zero) or a correlation close to ±1 signals a model at the limit of the parameter space.',
  'Un GLMM serve quando le osservazioni sono raggruppate: dentro lo stesso gruppo le misure si somigliano e i residui non sono indipendenti.':
    'A GLMM is needed when observations are grouped: within the same group the measurements resemble one another and the residuals are not independent.',
  'Varianza della pendenza = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Slope variance = {s1}; intercept–slope correlation = {s2}.',
  'Varianza della pendenza casuale = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Random-slope variance = {s1}; intercept–slope correlation = {s2}.',
  'Varianza dell’intercetta casuale = {s1}; ICC = {s2}: il {s3}% della variabilità è attribuibile ai gruppi.':
    'Random-intercept variance = {s1}; ICC = {s2}: {s3}% of the variability is attributable to groups.',
  'Varianza pendenza':
    'Slope variance',
};
