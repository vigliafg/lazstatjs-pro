/** German prose of the repeated procedure and its tables. */
export const repeatedCopy: Record<string, string> = {
  "W di Kendall":
    "Kendalls W",
  "Report di lettura":
    "Lesetext",
  "Le {s1} misure ripetute differiscono (p = {s2}).":
    "Die {s1} wiederholten Messungen unterscheiden sich (p = {s2}).",
  "Non emergono differenze tra le misure ripetute (p = {s1}).":
    "Es zeigen sich keine Unterschiede zwischen den wiederholten Messungen (p = {s1}).",
  "Differenza rilevata":
    "Unterschied festgestellt",
  "Nessuna differenza":
    "Kein Unterschied",
  "Il test di Friedman è l’alternativa non parametrica all’ANOVA a misure ripetute: confronta k condizioni misurate sulle stesse unità usando i ranghi dentro ogni blocco (una riga = una unità).":
    "Der Friedman-Test ist die nicht parametrische Alternative zur Messwiederholungs-ANOVA: Er vergleicht k Bedingungen, die an denselben Einheiten gemessen wurden, über die Ränge innerhalb jedes Blocks (eine Zeile = eine Einheit).",
  "Non richiede normalità né varianze uguali; richiede invece blocchi completi e misure almeno ordinali.":
    "Er setzt weder Normalität noch gleiche Varianzen voraus; er verlangt jedoch vollständige Blöcke und mindestens ordinale Messungen.",
  "La lettura dei risultati":
    "Die Lesart der Ergebnisse",
  "χ² di Friedman = {s1} con {s2}: {s3}":
    "Friedman-χ² = {s1} mit {s2}: {s3}",
  "χ² di Friedman":
    "Friedman-χ²",
  "rifiuta l’ipotesi che tutte le condizioni siano equivalenti.":
    "verwirft die Hypothese, dass alle Bedingungen gleichwertig sind.",
  "non rifiuta l’ipotesi di equivalenza.":
    "verwirft die Hypothese der Gleichwertigkeit nicht.",
  "W di Kendall = {s1}: concordanza {s2} tra le condizioni.":
    "Kendalls W = {s1}: {s2} Übereinstimmung zwischen den Bedingungen.",
  "Il post-hoc Nemenyi segnala {s1} al livello {s2}%: {s3}.":
    "Der Post-hoc-Test nach Nemenyi zeigt {s1} auf dem Niveau {s2} %: {s3}.",
  "nessun confronto significativo":
    "kein signifikanter Vergleich",
  "{s1} confronto significativo":
    "{s1} signifikanter Vergleich",
  "{s1} confronti significativi":
    "{s1} signifikante Vergleiche",
  "Assunzioni e cautele":
    "Annahmen und Vorsichtsmaßnahmen",
  "Ogni riga deve contenere tutte le k misure: le righe incomplete vengono scartate.":
    "Jede Zeile muss alle k Messungen enthalten: Unvollständige Zeilen werden verworfen.",
  "Il test usa i ranghi within-block: differenze sistematiche di livello tra blocchi non pesano.":
    "Der Test verwendet die Ränge innerhalb der Blöcke: Systematische Niveauunterschiede zwischen Blöcken fallen nicht ins Gewicht.",
  "Con pochi blocchi la potenza è bassa; con molti trattamenti Nemenyi diventa conservativo.":
    "Bei wenigen Blöcken ist die Power gering; bei vielen Behandlungen wird Nemenyi konservativ.",
  "Il post-hoc Nemenyi assume blocchi bilanciati e usa l’approssimazione del range studentizzato con df infinito.":
    "Der Post-hoc-Test nach Nemenyi setzt balancierte Blöcke voraus und verwendet die Näherung der studentisierten Spannweite mit unendlichen df.",
  "Non sono gestiti disegni misti (between + within) né covariate.":
    "Gemischte Designs (between + within) und Kovariaten werden nicht behandelt.",
  "p esatto (binomiale)":
    "Exaktes p (binomial)",
  "Le due misure cambiano in modo asimmetrico (p esatto = {s1}): {s2} risulta più spesso positiva.":
    "Die beiden Messungen ändern sich asymmetrisch (exaktes p = {s1}): {s2} ist häufiger positiv.",
  "Nessuna asimmetria nei cambiamenti tra {s1} e {s2} (p esatto = {s3}).":
    "Keine Asymmetrie der Änderungen zwischen {s1} und {s2} (exaktes p = {s3}).",
  "Cambiamento asimmetrico":
    "Asymmetrische Veränderung",
  "Nessuna asimmetria":
    "Keine Asymmetrie",
  "McNemar confronta due misure binarie rilevate sulle stesse unità e si concentra sulle coppie che cambiano (discordanti), ignorando quelle concordanti.":
    "McNemar vergleicht zwei binäre Messungen, die an denselben Einheiten erhoben wurden, und konzentriert sich auf die Paare, die sich ändern (diskordante), während er die übereinstimmenden ignoriert.",
  "È il test giusto per un disegno before/after su esito sì/no, non per due gruppi indipendenti.":
    "Er ist der richtige Test für ein Vorher-Nachher-Design mit Ja/Nein-Ergebnis, nicht für zwei unabhängige Gruppen.",
  "Le coppie discordanti sono b = {s1} ({s2} = 1, {s3} = 0) e c = {s4} ({s5} = 1, {s6} = 0).":
    "Die diskordanten Paare sind b = {s1} ({s2} = 1, {s3} = 0) und c = {s4} ({s5} = 1, {s6} = 0).",
  "Il p esatto è {s1}: {s2}":
    "Das exakte p ist {s1}: {s2}",
  "rifiuta l’ipotesi che i due esiti abbiano la stessa probabilità di cambiamento.":
    "verwirft die Hypothese, dass die beiden Ergebnisse die gleiche Veränderungswahrscheinlichkeit haben.",
  "non rifiuta l’ipotesi di simmetria dei cambiamenti.":
    "verwirft die Hypothese der Symmetrie der Veränderungen nicht.",
  "L’odds ratio b/c = {s1}: valori sopra 1 indicano che il passaggio 1 → 0 è più frequente del contrario.":
    "Das Odds Ratio b/c = {s1}: Werte über 1 zeigen, dass der Übergang 1 → 0 häufiger ist als der umgekehrte.",
  "Le due misure devono riferirsi alle stesse unità e allo stesso intervallo di tempo.":
    "Die beiden Messungen müssen sich auf dieselben Einheiten und denselben Zeitraum beziehen.",
  "Le coppie concordanti non entrano nel test: la numerosità che conta è b + c.":
    "Übereinstimmende Paare gehen nicht in den Test ein: Entscheidend ist die Fallzahl b + c.",
  "Con pochi discordanti usare il p esatto; l’approssimazione χ² è solo indicativa.":
    "Bei wenigen diskordanten Paaren das exakte p verwenden; die χ²-Näherung ist nur ein Hinweis.",
  "Non gestisce covariati né più di due occasioni (per tre o più usare Cochran Q).":
    "Covariaten werden nicht berücksichtigt, ebenso wenig mehr als zwei Zeitpunkte (für drei oder mehr Cochran Q verwenden).",
  "L’odds ratio b/c può essere infinito quando c = 0.":
    "Das Odds Ratio b/c kann unendlich sein, wenn c = 0.",
  "Le condizioni binarie differiscono (Q = {s1}, p = {s2}).":
    "Die binären Bedingungen unterscheiden sich (Q = {s1}, p = {s2}).",
  "Nessuna differenza tra le condizioni binarie (Q = {s1}, p = {s2}).":
    "Kein Unterschied zwischen den binären Bedingungen (Q = {s1}, p = {s2}).",
  "Cochran Q è l’estensione di McNemar a tre o più condizioni binarie misurate sulle stesse unità: verifica se la probabilità di successo cambia tra le condizioni.":
    "Cochran Q ist die Erweiterung von McNemar auf drei oder mehr binäre Bedingungen, die an denselben Einheiten gemessen wurden: Es prüft, ob sich die Erfolgswahrscheinlichkeit zwischen den Bedingungen ändert.",
  "Q = {s1} con {s2} e p = {s3}.":
    "Q = {s1} mit {s2} und p = {s3}.",
  "{s1}":
    "{s1}",
  "Il test rifiuta l’ipotesi che tutte le condizioni abbiano la stessa probabilità di successo.":
    "Der Test verwirft die Hypothese, dass alle Bedingungen dieselbe Erfolgswahrscheinlichkeit haben.",
  "Il test non rifiuta l’ipotesi di uguale probabilità di successo.":
    "Der Test verwirft die Hypothese gleicher Erfolgswahrscheinlichkeit nicht.",
  "La condizione con più successi è {s1} ({s2} su {s3}).":
    "Die Bedingung mit den meisten Erfolgen ist {s1} ({s2} von {s3}).",
  "Le k misure devono essere binarie (0/1) e rilevate sulle stesse unità.":
    "Die k Messungen müssen binär (0/1) und an denselben Einheiten erhoben sein.",
  "Le righe incomplete vengono scartate: riporta quanti blocchi restano.":
    "Unvollständige Zeilen werden verworfen: Berichten Sie, wie viele Blöcke verbleiben.",
  "Con poche unità l’approssimazione χ² è ottimistica; valuta test esatti o simulazioni.":
    "Bei wenigen Einheiten ist die χ²-Näherung optimistisch; erwägen Sie exakte Tests oder Simulationen.",
  "Se Q è significativo, individua le coppie con McNemar correggendo per i confronti multipli.":
    "Ist Q signifikant, identifizieren Sie die Paare mit McNemar und korrigieren für die multiplen Vergleiche.",
  "Non produce un post-hoc corretto automaticamente: per le coppie usare McNemar con aggiustamento.":
    "Es wird kein automatisch korrigierter Post-hoc-Test erzeugt: Für die Paare McNemar mit Adjustierung verwenden.",
  "Non gestisce disegni con misure mancanti parziali (listwise deletion).":
    "Designs mit teilweise fehlenden Messungen werden nicht behandelt (Listwise Deletion).",
  "p (due code)":
    "p (zweiseitig)",
  "r = z/√N":
    "r = z/√N",
  "Trend {s1} lungo l’ordine dei gruppi (z = {s2}, p = {s3}).":
    "Trend {s1} entlang der Gruppenreihenfolge (z = {s2}, p = {s3}).",
  "Nessuna tendenza monotonica lungo l’ordine dei gruppi (z = {s1}, p = {s2}).":
    "Keine monotone Tendenz entlang der Gruppenreihenfolge (z = {s1}, p = {s2}).",
  "Trend {s1}":
    "Trend {s1}",
  "Nessun trend":
    "Kein Trend",
  "Il test di Jonckheere–Terpstra verifica un’ipotesi di trend tra gruppi ordinati, usando l’ordine delle colonne selezionate: è più potente di Kruskal–Wallis quando l’alternativa è monotònica.":
    "Der Test nach Jonckheere–Terpstra prüft eine Trendhypothese zwischen geordneten Gruppen anhand der Reihenfolge der ausgewählten Spalten: Er ist mächtiger als Kruskal–Wallis, wenn die Alternative monoton ist.",
  "L’ordine inserito è {s1}.":
    "Die eingegebene Reihenfolge ist {s1}.",
  "U = {s1} contro un atteso di {s2} sotto H₀.":
    "U = {s1} gegenüber einem Erwartungswert von {s2} unter H₀.",
  "I valori tendono a {s1} passando da {s2} a {s3}.":
    "Die Werte tendieren zu {s1} beim Übergang von {s2} zu {s3}.",
  "La successione dei gruppi non mostra un andamento monotònico convincente.":
    "Die Abfolge der Gruppen zeigt keinen überzeugenden monotonen Verlauf.",
  "Dimensione dell’effetto r = {s1} (0,1 piccolo, 0,3 medio, 0,5 grande).":
    "Effektstärke r = {s1} (0,1 klein, 0,3 mittel, 0,5 groß).",
  "I gruppi devono essere ordinati prima di eseguire il test: l’ordine non può essere scelto guardando i risultati.":
    "Die Gruppen müssen vor der Durchführung des Tests geordnet werden: Die Reihenfolge darf nicht nach den Ergebnissen gewählt werden.",
  "Le osservazioni devono essere indipendenti tra loro e almeno ordinali.":
    "Die Beobachtungen müssen voneinander unabhängig und mindestens ordinal sein.",
  "Il test rileva un trend, non quale coppia differisca: per i confronti puntuali servono post-hoc dedicati.":
    "Der Test erkennt einen Trend, nicht welches Paar sich unterscheidet: Für punktuelle Vergleiche sind eigene Post-hoc-Tests nötig.",
  "Approssimazione normale: con gruppi molto piccoli il p può essere impreciso.":
    "Normalapproximation: Bei sehr kleinen Gruppen kann das p ungenau sein.",
  "Non gestisce blocchi o misure ripetute: per quelle usare Friedman.":
    "Blöcke oder wiederholte Messungen werden nicht behandelt: Dafür Friedman verwenden.",
  "Test di Friedman":
    "Friedman-Test",
  "{s1} misure ripetute · {s2} blocchi":
    "{s1} wiederholte Messungen · {s2} Blöcke",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Dettaglio":
    "Detail",
  "χ² di Friedman":
    "Friedman-χ²",
  "df = {s1}":
    "df = {s1}",
  "p":
    "p",
  "approssimazione χ²":
    "χ²-Näherung",
  "W di Kendall":
    "Kendalls W",
  "0 = nessuna concordanza, 1 = concordanza perfetta":
    "0 = keine Übereinstimmung, 1 = perfekte Übereinstimmung",
  "Correzione per i ranghi uguali":
    "Korrektur für gleiche Ränge",
  "fattore applicato alla statistica":
    "auf die Statistik angewandter Faktor",
  "H₀: le k misure provengono dalla stessa distribuzione (nessuna differenza tra trattamenti).":
    "H₀: Die k Messungen stammen aus derselben Verteilung (kein Unterschied zwischen den Behandlungen).",
  "Blocchi incompleti o valori non numerici vengono esclusi prima del test.":
    "Unvollständige Blöcke oder nicht numerische Werte werden vor dem Test ausgeschlossen.",
  "Ranghi medi per trattamento":
    "Mittlere Ränge pro Behandlung",
  "Trattamento":
    "Behandlung",
  "Rango medio":
    "Mittlerer Rang",
  "Somma ranghi":
    "Rangsumme",
  "Ranghi medi più bassi indicano valori più bassi nel confronto within-subject.":
    "Niedrigere mittlere Ränge zeigen niedrigere Werte im Within-Subject-Vergleich.",
  "Post-hoc Nemenyi":
    "Post-hoc Nemenyi",
  "CI {s1}% · differenza critica {s2}":
    "KI {s1} % · kritische Differenz {s2}",
  "Confronto":
    "Vergleich",
  "Δ ranghi medi":
    "Δ der mittleren Ränge",
  "q":
    "q",
  "Significativo":
    "Signifikant",
  "{s1} vs {s2}":
    "{s1} vs. {s2}",
  "SE = {s1} · q critico = {s2} (studentized range, df ∞).":
    "SE = {s1} · kritisches q = {s2} (studentisierte Spannweite, df ∞).",
  "Nemenyi confronta tutte le coppie controllando il family-wise error; con molti trattamenti è conservativo.":
    "Nemenyi vergleicht alle Paare und kontrolliert den family-wise error; bei vielen Behandlungen ist es konservativ.",
  "Tabella dei cambiamenti":
    "Tabelle der Veränderungen",
  "Combinazione":
    "Kombination",
  "N":
    "N",
  "Entrambi 1 ({s1}=1, {s2}=1)":
    "Beide 1 ({s1}=1, {s2}=1)",
  "Solo {s1} = 1":
    "Nur {s1} = 1",
  "Entrambi 0":
    "Beide 0",
  "Solo le coppie discordanti (b e c) contribuiscono al test.":
    "Nur die diskordanten Paare (b und c) tragen zum Test bei.",
  "Test di McNemar":
    "McNemar-Test",
  "coppie discordanti = {s1} · CI {s2}%":
    "diskordante Paare = {s1} · KI {s2} %",
  "b (1 → 0)":
    "b (1 → 0)",
  " positivo, ":
    " positiv, ",
  " negativo":
    " negativ",
  "c (0 → 1)":
    "c (0 → 1)",
  " negativo, ":
    " negativ, ",
  " positivo":
    " positiv",
  "p esatto (binomiale)":
    "Exaktes p (binomial)",
  "b+c prove con p = 0,5":
    "b+c Versuche mit p = 0,5",
  "χ² con correzione di Yates":
    "χ² mit Yates-Korrektur",
  "approssimazione χ² (1 df)":
    "χ²-Näherung (1 df)",
  "p asintotico":
    "asymptotisches p",
  "usare l’esatto con pochi discordanti":
    "bei wenigen diskordanten Paaren das exakte p verwenden",
  "Odds ratio (b/c)":
    "Odds Ratio (b/c)",
  "> 1 favorisce ":
    "> 1 begünstigt ",
  "Con b+c < 25 l’approssimazione χ² è inaffidabile: fare riferimento al p esatto.":
    "Bei b+c < 25 ist die χ²-Näherung unzuverlässig: auf das exakte p zurückgreifen.",
  "Test Q di Cochran":
    "Cochran-Q-Test",
  "{s1} condizioni binarie · {s2} blocchi · CI {s3}%":
    "{s1} binäre Bedingungen · {s2} Blöcke · KI {s3} %",
  "Q di Cochran":
    "Cochran Q",
  "H₀: la probabilità di successo è la stessa nelle k condizioni ripetute.":
    "H₀: Die Erfolgswahrscheinlichkeit ist in den k wiederholten Bedingungen gleich.",
  "Le righe con valori mancanti o diversi da 0/1 vengono escluse.":
    "Zeilen mit fehlenden Werten oder Werten ungleich 0/1 werden ausgeschlossen.",
  "Successi per condizione":
    "Erfolge pro Bedingung",
  "Condizione":
    "Bedingung",
  "Successi":
    "Erfolge",
  "Proporzione":
    "Anteil",
  "Proporzioni descrittive: il test Q valuta se le differenze sono compatibili con il caso.":
    "Deskriptive Anteile: Der Q-Test beurteilt, ob die Unterschiede mit dem Zufall vereinbar sind.",
  "Test di Jonckheere–Terpstra":
    "Jonckheere–Terpstra-Test",
  "{s1} gruppi ordinati · N = {s2} · CI {s3}%":
    "{s1} geordnete Gruppen · N = {s2} · KI {s3} %",
  "U di Jonckheere–Terpstra":
    "U nach Jonckheere–Terpstra",
  "somma delle coppie ordinate tra gruppi":
    "Summe der geordneten Paare zwischen den Gruppen",
  "E[U]":
    "E[U]",
  "valore atteso sotto H₀":
    "Erwartungswert unter H₀",
  "z":
    "z",
  "approssimazione normale":
    "Normalapproximation",
  "p (due code)":
    "p (zweiseitig)",
  "trend monotonico in una direzione":
    "monotoner Trend in eine Richtung",
  "r = z/√N":
    "r = z/√N",
  "dimensione dell’effetto":
    "Effektstärke",
  "H₀: nessuna tendenza monotonica tra i gruppi ordinati; H₁: i valori crescono (o decrescono) con l’ordine dei gruppi.":
    "H₀: keine monotone Tendenz zwischen den geordneten Gruppen; H₁: Die Werte steigen (oder fallen) mit der Reihenfolge der Gruppen.",
  "I gruppi devono essere inseriti in ordine crescente: l’ordine delle colonne definisce l’ipotesi alternativa.":
    "Die Gruppen müssen in aufsteigender Reihenfolge eingegeben werden: Die Spaltenreihenfolge definiert die Alternativhypothese.",
  "Descrittive per gruppo":
    "Deskriptive Werte pro Gruppe",
  "Gruppo":
    "Gruppe",
  "Mediana":
    "Median",
  "Media":
    "Mittelwert",
};
