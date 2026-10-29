/** German prose of the mi procedure and its tables. */
export const miCopy: Record<string, string> = {
  "Report di imputazione multipla":
    "Bericht zur multiplen Imputation",
  "{s1} celle imputate con {s2} dataset; FMI massimo {s3}.":
    "{s1} Zellen mit {s2} Datensätzen imputiert; maximaler FMI {s3}.",
  "Molte informazioni mancanti":
    "Viele fehlende Informationen",
  "Imputazione stabile":
    "Stabile Imputation",
  "Variabili: {s1}.":
    "Variablen: {s1}.",
  "Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.":
    "Imputationsmodell: lineare Regression mit Ketten, {s1} Iterationen pro Datensatz.",
  "Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.":
    "Die gepoolten Schätzungen kombinieren die Variabilität innerhalb und zwischen den Imputationen: Die KI berücksichtigen die Unsicherheit durch die fehlenden Daten.",
  "Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.":
    "Ein hoher FMI zeigt, dass die fehlenden Daten die Unsicherheit dominieren: Interpretieren Sie die Schätzungen mit Vorsicht.",
  "La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.":
    "Der Anteil fehlender Information ist gering: Die Schätzungen sind relativ stabil.",
  "Il livello di confidenza delle stime pooled è {s1}%.":
    "Das Konfidenzniveau der gepoolten Schätzungen beträgt {s1} %.",
  "Modello lineare pooled: R² medio = {s1} su {s2} predittori.":
    "Gepooltes lineares Modell: mittleres R² = {s1} bei {s2} Prädiktoren.",
  "Nessun modello di regressione pooled richiesto.":
    "Kein gepooltes Regressionsmodell angefordert.",
  "L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.":
    "Die Imputation setzt fehlende Daten als zufällig (MAR) bedingt auf die anderen Variablen voraus.",
  "Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.":
    "Bei wenigen Beobachtungen oder stark korrelierten Variablen kann das Imputationsmodell instabil sein.",
  "Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.":
    "Die hier berichteten gepoolten Schätzungen betreffen Mittelwert und SD, nicht vollständige Regressionsmodelle.",
  "Dati mancanti":
    "Fehlende Daten",
  "{s1} righe · {s2} imputazioni · {s3} iterazioni":
    "{s1} Zeilen · {s2} Imputationen · {s3} Iterationen",
  "Variabile":
    "Variable",
  "Osservati":
    "Beobachtet",
  "Mancanti":
    "Fehlend",
  "% mancante":
    "% fehlend",
  "Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.":
    "Die ausgewählten Variablen werden mit einem linearen Modell auf den anderen Variablen imputiert.",
  "Stime pooled (Rubin)":
    "Gepoolte Schätzungen (Rubin)",
  "CI {s1}%":
    "KI {s1} %",
  "Media":
    "Mittelwert",
  "SE":
    "SE",
  "CI low":
    "KI unten",
  "CI high":
    "KI oben",
  "SD pooled":
    "Gepoolte SD",
  "df Rubin":
    "Rubin-df",
  "FMI":
    "FMI",
  "Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.":
    "Rubin-Pooling: Gesamtvarianz = Within-Varianz + (1 + 1/m)·Between-Varianz.",
  "Regressione pooled":
    "Gepoolte Regression",
  "R² medio = {s1} · {s2}% CI":
    "Mittleres R² = {s1} · KI {s2} %",
  "Termine":
    "Term",
  "β":
    "β",
  "t":
    "t",
  "p":
    "p",
  "Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.":
    "Gepoolte Koeffizienten nach den Rubin-Regeln; R² ist der Mittelwert über die Imputationen.",
};
