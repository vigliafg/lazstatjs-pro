/** English prose of the contingency report and its tables. */
export const contingencyCopy: Record<string, string> = {
  'non calcolabile':
    'not computable',
  'più osservazioni':
    'more observations',
  'meno osservazioni':
    'fewer observations',
  '{s1}: {s2} del previsto (residuo aggiustato {s3})':
    '{s1}: {s2} of the expected (adjusted residual {s3})',
  'Tabelle troppo piccole o con celle vuote: il test non è calcolabile.':
    'Table too small or with empty cells: the test cannot be computed.',
  'Le due variabili non sono indipendenti (χ² = {s1}, df = {s2}, p = {s3}).':
    'The two variables are not independent (χ² = {s1}, df = {s2}, p = {s3}).',
  'Nessuna evidenza di associazione (χ² = {s1}, df = {s2}, p = {s3}).':
    'No evidence of association (χ² = {s1}, df = {s2}, p = {s3}).',
  'Associazione significativa':
    'Significant association',
  'Nessuna associazione rilevata':
    'No association detected',
  'Il test del χ² confronta le frequenze che osservi con quelle che ti aspetteresti se le due variabili categoriche fossero completamente indipendenti.':
    'The χ² test compares the frequencies you observe with those you would expect if the two categorical variables were completely independent.',
  'L’ipotesi nulla è “indipendenza”: nessuna relazione tra riga e colonna. Un p piccolo significa che le differenze tra osservato e atteso sono troppo grandi per essere solo rumore campionario.':
    'The null hypothesis is “independence”: no relationship between row and column. A small p means the differences between observed and expected are too large to be sampling noise alone.',
  'La tabella ha N = {s1} osservazioni e {s2} gradi di libertà. Il χ² di Pearson vale {s3}: {s4}{s5}':
    'The table has N = {s1} observations and {s2} degrees of freedom. Pearson\'s χ² is {s3}: {s4}{s5}',
  ', sotto la soglia α = {s1}: l’ipotesi di indipendenza viene rifiutata.':
    ', below the α = {s1} threshold: the independence hypothesis is rejected.',
  ', sopra la soglia α = {s1}: l’ipotesi di indipendenza non viene rifiutata.':
    ', above the α = {s1} threshold: the independence hypothesis is not rejected.',
  'Con celle piccole il test esatto di Fisher dà p = {s1}: è il valore da preferire in una tabella 2×2 con attese basse.':
    'With small cells Fisher\'s exact test gives p = {s1}: it is the value to prefer in a 2×2 table with low expected counts.',
  'Poiché {s1} celle hanno attesa sotto 5, ho aggiunto un p Monte Carlo con margini fissi ({s2}): non dipende dall’approssimazione asintotica.':
    'Since {s1} cells have an expected count below 5, I added a Monte Carlo p with fixed margins ({s2}): it does not depend on the asymptotic approximation.',
  'Il χ² dice che qualcosa c’è, non dove. I residui aggiustati rispondono a questa domanda: valori oltre ±2 indicano le celle che si discostano dall’indipendenza più di quanto il caso spieghi.':
    'The χ² says that something is there, not where. Adjusted residuals answer that question: values beyond ±2 mark the cells that depart from independence more than chance explains.',
  'Nessuna cella supera la soglia di ±2: l’associazione è diffusa, non concentrata in una combinazione specifica.':
    'No cell crosses the ±2 threshold: the association is spread out, not concentrated in one specific combination.',
  'Quanto è forte':
    'How strong it is',
  'Cramér’s V = {s1}: un’associazione {s2} (0 = indipendenza, 1 = legame deterministico). Il p-value può essere piccolissimo anche per associazioni debolissime se N è grande: la forza va letta qui, non nel p.':
    'Cramér’s V = {s1}: a {s2} association (0 = independence, 1 = deterministic link). The p-value can be tiny even for very weak associations when N is large: strength must be read here, not in the p.',
  'La misura di associazione non è calcolabile con questi dati.':
    'The association measure cannot be computed with these data.',
  'Assunzioni da controllare':
    'Assumptions to check',
  'Osservazioni indipendenti: ogni riga del dataset deve essere una unità diversa, non una misura ripetuta.':
    'Independent observations: each row of the dataset must be a different unit, not a repeated measure.',
  'Categorie esaustive e mutuamente esclusive: ogni osservazione cade in una sola cella.':
    'Exhaustive and mutually exclusive categories: each observation falls in a single cell.',
  'Regola di Cochran: nessuna attesa < 1 e non più del 20% delle celle con attesa < 5; se cade, usa Fisher (2×2) o il p Monte Carlo.':
    'Cochran\'s rule: no expected count < 1 and no more than 20% of cells with expected < 5; if it fails, use Fisher (2×2) or the Monte Carlo p.',
  'Il test non dice nulla sulla direzione causale: associazione non è causa.':
    'The test says nothing about causal direction: association is not cause.',
  'Tabelle molto grandi con molte categorie rare rendono il χ² instabile anche con N elevato.':
    'Very large tables with many rare categories make the χ² unstable even with a high N.',
  'Con dati raggruppati per convenienza (non campionati) il p-value non ha il significato nominale.':
    'With data grouped by convenience (not sampled) the p-value does not have its nominal meaning.',
  'Row {s1}':
    'Row {s1}',
  'c{s1}':
    'c{s1}',
  'Col {s1}':
    'Col {s1}',
  'Tabella di contingenza (frequenze osservate)':
    'Contingency table (observed frequencies)',
  '{s1} × {s2} · N = {s3}':
    '{s1} × {s2} · N = {s3}',
  'Riga':
    'Row',
  'Totale':
    'Total',
  'Ogni cella contiene il numero di osservazioni con quella combinazione di categorie.':
    'Each cell holds the number of observations with that combination of categories.',
  'Frequenze attese sotto indipendenza':
    'Expected frequencies under independence',
  'E = (totale riga × totale colonna) / N':
    'E = (row total × column total) / N',
  'Le attese sono le frequenze che si vedrebbero se le due variabili fossero indipendenti.':
    'Expected counts are the frequencies you would see if the two variables were independent.',
  '{s1} cella/e su {s2} hanno attesa < 5: l\'approssimazione χ² è fragile (regola di Cochran).':
    '{s1} cell(s) out of {s2} have expected < 5: the χ² approximation is fragile (Cochran\'s rule).',
  'Tutte le attese sono ≥ 5: l’approssimazione χ² è adeguata.':
    'All expected counts are ≥ 5: the χ² approximation is adequate.',
  'Residui e contributi al χ²':
    'Residuals and contributions to the χ²',
  'Residuo standardizzato = (O − E)/√E':
    'Standardised residual = (O − E)/√E',
  'O':
    'O',
  'E':
    'E',
  'Un residuo aggiustato oltre ±2 segnala la cella che si discosta di più dall’indipendenza.':
    'An adjusted residual beyond ±2 flags the cell that departs most from independence.',
  'Il contributo è quanto quella cella pesa nel χ² totale: le prime posizioni spiegano l’associazione.':
    'The contribution is how much that cell weighs in the total χ²: the top positions explain the association.',
  'Yates (correzione di continuità)':
    'Yates (continuity correction)',
  'Monte Carlo ({s1} tavole, margini fissi)':
    'Monte Carlo ({s1} tables, fixed margins)',
  'df = (righe − 1)(colonne − 1) = {s1}.':
    'df = (rows − 1)(columns − 1) = {s1}.',
  'χ² e G² condividono le stesse assunzioni: osservazioni indipendenti, categorie esaustive, attese sufficientemente grandi.':
    'χ² and G² share the same assumptions: independent observations, exhaustive categories, sufficiently large expected counts.',
  'Il test dice che esiste un’associazione, non quanto sia forte né in quale direzione: per quello servono residui e misure di associazione.':
    'The test says that an association exists, not how strong it is or in which direction: residuals and association measures are needed for that.',
  'Cramér’s V':
    'Cramér’s V',
  '0 = nessuna associazione, 1 = associazione perfetta':
    '0 = no association, 1 = perfect association',
  'Coefficiente di contingenza C':
    'Contingency coefficient C',
  'Dipende dal numero di categorie: confrontabile solo tra tabelle di stessa forma':
    'It depends on the number of categories: comparable only between tables of the same shape',
  'Per tabelle 2×2 coincide con la correlazione tra le due variabili binarie':
    'For 2×2 tables it coincides with the correlation between the two binary variables',
  'Ampiezza dell’associazione':
    'Size of the association',
  'Lettura':
    'Reading',
  'Il p-value dipende da N; queste misure no, ed è per questo che vanno riportate insieme.':
    'The p-value depends on N; these measures do not, and that is why they should be reported together.',
};
