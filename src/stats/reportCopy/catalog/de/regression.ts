/** de: report and table prose (normalised). */
export const regressionCopy: Record<string, string> = {
  ' ({s1})': ' ({s1})',
  ' + ({s1}) × {s2}': ' + ({s1}) × {s2}',
  ', Lilliefors {s1}': ', Lilliefors {s1}',
  '; VIF = {s1} segnala collinearità': '; VIF = {s1} zeigt Kollinearität an',
  '; β standardizzato = {s1}': '; β standardisiert = {s1}',
  '{s1} · CI {s2}%': '{s1} · CI {s2} %',
  '{s1} ~ {s2}': '{s1} ~ {s2}',
  '{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.':
    '{s1} Beobachtungen mit studentisiertem Residuum über 3 SD: Prüfen Sie ihren Einfluss auf die Schätzungen.',
  '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.':
    '{s1}: B = {s2} (CI {s3} % {s4}), {s5} → {s6}. Im Mittel {s8} eine Einheit mehr bei {s7} {s9} um {s10}, bei Konstanthaltung der anderen Variablen{s11}{s12}.',
  '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili':
    '→ problematische Kollinearität: Die Koeffizienten der beteiligten Prädiktoren sind instabil',
  '→ collinearità sotto la soglia di attenzione (5)':
    '→ Kollinearität unter der Aufmerksamkeitsschwelle (5)',
  '|DFBETAS| massimo': 'Maximales |DFBETAS|',
  '√(SSE / {s1})': '√(SSE / {s1})',
  '≈2 assenza di autocorrelazione; ordine righe':
    '≈2 keine Autokorrelation; Zeilenreihenfolge',
  'Adjusted R²': 'Korrigiertes R²',
  AIC: 'AIC',
  'ANOVA del modello': 'ANOVA des Modells',
  aumenta: 'erhöht',
  B: 'B',
  'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.':
    'B ist die erwartete Änderung der abhängigen Variable bei einer Einheit mehr des Prädiktors, bei Konstanthaltung der übrigen: Die Einheit zählt, und zwar sehr.',
  BIC: 'BIC',
  'Breusch–Pagan {s1} → {s2}.': 'Breusch–Pagan {s1} → {s2}.',
  'Breusch–Pagan LM': 'Breusch–Pagan LM',
  'Breusch–Pagan p': 'Breusch–Pagan p',
  'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.':
    'Breusch–Pagan setzt die Normalität der Residuen voraus; bei kleinem N ist die Power begrenzt.',
  'CI {s1}% · stima OLS': 'CI {s1} % · OLS-Schätzung',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).':
    'CI: B ± t({s1} %, df = {s2})·SE. Std. β = B·SD(x)/SD(y).',
  Coefficienti: 'Koeffizienten',
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.':
    'Bei mehreren Prädiktoren wird Theil–Sen für jeden Prädiktor getrennt berechnet und kontrolliert die anderen nicht: nur als deskriptive Diagnostik verwenden.',
  'Condition index > 30': 'Condition Index > 30',
  'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.':
    'Der Condition Index nach Belsley wird aus den Eigenwerten von XᵀX nach Skalierung auf Einheitsnorm berechnet: Werte > 30 deuten auf Kollinearität hin, > 100 sind gravierend.',
  'Condition index massimo': 'Maximaler Condition Index',
  'Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.':
    'Vergleich zwischen OLS und robustem Schätzer{s1}: Sind die beiden Steigungen ähnlich, verzerren Ausreißer das Ergebnis nicht.',
  "Cook's D > 1": "Cook's D > 1",
  "Cook's D massimo": "Maximales Cook's D",
  'corretto per numero di predittori': 'korrigiert um die Zahl der Prädiktoren',
  Dettaglio: 'Detail',
  df: 'df',
  'DFBETAS oltre 2/√n': 'DFBETAS über 2/√n',
  'Diagnostica dei residui': 'Diagnostik der Residuen',
  'Diagnostica del modello': 'Diagnostik des Modells',
  'Differenza percentuale: {s1}%.': 'Prozentuale Differenz: {s1} %.',
  diminuisce: 'senkt',
  'Durbin–Watson': 'Durbin–Watson',
  'Equazione stimata: {s1} = {s2}{s3}.':
    'Geschätzte Gleichung: {s1} = {s2}{s3}.',
  'Errori standard robusti': 'Robuste Standardfehler',
  'eteroschedasticità dei residui': 'Heteroskedastizität der Residuen',
  'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili':
    'Heteroskedastizität der Residuen: Standardfehler und p-Werte können unzuverlässig sein',
  'Eteroschedasticità non verificabile.': 'Heteroskedastizität nicht prüfbar.',
  'Excess kurtosis': 'Exzess-Kurtosis',
  F: 'F',
  'F con 1 e df del modello aumentato':
    'F mit 1 und df des erweiterten Modells',
  'F({s1}, {s2})': 'F({s1}, {s2})',
  'h_ii = x_iᵀ(XᵀX)⁻¹x_i': 'h_ii = x_iᵀ(XᵀX)⁻¹x_i',
  'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.':
    'HC1 = n/(n−k−1); HC3 = 1/(1−h)². Die robuste Kovarianzmatrix setzt keine konstante Varianz voraus.',
  'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.':
    'Die Freiheitsgrade bleiben n−k−1; bei wenigen Fällen sind robuste Tests instabil.',
  'I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.':
    'Die Prädiktoren mit verlässlichem Effekt sind: {s1}. Der geschätzte Zusammenhang ist kein Beweis für Ursache und Wirkung: Es braucht ein Design, das Störfaktoren ausschließt.',
  'I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.':
    'Theil–Sen-Residuen sind für die einfache Regression verfügbar; bei mehreren Prädiktoren ist TS univariat und definiert kein gemeinsames Modell.',
  'Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.':
    'Das CI von {s1} % des Koeffizienten ist die Spanne der plausiblen Werte: Enthält es die Null, ist der Effekt von keinem Effekt zu unterscheiden.',
  'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.':
    'Das Modell sucht die Gerade (oder Hyperebene), die die Summe der quadrierten Abweichungen minimiert: Die Koeffizienten geben den Effekt jeder Variablen bei Konstanthaltung der übrigen an.',
  'Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.':
    'Das Modell ist signifikant (F = {s1}, {s2}) und erklärt {s3} % der Variabilität von {s4}.',
  'il modello nel complesso è utile': 'das Modell ist insgesamt nützlich',
  'il modello nel complesso non è distinguibile dal caso':
    'das Modell ist insgesamt nicht vom Zufall zu unterscheiden',
  'Il modello nel suo insieme': 'Das Modell als Ganzes',
  'Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.':
    'Das Modell ist nicht signifikant (F = {s1}, {s2}): Die Prädiktoren erklären {s3} nicht besser als der Zufall.',
  'Il modello non è stimabile con i dati disponibili.':
    'Das Modell ist mit den verfügbaren Daten nicht schätzbar.',
  'In pratica': 'In der Praxis',
  'influenza su singolo coefficiente':
    'Einfluss auf einen einzelnen Koeffizienten',
  Intercept: 'Achsenabschnitt',
  'Jarque–Bera p': 'Jarque–Bera p',
  'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.':
    'Die Regression beschreibt Zusammenhänge, keine Ursachen: Ausgelassene oder umgekehrt gerichtete Variablen können dasselbe Muster erklären.',
  'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.':
    'Die Vorhersagen gelten nur innerhalb des beobachteten Wertebereichs: Außerhalb ist die Extrapolation willkürlich.',
  'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.':
    'Unvollständige Zeilen werden vollständig verworfen: Sind die fehlenden Daten nicht zufällig, kann das Modell verzerrt sein.',
  'Leverage massimo': 'Maximaler Leverage',
  'Lilliefors p': 'Lilliefors p',
  Max: 'Max',
  Mean: 'Mittelwert',
  Median: 'Median',
  Metrica: 'Metrik',
  Min: 'Min',
  'Modello non utile': 'Nicht nützliches Modell',
  'Modello utile': 'Nützliches Modell',
  MS: 'MS',
  N: 'N',
  'n·ln(SSE/n) + 2(k+1)': 'n·ln(SSE/n) + 2(k+1)',
  'n·ln(SSE/n) + ln(n)(k+1)': 'n·ln(SSE/n) + ln(n)(k+1)',
  'Nessun coefficiente disponibile.': 'Kein Koeffizient verfügbar.',
  'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.':
    'Kein Prädiktor zeigt einen verlässlichen Effekt: Das Modell ist in dieser Form kein nützliches Prognosewerkzeug für diese Daten.',
  'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.':
    'Kein studentisiertes Residuum über 3 SD: kein gegenüber dem Modell stark auffälliger Fall.',
  'nessuna evidenza contro la normalità dei residui':
    'kein Hinweis gegen die Normalität der Residuen',
  'nessuna evidenza di effetto': 'kein Hinweis auf einen Effekt',
  'nessuna evidenza di eteroschedasticità':
    'kein Hinweis auf Heteroskedastizität',
  'non cambia': 'verändert',
  'non linearità da potenze dei valori adattati':
    'Nichtlinearität durch Potenzen der angepassten Werte',
  'non stimabile': 'lässt sich nicht schätzen:',
  'Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.':
    'Normalität der Residuen: Jarque–Bera {s1}{s2} → {s3}.',
  Nota: 'Notiz',
  'numero di dimensioni coinvolte': 'Anzahl der beteiligten Dimensionen',
  'numero di osservazioni': 'Anzahl der Beobachtungen',
  'Ogni predittore': 'Jeder Prädiktor',
  OLS: 'OLS',
  'OLS B': 'OLS B',
  'OLS vs Theil–Sen': 'OLS vs. Theil–Sen',
  'osservazioni complete (k = {s1} predittori)':
    'vollständige Beobachtungen (k = {s1} Prädiktoren)',
  'Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).':
    'Verwendete Beobachtungen: {s1} (nur vollständige Zeilen über alle Modellvariablen).',
  'outlier sui residui studentizzati':
    'Ausreißer bei den studentisierten Residuen',
  p: 'p',
  'p (F)': 'p (F)',
  Parametro: 'Parameter',
  'Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).':
    'OLS-Steigung = {s1}, Theil–Sen-Steigung = {s2} (CI {s3} % {s4}).',
  Predictor: 'Prädiktor',
  'predittore significativo': 'signifikanter Prädiktor',
  'quadrati e prodotti incrociati dei predittori':
    'Quadrate und Kreuzprodukte der Prädiktoren',
  'quota di varianza spiegata': 'Anteil der erklärten Varianz',
  R: 'R',
  'R²': 'R²',
  'R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.':
    'R² = {s1} → das Modell erklärt {s2} % der Variabilität von {s3}.',
  'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.':
    'Ein hohes R² bedeutet kein korrektes Modell: Betrachten Sie immer Residuen, Diagnostik und den Sinn der Variablen.',
  'R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.':
    'Korrigiertes R² = {s1} → Anteil bereinigt um die Zahl der Prädiktoren; ist er viel niedriger als R², ist das Modell überangepasst.',
  'R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.':
    'R² und F setzen ein Modell mit Achsenabschnitt voraus. AIC/BIC sind bis auf eine additive Konstante definiert.',
  'Report di lettura — Regressione': 'Lesetext — Regression',
  'RESET F (ŷ²)': 'RESET F (ŷ²)',
  'RESET p': 'RESET p',
  'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza':
    'nicht gaußsche Residuen: Konfidenzintervalle sind mit Vorsicht zu lesen',
  'Residui OLS': 'OLS-Residuen',
  'Residui oltre 3 SD': 'Residuen jenseits von 3 SD',
  'Residui studentizzati |z| > 3': 'Studentisierte Residuen |z| > 3',
  'Residui Theil–Sen': 'Theil–Sen-Residuen',
  SD: 'SD',
  SE: 'SE',
  'SE of estimate': 'SE der Schätzung',
  'SE robusto': 'Robuste SE',
  'Sintesi del modello': 'Zusammenfassung des Modells',
  Skewness: 'Schiefe',
  Slope: 'Steigung',
  'soglia {s1}': 'Schwelle {s1}',
  Source: 'Quelle',
  SS: 'QS',
  'Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.':
    'Schätzt, wie sich {s1} mit {s2} ändert und wie viel dieser Zusammenhang von den beobachteten Daten erklärt wird.',
  'Stima robusta Theil–Sen': 'Robuste Schätzung nach Theil–Sen',
  'Stimatore robusto Theil–Sen': 'Robuster Schätzer nach Theil–Sen',
  'Stimatori robusti univariati': 'Robuste univariate Schätzer',
  t: 't',
  'test globale del modello': 'globaler Test des Modells',
  'Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.':
    'Globaler Test: F = {s1}, {s2} (α = {s3}) → {s4}.',
  'Theil–Sen': 'Theil–Sen',
  'Theil–Sen slope': 'Theil–Sen-Steigung',
  'Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).':
    'Theil–Sen: Median der Steigungen zwischen allen Punktpaaren; Perzentil-Bootstrap-CI (600 Wiederholungen, fester Seed).',
  Tolerance: 'Toleranz',
  'TS CI high': 'TS-CI oben',
  'TS CI low': 'TS-CI unten',
  Valore: 'Wert',
  'valori > 1 indicano osservazioni influenti':
    'Werte > 1 zeigen einflussreiche Beobachtungen',
  VIF: 'VIF',
  'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.':
    'VIF = 1/(1−R²_aux) aus der Regression des Prädiktors auf die übrigen; Werte > 5 zeigen problematische Kollinearität.',
  'VIF massimo = {s1} {s2}.': 'Maximaler VIF = {s1} {s2}.',
  'White LM': 'White LM',
  'White p': 'White p',
  'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.':
    'White verwendet n·R² der Hilfsregression (Quadrate und Kreuzprodukte); RESET2 ergänzt ŷ². DFBETAS misst die standardisierte Änderung eines Koeffizienten beim Weglassen einer Beobachtung.',
  'X scalato a norma unitaria; > 30 collinearità':
    'X auf Einheitsnorm skaliert; > 30 Kollinearität',
  'β std.': 'Std. β',
  'χ² con {s1} df': 'χ² mit {s1} df',
};
