/** German prose of the countreg procedure and its tables. */
export const countregCopy: Record<string, string> = {
  "Report di regressione per conteggi":
    "Regressionsbericht für Zähldaten",
  "Modello di Poisson su {s1} osservazioni; dispersione {s2}.":
    "Poisson-Modell mit {s1} Beobachtungen; Dispersion {s2}.",
  "Modello binomiale negativo su {s1} osservazioni (θ = {s2}).":
    "Negatives Binomialmodell mit {s1} Beobachtungen (θ = {s2}).",
  "Overdispersion da valutare":
    "Überdispersion zu prüfen",
  "Modello stimato":
    "Modell geschätzt",
  "LR vs modello nullo: χ² = {s1}, p = {s2}.":
    "LR gegen das Nullmodell: χ² = {s1}, p = {s2}.",
  "Il primo predittore ha IRR = {s1} (CI {s2}%: {s3} – {s4}).":
    "Der erste Prädiktor hat IRR = {s1} (KI {s2} %: {s3} – {s4}).",
  "{s1} predittore/i risultano significativi al livello scelto.":
    "{s1} Prädiktor(en) erweisen sich auf dem gewählten Niveau als signifikant.",
  "Nessun predittore risulta significativo al livello scelto.":
    "Kein Prädiktor erweist sich auf dem gewählten Niveau als signifikant.",
  "IRR > 1 indica un tasso atteso più alto per un’unità in più del predittore; IRR < 1 un tasso più basso.":
    "IRR > 1 bedeutet eine höhere erwartete Rate pro zusätzlicher Einheit des Prädiktors; IRR < 1 eine niedrigere Rate.",
  "La dispersione è chiaramente sopra 1: il Poisson sottostima l’errore. Usa la negative binomiale.":
    "Die Dispersion liegt deutlich über 1: Das Poisson-Modell unterschätzt den Fehler. Verwenden Sie die negative Binomialverteilung.",
  "La dispersione è compatibile con il modello scelto.":
    "Die Dispersion ist mit dem gewählten Modell vereinbar.",
  "La regressione per conteggi assume osservazioni indipendenti e una relazione log-lineare.":
    "Die Zählregression setzt unabhängige Beobachtungen und eine log-lineare Beziehung voraus.",
  "Con molti zeri può servire un modello zero-inflated, non disponibile.":
    "Bei vielen Nullen kann ein Modell mit Nullaufblähung nötig sein, das hier nicht verfügbar ist.",
  "Sintesi del modello":
    "Zusammenfassung des Modells",
  "Negative binomial (θ = {s1})":
    "Negativ binomial (θ = {s1})",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "N":
    "N",
  "Predittori":
    "Prädiktoren",
  "Deviance":
    "Devianz",
  "df residui":
    "Residuen-df",
  "Dispersione (Pearson/df)":
    "Dispersion (Pearson/df)",
  "Log-verosimiglianza":
    "Log-Likelihood",
  "LR vs nullo":
    "LR gegen das Nullmodell",
  "p LR":
    "p LR",
  "AIC":
    "AIC",
  "BIC":
    "BIC",
  "Conteggi non interi":
    "Nicht ganzzahlige Zähler",
  "Poisson assume varianza = media. Dispersione > 1 indica overdispersion: meglio negative binomial.":
    "Poisson setzt Varianz = Mittelwert voraus. Dispersion > 1 zeigt Überdispersion: besser negativ binomial.",
  "Il test LR confronta il modello con l’intercetta sola.":
    "Der LR-Test vergleicht das Modell mit dem Modell, das nur den Achsenabschnitt enthält.",
  "Coefficienti":
    "Koeffizienten",
  "IRR e CI {s1}%":
    "IRR und KI {s1} %",
  "Termine":
    "Term",
  "β":
    "β",
  "SE":
    "SE",
  "z":
    "z",
  "p":
    "p",
  "IRR":
    "IRR",
  "IRR low":
    "IRR unten",
  "IRR high":
    "IRR oben",
  "IRR = exp(β): moltiplicatore del tasso atteso per un’unità in più del predittore.":
    "IRR = exp(β): Multiplikator der erwarteten Rate pro zusätzlicher Einheit des Prädiktors.",
  "p da z normale; con dispersione stimata i test sono approssimati.":
    "p aus normalverteiltem z; bei geschätzter Dispersion sind die Tests approximativ.",
};
