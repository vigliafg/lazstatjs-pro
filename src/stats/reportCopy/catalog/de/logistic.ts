/** German prose of the logistic procedure and its tables. */
export const logisticCopy: Record<string, string> = {
  "p del modello":
    "p des Modells",
  "{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.":
    "{s1}: OR = {s2} (KI {s3} – {s4}), p = {s5}: Eine Einheit mehr {s6} die Odds des Ergebnisses um etwa {s7} %.",
  "Report di lettura":
    "Lesetext",
  "I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.":
    "Die Daten trennen die Ergebnisse nahezu perfekt: Die Schätzungen sind nicht zuverlässig.",
  "Il modello è significativo (LR p = {s1}) e {s2} sul risultato.":
    "Das Modell ist signifikant (LR p = {s1}) und {s2} auf das Ergebnis.",
  "1 predittore pesa":
    "1 Prädiktor wiegt",
  "{s1} predittori pesano":
    "{s1} Prädiktoren wiegen",
  "Il modello non è significativo (LR p = {s1}).":
    "Das Modell ist nicht signifikant (LR p = {s1}).",
  "Modello informativo":
    "Informatives Modell",
  "Modello debole":
    "Schwaches Modell",
  "La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.":
    "Die logistische Regression modelliert die Wahrscheinlichkeit eines binären Ergebnisses (ja/nein) in Abhängigkeit von einem oder mehreren Prädiktoren, statt direkt den Mittelwert zu modellieren wie die lineare Regression.",
  "L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.":
    "Die Nullhypothese des LR-Tests lautet „kein Prädiktor fügt Information gegenüber dem Achsenabschnitt allein hinzu“; jeder Koeffizient beantwortet dagegen die Frage „wiegt dieser Prädiktor, bereinigt um die anderen?“.",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.":
    "Das Modell enthält {s1} Prädiktor(en) bei {s2} Beobachtungen und {s3} Ereignissen.",
  "Eventi (Y = 1)":
    "Ereignisse (Y = 1)",
  "Il test LR vale {s1} con {s2} gradi di libertà: {s3}":
    "Der LR-Test beträgt {s1} mit {s2} Freiheitsgraden: {s3}",
  "rifiuta l’ipotesi che nessun predittore conti.":
    "verwirft die Hypothese, dass kein Prädiktor zählt.",
  "non rifiuta l’ipotesi che nessun predittore conti.":
    "verwirft die Hypothese, dass kein Prädiktor zählt, nicht.",
  "non calcolabile.":
    "nicht berechenbar.",
  "Come leggere gli odds ratio":
    "Wie die Odds Ratios zu lesen sind",
  "L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.":
    "Das Odds Ratio ist kein relatives Risiko: OR = 2 bedeutet, dass sich die Odds verdoppeln, nicht dass sich die Wahrscheinlichkeit verdoppelt. Bei häufigen Ergebnissen ist der Unterschied zwischen beiden Lesarten groß, bei seltenen klein.",
  "Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.":
    "Die OR werden bereinigt um die anderen Prädiktoren und mit einem KI von {s1} % geschätzt: Ein Intervall, das die 1 enthält, entspricht einem nicht signifikanten Effekt.",
  "Quanto discrimina il modello":
    "Wie gut das Modell trennt",
  "AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.":
    "AUC = {s1}: Wahrscheinlichkeit, dass ein Fall mit positivem Ergebnis einen höheren Score erhält als ein negativer Fall. Genauigkeit an der gewählten Schwelle: {s2}.",
  "McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.":
    "McFadden R² = {s1}: Werte über 0,2 deuten auf ein Modell mit echter Erklärungskraft hin, dürfen aber nicht mit dem R² der linearen Regression verglichen werden.",
  "Assunzioni e cautele":
    "Annahmen und Vorsichtsmaßnahmen",
  "Gli esiti devono essere indipendenti tra loro (una riga = una unità).":
    "Die Ergebnisse müssen untereinander unabhängig sein (eine Zeile = eine Einheit).",
  "La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.":
    "Die Beziehung zwischen Prädiktor und Logit der Wahrscheinlichkeit ist linear: Bei kontinuierlichen Prädiktoren prüfen Sie die Form oder verwenden Sie Transformationen.",
  "Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).":
    "Es braucht ausreichend Ereignisse: Weniger als 10 Ereignisse pro Parameter machen die Schätzungen instabil (EPV-Faustregel).",
  "La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.":
    "Separation, also eine perfekte Vorhersage des Ergebnisses, bläht die Koeffizienten auf und entwertet die Tests.",
  "L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.":
    "Die Genauigkeit hängt von der Schwelle ab: Berichten Sie sie immer zusammen mit Sensitivität und Spezifität.",
  "Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.":
    "Nicht enthalten sind Modelle mit zufälligen Effekten, Interaktionen, penalisierte Regression oder Adjustierung für unbalancierte Daten.",
  "La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.":
    "Die Anpassungsgüte wird durch Pseudo-R² und AUC zusammengefasst: Sie ersetzen keine Prüfung der Residuen auf die Form der Beziehung.",
  "Modello logistico":
    "Logistisches Modell",
  "{s1} · N = {s2}":
    "{s1} · N = {s2}",
  "Firth penalized likelihood":
    "Firth-Likelihood (penalisiert)",
  "stima di massima verosimiglianza":
    "Maximum-Likelihood-Schätzung",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Osservazioni":
    "Beobachtungen",
  "Eventi (Y = 1)":
    "Ereignisse (Y = 1)",
  "Eventi per parametro":
    "Ereignisse pro Parameter",
  "Log-verosimiglianza":
    "Log-Likelihood",
  "Log-verosimiglianza nulla":
    "Null-Log-Likelihood",
  "LR χ² (vs modello nullo)":
    "LR χ² (gegen das Nullmodell)",
  "df":
    "df",
  "p del modello":
    "p des Modells",
  "McFadden R²":
    "McFadden R²",
  "Cox–Snell R²":
    "Cox–Snell R²",
  "Nagelkerke R²":
    "Nagelkerke R²",
  "AIC":
    "AIC",
  "BIC":
    "BIC",
  "Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.":
    "Der LR-Test vergleicht das Modell mit dem, das nur den Achsenabschnitt enthält: Kleines p = mindestens ein Prädiktor fügt Information hinzu.",
  "Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.":
    "Pseudo-R² haben nicht die Bedeutung des linearen R²: Werte um 0,2–0,4 zeigen bereits eine gute Anpassung.",
  "Coefficienti e odds ratio":
    "Koeffizienten und Odds Ratios",
  "CI {s1}%":
    "KI {s1} %",
  "Predittore":
    "Prädiktor",
  "B":
    "B",
  "SE":
    "SE",
  "Wald z":
    "Wald z",
  "p":
    "p",
  "OR":
    "OR",
  "OR CI low":
    "OR-KI unten",
  "OR CI high":
    "OR-KI oben",
  "OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.":
    "OR > 1 erhöht die Odds des Ergebnisses pro zusätzlicher Einheit des Prädiktors; OR < 1 senkt sie. OR = 1 hat keinen Effekt.",
  "L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.":
    "Das OR-Intervall wird auf der logarithmischen Skala berechnet: exp(B ± z·SE). Enthält es die 1, ist der Effekt nicht signifikant.",
  "Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.":
    "Das p ist ein Wald-p (z = B/SE): Bei kleinen Stichproben oder starken Effekten kann es weniger zuverlässig sein als der LR-Test.",
  "Classificazione":
    "Klassifikation",
  "soglia p ≥ {s1} → Y = 1":
    "Schwelle p ≥ {s1} → Y = 1",
  "Accuratezza":
    "Genauigkeit",
  "{s1}%":
    "{s1} %",
  "Sensibilità":
    "Sensitivität",
  "Specificità":
    "Spezifität",
  "AUC":
    "AUC",
  "L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.":
    "Die AUC hängt nicht von der Schwelle ab: 0,5 ist Zufall, 0,7 akzeptabel, 0,8 gut, 0,9 sehr gut.",
  "La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.":
    "Die Schwelle 0,5 ist willkürlich: Ist der Preis eines falsch negativen Ergebnisses hoch, senken Sie sie und beobachten Sie, wie sich Sensitivität und Spezifität ändern.",
  "Separazione gestita da Firth":
    "Separation durch Firth behandelt",
  "Attenzione: separazione":
    "Achtung: Separation",
  "Diagnostica":
    "Diagnostik",
  "Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.":
    "Mindestens ein Koeffizient ist sehr groß: Die Daten trennen die Ergebnisse nahezu perfekt, Schätzungen und SE sind nicht zuverlässig.",
  "La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.":
    "Die penalisierte Likelihood von Firth hält die Schätzungen endlich; die Standardfehler bleiben approximativ.",
  "Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).":
    "Sammeln Sie mehr Fälle, reduzieren Sie die Prädiktoren oder verwenden Sie eine penalisierte Regression (Firth).",
};
