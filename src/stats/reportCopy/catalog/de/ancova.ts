/** German prose of the ancova procedure and its tables. */
export const ancovaCopy: Record<string, string> = {
  "p interazione":
    "p der Interaktion",
  "{s1} covariate":
    "{s1} Kovariaten",
  "Report di lettura":
    "Lesetext",
  "Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.":
    "Die Steigungen unterscheiden sich zwischen den Gruppen: Die klassische ANCOVA ist nicht zuverlässig.",
  "Il fattore {s1} ha un effetto dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).":
    "Der Faktor {s1} hat nach der Adjustierung für {s2} einen Effekt (F = {s3}, p = {s4}).",
  "Nessun effetto del fattore {s1} dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).":
    "Kein Effekt des Faktors {s1} nach der Adjustierung für {s2} (F = {s3}, p = {s4}).",
  "Pendenze non omogenee":
    "Steigungen nicht homogen",
  "Effetto del fattore":
    "Effekt des Faktors",
  "Nessun effetto":
    "Kein Effekt",
  "L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.":
    "Die ANCOVA vergleicht die Gruppenmittelwerte, nachdem der durch eine oder mehrere kontinuierliche Kovariaten erklärte Variabilitätsanteil entfernt wurde.",
  "Modello: {s1} + {s2}. Le medie aggiustate sono valutate al valore medio delle covariate.":
    "Modell: {s1} + {s2}. Die adjustierten Mittelwerte werden am mittleren Wert der Kovariaten bewertet.",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).":
    "Faktor {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} (Effekt: {s7}).",
  "La media aggiustata più alta è quella di {s1} ({s2}); la media grezza dello stesso gruppo era {s3}.":
    "Der höchste adjustierte Mittelwert ist der von {s1} ({s2}); der rohe Mittelwert derselben Gruppe betrug {s3}.",
  "Medie aggiustate non disponibili.":
    "Adjustierte Mittelwerte nicht verfügbar.",
  "Covariate: {s1}.":
    "Kovariaten: {s1}.",
  "{s1} (F = {s2}, p = {s3})":
    "{s1} (F = {s2}, p = {s3})",
  "Nessuna covariata nel modello.":
    "Keine Kovariate im Modell.",
  "Omogeneità delle pendenze: F({s1}, {s2}) = {s3}, p = {s4}. {s5}":
    "Homogenität der Steigungen: F({s1}, {s2}) = {s3}, p = {s4}. {s5}",
  "df numeratore":
    "df Zähler",
  "df denominatore":
    "df Nenner",
  "F interazione":
    "F der Interaktion",
  "L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.":
    "Die Annahme ist verletzt: Berichten Sie das Modell mit Interaktion oder analysieren Sie die Gruppen getrennt.",
  "Non ci sono prove che le pendenze differiscano tra i gruppi.":
    "Es gibt keine Hinweise darauf, dass sich die Steigungen zwischen den Gruppen unterscheiden.",
  "Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).":
    "Der Test auf Homogenität der Steigungen ist nicht berechenbar (zu wenige Freiheitsgrade).",
  "Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.":
    "Weiterhin erforderlich sind Unabhängigkeit der Beobachtungen, Linearität der Beziehung zu den Kovariaten und Normalität/Homoskedastizität der Residuen.",
  "Confronti tra gruppi":
    "Vergleiche zwischen den Gruppen",
  "Nessun confronto a coppie disponibile.":
    "Kein paarweiser Vergleich verfügbar.",
  "Con correzione Holm risultano significativi: {s1}.":
    "Mit Holm-Korrektur erweisen sich als signifikant: {s1}.",
  "{s1} (Δ = {s2}, p = {s3})":
    "{s1} (Δ = {s2}, p = {s3})",
  "Nessun confronto a coppie resta significativo dopo la correzione di Holm.":
    "Kein paarweiser Vergleich bleibt nach der Holm-Korrektur signifikant.",
  "Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.":
    "Die Differenzen werden auf den adjustierten Mittelwerten berechnet, nicht auf den rohen Mittelwerten.",
  "Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.":
    "Die Kovariaten müssen vor der Behandlung gemessen worden sein und dürfen nicht vom Faktor beeinflusst sein.",
  "Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.":
    "Eine Kovariate mit starkem Messfehler dämpft die Adjustierung und kann die Power verringern.",
  "Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.":
    "Die adjustierten Mittelwerte hängen vom mittleren Wert der Kovariaten ab: Bei sehr unbalancierten Kovariaten kann die Extrapolation fragil sein.",
  "L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.":
    "Die ANCOVA erzeugt keine äquivalenten Gruppen: Sie entfernt nur den linearen Differenzanteil, der mit den beobachteten Kovariaten zusammenhängt.",
  "Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.":
    "Nur ein kategorialer Faktor: Für faktorielle Designs mit Kovariaten ist ein allgemeineres Modell nötig.",
  "Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.":
    "Keine automatische Modellauswahl: Alle gewählten Kovariaten bleiben im Modell.",
  "SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.":
    "Typ-III-Quadratsummen mit Treatment-Kodierung: Bei Interaktionen ändert sich die Bedeutung der Terme.",
  "Termine {s1}":
    "Term {s1}",
  "{s1} − {s2}":
    "{s1} − {s2}",
  "ANCOVA — effetti (SS tipo III)":
    "ANCOVA — Effekte (Typ-III-QS)",
  "{s1} ~ {s2} + {s3} · N = {s4}":
    "{s1} ~ {s2} + {s3} · N = {s4}",
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
  "η²p":
    "η²p",
  "SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).":
    "Typ-III-Quadratsummen: Jeder Term wird getestet, indem er aus dem vollständigen Modell entfernt wird (Faktor und Kovariaten gemeinsam).",
  "Modello: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.":
    "Modell: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.",
  "Medie aggiustate per gruppo":
    "Adjustierte Mittelwerte pro Gruppe",
  "valutate alla media delle covariate · CI {s1}%":
    "bewertet am Mittelwert der Kovariaten · KI {s1} %",
  "Gruppo":
    "Gruppe",
  "N":
    "N",
  "Media grezza":
    "Roher Mittelwert",
  "Media aggiustata":
    "Adjustierter Mittelwert",
  "SE":
    "SE",
  "CI low":
    "KI unten",
  "CI high":
    "KI oben",
  "Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.":
    "Adjustierter Mittelwert = erwarteter Wert der Gruppe, wenn alle Kovariaten auf ihrem Mittelwert liegen.",
  "La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.":
    "Der Unterschied zwischen rohem und adjustiertem Mittelwert zeigt, wie stark die Unbalance der Kovariaten zwischen den Gruppen wiegt.",
  "Coefficienti del modello":
    "Modellkoeffizienten",
  "codifica treatment · riferimento: {s1}":
    "Treatment-Kodierung · Referenz: {s1}",
  "Termine":
    "Term",
  "B":
    "B",
  "t":
    "t",
  "L’intercetta è la media aggiustata del gruppo di riferimento ({s1}).":
    "Der Achsenabschnitt ist der adjustierte Mittelwert der Referenzgruppe ({s1}).",
  "I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.":
    "Die Gruppenkoeffizienten sind adjustierte Differenzen gegenüber der Referenz; die der Kovariaten sind gemeinsame Steigungen.",
  "Omogeneità delle pendenze":
    "Homogenität der Steigungen",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Dettaglio":
    "Detail",
  "F interazione":
    "F der Interaktion",
  "{s1} × covariate":
    "{s1} × Kovariaten",
  "df numeratore":
    "df Zähler",
  "(k−1) × numero di covariate":
    "(k−1) × Anzahl der Kovariaten",
  "df denominatore":
    "df Nenner",
  "residui del modello con interazioni":
    "Residuen des Modells mit Interaktionen",
  "p interazione":
    "p der Interaktion",
  "p > α: pendenze compatibili":
    "p > α: Steigungen vereinbar",
  "Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.":
    "Ist die Interaktion signifikant, unterscheiden sich die Steigungen zwischen den Gruppen: Die klassische ANCOVA ist nicht geeignet.",
  "Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.":
    "Der Test vergleicht das vollständige Modell mit und ohne alle Produkte Gruppe × Kovariate.",
  "Confronti a coppie (medie aggiustate)":
    "Paarweise Vergleiche (adjustierte Mittelwerte)",
  "correzione Holm":
    "Holm-Korrektur",
  "Confronto":
    "Vergleich",
  "Differenza":
    "Differenz",
  "p Holm":
    "p Holm",
  "Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.":
    "Differenz = adjustierter Mittelwert der ersten Gruppe − adjustierter Mittelwert der zweiten.",
  "p non corretti da t con df = {s1}; la colonna Holm controlla il numero di confronti.":
    "Unkorrigierte p aus t mit df = {s1}; die Spalte Holm kontrolliert die Zahl der Vergleiche.",
};
