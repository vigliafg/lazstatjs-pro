/** de: report and table prose (normalised). */
export const timeseriesCopy: Record<string, string> = {
  ' · periodo stagionale = {s1}': ' · saisonale Periode = {s1}',
  ' (ADF p ≈ {s1} resta solo informativo)':
    ' (ADF p ≈ {s1} bleibt nur informativ)',
  ', compatibile con una successione casuale':
    ', vereinbar mit einer zufälligen Abfolge',
  ', la successione non è casuale': ', die Abfolge ist nicht zufällig',
  '{s1} = {s2} ({s3}): {s4}.': '{s1} = {s2} ({s3}): {s4}.',
  ACF: 'ACF',
  'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.':
    'Achtung: Mindestens eine Wurzel liegt nahe am oder im Einheitskreis, die Schätzung liegt daher am Rand des zulässigen Bereichs und die Prognosen sind mit Vorsicht zu lesen.',
  'Autocorrelazione e autocorrelazione parziale':
    'Autokorrelation und partielle Autokorrelation',
  'autocorrelazione presente': 'Autokorrelation vorhanden',
  'banda di confidenza ±1,96/√N = ±{s1}': 'Konfidenzband ±1,96/√N = ±{s1}',
  'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.':
    'Balken außerhalb des Bands zeigen Autokorrelation, die nicht durch Zufall erklärt wird.',
  'batte il riferimento più semplice (RMSE {s1})':
    'schlägt die einfachste Referenz (RMSE {s1})',
  'c’è un {s1} (Mann–Kendall p = {s2})':
    'es gibt einen {s1} (Mann–Kendall p = {s2})',
  'circa {s1} deviazioni standard': 'etwa {s1} Standardabweichungen',
  'compatibile con il caso': 'mit dem Zufall vereinbar',
  'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.':
    'Bei langen Horizonten wächst der Fehler: Über einen saisonalen Zyklus hinaus sind die Prognosen als Richtungsangabe zu lesen.',
  'Confronto dei modelli di previsione': 'Vergleich der Prognosemodelle',
  Dettaglio: 'Detail',
  'Deviazione standard': 'Standardabweichung',
  'Differenziazione: {s1}; scelta {s2}. {s3}':
    'Differenzenbildung: {s1}; Wahl {s2}. {s3}',
  'è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})':
    'ist im Wesentlichen gleichwertig zur einfachsten Referenz (RMSE {s1})',
  'Errore standard residuo': 'Residuenstandardfehler',
  'Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.':
    'Residuenstandardfehler auf der modellierten Skala: {s1} bei {s2} effektiven Beobachtungen.',
  'errore su un campione di validazione (ultimo 20% della serie)':
    'Fehler auf einer Validierungsstichprobe (letzte 20 % der Reihe)',
  'Forza della stagionalità': 'Stärke der Saisonalität',
  'Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).':
    'Stärke der Saisonalität = {s1} (0 = keine, 1 = dominierende Saisonalität).',
  'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.':
    'Die Indizes nach Position im Zyklus zeigen, welche Perioden über oder unter dem Trend liegen: Es sind mittlere Abweichungen, keine Absolutwerte.',
  'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.':
    'Die Indizes sind mittlere Abweichungen vom Trend, um null zentriert: Positive Werte zeigen Perioden über dem Trend.',
  'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.':
    'Die Prognoseintervalle enthalten weder die Unsicherheit der Parameterschätzung noch die der Ordnungswahl; bedingte Volatilität (GARCH) und externe Regressoren werden nicht modelliert.',
  'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.':
    'Die Intervalle enthalten die durch die Differenzenbildung akkumulierte Unsicherheit, aber nicht die Unsicherheit der Parameterschätzung oder der Ordnungswahl.',
  'il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta':
    'der Abstand zum Zweitplatzierten beträgt Δ AICc = {s1}, die Wahl ist daher klar',
  'Il MAPE non è definito quando la serie contiene zeri.':
    'Der MAPE ist nicht definiert, wenn die Reihe Nullen enthält.',
  'Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.':
    'Das Modell {s1} führt die Prognose von {s2} im Schritt {s3} auf {s4} im Schritt {s5}, über {s6} Schritte.',
  'Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.':
    'Das in der Validierung beste Modell ist {s1} (RMSE = {s2}, MAE = {s3}): Qualität {s4} gegenüber der Variabilität der Reihe.',
  'il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini':
    'der Zweitplatzierte liegt bei Δ AICc = {s1}, die Daten unterscheiden die beiden Ordnungen daher nicht klar',
  'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.':
    'Der ADF-Test ist auf dieser Reihe nicht berechenbar: Die Differenzenbildung muss manuell entschieden werden.',
  'Il test ADF sulla serie dà p ≈ {s1}: {s2}.':
    'Der ADF-Test auf die Reihe ergibt p ≈ {s1}: {s2}.',
  'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.':
    'Der Runs-Test prüft, ob die Reihenfolge der Werte zufällig ist, nicht ihre Verteilung.',
  'Il test di autocorrelazione sui residui non è calcolabile.':
    'Der Autokorrelationstest auf den Residuen ist nicht berechenbar.',
  'Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.':
    'Legen Sie eine saisonale Periode fest (zum Beispiel 12 für Monatsdaten, 4 für Quartalsdaten), um die Indizes zu schätzen und die Reihe zu zerlegen.',
  'In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.':
    'In der Validierung auf den letzten {s1} Werten beträgt der RMSE {s2} und das Modell {s3}.',
  Indice: 'Index',
  'Indici stagionali': 'Saisonale Indizes',
  'Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.':
    'Intervall von {s1} %: {s2} – {s3} im ersten Schritt und {s4} – {s5} im letzten; die Breite wächst von {s6} auf {s7}, wie es bei zunehmendem Horizont zu erwarten ist.',
  'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.':
    'Die ACF misst, wie stark ein Wert mit den vorherigen korreliert ist. Bleiben die Balken im Band ±1,96/√N, zeigt die Reihe kein zeitliches Gedächtnis; treten sie heraus, enthält die Vergangenheit Information über die Gegenwart.',
  'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.':
    'Die deskriptive Analyse einer Zeitreihe prüft, ob die Werte unabhängig von der Zeit sind: Trend, Autokorrelation und Saisonalität sind die drei Strukturen, die eine Reihe von einer Zufallsstichprobe unterscheiden.',
  'la componente stagionale domina la variabilità attorno al trend.':
    'die saisonale Komponente dominiert die Variabilität um den Trend.',
  'la componente stagionale è presente ma non domina la variabilità attorno al trend.':
    'die saisonale Komponente ist vorhanden, dominiert aber die Variabilität um den Trend nicht.',
  'La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.':
    'Die Differenzenbildung ist manuell gesetzt, daher hängt die Ordnung nicht von den Tests ab{s1}.',
  'La forza della stagionalità è {s1}: {s2}':
    'Die Stärke der Saisonalität beträgt {s1}: {s2}',
  'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).':
    'Die PACF isoliert die Korrelation beim Lag k unter Ausschluss der Zwischen-Lags: Ein klarer Abbruch nach Lag 1 spricht für einen AR(1)-Prozess.',
  'La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.':
    'Die Steigung nach Sen ist der Median der Steigungen zwischen allen Punktpaaren: Sie ist robust gegenüber Ausreißern.',
  'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve':
    'die Einheitswurzel wird nicht verworfen, daher ist mindestens eine Differenzenbildung nötig',
  "La ricerca automatica sull'ordine ha scelto {s1} (AICc = {s2}): {s3}.":
    'Die automatische Suche über die Ordnung hat {s1} gewählt (AICc = {s2}): {s3}.',
  'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.':
    'Die Suche nach den Ordnungen ist auf p und q ≤ 2 (≤ 1 bei weniger als 30 Beobachtungen) und einen saisonalen AR- und MA-Term beschränkt: Höhere Ordnungen werden nicht durchsucht.',
  'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.':
    'Die Zerlegung ist additiv; bei einer zum Niveau proportionalen saisonalen Amplitude ist ein multiplikatives Modell nötig.',
  'La serie è troppo corta per confrontare modelli di previsione.':
    'Die Reihe ist zu kurz, um Prognosemodelle zu vergleichen.',
  'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.':
    'Die Reihe erlaubt keine Schätzung eines ARIMA-Modells: Die Prognosen bleiben die der einfachen Modelle.',
  'la stazionarietà non è rifiutata, quindi la serie non va differenziata':
    'die Stationarität wird nicht verworfen, daher muss die Reihe nicht differenziert werden',
  'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.':
    'Die ARIMA-Schätzung ist bedingt (Summe der Residuenquadrate) und keine exakte Maximum-Likelihood-Schätzung: Bei sehr kurzen Reihen wiegen die ersten Residuen mehr.',
  Lag: 'Lag',
  'le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte':
    'die Autokorrelationen sind nicht gemeinsam signifikant (Ljung–Box p = {s1}): Es zeigt sich keine starke zeitliche Struktur',
  'le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti':
    'die Autokorrelationen sind gemeinsam signifikant (Ljung–Box p = {s1}): Die Werte hängen von den vorherigen ab',
  'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.':
    'Die Prognosen haben keine Out-of-Sample-Validierung: Der In-Sample-Fehler ist optimistisch, weil die Parameter auf denselben Daten geschätzt wurden.',
  'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.':
    'Die Prognosen sind Punktschätzungen: Sie enthalten weder die Unsicherheit des Modells noch die der Daten.',
  'Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.':
    'Die ersten und letzten Beobachtungen haben keinen geschätzten Trend: Der zentrierte gleitende Mittelwert ist an den Rändern nicht definiert.',
  'Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.':
    'Die nächsten {s1} Prognosen beginnen bei {s2} und enden bei {s3}.',
  'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.':
    'Die AR- und MA-Wurzeln liegen außerhalb des Einheitskreises: Das Modell ist stationär und invertierbar, die Prognosen konvergieren daher, statt zu divergieren.',
  Lettura: 'Lesart',
  'Limite alto': 'Obere Grenze',
  'Limite basso': 'Untere Grenze',
  'Ljung–Box (lag 1–{s1})': 'Ljung–Box (Lag 1–{s1})',
  'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.':
    'Ljung–Box prüft, ob die ersten Autokorrelationen gemeinsam null sind.',
  'Ljung–Box: Q = {s1} con p = {s2}. {s3}.':
    'Ljung–Box: Q = {s1} mit p = {s2}. {s3}.',
  MAE: 'MAE',
  'Mann–Kendall (trend)': 'Mann–Kendall (Trend)',
  'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.':
    'Mann–Kendall ist nicht parametrisch und robust gegenüber Ausreißern: Ein kleines p zeigt eine monotone Tendenz.',
  'MAPE %': 'MAPE %',
  Massimo: 'Maximum',
  Media: 'Mittelwert',
  Metrica: 'Metrik',
  Minimo: 'Minimum',
  Modello: 'Modell',
  'Modello {s1}': 'Modell {s1}',
  'modello additivo · periodo {s1}': 'additives Modell · Periode {s1}',
  'molto buona': 'sehr gut',
  'N = {s1}{s2}': 'N = {s1}{s2}',
  'Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.':
    'Kein signifikanter AR- oder MA-Term: Das Modell reduziert sich auf einen Mittelwert (oder eine Drift) plus Rauschen.',
  'nessun trend monotono': 'kein monotoner Trend',
  'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie':
    'keine residuelle Autokorrelation, das Modell hat das Gedächtnis der Reihe erfasst',
  'nessuna autocorrelazione rilevante': 'keine relevante Autokorrelation',
  'non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga':
    'schlägt die einfachste Referenz nicht (RMSE {s1}): Die zusätzliche Struktur lohnt sich nicht',
  'non c’è evidenza di un {s1} (Mann–Kendall p = {s2})':
    'es gibt keinen Hinweis auf einen {s1} (Mann–Kendall p = {s2})',
  'non calcolabile': 'nicht berechenbar',
  'non ci sono altri ordini confrontabili':
    'es gibt keine weiteren vergleichbaren Ordnungen',
  'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.':
    'Auf dieser Reihe konnte kein ARIMA-Modell geschätzt werden: Die gezeigten Prognosen sind die der einfachen Modelle.',
  'orizzonte {s1} passi': 'Horizont {s1} Schritte',
  Osservazioni: 'Beobachtungen',
  'Osservazioni efficaci': 'Effektive Beobachtungen',
  p: 'p',
  PACF: 'PACF',
  Passo: 'Schritt',
  'Pendenza di Sen': 'Steigung nach Sen',
  'Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.':
    'Steigung nach Sen = {s1} pro Schritt: {s2} Median, robust gegenüber Ausreißern.',
  'Posizione nel ciclo': 'Position im Zyklus',
  Previsione: 'Prognose',
  'Previsioni ({s1})': 'Prognosen ({s1})',
  'Primo valore': 'Erster Wert',
  'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.':
    'Diese Modelle dienen als Referenz: Das beste wird mit dem ARIMA-Modell verglichen, das für die Prognosen mit Intervallen verwendet wird.',
  'Qui {s1}, e {s2}.': 'Hier {s1}, und {s2}.',
  'Report di lettura': 'Lesetext',
  'Residui: Ljung–Box {s1} → {s2}.': 'Residuen: Ljung–Box {s1} → {s2}.',
  Residuo: 'Residuum',
  'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto':
    'es bleibt unerklärte Autokorrelation, die Ordnung sollte überprüft werden',
  RMSE: 'RMSE',
  'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.':
    'RMSE und MAE haben dieselbe Einheit wie die Reihe; der MAPE ist prozentual und nicht definiert, wenn die Reihe Nullen enthält.',
  'scala non calcolabile': 'Skala nicht berechenbar',
  'scarsa (peggio della media)': 'schlecht (schlechter als der Mittelwert)',
  'Scelta della differenziazione': 'Wahl der Differenzenbildung',
  Scomposizione: 'Zerlegung',
  Serie: 'Reihe',
  'serie = trend + stagionalità + residuo':
    'Reihe = Trend + Saisonalität + Residuum',
  'Serie di {s1} osservazioni: {s2}.': 'Reihe mit {s1} Beobachtungen: {s2}.',
  'serie non casuale': 'Reihe nicht zufällig',
  'Serie storica': 'Historische Reihe',
  'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.':
    'Reihe zu kurz für eine Out-of-Sample-Validierung: Der verfügbare Fehler ist der Anpassungsfehler.',
  'Sintesi della serie': 'Zusammenfassung der Reihe',
  'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.':
    'Es sind Punktprognosen: Das Unsicherheitsintervall würde mit dem Horizont wachsen und ist nicht enthalten.',
  Stagionalità: 'Saisonalität',
  'Stagionalità non richiesta': 'Saisonalität nicht angefordert',
  Statistica: 'Statistik',
  'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.':
    'Auf dieser Grundlage wird ein ARIMA/SARIMA-Modell geschätzt: Die geschätzte Erinnerung und Saisonalität dienen dazu, Prognosen mit Intervallen zu erstellen, nicht nur die Reihe zu beschreiben.',
  t: 't',
  'termine non significativo, il suo contributo non si distingue dal caso':
    'nicht signifikanter Term, sein Beitrag ist nicht vom Zufall zu unterscheiden',
  'termine significativo, aggiunge memoria al modello':
    'signifikanter Term, fügt dem Modell Gedächtnis hinzu',
  Test: 'Test',
  'Test ADF sulla serie': 'ADF-Test auf die Reihe',
  'Test dei runs: p = {s1}{s2}.': 'Runs-Test: p = {s1}{s2}.',
  'Test di casualità e trend': 'Test auf Zufälligkeit und Trend',
  Trend: 'Trend',
  'trend {s1}': 'Trend {s1}',
  'trend crescente': 'steigender Trend',
  'trend decrescente': 'fallender Trend',
  'Trend e casualità': 'Trend und Zufälligkeit',
  'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.':
    'Trend, Saisonalität und Prognosen setzen voraus, dass die Zukunft das beobachtete Muster fortsetzt: Regimewechsel werden nicht berücksichtigt.',
  'Ultimo valore': 'Letzter Wert',
  'Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.':
    'Out-of-Sample-Validierung: RMSE = {s1}, MAE = {s2}; das Modell {s3}.',
  Valore: 'Wert',
  'Variazione dal primo all’ultimo valore: {s1} ({s2}).':
    'Änderung vom ersten zum letzten Wert: {s1} ({s2}).',
  'Variazione totale': 'Gesamtänderung',
  'Wald–Wolfowitz (runs)': 'Wald–Wolfowitz (Runs)',
};
