/** German prose of the samplesize procedure and its tables. */
export const samplesizeCopy: Record<string, string> = {
  "n per gruppo":
    "n pro Gruppe",
  "N totale":
    "N insgesamt",
  "Potenza raggiunta":
    "Erreichte Power",
  "Effect size":
    "Effektstärke",
  "Potenza target":
    "Ziel-Power",
  "Report di lettura":
    "Lesetext",
  "Piano {s1}: servono {s2} osservazioni per gruppo (N = {s3}) per una potenza dell’{s4}.":
    "Plan {s1}: Es sind {s2} Beobachtungen pro Gruppe erforderlich (N = {s3}) für eine Power von {s4}.",
  "Piano di campionamento":
    "Stichprobenplan",
  "Questo foglio non analizza dati: calcola quante osservazioni servono perché un test abbia una buona probabilità di trovare l’effetto che ti interessa.":
    "Dieses Blatt analysiert keine Daten: Es berechnet, wie viele Beobachtungen nötig sind, damit ein Test eine gute Chance hat, den interessierenden Effekt zu finden.",
  "La potenza è la probabilità di rifiutare l’ipotesi nulla quando è falsa. Hai chiesto {s1}; con {s2} osservazioni per gruppo il calcolo ne garantisce {s3}. L’α scelto è {s4}: la probabilità di un falso positivo.":
    "Die Power ist die Wahrscheinlichkeit, die Nullhypothese zu verwerfen, wenn sie falsch ist. Sie haben {s1} angefordert; mit {s2} Beobachtungen pro Gruppe garantiert die Berechnung {s3}. Das gewählte α ist {s4}: die Wahrscheinlichkeit eines falsch positiven Ergebnisses.",
  "Come si legge il risultato":
    "Wie das Ergebnis zu lesen ist",
  "n per gruppo = {s1}: è il numero minimo di osservazioni valide in ciascun gruppo, non il numero di righe da inserire (le mancanti vanno sostituite).":
    "n pro Gruppe = {s1}: das ist die minimale Zahl gültiger Beobachtungen in jeder Gruppe, nicht die Zahl der einzugebenden Zeilen (fehlende sind zu ersetzen).",
  "N totale = {s1}: include tutti i gruppi del disegno.":
    "N insgesamt = {s1}: umfasst alle Gruppen des Designs.",
  "Effect size = {s1}: è la differenza espressa in unità di variabilità (o la dimensione dell’effetto del disegno). Più è piccolo, più osservazioni servono.":
    "Effektstärke = {s1}: die Differenz in Einheiten der Variabilität (oder die Effektstärke des Designs). Je kleiner sie ist, desto mehr Beobachtungen sind nötig.",
  "La curva di potenza mostra quanto si guadagna aumentando n: se il punto richiesto è già sulla parte piatta, aumentare il campione serve a poco.":
    "Die Powerkurve zeigt, wie viel man durch größeres n gewinnt: Liegt der geforderte Punkt bereits im flachen Teil, bringt eine größere Stichprobe wenig.",
  "Da dove viene il numero":
    "Woher die Zahl kommt",
  "La numerosità si ottiene imponendo che, sotto l’ipotesi alternativa, la statistica superi il valore critico con probabilità pari alla potenza scelta. Per i test t il calcolo viene iterato perché il valore critico dipende dai gradi di libertà, che dipendono da n.":
    "Die Fallzahl ergibt sich aus der Forderung, dass die Statistik unter der Alternativhypothese den kritischen Wert mit der gewählten Power überschreitet. Bei t-Tests wird die Berechnung iteriert, weil der kritische Wert von den Freiheitsgraden abhängt, die von n abhängen.",
  "La formula assume un effetto noto e una variabilità nota: se l’effect size viene da uno studio pilota, la numerosità è esso stesso una stima e va trattata con margine.":
    "Die Formel setzt einen bekannten Effekt und eine bekannte Variabilität voraus: Stammt die Effektstärke aus einer Pilotstudie, ist die Fallzahl selbst eine Schätzung und mit Marge zu behandeln.",
  "Cosa controllare prima di usarlo":
    "Was vor der Verwendung zu prüfen ist",
  "Il disegno deve essere quello giusto: due gruppi indipendenti, appaiati o una sola media non sono intercambiabili.":
    "Das Design muss das richtige sein: zwei unabhängige Gruppen, gepaart oder ein einzelner Mittelwert sind nicht austauschbar.",
  "Se prevedi abbandoni, aumenta n dividendo per (1 − tasso di abbandono).":
    "Wenn Sie Dropouts erwarten, erhöhen Sie n durch Division durch (1 − Dropout-Rate).",
  "Con più confronti o più esiti la potenza per singolo test non basta: correggi α o pianifica l’esito primario.":
    "Bei mehreren Vergleichen oder mehreren Endpunkten reicht die Power für den Einzeltest nicht: Korrigieren Sie α oder planen Sie den primären Endpunkt.",
  "Per differenze molto piccole la numerosità esplode: valuta se l’effetto è clinicamente rilevante prima di inseguirlo.":
    "Bei sehr kleinen Differenzen explodiert die Fallzahl: Prüfen Sie, ob der Effekt klinisch relevant ist, bevor Sie ihn verfolgen.",
  "Le formule per i test t usano l’approssimazione normale per la potenza: il valore è accurato entro circa un’unità rispetto al calcolo esatto non centrale.":
    "Die Formeln für t-Tests verwenden die Normalapproximation für die Power: Der Wert ist auf etwa eine Einheit gegenüber der exakten nichtzentralen Berechnung genau.",
  "Per l’ANOVA la potenza usa la F non centrale esatta: il numero può differire di un’unità da software che arrotondano diversamente le iterazioni.":
    "Für die ANOVA verwendet die Power die exakte nichtzentrale F: Die Zahl kann um eine Einheit von Software abweichen, die Iterationen anders rundet.",
  "Due medie indipendenti":
    "Zwei unabhängige Mittelwerte",
  "Una media":
    "Ein Mittelwert",
  "Due medie appaiate":
    "Zwei gepaarte Mittelwerte",
  "Due proporzioni":
    "Zwei Anteile",
  "ANOVA a una via":
    "Einfaktorielle ANOVA",
  "TOST (equivalenza)":
    "TOST (Äquivalenz)",
  "Sopravvivenza (log-rank)":
    "Überleben (Log-Rank)",
  "Potenza target":
    "Ziel-Power",
  "{s1}%":
    "{s1} %",
  "Differenza attesa":
    "Erwartete Differenz",
  "Margine di equivalenza":
    "Äquivalenzmarge",
  "Hazard ratio":
    "Hazard Ratio",
  "Tasso di eventi":
    "Ereignisrate",
  "Differenza da rilevare":
    "Zu erkennende Differenz",
  "SD (dei differenziali se appaiato)":
    "SD (der Differenzen bei gepaarten Daten)",
  "Proporzione gruppo 1":
    "Anteil Gruppe 1",
  "Proporzione gruppo 2":
    "Anteil Gruppe 2",
  "r da rilevare":
    "Zu erkennendes r",
  "Numero di gruppi":
    "Anzahl der Gruppen",
  "Cohen's f":
    "Cohen's f",
  "Parametri del piano":
    "Parameter des Plans",
  "Parametro":
    "Parameter",
  "Valore":
    "Wert",
  "Numerosità richiesta":
    "Erforderliche Fallzahl",
  "Voce":
    "Posten",
  "n per gruppo":
    "n pro Gruppe",
  "N totale":
    "N insgesamt",
  "Effect size":
    "Effektstärke",
  "Potenza raggiunta":
    "Erreichte Power",
  "n per un margine di errore richiesto":
    "n für eine geforderte Fehlermarge",
  "Il calcolo è iterativo: la numerosità viene aumentata finché la potenza raggiunge quella richiesta.":
    "Die Berechnung ist iterativ: Die Fallzahl wird erhöht, bis die Power den geforderten Wert erreicht.",
  "La potenza riportata è quella approssimata del disegno, non il target: arrotondando a n intero può superarlo di poco.":
    "Die berichtete Power ist die approximierte des Designs, nicht das Ziel: Durch Rundung auf ein ganzzahliges n kann sie es leicht überschreiten.",
  "Potenza al variare di n":
    "Power in Abhängigkeit von n",
  "per gruppo":
    "pro Gruppe",
  "n":
    "n",
  "Potenza":
    "Power",
  "La curva si appiattisce: oltre il punto calcolato ogni osservazione in più compra sempre meno potenza.":
    "Die Kurve flacht ab: Jenseits des berechneten Punktes bringt jede weitere Beobachtung immer weniger Power.",
};
