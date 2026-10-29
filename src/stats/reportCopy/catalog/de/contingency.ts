/** German prose of the contingency procedure and its tables. */
export const contingencyCopy: Record<string, string> = {
  "non calcolabile":
    "nicht berechenbar",
  "più osservazioni":
    "mehr Beobachtungen",
  "meno osservazioni":
    "weniger Beobachtungen",
  "{s1}: {s2} del previsto (residuo aggiustato {s3})":
    "{s1}: {s2} des Erwarteten (adjustiertes Residuum {s3})",
  "Tabelle troppo piccole o con celle vuote: il test non è calcolabile.":
    "Tabellen zu klein oder mit leeren Zellen: Der Test ist nicht berechenbar.",
  "Le due variabili non sono indipendenti (χ² = {s1}, df = {s2}, p = {s3}).":
    "Die beiden Variablen sind nicht unabhängig (χ² = {s1}, df = {s2}, p = {s3}).",
  "Nessuna evidenza di associazione (χ² = {s1}, df = {s2}, p = {s3}).":
    "Kein Hinweis auf einen Zusammenhang (χ² = {s1}, df = {s2}, p = {s3}).",
  "Report di lettura":
    "Lesetext",
  "Associazione significativa":
    "Signifikanter Zusammenhang",
  "Nessuna associazione rilevata":
    "Kein Zusammenhang festgestellt",
  "Il test del χ² confronta le frequenze che osservi con quelle che ti aspetteresti se le due variabili categoriche fossero completamente indipendenti.":
    "Der χ²-Test vergleicht die beobachteten Häufigkeiten mit denen, die Sie erwarten würden, wenn die beiden kategorialen Variablen völlig unabhängig wären.",
  "L’ipotesi nulla è “indipendenza”: nessuna relazione tra riga e colonna. Un p piccolo significa che le differenze tra osservato e atteso sono troppo grandi per essere solo rumore campionario.":
    "Die Nullhypothese lautet „Unabhängigkeit“: keine Beziehung zwischen Zeile und Spalte. Ein kleines p bedeutet, dass die Unterschiede zwischen beobachtet und erwartet zu groß sind, um nur Stichprobenrauschen zu sein.",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "La tabella ha N = {s1} osservazioni e {s2} gradi di libertà. Il χ² di Pearson vale {s3}: {s4}{s5}":
    "Die Tabelle hat N = {s1} Beobachtungen und {s2} Freiheitsgrade. Das Pearson-χ² beträgt {s3}: {s4}{s5}",
  ", sotto la soglia α = {s1}: l’ipotesi di indipendenza viene rifiutata.":
    ", unter der Schwelle α = {s1}: Die Unabhängigkeitshypothese wird verworfen.",
  ", sopra la soglia α = {s1}: l’ipotesi di indipendenza non viene rifiutata.":
    ", über der Schwelle α = {s1}: Die Unabhängigkeitshypothese wird nicht verworfen.",
  "Con celle piccole il test esatto di Fisher dà p = {s1}: è il valore da preferire in una tabella 2×2 con attese basse.":
    "Bei kleinen Zellen liefert der exakte Test nach Fisher p = {s1}: Dieser Wert ist bei einer 2×2-Tabelle mit niedrigen Erwartungen vorzuziehen.",
  "Poiché {s1} celle hanno attesa sotto 5, ho aggiunto un p Monte Carlo con margini fissi ({s2}): non dipende dall’approssimazione asintotica.":
    "Da {s1} Zellen eine Erwartung unter 5 aufweisen, habe ich ein Monte-Carlo-p mit festen Randsummen ergänzt ({s2}): Es hängt nicht von der asymptotischen Näherung ab.",
  "Dove sta l’associazione":
    "Wo der Zusammenhang liegt",
  "Il χ² dice che qualcosa c’è, non dove. I residui aggiustati rispondono a questa domanda: valori oltre ±2 indicano le celle che si discostano dall’indipendenza più di quanto il caso spieghi.":
    "Das χ² sagt, dass etwas da ist, nicht wo. Die adjustierten Residuen beantworten diese Frage: Werte über ±2 kennzeichnen die Zellen, die stärker von der Unabhängigkeit abweichen, als der Zufall erklärt.",
  "Nessuna cella supera la soglia di ±2: l’associazione è diffusa, non concentrata in una combinazione specifica.":
    "Keine Zelle überschreitet die Schwelle von ±2: Der Zusammenhang ist breit gestreut, nicht auf eine bestimmte Kombination konzentriert.",
  "Quanto è forte":
    "Wie stark",
  "Cramér’s V = {s1}: un’associazione {s2} (0 = indipendenza, 1 = legame deterministico). Il p-value può essere piccolissimo anche per associazioni debolissime se N è grande: la forza va letta qui, non nel p.":
    "Cramér’s V = {s1}: ein {s2} Zusammenhang (0 = Unabhängigkeit, 1 = deterministischer Zusammenhang). Der p-Wert kann selbst bei sehr schwachen Zusammenhängen winzig sein, wenn N groß ist: Die Stärke liest man hier, nicht am p.",
  "La misura di associazione non è calcolabile con questi dati.":
    "Das Assoziationsmaß ist mit diesen Daten nicht berechenbar.",
  "Assunzioni da controllare":
    "Zu prüfende Annahmen",
  "Osservazioni indipendenti: ogni riga del dataset deve essere una unità diversa, non una misura ripetuta.":
    "Unabhängige Beobachtungen: Jede Zeile des Datensatzes muss eine andere Einheit sein, keine wiederholte Messung.",
  "Categorie esaustive e mutuamente esclusive: ogni osservazione cade in una sola cella.":
    "Vollständige und sich gegenseitig ausschließende Kategorien: Jede Beobachtung fällt in genau eine Zelle.",
  "Regola di Cochran: nessuna attesa < 1 e non più del 20% delle celle con attesa < 5; se cade, usa Fisher (2×2) o il p Monte Carlo.":
    "Cochran-Regel: keine Erwartung < 1 und höchstens 20 % der Zellen mit Erwartung < 5; ist sie verletzt, verwenden Sie Fisher (2×2) oder das Monte-Carlo-p.",
  "Il test non dice nulla sulla direzione causale: associazione non è causa.":
    "Der Test sagt nichts über die kausale Richtung: Zusammenhang ist keine Ursache.",
  "Tabelle molto grandi con molte categorie rare rendono il χ² instabile anche con N elevato.":
    "Sehr große Tabellen mit vielen seltenen Kategorien machen das χ² auch bei hohem N instabil.",
  "Con dati raggruppati per convenienza (non campionati) il p-value non ha il significato nominale.":
    "Bei nach Zweckmäßigkeit gruppierten, nicht zufällig gezogenen Daten hat der p-Wert nicht die nominale Bedeutung.",
  "Row {s1}":
    "Zeile {s1}",
  "c{s1}":
    "s{s1}",
  "{s1} · {s2}":
    "{s1} · {s2}",
  "Col {s1}":
    "Sp. {s1}",
  "Tabella di contingenza (frequenze osservate)":
    "Kontingenztabelle (beobachtete Häufigkeiten)",
  "{s1} × {s2} · N = {s3}":
    "{s1} × {s2} · N = {s3}",
  "Riga":
    "Zeile",
  "Totale":
    "Gesamt",
  "Ogni cella contiene il numero di osservazioni con quella combinazione di categorie.":
    "Jede Zelle enthält die Anzahl der Beobachtungen mit dieser Kombination von Kategorien.",
  "Frequenze attese sotto indipendenza":
    "Erwartete Häufigkeiten unter Unabhängigkeit",
  "E = (totale riga × totale colonna) / N":
    "E = (Zeilensumme × Spaltensumme) / N",
  "Le attese sono le frequenze che si vedrebbero se le due variabili fossero indipendenti.":
    "Die erwarteten Werte sind die Häufigkeiten, die man sehen würde, wenn die beiden Variablen unabhängig wären.",
  "{s1} cella/e su {s2} hanno attesa < 5: l'approssimazione χ² è fragile (regola di Cochran).":
    "{s1} Zelle(n) von {s2} haben eine Erwartung < 5: Die χ²-Näherung ist fragil (Cochran-Regel).",
  "Tutte le attese sono ≥ 5: l’approssimazione χ² è adeguata.":
    "Alle Erwartungen sind ≥ 5: Die χ²-Näherung ist angemessen.",
  "Residui e contributi al χ²":
    "Residuen und Beiträge zum χ²",
  "Residuo standardizzato = (O − E)/√E":
    "Standardisiertes Residuum = (O − E)/√E",
  "Cella":
    "Zelle",
  "O":
    "O",
  "E":
    "E",
  "Residuo std.":
    "Std. Residuum",
  "Residuo aggiustato":
    "Adjustiertes Residuum",
  "Contributo χ²":
    "Beitrag zum χ²",
  "Un residuo aggiustato oltre ±2 segnala la cella che si discosta di più dall’indipendenza.":
    "Ein adjustiertes Residuum über ±2 kennzeichnet die Zelle, die am stärksten von der Unabhängigkeit abweicht.",
  "Il contributo è quanto quella cella pesa nel χ² totale: le prime posizioni spiegano l’associazione.":
    "Der Beitrag gibt an, wie stark diese Zelle im Gesamt-χ² wiegt: Die ersten Positionen erklären den Zusammenhang.",
  "Pearson χ²":
    "Pearson χ²",
  "Likelihood ratio G²":
    "Likelihood-Quotient G²",
  "Yates (correzione di continuità)":
    "Yates (Kontinuitätskorrektur)",
  "Fisher's exact (two-sided)":
    "Exakter Test nach Fisher (zweiseitig)",
  "Monte Carlo ({s1} tavole, margini fissi)":
    "Monte Carlo ({s1} Tabellen, feste Randsummen)",
  "Test di indipendenza":
    "Unabhängigkeitstest",
  "α = {s1}":
    "α = {s1}",
  "Test":
    "Test",
  "Statistica":
    "Statistik",
  "df":
    "df",
  "p":
    "p",
  "df = (righe − 1)(colonne − 1) = {s1}.":
    "df = (Zeilen − 1)(Spalten − 1) = {s1}.",
  "χ² e G² condividono le stesse assunzioni: osservazioni indipendenti, categorie esaustive, attese sufficientemente grandi.":
    "χ² und G² teilen dieselben Annahmen: unabhängige Beobachtungen, vollständige Kategorien, ausreichend große Erwartungen.",
  "Il test dice che esiste un’associazione, non quanto sia forte né in quale direzione: per quello servono residui e misure di associazione.":
    "Der Test sagt, dass ein Zusammenhang besteht, nicht wie stark er ist oder in welche Richtung: Dafür braucht es Residuen und Assoziationsmaße.",
  "Cramér’s V":
    "Cramér’s V",
  "0 = nessuna associazione, 1 = associazione perfetta":
    "0 = kein Zusammenhang, 1 = perfekter Zusammenhang",
  "Coefficiente di contingenza C":
    "Kontingenzkoeffizient C",
  "Dipende dal numero di categorie: confrontabile solo tra tabelle di stessa forma":
    "Hängt von der Zahl der Kategorien ab: nur zwischen Tabellen gleicher Form vergleichbar",
  "φ (phi)":
    "φ (Phi)",
  "Per tabelle 2×2 coincide con la correlazione tra le due variabili binarie":
    "Bei 2×2-Tabellen stimmt er mit der Korrelation der beiden binären Variablen überein",
  "Ampiezza dell’associazione":
    "Stärke des Zusammenhangs",
  "Misura":
    "Maß",
  "Valore":
    "Wert",
  "Lettura":
    "Lesart",
  "Il p-value dipende da N; queste misure no, ed è per questo che vanno riportate insieme.":
    "Der p-Wert hängt von N ab; diese Maße nicht, und deshalb sollten sie gemeinsam berichtet werden.",
};
