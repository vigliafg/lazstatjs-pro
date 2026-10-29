/** English prose of the anova report and its tables. */
export const anovaCopy: Record<string, string> = {
  'rapporto sd':
    'SD ratio',
  'L’ANOVA non è calcolabile con i dati disponibili.':
    'ANOVA cannot be computed with the available data.',
  'Le medie di {s1} differiscono tra i gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}){s6}.':
    'The means of {s1} differ between the groups of {s2}: F = {s3}, {s4} (α threshold = {s5}){s6}.',
  ', η² = {s1} (effetto {s2})':
    ', η² = {s1} ({s2} effect)',
  'Non emerge una differenza tra le medie di {s1} nei gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}).':
    'No difference emerges between the means of {s1} across the groups of {s2}: F = {s3}, {s4} (α threshold = {s5}).',
  '{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.':
    '{s1}: n = {s2}, mean {s3} (CI {s4}% {s5}), median {s6}, SD {s7}.',
  '{s1}: differenza {s2}, {s3} → {s4}{s5}.':
    '{s1}: difference {s2}, {s3} → {s4}{s5}.',
  'p corretto':
    'corrected p',
  'differenza significativa':
    'significant difference',
  'nessuna differenza affidabile':
    'no reliable difference',
  '; Cohen’s d = {s1} ({s2})':
    '; Cohen’s d = {s1} ({s2})',
  'Medie dei gruppi':
    'Group means',
  'Il test principale':
    'The main test',
  'Statistica F = {s1} con df = ({s2}, {s3}).':
    'F statistic = {s1} with df = ({s2}, {s3}).',
  '{s1} (soglia α = {s2}).':
    '{s1} (α threshold = {s2}).',
  'Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.':
    'At least one group mean differs from the others: the null hypothesis of all means equal is rejected.',
  'L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.':
    'The null hypothesis of all means equal is not rejected: the data show no reliable differences between groups.',
  'Varianza spiegata dai gruppi: η² = {s1}, cioè circa il {s2}% della variabilità totale di {s3}.':
    'Variance explained by the groups: η² = {s1}, that is about {s2}% of the total variability of {s3}.',
  'ω² = {s1}: stima meno distorta della quota di varianza spiegata nella popolazione.':
    'ω² = {s1}: a less biased estimate of the share of variance explained in the population.',
  'Confronti post-hoc ({s1})':
    'Post-hoc comparisons ({s1})',
  'L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.':
    'ANOVA only says that the groups are not all equal: to know which pairs differ you need the pairwise comparisons, with p already corrected for the number of comparisons.',
  'Assunzioni e robustezza':
    'Assumptions and robustness',
  'Omoschedasticità: Levene {s1}{s2} → {s3}.':
    'Homoscedasticity: Levene {s1}{s2} → {s3}.',
  ', Brown–Forsythe {s1}':
    ', Brown–Forsythe {s1}',
  'varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis':
    'variances not homogeneous, so the classical ANOVA is at risk and Welch or Kruskal–Wallis is preferable',
  'assunzione di varianze uguali plausibile':
    'equal variances assumption plausible',
  'Omoschedasticità non verificabile con questi dati.':
    'Homoscedasticity cannot be checked with these data.',
  'Rapporto tra SD massima e minima: {s1} (valori molto sopra 2 indicano gruppi con dispersione diversa).':
    'Ratio between the largest and smallest SD: {s1} (values well above 2 indicate groups with different dispersion).',
  'Welch ANOVA: {s1} → {s2}.':
    'Welch ANOVA: {s1} → {s2}.',
  'conferma la differenza tra le medie anche senza assumere varianze uguali':
    'confirms the difference between the means even without assuming equal variances',
  'non conferma la differenza quando le varianze sono libere di differire':
    'does not confirm the difference when the variances are free to differ',
  'I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.':
    'The groups should come from independent observations: the same unit must not appear in two groups.',
  'Alternativa non parametrica':
    'Non-parametric alternative',
  'Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.':
    'Kruskal–Wallis: H = {s1} with df = {s2}, {s3} → {s4}.',
  'conferma che almeno un gruppo si distribuisce diversamente':
    'confirms that at least one group is distributed differently',
  'non conferma differenze tra i gruppi':
    'does not confirm differences between groups',
  'η²_H = {s1}: dimensione dell’effetto stimata sui ranghi.':
    'η²_H = {s1}: effect size estimated on the ranks.',
  'Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.':
    'Compare the two outcomes: if they diverge, the parametric result depends on the normality assumption and should be presented with more caution.',
  'Come leggere i numeri':
    'How to read the numbers',
  'F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.':
    'F compares the variability between the groups with that within the groups: values close to 1 indicate that the groups do not stand apart.',
  'η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.':
    'η² (eta squared) is the share of variability explained by the factor: 0.01 small, 0.06 medium, 0.14 large.',
  'I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.':
    'The post-hoc p values are already corrected: use them instead of the p values of the individual t-tests, which would be too optimistic.',
  'In pratica':
    'In practice',
  'Il fattore {s1} spiega una parte {s2} della variabilità di {s3}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.':
    'Factor {s1} explains a {s2} share of the variability of {s3}. To see which groups stand apart, read the post-hoc comparisons above.',
  'non quantificabile':
    'not quantifiable',
  'Non ci sono prove sufficienti che {s1} sposti {s2}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.':
    'There is not enough evidence that {s1} shifts {s2}. With small groups ANOVA has little power: absence of significance is not absence of effect.',
  'Report di lettura — ANOVA a una via':
    'Reading report — One-way ANOVA',
  'Gruppi diversi':
    'Different groups',
  'Nessuna differenza':
    'No difference',
  'Verifica se la media di {s1} cambia tra i livelli del fattore {s2}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.':
    'It checks whether the mean of {s1} changes across the levels of factor {s2}. The null hypothesis is that all group means are equal.',
  'L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.':
    'ANOVA compares the variability between the groups with that within the groups: if the groups really differ, the former is large relative to the latter.',
  'L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.':
    'ANOVA requires independent observations: repeated measures on the same unit need a model for paired data.',
  'Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.':
    'With strongly unbalanced groups or very different variances the classical test can give unreliable p values: use Welch ANOVA or Kruskal–Wallis.',
  'La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.':
    'Global significance does not say which groups differ: post-hoc comparisons are always needed.',
  'Descrittive per gruppo':
    'Descriptives by group',
  '{s1} per {s2} · CI {s3}%':
    '{s1} by {s2} · CI {s3}%',
  'Mean':
    'Mean',
  'SD':
    'SD',
  'Median':
    'Median',
  'Min':
    'Min',
  'Max':
    'Max',
  'CI della media entro gruppo: t di Student con df = n_gruppo − 1.':
    'CI of the mean within group: Student t with df = n_group − 1.',
  'ANOVA a una via':
    'One-way ANOVA',
  'H₀: tutte le medie uguali · α = {s1}':
    'H₀: all means equal · α = {s1}',
  'Source':
    'Source',
  'Between (gruppi)':
    'Between (groups)',
  'Within (errore)':
    'Within (error)',
  'F = MS_between / MS_within; p da F({s1}, {s2}).':
    'F = MS_between / MS_within; p from F({s1}, {s2}).',
  'Effect size':
    'Effect size',
  'Misura':
    'Measure',
  'Stima':
    'Estimate',
  'Interpretazione':
    'Interpretation',
  'η²':
    'η²',
  'partial η²':
    'partial η²',
  'ω²':
    'ω²',
  'ε²':
    'ε²',
  'Cohen\'s f':
    'Cohen\'s f',
  'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.':
    'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.',
  'In un ANOVA a una via partial η² coincide con η².':
    'In a one-way ANOVA partial η² coincides with η².',
  'Levene (media)':
    'Levene (mean)',
  'omoschedasticità':
    'homoscedasticity',
  'Brown–Forsythe (mediana)':
    'Brown–Forsythe (median)',
  'robusto agli outlier':
    'robust to outliers',
  'Rapporto SD max/min':
    'SD max/min ratio',
  'omogeneità descrittiva delle SD':
    'descriptive homogeneity of the SDs',
  'Welch ANOVA':
    'Welch ANOVA',
  'alternativa con varianze diseguali':
    'alternative with unequal variances',
  'Jarque–Bera {s1}':
    'Jarque–Bera {s1}',
  'normalità residui del gruppo (N = {s1})':
    'normality of the group residuals (N = {s1})',
  'Assunzioni':
    'Assumptions',
  'Controllo':
    'Check',
  'Statistica':
    'Statistic',
  'df1':
    'df1',
  'df2':
    'df2',
  'Nota':
    'Note',
  'Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.':
    'Significant Levene: variances not homogeneous. Also report the Welch ANOVA and/or Kruskal–Wallis.',
  'Nessuna evidenza di eteroschedasticità.':
    'No evidence of heteroscedasticity.',
  'Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.':
    'The max(SD)/min(SD) ratio is a further descriptive check of homogeneity.',
  'Tukey–Kramer (approssimazione Bonferroni)':
    'Tukey–Kramer (Bonferroni approximation)',
  'FDR (Benjamini–Hochberg)':
    'FDR (Benjamini–Hochberg)',
  'Games–Howell (Welch pairwise)':
    'Games–Howell (Welch pairwise)',
  'Post-hoc':
    'Post-hoc',
  'Mean diff':
    'Mean diff',
  'p non corretto':
    'uncorrected p',
  'Cohen\'s d':
    'Cohen\'s d',
  '{s1} vs {s2}':
    '{s1} vs {s2}',
  'Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.':
    'Here Tukey–Kramer uses the t approximation with Bonferroni adjustment: stated explicitly so it is not passed off as the exact studentised range.',
  'I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.':
    'The CIs are individual (not simultaneous) at the chosen level; for Holm/Bonferroni the p is corrected, the CI is not.',
  'Cohen’s d per confronto usa la SD within pooled (√MS_within).':
    'Cohen’s d for each comparison uses the pooled within SD (√MS_within).',
  'Kruskal–Wallis H (non parametrico)':
    'Kruskal–Wallis H (non-parametric)',
  'H':
    'H',
  'η²_H':
    'η²_H',
  'H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.':
    'H corrected for tied ranks; η²_H = (H − k + 1)/(N − k) is an effect size.',
  'Ranghi per gruppo':
    'Ranks by group',
  'Rank sum':
    'Rank sum',
  'Mean rank':
    'Mean rank',
  'Post-hoc Dunn':
    'Post-hoc Dunn',
  'correzione FDR':
    'FDR correction',
  'correzione Bonferroni':
    'Bonferroni correction',
  'Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.':
    'Dunn uses the rank variance with a correction for ties; p corrected with Holm or Bonferroni.',
};
