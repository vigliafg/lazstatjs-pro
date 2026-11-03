/** English chart copy for the procedures touched by the W10 wave. */
export const w10ChartCopy: Record<string, string> = {
  "Medie di cella con intervallo": "Cell means with interval",
  "IC {s1}% · {s2} celle": "CI {s1}% · {s2} cells",
  "Ogni punto è la media della cella; il segmento è il suo intervallo di confidenza. Celle con poche osservazioni hanno intervalli più larghi.":
    "Each point is the cell mean; the segment is its confidence interval. Cells with few observations have wider intervals.",
  "Cella": "Cell",
  "Funzione cumulata media": "Mean cumulative function",
  "{s1} eventi · {s2} tempi distinti": "{s1} events · {s2} distinct times",
  "La curva somma gli eventi osservati divisi per i soggetti a rischio a ogni tempo: pendenze più ripide indicano una ricorrenza più intensa.":
    "The curve sums the observed events divided by the subjects at risk at each time: steeper slopes indicate more intense recurrence.",
  "MCF": "MCF",
  "Tempo": "Time",
  "Eventi cumulati per soggetto": "Cumulative events per subject",
  "La differenza stimata è il punto; il segmento è il suo intervallo di confidenza. La fascia colorata è la regione di equivalenza delimitata dai margini tratteggiati: se l’intero intervallo cade dentro, l’equivalenza è supportata.":
    "The estimated difference is the point; the segment is its confidence interval. The shaded band is the equivalence region bounded by the dashed margins: if the whole interval falls inside, equivalence is supported.",
  "Pareto delle frequenze: {s1}": "Frequency Pareto: {s1}",
  "{s1} modalità · {s2} osservazioni": "{s1} categories · {s2} observations",
  "Le barre sono i conteggi in ordine decrescente; la linea è la percentuale cumulata. Poche modalità spiegano la maggior parte dei casi.":
    "The bars are the counts in descending order; the line is the cumulative percentage. A few categories explain most of the cases.",
  "Valori osservati: {s1}": "Observed values: {s1}",
  "{s1} osservazioni · valore segnalato {s2}": "{s1} observations · flagged value {s2}",
  "Ogni punto è un’osservazione, disposta in orizzontale per ridurre la sovrapposizione; i valori segnalati dal test di Grubbs o Dixon sono riportati nella tabella.":
    "Each point is an observation, spread horizontally to reduce overlap; values flagged by the Grubbs or Dixon test are reported in the table.",
  "Profilo parte × operatore": "Part × operator profile",
  "{s1} parti · {s2} operatori": "{s1} parts · {s2} operators",
  "Ogni linea è un operatore: linee parallele indicano che gli operatori ordinano i pezzi allo stesso modo; scostamenti sistematici suggeriscono un effetto operatore.":
    "Each line is an operator: parallel lines mean the operators rank the parts the same way; systematic shifts suggest an operator effect.",
  "Rapporto delle varianze": "Variance ratio",
  "IC {s1}% · scala log · riferimento 1": "CI {s1}% · log scale · reference 1",
  "Il punto è il rapporto tra le varianze dei due gruppi; la scala log rende il rapporto moltiplicativo e la linea a 1 indica varianze uguali.":
    "The point is the ratio of the two group variances; the log scale makes the ratio multiplicative and the line at 1 means equal variances.",
  "Mediana delle differenze e intervallo": "Median difference and interval",
  "IC {s1}% · {s2} coppie": "CI {s1}% · {s2} pairs",
  "L’intervallo è per ordine-statistiche: non richiede la normalità. Se contiene lo zero la mediana delle differenze è compatibile con zero.":
    "The interval uses order statistics: it does not assume normality. If it contains zero, the median difference is compatible with zero.",
  "Differenza tra le cumulative": "Difference between ECDFs",
  "D = {s1}": "D = {s1}",
  "La curva è F₁(x) − F₂(x); il massimo in valore assoluto è la statistica D del test.":
    "The curve is F₁(x) − F₂(x); the largest absolute value is the D statistic of the test.",
  "Massimo": "Maximum",
  "Mediane per gruppo con IC {s1}%": "Medians per group with CI {s1}%",
  "{s1} · {s2} gruppi": "{s1} · {s2} groups",
  "L’intervallo è per ordine-statistiche: si basa sui ranghi delle osservazioni e non richiede la normalità. Il test della mediana confronta invece quante osservazioni cadono sopra e sotto la mediana comune.":
    "The interval uses order statistics: it is based on the ranks of the observations and does not assume normality. The median test instead compares how many observations fall above and below the common median.",
  "Mediana": "Median",
  "Componenti di varianza": "Variance components",
  "Scomposizione gerarchica di {s1}": "Hierarchical decomposition of {s1}",
  "Le barre scompongono la variabilità totale: il componente esterno misura l’effetto del fattore gerarchico, quello interno la variabilità tra sottogruppi e il residuo quella entro cella.":
    "The bars split the total variability: the outer component measures the effect of the hierarchical factor, the inner one the variability between subgroups and the residual the variability within cells.",
  "Componente": "Component",
  "Varianza": "Variance",
  "Contributo al χ² per categoria": "Contribution to χ² by category",
  "χ² = {s1} · {s2} categorie": "χ² = {s1} · {s2} categories",
  "Ogni barra è (O − E)² / E: le categorie con il contributo maggiore sono quelle che allontanano di più i dati dalle attese.":
    "Each bar is (O − E)² / E: the categories with the largest contribution are those that push the data furthest from the expectations.",
  "Contributo al χ²": "Contribution to χ²",
  "Cumulata (%)": "Cumulative (%)",
  "Coefficienti del modello selezionato": "Coefficients of the selected model",
  "IC {s1}% · {s2} predittori": "CI {s1}% · {s2} predictors",
  "IC {s1}% · {s2} predittore": "CI {s1}% · {s2} predictor",
  "Silhouette media per cluster": "Mean silhouette per cluster",
  "Valori sopra 0,5 indicano cluster ben separati": "Values above 0.5 indicate well-separated clusters",
  "La silhouette confronta la distanza media dentro il cluster con quella verso il cluster più vicino: valori vicini a 1 indicano gruppi compatti e separati, valori vicini a 0 o negativi indicano confini ambigui.":
    "The silhouette compares the mean distance inside the cluster with the mean distance to the nearest other cluster: values near 1 indicate compact, separated groups; values near 0 or negative indicate ambiguous boundaries.",
  "Silhouette media": "Mean silhouette",
  "Cluster nelle prime due variabili": "Clusters in the first two variables",
  "Variabili standardizzate": "Standardised variables",
  "Variabili originali": "Original variables",
  "Non è una PCA: gli assi sono le prime due variabili selezionate (standardizzate se richiesto) e il colore è il cluster assegnato. Serve a vedere la separazione, non a ridurre la dimensionalità.":
    "This is not a PCA: the axes are the first two selected variables (standardised when requested) and the colour is the assigned cluster. It shows separation, it does not reduce dimensionality.",
  "Correlazioni canoniche": "Canonical correlations",
  "{s1} funzioni · {s2} osservazioni": "{s1} functions · {s2} observations",
  "Ogni barra è la correlazione tra la coppia di variate canoniche: valori alti indicano che i due blocchi condividono una direzione forte. Quante funzioni sono significative lo dicono Wilks e il p nella tabella.":
    "Each bar is the correlation between the pair of canonical variates: high values mean the two blocks share a strong direction. Wilks and the p value in the table say how many functions are significant.",
  "Funzione canonica": "Canonical function",
  "Correlazione canonica": "Canonical correlation",
  "Adeguamento del modello": "Model fit",
  "{s1} = {s2} · df = {s3} · p = {s4}": "{s1} = {s2} · df = {s3} · p = {s4}",
  "Soglie convenzionali: CFI ≥ 0,95, RMSEA ≤ 0,06, SRMR ≤ 0,08. Confronta ogni coppia di barre: per CFI un valore alto è buono, per RMSEA e SRMR un valore basso è buono.":
    "Conventional thresholds: CFI ≥ 0.95, RMSEA ≤ 0.06, SRMR ≤ 0.08. Compare each pair of bars: a high value is good for CFI, a low value is good for RMSEA and SRMR.",
  "Modello": "Model",
  "Soglia": "Threshold",
  "Indice": "Index",
  "Valore": "Value",
  "Certezza di classificazione per classe": "Classification certainty per class",
  "Entropia {s1} · casi con probabilità ≥ 0,80": "Entropy {s1} · cases with probability ≥ 0.80",
  "Entropia vicina a 1 significa classi ben distinte; vicina a 0 significa posterior ambigue. Le barre sono la quota di casi di ciascuna classe assegnati con probabilità almeno 0,80: barre basse segnalano casi al confine tra classi.":
    "Entropy near 1 means well-separated classes; near 0 means ambiguous posteriors. The bars are the share of each class assigned with probability at least 0.80: low bars flag cases on the boundary between classes.",
  "Casi certi (%)": "Certain cases (%)",
  "Ogni barra è il coefficiente di un predittore nel modello scelto dalla selezione; il segmento è il suo intervallo di confidenza. Le barre che attraversano lo zero non distinguono il predittore da nessun effetto.":
    "Each bar is a predictor coefficient in the model chosen by the selection; the segment is its confidence interval. Bars that cross zero do not distinguish the predictor from no effect.",
  "Predittore": "Predictor",
  "Coefficiente (B)": "Coefficient (B)",
  "Matrice di confusione": "Confusion matrix",
  "{s1} classi · accuratezza {s2}%": "{s1} classes · accuracy {s2}%",
  "Riga: classe osservata; colonna: classe predetta. La diagonale raccoglie le classificazioni corrette: i valori fuori diagonale sono gli scambi più frequenti tra classi.":
    "Row: observed class; column: predicted class. The diagonal holds the correct classifications: off-diagonal values are the most frequent swaps between classes.",
  "Classe predetta": "Predicted class",
  "Classe osservata": "Observed class",
  "Primo stadio: strumenti e variabile endogena": "First stage: instruments and endogenous variable",
  "Una serie per strumento · {s1} osservazioni": "One series per instrument · {s1} observations",
  "Ogni punto è un’osservazione: se la nuvola di uno strumento è piatta, lo strumento è debole e la stima 2SLS diventa instabile.":
    "Each point is an observation: if an instrument's cloud is flat, the instrument is weak and the 2SLS estimate becomes unstable.",
  "Strumento": "Instrument",
  "Loadings delle componenti PLS": "PLS component loadings",
  "{s1} componenti · {s2} predittori": "{s1} components · {s2} predictors",
  "Ogni cella è il loading di un predittore su una componente latente: valori grandi in modulo indicano un legame forte, il segno dà la direzione.":
    "Each cell is the loading of a predictor on a latent component: large absolute values indicate a strong link, the sign gives the direction.",
  " Con il link probit la curva usa Φ(η) invece della funzione logistica.":
    " With the probit link the curve uses Φ(η) instead of the logistic function.",
  "IC {s1}% · link {s2} · riferimento OR = 1": "CI {s1}% · link {s2} · reference OR = 1",
};
