/** German prose of the multivariate procedure and its tables. */
export const multivariateCopy: Record<string, string> = {
  "{s1} (PC{s2}: {s3})":
    "{s1} (PC{s2}: {s3})",
  "Report di lettura":
    "Lesetext",
  "I {s1} componenti ritenuti spiegano il {s2} della varianza totale.":
    "Die {s1} berücksichtigten Komponenten erklären {s2} der Gesamtvarianz.",
  "Struttura leggibile":
    "Lesbare Struktur",
  "Campione debole":
    "Schwache Stichprobe",
  "La PCA riduce un insieme di variabili correlate a pochi componenti non correlati, ordinati per varianza spiegata.":
    "Die PCA reduziert eine Menge korrelierter Variablen auf wenige unkorrelierte Komponenten, geordnet nach erklärter Varianz.",
  "Analisi su {s1} variabili e {s2} casi completi{s3}.":
    "Analyse über {s1} Variablen und {s2} vollständige Fälle{s3}.",
  ", matrice di correlazione (variabili standardizzate)":
    ", Korrelationsmatrix (standardisierte Variablen)",
  ", matrice di covarianza (unità originali)":
    ", Kovarianzmatrix (Originaleinheiten)",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "Il primo componente spiega il {s1}; i primi {s2} arrivano al {s3}.":
    "Die erste Komponente erklärt {s1}; die ersten {s2} erreichen {s3}.",
  "Le saturazioni più alte sono: {s1}.":
    "Die höchsten Ladungen sind: {s1}.",
  "Nessuna variabile raggiunge |saturazione| ≥ 0.40 sui componenti ritenuti: la struttura è debole o il numero di componenti è insufficiente.":
    "Keine Variable erreicht |Ladung| ≥ 0.40 auf den berücksichtigten Komponenten: Die Struktur ist schwach oder die Zahl der Komponenten zu gering.",
  "Comunalità medie: {s1} (quota di varianza di ogni variabile ripresa dai componenti ritenuti).":
    "Mittlere Kommunalitäten: {s1} (Anteil der Varianz jeder Variable, der von den berücksichtigten Komponenten aufgenommen wird).",
  "Adeguatezza del campione":
    "Eignung der Stichprobe",
  "KMO = {s1} ({s2}): {s3}":
    "KMO = {s1} ({s2}): {s3}",
  "la matrice è adatta alla riduzione dimensionale.":
    "die Matrix eignet sich für die Dimensionsreduktion.",
  "la correlazione parziale è alta rispetto a quella semplice: i componenti possono essere instabili.":
    "die partielle Korrelation ist im Verhältnis zur einfachen hoch: Die Komponenten können instabil sein.",
  "Bartlett χ²({s1}) = {s2}, p = {s3}: {s4}":
    "Bartlett χ²({s1}) = {s2}, p = {s3}: {s4}",
  "la matrice di correlazione non è sferica, quindi esiste struttura da estrarre.":
    "die Korrelationsmatrix ist nicht sphärisch, es gibt also Struktur zu extrahieren.",
  "non si rifiuta la sfericità: la PCA potrebbe non aggiungere molto rispetto alle variabili originali.":
    "die Sphärizität wird nicht verworfen: Die PCA könnte gegenüber den Originalvariablen wenig hinzufügen.",
  "Assunzioni e cautele":
    "Annahmen und Vorsichtsmaßnahmen",
  "La PCA descrive la varianza, non un modello causale: i componenti sono combinazioni lineari, non variabili latenti validate.":
    "Die PCA beschreibt die Varianz, kein Kausalmodell: Die Komponenten sind Linearkombinationen, keine validierten latenten Variablen.",
  "Non è applicata alcuna rotazione: i componenti sono quelli della soluzione ortogonale iniziale.":
    "Es wird keine Rotation angewendet: Die Komponenten sind die der ursprünglichen orthogonalen Lösung.",
  "Campioni piccoli e outlier possono cambiare le saturazioni; controlla il rapporto casi/variabili (almeno 5–10 casi per variabile).":
    "Kleine Stichproben und Ausreißer können die Ladungen verändern; prüfen Sie das Verhältnis Fälle/Variablen (mindestens 5–10 Fälle pro Variable).",
  "Variabili su scale molto diverse richiedono la matrice di correlazione; con unità omogenee la covarianza conserva le differenze di scala.":
    "Variablen auf sehr unterschiedlichen Skalen erfordern die Korrelationsmatrix; bei homogenen Einheiten bewahrt die Kovarianz die Skalenunterschiede.",
  "La PCA non gestisce valori mancanti: i casi incompleti sono esclusi.":
    "Die PCA behandelt keine fehlenden Werte: Unvollständige Fälle werden ausgeschlossen.",
  "KMO e Bartlett richiedono la matrice di correlazione; con la covarianza non sono riportati.":
    "KMO und Bartlett erfordern die Korrelationsmatrix; bei der Kovarianz werden sie nicht berichtet.",
  "Saturazioni e punteggi sono calcolati sui dati osservati: non c’è inferenza né intervallo di confidenza.":
    "Ladungen und Scores werden auf den beobachteten Daten berechnet: Es gibt keine Inferenz und kein Konfidenzintervall.",
  "Cronbach α = {s1} su {s2} item: affidabilità {s3}.":
    "Cronbachs α = {s1} bei {s2} Items: Reliabilität {s3}.",
  "Scala coerente":
    "Kohärente Skala",
  "Coerenza bassa":
    "Geringe Konsistenz",
  "L’α di Cronbach stima la coerenza interna: quanto gli item di una scala misurano la stessa cosa in modo consistente.":
    "Cronbachs α schätzt die interne Konsistenz: wie konsistent die Items einer Skala dasselbe messen.",
  "Calcolato su {s1} casi completi e {s2} item; α standardizzato = {s3}.":
    "Berechnet auf {s1} vollständigen Fällen und {s2} Items; standardisiertes α = {s3}.",
  "α = {s1} ({s2}). La correlazione media tra item è {s3} ({s4}).":
    "α = {s1} ({s2}). Die mittlere Korrelation zwischen den Items beträgt {s3} ({s4}).",
  "La scala supera la soglia convenzionale di 0.70: la somma degli item è sufficientemente coerente per essere usata come punteggio.":
    "Die Skala überschreitet die übliche Schwelle von 0.70: Die Summe der Items ist ausreichend konsistent, um als Score verwendet zu werden.",
  "La scala è sotto la soglia convenzionale di 0.70: la somma degli item contiene molta varianza specifica di ciascun item.":
    "Die Skala liegt unter der üblichen Schwelle von 0.70: Die Summe der Items enthält viel itemspezifische Varianz.",
  "Diagnostica per item":
    "Diagnostik pro Item",
  "Nessun item disponibile.":
    "Kein Item verfügbar.",
  "{s1} item esaminati; {s2} hanno una correlazione item-totale ≥ 0.30.":
    "{s1} Items geprüft; {s2} haben eine Item-Gesamt-Korrelation ≥ 0.30.",
  "Eliminando {s1} l’α aumenterebbe (fino a {s2}).":
    "Bei Entfernen von {s1} würde α steigen (bis {s2}).",
  "Nessun item, se eliminato, aumenta l’α in modo sostanziale.":
    "Kein Item erhöht bei Entfernen das α substanziell.",
  "Item con r item-totale < 0.30: {s1}.":
    "Items mit Item-Gesamt-r < 0.30: {s1}.",
  "Tutti gli item correlano almeno 0.30 con il resto della scala.":
    "Alle Items korrelieren mindestens 0.30 mit dem Rest der Skala.",
  "α assume item con la stessa direzione: item reverse-scored devono essere ricodificati prima dell’analisi.":
    "α setzt Items mit derselben Richtung voraus: umgekehrt gepolte Items müssen vor der Analyse umkodiert werden.",
  "α cresce meccanicamente con il numero di item: confronta scale con lo stesso numero di item.":
    "α wächst mechanisch mit der Zahl der Items: Vergleichen Sie Skalen mit derselben Itemzahl.",
  "Un α alto non dimostra che la scala sia unidimensionale; per questo serve un’analisi fattoriale (es. PCA).":
    "Ein hohes α beweist nicht, dass die Skala eindimensional ist; dafür ist eine Faktorenanalyse nötig (z. B. PCA).",
  "I casi incompleti sono esclusi: se le omissioni non sono casuali, l’α può essere distorto.":
    "Unvollständige Fälle werden ausgeschlossen: Sind die Ausfälle nicht zufällig, kann α verzerrt sein.",
  "È riportato l’α di Cronbach; ω di McDonald non è calcolato.":
    "Es wird Cronbachs α berichtet; McDonalds ω wird nicht berechnet.",
  "Non sono inclusi intervalli di confidenza bootstrapped per α.":
    "Bootstrap-Konfidenzintervalle für α sind nicht enthalten.",
  "Report di analisi fattoriale":
    "Bericht zur Faktorenanalyse",
  "{s1} fattori spiegano il {s2} della varianza; omega = {s3}.":
    "{s1} Faktoren erklären {s2} der Varianz; Omega = {s3}.",
  "Affidabilità buona":
    "Gute Reliabilität",
  "Affidabilità accettabile":
    "Akzeptable Reliabilität",
  "Affidabilità da valutare":
    "Reliabilität zu prüfen",
  "Soluzione {s1} su {s2} casi completi.":
    "Lösung {s1} bei {s2} vollständigen Fällen.",
  "non ruotata":
    "nicht rotiert",
  "Bartlett χ²({s1}) = {s2}, p = {s3}.":
    "Bartlett χ²({s1}) = {s2}, p = {s3}.",
  "Ci sono {s1} loadings sostanziali (|λ| ≥ 0,40): controlla la tabella per attribuire i fattori alle variabili.":
    "Es gibt {s1} substanzielle Ladungen (|λ| ≥ 0,40): Prüfen Sie die Tabelle, um die Faktoren den Variablen zuzuordnen.",
  "Nessun loading raggiunge 0,40: la struttura fattoriale è debole o il numero di fattori è insufficiente.":
    "Keine Ladung erreicht 0,40: Die Faktorenstruktur ist schwach oder die Zahl der Faktoren unzureichend.",
  "Omega totale = {s1}: stima la quota di varianza affidabile della scala complessiva.":
    "Omega insgesamt = {s1}: schätzt den Anteil zuverlässiger Varianz der Gesamtskala.",
  "La parallel analysis confronta gli autovalori osservati con quelli di dati casuali con la stessa numerosità.":
    "Die Parallelanalyse vergleicht die beobachteten Eigenwerte mit denen von Zufallsdaten gleicher Fallzahl.",
  "La soluzione fattoriale non è unica: rotazioni e numero di fattori cambiano l’interpretazione.":
    "Die Faktorenlösung ist nicht eindeutig: Rotationen und Zahl der Faktoren verändern die Interpretation.",
  "L’analisi fattoriale esplorativa non sostituisce una CFA con ipotesi pre-specificate.":
    "Die explorative Faktorenanalyse ersetzt keine CFA mit vorab spezifizierten Hypothesen.",
  "pc{s1}":
    "pk{s1}",
  "PC{s1}":
    "PK{s1}",
  "Autovalori e varianza spiegata":
    "Eigenwerte und erklärte Varianz",
  "{s1} casi completi · {s2} variabili · {s3} componenti ritenuti":
    "{s1} vollständige Fälle · {s2} Variablen · {s3} berücksichtigte Komponenten",
  "Componente":
    "Komponente",
  "Autovalore":
    "Eigenwert",
  "% varianza":
    "% Varianz",
  "% cumulata":
    "% kumuliert",
  "Ritenuto":
    "Berücksichtigt",
  "Criterio di Kaiser: si ritengono i componenti con autovalore > 1 (matrice di correlazione).":
    "Kaiser-Kriterium: Berücksichtigt werden Komponenten mit Eigenwert > 1 (Korrelationsmatrix).",
  "Criterio della media: si ritengono i componenti con autovalore > media degli autovalori (matrice di covarianza).":
    "Mittelwertkriterium: Berücksichtigt werden Komponenten mit Eigenwert > Mittelwert der Eigenwerte (Kovarianzmatrix).",
  "Saturazioni e comunalità":
    "Ladungen und Kommunalitäten",
  "PCA su matrice di correlazione":
    "PCA auf der Korrelationsmatrix",
  "PCA su matrice di covarianza":
    "PCA auf der Kovarianzmatrix",
  "Variabile":
    "Variable",
  "Comunalità":
    "Kommunalität",
  "KMO item":
    "KMO des Items",
  "Saturazione = autovettore × √autovalore. La comunalità è la quota di varianza spiegata dai componenti ritenuti.":
    "Ladung = Eigenvektor × √Eigenwert. Die Kommunalität ist der Anteil der Varianz, der von den berücksichtigten Komponenten erklärt wird.",
  "Con |saturazione| ≥ 0.40 la variabile è di solito considerata associata al componente.":
    "Bei |Ladung| ≥ 0.40 gilt die Variable üblicherweise als mit der Komponente assoziiert.",
  "Adeguatezza del campione":
    "Eignung der Stichprobe",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Dettaglio":
    "Detail",
  "KMO":
    "KMO",
  "Bartlett χ²":
    "Bartlett χ²",
  "df = {s1}":
    "df = {s1}",
  "solo con matrice di correlazione":
    "nur mit Korrelationsmatrix",
  "Bartlett p":
    "Bartlett p",
  "struttura non sferica":
    "nicht sphärische Struktur",
  "nessuna struttura lineare rilevata":
    "keine lineare Struktur festgestellt",
  "non calcolabile":
    "nicht berechenbar",
  "Determinante R":
    "Determinante R",
  "valori prossimi a 0 indicano collinearità":
    "Werte nahe 0 zeigen Kollinearität",
  "N casi":
    "N Fälle",
  "casi completi sulle variabili selezionate":
    "vollständige Fälle über die ausgewählten Variablen",
  "KMO ≥ 0.70 è in genere considerato adeguato per la PCA.":
    "KMO ≥ 0.70 gilt in der Regel als angemessen für die PCA.",
  "Bartlett significativo indica che la matrice di correlazione non è un’identità: è una condizione necessaria, non sufficiente.":
    "Ein signifikantes Bartlett-Ergebnis zeigt, dass die Korrelationsmatrix keine Identität ist: eine notwendige, nicht hinreichende Bedingung.",
  "Affidabilità della scala":
    "Reliabilität der Skala",
  "{s1} item · {s2} casi completi":
    "{s1} Items · {s2} vollständige Fälle",
  "Cronbach α":
    "Cronbach α",
  "α standardizzato":
    "standardisiertes α",
  "sulle correlazioni inter-item":
    "auf den Inter-Item-Korrelationen",
  "r media inter-item":
    "mittleres r zwischen den Items",
  "Media totale":
    "Gesamtmittelwert",
  "somma dei punteggi / casi":
    "Summe der Scores / Fälle",
  "SD totale":
    "Gesamt-SD",
  "deviazione standard della somma":
    "Standardabweichung der Summe",
  "α = k/(k−1) · [1 − Σσ²item / σ²totale].":
    "α = k/(k−1) · [1 − Σσ²Item / σ²gesamt].",
  "α non misura l’unidimensionalità: una scala può avere α alto pur con più fattori.":
    "α misst nicht die Eindimensionalität: Eine Skala kann ein hohes α haben und dennoch mehrere Faktoren enthalten.",
  "Diagnostica per item":
    "Diagnostik pro Item",
  "Item":
    "Item",
  "Media":
    "Mittelwert",
  "SD":
    "SD",
  "r item-totale":
    "Item-Gesamt-r",
  "α se eliminato":
    "α bei Entfernen",
  "r item-totale = correlazione dell’item con la somma degli altri item (corretta).":
    "Item-Gesamt-r = Korrelation des Items mit der Summe der übrigen Items (korrigiert).",
  "Un α-se-eliminato maggiore dell’α totale segnala un item che riduce la coerenza interna.":
    "Ein höheres α-bei-Entfernen als das Gesamt-α kennzeichnet ein Item, das die interne Konsistenz verringert.",
  "Correlazioni inter-item":
    "Inter-Item-Korrelationen",
  "Correlazioni di Pearson sui casi completi; la diagonale è 1.":
    "Pearson-Korrelationen auf den vollständigen Fällen; die Diagonale ist 1.",
  "Adeguatezza della soluzione":
    "Eignung der Lösung",
  "{s1} casi · {s2} variabili · {s3} fattori":
    "{s1} Fälle · {s2} Variablen · {s3} Faktoren",
  "N":
    "N",
  "Variabili":
    "Variablen",
  "Fattori":
    "Faktoren",
  "Bartlett df":
    "Bartlett df",
  "Omega totale":
    "Omega insgesamt",
  "Bartlett verifica che la matrice di correlazione non sia un’identità: è una condizione necessaria, non sufficiente.":
    "Bartlett prüft, dass die Korrelationsmatrix keine Identität ist: eine notwendige, nicht hinreichende Bedingung.",
  "Omega totale è calcolato dai loadings e dalle unicità della soluzione ruotata.":
    "Omega insgesamt wird aus den Ladungen und den Einzigartigkeiten der rotierten Lösung berechnet.",
  "Autovalori e parallel analysis":
    "Eigenwerte und Parallelanalyse",
  "Soglia = 95° percentile dei dati casuali":
    "Schwelle = 95. Perzentil der Zufallsdaten",
  "Soglia parallela":
    "Parallele Schwelle",
  "I fattori ritenuti sono quelli con autovalore sopra la soglia della parallel analysis.":
    "Berücksichtigt werden Faktoren mit einem Eigenwert über der Schwelle der Parallelanalyse.",
  "Loadings ({s1})":
    "Ladungen ({s1})",
  "non ruotati":
    "nicht rotiert",
  "f{s1}":
    "f{s1}",
  "F{s1}":
    "F{s1}",
  "Unicità":
    "Einzigartigkeit",
  "Loadings ≥ 0,40 sono generalmente considerati sostanziali; il segno è arbitrario.":
    "Ladungen ≥ 0,40 gelten in der Regel als substanziell; das Vorzeichen ist willkürlich.",
};
