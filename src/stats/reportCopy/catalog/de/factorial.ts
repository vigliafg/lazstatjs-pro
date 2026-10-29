/** German prose of the factorial procedure and its tables. */
export const factorialCopy: Record<string, string> = {
  "{s1}: F({s2}, {s3}) = {s4}, {s5}, η² parziale = {s6}":
    "{s1}: F({s2}, {s3}) = {s4}, {s5}, partielles η² = {s6}",
  "p < 0.001":
    "p < 0.001",
  "p = {s1}":
    "p = {s1}",
  "Dati insufficienti per stimare il modello.":
    "Unzureichende Daten zur Schätzung des Modells.",
  "L’interazione {s1} è significativa: l’effetto di un fattore dipende dal livello dell’altro.":
    "Die Interaktion {s1} ist signifikant: Der Effekt eines Faktors hängt von der Stufe des anderen ab.",
  "{s1} effetto/i {s2} al livello {s3}.":
    "{s1} Effekt(e) {s2} auf dem Niveau {s3}.",
  "è significativo":
    "ist signifikant",
  "sono significativi":
    "sind signifikant",
  "Nessun effetto raggiunge la significatività al livello {s1}.":
    "Kein Effekt erreicht Signifikanz auf dem Niveau {s1}.",
  "Report di lettura":
    "Lesetext",
  "Interazione presente":
    "Interaktion vorhanden",
  "Effetti significativi":
    "Signifikante Effekte",
  "Nessun effetto":
    "Kein Effekt",
  "L’ANOVA a due fattori separa la variabilità della risposta in tre pezzi: quanto dipende dal primo fattore, quanto dal secondo e quanto dalla loro combinazione.":
    "Die zweifaktorielle ANOVA zerlegt die Variabilität der Antwort in drei Teile: wie viel vom ersten Faktor, wie viel vom zweiten und wie viel von ihrer Kombination abhängt.",
  "L’ipotesi nulla di ogni riga è “nessun effetto”: se il p scende sotto la soglia, quel termine spiega più variabilità di quanto il caso saprebbe produrre.":
    "Die Nullhypothese jeder Zeile lautet „kein Effekt“: Fällt p unter die Schwelle, erklärt dieser Term mehr Variabilität, als der Zufall erzeugen könnte.",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "L’interazione è significativa ({s1}): gli effetti principali non vanno letti da soli, perché l’effetto di ciascun fattore cambia a seconda del livello dell’altro. Guarda le medie per cella e il grafico: le linee non parallele sono la firma dell’interazione.":
    "Die Interaktion ist signifikant ({s1}): Die Haupteffekte dürfen nicht allein gelesen werden, weil sich der Effekt jedes Faktors je nach Stufe des anderen ändert. Betrachten Sie die Zellmittelwerte und das Diagramm: nicht parallele Linien sind die Signatur der Interaktion.",
  "L’interazione non è significativa: gli effetti dei due fattori possono essere letti separatamente, come se agissero in modo additivo.":
    "Die Interaktion ist nicht signifikant: Die Effekte der beiden Faktoren können getrennt gelesen werden, als wirkten sie additiv.",
  "Quanto pesa ogni effetto":
    "Wie stark jeder Effekt wiegt",
  "η² parziale dice quale quota della variabilità residua (dopo gli altri termini) spiega quel termine: 0,01 è piccolo, 0,06 medio, 0,14 grande secondo i riferimenti di Cohen. ω² corregge il bias verso l’alto e può essere più piccolo, soprattutto con pochi df.":
    "Das partielle η² gibt an, welchen Anteil der Residuenvariabilität (nach den anderen Termen) dieser Term erklärt: 0,01 ist klein, 0,06 mittel, 0,14 groß nach Cohens Referenzen. ω² korrigiert die Aufwärtsverzerrung und kann kleiner ausfallen, besonders bei wenigen df.",
  "{s1}: η² parziale = {s2}, ω² = {s3}":
    "{s1}: partielles η² = {s2}, ω² = {s3}",
  "Assunzioni e diagnostica":
    "Annahmen und Diagnostik",
  "R² = {s1}: il modello spiega questa quota della variabilità totale.":
    "R² = {s1}: Das Modell erklärt diesen Anteil der Gesamtvariabilität.",
  "Levene sulle celle: p = {s1}. Se è sotto 0,05 le varianze non sono omogenee e l’F può essere distorto, soprattutto con gruppi di dimensione diversa.":
    "Levene über die Zellen: p = {s1}. Liegt es unter 0,05, sind die Varianzen nicht homogen und das F kann verzerrt sein, besonders bei unterschiedlich großen Gruppen.",
  "Levene (celle)":
    "Levene (Zellen)",
  "Lilliefors sui residui: p = {s1}. Con residui non normali valuta una trasformazione (log, radice) o un’analisi per ranghi.":
    "Lilliefors auf den Residuen: p = {s1}. Bei nicht normalen Residuen erwägen Sie eine Transformation (log, Wurzel) oder eine Ranganalyse.",
  "Lilliefors (residui)":
    "Lilliefors (Residuen)",
  "Osservazioni indipendenti: nessuna struttura di misure ripetute o di blocchi è modellata qui.":
    "Unabhängige Beobachtungen: Es wird hier keine Struktur wiederholter Messungen oder Blöcke modelliert.",
  "Cosa non dice il test":
    "Was der Test nicht aussagt",
  "Una F significativa dice che almeno una media differisce, non quale coppia: per quello servono i confronti post-hoc. E nessuna F stabilisce la direzione causale degli effetti.":
    "Ein signifikantes F sagt, dass mindestens ein Mittelwert abweicht, nicht welches Paar: Dafür sind die Post-hoc-Vergleiche da. Und kein F legt die kausale Richtung der Effekte fest.",
  "Le SS sequenziali dipendono dall’ordine dei termini quando il disegno non è bilanciato; in quel caso un software che riporta Type III può dare numeri diversi.":
    "Sequentielle Quadratsummen hängen bei unbalanciertem Design von der Reihenfolge der Terme ab; in diesem Fall kann eine Software, die Typ III berichtet, andere Zahlen liefern.",
  "Il modello è additivo a due fattori: non gestisce blocchi, covariate, misure ripetute o tre fattori.":
    "Das Modell ist additiv mit zwei Faktoren: Es behandelt keine Blöcke, Kovariaten, wiederholten Messungen oder drei Faktoren.",
  "Con celle singole la variabilità interna non è stimabile e il test non è calcolabile.":
    "Bei Einzelzellen ist die interne Variabilität nicht schätzbar und der Test nicht berechenbar.",
  "{s1} × {s2}":
    "{s1} × {s2}",
  "ANOVA a due fattori":
    "Zweifaktorielle ANOVA",
  "{s1} x {s2}{s3} · N = {s4}":
    "{s1} x {s2}{s3} · N = {s4}",
  " · con interazione":
    " · mit Interaktion",
  " · solo effetti principali":
    " · nur Haupteffekte",
  "Sorgente":
    "Quelle",
  "SS":
    "QS",
  "df":
    "df",
  "MS":
    "MS",
  "F":
    "F",
  "p":
    "p",
  "η² parziale":
    "partielles η²",
  "ω²":
    "ω²",
  "Le somme dei quadrati sono sequenziali (Type I) nell’ordine indicato: in un disegno bilanciato coincidono con le Type III.":
    "Die Quadratsummen sind sequenziell (Typ I) in der angegebenen Reihenfolge: In einem balancierten Design stimmen sie mit Typ III überein.",
  "F = MS_effetto / MS_residui, con df residui = {s1} (N − numero di celle).":
    "F = MS_Effekt / MS_Residuen, mit Residuen-df = {s1} (N − Anzahl der Zellen).",
  "η² parziale = SS_effetto / (SS_effetto + SS_residui): quota di variabilità non spiegata dal resto del modello.":
    "Partielles η² = QS_Effekt / (QS_Effekt + QS_Residuen): Anteil der Variabilität, der nicht vom Rest des Modells erklärt wird.",
  "Il modello spiega {s1} delle {s2} unità di SS totale; il resto sono i residui.":
    "Das Modell erklärt {s1} der {s2} Einheiten der Gesamt-QS; der Rest sind die Residuen.",
  "Medie per cella":
    "Mittelwerte pro Zelle",
  "{s1} combinazioni · {s2}":
    "{s1} Kombinationen · {s2}",
  "disegno bilanciato":
    "balanciertes Design",
  "disegno non bilanciato":
    "unbalanciertes Design",
  "N":
    "N",
  "Media":
    "Mittelwert",
  "SD":
    "SD",
  "Sono le medie che alimentano il grafico dell’interazione: se le linee non sono parallele, l’effetto di un fattore cambia a seconda del livello dell’altro.":
    "Es sind die Mittelwerte, die das Interaktionsdiagramm speisen: Sind die Linien nicht parallel, ändert sich der Effekt eines Faktors je nach Stufe des anderen.",
  "Medie marginali · {s1}":
    "Marginale Mittelwerte · {s1}",
  "{s1}\\\\u0000{s2}":
    "{s1}\\\\u0000{s2}",
  "Diagnostica del modello":
    "Diagnostik des Modells",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Lettura":
    "Lesart",
  "R²":
    "R²",
  "quota di variabilità spiegata dal modello":
    "Anteil der durch das Modell erklärten Variabilität",
  "R² aggiustato":
    "Korrigiertes R²",
  "penalizza il numero di parametri":
    "bestraft die Zahl der Parameter",
  "RMSE":
    "RMSE",
  "deviazione standard dei residui":
    "Standardabweichung der Residuen",
  "Levene (celle)":
    "Levene (Zellen)",
  "F = {s1}, df = {s2}, {s3}: {s4}":
    "F = {s1}, df = {s2}, {s3}: {s4}",
  "varianze non omogenee":
    "Varianzen nicht homogen",
  "varianze compatibili":
    "Varianzen vereinbar",
  "Lilliefors (residui)":
    "Lilliefors (Residuen)",
  "residui non normali: valuta la trasformazione":
    "nicht normale Residuen: Transformation erwägen",
  "residui compatibili con la normalità":
    "Residuen mit der Normalität vereinbar",
  "Celle con N = 1":
    "Zellen mit N = 1",
  "una cella con una sola osservazione non permette di stimare la variabilità interna":
    "eine Zelle mit nur einer Beobachtung erlaubt keine Schätzung der inneren Variabilität",
  "Con una cella per combinazione il disegno non è stimabile: servono repliche.":
    "Mit einer Zelle pro Kombination ist das Design nicht schätzbar: Es braucht Wiederholungen.",
  "Livello di confidenza scelto: {s1}% (usato nel report).":
    "Gewähltes Konfidenzniveau: {s1} % (im Bericht verwendet).",
};
