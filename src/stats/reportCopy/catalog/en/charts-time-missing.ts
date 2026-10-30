/** English copy for the time-series, missing-data and design charts. */
export const timeMissingChartCopy: Record<string, string> = {
  "Curva di precisione":
    "Precision curve",
  "Semiampiezza dell’intervallo al variare di n":
    "Confidence-interval half-width as n changes",
  "La curva scende come 1/√n: raddoppiare il campione non dimezza l’incertezza. La linea tratteggiata è il margine di errore richiesto.":
    "The curve falls as 1/√n: doubling the sample does not halve the uncertainty. The dashed line is the requested margin of error.",
  "Semiampiezza":
    "Half-width",
  "Autocorrelazione parziale":
    "Partial autocorrelation",
  "La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).":
    "The PACF isolates the correlation at lag k net of intermediate lags: a sharp cut after lag 1 suggests an AR(1) process.",
  "Trend":
    "Trend",
  "Scomposizione: serie e trend":
    "Decomposition: series and trend",
  "Media mobile centrata di periodo {s1}":
    "Centred moving average of period {s1}",
  "Il trend è la media mobile centrata: le prime e le ultime osservazioni non hanno un valore stimato.":
    "The trend is the centred moving average: the first and last observations have no estimate.",
  "Stagionalità":
    "Seasonality",
  "Scomposizione: stagionalità e residuo":
    "Decomposition: seasonality and remainder",
  "Componenti additivi della serie":
    "Additive components of the series",
  "La stagionalità è il profilo che si ripete ogni periodo; il residuo è ciò che resta dopo trend e stagionalità.":
    "Seasonality is the profile that repeats each period; the remainder is what is left after trend and seasonality.",
  "Autocorrelazione dei residui ARIMA":
    "ARIMA residual autocorrelation",
  "{s1} residui · banda ±{s2}":
    "{s1} residuals · band ±{s2}",
  "Se i residui sono rumore bianco le barre restano dentro la banda: autocorrelazione residua suggerisce un ordine del modello troppo basso.":
    "If the residuals are white noise the bars stay inside the band: remaining autocorrelation suggests the model order is too low.",
  "Accuratezza dei modelli di previsione":
    "Forecast model accuracy",
  "Errore su un campione di validazione (ultimo 20% della serie)":
    "Error on a validation sample (last 20% of the series)",
  "RMSE e MAE sono nella stessa unità della serie: barre più basse indicano previsioni migliori.":
    "RMSE and MAE are in the series unit: lower bars mean better forecasts.",
  "Errore":
    "Error",
  "Metrica":
    "Metric",
  "Completato":
    "Completed",
  "Intercetta":
    "Intercept",
  "Matrice dei valori mancanti":
    "Missingness matrix",
  "{s1} righe mostrate · {s2} variabili":
    "{s1} rows shown · {s2} variables",
  "Ogni cella è una riga del dataset: il colore distingue valori osservati e mancanti. Le righe sono campionate se il dataset è molto grande.":
    "Each cell is one dataset row: colour distinguishes observed and missing values. Rows are sampled when the dataset is large.",
  "Convergenza delle catene":
    "Chain convergence",
  "Media della catena per iterazione, mediata sulle imputazioni":
    "Chain mean per iteration, averaged over imputations",
  "Le linee devono stabilizzarsi: un andamento sistematico dopo le prime iterazioni suggerisce che il numero di iterazioni è troppo basso.":
    "The lines should level off: a systematic trend after the first iterations suggests too few iterations.",
  "Iterazione":
    "Iteration",
  "Osservati e completati: {s1}":
    "Observed and completed: {s1}",
  "Funzione di ripartizione empirica":
    "Empirical distribution function",
  "Una distanza sistematica tra le due curve indica che le imputazioni spostano la distribuzione della variabile.":
    "A systematic gap between the curves indicates that imputation shifts the variable distribution.",
  "Frequenza cumulata":
    "Cumulative frequency",
  "Coefficienti pooled":
    "Pooled coefficients",
  "Stima e IC {s1}% dopo il pooling di Rubin":
    "Estimate and {s1}% CI after Rubin pooling",
  "Punto: coefficiente pooled. Segmento: intervallo di confidenza; se attraversa lo zero il termine non è distinguibile da zero.":
    "Dot: pooled coefficient. Segment: confidence interval; if it crosses zero the term is indistinguishable from zero.",
  "Coefficiente":
    "Coefficient",
  "Termine":
    "Term",
  "Q-Q della distribuzione bootstrap":
    "Bootstrap distribution Q-Q",
  "Quantili della distribuzione bootstrap vs normale":
    "Bootstrap distribution quantiles vs normal",
  "Se i punti seguono la retta la distribuzione bootstrap è circa normale; code o curvature indicano asimmetria e rendono l’intervallo percentile preferibile a quello normale.":
    "If the points follow the line the bootstrap distribution is roughly normal; tails or curvature indicate skewness and make the percentile interval preferable to the normal one.",
  "Quantile normale teorico":
    "Theoretical normal quantile",
  "Differenza bootstrap":
    "Bootstrap difference",
};
