/** English chart copy, part b: literal entries plus the later wave maps. */
import { timeMissingChartCopy } from './charts-time-missing';
import { distfitTTestChartCopy } from './charts-distfit-ttest';
import { lmmChartCopy } from './charts-lmm';
import { remainingChartCopy } from './charts-remaining';
import { l4ChartCopy } from './charts-l4';
import { categoricalMultivariateChartCopy } from './charts-multivariate';

export const chartCopyPartB: Record<string, string> = {
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
  ...remainingChartCopy,
  ...l4ChartCopy,
  ...categoricalMultivariateChartCopy,
  "Row":
    "Row",
  "Run length":
    "Run length",
  "Frequenze: {s1}":
    "Frequencies: {s1}",
  "{s1} osservazioni, {s2} modalità":
    "{s1} observations, {s2} levels",
  "Distribuzione e valori estremi":
    "Distribution and extreme values",
  "Scatola e baffi delle variabili selezionate":
    "Box plot of the selected variables",
  "Valori anomali":
    "Outliers",
  "Sequenza osservata: {s1}":
    "Observed sequence: {s1}",
  "Valori nell’ordine delle righe, punto di taglio {s1}":
    "Values in row order, cut point {s1}",
  "Una tendenza o un ciclo visibile spiega perché il test rifiuta la casualità; il test non localizza il punto di rottura.":
    "A visible trend or cycle explains why the test rejects randomness; the test does not locate the break point.",
  "Lunghezza delle sequenze: {s1}":
    "Run lengths: {s1}",
  "{s1} sequenze osservate":
    "{s1} observed runs",
  "Count": "Count",
  "Frequenze": "Frequencies",
  "Variable": "Variable",
  "Value": "Value",
  "Test delle sequenze": "Runs test",
  "Intervallo di tolleranza": "Tolerance interval",
  "C+ e C− sono le somme cumulative sopra e sotto il target; la linea tratteggiata è l’intervallo di decisione. Un punto oltre la linea è il segnale.": "C+ and C− are the cumulative sums above and below the target; the dashed line is the decision interval. A point beyond the line is the signal.",
  "CUSUM": "CUSUM",
  "CUSUM — {s1}": "CUSUM — {s1}",
  "Lato": "Side",
  "Somma cumulata": "Cumulative sum",
  "k = {s1}σ · h = {s2}σ": "k = {s1}σ · h = {s2}σ",
  "target {s1} · h {s2}σ": "target {s1} · h {s2}σ",
  "Intervallo di tolleranza — {s1}": "Tolerance interval — {s1}",
  "{s1}% popolazione · confidenza {s2}%": "{s1}% population · {s2}% confidence",
  "Copre il {s1}% della popolazione con confidenza {s2}%": "Covers {s1}% of the population with {s2}% confidence",
  "La barra va dal limite inferiore al limite superiore; il punto è la media. Non è un intervallo di confidenza della media: descrive dove cadono le singole osservazioni.": "The bar runs from the lower to the upper bound; the point is the mean. It is not a confidence interval for the mean: it describes where individual observations fall.",
  "C+": "C+",
  "C−": "C−",
  "Due proporzioni — {s1} per {s2}": "Two proportions — {s1} by {s2}",
  "Due tassi — {s1} per {s2}": "Two rates — {s1} by {s2}",
  "Proporzione osservata": "Observed proportion",
  "Proporzione — {s1}": "Proportion — {s1}",
  "Proporzioni per gruppo": "Proportions by group",
  "Rapporto tra tassi": "Rate ratio",
  "Rapporto {s1}": "Ratio {s1}",
  "Rate": "Rate",
  "Rate ratio": "Rate ratio",
  "Tasso di Poisson — {s1}": "Poisson rate — {s1}",
  "Tasso osservato": "Observed rate",
  "{s1} eventi su esposizione {s2}": "{s1} events over exposure {s2}",
  "“{s1}” in {s2}": "“{s1}” in {s2}",
  "Confronta l’altezza delle scatole e la lunghezza dei baffi: varianze uguali danno dispersioni simili.": "Compare the box heights and whisker lengths: equal variances give similar spreads.",
  "Dispersione per gruppo": "Spread by group",
  "Varianza e intervallo": "Variance and interval",
  "Varianza — {s1}": "Variance — {s1}",
  "Varianze — {s1} per {s2}": "Variances — {s1} by {s2}",
  "Variance": "Variance",
  "Differenze appaiate": "Paired differences",
  "Il test dei segni guarda solo da che parte cadono le differenze: la forma della distribuzione non conta.": "The sign test only looks at which side the differences fall on: the shape of the distribution does not matter.",
  "Test dei segni": "Sign test",
  "Zero": "Zero",
  "{s1} coppie, {s2} zeri esclusi": "{s1} pairs, {s2} zeros excluded",
  "{s1} − {s2}": "{s1} − {s2}",
  "Distribuzioni cumulative": "Cumulative distributions",
  "Kolmogorov–Smirnov — {s1}": "Kolmogorov–Smirnov — {s1}",
  "La distanza verticale massima tra le due curve è la statistica D; più le curve sono vicine, più le distribuzioni sono simili.": "The maximum vertical distance between the two curves is the D statistic; the closer the curves, the more similar the distributions.",
  "{s1} vs {s2}": "{s1} vs {s2}",
  "Distribuzione per gruppo": "Distribution by group",
  "La linea centrale di ogni scatola è la mediana del gruppo; il test confronta quante osservazioni cadono sopra e sotto la mediana comune.": "The centre line of each box is the group median; the test compares how many observations fall above and below the common median.",
  "Mediana comune {s1}": "Common median {s1}",
  "Test della mediana — {s1} per {s2}": "Median test — {s1} by {s2}",
  "Bontà di adattamento — {s1}": "Goodness of fit — {s1}",
  "Frequenze osservate": "Observed frequencies",
  "Le barre sono i conteggi osservati; confrontali con le attese riportate nella tabella.": "The bars are the observed counts; compare them with the expected values in the table.",
  "MH pooled": "MH pooled",
  "Log odds ratio per strato": "Log odds ratio by stratum",
  "Punto: log-OR dello strato o pooled. Segmento: intervallo di confidenza. Linea tratteggiata: log-OR = 0, cioè nessuna associazione.": "Point: stratum or pooled log-OR. Segment: confidence interval. Dashed line: log-OR = 0, i.e. no association.",
  "Log odds ratio": "Log odds ratio",
  "Mantel–Haenszel · {s1} strati": "Mantel–Haenszel · {s1} strata",
  "Proporzione per punteggio": "Proportion by score",
  "{s1} righe ordinate per punteggio": "{s1} rows ordered by score",
  "Trend di Cochran–Armitage · {s1} × 2": "Cochran–Armitage trend · {s1} × 2",
  "Residui standardizzati (test esatto)": "Standardised residuals (exact test)",
  "Il colore mostra quali celle si discostano di più dall’indipendenza; il test esatto misura quanto l’intera tabella è compatibile con i margini osservati.": "The colour shows which cells depart most from independence; the exact test measures how compatible the whole table is with the observed margins.",
  "Test esatto {s1} × {s2}": "Exact test {s1} × {s2}",
  "Proporzioni osservate e completate per categoria": "Observed and completed proportions by category",
  "Percentuale di righe · {s1} imputazioni": "Percentage of rows · {s1} imputations",
  "Le barre confrontano la distribuzione osservata con quella ricostruita dall’ultima imputazione: differenze sistematiche indicano un modello da rivedere.": "The bars compare the observed distribution with the one reconstructed by the last imputation: systematic differences indicate a model to revise.",
  "Variabile · categoria": "Variable · category",
  "Percentuale": "Percentage",
  "{s1} righe · {s2} variabili categoriche": "{s1} rows · {s2} categorical variables",
  "La barra dei mancanti misura le celle che l’imputazione categorica ricostruisce.": "The missing bar measures the cells that categorical imputation reconstructs.",
  "Proporzioni pooled per categoria": "Pooled proportions by category",
  "Punto: proporzione pooled. Segmento: intervallo di confidenza; le proporzioni di una variabile sommano a 1.": "Point: pooled proportion. Segment: confidence interval; the proportions of one variable sum to 1.",
  "Imputazione multipla categorica: {s1}": "Categorical multiple imputation: {s1}",
  "Confronto tra conteggi osservati e attesi": "Observed versus expected counts",
  "Modello log-lineare {s1} × {s2}": "Log-linear model {s1} × {s2}",
  "(O − E) / √E per ogni cella": "(O − E) / √E for each cell",
  "Osservato e atteso per cella": "Observed and expected by cell",
  "Valori positivi indicano celle più frequenti dell’atteso del modello; valori negativi meno frequenti. Con il modello saturo i residui sono nulli per costruzione.": "Positive values indicate cells more frequent than the model expects; negative values less frequent. With the saturated model the residuals are zero by construction.",
  "Barre vicine indicano che il modello riproduce bene la cella; scarti sistematici in una riga o colonna suggeriscono che l’effetto mancante è proprio lì.": "Close bars indicate that the model reproduces the cell well; systematic gaps in a row or column suggest that the missing effect is right there.",
};
