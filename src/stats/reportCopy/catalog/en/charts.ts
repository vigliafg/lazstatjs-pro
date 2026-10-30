/** English copy for chart titles, notes and axis labels. */
import { categoricalMultivariateChartCopy } from './charts-multivariate';
import { timeMissingChartCopy } from './charts-time-missing';
import { distfitTTestChartCopy } from './charts-distfit-ttest';
import { lmmChartCopy } from './charts-lmm';

export const chartCopy: Record<string, string> = {
  " Con stime instabili gli intervalli non finiti sono omessi dal grafico.":
    " With unstable estimates, non-finite intervals are omitted from the chart.",
  "ANCOVA: {s1} per {s2}":
    "ANCOVA: {s1} by {s2}",
  "ANOVA a una via e Kruskal-Wallis: {s1} per {s2}":
    "One-way ANOVA and Kruskal-Wallis: {s1} by {s2}",
  "ANOVA a una via: {s1} per {s2}":
    "One-way ANOVA: {s1} by {s2}",
  "ANOVA fattoriale: {s1} per {s2} × {s3}":
    "Factorial ANOVA: {s1} by {s2} × {s3}",
  "ANOVA per misure ripetute":
    "Repeated-measures ANOVA",
  "Accordo tra le due misure":
    "Agreement between the two measurements",
  "Aggiustata":
    "Adjusted",
  "Alpha di Cronbach":
    "Cronbach alpha",
  "Alternativa non parametrica all’ANOVA":
    "Non-parametric alternative to ANOVA",
  "Analisi delle componenti principali":
    "Principal component analysis",
  "Analisi delle correlazioni":
    "Correlation analysis",
  "Analisi fattoriale esplorativa":
    "Exploratory factor analysis",
  "Autocorrelazione":
    "Autocorrelation",
  "Banda ±{s1}":
    "Band ±{s1}",
  "Bias {s1} · limiti {s2} / {s3}":
    "Bias {s1} · limits {s2} / {s3}",
  "Bland–Altman: accordo tra le misure":
    "Bland–Altman: agreement between measurements",
  "Blu: valori osservati. Giallo tratteggiato: previsione ARIMA. Grigio: intervallo di previsione.":
    "Blue: observed values. Yellow dashed: ARIMA forecast. Grey: prediction interval.",
  "Blu: valori osservati. Giallo: previsioni del modello semplice con l’RMSE più basso.":
    "Blue: observed values. Yellow: forecasts from the simple model with the lowest RMSE.",
  "Campione":
    "Sample",
  "Cochran Q: proporzione di successi":
    "Cochran Q: proportion of successes",
  "Confronta la distribuzione dei due gruppi; la linea centrale è la mediana.":
    "Compares the distribution of the two groups; the central line is the median.",
  "Confronta le due misurazioni appaiate; ogni coppia resta sullo stesso soggetto.":
    "Compares the two paired measurements; each pair stays on the same subject.",
  "Confronto delle distribuzioni per gruppo":
    "Distribution comparison by group",
  "Confronto delle medie":
    "Means comparison",
  "Confronto delle scale":
    "Scale comparison",
  "Correlazione: dispersione grezza":
    "Correlation: raw scatter",
  "Correlazione: ranghi di Spearman":
    "Correlation: Spearman ranks",
  "Cox: hazard ratio":
    "Cox: hazard ratio",
  "Curva di potenza":
    "Power curve",
  "Curva di probabilità":
    "Probability curve",
  "Curve di Kaplan–Meier":
    "Kaplan–Meier curves",
  "Diagnostica di accuratezza del modello":
    "Model accuracy diagnostic",
  "Differenze":
    "Differences",
  "Distribuzione (istogramma): {s1}":
    "Distribution (histogram): {s1}",
  "Distribuzione dei residui":
    "Residual distribution",
  "Distribuzione delle variabili selezionate":
    "Distribution of the selected variables",
  "Domanda":
    "Question",
  "Fit della distribuzione: {s1}":
    "Distribution fit: {s1}",
  "Frequenza":
    "Frequency",
  "Friedman: ranghi medi":
    "Friedman: mean ranks",
  "Grafico a scatola e baffi":
    "Box and whisker plot",
  "Grafico dell’interazione":
    "Interaction plot",
  "Grafico di probabilità":
    "Probability plot",
  "Grezza":
    "Raw",
  "Guidami nella scelta":
    "Guide my choice",
  "Hazard ratio per covariata":
    "Hazard ratio per covariate",
  "H₀: mediana = 0":
    "H₀: median = 0",
  "I punti vicini alla diagonale indicano residui compatibili con la normalità.":
    "Points close to the diagonal indicate residuals compatible with normality.",
  "I punti vicini alla diagonale indicano una distribuzione compatibile con la normale.":
    "Points close to the diagonal indicate a distribution compatible with normality.",
  "IC {s1}%":
    "CI {s1}%",
  "IC {s1}% · N = {s2}":
    "CI {s1}% · N = {s2}",
  "IC {s1}% · scala lineare":
    "CI {s1}% · linear scale",
  "Il test confronta i ranghi medi dei gruppi.":
    "The test compares the mean ranks of the groups.",
  "Il test non parametrico confronta i ranghi dei due gruppi.":
    "The non-parametric test compares the ranks of the two groups.",
  "Il test non parametrico confronta la mediana con il valore di riferimento.":
    "The non-parametric test compares the median with the reference value.",
  "Jonckheere–Terpstra: {s1} per {s2}":
    "Jonckheere–Terpstra: {s1} by {s2}",
  "Kruskal-Wallis: ranghi per gruppo":
    "Kruskal-Wallis: ranks by group",
  "La curva mostra quanto si guadagna aumentando n: se il punto richiesto è già sul tratto piatto, aumentare il campione serve poco.":
    "The curve shows the gain from increasing n: if the required point is already on the flat part, a larger sample helps little.",
  "La curva è la probabilità stimata dall’esito (0–100%); i punti in alto sono le osservazioni con esito = 1, quelli in basso con esito = 0.":
    "The curve is the estimated probability of the outcome (0–100%); upper points are observations with outcome = 1, lower points with outcome = 0.",
  "La diagonale rappresenta la corrispondenza perfetta tra valori osservati e stimati.":
    "The diagonal is perfect agreement between observed and fitted values.",
  "La linea centrale è il bias medio; le linee tratteggiate sono i limiti di accordo (bias ± 1,96·SD).":
    "The central line is the mean bias; dashed lines are the limits of agreement (bias ± 1.96·SD).",
  "La linea centrale è la mediana; i baffi arrivano ai valori non outlier.":
    "The central line is the median; whiskers reach the non-outlier values.",
  "La linea tratteggiata è il valore di test; la media osservata è il punto.":
    "The dashed line is the test value; the observed mean is the point.",
  "La linea tratteggiata è lo zero; il test non parametrico confronta le differenze con zero.":
    "The dashed line is zero; the non-parametric test compares the differences with zero.",
  "La mediana dei residui dovrebbe essere vicina a zero e le due distribuzioni simili.":
    "The residual median should be close to zero and the two distributions similar.",
  "Le barre aggiustate sono le medie alla media delle covariate: è questa la differenza che l’ANCOVA testa.":
    "Adjusted bars are means at the mean of the covariates: this is the difference ANCOVA tests.",
  "Le barre d’errore sono l’intervallo di confidenza della media entro il modello.":
    "Error bars are the model confidence interval of the mean.",
  "Le barre oltre le linee tratteggiate indicano autocorrelazione non attribuibile al caso.":
    "Bars beyond the dashed lines indicate autocorrelation not attributable to chance.",
  "Le barre sono la percentuale di varianza spiegata da ogni componente.":
    "Bars are the percentage of variance explained by each component.",
  "Le barre verdi sono le frequenze osservate, quelle blu le frequenze attese sotto l’ipotesi di indipendenza.":
    "Green bars are observed frequencies, blue bars are expected frequencies under independence.",
  "Lo spazio dei ranghi riduce l’effetto di valori estremi e distribuzioni asimmetriche.":
    "Rank space reduces the effect of extreme values and skewed distributions.",
  "Mann-Whitney: ranghi per gruppo":
    "Mann-Whitney: ranks by group",
  "McNemar: accordo tra misure binarie":
    "McNemar: agreement between binary measurements",
  "Media delle due misure":
    "Mean of the two measurements",
  "Medie grezze e aggiustate":
    "Raw and adjusted means",
  "Medie per condizione":
    "Means by condition",
  "Medie per gruppo con IC {s1}%":
    "Means by group with {s1}% CI",
  "Misurazione":
    "Measurement",
  "N = {s1}":
    "N = {s1}",
  "N = {s1} · R² = {s2}":
    "N = {s1} · R² = {s2}",
  "Numerosità campionaria e potenza":
    "Sample size and power",
  "Ogni gradino è un evento; i tratti piatti indicano che in quell’intervallo non ci sono stati eventi.":
    "Each step is an event; flat segments mean no events occurred in that interval.",
  "Ogni punto è un caso completo; la nuvola mostra direzione e forza dell’associazione.":
    "Each point is a complete case; the cloud shows the direction and strength of the association.",
  "Ogni punto è un caso proiettato sulle due prime componenti.":
    "Each point is a case projected on the first two components.",
  "Osservati vs attesi per cella":
    "Observed vs expected by cell",
  "Osservati vs stimati: {s1}":
    "Observed vs fitted: {s1}",
  "Più i punti stanno sulla diagonale, meglio la distribuzione descrive i dati. Le deviazioni alle estremità indicano code mal descritte.":
    "The closer the points to the diagonal, the better the distribution describes the data. Deviations at the tails indicate poorly described tails.",
  "Potenza (%)":
    "Power (%)",
  "Potenza {s1}% · α = {s2}":
    "Power {s1}% · α = {s2}",
  "Previsioni ARIMA / SARIMA":
    "ARIMA / SARIMA forecasts",
  "Probabilità (%)":
    "Probability (%)",
  "Probabilità stimata":
    "Estimated probability",
  "Proporzione di successi":
    "Proportion of successes",
  "Punteggi dei componenti":
    "Component scores",
  "Punti: osservazioni. Linea rossa tratteggiata: OLS. Linea verde: Theil-Sen. La banda, se attiva, è l’intervallo scelto.":
    "Points: observations. Red dashed line: OLS. Green line: Theil-Sen. The band, when enabled, is the selected interval.",
  "Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1, cioè nessun effetto. Il grafico usa una scala lineare, quindi gli HR protettivi sono compressi vicino allo zero.":
    "Point: HR estimate. Segment: confidence interval. Dashed line: HR = 1, no effect. The chart uses a linear scale, so protective HRs are compressed near zero.",
  "Q-Q dei residui":
    "Residual Q-Q",
  "Q-Q normale: {s1}":
    "Normal Q-Q: {s1}",
  "Quantili teorici":
    "Theoretical quantiles",
  "Raccomandazione":
    "Recommendation",
  "Ranghi medi":
    "Mean ranks",
  "Rango":
    "Rank",
  "Regola di Cochran: una o più frequenze attese sono minori di 5 (minimo {s1}). Il test chi-quadro standard può essere impreciso; valuta la correzione di Yates.":
    "Cochran rule: one or more expected frequencies are below 5 (minimum {s1}). The standard chi-square test may be inaccurate; consider Yates correction.",
  "Regressione lineare e stimatori robusti: {s1}":
    "Linear regression and robust estimators: {s1}",
  "Regressione lineare: {s1} per {s2}":
    "Linear regression: {s1} on {s2}",
  "Regressione logistica: {s1}":
    "Logistic regression: {s1}",
  "Residui":
    "Residuals",
  "Residui osservati":
    "Observed residuals",
  "Residui vs stimati: {s1}":
    "Residuals vs fitted: {s1}",
  "Scree plot — varianza spiegata":
    "Scree plot — explained variance",
  "Serie e previsioni (modello semplice)":
    "Series and forecasts (simple model)",
  "Serie temporale: {s1}":
    "Time series: {s1}",
  "Sopravvivenza":
    "Survival",
  "Sopravvivenza: {s1} per {s2}":
    "Survival: {s1} by {s2}",
  "Statistiche descrittive":
    "Descriptive statistics",
  "T-test":
    "T-test",
  "T-test a un campione e Wilcoxon: {s1}":
    "One-sample t-test and Wilcoxon: {s1}",
  "T-test a un campione: {s1}":
    "One-sample t-test: {s1}",
  "T-test per campioni appaiati":
    "Paired-samples t-test",
  "T-test per campioni appaiati e Wilcoxon":
    "Paired-samples t-test and Wilcoxon",
  "T-test per campioni indipendenti":
    "Independent-samples t-test",
  "T-test per campioni indipendenti e Mann-Whitney":
    "Independent-samples t-test and Mann-Whitney",
  "Test chi-quadro di indipendenza":
    "Chi-square test of independence",
  "Una nuvola senza struttura è coerente con l’ipotesi di residui omoschedastici.":
    "A structureless cloud is consistent with homoscedastic residuals.",
  "Valore di riferimento = {s1}":
    "Reference value = {s1}",
  "Valore test μ = {s1}":
    "Test value μ = {s1}",
  "Valori medi delle variabili selezionate":
    "Mean values of the selected variables",
  "Valori osservati":
    "Observed values",
  "Valori stimati":
    "Fitted values",
  "Varianza spiegata (%)":
    "Explained variance (%)",
  "Wilcoxon: distribuzione delle differenze":
    "Wilcoxon: distribution of differences",
  "Wilcoxon: distribuzione e mediana H₀":
    "Wilcoxon: distribution and H₀ median",
  "passi":
    "steps",
  "raccomandazione":
    "recommendation",
  "{s1} blocchi · {s2} condizioni binarie":
    "{s1} blocks · {s2} binary conditions",
  "{s1} blocchi · {s2} misure ripetute":
    "{s1} blocks · {s2} repeated measures",
  "{s1} componenti trattenute":
    "{s1} retained components",
  "{s1} osservazioni":
    "{s1} observations",
  "{s1} passi previsti":
    "{s1} forecast steps",
  "{s1} soggetti · {s2} condizioni":
    "{s1} subjects · {s2} conditions",
  "χ² = {s1} · p = {s2}":
    "χ² = {s1} · p = {s2}",
  "Modello":
    "Model",
  "Residuo":
    "Residual",
  "Differenza":
    "Difference",
  "Tempo":
    "Time",
  "Gruppo":
    "Group",
  "n per gruppo":
    "n per group",
  "Condizione":
    "Condition",
  "Rango medio":
    "Mean rank",
  "Proporzione":
    "Proportion",
  "Osservazioni":
    "Observations",
  "Serie":
    "Series",
  "Componente":
    "Component",
  "Osservato":
    "Observed",
  "Atteso":
    "Expected",
  "Cella":
    "Cell",
  "Tipo":
    "Type",
  "Media":
    "Mean",
  "Stima":
    "Estimate",
  "Variabile":
    "Variable",
  "Valore":
    "Value",
  "Hazard ratio":
    "Hazard ratio",
  "Covariata":
    "Covariate",
  "Lag":
    "Lag",
  "Previsione":
    "Forecast",
  "Kappa: accordo categorico":
    "Kappa: categorical agreement",
  "Matrice di accordo":
    "Agreement matrix",
  "κ = {s1} · {s2} valutatori":
    "κ = {s1} · {s2} raters",
  "La diagonale contiene gli accordi; le celle fuori diagonale sono i disaccordi tra categorie.":
    "The diagonal contains agreements; off-diagonal cells are disagreements between categories.",
  "Valutatore / categoria":
    "Rater / category",
  "ICC: affidabilità tra misure":
    "ICC: reliability between measurements",
  "Accordo tra le prime due misure":
    "Agreement between the first two measurements",
  "ICC(2,1) = {s1} · N = {s2}":
    "ICC(2,1) = {s1} · N = {s2}",
  "I punti vicini alla diagonale indicano accordo tra le due misurazioni.":
    "Points close to the diagonal indicate agreement between the two measurements.",
  "Entrambi positivi":
    "Both positive",
  "Solo {s1}":
    "Only {s1}",
  "Entrambi negativi":
    "Both negative",
  "Coppie concordanti e discordanti":
    "Concordant and discordant pairs",
  "{s1} coppie · p esatto = {s2}":
    "{s1} pairs · exact p = {s2}",
  "Il test usa le coppie discordanti: quelle in cui i due valutatori non concordano.":
    "The test uses discordant pairs: those where the two raters disagree.",
  "Categoria":
    "Category",
  "Conteggio":
    "Count",
  "Distribuzione per gruppo ordinato":
    "Distribution by ordered group",
  "Il test cerca un aumento monotono dell’esito lungo l’ordine dei gruppi.":
    "The test looks for a monotonic increase of the outcome along the group order.",
  "Soggetto":
    "Subject",
  "Interazione gruppo × condizione":
    "Group × condition interaction",
  "Traiettorie dei soggetti":
    "Subject trajectories",
  "Prime {s1} righe complete":
    "First {s1} complete rows",
  "Ogni linea è un soggetto attraverso le condizioni; serve a vedere la variabilità individuale.":
    "Each line is one subject across conditions; it shows individual variability.",
  "ANOVA mista: {s1} per {s2}":
    "Mixed ANOVA: {s1} by {s2}",
  "TOST: differenza e margini di equivalenza":
    "TOST: difference and equivalence margins",
  "Differenza {s1} · IC {s2}% · margine ±{s3}":
    "Difference {s1} · CI {s2}% · margin ±{s3}",
  "La barra è la differenza stimata con il suo intervallo; le linee tratteggiate sono i margini di equivalenza.":
    "The bar is the estimated difference with its interval; dashed lines are the equivalence margins.",
  "Equivalenza TOST":
    "TOST equivalence",
  "Regressione per conteggi: {s1}":
    "Count regression: {s1}",
  "Osservati vs predetti":
    "Observed vs predicted",
  "N = {s1} · famiglia {s2}":
    "N = {s1} · family {s2}",
  "La diagonale è la corrispondenza perfetta tra conteggi osservati e predetti.":
    "The diagonal is perfect agreement between observed and predicted counts.",
  "Valori predetti":
    "Predicted values",
  "Residui vs predetti":
    "Residuals vs predicted",
  "Una nuvola senza struttura è coerente con il modello; pattern sistematici suggeriscono un legame mal specificato.":
    "A structureless cloud is consistent with the model; systematic patterns suggest a misspecified link.",
  "Regressione ordinale: {s1}":
    "Ordinal regression: {s1}",
  "Probabilità predette per categoria":
    "Predicted probabilities by category",
  "Profilo di {s1}; altri predittori alla media":
    "Profile of {s1}; other predictors at their mean",
  "Le curve mostrano come cambia la probabilità di ciascuna categoria al variare del primo predittore.":
    "The curves show how the probability of each category changes with the first predictor.",
  "La diagonale è la corrispondenza perfetta; l’ICC misura quanta variabilità resta tra i gruppi.":
    "The diagonal is perfect agreement; ICC measures how much variability remains between groups.",
  "Residui senza struttura sono coerenti con l’ipotesi di varianza costante.":
    "Structureless residuals are consistent with constant variance.",
  "Medie per gruppo":
    "Means by group",
  "La barra è la media osservata del gruppo; l’ICC riassume la quota di varianza tra gruppi.":
    "The bar is the observed group mean; ICC summarises the share of variance between groups.",
  "Modello misto: {s1}":
    "Mixed model: {s1}",
  "GEE: {s1}":
    "GEE: {s1}",
  "La diagonale è la corrispondenza perfetta; i punti sono le osservazioni complete.":
    "The diagonal is perfect agreement; points are complete observations.",
  "Medie osservate e predette per cluster":
    "Observed and predicted means by cluster",
  "{s1} cluster":
    "{s1} clusters",
  "Le due barre confrontano la media osservata e quella predetta dal modello marginale in ogni cluster.":
    "The two bars compare the observed mean and the marginal-model prediction in each cluster.",
  "Predetto":
    "Predicted",
  "Cluster":
    "Cluster",
  "IC {s1}% · {s2} strati":
    "CI {s1}% · {s2} strata",
  "Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1. I coefficienti sono condivisi tra gli strati.":
    "Point: HR estimate. Segment: confidence interval. Dashed line: HR = 1. Coefficients are shared across strata.",
  "Cox stratificato":
    "Stratified Cox",
  "IC {s1}% · {s2} intervalli":
    "CI {s1}% · {s2} intervals",
  "Punto: stima dell’HR. Segmento: intervallo di confidenza. Linea tratteggiata: HR = 1. Le covariate possono cambiare tra intervalli start-stop.":
    "Point: HR estimate. Segment: confidence interval. Dashed line: HR = 1. Covariates may change between start-stop intervals.",
  "Cox con covariate tempo-dipendenti":
    "Cox with time-dependent covariates",
  "Sopravvivenza parametrica: {s1}":
    "Parametric survival: {s1}",
  "Curve di sopravvivenza per profilo":
    "Survival curves by profile",
  "{s1} · profili a media ± 1 DS del primo predittore":
    "{s1} · profiles at mean ± 1 SD of the first predictor",
  "Le altre covariate sono tenute al loro valore medio; le curve mostrano come cambia la sopravvivenza al variare del primo predittore.":
    "The other covariates are held at their mean; the curves show how survival changes with the first predictor.",
  "Profilo":
    "Profile",
  "Tabella di contingenza {s1} × {s2}":
    "Contingency table {s1} × {s2}",
  "Residui standardizzati":
    "Standardised residuals",
  "Osservato − atteso, diviso per la radice dell’atteso":
    "Observed − expected, divided by the square root of expected",
  "Valori positivi indicano celle più frequenti dell’atteso sotto indipendenza; valori negativi meno frequenti.":
    "Positive values mark cells more frequent than expected under independence; negative values less frequent.",
  "Colonna":
    "Column",
  "Riga":
    "Row",
  "Mancante":
    "Missing",
  "Imputazione multipla: {s1}":
    "Multiple imputation: {s1}",
  "Valori osservati e mancanti":
    "Observed and missing values",
  "{s1} righe · {s2} imputazioni":
    "{s1} rows · {s2} imputations",
  "La barra grigia misura i valori mancanti per variabile: sono i valori che l’imputazione ricostruisce.":
    "The grey bar counts missing values per variable: these are the values imputation reconstructs.",
  "Stato":
    "Status",
  "Permutazione e bootstrap":
    "Permutation and bootstrap",
  "Distribuzione bootstrap della differenza":
    "Bootstrap distribution of the difference",
  "{s1} ricampionamenti · IC {s2}%":
    "{s1} resamples · CI {s2}%",
  "Le linee tratteggiate sono i limiti dell’intervallo percentile; la linea continua è la differenza osservata.":
    "Dashed lines are the percentile interval limits; the solid line is the observed difference.",
  "Distribuzione nulla di permutazione":
    "Permutation null distribution",
  "{s1} permutazioni · p = {s2}":
    "{s1} permutations · p = {s2}",
  "La distribuzione mostra le differenze ottenibili se i gruppi fossero intercambiabili; la linea è la differenza osservata.":
    "The distribution shows the differences obtainable if the groups were exchangeable; the line is the observed difference.",
  "Hazard per profilo":
    "Hazard by profile",
  "Il rischio istantaneo è calcolato dalla stessa distribuzione parametrica; le altre covariate restano alla media.":
    "The instantaneous risk is computed from the same parametric distribution; the other covariates stay at their mean.",
  "Hazard":
    "Hazard",
  "Hazard cumulativo per profilo":
    "Cumulative hazard by profile",
  "L’hazard cumulativo è −log S(t): riassume il rischio accumulato fino a ciascun tempo.":
    "The cumulative hazard is −log S(t): it summarises the risk accumulated up to each time.",
  "Hazard cumulativo":
    "Cumulative hazard",
  "Distribuzione osservata: {s1}":
    "Observed distribution: {s1}",
  "{s1} valori osservati":
    "{s1} observed values",
  "Distribuzione dopo l’imputazione: {s1}":
    "Distribution after imputation: {s1}",
  "{s1} valori completati":
    "{s1} completed values",
  "Confronta la distribuzione osservata con quella completata dalle imputazioni.":
    "Compare the observed distribution with the one completed by imputation.",
  "{s1} · altri predittori alla media":
    "{s1} · other predictors at their mean",
  "La curva mostra il profilo del primo predittore mantenendo gli altri al valore medio; i punti sono le osservazioni.":
    "The curve shows the profile of the first predictor while keeping the others at their mean; the points are the observations.",
  "Soggetto {s1}":
    "Subject {s1}",
  "Ogni linea è un soggetto attraverso le condizioni; linee non parallele indicano risposte diverse al trattamento.":
    "Each line is a subject across conditions; non-parallel lines indicate different responses to the treatment.",
  "Matrice di correlazione":
    "Correlation matrix",
  "La diagonale vale 1; i colori mostrano direzione e forza delle correlazioni a coppie.":
    "The diagonal is 1; the colours show the direction and strength of the pairwise correlations.",
  "Kaplan–Meier per strato":
    "Kaplan–Meier by stratum",
  "{s1} strati · IC {s2}%":
    "{s1} strata · CI {s2}%",
  "Le curve descrivono la sopravvivenza osservata in ogni strato; il modello Cox condivide le stime delle covariate tra gli strati.":
    "The curves describe the observed survival in each stratum; the Cox model shares covariate estimates across strata.",
  "Strato":
    "Stratum",
  "Medie e intervalli di confidenza":
    "Means and confidence intervals",
  "Dotplot delle variabili selezionate":
    "Dotplot of the selected variables",
  "Distribuzione cumulativa: {s1}":
    "Cumulative distribution: {s1}",
  "Valore cumulativo":
    "Cumulative proportion",
  "Diagnostica: scala-location":
    "Diagnostics: scale-location",
  "Radice del residuo standardizzato rispetto ai valori stimati":
    "Square root of the standardized residual against fitted values",
  "La curva dovrebbe restare piatta: un andamento a imbuto suggerisce varianza non costante.":
    "The curve should stay flat: a funnel shape suggests non-constant variance.",
  "√|residuo standardizzato|":
    "√|standardized residual|",
  "Residui standardizzati vs leverage":
    "Standardized residuals vs leverage",
  "Soglia di leverage 2p/n = {s1}":
    "Leverage threshold 2p/n = {s1}",
  "Osservazioni con leverage alto o residui grandi meritano attenzione; le linee tratteggiate sono a ±2.":
    "Observations with high leverage or large residuals deserve attention; dashed lines are at ±2.",
  "Leverage":
    "Leverage",
  "Residuo standardizzato":
    "Standardized residual",
  "Distanza di Cook":
    "Cook's distance",
  "Osservazioni influenti":
    "Influential observations",
  "La linea tratteggiata è la soglia 4/n; i punti etichettati sono le osservazioni più influenti.":
    "The dashed line is the 4/n threshold; labelled points are the most influential observations.",
  "Osservazione":
    "Observation",
  "Residui parziali: {s1}":
    "Partial residuals: {s1}",
  "Componente di {s1} più residuo":
    "Component of {s1} plus residual",
  "La linea mostra l’effetto del predittore dopo aver tolto gli altri; una curvatura suggerisce una relazione non lineare.":
    "The line shows the predictor effect after removing the others; curvature suggests a non-linear relationship.",
  "{s1} (centrata)":
    "{s1} (centered)",
  "Residuo parziale":
    "Partial residual",
  "Curva ROC":
    "ROC curve",
  "Sensibilità vs 1 − specificità · AUC = {s1}":
    "Sensitivity vs 1 − specificity · AUC = {s1}",
  "La diagonale rappresenta l’assenza di discriminazione; una curva più alta verso l’angolo superiore sinistro indica maggiore capacità discriminante.":
    "The diagonal represents no discrimination; a curve closer to the top-left corner indicates better discrimination.",
  "Nessuna discriminazione":
    "No discrimination",
  "1 − specificità (%)":
    "1 − specificity (%)",
  "Sensibilità (%)":
    "Sensitivity (%)",
  "Calibrazione del modello":
    "Model calibration",
  "Probabilità osservata vs probabilità stimata":
    "Observed vs predicted probability",
  "I punti sono i decili di probabilità stimata; la diagonale indica calibrazione perfetta.":
    "Points are deciles of predicted probability; the diagonal indicates perfect calibration.",
  "Calibrazione":
    "Calibration",
  "Calibrazione perfetta":
    "Perfect calibration",
  "Probabilità stimata (%)":
    "Predicted probability (%)",
  "Probabilità osservata (%)":
    "Observed probability (%)",
  "Tabella dei soggetti a rischio":
    "Number at risk",
  "Soggetti a rischio per gruppo ai tempi selezionati":
    "Subjects at risk by group at the selected times",
  "Numero a rischio; tra parentesi gli eventi cumulati.":
    "Number at risk; cumulative events in parentheses.",
  "Rischio cumulato di base":
    "Baseline cumulative hazard",
  "H₀(t) di Breslow al profilo medio delle covariariate":
    "Breslow H₀(t) at the mean covariate profile",
  "La curva cresce a ogni evento; un salto verticale indica un evento con rischio elevato.":
    "The curve increases at each event; a vertical jump marks an event with high risk.",
  "Rischio cumulato":
    "Cumulative hazard",
  "Sopravvivenza di base":
    "Baseline survival",
  "S₀(t) al profilo medio delle covariariate":
    "S₀(t) at the mean covariate profile",
  "La curva scende a ogni evento; il valore non va letto come la sopravvivenza media della coorte.":
    "The curve falls at each event; it must not be read as the cohort average survival.",
  "Residui di Schoenfeld: {s1}":
    "Schoenfeld residuals: {s1}",
  "Tempo dell’evento":
    "Event time",
  "Un andamento nel tempo suggerisce una violazione del rischio proporzionale.":
    "A trend over time suggests a proportional-hazards violation.",
  ...timeMissingChartCopy,
  ...distfitTTestChartCopy,
  ...lmmChartCopy,
  ...categoricalMultivariateChartCopy,
};
