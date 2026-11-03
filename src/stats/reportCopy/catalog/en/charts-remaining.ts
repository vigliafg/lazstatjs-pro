/** English copy for the remaining regression, ANCOVA, time-series and agreement charts. */
export const remainingChartCopy: Record<string, string> = {
  "Bias e limiti di accordo con IC":
    "Bias and limits of agreement with CI",
  "Ogni punto è una stima (bias o limite) e il segmento è il suo intervallo di confidenza: limiti di accordo imprecisi vanno letti con cautela.":
    "Each dot is an estimate (bias or limit) and the segment is its confidence interval: imprecise limits of agreement must be read with caution.",
  "Bias":
    "Bias",
  "Limite superiore":
    "Upper limit",
  "Limite inferiore":
    "Lower limit",
  "Kappa con intervallo di confidenza":
    "Kappa with confidence interval",
  "Se l’intervallo contiene lo zero l’accordo osservato non è distinguibile dal caso.":
    "If the interval contains zero the observed agreement is indistinguishable from chance.",
  "Kappa":
    "Kappa",
  "Matrice di confusione":
    "Confusion matrix",
  "Soglia {s1}":
    "Cut-off {s1}",
  "Righe: esito osservato. Colonne: classe predetta. La diagonale contiene le classificazioni corrette.":
    "Rows: observed outcome. Columns: predicted class. The diagonal holds the correct classifications.",
  "Predetto 1":
    "Predicted 1",
  "Predetto 0":
    "Predicted 0",
  "Osservato 1":
    "Observed 1",
  "Osservato 0":
    "Observed 0",
  "Classe predetta":
    "Predicted class",
  "Esito osservato":
    "Observed outcome",
  "Odds ratio per predittore":
    "Odds ratio per predictor",
  "IC {s1}% · riferimento OR = 1":
    "{s1}% CI · reference OR = 1",
  "Punto: odds ratio. Segmento: intervallo di confidenza. Se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.":
    "Dot: odds ratio. Segment: confidence interval. If the interval contains 1 the predictor is indistinguishable from no effect.",
  "Punto: odds ratio cumulativo. Segmento: intervallo di confidenza; se contiene 1 il predittore non è distinguibile da nessun effetto.":
    "Dot: cumulative odds ratio. Segment: confidence interval; if it contains 1 the predictor is indistinguishable from no effect.",
  "Odds ratio":
    "Odds ratio",
  "Predittore":
    "Predictor",
  "Dispersione vs livello":
    "Spread vs level",
  "Media e deviazione standard delle variabili selezionate":
    "Mean and standard deviation of the selected variables",
  "Serve a vedere se le variabili più grandi hanno anche più variabilità; una relazione crescente suggerisce eteroschedasticità o scala.":
    "Shows whether larger variables also have more variability; an increasing relation suggests heteroscedasticity or scale.",
  "Deviazione standard":
    "Standard deviation",
  "Differenze tra gruppi (post-hoc)":
    "Between-group differences (post-hoc)",
  "IC {s1}% · riferimento 0":
    "{s1}% CI · reference 0",
  "Punto: differenza media tra i due gruppi. Segmento: intervallo di confidenza; se contiene lo zero la coppia non è distinguibile.":
    "Dot: mean difference between the two groups. Segment: confidence interval; if it contains zero the pair is indistinguishable.",
  "Residui vs medie di gruppo":
    "Residuals vs group means",
  "Residui senza struttura indicano che la media di gruppo descrive i dati; imbuti o curvature suggeriscono varianze diverse.":
    "Unstructured residuals indicate that the group mean describes the data; funnels or curvature suggest unequal variances.",
  "Media di gruppo":
    "Group mean",
  "Dispersione: {s1} × {s2}":
    "Scatter: {s1} × {s2}",
  "Casi completi: {s1}":
    "Complete cases: {s1}",
  "Una linea crescente indica associazione positiva, una decrescente negativa; la nuvola mostra anche valori anomali.":
    "A rising line indicates a positive association, a falling one a negative association; the cloud also shows outliers.",
  "Densità spettrale (periodogramma)":
    "Spectral density (periodogram)",
  "Frequenze da 1/N a 1/2":
    "Frequencies from 1/N to 1/2",
  "I picchi indicano le frequenze dominanti: un picco alla frequenza 1/periodo segnala la stagionalità.":
    "Peaks indicate the dominant frequencies: a peak at 1/period signals seasonality.",
  "Periodogramma":
    "Periodogram",
  "Potenza":
    "Power",
  "Media mobile":
    "Moving mean",
  "DS mobile":
    "Moving SD",
  "Statistiche mobili":
    "Rolling statistics",
  "Finestra di {s1} osservazioni":
    "Window of {s1} observations",
  "La media mobile evidenzia il trend; la DS mobile mostra se la variabilità cambia nel tempo.":
    "The moving mean highlights the trend; the moving SD shows whether variability changes over time.",
  "Statistica":
    "Statistic",
  "I punti vicini alla diagonale indicano residui compatibili con la normale; code pesanti suggeriscono sovradispersione o outlier.":
    "Points close to the diagonal indicate residuals compatible with normality; heavy tails suggest overdispersion or outliers.",
  "Rapporti di incidenza per predittore":
    "Incidence-rate ratios per predictor",
  "IC {s1}% · riferimento IRR = 1":
    "{s1}% CI · reference IRR = 1",
  "Punto: rapporto di incidenza. Segmento: intervallo di confidenza; se contiene 1 il predittore non è distinguibile da nessun effetto.":
    "Dot: incidence-rate ratio. Segment: confidence interval; if it contains 1 the predictor is indistinguishable from no effect.",
  "Rapporto di incidenza":
    "Incidence-rate ratio",
  "Punto: rapporto di incidenza. Segmento: intervallo robusto per cluster; se contiene 1 il predittore non è distinguibile da nessun effetto.":
    "Dot: incidence-rate ratio. Segment: cluster-robust interval; if it contains 1 the predictor is indistinguishable from no effect.",
  "Dispersione di Pearson":
    "Pearson dispersion",
  "Pearson χ² / df":
    "Pearson χ² / df",
  "Valori vicini a 1 indicano dispersione coerente con la famiglia scelta; valori molto sopra 1 suggeriscono sovradispersione.":
    "Values near 1 indicate dispersion consistent with the chosen family; values far above 1 suggest overdispersion.",
  "Poisson":
    "Poisson",
  "Binomiale negativa":
    "Negative binomial",
  "Famiglia":
    "Family",
  "Dispersione":
    "Dispersion",
  "Soglie del modello":
    "Model thresholds",
  "IC {s1}% sulle soglie α":
    "{s1}% CI on the α thresholds",
  "Le soglie separano le categorie ordinate; intervalli molto ampi indicano poca informazione su quel confine.":
    "Thresholds separate the ordered categories; very wide intervals indicate little information about that boundary.",
  "Soglia":
    "Threshold",
  "Confine":
    "Boundary",
  "Residui medi per cluster":
    "Mean residuals per cluster",
  "IC 95% approssimato · riferimento 0":
    "Approximate 95% CI · reference 0",
  "Ogni punto è il residuo medio del cluster: scostamenti sistematici dallo zero indicano cluster mal descritti dal modello marginale.":
    "Each dot is the cluster mean residual: systematic departures from zero indicate clusters poorly described by the marginal model.",
  "Residuo medio":
    "Mean residual",
  "Rapporti dei tempi per predittore":
    "Time ratios per predictor",
  "IC {s1}% · riferimento 1":
    "{s1}% CI · reference 1",
  "Punto: rapporto dei tempi (time ratio). Valori sopra 1 allungano il tempo all’evento; se l’intervallo contiene 1 il predittore non è distinguibile da nessun effetto.":
    "Dot: time ratio. Values above 1 lengthen the time to the event; if the interval contains 1 the predictor is indistinguishable from no effect.",
  "Rapporto dei tempi":
    "Time ratio",
  "Sopravvivenza mediana per profilo":
    "Median survival per profile",
  "Tempo in cui S(t) = 0,5":
    "Time at which S(t) = 0.5",
  "La mediana è calcolata dalla distribuzione parametrica: barre più alte indicano un evento atteso più tardi.":
    "The median is computed from the parametric distribution: higher bars indicate a later expected event.",
  "Tempo mediano":
    "Median time",
  "Le linee tratteggiate sono i limiti dell’intervallo percentile, quelle punteggiate i limiti BCa; la linea continua è la differenza osservata.":
    "Dashed lines are the percentile interval limits, dotted lines the BCa limits; the solid line is the observed difference.",
  "I punti vicini alla diagonale indicano residui compatibili con la normale.":
    "Points close to the diagonal indicate residuals compatible with normality.",
  "Cambiamento rispetto alla prima condizione":
    "Change from the first condition",
  "Differenze appaiate · IC {s1}%":
    "Paired differences · {s1}% CI",
  "Il punto è la differenza media rispetto alla prima condizione; se l’intervallo non contiene lo zero il cambiamento è compatibile con un effetto non nullo.":
    "The dot is the mean difference from the first condition; if the interval excludes zero the change is compatible with a non-null effect.",
  "Profilo aggiustato per covariata":
    "Adjusted profile by covariate",
  "{s1} · altre covariate alla media":
    "{s1} · other covariates at their mean",
  "Linee parallele indicano pendenze comuni; linee divergenti suggeriscono un’interazione gruppo × covariata.":
    "Parallel lines indicate common slopes; diverging lines suggest a group × covariate interaction.",
  "Risposta aggiustata":
    "Adjusted response",
  "Residui senza struttura indicano che il modello descrive i dati; imbuti o curvature suggeriscono varianze diverse o un legame mal specificato.":
    "Unstructured residuals indicate that the model describes the data; funnels or curvature suggest unequal variances or a misspecified relation.",
  "Residui di martingala":
    "Martingale residuals",
  "Tempo dell’evento · N = {s1}":
    "Event time · N = {s1}",
  "I residui di martingala riassumono l’accordo tra evento osservato e rischio stimato: valori molto negativi segnalano osservazioni con rischio sovrastimato.":
    "Martingale residuals summarise the agreement between observed event and estimated risk: very negative values mark observations with overestimated risk.",
  "Residuo di martingala":
    "Martingale residual",
  "Sopravvivenza predetta per profilo":
    "Predicted survival per profile",
  "Profili a media ± 1 DS di {s1}":
    "Profiles at mean ± 1 SD of {s1}",
  "Le altre covariariate restano alla media; la curva usa la baseline di Breslow del modello.":
    "The other covariates stay at their mean; the curve uses the model's Breslow baseline.",
  "Sopravvivenza media ristretta":
    "Restricted mean survival",
  "Area sotto la curva KM fino all’ultimo tempo osservato":
    "Area under the KM curve up to the last observed time",
  "La RMST riassume quanti unità di tempo, in media, i soggetti sopravvivono entro l’orizzonte osservato; barre più alte indicano sopravvivenza media più lunga.":
    "RMST summarises how many time units subjects survive on average within the observed horizon; higher bars indicate longer mean survival.",
  "RMST":
    "RMST",
  "Sensibilità della numerosità":
    "Sample-size sensitivity",
  "n richiesto al variare dell’effetto":
    "Required n as the effect changes",
  "La curva mostra quanto cambia il campione necessario quando l’effetto ipotizzato cambia: effetti più piccoli richiedono campioni molto più grandi.":
    "The curve shows how the required sample changes with the assumed effect: smaller effects need much larger samples.",
  "Effetto ipotizzato":
    "Assumed effect",
  "Effetti marginali medi":
    "Average marginal effects",
  "Variazione media della probabilità per una unità in più":
    "Average change in probability per one more unit",
  "L’effetto marginale medio approssima di quanto cambia la probabilità predetta quando il predittore aumenta di una unità, mediando sulle osservazioni.":
    "The average marginal effect approximates how much the predicted probability changes when the predictor increases by one unit, averaging over observations.",
  "Effetto marginale":
    "Marginal effect",
  "Pattern dei valori mancanti":
    "Missing-value patterns",
  "O = osservato · M = mancante":
    "O = observed · M = missing",
  "Ogni barra conta le righe con la stessa combinazione di valori osservati e mancanti; i pattern frequenti guidano la scelta del modello di imputazione.":
    "Each bar counts the rows with the same combination of observed and missing values; frequent patterns guide the choice of imputation model.",
  "Pattern":
    "Pattern",
  "Righe":
    "Rows",
  "Confronti a coppie (Nemenyi)":
    "Pairwise comparisons (Nemenyi)",
  "p non corrette · {s1} blocchi":
    "uncorrected p · {s1} blocks",
  "Valori bassi indicano coppie con ranghi diversi; la correzione Nemenyi controlla i confronti multipli.":
    "Low values indicate pairs with different ranks; the Nemenyi correction controls for multiple comparisons.",
  "Rootogramma dei conteggi":
    "Count rootogram",
  "Frequenze osservate e attese per conteggio":
    "Observed and expected frequencies per count",
  "Confronta quante osservazioni hanno ciascun conteggio con quante ne prevede il modello: barre molto diverse segnalano un fit scarso nelle code o nello zero.":
    "Compares how many observations have each count with how many the model predicts: very different bars indicate a poor fit in the tails or at zero.",
  "Mappa delle probabilità per categoria":
    "Category probability map",
  "Le righe sono le categorie ordinate, le colonne i valori del predittore: il colore mostra la probabilità predetta.":
    "Rows are the ordered categories, columns the predictor values: colour shows the predicted probability.",
  "Variazione media della risposta per una unità in più":
    "Average change in response per one more unit",
  "L’effetto marginale medio approssima di quanto cambia la risposta predetta quando il predittore aumenta di una unità, mediando sulle osservazioni.":
    "The average marginal effect approximates how much the predicted response changes when the predictor increases by one unit, averaging over observations.",
  "Rischio cumulato di base per strato":
    "Baseline cumulative hazard per stratum",
  "Nelson–Aalen per strato":
    "Nelson–Aalen per stratum",
  "Ogni curva è il rischio cumulato osservato nello strato; serve a confrontare l’andamento di base senza assumere rischi proporzionali tra strati.":
    "Each curve is the cumulative hazard observed in the stratum; it compares baseline behaviour without assuming proportional hazards between strata.",
  "ICC(2,1) con intervallo di confidenza":
    "ICC(2,1) with confidence interval",
  "Il punto è l’ICC(2,1); se l’intervallo include valori bassi l’affidabilità stimata è compatibile anche con un accordo modesto.":
    "The dot is ICC(2,1); if the interval includes low values the estimated reliability is also compatible with modest agreement.",
  "ICC(2,1)":
    "ICC(2,1)",
  "ICC":
    "ICC",
  "Loading plot":
    "Loading plot",
  "Variabili vicine nella mappa dei carichi sono correlate; variabili su lati opposti sono inversamente correlate.":
    "Variables close in the loading map are correlated; variables on opposite sides are inversely correlated.",
  "Q-Q della distribuzione parametrica":
    "Parametric distribution Q-Q",
  "{s1} · profilo medio":
    "{s1} · mean profile",
  "I punti vicini alla diagonale indicano che i tempi osservati seguono la distribuzione fittata; deviazioni alle estremità segnalano code mal descritte.":
    "Points close to the diagonal indicate that the observed times follow the fitted distribution; departures at the extremes signal poorly described tails.",
  "Tempi teorici":
    "Theoretical times",
  "Tempi osservati":
    "Observed times",
  "Dimensione {s1}":
    "Dimension {s1}",
  "Analisi delle corrispondenze":
    "Correspondence analysis",
  "Righe e colonne nelle prime due dimensioni":
    "Rows and columns in the first two dimensions",
  "Righe e colonne vicine condividono un profilo simile; la distanza dall’origine misura quanto si discostano dal profilo medio.":
    "Nearby rows and columns share a similar profile; distance from the origin measures how far they depart from the average profile.",
  "Dimensione 1":
    "Dimension 1",
  "Dimensione 2":
    "Dimension 2",
  "Inerzia spiegata":
    "Explained inertia",
  "Quota di associazione spiegata da ciascuna dimensione":
    "Share of association explained by each dimension",
  "Barre più alte indicano dimensioni che riassumono più associazione tra righe e colonne.":
    "Higher bars indicate dimensions that summarise more association between rows and columns.",
  "Dimensione":
    "Dimension",
  "Inerzia (%)":
    "Inertia (%)",
  "Imputato":
    "Imputed",
  "Valori osservati e imputati: {s1}":
    "Observed and imputed values: {s1}",
  "Striscia dei valori per stato":
    "Value strip by state",
  "La striscia mostra dove cadono i valori imputati rispetto agli osservati: spostamenti sistematici indicano un modello di imputazione da rivedere.":
    "The strip shows where imputed values fall relative to observed ones: systematic shifts indicate an imputation model to review.",
  "Densità dei tempi per profilo":
    "Time density per profile",
  "La densità è hazard × sopravvivenza: mostra dove si concentrano i tempi all’evento per ciascun profilo.":
    "The density is hazard × survival: it shows where event times concentrate for each profile.",
  "Diamante delle medie":
    "Mean diamonds",
  "Diamante proporzionale all’intervallo di confidenza":
    "Diamond proportional to the confidence interval",
  "Il diamante è centrato sulla media; la sua ampiezza cresce con l’incertezza della stima.":
    "The diamond is centred on the mean; its width grows with the uncertainty of the estimate.",
  "Shadowgram: {s1}":
    "Shadowgram: {s1}",
  "Densità stimata con rug delle osservazioni":
    "Estimated density with a rug of the observations",
  "La silhouette mostra la densità stimata; il rug mostra dove cadono le osservazioni.":
    "The silhouette shows the estimated density; the rug shows where the observations fall.",
  "Matrice di dispersione":
    "Scatter matrix",
  "Confronto a coppie delle variabili selezionate":
    "Pairwise comparison of the selected variables",
  "Ogni pannello confronta due variabili; le ellissi tratteggiate riassumono la densità bivariata.":
    "Each panel compares two variables; the dashed ellipses summarise the bivariate density.",
  "Variabili":
    "Variables",
  "Grafico a bolle":
    "Bubble plot",
  "{s1} × {s2}, dimensione = {s3}":
    "{s1} × {s2}, size = {s3}",
  "La posizione mostra due variabili, la dimensione della bolla la terza: bolle grandi indicano valori alti della variabile di dimensione.":
    "Position shows two variables and bubble size the third: large bubbles indicate high values of the size variable.",
  "Dispersione 3D":
    "3D scatter",
  "{s1}, {s2}, {s3} proiettati":
    "{s1}, {s2}, {s3} projected",
  "La proiezione isometrica mostra tre dimensioni; l’ellisse riassume la densità proiettata, non sostituisce un test multivariato.":
    "The isometric projection shows three dimensions; the ellipse summarises the projected density and does not replace a multivariate test.",
  "Diamante della media":
    "Mean diamond",
  "IC {s1}% e stima puntuale":
    "{s1}% CI and point estimate",
  "Il diamante è centrato sulla media; la sua ampiezza segue l’intervallo di confidenza.":
    "The diamond is centred on the mean; its width follows the confidence interval.",
  "Diamanti delle medie":
    "Mean diamonds",
  "Ogni diamante è centrato sulla media del gruppo; l’ampiezza segue l’intervallo di confidenza.":
    "Each diamond is centred on its group mean; its width follows the confidence interval.",
  "Diamante della differenza media":
    "Mean difference diamond",
  "Il diamante è centrato sulla differenza media; l’ampiezza segue l’intervallo di confidenza.":
    "The diamond is centred on the mean difference; its width follows the confidence interval.",
  "Diamanti delle medie per gruppo":
    "Mean diamonds by group",
  "IC {s1}% entro il modello":
    "{s1}% CI within the model",
  "Il diamante è centrato sulla media di gruppo; l’ampiezza segue l’intervallo di confidenza del modello.":
    "The diamond is centred on the group mean; its width follows the model confidence interval.",
  "Cerchi di confronto tra gruppi":
    "Comparison circles between groups",
  "IC {s1}% · cerchi più grandi = maggiore incertezza":
    "{s1}% CI · larger circles = greater uncertainty",
  "La sovrapposizione dei cerchi è un indizio visivo: il test post-hoc formale resta la tabella dei confronti.":
    "Circle overlap is a visual clue: the formal post-hoc test remains the comparison table.",
  "Pannello Distribution: {s1}":
    "Distribution panel: {s1}",
  "Pannello Oneway: {s1} per {s2}":
    "Oneway panel: {s1} by {s2}",
  "Pannello Fit Model: {s1}":
    "Fit Model panel: {s1}",
  "Pannello diagnostico di regressione: {s1}":
    "Regression diagnostic panel: {s1}",
  "Report PCA":
    "PCA report",
  "Report delle serie temporali: {s1}":
    "Time-series report: {s1}",
  "Report di qualità":
    "Quality report",
  "Istogramma, box, Q-Q e shadowgram descrivono la stessa variabile: nessun grafico aggiunge un test, mostrano solo forma, centro e code.":
    "Histogram, box, Q-Q and shadowgram describe the same variable: no plot adds a test, they only show shape, centre and tails.",
  "I diamanti mostrano media e incertezza, i cerchi il confronto visivo tra gruppi; il test formale resta nella tabella post-hoc.":
    "Diamonds show the mean and its uncertainty, circles the visual comparison between groups; the formal test remains in the post-hoc table.",
  "Osservati vs stimati misura l’accordo del modello; i pannelli dei residui controllano struttura, varianza e punti influenti.":
    "Observed vs predicted measures model agreement; the residual panels check structure, variance and influential points.",
  "Residui senza struttura, varianza stabile e nessun punto oltre le soglie di leverage/Cook sostengono le assunzioni del modello.":
    "Unstructured residuals, stable variance and no point beyond the leverage/Cook thresholds support the model assumptions.",
  "Lo scree sceglie quante componenti trattenere; score e biplot mostrano i casi, i carichi mostrano come le variabili costruiscono le componenti.":
    "The scree plot chooses how many components to retain; scores and biplot show the cases, loadings show how variables build the components.",
  "La serie e la previsione si leggono insieme ad ACF/PACF e alla scomposizione: un residuo bianco sostiene il modello, un pattern no.":
    "The series and forecast are read together with ACF/PACF and the decomposition: white residuals support the model, a pattern does not.",
  "Controllo del processo, capacità, Pareto e variabilità rispondono a domande diverse: il pannello le tiene vicine senza confonderle.":
    "Process control, capability, Pareto and variability answer different questions: the panel keeps them together without conflating them.",
};
