/** English prose of the ttest report and its tables. */
export const ttestCopy: Record<string, string> = {
  'Mann–Whitney U':
    'Mann–Whitney U',
  'Wilcoxon signed-rank':
    'Wilcoxon signed-rank',
  '{s1} e {s2}':
    '{s1} and {s2}',
  '{s1} e il valore di riferimento {s2}':
    '{s1} and the reference value {s2}',
  ' L’effetto è {s1} (Hedges g = {s2}).':
    ' The effect is {s1} (Hedges g = {s2}).',
  'Le medie di {s1} sono diverse: {s2} (soglia α = {s3}).{s4}':
    'The means of {s1} differ: {s2} (α threshold = {s3}).{s4}',
  'Non emerge una differenza statisticamente significativa tra {s1}: {s2} (soglia α = {s3}).{s4}':
    'No statistically significant difference emerges between {s1}: {s2} (α threshold = {s3}).{s4}',
  'Poiché {s1} resta sotto la soglia α = {s2}, l’ipotesi nulla viene rifiutata: la differenza osservata è difficile da spiegare con la sola variabilità campionaria.':
    'Because {s1} stays below the α = {s2} threshold, the null hypothesis is rejected: the observed difference is hard to explain by sampling variability alone.',
  'Poiché {s1} non raggiunge la soglia α = {s2}, l’ipotesi nulla non viene rifiutata: i dati non bastano per affermare che esista una differenza.':
    'Because {s1} does not reach the α = {s2} threshold, the null hypothesis is not rejected: the data are not enough to claim that a difference exists.',
  'Intervallo di confidenza al {s1}% della media: {s2}. {s3}':
    'Confidence interval for the mean at {s1}%: {s2}. {s3}',
  'Contiene {s1}, quindi è coerente con un test non significativo.':
    'It contains {s1}, so it is consistent with a non-significant test.',
  'Non contiene {s1}, quindi è coerente con un test significativo.':
    'It does not contain {s1}, so it is consistent with a significant test.',
  'Intervallo di confidenza al {s1}% della differenza: {s2}. {s3}':
    'Confidence interval for the difference at {s1}%: {s2}. {s3}',
  'Contiene lo zero, quindi è coerente con un test non significativo.':
    'It contains zero, so it is consistent with a non-significant test.',
  'Non contiene lo zero, quindi è coerente con un test significativo.':
    'It does not contain zero, so it is consistent with a significant test.',
  'Confronta la media di {s1} con il valore di riferimento μ₀ = {s2}. L’ipotesi nulla è che la media della popolazione sia uguale a quel valore.':
    'It compares the mean of {s1} with the reference value μ₀ = {s2}. The null hypothesis is that the population mean equals that value.',
  'Il test t divide la distanza tra media osservata e valore atteso per l’errore standard: un t grande significa che la distanza è grande rispetto al rumore dei dati.':
    'The t-test divides the distance between the observed mean and the expected value by the standard error: a large t means the distance is large relative to the noise in the data.',
  'Confronta le medie di due gruppi indipendenti, {s1} e {s2}, presi da righe diverse del foglio. L’ipotesi nulla è che le due medie nella popolazione siano uguali.':
    'It compares the means of two independent groups, {s1} and {s2}, taken from different rows of the sheet. The null hypothesis is that the two population means are equal.',
  'Il test t divide la differenza tra le medie per l’errore standard della differenza: un t grande significa che lo scarto è grande rispetto alla variabilità dei due gruppi.':
    'The t-test divides the difference between the means by the standard error of the difference: a large t means the gap is large relative to the variability of the two groups.',
  'Confronta due misure prese sulle stesse righe, {s1} e {s2}, lavorando sulle differenze riga per riga. L’ipotesi nulla è che la differenza media nella popolazione sia zero.':
    'It compares two measurements taken on the same rows, {s1} and {s2}, working on row-by-row differences. The null hypothesis is that the population mean difference is zero.',
  'Ogni riga viene ridotta a una sola differenza, poi si controlla quanto quella differenza media è lontana da zero rispetto alla sua variabilità.':
    'Each row is reduced to a single difference, then the test checks how far that mean difference is from zero relative to its variability.',
  'Differenza media rispetto a μ₀: {s1}.':
    'Mean difference from μ₀: {s1}.',
  'Differenza tra le medie: {s1} ({s2} − {s3}).':
    'Difference between the means: {s1} ({s2} − {s3}).',
  'Errore standard della stima: {s1}.':
    'Standard error of the estimate: {s1}.',
  'Statistica t = {s1} con df = {s2}.':
    't statistic = {s1} with df = {s2}.',
  'p-value a due code':
    'two-sided p-value',
  'Quanto è grande la differenza':
    'How large the difference is',
  'Hedges g = {s1}: effetto {s2} secondo le soglie convenzionali (0.2 piccolo, 0.5 medio, 0.8 grande).':
    'Hedges g = {s1}: {s2} effect by the conventional thresholds (0.2 small, 0.5 medium, 0.8 large).',
  'Effect size non calcolabile con questo campione.':
    'Effect size not computable with this sample.',
  'Correlazione con l’appartenenza al gruppo: r = {s1}, cioè un’associazione {s2}.':
    'Correlation with group membership: r = {s1}, that is, a {s2} association.',
  'r² = {s1}: circa il {s2}% della variabilità è riconducibile alla differenza tra le condizioni.':
    'r² = {s1}: about {s2}% of the variability is attributable to the difference between the conditions.',
  'Un effetto statisticamente significativo può essere piccolo: con molti dati basta una differenza minima. La significatività dice che la differenza è probabilmente reale, non che è importante.':
    'A statistically significant effect can be small: with lots of data a minimal difference is enough. Significance says the difference is probably real, not that it matters.',
  'Assunzioni e alternative':
    'Assumptions and alternatives',
  'Normalità: Lilliefors {s1} → {s2}.':
    'Normality: Lilliefors {s1} → {s2}.',
  'rifiutata, quindi il test t va letto con cautela (soglia {s1})':
    'rejected, so read the t-test with caution (threshold {s1})',
  'non rifiutata, assunzione ragionevole':
    'not rejected, a reasonable assumption',
  'Normalità: questa tabella non riporta il test sui due gruppi; con n ≥ 30 per gruppo il t-test è comunque robusto, altrimenti controlla le descrittive di ogni gruppo prima di fidarti del p.':
    'Normality: this table does not report the test on the two groups; with n ≥ 30 per group the t-test is robust anyway, otherwise check the descriptives of each group before trusting the p-value.',
  'Uguaglianza delle varianze: Levene {s1}{s2} → {s3}.':
    'Equality of variances: Levene {s1}{s2} → {s3}.',
  'varianze probabilmente diverse: meglio il t di Welch':
    'variances probably differ: Welch’s t is better',
  'nessuna evidenza contro l’uguaglianza delle varianze':
    'no evidence against equal variances',
  'Uguaglianza delle varianze non verificabile con questi dati.':
    'Equality of variances cannot be checked with these data.',
  'Nel disegno appaiato l’assunzione riguarda la normalità delle differenze, non delle due misure separatamente: l’ordine delle righe deve corrispondere alla stessa unità osservata.':
    'In the paired design the assumption concerns the normality of the differences, not of the two measures separately: row order must match the same observed unit.',
  '{s1}: {s2} → {s3}; confrontare i due risultati dà la misura di quanto l’esito dipenda dall’assunzione di normalità.':
    '{s1}: {s2} → {s3}; comparing the two results shows how much the outcome depends on the normality assumption.',
  'conferma la presenza di una differenza':
    'confirms the presence of a difference',
  'non conferma la differenza':
    'does not confirm the difference',
  'La differenza tra {s1} è probabilmente reale. Per decidere se è rilevante, confronta l’ampiezza con quella che consideri clinicamente o praticamente importante: l’effetto misurato è {s2}.':
    'The difference between {s1} is probably real. To decide whether it matters, compare its size with what you consider clinically or practically important: the measured effect is {s2}.',
  'I dati non mostrano una differenza affidabile tra {s1}. Questo non dimostra che le medie siano identiche: con pochi dati il test ha poca potenza e una differenza reale può restare invisibile.':
    'The data do not show a reliable difference between {s1}. This does not prove the means are identical: with few data the test has little power and a real difference can stay invisible.',
  'Se il risultato è al limite della soglia, aumenta il campione o replica lo studio prima di prendere decisioni.':
    'If the result sits at the threshold, increase the sample or replicate the study before making decisions.',
  'df (gradi di libertà) descrive quanta informazione indipendente resta nei dati: più è grande, più il test è preciso.':
    'df (degrees of freedom) describes how much independent information remains in the data: the larger it is, the more precise the test.',
  'Hedges g è la differenza espressa in deviazioni standard: rende confrontabili misure con unità diverse.':
    'Hedges g is the difference expressed in standard deviations: it makes measures with different units comparable.',
  'Report di lettura — Test t':
    'Reading report — T-Test',
  'Le righe vengono appaiate per posizione: se l’ordine delle osservazioni non è corretto il test perde senso.':
    'Rows are paired by position: if the order of the observations is wrong the test loses its meaning.',
  'Il test riguarda le medie: se la distribuzione è molto asimmetrica, la mediana e i test non parametrici descrivono meglio il fenomeno.':
    'The test concerns the means: with a strongly skewed distribution, the median and non-parametric tests describe the phenomenon better.',
  'Un p-value non dice nulla sulla dimensione dell’effetto né sulla rilevanza pratica del risultato.':
    'A p-value says nothing about the size of the effect or the practical relevance of the result.',
  'Con più confronti ripetuti aumenta la probabilità di falsi positivi: correggi per le comparazioni multiple o pianifica un solo confronto principale.':
    'With many repeated comparisons the chance of false positives grows: correct for multiple comparisons or plan a single primary comparison.',
  'JB su N = {s1}':
    'JB on N = {s1}',
  'Campione e statistiche descrittive':
    'Sample and descriptive statistics',
  'Solo righe con entrambe le colonne numeriche: {s1} coppie complete, {s2} coppie escluse.':
    'Only rows with both columns numeric: {s1} complete pairs, {s2} pairs excluded.',
  'Le statistiche descrittive dei gruppi sono calcolate sulle sole coppie complete, per coerenza con il test.':
    'The group descriptive statistics are computed on complete pairs only, for consistency with the test.',
  'Missing = celle vuote o non numeriche escluse dal calcolo.':
    'Missing = empty or non-numeric cells excluded from the calculation.',
  'Test t per un campione':
    'One-sample t-test',
  'H₀: μ = {s1} · due code · α = {s2}':
    'H₀: μ = {s1} · two-sided · α = {s2}',
  'Mean − μ₀':
    'Mean − μ₀',
  'SE diff':
    'SE diff',
  'p (2 code)':
    'p (2-sided)',
  'p (1 coda)':
    'p (1-sided)',
  '{s1} vs μ₀':
    '{s1} vs μ₀',
  'CI della differenza: (M − μ₀) ± t({s1}%, df = {s2}) · SE.':
    'CI of the difference: (M − μ₀) ± t({s1}%, df = {s2}) · SE.',
  'p a una coda riferito alla direzione osservata (metà del p a due code).':
    'One-sided p referred to the observed direction (half the two-sided p).',
  'Cohen\'s d (one-sample)':
    'Cohen\'s d (one-sample)',
  'Hedges g':
    'Hedges g',
  'r punto-biseriale':
    'point-biserial r',
  'd = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); CI normale approssimato.':
    'd = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); approximate normal CI.',
  'Hedges g applica il fattore di correzione per campioni piccoli J = 1 − 3/(4N − 5).':
    'Hedges g applies the small-sample correction factor J = 1 − 3/(4N − 5).',
  'Lilliefors (KS)':
    'Lilliefors (KS)',
  'normalità con parametri stimati':
    'normality with estimated parameters',
  'Con N piccolo i test di normalità hanno potenza limitata: valutare anche il Q-Q plot.':
    'With small N the normality tests have limited power: also check the Q-Q plot.',
  'Wilcoxon signed-rank (non parametrico)':
    'Wilcoxon signed-rank (non-parametric)',
  'H₀: mediana = {s1}':
    'H₀: median = {s1}',
  'N effettivo':
    'effective N',
  'W⁺':
    'W⁺',
  'W⁻':
    'W⁻',
  'W':
    'W',
  'Rank-biserial':
    'Rank-biserial',
  'Approssimazione normale con correzione di continuità e correzione per i ranghi pari; differenze nulle escluse.':
    'Normal approximation with continuity correction and tied-rank correction; zero differences excluded.',
  'W riportato = min(W⁺, W⁻); r = z/√N è la dimensione dell’effetto; rank-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).':
    'W reported = min(W⁺, W⁻); r = z/√N is the effect size; rank-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).',
  'Hodges–Lehmann':
    'Hodges–Lehmann',
  'Metodo':
    'Method',
  'mediana delle differenze; CI bootstrap percentile':
    'median of the differences; percentile bootstrap CI',
  'CI bootstrap con 500 repliche e seed fisso; può differire leggermente da software che usa il metodo esatto.':
    'Bootstrap CI with 500 replicates and fixed seed; it can differ slightly from software using the exact method.',
  'Test t per campioni indipendenti (varianze uguali)':
    'Independent-samples t-test (equal variances)',
  'Test t di Welch (varianze diseguali)':
    'Welch t-test (unequal variances)',
  'H₀: μ₁ = μ₂ · due code · α = {s1}':
    'H₀: μ₁ = μ₂ · two-sided · α = {s1}',
  'Mean diff (A − B)':
    'Mean diff (A − B)',
  'Varianza pooled: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = {s1}.':
    'Pooled variance: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = {s1}.',
  'Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = {s1}.':
    'Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = {s1}.',
  'CI della differenza: diff ± t({s1}%, df) · SE.':
    'CI of the difference: diff ± t({s1}%, df) · SE.',
  'Cohen\'s d (pooled)':
    'Cohen\'s d (pooled)',
  'Glass Δ (SD gruppo A)':
    'Glass Δ (SD group A)',
  'd = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).':
    'd = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).',
  'Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass usa la SD del gruppo A come riferimento.':
    'Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass uses the SD of group A as reference.',
  'Levene significativo: l’assunzione di varianze uguali è dubbia, preferire Welch.':
    'Significant Levene: the equal variances assumption is doubtful, prefer Welch.',
  'Nessuna evidenza di eteroschedasticità a questo livello.':
    'No evidence of heteroscedasticity at this level.',
  'Mann–Whitney U (non parametrico)':
    'Mann–Whitney U (non-parametric)',
  'U':
    'U',
  'CLES':
    'CLES',
  'U riportato per ciascun gruppo (U₁ + U₂ = n₁·n₂); la significatività usa U = min(U₁, U₂) con approssimazione normale, correzione di continuità e correzione dei ranghi pari.':
    'U reported for each group (U₁ + U₂ = n₁·n₂); significance uses U = min(U₁, U₂) with normal approximation, continuity correction and tied-rank correction.',
  'CLES = U₁/(n₁n₂) = probabilità che un valore del gruppo A superi uno del gruppo B; rank-biserial = 2·CLES − 1.':
    'CLES = U₁/(n₁n₂) = probability that a value of group A exceeds one of group B; rank-biserial = 2·CLES − 1.',
  'Stima (A − B)':
    'Estimate (A − B)',
  'mediana di tutte le differenze A − B; CI bootstrap percentile':
    'median of all A − B differences; percentile bootstrap CI',
  'CI bootstrap con 400 repliche e seed fisso.':
    'Bootstrap CI with 400 replicates and fixed seed.',
  'Test t per campioni appaiati':
    'Paired-samples t-test',
  'H₀: μ_diff = 0 · due code · α = {s1}':
    'H₀: μ_diff = 0 · two-sided · α = {s1}',
  'Differenze calcolate riga per riga su {s1} coppie complete; le righe con una cella mancante sono escluse dall’intero test.':
    'Differences computed row by row on {s1} complete pairs; rows with a missing cell are excluded from the whole test.',
  'CI: diff ± t({s1}%, df = {s2}) · SE.':
    'CI: diff ± t({s1}%, df = {s2}) · SE.',
  'Cohen\'s d_z':
    'Cohen\'s d_z',
  'Hedges g_z':
    'Hedges g_z',
  'r tra le coppie':
    'r between the pairs',
  'quota di varianza condivisa':
    'share of shared variance',
  'd_z = media delle differenze / SD delle differenze; SE(d_z) ≈ √(1/n + d_z²/(2n)).':
    'd_z = mean of the differences / SD of the differences; SE(d_z) ≈ √(1/n + d_z²/(2n)).',
  'La correlazione tra le coppie descrive l’accoppiamento, non l’effetto del trattamento.':
    'The correlation between the pairs describes the pairing, not the treatment effect.',
  'Jarque–Bera differenze':
    'Jarque–Bera differences',
  'Lilliefors differenze':
    'Lilliefors differences',
  'normalità delle differenze':
    'normality of the differences',
  'Il test t appaiato assume normalità delle differenze, non delle due variabili separatamente.':
    'The paired t-test assumes normality of the differences, not of the two variables separately.',
  'H₀: mediana delle differenze = 0':
    'H₀: median of the differences = 0',
  'Approssimazione normale con correzione di continuità e dei ranghi pari; differenze nulle escluse.':
    'Normal approximation with continuity correction and tied-rank correction; zero differences excluded.',
  'CI bootstrap con 500 repliche e seed fisso.':
    'Bootstrap CI with 500 replicates and fixed seed.',
};
