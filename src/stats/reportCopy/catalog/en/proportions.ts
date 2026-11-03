/** English prose of the proportions and rates reports. */
export const proportionsCopy: Record<string, string> = {
  'Asymptotic p':
    'Asymptotic p',
  'Con pochi successi o insuccessi l’approssimazione normale non è affidabile: leggi il p esatto e l’intervallo di Clopper–Pearson.':
    'With few successes or failures the normal approximation is unreliable: read the exact p and the Clopper–Pearson interval.',
  'Difference':
    'Difference',
  'Differenza tra proporzioni':
    'Difference between proportions',
  'Differenza tra {s1} e {s2}: {s3} ({s4}).':
    'Difference between {s1} and {s2}: {s3} ({s4}).',
  'Differenza {s1} (CI {s2}); χ² = {s3}, p = {s4}.':
    'Difference {s1} (CI {s2}); χ² = {s3}, p = {s4}.',
  'Events':
    'Events',
  'Exact CI high':
    'Exact CI high',
  'Exact CI low':
    'Exact CI low',
  'Exposure':
    'Exposure',
  'First group':
    'First group',
  'Gli eventi devono essere indipendenti e rari rispetto all’esposizione; con eventi molto frequenti la varianza supera la media.':
    'Events must be independent and rare relative to exposure; with very frequent events the variance exceeds the mean.',
  'I due gruppi devono essere indipendenti e i conteggi non devono essere correlati nel tempo.':
    'The two groups must be independent and the counts must not be correlated over time.',
  'I due gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.':
    'The two groups must be independent and the observations within each group independent.',
  'Il confronto tra due tassi condiziona sul numero totale di eventi: sotto l’ipotesi nulla i conteggi si distribuiscono come un binomiale.':
    'The comparison of two rates conditions on the total number of events: under the null the counts are binomial.',
  'Il p esatto somma le probabilità di Poisson degli esiti almeno così improbabili quanto quello osservato.':
    'The exact p sums the Poisson probabilities of outcomes at least as unlikely as the observed one.',
  'Il p esatto somma le probabilità di tutti gli esiti almeno così improbabili quanto quello osservato: è la definizione di binom.test.':
    'The exact p sums the probabilities of all outcomes at least as unlikely as the observed one: that is the binom.test definition.',
  'Il rapporto tra tassi è la misura naturale dell’effetto; 1 significa tassi uguali.':
    'The rate ratio is the natural effect measure; 1 means equal rates.',
  'Il rischio relativo è p₁/p₂; l’odds ratio è (x₁/(n₁−x₁))/(x₂/(n₂−x₂)).':
    'The risk ratio is p₁/p₂; the odds ratio is (x₁/(n₁−x₁))/(x₂/(n₂−x₂)).',
  'Il test condizionale esatto è lo stesso di poisson.test applicato a due gruppi.':
    'The exact conditional test is the same as poisson.test applied to two groups.',
  'Il test confronta due proporzioni indipendenti; la differenza è riportata nella scala originale (rischio assoluto).':
    'The test compares two independent proportions; the difference is reported on the original scale (absolute risk).',
  'Il test confronta la proporzione osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.':
    'The test compares the observed proportion with the null value; the interval shows how uncertain the estimate is.',
  'Il test z pooled è equivalente al χ² di Pearson senza correzione di continuità; con tavole 2×2 e celle piccole preferisci il test esatto di Fisher.':
    'The pooled z test is equivalent to Pearson χ² without continuity correction; with 2×2 tables and small cells prefer Fisher’s exact test.',
  'Intervallo di Wilson: {s1}; intervallo esatto: {s2}.':
    'Wilson interval: {s1}; exact interval: {s2}.',
  'Intervallo esatto: {s1}.':
    'Exact interval: {s1}.',
  'La differenza assoluta dipende dalla scala: riportala insieme agli indici relativi, non al posto loro.':
    'The absolute difference depends on the scale: report it together with the relative indices, not instead of them.',
  'Le osservazioni devono essere indipendenti: con misure ripetute o cluster la variabilità è sottostimata.':
    'Observations must be independent: with repeated measures or clusters the variability is underestimated.',
  'L’approssimazione normale è affidabile quando successes e insuccessi sono entrambi almeno 5.':
    'The normal approximation is reliable when successes and failures are both at least 5.',
  'L’esposizione va dichiarata: lo stesso numero di eventi su esposizioni diverse produce tassi diversi.':
    'Exposure must be declared: the same number of events over different exposure gives different rates.',
  'L’intervallo di Wilson è più stretto e stabile del Wald; quello di Clopper–Pearson garantisce la copertura nominale anche con pochi casi.':
    'The Wilson interval is narrower and more stable than Wald; the Clopper–Pearson interval guarantees nominal coverage even with few cases.',
  'L’intervallo trasforma l’intervallo esatto di Clopper–Pearson della proporzione condizionata.':
    'The interval transforms the exact Clopper–Pearson interval of the conditional proportion.',
  'L’intervallo usa la relazione con la χ² (Garwood): è lo stesso di poisson.test.':
    'The interval uses the χ² relation (Garwood): it is the same as poisson.test.',
  'L’intervallo è di Wald: con proporzioni vicine a 0 o 1 e gruppi piccoli tende a sottocoprire.':
    'The interval is Wald: with proportions near 0 or 1 and small groups it tends to under-cover.',
  'Null proportion':
    'Null proportion',
  'Null rate':
    'Null rate',
  'Odds ratio':
    'Odds ratio',
  'Primo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.':
    'First group: {s1} events over exposure {s2}, rate {s3}.',
  'Primo gruppo: {s1} su {s2} ({s3}); secondo gruppo: {s4} su {s5} ({s6}).':
    'First group: {s1} of {s2} ({s3}); second group: {s4} of {s5} ({s6}).',
  'Proportion':
    'Proportion',
  'Proporzione (un campione)':
    'Proportion (one sample)',
  'Proporzione di “{s1}” in {s2}: {s3} ({s4}).':
    'Proportion of “{s1}” in {s2}: {s3} ({s4}).',
  'Proporzioni (due campioni)':
    'Proportions (two samples)',
  'Rapporto tra i tassi di {s1}: {s2} ({s3}).':
    'Rate ratio for {s1}: {s2} ({s3}).',
  'Rapporto tra tassi':
    'Rate ratio',
  'Rapporto {s1} (CI {s2}); p esatto {s3}.':
    'Ratio {s1} (CI {s2}); exact p {s3}.',
  'Rate':
    'Rate',
  'Rate ratio':
    'Rate ratio',
  'Report di lettura — Due proporzioni':
    'Reading report — Two proportions',
  'Report di lettura — Due tassi di Poisson':
    'Reading report — Two Poisson rates',
  'Report di lettura — Proporzione':
    'Reading report — Proportion',
  'Report di lettura — Tasso di Poisson':
    'Reading report — Poisson rate',
  'Rischio relativo e odds ratio descrivono l’associazione, ma non sostituiscono la differenza assoluta: un RR grande può nascondere un effetto piccolo.':
    'Risk ratio and odds ratio describe the association, but do not replace the absolute difference: a large RR can hide a small effect.',
  'Rischio relativo {s1}; odds ratio {s2}.':
    'Risk ratio {s1}; odds ratio {s2}.',
  'Risk ratio':
    'Risk ratio',
  'Second group':
    'Second group',
  'Secondo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.':
    'Second group: {s1} events over exposure {s2}, rate {s3}.',
  'Sovradispersione e cluster violano l’assunzione di Poisson e rendono il p troppo piccolo.':
    'Overdispersion and clustering violate the Poisson assumption and make p too small.',
  'Successes':
    'Successes',
  'Tassi di Poisson (due campioni)':
    'Poisson rates (two samples)',
  'Tasso di Poisson (un campione)':
    'Poisson rate (one sample)',
  'Tasso di {s1}: {s2} per unità di esposizione ({s3}).':
    'Rate of {s1}: {s2} per unit of exposure ({s3}).',
  'Tasso nullo {s1}: p esatto {s2}.':
    'Null rate {s1}: exact p {s2}.',
  'Test condizionale esatto sul totale degli eventi; intervallo ottenuto trasformando l’intervallo esatto di Clopper–Pearson.':
    'Exact conditional test on the total events; interval obtained by transforming the exact Clopper–Pearson interval.',
  'Test z con varianza pooled (equivalente al χ² di Pearson senza correzione) e intervallo di Wald per la differenza.':
    'Pooled z test (equivalent to Pearson χ² without correction) and Wald interval for the difference.',
  'Trials':
    'Trials',
  'Un p grande non dimostra che la proporzione sia uguale al valore nullo: guarda l’intervallo.':
    'A large p does not prove the proportion equals the null value: look at the interval.',
  'Un rapporto di 1 non prova l’assenza di differenza: guarda l’intervallo.':
    'A ratio of 1 does not prove there is no difference: look at the interval.',
  'Un tasso di Poisson conta eventi per unità di esposizione: tempo, persone, lotti o righe.':
    'A Poisson rate counts events per unit of exposure: time, people, batches or rows.',
  'Valore nullo {s1}: p esatto {s2}, p asintotico {s3}.':
    'Null value {s1}: exact p {s2}, asymptotic p {s3}.',
  'p esatto da binom.test; intervallo di Wilson e intervallo esatto di Clopper–Pearson al {s1}%.':
    'Exact p from binom.test; Wilson interval and exact Clopper–Pearson interval at {s1}%.',
  'p esatto dalle code di Poisson; intervallo esatto basato sulla χ² (Garwood), come poisson.test.':
    'Exact p from the Poisson tails; exact interval based on χ² (Garwood), as in poisson.test.',
  '{s1} = “{s2}”':
    '{s1} = “{s2}”',
  '{s1} eventi su esposizione {s2}: tasso {s3}.':
    '{s1} events over exposure {s2}: rate {s3}.',
  '{s1} successi su {s2} osservazioni: proporzione {s3}.':
    '{s1} successes out of {s2} observations: proportion {s3}.',
};
