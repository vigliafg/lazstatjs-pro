/** de: report and table prose (normalised). */
export const ttestCopy: Record<string, string> = {
  ' L’effetto è {s1} (Hedges g = {s2}).':
    ' Der Effekt ist {s1} (Hedges g = {s2}).',
  ', Brown–Forsythe {s1}': ', Brown–Forsythe {s1}',
  '{s1} (soglia α = {s2}).': '{s1} (Schwelle α = {s2}).',
  '{s1} − {s2}': '{s1} − {s2}',
  '{s1} e {s2}': '{s1} und {s2}',
  '{s1} e il valore di riferimento {s2}': '{s1} und der Referenzwert {s2}',
  '{s1} vs μ₀': '{s1} vs. μ₀',
  '{s1}: {s2} → {s3}; confrontare i due risultati dà la misura di quanto l’esito dipenda dall’assunzione di normalità.':
    '{s1}: {s2} → {s3}; der Vergleich der beiden Ergebnisse zeigt, wie stark das Resultat von der Normalitätsannahme abhängt.',
  'Approssimazione normale con correzione di continuità e correzione per i ranghi pari; differenze nulle escluse.':
    'Normalapproximation mit Kontinuitätskorrektur und Korrektur für Rangbindungen; Nulldifferenzen ausgeschlossen.',
  'Approssimazione normale con correzione di continuità e dei ranghi pari; differenze nulle escluse.':
    'Normalapproximation mit Kontinuitätskorrektur und Korrektur der Rangbindungen; Nulldifferenzen ausgeschlossen.',
  Assunzioni: 'Annahmen',
  'Assunzioni e alternative': 'Annahmen und Alternativen',
  'Brown–Forsythe (mediana)': 'Brown–Forsythe (Median)',
  'Campione e statistiche descrittive':
    'Stichprobe und deskriptive Statistiken',
  'CI {s1}%': 'CI {s1} %',
  'CI bootstrap con 400 repliche e seed fisso.':
    'Bootstrap-CI mit 400 Wiederholungen und festem Seed.',
  'CI bootstrap con 500 repliche e seed fisso; può differire leggermente da software che usa il metodo esatto.':
    'Bootstrap-CI mit 500 Wiederholungen und festem Seed; kann leicht von Software abweichen, die das exakte Verfahren verwendet.',
  'CI bootstrap con 500 repliche e seed fisso.':
    'Bootstrap-CI mit 500 Wiederholungen und festem Seed.',
  'CI della differenza: (M − μ₀) ± t({s1}%, df = {s2}) · SE.':
    'CI der Differenz: (M − μ₀) ± t({s1} %, df = {s2}) · SE.',
  'CI della differenza: diff ± t({s1}%, df) · SE.':
    'CI der Differenz: Differenz ± t({s1} %, df) · SE.',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'CI: diff ± t({s1}%, df = {s2}) · SE.':
    'CI: Differenz ± t({s1} %, df = {s2}) · SE.',
  CLES: 'CLES',
  'CLES = U₁/(n₁n₂) = probabilità che un valore del gruppo A superi uno del gruppo B; rank-biserial = 2·CLES − 1.':
    'CLES = U₁/(n₁n₂) = Wahrscheinlichkeit, dass ein Wert der Gruppe A einen der Gruppe B übersteigt; Rang-biserial = 2·CLES − 1.',
  "Cohen's d (one-sample)": "Cohen's d (eine Stichprobe)",
  "Cohen's d (pooled)": "Cohen's d (gepoolt)",
  "Cohen's d_z": "Cohen's d_z",
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'Con N piccolo i test di normalità hanno potenza limitata: valutare anche il Q-Q plot.':
    'Bei kleinem N haben Normalitätstests begrenzte Power: Prüfen Sie auch das Q-Q-Diagramm.',
  'Con più confronti ripetuti aumenta la probabilità di falsi positivi: correggi per le comparazioni multiple o pianifica un solo confronto principale.':
    'Bei mehreren wiederholten Vergleichen steigt die Wahrscheinlichkeit falsch positiver Ergebnisse: Korrigieren Sie für multiple Vergleiche oder planen Sie nur einen Hauptvergleich.',
  'conferma la presenza di una differenza':
    'bestätigt das Vorliegen eines Unterschieds',
  'Confronta due misure prese sulle stesse righe, {s1} e {s2}, lavorando sulle differenze riga per riga. L’ipotesi nulla è che la differenza media nella popolazione sia zero.':
    'Vergleicht zwei Messungen aus denselben Zeilen, {s1} und {s2}, und arbeitet mit den Differenzen Zeile für Zeile. Die Nullhypothese lautet, dass die mittlere Differenz in der Population null ist.',
  'Confronta la media di {s1} con il valore di riferimento μ₀ = {s2}. L’ipotesi nulla è che la media della popolazione sia uguale a quel valore.':
    'Vergleicht den Mittelwert von {s1} mit dem Referenzwert μ₀ = {s2}. Die Nullhypothese lautet, dass der Populationsmittelwert diesem Wert entspricht.',
  'Confronta le medie di due gruppi indipendenti, {s1} e {s2}, presi da righe diverse del foglio. L’ipotesi nulla è che le due medie nella popolazione siano uguali.':
    'Vergleicht die Mittelwerte zweier unabhängiger Gruppen, {s1} und {s2}, aus verschiedenen Zeilen des Blatts. Die Nullhypothese lautet, dass die beiden Populationsmittelwerte gleich sind.',
  Confronto: 'Vergleich',
  'Contiene {s1}, quindi è coerente con un test non significativo.':
    'Es enthält {s1}, ist daher mit einem nicht signifikanten Test vereinbar.',
  'Contiene lo zero, quindi è coerente con un test non significativo.':
    'Es enthält die Null, ist daher mit einem nicht signifikanten Test vereinbar.',
  Controllo: 'Prüfung',
  'Correlazione con l’appartenenza al gruppo: r = {s1}, cioè un’associazione {s2}.':
    'Korrelation mit der Gruppenzugehörigkeit: r = {s1}, also ein {s2} Zusammenhang.',
  'd = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); CI normale approssimato.':
    'd = (M − μ₀) / SD; SE(d) ≈ √(1/N + d²/(2N)); approximiertes normales CI.',
  'd = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).':
    'd = (M₁ − M₂)/sp; SE(d) ≈ √((n₁+n₂)/(n₁n₂) + d²/(2(n₁+n₂))).',
  'd_z = media delle differenze / SD delle differenze; SE(d_z) ≈ √(1/n + d_z²/(2n)).':
    'd_z = Mittelwert der Differenzen / SD der Differenzen; SE(d_z) ≈ √(1/n + d_z²/(2n)).',
  df: 'df',
  'df (gradi di libertà) descrive quanta informazione indipendente resta nei dati: più è grande, più il test è preciso.':
    'df (Freiheitsgrade) beschreibt, wie viel unabhängige Information in den Daten verbleibt: Je größer, desto präziser der Test.',
  df1: 'df1',
  df2: 'df2',
  'Differenza media rispetto a μ₀: {s1}.':
    'Mittlere Differenz gegenüber μ₀: {s1}.',
  'Differenza rilevata': 'Unterschied festgestellt',
  'Differenza tra le medie: {s1} ({s2} − {s3}).':
    'Differenz zwischen den Mittelwerten: {s1} ({s2} − {s3}).',
  'Differenze calcolate riga per riga su {s1} coppie complete; le righe con una cella mancante sono escluse dall’intero test.':
    'Differenzen Zeile für Zeile über {s1} vollständige Paare berechnet; Zeilen mit einer fehlenden Zelle werden aus dem gesamten Test ausgeschlossen.',
  'Effect size': 'Effektstärke',
  'Effect size non calcolabile con questo campione.':
    'Effektstärke mit dieser Stichprobe nicht berechenbar.',
  'Errore standard della stima: {s1}.': 'Standardfehler der Schätzung: {s1}.',
  'Glass Δ (SD gruppo A)': 'Glass Δ (SD Gruppe A)',
  Gruppo: 'Gruppe',
  'H₀: mediana = {s1}': 'H₀: Median = {s1}',
  'H₀: mediana delle differenze = 0': 'H₀: Median der Differenzen = 0',
  'H₀: μ = {s1} · due code · α = {s2}': 'H₀: μ = {s1} · zweiseitig · α = {s2}',
  'H₀: μ_diff = 0 · due code · α = {s1}':
    'H₀: μ_diff = 0 · zweiseitig · α = {s1}',
  'H₀: μ₁ = μ₂ · due code · α = {s1}': 'H₀: μ₁ = μ₂ · zweiseitig · α = {s1}',
  'Hedges g': 'Hedges g',
  'Hedges g = {s1}: effetto {s2} secondo le soglie convenzionali (0.2 piccolo, 0.5 medio, 0.8 grande).':
    'Hedges g = {s1}: {s2} Effekt nach den üblichen Schwellen (0.2 klein, 0.5 mittel, 0.8 groß).',
  'Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass usa la SD del gruppo A come riferimento.':
    'Hedges g = d · J, J = 1 − 3/(4(n₁+n₂) − 9). Glass verwendet die SD der Gruppe A als Referenz.',
  'Hedges g applica il fattore di correzione per campioni piccoli J = 1 − 3/(4N − 5).':
    'Hedges g wendet den Korrekturfaktor für kleine Stichproben J = 1 − 3/(4N − 5) an.',
  'Hedges g è la differenza espressa in deviazioni standard: rende confrontabili misure con unità diverse.':
    'Hedges g ist die in Standardabweichungen ausgedrückte Differenz: Sie macht Messungen mit unterschiedlichen Einheiten vergleichbar.',
  'Hedges g_z': 'Hedges g_z',
  'Hodges–Lehmann': 'Hodges–Lehmann',
  'I dati non mostrano una differenza affidabile tra {s1}. Questo non dimostra che le medie siano identiche: con pochi dati il test ha poca potenza e una differenza reale può restare invisibile.':
    'Die Daten zeigen keinen verlässlichen Unterschied zwischen {s1}. Das beweist nicht, dass die Mittelwerte identisch sind: Bei wenigen Daten hat der Test wenig Power, und ein realer Unterschied kann unsichtbar bleiben.',
  'Il test non è calcolabile con i dati disponibili.':
    'Der Test ist mit den verfügbaren Daten nicht berechenbar.',
  'Il test principale': 'Der Haupttest',
  'Il test riguarda le medie: se la distribuzione è molto asimmetrica, la mediana e i test non parametrici descrivono meglio il fenomeno.':
    'Der Test betrifft die Mittelwerte: Ist die Verteilung stark schief, beschreiben Median und nicht parametrische Tests das Phänomen besser.',
  'Il test t appaiato assume normalità delle differenze, non delle due variabili separatamente.':
    'Der gepaarte t-Test setzt die Normalität der Differenzen voraus, nicht die der beiden Variablen getrennt.',
  'Il test t divide la differenza tra le medie per l’errore standard della differenza: un t grande significa che lo scarto è grande rispetto alla variabilità dei due gruppi.':
    'Der t-Test teilt die Differenz zwischen den Mittelwerten durch den Standardfehler der Differenz: Ein großes t bedeutet, dass die Abweichung im Verhältnis zur Variabilität der beiden Gruppen groß ist.',
  'Il test t divide la distanza tra media osservata e valore atteso per l’errore standard: un t grande significa che la distanza è grande rispetto al rumore dei dati.':
    'Der t-Test teilt den Abstand zwischen beobachtetem Mittelwert und Erwartungswert durch den Standardfehler: Ein großes t bedeutet, dass der Abstand im Verhältnis zum Rauschen der Daten groß ist.',
  'In pratica': 'In der Praxis',
  Interpretazione: 'Interpretation',
  'Intervallo di confidenza al {s1}% della differenza: {s2}. {s3}':
    'Konfidenzintervall von {s1} % der Differenz: {s2}. {s3}',
  'Intervallo di confidenza al {s1}% della media: {s2}. {s3}':
    'Konfidenzintervall von {s1} % des Mittelwerts: {s2}. {s3}',
  'Jarque–Bera {s1}': 'Jarque–Bera {s1}',
  'Jarque–Bera differenze': 'Jarque–Bera der Differenzen',
  'JB su N = {s1}': 'JB bei N = {s1}',
  'La correlazione tra le coppie descrive l’accoppiamento, non l’effetto del trattamento.':
    'Die Korrelation zwischen den Paaren beschreibt die Paarung, nicht den Behandlungseffekt.',
  'La differenza tra {s1} è probabilmente reale. Per decidere se è rilevante, confronta l’ampiezza con quella che consideri clinicamente o praticamente importante: l’effetto misurato è {s2}.':
    'Der Unterschied zwischen {s1} ist wahrscheinlich real. Um zu entscheiden, ob er relevant ist, vergleichen Sie die Größe mit der, die Sie klinisch oder praktisch für wichtig halten: Der gemessene Effekt ist {s2}.',
  'Le medie di {s1} sono diverse: {s2} (soglia α = {s3}).{s4}':
    'Die Mittelwerte von {s1} unterscheiden sich: {s2} (Schwelle α = {s3}).{s4}',
  'Le righe vengono appaiate per posizione: se l’ordine delle osservazioni non è corretto il test perde senso.':
    'Die Zeilen werden nach Position gepaart: Ist die Reihenfolge der Beobachtungen falsch, verliert der Test seinen Sinn.',
  'Le statistiche descrittive dei gruppi sono calcolate sulle sole coppie complete, per coerenza con il test.':
    'Die deskriptiven Statistiken der Gruppen werden nur auf den vollständigen Paaren berechnet, konsistent mit dem Test.',
  'Levene (media)': 'Levene (Mittelwert)',
  'Levene significativo: l’assunzione di varianze uguali è dubbia, preferire Welch.':
    'Levene signifikant: Die Annahme gleicher Varianzen ist fraglich, Welch vorziehen.',
  'Lilliefors (KS)': 'Lilliefors (KS)',
  'Lilliefors differenze': 'Lilliefors der Differenzen',
  'Mann–Whitney U': 'Mann–Whitney U',
  'Mann–Whitney U (non parametrico)': 'Mann–Whitney U (nicht parametrisch)',
  Max: 'Max',
  Mean: 'Mittelwert',
  'Mean − μ₀': 'Mittelwert − μ₀',
  'Mean diff (A − B)': 'Mittlere Differenz (A − B)',
  'Mean rank': 'Mittlerer Rang',
  Median: 'Median',
  'mediana delle differenze; CI bootstrap percentile':
    'Median der Differenzen; Perzentil-Bootstrap-CI',
  'mediana di tutte le differenze A − B; CI bootstrap percentile':
    'Median aller Differenzen A − B; Perzentil-Bootstrap-CI',
  Metodo: 'Methode',
  Min: 'Min',
  Missing: 'Fehlend',
  'Missing = celle vuote o non numeriche escluse dal calcolo.':
    'Fehlend = leere oder nicht numerische Zellen, aus der Berechnung ausgeschlossen.',
  Misura: 'Maß',
  N: 'N',
  'N effettivo': 'Effektives N',
  'Nel disegno appaiato l’assunzione riguarda la normalità delle differenze, non delle due misure separatamente: l’ordine delle righe deve corrispondere alla stessa unità osservata.':
    'Im gepaarten Design betrifft die Annahme die Normalität der Differenzen, nicht die der beiden Messungen getrennt: Die Zeilenreihenfolge muss derselben beobachteten Einheit entsprechen.',
  'Nessuna differenza': 'Kein Unterschied',
  'nessuna evidenza contro l’uguaglianza delle varianze':
    'kein Hinweis gegen die Gleichheit der Varianzen',
  'Nessuna evidenza di eteroschedasticità a questo livello.':
    'Kein Hinweis auf Heteroskedastizität auf diesem Niveau.',
  'non conferma la differenza': 'bestätigt den Unterschied nicht',
  'Non contiene {s1}, quindi è coerente con un test significativo.':
    'Es enthält {s1} nicht, ist daher mit einem signifikanten Test vereinbar.',
  'Non contiene lo zero, quindi è coerente con un test significativo.':
    'Es enthält die Null nicht, ist daher mit einem signifikanten Test vereinbar.',
  'Non emerge una differenza statisticamente significativa tra {s1}: {s2} (soglia α = {s3}).{s4}':
    'Es zeigt sich kein statistisch signifikanter Unterschied zwischen {s1}: {s2} (Schwelle α = {s3}).{s4}',
  'non quantificabile': 'nicht quantifizierbar',
  'non rifiutata, assunzione ragionevole':
    'nicht verworfen, vernünftige Annahme',
  'normalità con parametri stimati': 'Normalität mit geschätzten Parametern',
  'normalità delle differenze': 'Normalität der Differenzen',
  'Normalità: Lilliefors {s1} → {s2}.': 'Normalität: Lilliefors {s1} → {s2}.',
  'Normalità: questa tabella non riporta il test sui due gruppi; con n ≥ 30 per gruppo il t-test è comunque robusto, altrimenti controlla le descrittive di ogni gruppo prima di fidarti del p.':
    'Normalität: Diese Tabelle berichtet den Test nicht für die beiden Gruppen; bei n ≥ 30 pro Gruppe ist der t-Test ohnehin robust, andernfalls prüfen Sie die deskriptiven Werte jeder Gruppe, bevor Sie dem p vertrauen.',
  Nota: 'Notiz',
  'Ogni riga viene ridotta a una sola differenza, poi si controlla quanto quella differenza media è lontana da zero rispetto alla sua variabilità.':
    'Jede Zeile wird auf eine einzige Differenz reduziert, dann wird geprüft, wie weit dieser Mittelwert der Differenzen im Verhältnis zu seiner Variabilität von null entfernt ist.',
  omoschedasticità: 'Homoskedastizität',
  p: 'p',
  'p (1 coda)': 'p (1 Seite)',
  'p (2 code)': 'p (2 Seiten)',
  'p a una coda riferito alla direzione osservata (metà del p a due code).':
    'Einseitiges p bezogen auf die beobachtete Richtung (Hälfte des zweiseitigen p).',
  'p-value a due code': 'zweiseitiger p-Wert',
  'Poiché {s1} non raggiunge la soglia α = {s2}, l’ipotesi nulla non viene rifiutata: i dati non bastano per affermare che esista una differenza.':
    'Da {s1} die Schwelle α = {s2} nicht erreicht, wird die Nullhypothese nicht verworfen: Die Daten reichen nicht aus, um einen Unterschied zu behaupten.',
  'Poiché {s1} resta sotto la soglia α = {s2}, l’ipotesi nulla viene rifiutata: la differenza osservata è difficile da spiegare con la sola variabilità campionaria.':
    'Da {s1} unter der Schwelle α = {s2} bleibt, wird die Nullhypothese verworfen: Der beobachtete Unterschied ist mit der reinen Stichprobenvariabilität kaum zu erklären.',
  'Quanto è grande la differenza': 'Wie groß der Unterschied ist',
  'quota di varianza condivisa': 'Anteil gemeinsamer Varianz',
  'quota di varianza spiegata': 'Anteil der erklärten Varianz',
  'r = z/√N': 'r = z/√N',
  'r punto-biseriale': 'Punkt-biseriales r',
  'r tra le coppie': 'r zwischen den Paaren',
  'r²': 'r²',
  'r² = {s1}: circa il {s2}% della variabilità è riconducibile alla differenza tra le condizioni.':
    'r² = {s1}: etwa {s2} % der Variabilität lassen sich auf den Unterschied zwischen den Bedingungen zurückführen.',
  'Rank sum': 'Rangsumme',
  'Rank-biserial': 'Rang-biserial',
  'Report di lettura — Test t': 'Lesetext — t-Test',
  'rifiutata, quindi il test t va letto con cautela (soglia {s1})':
    'verworfen, der t-Test ist daher mit Vorsicht zu lesen (Schwelle {s1})',
  'robusto agli outlier': 'robust gegenüber Ausreißern',
  SD: 'SD',
  SE: 'SE',
  'SE diff': 'SE der Differenz',
  'Se il risultato è al limite della soglia, aumenta il campione o replica lo studio prima di prendere decisioni.':
    'Liegt das Ergebnis an der Schwelle, erhöhen Sie die Stichprobe oder wiederholen Sie die Studie, bevor Sie Entscheidungen treffen.',
  'Solo righe con entrambe le colonne numeriche: {s1} coppie complete, {s2} coppie escluse.':
    'Nur Zeilen mit beiden numerischen Spalten: {s1} vollständige Paare, {s2} ausgeschlossene Paare.',
  Statistica: 'Statistik',
  'Statistica t = {s1} con df = {s2}.': 't-Statistik = {s1} mit df = {s2}.',
  Stima: 'Schätzung',
  'Stima (A − B)': 'Schätzung (A − B)',
  t: 't',
  'Test t di Welch (varianze diseguali)': 'Welch-t-Test (ungleiche Varianzen)',
  'Test t per campioni appaiati': 't-Test für gepaarte Stichproben',
  'Test t per campioni indipendenti (varianze uguali)':
    't-Test für unabhängige Stichproben (gleiche Varianzen)',
  'Test t per un campione': 't-Test für eine Stichprobe',
  U: 'U',
  'U riportato per ciascun gruppo (U₁ + U₂ = n₁·n₂); la significatività usa U = min(U₁, U₂) con approssimazione normale, correzione di continuità e correzione dei ranghi pari.':
    'U wird für jede Gruppe berichtet (U₁ + U₂ = n₁·n₂); die Signifikanz verwendet U = min(U₁, U₂) mit Normalapproximation, Kontinuitätskorrektur und Korrektur der Rangbindungen.',
  'Uguaglianza delle varianze non verificabile con questi dati.':
    'Gleichheit der Varianzen mit diesen Daten nicht prüfbar.',
  'Uguaglianza delle varianze: Levene {s1}{s2} → {s3}.':
    'Gleichheit der Varianzen: Levene {s1}{s2} → {s3}.',
  'Un effetto statisticamente significativo può essere piccolo: con molti dati basta una differenza minima. La significatività dice che la differenza è probabilmente reale, non che è importante.':
    'Ein statistisch signifikanter Effekt kann klein sein: Bei vielen Daten genügt eine minimale Differenz. Signifikanz sagt, dass der Unterschied wahrscheinlich real ist, nicht dass er wichtig ist.',
  'Un p-value non dice nulla sulla dimensione dell’effetto né sulla rilevanza pratica del risultato.':
    'Ein p-Wert sagt nichts über die Größe des Effekts oder die praktische Relevanz des Ergebnisses.',
  'Varianza pooled: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = {s1}.':
    'Gepoolte Varianz: sp² = ((n₁−1)s₁² + (n₂−1)s₂²)/(n₁+n₂−2); df = {s1}.',
  'varianze probabilmente diverse: meglio il t di Welch':
    'Varianzen wahrscheinlich unterschiedlich: besser der t-Test nach Welch',
  W: 'W',
  'W riportato = min(W⁺, W⁻); r = z/√N è la dimensione dell’effetto; rank-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).':
    'Berichtetes W = min(W⁺, W⁻); r = z/√N ist die Effektstärke; Rang-biserial = (W⁺ − W⁻)/(W⁺ + W⁻).',
  'W⁺': 'W⁺',
  'W⁻': 'W⁻',
  'Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = {s1}.':
    'Welch–Satterthwaite: SE = √(s₁²/n₁ + s₂²/n₂); df = {s1}.',
  'Wilcoxon signed-rank': 'Wilcoxon signed-rank',
  'Wilcoxon signed-rank (non parametrico)':
    'Wilcoxon signed-rank (nicht parametrisch)',
  z: 'z',
};
