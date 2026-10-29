/** English prose of the agreement report and its tables. */
export const agreementCopy: Record<string, string> = {
  'Report di affidabilità':
    'Reliability report',
  'ICC(2,1) = {s1} su {s2} misure e {s3} soggetti.':
    'ICC(2,1) = {s1} across {s2} measurements and {s3} subjects.',
  'Affidabilità buona':
    'Good reliability',
  'Affidabilità moderata':
    'Moderate reliability',
  'Affidabilità bassa':
    'Poor reliability',
  'ICC(3,1) di consistenza = {s1}; F = {s2}, p = {s3}.':
    'ICC(3,1) consistency = {s1}; F = {s2}, p = {s3}.',
  'ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.':
    'An ICC near 1 indicates that the measurements are interchangeable; values below 0.5 indicate that between-subject variability cannot be told apart from measurement error.',
  'Il livello di confidenza richiesto è {s1}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.':
    'The requested confidence level is {s1}%, but the ICC is a descriptive index: there is no superiority test.',
  'L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.':
    'The ICC depends on sample variability: a narrow sample can inflate it.',
  'Report Bland–Altman':
    'Bland–Altman report',
  'Bias = {s1} (CI {s2}%: {s3} – {s4}).':
    'Bias = {s1} (CI {s2}%: {s3} – {s4}).',
  'Bias contenuto':
    'Small bias',
  'Bias da valutare':
    'Bias worth checking',
  'Limiti di accordo: {s1} – {s2}.':
    'Limits of agreement: {s1} – {s2}.',
  'Pendenza del bias sulla media = {s1} (p = {s2}).':
    'Slope of the bias on the mean = {s1} (p = {s2}).',
  'Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.':
    'The bias is the systematic mean difference; the limits of agreement describe how far the two measurements can diverge for a single subject.',
  'La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.':
    'The slope is significant: the bias is not constant and grows or falls with the level of the measurement.',
  'Non c’è evidenza di un bias proporzionale al livello della misura.':
    'There is no evidence of a bias proportional to the level of the measurement.',
  'I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.':
    'The limits of agreement are not confidence limits: they describe individual variability.',
  'Report di accordo categorico':
    'Categorical agreement report',
  'Kappa = {s1} (CI {s2}%: {s3} – {s4}).':
    'Kappa = {s1} (CI {s2}%: {s3} – {s4}).',
  'Accordo quasi perfetto':
    'Almost perfect agreement',
  'Accordo sostanziale':
    'Substantial agreement',
  'Accordo moderato':
    'Moderate agreement',
  'Accordo debole':
    'Weak agreement',
  'Accordo osservato = {s1}; accordo atteso per caso = {s2}.':
    'Observed agreement = {s1}; agreement expected by chance = {s2}.',
  'p = {s1} contro kappa = 0.':
    'p = {s1} against kappa = 0.',
  'Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.':
    'Kappa corrects the observed agreement for the agreement expected by chance. The 0.4/0.6/0.8 thresholds are conventions, not laws.',
  'Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.':
    'With more than two raters Fleiss kappa is used; disagreements between raters are not weighted.',
  'Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.':
    'With two raters Cohen kappa is used; disagreements can be weighted if the categories are ordered.',
  'Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.':
    'Kappa is sensitive to the prevalence of the categories and to the number of categories.',
  'Intraclass correlation':
    'Intraclass correlation',
  '{s1} soggetti × {s2} misure · CI {s3}%':
    '{s1} subjects × {s2} measurements · CI {s3}%',
  'Metrica':
    'Metric',
  'Valore':
    'Value',
  'ICC(1,1) one-way':
    'ICC(1,1) one-way',
  'ICC(2,1) absolute agreement':
    'ICC(2,1) absolute agreement',
  'ICC(3,1) consistency':
    'ICC(3,1) consistency',
  'F':
    'F',
  'p':
    'p',
  'MS between subjects':
    'MS between subjects',
  'MS between raters':
    'MS between raters',
  'MS residual':
    'MS residual',
  'ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.':
    'ICC(2,1) is the two-way random effects model with absolute agreement.',
  'ICC(3,1) ignora la differenza sistematica tra rater (consistency).':
    'ICC(3,1) ignores systematic differences between raters (consistency).',
  'Bland–Altman':
    'Bland–Altman',
  '{s1} coppie · CI {s2}%':
    '{s1} pairs · CI {s2}%',
  'Dettaglio':
    'Detail',
  'Bias':
    'Bias',
  'media delle differenze':
    'mean of the differences',
  'SD differenze':
    'SD of the differences',
  'dispersione delle differenze':
    'spread of the differences',
  'Limite superiore':
    'Upper limit',
  'bias + 1.96·SD':
    'bias + 1.96·SD',
  'Limite inferiore':
    'Lower limit',
  'bias − 1.96·SD':
    'bias − 1.96·SD',
  'CI bias low':
    'CI bias low',
  'CI bias high':
    'CI bias high',
  'CI limite sup. low':
    'Upper limit CI low',
  'CI limite sup. high':
    'Upper limit CI high',
  'CI limite inf. low':
    'Lower limit CI low',
  'CI limite inf. high':
    'Lower limit CI high',
  'Pendenza su media':
    'Slope on the mean',
  'bias proporzionale':
    'proportional bias',
  'p pendenza':
    'slope p',
  'H0: pendenza = 0':
    'H0: slope = 0',
  'I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).':
    'The limits of agreement are estimated as bias ± 1.96·SD; their CIs use the sqrt(3·SD²/n) approximation.',
  'Una pendenza significativa indica che il bias cambia con la grandezza della misura.':
    'A significant slope indicates that the bias changes with the size of the measurement.',
  'Cohen kappa':
    'Cohen kappa',
  'Fleiss kappa':
    'Fleiss kappa',
  '{s1} soggetti × {s2} rater · {s3} categorie · CI {s4}%':
    '{s1} subjects × {s2} raters · {s3} categories · CI {s4}%',
  'Accordo osservato':
    'Observed agreement',
  'Accordo atteso':
    'Expected agreement',
  'Kappa':
    'Kappa',
  'SE':
    'SE',
  'z':
    'z',
  'CI low':
    'CI low',
  'CI high':
    'CI high',
  'Kappa non pesata: tutte le discordanze contano allo stesso modo.':
    'Unweighted kappa: all disagreements count the same.',
  'Kappa pesata {s1} sulle categorie ordinate.':
    'Weighted kappa {s1} on the ordered categories.',
};
