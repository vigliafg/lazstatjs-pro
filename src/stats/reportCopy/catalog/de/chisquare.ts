/** de: report and table prose (normalised). */
export const chisquareCopy: Record<string, string> = {
  ', φ = {s1} ({s2})': ', φ = {s1} ({s2})',
  '{s1} · {s2}': '{s1} · {s2}',
  '{s1} volte (cioè meno) di quelle di {s2}':
    '{s1} mal so hoch (also niedriger) wie die von {s2}',
  '{s1} volte quelle di {s2}': '{s1} mal so hoch wie die von {s2}',
  '{s1}/{s2} × {s3}/{s4}': '{s1}/{s2} × {s3}/{s4}',
  '{s1}% delle celle': '{s1} % der Zellen',
  'associazione negativa': 'negativer Zusammenhang',
  'associazione positiva': 'positiver Zusammenhang',
  'Associazione presente': 'Zusammenhang vorhanden',
  Assunzioni: 'Annahmen',
  'Attenzione: una o più frequenze attese sono < 5. Yates o Fisher sono preferibili; per tabelle più grandi serve il test esatto o il bootstrap.':
    'Achtung: Eine oder mehrere erwartete Häufigkeiten sind < 5. Yates oder Fisher sind vorzuziehen; für größere Tabellen braucht es den exakten Test oder Bootstrap.',
  Atteso: 'Erwartet',
  'C’è un legame tra le due variabili, ma la forza è {s1}: con molti dati anche un legame debole diventa significativo, quindi valuta l’ampiezza prima di agire.':
    'Es gibt einen Zusammenhang zwischen den beiden Variablen, aber die Stärke ist {s1}: Bei vielen Daten wird auch ein schwacher Zusammenhang signifikant, daher beurteilen Sie die Größe, bevor Sie handeln.',
  Cella: 'Zelle',
  'Celle con E < 5': 'Zellen mit E < 5',
  'CI {s1}%': 'CI {s1} %',
  'CI di φ/V: bootstrap percentile (500 repliche, seed fisso) ricampionando le osservazioni dalla tabella.':
    'CI von φ/V: Perzentil-Bootstrap (500 Wiederholungen, fester Seed) durch Resampling der Beobachtungen aus der Tabelle.',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'Cochran: tutte ≥ 5 desiderabile': 'Cochran: alle ≥ 5 wünschenswert',
  'Column %': 'Spalten-%',
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'conferma l’associazione': 'bestätigt den Zusammenhang',
  'Confronta i conteggi osservati con quelli attesi se non ci fosse alcun legame: se le differenze sono troppo grandi per il caso, l’indipendenza viene rifiutata.':
    'Vergleicht die beobachteten Anzahlen mit denen, die ohne jeden Zusammenhang zu erwarten wären: Sind die Unterschiede zu groß für den Zufall, wird die Unabhängigkeit verworfen.',
  'Contributo χ²': 'Beitrag zum χ²',
  Controllo: 'Prüfung',
  'Correzione di continuità di Yates: {s1} (più prudente su tabelle 2×2).':
    'Kontinuitätskorrektur nach Yates: {s1} (vorsichtiger bei 2×2-Tabellen).',
  "Cramér's V": "Cramér's V",
  'da quantificare': 'noch zu quantifizieren',
  df: 'df',
  'differenza assoluta dei rischi': 'absolute Differenz der Risiken',
  'differenza rispetto all’atteso superiore a 2, quindi rilevante':
    'Abweichung vom Erwarteten über 2, daher relevant',
  'Dove sta l’associazione': 'Wo der Zusammenhang liegt',
  'Effect size e misure di associazione': 'Effektstärke und Assoziationsmaße',
  'Esiste un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}){s8}.':
    'Es besteht ein Zusammenhang zwischen {s1}/{s2} und {s3}/{s4}: χ² = {s5}, {s6} (Schwelle α = {s7}){s8}.',
  'Fisher esatto: {s1} → {s2}; è il riferimento quando le frequenze attese sono piccole.':
    'Exakter Test nach Fisher: {s1} → {s2}; er ist die Referenz, wenn die erwarteten Häufigkeiten klein sind.',
  "Fisher's exact (two-sided)": 'Exakter Test nach Fisher (zweiseitig)',
  'Frequenza attesa minima': 'Kleinste erwartete Häufigkeit',
  'Frequenza attesa minima = {s1}; celle con atteso < 5: {s2} su 4. {s3}':
    'Kleinste erwartete Häufigkeit = {s1}; Zellen mit Erwartung < 5: {s2} von 4. {s3}',
  'Frequenze attese non disponibili.':
    'Erwartete Häufigkeiten nicht verfügbar.',
  'Il residuo aggiustato dice quanto una cella è lontana da quanto ci si aspetterebbe se le variabili fossero indipendenti: oltre ±2 è un segnale concreto.':
    'Das adjustierte Residuum sagt, wie weit eine Zelle von dem entfernt ist, was bei Unabhängigkeit der Variablen zu erwarten wäre: über ±2 ist ein konkretes Signal.',
  'Il test è omnibus: non indica da solo quale cella o quale direzione spieghi l’associazione.':
    'Der Test ist ein Omnibustest: Er allein zeigt nicht, welche Zelle oder welche Richtung den Zusammenhang erklärt.',
  'Il test non è calcolabile con i dati disponibili.':
    'Der Test ist mit den verfügbaren Daten nicht berechenbar.',
  'Il test principale': 'Der Haupttest',
  'Il χ² richiede frequenze attese sufficienti: sotto 5 per cella il test classico è inaffidabile e va usato Fisher esatto.':
    'Das χ² setzt ausreichend große erwartete Häufigkeiten voraus: Unter 5 pro Zelle ist der klassische Test unzuverlässig, und der exakte Test nach Fisher ist zu verwenden.',
  'In pratica': 'In der Praxis',
  Interpretazione: 'Interpretation',
  'La cella che contribuisce di più è «{s1}»: osservati {s2}, attesi {s3}, residuo aggiustato {s4} → {s5}.':
    'Die Zelle mit dem größten Beitrag ist «{s1}»: beobachtet {s2}, erwartet {s3}, adjustiertes Residuum {s4} → {s5}.',
  'La regola di Cochran è rispettata: il χ² classico è affidabile.':
    'Die Cochran-Regel ist erfüllt: Das klassische χ² ist zuverlässig.',
  'La regola di Cochran non è rispettata: usa Fisher esatto (o Yates) e diffida del χ² classico.':
    'Die Cochran-Regel ist nicht erfüllt: Verwenden Sie den exakten Test nach Fisher (oder Yates) und misstrauen Sie dem klassischen χ².',
  'La significatività dipende dalla numerosità: con campioni molto grandi anche associazioni irrilevanti risultano significative.':
    'Die Signifikanz hängt von der Fallzahl ab: Bei sehr großen Stichproben werden auch irrelevante Zusammenhänge signifikant.',
  'Le differenze osservate sono compatibili con l’indipendenza tra righe e colonne.':
    'Die beobachteten Unterschiede sind mit der Unabhängigkeit von Zeilen und Spalten vereinbar.',
  'Le due variabili non sono indipendenti: la distribuzione delle risposte cambia tra le righe.':
    'Die beiden Variablen sind nicht unabhängig: Die Verteilung der Antworten ändert sich zwischen den Zeilen.',
  'Le frequenze attese soddisfano la regola di Cochran.':
    'Die erwarteten Häufigkeiten erfüllen die Cochran-Regel.',
  'Le percentuali di riga rendono confrontabili gruppi con numerosità diverse; le percentuali di colonna rispondono alla domanda inversa.':
    'Zeilenprozente machen Gruppen mit unterschiedlicher Größe vergleichbar; Spaltenprozente beantworten die umgekehrte Frage.',
  'Likelihood ratio G²': 'Likelihood-Quotient G²',
  Misura: 'Maß',
  N: 'N',
  'Nessuna cella dominante.': 'Keine dominierende Zelle.',
  'Non ci sono prove di un legame tra le due variabili su questi dati. Con numerosità ridotta l’assenza di significatività può riflettere mancanza di potenza più che vera indipendenza.':
    'Es gibt keine Belege für einen Zusammenhang zwischen den beiden Variablen in diesen Daten. Bei geringer Fallzahl kann fehlende Signifikanz eher auf fehlende Power als auf echte Unabhängigkeit hindeuten.',
  'non conferma l’associazione': 'bestätigt den Zusammenhang nicht',
  'Non emerge un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}).':
    'Es zeigt sich kein Zusammenhang zwischen {s1}/{s2} und {s3}/{s4}: χ² = {s5}, {s6} (Schwelle α = {s7}).',
  Nota: 'Notiz',
  'numerosità totale': 'Gesamtfallzahl',
  'Odds Ratio': 'Odds Ratio',
  'Odds ratio = {s1} (CI {s2}% {s3}): le odds di {s4} in {s5} sono {s6}.':
    'Odds Ratio = {s1} (CI {s2} % {s3}): Die Odds von {s4} in {s5} sind {s6}.',
  'Odds ratio non calcolabile (celle a zero).':
    'Odds Ratio nicht berechenbar (Zellen mit null).',
  'Ogni osservazione deve stare in una sola cella: conteggi ripetuti della stessa unità gonfiano artificialmente la significatività.':
    'Jede Beobachtung muss in genau einer Zelle liegen: Wiederholte Zählungen derselben Einheit blähen die Signifikanz künstlich auf.',
  'OR: CI di Woolf su log(OR). RR: CI di Katz su log(RR). RD: CI di Wald. Con celle vuote le stime OR/RR non sono definite.':
    'OR: Woolf-CI auf log(OR). RR: Katz-CI auf log(RR). RD: Wald-CI. Bei leeren Zellen sind die OR/RR-Schätzungen nicht definiert.',
  Osservato: 'Beobachtet',
  p: 'p',
  'Pearson χ²': 'Pearson χ²',
  'Pearson χ² = {s1} con df = {s2}, {s3} (α = {s4}).':
    'Pearson χ² = {s1} mit df = {s2}, {s3} (α = {s4}).',
  'Per tabelle 2×2 χ² e G² hanno df = 1; con frequenze attese piccole (< 5) preferire il test esatto di Fisher.':
    'Bei 2×2-Tabellen haben χ² und G² df = 1; bei kleinen erwarteten Häufigkeiten (< 5) ist der exakte Test nach Fisher vorzuziehen.',
  'Per una tabella 2×2 φ e Cramér’s V coincidono numericamente; sono riportati separatamente perché la formula generale di V usa min(r−1, c−1).':
    'Bei einer 2×2-Tabelle stimmen φ und Cramér’s V numerisch überein; sie werden getrennt berichtet, weil die allgemeine Formel von V min(r−1, c−1) verwendet.',
  'Quanto è forte l’associazione': 'Wie stark der Zusammenhang ist',
  'Rapporto di verosimiglianza G² = {s1}, {s2}: lettura alternativa, di solito concorde.':
    'Likelihood-Quotient G² = {s1}, {s2}: alternative Lesart, meist übereinstimmend.',
  'Relative Risk': 'Relatives Risiko',
  'Report di lettura — Chi quadrato': 'Lesetext — Chi-Quadrat',
  'Residuo aggiustato': 'Adjustiertes Residuum',
  'Residuo standardizzato = (O − E)/√E; aggiustato = (O − E)/√(E·(1−row%)(1−col%)). Il contributo è (O − E)²/E.':
    'Standardisiertes Residuum = (O − E)/√E; adjustiert = (O − E)/√(E·(1−Zeilen-%)(1−Spalten-%)). Der Beitrag ist (O − E)²/E.',
  'Residuo std.': 'Std. Residuum',
  'Rischio relativo = {s1}: {s2} ha un rischio di {s3} {s4} rispetto a {s5}.':
    'Relatives Risiko = {s1}: Das Risiko von {s2} beträgt {s3} {s4} im Vergleich zu {s5}.',
  'rischio riga 1 / rischio riga 2': 'Risiko Zeile 1 / Risiko Zeile 2',
  'Risk Difference': 'Risikodifferenz',
  'Row %': 'Zeilen-%',
  'scostamento contenuto': 'geringe Abweichung',
  Statistica: 'Statistik',
  Stima: 'Schätzung',
  'Tabella di contingenza e residui': 'Kontingenztabelle und Residuen',
  Test: 'Test',
  'Test di indipendenza': 'Unabhängigkeitstest',
  'Total %': 'Gesamt-%',
  'Totale osservazioni: {s1}. Composizione per riga: {s2} {s3}% in {s4}, {s5}% in {s6}.':
    'Beobachtungen insgesamt: {s1}. Zusammensetzung pro Zeile: {s2} {s3} % in {s4}, {s5} % in {s6}.',
  'Totali: righe {s1} / {s2}, colonne {s3} / {s4}, N = {s5}.':
    'Summen: Zeilen {s1} / {s2}, Spalten {s3} / {s4}, N = {s5}.',
  Valore: 'Wert',
  'Variabili indipendenti': 'Unabhängige Variablen',
  'Verifica se due variabili categoriche sono indipendenti: le righe sono {s1} e {s2}, le colonne {s3} e {s4}.':
    'Prüft, ob zwei kategoriale Variablen unabhängig sind: Die Zeilen sind {s1} und {s2}, die Spalten {s3} und {s4}.',
  'Yates continuity correction': 'Yates-Kontinuitätskorrektur',
  'α = {s1}': 'α = {s1}',
  'φ (phi)': 'φ (Phi)',
  'φ = {s1}: associazione {s2} (0.1 debole, 0.3 moderata, 0.5 forte su tabelle 2×2).':
    'φ = {s1}: {s2} Zusammenhang (0.1 schwach, 0.3 mäßig, 0.5 stark bei 2×2-Tabellen).',
  'φ non calcolabile.': 'φ nicht berechenbar.',
};
