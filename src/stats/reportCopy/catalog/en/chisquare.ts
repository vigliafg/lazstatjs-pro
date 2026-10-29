/** English prose of the chisquare report and its tables. */
export const chisquareCopy: Record<string, string> = {
  'Odds Ratio':
    'Odds Ratio',
  'Relative Risk':
    'Relative Risk',
  'Frequenza attesa minima':
    'Minimum expected frequency',
  'Celle con E < 5':
    'Cells with E < 5',
  'Il test non è calcolabile con i dati disponibili.':
    'The test cannot be computed with the available data.',
  'Esiste un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}){s8}.':
    'There is an association between {s1}/{s2} and {s3}/{s4}: χ² = {s5}, {s6} (α threshold = {s7}){s8}.',
  ', φ = {s1} ({s2})':
    ', φ = {s1} ({s2})',
  'Non emerge un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}).':
    'No association emerges between {s1}/{s2} and {s3}/{s4}: χ² = {s5}, {s6} (α threshold = {s7}).',
  'Pearson χ² = {s1} con df = {s2}, {s3} (α = {s4}).':
    'Pearson χ² = {s1} with df = {s2}, {s3} (α = {s4}).',
  'Rapporto di verosimiglianza G² = {s1}, {s2}: lettura alternativa, di solito concorde.':
    'Likelihood ratio G² = {s1}, {s2}: an alternative reading, usually in agreement.',
  'Correzione di continuità di Yates: {s1} (più prudente su tabelle 2×2).':
    'Yates continuity correction: {s1} (more cautious on 2×2 tables).',
  'Fisher esatto: {s1} → {s2}; è il riferimento quando le frequenze attese sono piccole.':
    'Fisher exact: {s1} → {s2}; it is the reference when expected frequencies are small.',
  'conferma l’associazione':
    'confirms the association',
  'non conferma l’associazione':
    'does not confirm the association',
  'Le due variabili non sono indipendenti: la distribuzione delle risposte cambia tra le righe.':
    'The two variables are not independent: the distribution of responses changes across rows.',
  'Le differenze osservate sono compatibili con l’indipendenza tra righe e colonne.':
    'The observed differences are compatible with independence between rows and columns.',
  'Dove sta l’associazione':
    'Where the association lies',
  'La cella che contribuisce di più è «{s1}»: osservati {s2}, attesi {s3}, residuo aggiustato {s4} → {s5}.':
    'The cell contributing most is «{s1}»: observed {s2}, expected {s3}, adjusted residual {s4} → {s5}.',
  'differenza rispetto all’atteso superiore a 2, quindi rilevante':
    'difference from the expected count above 2, therefore relevant',
  'scostamento contenuto':
    'small deviation',
  'Nessuna cella dominante.':
    'No dominant cell.',
  'Totale osservazioni: {s1}. Composizione per riga: {s2} {s3}% in {s4}, {s5}% in {s6}.':
    'Total observations: {s1}. Row composition: {s2} {s3}% in {s4}, {s5}% in {s6}.',
  'Le percentuali di riga rendono confrontabili gruppi con numerosità diverse; le percentuali di colonna rispondono alla domanda inversa.':
    'Row percentages make groups of different sizes comparable; column percentages answer the reverse question.',
  'Quanto è forte l’associazione':
    'How strong the association is',
  'φ = {s1}: associazione {s2} (0.1 debole, 0.3 moderata, 0.5 forte su tabelle 2×2).':
    'φ = {s1}: {s2} association (0.1 weak, 0.3 moderate, 0.5 strong on 2×2 tables).',
  'φ non calcolabile.':
    'φ not computable.',
  'Odds ratio = {s1} (CI {s2}% {s3}): le odds di {s4} in {s5} sono {s6}.':
    'Odds ratio = {s1} (CI {s2}% {s3}): the odds of {s4} in {s5} are {s6}.',
  '{s1} volte quelle di {s2}':
    '{s1} times those of {s2}',
  '{s1} volte (cioè meno) di quelle di {s2}':
    '{s1} times (that is, less than) those of {s2}',
  'Odds ratio non calcolabile (celle a zero).':
    'Odds ratio not computable (zero cells).',
  'Rischio relativo = {s1}: {s2} ha un rischio di {s3} {s4} rispetto a {s5}.':
    'Relative risk = {s1}: {s2} has a risk of {s3} {s4} compared with {s5}.',
  'Frequenza attesa minima = {s1}; celle con atteso < 5: {s2} su 4. {s3}':
    'Minimum expected frequency = {s1}; cells with expected < 5: {s2} out of 4. {s3}',
  'La regola di Cochran non è rispettata: usa Fisher esatto (o Yates) e diffida del χ² classico.':
    'Cochran\'s rule is not met: use Fisher exact (or Yates) and distrust the classical χ².',
  'La regola di Cochran è rispettata: il χ² classico è affidabile.':
    'Cochran\'s rule is met: the classical χ² is reliable.',
  'Frequenze attese non disponibili.':
    'Expected frequencies not available.',
  'Ogni osservazione deve stare in una sola cella: conteggi ripetuti della stessa unità gonfiano artificialmente la significatività.':
    'Each observation must fall in a single cell: repeated counts of the same unit artificially inflate significance.',
  'Il residuo aggiustato dice quanto una cella è lontana da quanto ci si aspetterebbe se le variabili fossero indipendenti: oltre ±2 è un segnale concreto.':
    'The adjusted residual says how far a cell is from what would be expected if the variables were independent: beyond ±2 it is a concrete signal.',
  'C’è un legame tra le due variabili, ma la forza è {s1}: con molti dati anche un legame debole diventa significativo, quindi valuta l’ampiezza prima di agire.':
    'There is a link between the two variables, but its strength is {s1}: with lots of data even a weak link becomes significant, so assess the size before acting.',
  'da quantificare':
    'to be quantified',
  'Non ci sono prove di un legame tra le due variabili su questi dati. Con numerosità ridotta l’assenza di significatività può riflettere mancanza di potenza più che vera indipendenza.':
    'There is no evidence of a link between the two variables in these data. With a small sample, lack of significance can reflect lack of power rather than true independence.',
  'Report di lettura — Chi quadrato':
    'Reading report — Chi-square',
  'Associazione presente':
    'Association present',
  'Variabili indipendenti':
    'Independent variables',
  'Verifica se due variabili categoriche sono indipendenti: le righe sono {s1} e {s2}, le colonne {s3} e {s4}.':
    'It checks whether two categorical variables are independent: the rows are {s1} and {s2}, the columns {s3} and {s4}.',
  'Confronta i conteggi osservati con quelli attesi se non ci fosse alcun legame: se le differenze sono troppo grandi per il caso, l’indipendenza viene rifiutata.':
    'It compares the observed counts with those expected if there were no link: if the differences are too large for chance, independence is rejected.',
  'Il χ² richiede frequenze attese sufficienti: sotto 5 per cella il test classico è inaffidabile e va usato Fisher esatto.':
    'The χ² requires sufficient expected frequencies: below 5 per cell the classical test is unreliable and Fisher exact should be used.',
  'La significatività dipende dalla numerosità: con campioni molto grandi anche associazioni irrilevanti risultano significative.':
    'Significance depends on sample size: with very large samples even irrelevant associations come out significant.',
  'Il test è omnibus: non indica da solo quale cella o quale direzione spieghi l’associazione.':
    'The test is omnibus: on its own it does not say which cell or direction explains the association.',
  'Tabella di contingenza e residui':
    'Contingency table and residuals',
  '{s1}/{s2} × {s3}/{s4}':
    '{s1}/{s2} × {s3}/{s4}',
  'Cella':
    'Cell',
  'Osservato':
    'Observed',
  'Atteso':
    'Expected',
  'Row %':
    'Row %',
  'Column %':
    'Column %',
  'Total %':
    'Total %',
  'Residuo std.':
    'Std. residual',
  'Residuo aggiustato':
    'Adjusted residual',
  'Contributo χ²':
    'χ² contribution',
  '{s1} · {s2}':
    '{s1} · {s2}',
  'Totali: righe {s1} / {s2}, colonne {s3} / {s4}, N = {s5}.':
    'Totals: rows {s1} / {s2}, columns {s3} / {s4}, N = {s5}.',
  'Residuo standardizzato = (O − E)/√E; aggiustato = (O − E)/√(E·(1−row%)(1−col%)). Il contributo è (O − E)²/E.':
    'Standardised residual = (O − E)/√E; adjusted = (O − E)/√(E·(1−row%)(1−col%)). The contribution is (O − E)²/E.',
  'Test di indipendenza':
    'Independence test',
  'α = {s1}':
    'α = {s1}',
  'Test':
    'Test',
  'Pearson χ²':
    'Pearson χ²',
  'Likelihood ratio G²':
    'Likelihood ratio G²',
  'Yates continuity correction':
    'Yates continuity correction',
  'Fisher\'s exact (two-sided)':
    'Fisher\'s exact (two-sided)',
  'Per tabelle 2×2 χ² e G² hanno df = 1; con frequenze attese piccole (< 5) preferire il test esatto di Fisher.':
    'For 2×2 tables χ² and G² have df = 1; with small expected frequencies (< 5) prefer Fisher\'s exact test.',
  'Effect size e misure di associazione':
    'Effect size and measures of association',
  'CI {s1}%':
    'CI {s1}%',
  'φ (phi)':
    'φ (phi)',
  'Cramér\'s V':
    'Cramér\'s V',
  'associazione positiva':
    'positive association',
  'associazione negativa':
    'negative association',
  'rischio riga 1 / rischio riga 2':
    'risk row 1 / risk row 2',
  'Risk Difference':
    'Risk Difference',
  'differenza assoluta dei rischi':
    'absolute difference of the risks',
  'Per una tabella 2×2 φ e Cramér’s V coincidono numericamente; sono riportati separatamente perché la formula generale di V usa min(r−1, c−1).':
    'For a 2×2 table φ and Cramér’s V coincide numerically; they are reported separately because the general formula for V uses min(r−1, c−1).',
  'OR: CI di Woolf su log(OR). RR: CI di Katz su log(RR). RD: CI di Wald. Con celle vuote le stime OR/RR non sono definite.':
    'OR: Woolf CI on log(OR). RR: Katz CI on log(RR). RD: Wald CI. With empty cells the OR/RR estimates are not defined.',
  'CI di φ/V: bootstrap percentile (500 repliche, seed fisso) ricampionando le osservazioni dalla tabella.':
    'CI for φ/V: percentile bootstrap (500 replicates, fixed seed) resampling the observations from the table.',
  'Cochran: tutte ≥ 5 desiderabile':
    'Cochran: all ≥ 5 desirable',
  '{s1}% delle celle':
    '{s1}% of the cells',
  'numerosità totale':
    'total sample size',
  'Attenzione: una o più frequenze attese sono < 5. Yates o Fisher sono preferibili; per tabelle più grandi serve il test esatto o il bootstrap.':
    'Warning: one or more expected frequencies are < 5. Yates or Fisher are preferable; for larger tables the exact test or the bootstrap is needed.',
  'Le frequenze attese soddisfano la regola di Cochran.':
    'The expected frequencies satisfy Cochran\'s rule.',
};
