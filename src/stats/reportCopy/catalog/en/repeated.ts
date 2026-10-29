/** English prose of the repeated report and its tables. */
export const repeatedCopy: Record<string, string> = {
  'W di Kendall':
    'Kendall\'s W',
  'Le {s1} misure ripetute differiscono (p = {s2}).':
    'The {s1} repeated measures differ (p = {s2}).',
  'Non emergono differenze tra le misure ripetute (p = {s1}).':
    'No differences emerge between the repeated measures (p = {s1}).',
  'Differenza rilevata':
    'Difference detected',
  'Il test di Friedman è l’alternativa non parametrica all’ANOVA a misure ripetute: confronta k condizioni misurate sulle stesse unità usando i ranghi dentro ogni blocco (una riga = una unità).':
    'The Friedman test is the non-parametric alternative to repeated-measures ANOVA: it compares k conditions measured on the same units using the ranks within each block (one row = one unit).',
  'Non richiede normalità né varianze uguali; richiede invece blocchi completi e misure almeno ordinali.':
    'It requires neither normality nor equal variances; instead it requires complete blocks and at least ordinal measures.',
  'χ² di Friedman = {s1} con {s2}: {s3}':
    'Friedman χ² = {s1} with {s2}: {s3}',
  'χ² di Friedman':
    'Friedman χ²',
  'rifiuta l’ipotesi che tutte le condizioni siano equivalenti.':
    'it rejects the hypothesis that all conditions are equivalent.',
  'non rifiuta l’ipotesi di equivalenza.':
    'it does not reject the equivalence hypothesis.',
  'W di Kendall = {s1}: concordanza {s2} tra le condizioni.':
    'Kendall\'s W = {s1}: {s2} concordance between the conditions.',
  'Il post-hoc Nemenyi segnala {s1} al livello {s2}%: {s3}.':
    'The Nemenyi post-hoc flags {s1} at the {s2}% level: {s3}.',
  'nessun confronto significativo':
    'no significant comparison',
  '{s1} confronto significativo':
    '{s1} significant comparison',
  '{s1} confronti significativi':
    '{s1} significant comparisons',
  'Ogni riga deve contenere tutte le k misure: le righe incomplete vengono scartate.':
    'Each row must contain all k measures: incomplete rows are discarded.',
  'Il test usa i ranghi within-block: differenze sistematiche di livello tra blocchi non pesano.':
    'The test uses within-block ranks: systematic level differences between blocks carry no weight.',
  'Con pochi blocchi la potenza è bassa; con molti trattamenti Nemenyi diventa conservativo.':
    'With few blocks power is low; with many treatments Nemenyi becomes conservative.',
  'Il post-hoc Nemenyi assume blocchi bilanciati e usa l’approssimazione del range studentizzato con df infinito.':
    'The Nemenyi post-hoc assumes balanced blocks and uses the studentised range approximation with infinite df.',
  'Non sono gestiti disegni misti (between + within) né covariate.':
    'Mixed designs (between + within) and covariates are not handled.',
  'p esatto (binomiale)':
    'exact p (binomial)',
  'Le due misure cambiano in modo asimmetrico (p esatto = {s1}): {s2} risulta più spesso positiva.':
    'The two measures change asymmetrically (exact p = {s1}): {s2} comes out positive more often.',
  'Nessuna asimmetria nei cambiamenti tra {s1} e {s2} (p esatto = {s3}).':
    'No asymmetry in the changes between {s1} and {s2} (exact p = {s3}).',
  'Cambiamento asimmetrico':
    'Asymmetric change',
  'Nessuna asimmetria':
    'No asymmetry',
  'McNemar confronta due misure binarie rilevate sulle stesse unità e si concentra sulle coppie che cambiano (discordanti), ignorando quelle concordanti.':
    'McNemar compares two binary measures taken on the same units and focuses on the pairs that change (discordant), ignoring the concordant ones.',
  'È il test giusto per un disegno before/after su esito sì/no, non per due gruppi indipendenti.':
    'It is the right test for a before/after design on a yes/no outcome, not for two independent groups.',
  'Le coppie discordanti sono b = {s1} ({s2} = 1, {s3} = 0) e c = {s4} ({s5} = 1, {s6} = 0).':
    'The discordant pairs are b = {s1} ({s2} = 1, {s3} = 0) and c = {s4} ({s5} = 1, {s6} = 0).',
  'Il p esatto è {s1}: {s2}':
    'The exact p is {s1}: {s2}',
  'rifiuta l’ipotesi che i due esiti abbiano la stessa probabilità di cambiamento.':
    'it rejects the hypothesis that the two outcomes have the same probability of change.',
  'non rifiuta l’ipotesi di simmetria dei cambiamenti.':
    'it does not reject the symmetry of the changes.',
  'L’odds ratio b/c = {s1}: valori sopra 1 indicano che il passaggio 1 → 0 è più frequente del contrario.':
    'The odds ratio b/c = {s1}: values above 1 indicate that the 1 → 0 transition is more frequent than the reverse.',
  'Le due misure devono riferirsi alle stesse unità e allo stesso intervallo di tempo.':
    'The two measures must refer to the same units and the same time interval.',
  'Le coppie concordanti non entrano nel test: la numerosità che conta è b + c.':
    'Concordant pairs do not enter the test: the count that matters is b + c.',
  'Con pochi discordanti usare il p esatto; l’approssimazione χ² è solo indicativa.':
    'With few discordant pairs use the exact p; the χ² approximation is only indicative.',
  'Non gestisce covariati né più di due occasioni (per tre o più usare Cochran Q).':
    'It does not handle covariates or more than two occasions (for three or more use Cochran Q).',
  'L’odds ratio b/c può essere infinito quando c = 0.':
    'The odds ratio b/c can be infinite when c = 0.',
  'Le condizioni binarie differiscono (Q = {s1}, p = {s2}).':
    'The binary conditions differ (Q = {s1}, p = {s2}).',
  'Nessuna differenza tra le condizioni binarie (Q = {s1}, p = {s2}).':
    'No difference between the binary conditions (Q = {s1}, p = {s2}).',
  'Cochran Q è l’estensione di McNemar a tre o più condizioni binarie misurate sulle stesse unità: verifica se la probabilità di successo cambia tra le condizioni.':
    'Cochran Q is the extension of McNemar to three or more binary conditions measured on the same units: it checks whether the probability of success changes between conditions.',
  'Q = {s1} con {s2} e p = {s3}.':
    'Q = {s1} with {s2} and p = {s3}.',
  '{s1}':
    '{s1}',
  'Il test rifiuta l’ipotesi che tutte le condizioni abbiano la stessa probabilità di successo.':
    'The test rejects the hypothesis that all conditions have the same probability of success.',
  'Il test non rifiuta l’ipotesi di uguale probabilità di successo.':
    'The test does not reject the hypothesis of equal probability of success.',
  'La condizione con più successi è {s1} ({s2} su {s3}).':
    'The condition with the most successes is {s1} ({s2} out of {s3}).',
  'Le k misure devono essere binarie (0/1) e rilevate sulle stesse unità.':
    'The k measures must be binary (0/1) and taken on the same units.',
  'Le righe incomplete vengono scartate: riporta quanti blocchi restano.':
    'Incomplete rows are discarded: report how many blocks remain.',
  'Con poche unità l’approssimazione χ² è ottimistica; valuta test esatti o simulazioni.':
    'With few units the χ² approximation is optimistic; consider exact tests or simulations.',
  'Se Q è significativo, individua le coppie con McNemar correggendo per i confronti multipli.':
    'If Q is significant, identify the pairs with McNemar correcting for multiple comparisons.',
  'Non produce un post-hoc corretto automaticamente: per le coppie usare McNemar con aggiustamento.':
    'It does not produce a corrected post-hoc automatically: for the pairs use McNemar with adjustment.',
  'Non gestisce disegni con misure mancanti parziali (listwise deletion).':
    'It does not handle designs with partially missing measures (listwise deletion).',
  'p (due code)':
    'p (two-sided)',
  'r = z/√N':
    'r = z/√N',
  'Trend {s1} lungo l’ordine dei gruppi (z = {s2}, p = {s3}).':
    '{s1} trend along the group order (z = {s2}, p = {s3}).',
  'Nessuna tendenza monotonica lungo l’ordine dei gruppi (z = {s1}, p = {s2}).':
    'No monotonic trend along the group order (z = {s1}, p = {s2}).',
  'Trend {s1}':
    '{s1} trend',
  'Nessun trend':
    'No trend',
  'Il test di Jonckheere–Terpstra verifica un’ipotesi di trend tra gruppi ordinati, usando l’ordine delle colonne selezionate: è più potente di Kruskal–Wallis quando l’alternativa è monotònica.':
    'The Jonckheere–Terpstra test checks a trend hypothesis between ordered groups, using the order of the selected columns: it is more powerful than Kruskal–Wallis when the alternative is monotonic.',
  'L’ordine inserito è {s1}.':
    'The order entered is {s1}.',
  'U = {s1} contro un atteso di {s2} sotto H₀.':
    'U = {s1} against an expected {s2} under H₀.',
  'I valori tendono a {s1} passando da {s2} a {s3}.':
    'The values tend to {s1} going from {s2} to {s3}.',
  'La successione dei gruppi non mostra un andamento monotònico convincente.':
    'The sequence of groups does not show a convincing monotonic pattern.',
  'Dimensione dell’effetto r = {s1} (0,1 piccolo, 0,3 medio, 0,5 grande).':
    'Effect size r = {s1} (0.1 small, 0.3 medium, 0.5 large).',
  'I gruppi devono essere ordinati prima di eseguire il test: l’ordine non può essere scelto guardando i risultati.':
    'The groups must be ordered before running the test: the order cannot be chosen by looking at the results.',
  'Le osservazioni devono essere indipendenti tra loro e almeno ordinali.':
    'The observations must be independent of one another and at least ordinal.',
  'Il test rileva un trend, non quale coppia differisca: per i confronti puntuali servono post-hoc dedicati.':
    'The test detects a trend, not which pair differs: dedicated post-hoc tests are needed for point comparisons.',
  'Approssimazione normale: con gruppi molto piccoli il p può essere impreciso.':
    'Normal approximation: with very small groups the p can be imprecise.',
  'Non gestisce blocchi o misure ripetute: per quelle usare Friedman.':
    'It does not handle blocks or repeated measures: for those use Friedman.',
  'Test di Friedman':
    'Friedman test',
  '{s1} misure ripetute · {s2} blocchi':
    '{s1} repeated measures · {s2} blocks',
  'approssimazione χ²':
    'χ² approximation',
  '0 = nessuna concordanza, 1 = concordanza perfetta':
    '0 = no concordance, 1 = perfect concordance',
  'Correzione per i ranghi uguali':
    'Correction for tied ranks',
  'fattore applicato alla statistica':
    'factor applied to the statistic',
  'H₀: le k misure provengono dalla stessa distribuzione (nessuna differenza tra trattamenti).':
    'H₀: the k measures come from the same distribution (no difference between treatments).',
  'Blocchi incompleti o valori non numerici vengono esclusi prima del test.':
    'Incomplete blocks or non-numeric values are excluded before the test.',
  'Ranghi medi per trattamento':
    'Mean ranks by treatment',
  'Trattamento':
    'Treatment',
  'Rango medio':
    'Mean rank',
  'Somma ranghi':
    'Rank sum',
  'Ranghi medi più bassi indicano valori più bassi nel confronto within-subject.':
    'Lower mean ranks indicate lower values in the within-subject comparison.',
  'Post-hoc Nemenyi':
    'Nemenyi post-hoc',
  'CI {s1}% · differenza critica {s2}':
    'CI {s1}% · critical difference {s2}',
  'Δ ranghi medi':
    'Δ mean ranks',
  'q':
    'q',
  'Significativo':
    'Significant',
  'SE = {s1} · q critico = {s2} (studentized range, df ∞).':
    'SE = {s1} · critical q = {s2} (studentised range, df ∞).',
  'Nemenyi confronta tutte le coppie controllando il family-wise error; con molti trattamenti è conservativo.':
    'Nemenyi compares all pairs controlling the family-wise error; with many treatments it is conservative.',
  'Tabella dei cambiamenti':
    'Table of changes',
  'Combinazione':
    'Combination',
  'Entrambi 1 ({s1}=1, {s2}=1)':
    'Both 1 ({s1}=1, {s2}=1)',
  'Solo {s1} = 1':
    'Only {s1} = 1',
  'Entrambi 0':
    'Both 0',
  'Solo le coppie discordanti (b e c) contribuiscono al test.':
    'Only the discordant pairs (b and c) contribute to the test.',
  'Test di McNemar':
    'McNemar test',
  'coppie discordanti = {s1} · CI {s2}%':
    'discordant pairs = {s1} · CI {s2}%',
  'b (1 → 0)':
    'b (1 → 0)',
  ' positivo, ':
    ' positive, ',
  ' negativo':
    ' negative',
  'c (0 → 1)':
    'c (0 → 1)',
  ' negativo, ':
    ' negative, ',
  ' positivo':
    ' positive',
  'b+c prove con p = 0,5':
    'b+c trials with p = 0.5',
  'χ² con correzione di Yates':
    'χ² with Yates correction',
  'approssimazione χ² (1 df)':
    'χ² approximation (1 df)',
  'p asintotico':
    'asymptotic p',
  'usare l’esatto con pochi discordanti':
    'use the exact one with few discordant pairs',
  'Odds ratio (b/c)':
    'Odds ratio (b/c)',
  '> 1 favorisce ':
    '> 1 favours ',
  'Con b+c < 25 l’approssimazione χ² è inaffidabile: fare riferimento al p esatto.':
    'With b+c < 25 the χ² approximation is unreliable: refer to the exact p.',
  'Test Q di Cochran':
    'Cochran Q test',
  '{s1} condizioni binarie · {s2} blocchi · CI {s3}%':
    '{s1} binary conditions · {s2} blocks · CI {s3}%',
  'Q di Cochran':
    'Cochran Q',
  'H₀: la probabilità di successo è la stessa nelle k condizioni ripetute.':
    'H₀: the probability of success is the same across the k repeated conditions.',
  'Le righe con valori mancanti o diversi da 0/1 vengono escluse.':
    'Rows with missing values or values other than 0/1 are excluded.',
  'Successi per condizione':
    'Successes by condition',
  'Condizione':
    'Condition',
  'Successi':
    'Successes',
  'Proporzione':
    'Proportion',
  'Proporzioni descrittive: il test Q valuta se le differenze sono compatibili con il caso.':
    'Descriptive proportions: the Q test assesses whether the differences are compatible with chance.',
  'Test di Jonckheere–Terpstra':
    'Jonckheere–Terpstra test',
  '{s1} gruppi ordinati · N = {s2} · CI {s3}%':
    '{s1} ordered groups · N = {s2} · CI {s3}%',
  'U di Jonckheere–Terpstra':
    'Jonckheere–Terpstra U',
  'somma delle coppie ordinate tra gruppi':
    'sum of the ordered pairs between groups',
  'E[U]':
    'E[U]',
  'valore atteso sotto H₀':
    'expected value under H₀',
  'approssimazione normale':
    'normal approximation',
  'trend monotonico in una direzione':
    'monotonic trend in one direction',
  'dimensione dell’effetto':
    'effect size',
  'H₀: nessuna tendenza monotonica tra i gruppi ordinati; H₁: i valori crescono (o decrescono) con l’ordine dei gruppi.':
    'H₀: no monotonic trend between the ordered groups; H₁: the values grow (or fall) with the order of the groups.',
  'I gruppi devono essere inseriti in ordine crescente: l’ordine delle colonne definisce l’ipotesi alternativa.':
    'The groups must be entered in increasing order: the column order defines the alternative hypothesis.',
  'Mediana':
    'Median',
};
