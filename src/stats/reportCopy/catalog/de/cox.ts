/** German prose of the cox procedure and its tables. */
export const coxCopy: Record<string, string> = {
  "Concordanza (C di Harrell)":
    "Konkordanz (C nach Harrell)",
  "{s1}: stima non disponibile.":
    "{s1}: Schätzung nicht verfügbar.",
  "{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.":
    "{s1}: instabile Schätzung (B = {s2}, Standardfehler = {s3}), vereinbar mit nahezu vollständiger Separation: Das Hazard Ratio ist nicht interpretierbar.",
  "non modifica":
    "verändert nicht",
  "{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.":
    "{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.",
  "un aumento di una unità {s1} il rischio istantaneo di evento":
    "eine Einheit mehr {s1} das momentane Ereignisrisiko",
  "nessuna associazione affidabile con il rischio":
    "keine verlässliche Assoziation mit dem Risiko",
  "; B = {s1}":
    "; B = {s1}",
  "Report di lettura — Regressione di Cox":
    "Lesetext — Cox-Regression",
  "Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.":
    "Instabile Schätzungen: {s1} trennt die Ereignisse nahezu vollständig, daher ist das Hazard Ratio (B = {s2}) nicht interpretierbar.",
  "Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).":
    "Das Modell ist signifikant (LR χ² = {s1}, {s2}) und die stärkste Kovariate ist {s3} (HR = {s4}).",
  "Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.":
    "Das Modell ist nicht signifikant (LR χ² = {s1}, {s2}): Die Kovariaten erklären die Ereigniszeiten nicht besser als der Zufall.",
  "Il modello di Cox non è stimabile con i dati disponibili.":
    "Das Cox-Modell ist mit den verfügbaren Daten nicht schätzbar.",
  "Stime instabili":
    "Instabile Schätzungen",
  "Effetto rilevato":
    "Effekt festgestellt",
  "Nessun effetto":
    "Kein Effekt",
  "La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}":
    "Die Cox-Regression setzt die Zeit bis zum Ereignis mit einer oder mehreren Kovariaten in Beziehung, ohne eine bestimmte Form für das Basisrisiko vorauszusetzen.{s1}",
  " Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.":
    " Hier gibt es {s1} Beobachtungen, {s2} Ereignisse und {s3} zensierte Fälle.",
  "L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.":
    "Das Hazard Ratio vergleicht das momentane Ereignisrisiko für eine Einheit mehr der Kovariate bei Konstanthaltung der übrigen: HR = 2 bedeutet doppeltes Risiko zu jedem Zeitpunkt, nicht doppelte Dauer.",
  "Il modello nel suo insieme":
    "Das Modell als Ganzes",
  "Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).":
    "Likelihood-Quotient: χ² = {s1} mit {s2} Freiheitsgraden, {s3} (Schwelle α = {s4}).",
  "Concordanza C = {s1}: {s2}.":
    "Konkordanz C = {s1}: {s2}.",
  "peggio del caso, controlla i segni":
    "schlechter als der Zufall, prüfen Sie die Vorzeichen",
  "discriminazione modesta":
    "geringe Diskrimination",
  "discriminazione discreta":
    "mäßige Diskrimination",
  "buona capacità di ordinare i tempi":
    "gute Fähigkeit, die Zeiten zu ordnen",
  "non calcolabile":
    "nicht berechenbar",
  "Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.":
    "Ereignisse pro Kovariate: {s1}. Unter 10 werden die Schätzungen fragil und das Modell kann überangepasst sein.",
  "Eventi per covariata":
    "Ereignisse pro Kovariate",
  "AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.":
    "AIC = {s1}: nützlich nur zum Vergleich von Modellen, die auf denselben Daten geschätzt wurden.",
  "Ogni covariata":
    "Jede Kovariate",
  "Nessun coefficiente disponibile.":
    "Kein Koeffizient verfügbar.",
  "Rischi proporzionali":
    "Proportionale Risiken",
  "Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.":
    "Der globale Test ergibt {s1}: Der Effekt mindestens einer Kovariate scheint sich über die Zeit zu ändern. Das Modell bleibt eine mittlere Zusammenfassung, aber ein einzelnes HR und vorhergesagte Überlebenskurven sind mit Vorsicht zu berichten; prüfen Sie Interaktionen mit der Zeit oder stratifizierte Modelle.",
  "Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.":
    "Der globale Test ergibt {s1}: Es zeigt sich keine Änderung des Effekts über die Zeit, die Annahme proportionaler Risiken ist daher mit den Daten vereinbar.",
  "Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.":
    "Der Test vergleicht das Modell mit einem, das Kovariate × log(t) ergänzt: Ein kleines p zeigt, dass der Effekt nicht konstant ist.",
  "Come leggere i numeri":
    "Wie die Zahlen zu lesen sind",
  "HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.":
    "HR = 1: kein Effekt. HR > 1: höheres Risiko bei höheren Werten der Kovariate. HR < 1: protektiver Effekt.",
  "IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.":
    "Ein HR-KI, das die 1 nicht enthält, ist mit einem signifikanten Wald-Test vereinbar; das Intervall ist multiplikativ, daher sind 0,5 und 2 symmetrische Effekte.",
  "I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.":
    "Zensierte Fälle bleiben im Risiko, solange sie beobachtet werden: Cox nutzt diese Information, während das Verwerfen oder Behandeln als Ereignis die Schätzungen verzerrt.",
  "La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.":
    "Die C von Harrell misst die Ordnung der Zeiten, nicht die Kalibrierung: Ein Modell kann gut ordnen und die absoluten Wahrscheinlichkeiten falsch schätzen.",
  "In pratica":
    "In der Praxis",
  "La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.":
    "Die Schätzung liegt am Rand des zulässigen Bereichs: Eine Kovariate sagt nahezu perfekt vorher, wer das Ereignis hat. Koeffizient und Hazard Ratio dürfen nicht als Effekt berichtet werden; reduzieren Sie die Kovariaten im Modell, prüfen Sie, ob die Variable eine Folge des Ergebnisses ist, oder verwenden Sie einen exakten Test.",
  "Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.":
    "Das Risikoprofil ändert sich mit {s1}: Pro zusätzlicher Einheit beträgt das Hazard Ratio {s2}. Berichten Sie immer das KI und die Zahl der Ereignisse und prüfen Sie, ob der Effekt in Untergruppen stabil ist.",
  "Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.":
    "Die Kovariaten zeigen keine verlässliche Assoziation mit der Ereigniszeit. Bei wenigen Ereignissen hat das Modell wenig Power: Fehlende Signifikanz beweist nicht die Abwesenheit eines Effekts.",
  "I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.":
    "Gleiche Ereigniszeiten werden mit der Breslow-Näherung behandelt, die bei vielen Bindungen die Standardfehler leicht unterschätzen kann.",
  "I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.":
    "Proportionale Risiken sind eine Annahme des Modells: Der berichtete Test ist asymptotisch und hat bei wenigen Ereignissen wenig Power.",
  "La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.":
    "Die Beziehung zwischen Kovariate und Log-Risiko wird als linear angenommen: Für nichtlineare Effekte sind Transformationen oder Splines nötig.",
  "Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.":
    "Nicht enthalten sind zeitabhängige Kovariaten, zufällige Effekte, Stratifizierung oder konkurrierende Risiken.",
  "La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.":
    "Das Basisüberleben wird am mittleren Kovariatenprofil bewertet und entspricht möglicherweise keiner realen Person.",
  "non verificabile con questi dati":
    "mit diesen Daten nicht prüfbar",
  "effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione":
    "Effekt, der sich über die Zeit ändert: Die Annahme proportionaler Risiken wird infrage gestellt",
  "nessuna evidenza contro i rischi proporzionali":
    "kein Hinweis gegen proportionale Risiken",
  "Sintesi del modello di Cox":
    "Zusammenfassung des Cox-Modells",
  "{s1} osservazioni · {s2} eventi · {s3} covariariate":
    "{s1} Beobachtungen · {s2} Ereignisse · {s3} Kovariaten",
  "Voce":
    "Posten",
  "Valore":
    "Wert",
  "Osservazioni":
    "Beobachtungen",
  "Eventi":
    "Ereignisse",
  "Censurati":
    "Zensiert",
  "Covariati":
    "Kovariaten",
  "Eventi per covariata":
    "Ereignisse pro Kovariate",
  "Log-verosimiglianza":
    "Log-Likelihood",
  "Log-verosimiglianza nulla":
    "Null-Log-Likelihood",
  "AIC":
    "AIC",
  "Concordanza (C di Harrell)":
    "Konkordanz (C nach Harrell)",
  "Iterazioni":
    "Iterationen",
  "Convergenza":
    "Konvergenz",
  "Avviso {s1}":
    "Warnung {s1}",
  "La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.":
    "Die partielle Likelihood von Cox erfordert keine Angabe der Form der Basisrisikofunktion.",
  "Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.":
    "Als Faustregel braucht es mindestens 10 Ereignisse pro Kovariate: Unterhalb dieser Schwelle sind die Schätzungen instabil.",
  "La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.":
    "Die C von Harrell misst die Fähigkeit des Modells, die Zeiten zu ordnen: 0,5 = Zufall, 1 = perfekte Ordnung.",
  "Test globali sul modello":
    "Globale Tests zum Modell",
  "ipotesi nulla: tutti i coefficienti uguali a zero":
    "Nullhypothese: alle Koeffizienten gleich null",
  "Test":
    "Test",
  "Statistica":
    "Statistik",
  "df":
    "df",
  "p":
    "p",
  "Lettura":
    "Lesart",
  "Rapporto di verosimiglianza":
    "Likelihood-Quotient",
  "il modello spiega i tempi meglio del nulla":
    "das Modell erklärt die Zeiten besser als das Nullmodell",
  "nessuna prova che le covariariate spieghino i tempi":
    "kein Beleg dafür, dass die Kovariaten die Zeiten erklären",
  "almeno un coefficiente è diverso da zero":
    "mindestens ein Koeffizient ist von null verschieden",
  "nessun coefficiente distinguibile da zero":
    "kein von null unterscheidbarer Koeffizient",
  "Score (log-rank generalizzato)":
    "Score (verallgemeinerter Log-Rank)",
  "le covariariate sono associate al rischio già senza stima completa":
    "die Kovariaten sind mit dem Risiko assoziiert, schon ohne vollständige Schätzung",
  "nessuna associazione iniziale rilevante":
    "keine relevante Ausgangsassoziation",
  "Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.":
    "Bei großen Stichproben konvergieren die drei Tests; bei wenigen Ereignissen ist der Likelihood-Quotient am zuverlässigsten.",
  "Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.":
    "Der bei β = 0 bewertete Score-Test stimmt bei einer einzigen dichotomen Kovariate mit dem Log-Rank überein.",
  "Coefficienti e hazard ratio":
    "Koeffizienten und Hazard Ratios",
  "IC {s1}% · HR per un’unità di incremento della covariata":
    "KI {s1} % · HR pro Einheit Zunahme der Kovariate",
  "Covariata":
    "Kovariate",
  "B":
    "B",
  "Errore std.":
    "Std.-Fehler",
  "z":
    "z",
  "HR":
    "HR",
  "HR low":
    "HR unten",
  "HR high":
    "HR oben",
  "B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.":
    "B ist der Logarithmus des Hazard Ratio: B > 0 zeigt ein höheres Risiko, wenn die Kovariate zunimmt.",
  "HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.":
    "HR = 1 bedeutet keinen Effekt; ein Intervall, das die 1 enthält, ist mit dem Fehlen einer Assoziation vereinbar.",
  "I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.":
    "Die p-Werte sind Wald-Tests und berücksichtigen nicht die Unsicherheit über die anderen Koeffizienten.",
  "Verifica dei rischi proporzionali":
    "Prüfung proportionaler Risiken",
  "test di interazione con log(tempo)":
    "Interaktionstest mit log(Zeit)",
  "Termine":
    "Term",
  "χ²":
    "χ²",
  "Non calcolabile":
    "Nicht berechenbar",
  "servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni":
    "es braucht mehr Ereignisse (oder ausschließlich positive Zeiten), um das Modell mit Interaktionen zu schätzen",
  "Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.":
    "Der Test ergänzt einen Koeffizienten für Kovariate × log(t): Ist dieser Koeffizient von null verschieden, ändert sich der Effekt über die Zeit.",
  "p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.":
    "Ein großes p ist das gewünschte Ergebnis: Es zeigt, dass die Annahme proportionaler Risiken hält.",
  "È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.":
    "Es ist ein asymptotischer Test und hat bei wenigen Ereignissen wenig Power: Fehlende Signifikanz beweist keine proportionalen Risiken.",
  "Rischio cumulato di base":
    "Kumuliertes Basisrisiko",
  "stimatore di Breslow · profilo medio delle covariariate":
    "Breslow-Schätzer · mittleres Kovariatenprofil",
  "Tempo":
    "Zeit",
  "A rischio":
    "Unter Risiko",
  "H₀(t)":
    "H₀(t)",
  "S₀(t)":
    "S₀(t)",
  "H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.":
    "H₀(t) ist das kumulierte Risiko am mittleren Kovariatenprofil: ein hypothetisches Profil, das aber auch bei Alter oder Scores weit von null numerisch stabil bleibt.",
  "Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.":
    "Für ein Profil x ist das Überleben S₀(t) hoch exp((x − x̄)′B): Die Basiskurve darf nicht als mittleres Überleben der Kohorte gelesen werden.",
};
