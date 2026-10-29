/** English prose of the samplesize report and its tables. */
export const samplesizeCopy: Record<string, string> = {
  'n per gruppo':
    'n per group',
  'N totale':
    'Total N',
  'Potenza raggiunta':
    'Achieved power',
  'Potenza target':
    'Target power',
  'Piano {s1}: servono {s2} osservazioni per gruppo (N = {s3}) per una potenza dell’{s4}.':
    'Design {s1}: {s2} observations per group (N = {s3}) are needed for {s4} power.',
  'Piano di campionamento':
    'Sampling design',
  'Questo foglio non analizza dati: calcola quante osservazioni servono perché un test abbia una buona probabilità di trovare l’effetto che ti interessa.':
    'This sheet does not analyse data: it computes how many observations are needed for a test to have a good chance of finding the effect you care about.',
  'La potenza è la probabilità di rifiutare l’ipotesi nulla quando è falsa. Hai chiesto {s1}; con {s2} osservazioni per gruppo il calcolo ne garantisce {s3}. L’α scelto è {s4}: la probabilità di un falso positivo.':
    'Power is the probability of rejecting the null hypothesis when it is false. You asked for {s1}; with {s2} observations per group the calculation guarantees {s3}. The chosen α is {s4}: the probability of a false positive.',
  'Come si legge il risultato':
    'How to read the result',
  'n per gruppo = {s1}: è il numero minimo di osservazioni valide in ciascun gruppo, non il numero di righe da inserire (le mancanti vanno sostituite).':
    'n per group = {s1}: it is the minimum number of valid observations in each group, not the number of rows to enter (missing ones must be replaced).',
  'N totale = {s1}: include tutti i gruppi del disegno.':
    'Total N = {s1}: it includes all the groups of the design.',
  'Effect size = {s1}: è la differenza espressa in unità di variabilità (o la dimensione dell’effetto del disegno). Più è piccolo, più osservazioni servono.':
    'Effect size = {s1}: it is the difference expressed in units of variability (or the effect size of the design). The smaller it is, the more observations are needed.',
  'La curva di potenza mostra quanto si guadagna aumentando n: se il punto richiesto è già sulla parte piatta, aumentare il campione serve a poco.':
    'The power curve shows how much is gained by increasing n: if the required point is already on the flat part, increasing the sample helps little.',
  'Da dove viene il numero':
    'Where the number comes from',
  'La numerosità si ottiene imponendo che, sotto l’ipotesi alternativa, la statistica superi il valore critico con probabilità pari alla potenza scelta. Per i test t il calcolo viene iterato perché il valore critico dipende dai gradi di libertà, che dipendono da n.':
    'The sample size is obtained by requiring that, under the alternative hypothesis, the statistic exceeds the critical value with probability equal to the chosen power. For t-tests the calculation is iterated because the critical value depends on the degrees of freedom, which depend on n.',
  'La formula assume un effetto noto e una variabilità nota: se l’effect size viene da uno studio pilota, la numerosità è esso stesso una stima e va trattata con margine.':
    'The formula assumes a known effect and known variability: if the effect size comes from a pilot study, the sample size is itself an estimate and should be treated with margin.',
  'Cosa controllare prima di usarlo':
    'What to check before using it',
  'Il disegno deve essere quello giusto: due gruppi indipendenti, appaiati o una sola media non sono intercambiabili.':
    'The design must be the right one: two independent groups, paired, or a single mean are not interchangeable.',
  'Se prevedi abbandoni, aumenta n dividendo per (1 − tasso di abbandono).':
    'If you expect dropouts, increase n by dividing by (1 − dropout rate).',
  'Con più confronti o più esiti la potenza per singolo test non basta: correggi α o pianifica l’esito primario.':
    'With multiple comparisons or multiple outcomes the power for a single test is not enough: correct α or plan the primary outcome.',
  'Per differenze molto piccole la numerosità esplode: valuta se l’effetto è clinicamente rilevante prima di inseguirlo.':
    'For very small differences the sample size explodes: consider whether the effect is clinically relevant before chasing it.',
  'Le formule per i test t usano l’approssimazione normale per la potenza: il valore è accurato entro circa un’unità rispetto al calcolo esatto non centrale.':
    'The formulas for t-tests use the normal approximation for power: the value is accurate to about one unit compared with the exact non-central calculation.',
  'Per l’ANOVA la potenza usa la F non centrale esatta: il numero può differire di un’unità da software che arrotondano diversamente le iterazioni.':
    'For ANOVA the power uses the exact non-central F: the number can differ by one unit from software that rounds the iterations differently.',
  'Due medie indipendenti':
    'Two independent means',
  'Una media':
    'One mean',
  'Due medie appaiate':
    'Two paired means',
  'Due proporzioni':
    'Two proportions',
  'TOST (equivalenza)':
    'TOST (equivalence)',
  'Sopravvivenza (log-rank)':
    'Survival (log-rank)',
  'Differenza attesa':
    'Expected difference',
  'Margine di equivalenza':
    'Equivalence margin',
  'Hazard ratio':
    'Hazard ratio',
  'Tasso di eventi':
    'Event rate',
  'Differenza da rilevare':
    'Difference to detect',
  'SD (dei differenziali se appaiato)':
    'SD (of the differences if paired)',
  'Proporzione gruppo 1':
    'Proportion group 1',
  'Proporzione gruppo 2':
    'Proportion group 2',
  'r da rilevare':
    'r to detect',
  'Numero di gruppi':
    'Number of groups',
  'Parametri del piano':
    'Design parameters',
  'Numerosità richiesta':
    'Required sample size',
  'n per un margine di errore richiesto':
    'n for a required margin of error',
  'Il calcolo è iterativo: la numerosità viene aumentata finché la potenza raggiunge quella richiesta.':
    'The calculation is iterative: the sample size is increased until power reaches the required value.',
  'La potenza riportata è quella approssimata del disegno, non il target: arrotondando a n intero può superarlo di poco.':
    'The reported power is the approximate power of the design, not the target: rounding to a whole n can exceed it slightly.',
  'Potenza al variare di n':
    'Power as n varies',
  'per gruppo':
    'per group',
  'n':
    'n',
  'Potenza':
    'Power',
  'La curva si appiattisce: oltre il punto calcolato ogni osservazione in più compra sempre meno potenza.':
    'The curve flattens out: beyond the computed point every extra observation buys less and less power.',
};
