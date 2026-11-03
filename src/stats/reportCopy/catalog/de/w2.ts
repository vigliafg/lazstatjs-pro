/** German: W2 report and table prose. */
export const w2Copy: Record<string, string> = {
  'Sì':
    'Ja',
  'Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.':
    'Keine Gruppe liegt außerhalb der Entscheidungsgrenzen: Die Mittelwerte sind mit dem Gesamtmittelwert vereinbar.',
  '{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.':
    '{s1} Gruppe(n) liegen außerhalb der Entscheidungsgrenzen: {s2}.',
  'Report di lettura — ANOM':
    'Lesebericht — ANOM',
  'L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.':
    'Die ANOM (Analyse der Mittelwerte) vergleicht jeden Gruppenmittelwert mit dem Gesamtmittelwert und verwendet Entscheidungsgrenzen, die die Anzahl der Gruppen und die Variabilität innerhalb der Gruppen berücksichtigen.',
  'È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.':
    'Sie ist die grafische und intuitive Version der ANOVA: Statt eines einzigen globalen Tests zeigt sie, welche Gruppen abweichen.',
  'Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.':
    'Die Grenzen werden auf dem Niveau α = {s1}% konstruiert; eine Gruppe außerhalb der Intervalle verdient eine Prüfung, keine automatische Schlussfolgerung.',
  'Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.':
    'Bei unbalancierten Gruppen hat jede Gruppe eigene Grenzen, da ihr Mittelwert eine andere Präzision hat.',
  'Cautele':
    'Vorsichtshinweise',
  'Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.':
    'Der kritische Wert verwendet die Bonferroni-t-Näherung: Sie ist gegenüber der exakten Verteilung des maximalen studentisierten Betrags etwas konservativ.',
  'L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.':
    'Die ANOM ersetzt die ANOVA nicht: Sie dient dazu, Unterschiede zu lokalisieren, nicht ihre Größe zu schätzen.',
  'Con molti gruppi e pochi dati per gruppo la potenza resta bassa.':
    'Bei vielen Gruppen und wenigen Daten pro Gruppe bleibt die Power niedrig.',
  'Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.':
    'Der Test setzt unabhängige Beobachtungen und vergleichbare Variabilität zwischen den Gruppen voraus.',
  'Report di lettura — Modello lineare generalizzato':
    'Lesebericht — Generalisiertes lineares Modell',
  '{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.':
    '{s1} erklärt durch {s2} Prädiktor(en) mit Familie {s3} und Link {s4}; Devianz = {s5}.',
  'Il modello non ha raggiunto la convergenza: le stime non sono affidabili.':
    'Das Modell hat die Konvergenz nicht erreicht: Die Schätzungen sind nicht zuverlässig.',
  'Regressione':
    'Regression',
  'Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.':
    'Das GLM erweitert die lineare Regression auf nicht normalverteilte Antworten: Die Familie legt die Varianz fest, der Link verbindet den Mittelwert mit den Prädiktoren.',
  'La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.':
    'Die Wahl von Familie und Link ist Teil des Modells: Sie ist kein technisches Detail, sondern verändert die Bedeutung der Koeffizienten.',
  'Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.':
    'Devianz = {s1} bei {s2} Freiheitsgraden; Null-Devianz = {s3}.',
  'Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.':
    'Log-Likelihood = {s1}; AIC = {s2}; Iterationen = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello scelto.':
    '{s1} Prädiktor(en) von {s2} sind auf dem gewählten Niveau signifikant.',
  '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.':
    '{s1}: B = {s2} (KI {s3} – {s4}), p = {s5}.',
  'Come leggerlo':
    'So lesen Sie es',
  'Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.':
    'Bei Log-Link sind die Koeffizienten Differenzen von Log-Mittelwerten: exp(B) ist ein Verhältnis von Mittelwerten, nicht von Wahrscheinlichkeiten.',
  'Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.':
    'Bei Logit- oder Probit-Link ist die Antwort eine Wahrscheinlichkeit: B ist auf der latenten Skala zu lesen.',
  'Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.':
    'Bei der Gamma-Familie muss die Antwort strikt positiv sein; bei Poisson muss sie ein Zählwert sein.',
  'Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.':
    'Prüfen Sie die Residualdevianz und die Residuen: Ein Modell kann konvergieren und dennoch falsch spezifiziert sein.',
  'Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.':
    'Die Engine deckt die Familien Gauß, Binomial, Poisson und Gamma ab; Tweedie und Quasi-Likelihoods sind nicht enthalten.',
  'La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.':
    'Die Modellgüte wird nicht durch ein R² zusammengefasst: Vergleichen Sie Devianz, AIC und Residualdiagnostik.',
  'La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.':
    'Die Probit-Regression modelliert die Wahrscheinlichkeit eines binären Ergebnisses (ja/nein) über die Verteilungsfunktion der Standardnormalverteilung statt über das Logit der logistischen Regression.',
  'Come leggere i coefficienti probit':
    'So lesen Sie die Probit-Koeffizienten',
  'B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.':
    'B misst die Verschiebung des latenten normalen Prädiktors: exp(B) ist kein Odds Ratio und darf nicht als solches gelesen werden.',
  'I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.':
    'Die Koeffizienten werden unter Kontrolle der übrigen Prädiktoren und mit einem KI von {s1}% geschätzt: Ein Intervall, das 0 enthält, entspricht einem nicht signifikanten Effekt.',
  '{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).':
    '{s1}: {s2}% korrekte Klassifikationen ({s3} von {s4}).',
  'Report di regressione multinomiale':
    'Bericht zur multinomialen Regression',
  'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.':
    'Das Modell unterscheidet {s1} Klassen mit einer Genauigkeit von {s2}%; die Referenzklasse ist „{s3}“.',
  'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.':
    'Die multinomiale logistische Regression modelliert die Wahrscheinlichkeit der Zugehörigkeit zu jeder von mehreren nominalen (nicht geordneten) Klassen aus einem oder mehreren Prädiktoren.',
  'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.':
    'Jede Klasse wird mit der Referenzklasse „{s1}“ verglichen: Die Koeffizienten beschreiben, wie stark sich das Logit dieser Klasse gegenüber der Referenz um eine Einheit des Prädiktors ändert.',
  'Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.':
    'Analysiert wurden {s1} vollständige Beobachtungen über {s2} Klassen und {s3} Prädiktor(en).',
  'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.':
    'Das Modell klassifiziert {s1}% der Beobachtungen korrekt; die Klasse mit der höchsten Genauigkeit ist {s2}.',
  '{s1} ({s2}%)':
    '{s1} ({s2}%)',
  'non disponibile':
    'nicht verfügbar',
  '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).':
    '{s1} Prädiktor(en) zeigen mindestens einen signifikanten Koeffizienten auf dem gewählten Niveau ({s2}).',
  'Nessun coefficiente raggiunge la significatività al livello scelto.':
    'Kein Koeffizient erreicht Signifikanz auf dem gewählten Niveau.',
  'Convergenza del modello: {s1}.':
    'Konvergenz des Modells: {s1}.',
  'Accuratezza per classe':
    'Genauigkeit pro Klasse',
  'La tabella di classificazione non è disponibile.':
    'Die Klassifikationstabelle ist nicht verfügbar.',
  'Come leggere i coefficienti':
    'So lesen Sie die Koeffizienten',
  'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.':
    'Ein Odds Ratio größer als 1 bedeutet, dass eine zusätzliche Einheit des Prädiktors die Chancen der Klasse gegenüber der Referenz erhöht; ein Wert unter 1 verringert sie.',
  'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.':
    'Die Odds Ratios werden unter Kontrolle der übrigen Prädiktoren und mit einem {s1}%-Konfidenzintervall geschätzt: Enthält das Intervall 1, ist der Effekt nicht von null unterscheidbar.',
  'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.':
    'Die Koeffiziententests sind Wald-Tests (z = B/SE): Bei kleinen Stichproben oder seltenen Klassen können sie weniger zuverlässig sein als ein Likelihood-Vergleich.',
  'Le osservazioni devono essere indipendenti tra loro (una riga = una unità).':
    'Die Beobachtungen müssen voneinander unabhängig sein (eine Zeile = eine Einheit).',
  'Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.':
    'Die Ergebnisklassen sind nominal: Alphabetische oder numerische Reihenfolge impliziert keine Rangordnung.',
  'La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.':
    'Die Beziehung zwischen jedem Prädiktor und den Klassen-Logits ist linear: Prüfen Sie die Form oder verwenden Sie Transformationen.',
  'Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.':
    'Für jede Klasse sind ausreichend Beobachtungen nötig: Seltene oder leere Klassen machen die Schätzungen instabil.',
  'La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.':
    'Perfekte Trennung (fehlerfrei vorhergesagte Klassen) bläht die Koeffizienten auf und macht die Tests ungültig.',
  'Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.':
    'Zufällige Effekte, Interaktionen zwischen Prädiktoren und penalisierte Regression sind nicht enthalten.',
  'L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.':
    'Die Genauigkeit hängt von der Klassenverteilung ab: Vergleichen Sie sie stets mit der Häufigkeit der häufigsten Klasse.',
  'Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.':
    'Das Modell behandelt keine geordneten Ergebnisse: Für geordnete Kategorien ist eine ordinale Regression nötig.',
  'Report di lettura — ANOVA gerarchica':
    'Lesebericht — Hierarchische ANOVA',
  '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.':
    '{s1} in {s2}: äußerer Effekt {s3}, innerer Effekt {s4}.',
  'L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.':
    'Die hierarchische ANOVA behandelt einen Faktor, der in einem anderen genestet ist: Jede Stufe des inneren Faktors gehört zu genau einer Stufe des äußeren Faktors.',
  'È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.':
    'Es ist das typische Design von Klassen innerhalb von Schulen, Personen innerhalb von Zentren oder Chargen innerhalb von Lieferanten.',
  'Fattore esterno {s1}: F = {s2}, p = {s3}.':
    'Äußerer Faktor {s1}: F = {s2}, p = {s3}.',
  'Fattore interno {s1}: F = {s2}, p = {s3}.':
    'Innerer Faktor {s1}: F = {s2}, p = {s3}.',
  'Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.':
    'Ist der äußere Faktor signifikant, unterscheiden sich die übergeordneten Gruppen über die Variabilität der Unterklassen hinaus.',
  'Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.':
    'Ist der innere Faktor signifikant, unterscheiden sich die Unterklassen innerhalb der Gruppen: Die genestete Struktur erklärt einen Teil der Variabilität.',
  'Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.':
    'Interpretieren Sie den inneren Faktor nicht als „reinen“ Haupteffekt: Seine Bedeutung hängt vom äußeren Faktor ab.',
  'Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.':
    'Das Modell setzt Normalität und konstante Varianz innerhalb der Zellen voraus; bei sehr unbalancierten Zellen sind die Schätzungen der Varianzkomponenten approximativ.',
  '{s1}: {s2} (CI {s3} – {s4}), {s5}.':
    '{s1}: {s2} (KI {s3} – {s4}), {s5}.',
  'Report di lettura — Regressione non lineare':
    'Lesebericht — Nichtlineare Regression',
  'La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.':
    'Die Kurve {s1} passt gut zu den Daten: Sie erklärt {s2}% der Variabilität von {s3}.',
  'La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.':
    'Die Kurve {s1} erklärt {s2}% der Variabilität von {s3}: Die Anpassung ist teilweise.',
  'La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.':
    'Die Kurve {s1} erklärt nur {s2}% der Variabilität von {s3}: Die gewählte Form beschreibt die Daten nicht gut.',
  'R² {s1}':
    'R² {s1}',
  'La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.':
    'Die nichtlineare Regression schätzt die Parameter einer a priori gewählten Kurve statt einer Geraden: Die Modellform ist eine Hypothese, kein Ergebnis der Daten.',
  'Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.':
    'Der Vergleich verschiedener Kurven erfolgt nicht über R²: Modelle mit unterschiedlicher Parameterzahl sollten mit Kriterien verglichen werden, die Komplexität bestrafen.',
  'La curva e i suoi parametri':
    'Die Kurve und ihre Parameter',
  'Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.':
    'Modell {s1} auf {s2} Beobachtungen geschätzt, mit {s3} Residualfreiheitsgraden; die Konvergenz wurde in {s4} Iterationen erreicht.',
  'R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).':
    'R² = {s1}, korrigiertes R² = {s2}, RMSE = {s3} (in der Einheit von {s4}).',
  'Parametri stimati':
    'Geschätzte Parameter',
  'La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.':
    'Konvergenz bedeutet, dass der Algorithmus einen stabilen Punkt gefunden hat, nicht dass das Modell richtig ist: Prüfen Sie stets die Residuen und die Form der Kurve.',
  'L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.':
    'Der Algorithmus hat die Konvergenz nicht erreicht: Die Schätzungen sind nicht zuverlässig und dürfen nicht als Ergebnis gelesen werden.',
  '{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.':
    '{s1} von {s2} Parametern haben p unter {s3}%: Ein nicht signifikanter Parameter kann dennoch für die Form der Kurve notwendig sein.',
  'La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.':
    'Die zwischen den beobachteten Punkten interpolierte Kurve ist eine Zusammenfassung des Modells: Außerhalb des Datenbereichs ist ihre Form nicht geprüft.',
  'La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².':
    'Die Wahl der Kurve muss aus der Kenntnis des Phänomens kommen, nicht allein aus dem Vergleich der R².',
  'Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.':
    'Kleinste-Quadrate-Schätzungen reagieren empfindlich auf Extremwerte und Punkte mit hohem Hebel.',
  'Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.':
    'Die Standardfehler setzen unabhängige Residuen mit konstanter Varianz voraus: Bei Zeitreihendaten oder wiederholten Messungen müssen sie überdacht werden.',
  'Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.':
    'Bei wenigen Punkten im Verhältnis zu den Parametern ist die Schätzung instabil: Es braucht mehr Beobachtungen als Parameter.',
  'Report di lettura — Regressione penalizzata':
    'Lesebericht — Penalisierte Regression',
  '{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).':
    '{s1}: {s2} von null verschiedene Koeffizienten von {s3} (λ = {s4}, α = {s5}).',
  'Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.':
    'Ridge, LASSO und Elastic Net fügen den Koeffizienten eine Strafe hinzu, um die Varianz der Schätzungen zu verringern und Kollinearität zu behandeln.',
  'LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.':
    'LASSO kann Koeffizienten auf null setzen und erzeugt ein sparses Modell; Ridge verkleinert sie ohne Nullsetzung; Elastic Net kombiniert beide Verhaltensweisen.',
  'Variabili mantenute: {s1}.':
    'Beibehaltene Variablen: {s1}.',
  'nessuna':
    'keine',
  'R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.':
    'R² = {s1}; von null verschiedene Koeffizienten = {s2}; Iterationen = {s3}.',
  'Convergenza: {s1}.':
    'Konvergenz: {s1}.',
  'Come scegliere λ':
    'Wie man λ wählt',
  'λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.':
    'λ sollte nicht anhand des R² in der Stichprobe gewählt werden: Kreuzvalidierung oder ein externes Kriterium ist nötig.',
  'Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.':
    'Große Werte vereinfachen das Modell, können aber echte Signale ausschließen; kleine Werte nähern sich der OLS und ihrer Instabilität.',
  'Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.':
    'Die Variablen werden intern standardisiert: Die Koeffizienten sind erst nach dieser Transformation untereinander vergleichbar.',
  'Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.':
    'Das Konfidenzniveau von {s1}% wird aus Konsistenz mit den anderen Verfahren angegeben, doch die Intervalle penalisierter Koeffizienten sind nicht wie OLS-Intervalle interpretierbar.',
  'La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.':
    'Die Strafe führt zu Verzerrung: Die Koeffizienten sind keine erwartungstreuen Schätzer, und klassische Standardfehler gelten nicht.',
  'La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.':
    'Die Wahl von λ und die Varianzschätzung erfordern Resampling, das in diesem Verfahren nicht enthalten ist.',
  'Report di lettura — Regressione polinomiale':
    'Lesebericht — Polynomiale Regression',
  '{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).':
    '{s1} erklärt durch ein Polynom vom Grad {s2} in {s3} (R² = {s4}).',
  'La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.':
    'Die polynomiale Regression erweitert die Gerade zu einer Kurve: Sie fügt Potenzen von {s1} hinzu, um nichtlineare Verläufe zu erfassen.',
  'Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.':
    'Der Grad misst die Flexibilität der Kurve; ein hoher Grad verringert die Residuen, erhöht aber das Risiko von Overfitting.',
  'R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.':
    'R² = {s1}, adjustiertes R² = {s2}, F = {s3}, p = {s4}.',
  'Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.':
    'Der Term höchsten Grades ist {s1}: B = {s2}, p = {s3}.',
  'RMSE = {s1}; AIC = {s2}; BIC = {s3}.':
    'RMSE = {s1}; AIC = {s2}; BIC = {s3}.',
  'Come scegliere il grado':
    'Wie man den Grad wählt',
  'Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.':
    'Vergleichen Sie adjustiertes R², AIC und BIC zwischen verschiedenen Graden: Der höchste Grad ist nicht automatisch besser.',
  'Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.':
    'Betrachten Sie die Grafik: Eine Kurve, die jedem Punkt folgt, ist ein Zeichen von Overfitting.',
  'Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.':
    'Extrapolieren Sie nicht außerhalb des beobachteten Bereichs von {s1}: Polynome divergieren schnell.',
  'La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.':
    'Kollinearität zwischen Potenzen macht einzelne Koeffizienten instabil, selbst wenn die Kurve gut geschätzt ist: Interpretieren Sie die Form, nicht nur die Vorzeichen.',
  'Quantile (τ)':
    'Quantil (τ)',
  'sì':
    'ja',
  'Funzione obiettivo':
    'Zielfunktion',
  '{s1}: β = {s2} (CI 95% {s3}), {s4}.':
    '{s1}: β = {s2} (95%-KI {s3}), {s4}.',
  'Report di lettura — Regressione quantilica':
    'Lesebericht — Quantilsregression',
  'Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.':
    'Das Simplex-Verfahren hat die Konvergenz nicht erreicht: Die Schätzungen sind nicht zuverlässig.',
  'Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).':
    'Beim Quantil τ = {s1} ist kein Prädiktorkoeffizient signifikant (p < {s2}).',
  'Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).':
    'Beim Quantil τ = {s1} ist 1 Prädiktorkoeffizient von {s2} signifikant (p < {s3}).',
  'Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).':
    'Beim Quantil τ = {s1} sind {s2} Prädiktorkoeffizienten von {s3} signifikant (p < {s4}).',
  'Non convergente':
    'Nicht konvergiert',
  'La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.':
    'Die Quantilsregression schätzt, wie sich ein bedingtes Quantil von Y ändert, nicht der Mittelwert: Statt der Quadratsumme minimiert sie einen asymmetrischen absoluten Verlust.',
  'Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.':
    'Mit τ = 0,5 ist sie eine Medianregression, robust gegenüber Ausreißern; mit τ nahe 0 oder 1 beschreibt sie den unteren oder oberen Rand der Verteilung.',
  'Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.':
    'Das Modell verwendet {s1} vollständige Beobachtungen und {s2} Parameter (einschließlich Achsenabschnitt), mit {s3} Simplex-Iterationen.',
  'Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.':
    'Das Simplex-Verfahren ist konvergiert, und der minimale Verlust beträgt {s1}.',
  'La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.':
    'Die Konvergenz wurde nicht erreicht: Erhöhen Sie das Iterationsbudget oder reduzieren Sie die Prädiktoren, bevor Sie die Koeffizienten lesen.',
  'β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.':
    'β misst, wie stark sich das τ-Quantil von Y um eine Einheit des Prädiktors ändert, wenn die übrigen konstant gehalten werden.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.':
    'Der Achsenabschnitt ist das geschätzte τ-Quantil, wenn alle Prädiktoren null sind: Er hat oft keine inhaltliche Interpretation.',
  'Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.':
    'Ein Intervall, das null enthält, ist auf dem gewählten Niveau mit keinem Effekt vereinbar; p ist ein Wald-p-Wert auf Basis approximierter Standardfehler.',
  'Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.':
    'Bei mehreren Prädiktoren zeigt das Punktdiagramm das Profil des ersten Prädiktors bei den Mittelwerten der übrigen, keine vollständige Oberfläche.',
  'Perché scegliere un quantile':
    'Warum ein Quantil wählen',
  'La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.':
    'Der Mittelwert reagiert empfindlich auf Ausreißer und schwere Ränder; der Median und die übrigen Quantile beschreiben das Zentrum oder die Extrembereiche der bedingten Verteilung.',
  'Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.':
    'Der Vergleich verschiedener Quantile desselben Modells zeigt, ob sich der Effekt eines Prädiktors entlang der Verteilung ändert, was die lineare Regression nicht aufzeigt.',
  'Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.':
    'Der Preis ist, dass jedes Quantil separat geschätzt werden muss: Geraden benachbarter Quantile können sich kreuzen, und es gibt keine einheitliche Likelihood für einen LR-Test.',
  'Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.':
    'Das Modell ist für das gewählte Quantil linear in den Parametern: Ändert die Beziehung in den Rändern ihre Form, sind Transformationen oder zusätzliche Terme nötig.',
  'Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.':
    'In der Nähe von τ sind ausreichend Beobachtungen nötig: Bei extremen Rändern und kleinen Stichproben werden die Schätzungen instabil.',
  'Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.':
    'Die Standardfehler verwenden die Powell/Hall–Sheather-Näherung (quantreg, se = "nid") und können bei wenigen Fällen oder degenerierten Residuen unzuverlässig sein.',
  'La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.':
    'Die Konvergenz des Simplex-Verfahrens muss geprüft werden: Eine Iterationszahl an der Grenze deutet auf ein numerisches Problem hin, nicht auf ein Ergebnis.',
  'Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.':
    'Bootstrap-Intervalle, Tests zwischen Quantilen und Korrekturen für extreme Ränder sind nicht enthalten.',
  'Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.':
    'Das Modell ist linear in den Parametern: Nichtlineare Beziehungen erfordern Transformationen oder zusätzliche Terme.',
  'La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.':
    'Die Anpassungsgüte wird nicht durch ein R² zusammengefasst: Bewerten Sie den asymmetrischen Verlust und den Vergleich zwischen Quantilen.',
  'Report di lettura — Selezione delle variabili':
    'Lesebericht — Variablenauswahl',
  'Il modello scelto contiene {s1} predittore/i: {s2}.':
    'Das gewählte Modell enthält {s1} Prädiktor(en): {s2}.',
  'Nessun predittore supera il criterio: resta il modello con la sola intercetta.':
    'Kein Prädiktor erfüllt das Kriterium: Es bleibt das Modell mit nur dem Achsenabschnitt.',
  'La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.':
    'Die Variablenauswahl sucht ein einfacheres Modell ohne Verlust an Erklärungskraft, indem Teilmengen von Prädiktoren verglichen werden.',
  'La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.':
    'Die exhaustive Suche prüft alle Teilmengen; Stepwise fügt eine Variable nach der anderen hinzu oder entfernt sie gemäß dem gewählten Kriterium.',
  'Il modello con il BIC più basso usa {s1} variabili: {s2}.':
    'Das Modell mit dem niedrigsten BIC verwendet {s1} Variablen: {s2}.',
  'Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.':
    'Stepwise hat {s1} Schritte geprüft und mit {s2} Prädiktor(en) angehalten.',
  'Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.':
    'Endmodell: R² = {s1}, adjustiertes R² = {s2}, F = {s3}.',
  'Il modello finale non contiene predittori significativi.':
    'Das Endmodell enthält keine signifikanten Prädiktoren.',
  'La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.':
    'Die automatische Auswahl neigt dazu, die Signifikanz zu überschätzen: Die p-Werte nach der Auswahl sind nicht adjustiert.',
  'Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.':
    'Bei vielen Prädiktoren ist die exhaustive Suche begrenzt: Die Zahl der Teilmengen wächst exponentiell.',
  'Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.':
    'Nutzen Sie die Auswahl zur Exploration und bestätigen Sie das Modell anschließend an unabhängigen Daten oder mit Kreuzvalidierung.',
  'Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.':
    'Das BIC-Kriterium bestraft stärker als AIC: Es erzeugt sparsamere Modelle.',
  'I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.':
    'Die Ergebnisse hängen vom gewählten Kriterium und von der Richtung ab; geben Sie stets beides zusammen mit dem Konfidenzniveau von {s1}% an.',
  'Analisi delle medie (ANOM)':
    'Analyse der Mittelwerte (ANOM)',
  '{s1} per {s2} · α = {s3}':
    '{s1} nach {s2} · α = {s3}',
  'Fuori limiti':
    'Außerhalb der Grenzen',
  'No':
    'Nein',
  'Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.':
    'Gesamtmittelwert = {s1}; mittleres Quadrat innerhalb der Gruppen = {s2} mit {s3} Freiheitsgraden.',
  'Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.':
    'Der kritische Wert h = {s1} verwendet die Bonferroni-t-Näherung der Verteilung des maximalen studentisierten Betrags.',
  '{s1} · famiglia {s2} · link {s3} · CI {s4}%':
    '{s1} · Familie {s2} · Link {s3} · KI {s4}%',
  'I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.':
    'Die Koeffizienten liegen auf der Link-Skala: Ihre Interpretation ändert sich mit Familie und Link.',
  'Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.':
    'Der z-Test ist ein Wald-Test; bei kleinen Stichproben kann er vom Devianztest abweichen.',
  'Devianza':
    'Devianz',
  'Devianza nulla':
    'Null-Devianz',
  'df nullo':
    'Null-FG',
  'Dispersione':
    'Dispersion',
  'La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.':
    'Die Devianz misst den Abstand zum saturierten Modell; die Null-Devianz den Abstand zum Modell mit nur dem Achsenabschnitt.',
  'Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.':
    'Bei Familien mit geschätzter Dispersion (Gauß, Gamma) ist das Verhältnis Devianz/FG eine Diagnostik, kein Test.',
  'Modello probit':
    'Probit-Modell',
  'stima di massima verosimiglianza (probit)':
    'Maximum-Likelihood-Schätzung (Probit)',
  'Coefficienti ed exp(B)':
    'Koeffizienten und exp(B)',
  'exp(B)':
    'exp(B)',
  'exp(B) CI low':
    'exp(B) KI unten',
  'exp(B) CI high':
    'exp(B) KI oben',
  'Nel modello probit B è il coefficiente sulla scala normale latente: exp(B) non è un odds ratio ma un fattore moltiplicativo sul predittore latente.':
    'Im Probit-Modell ist B der Koeffizient auf der latenten Normalskala: exp(B) ist kein Odds Ratio, sondern ein multiplikativer Faktor auf dem latenten Prädiktor.',
  'Un B positivo aumenta la probabilità dell’esito; l’effetto marginale dipende dal punto in cui viene valutato.':
    'Ein positives B erhöht die Wahrscheinlichkeit des Ergebnisses; der marginale Effekt hängt davon ab, an welcher Stelle er bewertet wird.',
  'Modello multinomiale':
    'Multinomiales Modell',
  'stima di massima verosimiglianza · N = {s1}':
    'Maximum-Likelihood-Schätzung · N = {s1}',
  'Classi':
    'Klassen',
  'Classe di riferimento':
    'Referenzklasse',
  'Accuratezza complessiva (%)':
    'Gesamtgenauigkeit (%)',
  'no':
    'nein',
  'Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.':
    'Das Modell schätzt eine Wahrscheinlichkeit für jede Klasse; die Referenzklasse hat auf null fixierte Koeffizienten.',
  'La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.':
    'Die Devianz vergleicht die Likelihood des Modells mit der eines saturierten Modells: Niedrigere Werte zeigen eine bessere Anpassung.',
  'Coefficienti per classe':
    'Koeffizienten pro Klasse',
  'Classe di riferimento: {s1} · CI {s2}%':
    'Referenzklasse: {s1} · KI {s2}%',
  'Classe':
    'Klasse',
  'Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.':
    'Jede Klasse wird mit der Referenzklasse verglichen: OR > 1 erhöht die Chancen dieser Klasse gegenüber der Referenz.',
  'I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.':
    'Die Koeffizienten werden unter Kontrolle der übrigen Prädiktoren geschätzt; der Achsenabschnitt hat kein interpretierbares Odds Ratio.',
  'Classificazione per classe':
    'Klassifikation pro Klasse',
  'Accuratezza complessiva: {s1}%':
    'Gesamtgenauigkeit: {s1}%',
  'Corrette':
    'Korrekt',
  'Accuratezza (%)':
    'Genauigkeit (%)',
  'Probabilità media (%)':
    'Mittlere Wahrscheinlichkeit (%)',
  'La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.':
    'Die vorhergesagte Klasse ist die mit der höchsten geschätzten Wahrscheinlichkeit; die Genauigkeit pro Klasse ist das Verhältnis korrekter Klassifikationen zu den Beobachtungen dieser Klasse.',
  'Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.':
    'Seltene Klassen können eine instabile Genauigkeit haben, weil sie auf wenigen Beobachtungen beruht.',
  'ANOVA gerarchica':
    'Hierarchische ANOVA',
  '{s1} per {s2} annidato in {s3}':
    '{s1} nach {s2} genestet in {s3}',
  'dentro':
    'innerhalb',
  'Errore':
    'Fehler',
  'Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.':
    'Der äußere Faktor wird gegen das mittlere Quadrat des genesteten Faktors geprüft, nicht gegen das Residuum.',
  'Il fattore interno è testato contro il residuo entro cella.':
    'Der innere Faktor wird gegen das Residuum innerhalb der Zelle geprüft.',
  'Descrittive per cella':
    'Deskriptive Statistik pro Zelle',
  'Componenti di varianza':
    'Varianzkomponenten',
  'Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.':
    'Approximative Schätzungen für das Modell mit zufälligen Effekten; bei unbalancierten Zellen sind sie richtungsweisend.',
  'Esponenziale':
    'Exponentiell',
  'Logistica':
    'Logistisch',
  'Gompertz':
    'Gompertz',
  'Michaelis–Menten':
    'Michaelis–Menten',
  'Parametri del modello':
    'Modellparameter',
  'Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.':
    'Die Schätzungen sind Kleinste-Quadrate auf der gewählten Kurve; die Standardfehler stammen aus der Jacobi-Matrix am Optimum.',
  'Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.':
    'Der t-Test betrifft den einzelnen Parameter: Ein kleines p zeigt, dass sich der Parameter auf der Skala der Kurve von null unterscheidet.',
  '{s1} su {s2}':
    '{s1} von {s2}',
  'SSE':
    'SSE',
  'R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.':
    'R² vergleicht die Kurve mit dem Mittelwert von Y: Es sagt nicht, ob die Modellform richtig ist, sondern nur, wie viel sie gegenüber einer flachen Geraden erklärt.',
  'RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.':
    'Der RMSE hat dieselbe Einheit wie die abhängige Variable und fasst den typischen Fehler der Kurve zusammen.',
  'Coefficienti penalizzati':
    'Penalisierte Koeffizienten',
  '{s1} · {s2} · λ = {s3} · CI {s4}%':
    '{s1} · {s2} · λ = {s3} · KI {s4}%',
  'Coefficiente':
    'Koeffizient',
  'I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.':
    'Die Koeffizienten liegen auf der Originalskala der Variablen; das Modell wurde auf standardisierten Prädiktoren geschätzt.',
  'Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.':
    'Bei LASSO zeigen exakt null gesetzte Koeffizienten aus dem Modell ausgeschlossene Variablen.',
  'Penalità':
    'Strafe',
  'Coefficienti non nulli':
    'Von null verschiedene Koeffizienten',
  'λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.':
    'λ steuert die Stärke der Strafe: Höhere Werte erzeugen einfachere Modelle.',
  'α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.':
    'α = 0 ist Ridge, α = 1 ist LASSO, Zwischenwerte sind Elastic Net.',
  'Coefficienti del polinomio':
    'Polynomkoeffizienten',
  '{s1} su {s2} · grado {s3}':
    '{s1} von {s2} · Grad {s3}',
  'Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.':
    'Das Modell verwendet die rohe Polynombasis: Die Koeffizienten gehören zu x, x², … ohne Orthogonalisierung.',
  'CI al {s1}%.':
    'KI von {s1}%.',
  'Gradi di libertà':
    'Freiheitsgrade',
  '(Intercept)':
    '(Achsenabschnitt)',
  'Coefficienti della regressione quantilica':
    'Quantilsregressionskoeffizienten',
  '{s1} · τ = {s2}':
    '{s1} · τ = {s2}',
  'β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.':
    'β misst die Änderung des τ-Quantils der Antwort um eine Einheit des Prädiktors unter Kontrolle der übrigen.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.':
    'Der Achsenabschnitt ist das geschätzte τ-Quantil, wenn alle Prädiktoren null sind.',
  'Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.':
    'Die Intervalle sind normale 95%-Intervalle; p ist ein zweiseitiger Wald-p-Wert mit approximierten Standardfehlern.',
  'Adattamento del modello quantilico':
    'Anpassung des Quantilsmodells',
  '{s1} osservazioni · {s2} parametri':
    '{s1} Beobachtungen · {s2} Parameter',
  'Residui assoluti medi':
    'Mittlere absolute Residuen',
  'La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.':
    'Die Zielfunktion ist die Summe des asymmetrischen Verlusts ρτ: Bei τ = 0,5 stimmt sie mit der Medianregression überein.',
  'Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.':
    'Die Iterationszahl zählt die Simplex-Pivots; ein sehr hoher Wert deutet auf ein numerisches Problem hin.',
  'Aggiunta':
    'Hinzufügen',
  'Rimozione':
    'Entfernen',
  'Partenza':
    'Start',
  'Stop':
    'Stopp',
  'Migliori sottoinsiemi':
    'Beste Teilmengen',
  'Un modello per dimensione · criterio: {s1}':
    'Ein Modell pro Größe · Kriterium: {s1}',
  'La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.':
    'Die exhaustive Suche bewertet alle Teilmengen bis zu maximal 8 Prädiktoren; jenseits dieser Schwelle wachsen die Kosten schnell.',
  'Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.':
    'Cp vergleicht jedes Modell mit dem vollständigen Modell: Werte nahe der Parameterzahl zeigen einen guten Kompromiss.',
  'Percorso stepwise':
    'Stepwise-Pfad',
  'Direzione: {s1}':
    'Richtung: {s1}',
  'Azione':
    'Aktion',
  'Modello selezionato':
    'Ausgewähltes Modell',
  'R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.':
    'R² = {s1}; adjustiertes R² = {s2}; F = {s3}; p = {s4}.',
  'Report di lettura — MANCOVA': 'Lesebericht — MANCOVA',
  'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.': 'Effekt von {s1} auf {s2} Variablen, bereinigt um {s3}: Wilks\' λ = {s4}, p = {s5}.',
  'nessuna covariata': 'keine Kovariate',
  'La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.': 'Die MANCOVA erweitert die MANOVA um kontinuierliche Kovariaten: Sie vergleicht Gruppen gleichzeitig auf mehreren Zielgrößen und korrigiert für Variablen, die einen Teil der Unterschiede erklären könnten.',
  'Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.': 'Der multivariate Test beantwortet die Frage „Zählt die Gruppe, bereinigt um die Kovariaten?“; die univariaten Tests lokalisieren den Effekt auf den einzelnen Variablen.',
  'Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.': 'Wilks\' λ = {s1}, F = {s2} mit {s3} und {s4} Freiheitsgraden, p = {s5}.',
  '{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.': '{s1} von {s2} Variablen zeigen auf dem gewählten Niveau einen signifikanten Gruppeneffekt.',
  '{s1}: F = {s2}, p = {s3}.': '{s1}: F = {s2}, p = {s3}.',
  'Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.': 'Angepasste Mittelwerte sind die erwarteten Werte, wenn alle Gruppen denselben Kovariatenmittelwert hätten: Sie vergleichen die Gruppen „bei konstant gehaltenen Kovariaten“.',
  'Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.': 'Ein signifikanter multivariater Effekt kann nicht signifikante Variablen verbergen und umgekehrt: Lesen Sie den globalen und die univariaten Tests zusammen.',
  'Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.': 'Kovariaten müssen vor der Behandlung gemessen werden und dürfen keine Folgen der Gruppe sein: Sonst entfernt die Korrektur einen Teil des Effekts, den Sie schätzen wollen.',
  'Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.': 'Das Modell setzt lineare Beziehungen zwischen Kovariaten und Zielgrößen sowie homogene Steigungen zwischen den Gruppen voraus; prüfen Sie diese Punkte, bevor Sie dem p-Wert vertrauen.',
  'Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.': 'Wechselwirkungen Gruppe × Kovariate, geplante Kontraste und Korrekturen für multiples Testen sind nicht enthalten.',
  'Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.': 'Bei kleinen Gruppen oder kollinearen Kovariaten werden die Schätzungen instabil und der multivariate Test verliert an Power.',
  'Test multivariato': 'Multivariater Test',
  'Wilk’s lambda · CI {s1}%': 'Wilks\' Lambda · KI {s1}%',
  'Wilk’s lambda': 'Wilks\' Lambda',
  'Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.': 'Der multivariate Test bewertet den Gruppeneffekt auf alle abhängigen Variablen gemeinsam, bereinigt um die Kovariaten.',
  'L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.': 'Die F-Approximation nach Rao ist die von car::Anova verwendete; bei kleinen Stichproben kann der p-Wert leicht abweichen.',
  'ANCOVA univariata per variabile': 'Univariates ANCOVA pro Variable',
  'Effetto del gruppo al netto delle covariate': 'Gruppeneffekt bereinigt um die Kovariaten',
  'Medie aggiustate': 'Angepasste Mittelwerte',
  'Valori attesi alle medie delle covariate': 'Erwartete Werte bei den Kovariatenmittelwerten',
};

