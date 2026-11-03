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
  'Odds ratio comune (MH)': 'Common odds ratio (MH)',
  'χ² Mantel–Haenszel': 'χ² Mantel–Haenszel',
  'Mantel–Haenszel: odds ratio comune': 'Mantel–Haenszel: common odds ratio',
  '{s1} strati · α = {s2}': '{s1} strata · α = {s2}',
  'L’odds ratio comune combina i rapporti dei singoli strati con i pesi di Mantel–Haenszel; l’intervallo è calcolato su scala logaritmica.': 'The common odds ratio combines the ratios of the individual strata with the Mantel–Haenszel weights; the interval is calculated on a logarithmic scale.',
  'Il χ² di Mantel–Haenszel verifica l’associazione comune dopo aver aggiustato per lo strato, con correzione di continuità.': 'The Mantel–Haenszel χ² tests for common association after adjusting for stratum, with continuity correction.',
  'Almeno uno strato aveva una cella vuota: a quelle quattro celle è stato aggiunto 0,5 prima del calcolo.': 'At least one stratum had an empty cell: those four cells had 0.5 added before calculation.',
  'Dettaglio per strato': 'Detail by stratum',
  'Odds ratio, log-OR e peso MH di ciascuna tabella 2×2': 'Odds ratio, log-OR and MH weight of each 2×2 table',
  'Strato': 'Layer',
  'Log OR': 'Log OR',
  'Peso MH': 'MH weight',
  'Il peso MH è b·c/n: è il contributo dello strato al denominatore dell’odds ratio comune.': 'The MH weight is b·c/n: it is the contribution of the stratum to the denominator of the common odds ratio.',
  'Un OR di strato sopra 1 indica maggiore odds nella prima riga; sotto 1 indica maggiore odds nella seconda.': 'A stratum OR above 1 indicates higher odds in the first row; below 1 indicates greater odds in the second.',
  'Trend di Cochran–Armitage': 'Cochran–Armitage trend',
  'Statistica z² con 1 grado di libertà': 'z² statistic with 1 degree of freedom',
  'Cochran–Armitage per il trend': 'Cochran–Armitage for the trend',
  'Il test confronta la proporzione di “{s1}” con i punteggi assegnati alle righe: un p piccolo indica un andamento sistematico, non solo una differenza tra gruppi.': 'The test compares the proportion of “{s1}” with the scores assigned to the rows: a small p indicates a systematic trend, not just a difference between groups.',
  'La statistica è z² e coincide con il test di regressione lineare pesata della proporzione sul punteggio.': 'The statistic is z² and coincides with the weighted linear regression test of the proportion on the score.',
  'Proporzioni per riga': 'Proportions per row',
  'Punteggio, successi e proporzione osservata': 'Score, successes and observed proportion',
  'Punteggio': 'Score',
  'La proporzione è successi / totale di riga. Il test ordina le righe secondo i punteggi, non secondo l’etichetta.': 'The proportion is hits / row total. The test sorts the rows by scores, not by label.',
  'Enumerazione esatta a margini fissi': 'Exact enumeration with fixed margins',
  'Monte Carlo a margini fissi': 'Monte Carlo with fixed margins',
  '{s1} tavole enumerate': '{s1} enumerated tables',
  '{s1} simulazioni deterministiche': '{s1} deterministic simulations',
  'Tabella 2×2 · p da Fisher': '2×2 · p table from Fisher',
  'Motivo non disponibile': 'Reason not available',
  'Test esatto R×C': 'Exact R×C test',
  '{s1} × {s2} · α = {s3}': '{s1} × {s2} · α = {s3}',
  'Statistica Σ|O − E|': 'Statistic Σ|O − E|',
  'Per una tabella 2×2 il p è quello di Fisher a due code; per tabelle più grandi il p somma le probabilità ipergeometriche delle tavole con margini fissi e statistica almeno pari a quella osservata.': 'For a 2×2 table the p is the two-tailed Fisher p; for larger tables the p sums the hypergeometric probabilities of the tables with fixed margins and statistics at least equal to the observed one.',
  'Il numero di tavole supera il budget di enumerazione: il p è stimato con un Monte Carlo deterministico a margini fissi.': 'The number of tables exceeds the enumeration budget: p is estimated with a deterministic Monte Carlo with fixed margins.',
  'La tabella non permette di calcolare il p esatto: controlla celle, margini e dimensione.': 'The table does not allow you to calculate the exact p: it controls cells, margins and size.',
  '{s1}: OR = {s2} (log-OR {s3}, peso {s4})': '{s1}: OR = {s2} (log-OR {s3}, weight {s4})',
  'Non ci sono strati sufficienti: il test di Mantel–Haenszel non è calcolabile.': 'There are not enough strata: the Mantel–Haenszel test is not calculable.',
  'Associazione comune significativa dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).': 'Significant common association after adjustment for strata (χ² MH = {s1}, p = {s2}).',
  'Nessuna associazione comune rilevata dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).': 'No common association detected after adjustment for stratum (χ² MH = {s1}, p = {s2}).',
  'Associazione comune significativa': 'Significant common association',
  'Nessuna associazione comune': 'No common association',
  'Il test di Mantel–Haenszel unisce più tabelle 2×2, una per strato, e verifica se l’associazione tra riga e colonna resta la stessa dopo aver tenuto conto dello strato.': 'The Mantel–Haenszel test joins multiple 2x2 tables, one per stratum, and checks whether the association between row and column remains the same after taking the stratum into account.',
  'È utile quando un fattore di confondimento crea gruppi diversi: invece di ignorarlo, lo si tratta come strato e si stima un odds ratio comune.': 'It is useful when a confounder creates different groups: instead of ignoring it, you treat it as a stratum and estimate a common odds ratio.',
  'Gli strati utilizzati sono {s1}. L’odds ratio comune vale {s2} con intervallo {s3} – {s4}: {s5}': 'The strata used are {s1}. The common odds ratio is {s2} with a range of {s3} – {s4}: {s5}',
  'p non calcolabile.': 'p not calculable.',
  'Il χ² di Mantel–Haenszel = {s1} supera la soglia α = {s2}: l’ipotesi di associazione comune nulla viene rifiutata.': 'The Mantel–Haenszel χ² = {s1} exceeds the threshold α = {s2}: the null common association hypothesis is rejected.',
  'Il χ² di Mantel–Haenszel = {s1} non supera la soglia α = {s2}: non ci sono prove sufficienti contro l’associazione comune nulla.': 'The Mantel–Haenszel χ² = {s1} does not exceed the threshold α = {s2}: there is insufficient evidence against the null common association.',
  'Uno o più strati contenevano una cella vuota: per quel calcolo è stato aggiunto 0,5 a ogni cella, come correzione di continuità.': 'One or more strata contained an empty cell: for that calculation 0.5 was added to each cell, as a continuity correction.',
  'L’odds ratio comune è una media pesata degli odds ratio di strato: gli strati con più informazioni contano di più.': 'The common odds ratio is a weighted average of the strata odds ratios: strata with more information count more.',
  'Nessuno strato ha un odds ratio calcolabile: controlla le celle e i totali.': 'None of the strata have a calculable odds ratio - check the cells and totals.',
  'Ogni strato deve essere una tabella 2×2 completa, con lo stesso significato delle righe e delle colonne in tutti gli strati.': 'Each stratum must be a complete 2x2 table, with the same meaning of rows and columns in all strata.',
  'L’odds ratio comune assume che l’associazione non cambi tra gli strati: se cambia, il valore pooled nasconde differenze importanti.': 'The common odds ratio assumes that the association does not change between strata: if it does, the pooled value hides important differences.',
  'Osservazioni indipendenti e categorie esaustive restano necessarie, come nel χ² semplice.': 'Independent observations and exhaustive categories remain necessary, as in simple χ².',
  'Con molte celle piccole l’approssimazione χ² è fragile: il p va letto con cautela.': 'With many small cells the χ² approximation is fragile: the p should be read with caution.',
  'Mantel–Haenszel aggiusta per uno o più strati categorici, non per covariate continue.': 'Mantel–Haenszel adjusts for one or more categorical strata, not continuous covariates.',
  'Con strati molto diversi tra loro il valore comune può non rappresentare nessuno strato in particolare.': 'With very different strata the common value may not represent any particular stratum.',
  'in aumento': 'increasing',
  'in diminuzione': 'decreasing',
  'non determinabile': 'not determinable',
  'Il trend non è calcolabile: servono almeno due righe con totali positivi e punteggi validi.': 'The trend cannot be calculated: at least two lines with positive totals and valid scores are needed.',
  'La proporzione mostra un trend significativo lungo i punteggi (z² = {s1}, p = {s2}).': 'The proportion shows a significant trend across the scores (z² = {s1}, p = {s2}).',
  'Nessuna evidenza di trend lungo i punteggi (z² = {s1}, p = {s2}).': 'No evidence of trend along scores (z² = {s1}, p = {s2}).',
  'Trend significativo': 'Significant trend',
  'Nessun trend rilevato': 'No trend detected',
  'Il test di Cochran–Armitage verifica se la proporzione di successi cambia in modo sistematico quando le righe della tabella hanno un ordine numerico.': 'The Cochran–Armitage test tests whether the proportion of successes changes systematically when the table rows have a numerical order.',
  'I punteggi stabiliscono la distanza tra le righe: non sono etichette, ma posizioni sulla scala che si vuole testare.': 'The scores establish the distance between the lines: they are not labels, but positions on the scale you want to test.',
  'La statistica z² vale {s1} con {s2} grado/i di libertà e {s3}.': 'The z² statistic is {s1} with {s2} degree(s) of freedom and {s3}.',
  'p non calcolabile': 'p not calculable',
  'Il trend è {s1} e supera la soglia α = {s2}: la proporzione cambia con il punteggio più di quanto il caso spieghi.': 'The trend is {s1} and exceeds the threshold α = {s2}: the proportion changes with the score more than chance explains.',
  'Il trend osservato è {s1}, ma non supera la soglia α = {s2}: non ci sono prove sufficienti di un andamento sistematico.': 'The observed trend is {s1}, but does not exceed the threshold α = {s2}: there is insufficient evidence of a systematic trend.',
  'Le proporzioni osservate': 'The observed proportions',
  'La tabella riporta, per ogni riga, successi, totale e proporzione. Il grafico lineare collega le proporzioni nell’ordine dei punteggi.': 'The table shows, for each row, successes, total and proportion. The line graph connects the proportions in the order of the scores.',
  '{s1} (punteggio {s2}): {s3} su {s4} = {s5}': '{s1} (score {s2}): {s3} out of {s4} = {s5}',
  'Nessuna proporzione calcolabile con i dati forniti.': 'No proportion calculable with the data provided.',
  'Le righe devono avere un ordine numerico plausibile: i punteggi non possono essere scelti dopo aver visto il risultato.': 'The rows must have a plausible numerical order: the scores cannot be chosen after seeing the result.',
  'Le osservazioni devono essere indipendenti e ogni riga deve avere un totale positivo.': 'The observations must be independent and each row must have a positive total.',
  'Il test rileva un trend lineare; un andamento a U può risultare non significativo anche se le proporzioni cambiano.': 'The test detects a linear trend; a U-shaped trend may not be significant even if the proportions change.',
  'Con totali piccoli l’approssimazione χ² è fragile: verifica le frequenze attese e valuta un test esatto.': 'With small totals the χ² approximation is fragile: check the expected frequencies and evaluate an exact test.',
  'Il trend non implica causalità: un punteggio associato alla proporzione può riflettere un altro fattore.': 'Trend does not imply causation: a proportion score may reflect another factor.',
  'Punteggi arbitrari cambiano la statistica: vanno giustificati prima dell’analisi.': 'Arbitrary scores change the statistics: they must be justified before analysis.',
  'Il p esatto non è calcolabile per questa tabella.': 'The exact p is not calculable for this table.',
  'Il test esatto rifiuta l’indipendenza (p = {s1}).': 'The exact test rejects independence (p = {s1}).',
  'Il test esatto non rifiuta l’indipendenza (p = {s1}).': 'The exact test does not reject independence (p = {s1}).',
  'Il test esatto calcola il p senza affidarsi all’approssimazione χ²: confronta la tabella osservata con tutte le tabelle che hanno gli stessi margini.': 'The exact test calculates p without relying on the χ² approximation: it compares the observed table with all tables that have the same margins.',
  'È la scelta naturale quando le celle sono piccole o quando la regola di Cochran non è rispettata.': 'It is the natural choice when cells are small or when Cochran\'s rule is not respected.',
  'Il metodo usato è “{s1}”. La statistica Σ|O − E| vale {s2} e il p esatto è {s3}: {s4}': 'The method used is “{s1}”. The statistic Σ|O − E| is {s2} and the exact p is {s3}: {s4}',
  'sotto la soglia α = {s1}, quindi l’ipotesi di indipendenza viene rifiutata.': 'below the threshold α = {s1}, then the independence hypothesis is rejected.',
  'sopra la soglia α = {s1}, quindi l’ipotesi di indipendenza non viene rifiutata.': 'above the threshold α = {s1}, therefore the independence hypothesis is not rejected.',
  'La tabella non permette il calcolo esatto: {s1}': 'The table does not allow the exact calculation: {s1}',
  'Il numero di tavole con questi margini supera il budget di enumerazione: il p è una stima Monte Carlo deterministica, non un valore esatto.': 'The number of tables with these margins exceeds the enumeration budget: the p is a deterministic Monte Carlo estimate, not an exact value.',
  'Per una tabella 2×2 il p è quello di Fisher a due code, che coincide con l’enumerazione esatta delle tavole con margini fissi.': 'For a 2×2 table the p is the two-tailed Fisher p, which coincides with the exact enumeration of tables with fixed margins.',
  'Come si legge il p esatto': 'How do you read the exact p',
  'Il p è la probabilità, sotto indipendenza e con i margini osservati, di ottenere una tabella almeno tanto estrema quanto quella osservata.': 'The p is the probability, under independence and with observed margins, of obtaining a table at least as extreme as the observed one.',
  'Non dipende dalla numerosità asintotica: resta valido anche con celle molto piccole, purché l’enumerazione o la simulazione siano affidabili.': 'It does not depend on the asymptotic numerousness: it remains valid even with very small cells, as long as the enumeration or simulation is reliable.',
  'Osservazioni indipendenti e categorie esaustive: ogni unità cade in una sola cella.': 'Independent observations and exhaustive categories: each unit falls into a single cell.',
  'I margini sono trattati come fissi; se il disegno non li fissa, il p esatto va interpretato come condizionale.': 'Margins are treated as fixed; if the design does not fix them, the exact p should be interpreted as conditional.',
  'Con molte categorie il numero di tavole cresce rapidamente: oltre il budget il risultato diventa una stima Monte Carlo.': 'With many categories the number of tables grows rapidly: beyond the budget the result becomes a Monte Carlo estimate.',
  'Il test esatto dice se c’è associazione, non quanto sia forte né in quale direzione: usa residui e misure di associazione.': 'The exact test says whether there is an association, not how strong it is or in which direction: it uses residuals and measures of association.',
  'Con tabelle molto grandi l’enumerazione è sostituita da una simulazione: riporta sempre il metodo usato.': 'With very large tables the enumeration is replaced by a simulation: it always reports the method used.',
};
