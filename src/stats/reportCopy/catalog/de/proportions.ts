/** German prose of the proportions and rates reports. */
export const proportionsCopy: Record<string, string> = {
  'Asymptotic p':
    'Asymptotisches p',
  'Con pochi successi o insuccessi l’approssimazione normale non è affidabile: leggi il p esatto e l’intervallo di Clopper–Pearson.':
    'Bei wenigen Erfolgen oder Misserfolgen ist die Normalapproximation unzuverlässig: Lies das exakte p und das Clopper–Pearson-Intervall.',
  'Difference':
    'Differenz',
  'Differenza tra proporzioni':
    'Differenz zwischen Anteilen',
  'Differenza tra {s1} e {s2}: {s3} ({s4}).':
    'Differenz zwischen {s1} und {s2}: {s3} ({s4}).',
  'Differenza {s1} (CI {s2}); χ² = {s3}, p = {s4}.':
    'Differenz {s1} (KI {s2}); χ² = {s3}, p = {s4}.',
  'Events':
    'Ereignisse',
  'Exact CI high':
    'Exakte obere Grenze',
  'Exact CI low':
    'Exakte untere Grenze',
  'Exposure':
    'Exposition',
  'First group':
    'Erste Gruppe',
  'Gli eventi devono essere indipendenti e rari rispetto all’esposizione; con eventi molto frequenti la varianza supera la media.':
    'Ereignisse müssen unabhängig und relativ zur Exposition selten sein; bei sehr häufigen Ereignissen übersteigt die Varianz den Mittelwert.',
  'I due gruppi devono essere indipendenti e i conteggi non devono essere correlati nel tempo.':
    'Die beiden Gruppen müssen unabhängig sein und die Zählungen dürfen nicht zeitlich korreliert sein.',
  'I due gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.':
    'Die beiden Gruppen müssen unabhängig sein und die Beobachtungen innerhalb jeder Gruppe ebenfalls.',
  'Il confronto tra due tassi condiziona sul numero totale di eventi: sotto l’ipotesi nulla i conteggi si distribuiscono come un binomiale.':
    'Der Vergleich zweier Raten bedingt auf die Gesamtzahl der Ereignisse: Unter der Nullhypothese sind die Zählungen binomialverteilt.',
  'Il p esatto somma le probabilità di Poisson degli esiti almeno così improbabili quanto quello osservato.':
    'Das exakte p summiert die Poisson-Wahrscheinlichkeiten der Ergebnisse, die mindestens so unwahrscheinlich sind wie das beobachtete.',
  'Il p esatto somma le probabilità di tutti gli esiti almeno così improbabili quanto quello osservato: è la definizione di binom.test.':
    'Das exakte p summiert die Wahrscheinlichkeiten aller Ergebnisse, die mindestens so unwahrscheinlich sind wie das beobachtete: Das ist die Definition von binom.test.',
  'Il rapporto tra tassi è la misura naturale dell’effetto; 1 significa tassi uguali.':
    'Das Ratenverhältnis ist das natürliche Effektmaß; 1 bedeutet gleiche Raten.',
  'Il rischio relativo è p₁/p₂; l’odds ratio è (x₁/(n₁−x₁))/(x₂/(n₂−x₂)).':
    'Das relative Risiko ist p₁/p₂; das Odds Ratio ist (x₁/(n₁−x₁))/(x₂/(n₂−x₂)).',
  'Il test condizionale esatto è lo stesso di poisson.test applicato a due gruppi.':
    'Der exakte bedingte Test entspricht poisson.test für zwei Gruppen.',
  'Il test confronta due proporzioni indipendenti; la differenza è riportata nella scala originale (rischio assoluto).':
    'Der Test vergleicht zwei unabhängige Anteile; die Differenz wird auf der ursprünglichen Skala angegeben (absolutes Risiko).',
  'Il test confronta la proporzione osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.':
    'Der Test vergleicht den beobachteten Anteil mit dem Nullwert; das Intervall zeigt die Unsicherheit der Schätzung.',
  'Il test z pooled è equivalente al χ² di Pearson senza correzione di continuità; con tavole 2×2 e celle piccole preferisci il test esatto di Fisher.':
    'Der gepoolte z-Test entspricht dem Pearson-χ² ohne Stetigkeitskorrektur; bei 2×2-Tafeln mit kleinen Zellen ist Fishers exakter Test vorzuziehen.',
  'Intervallo di Wilson: {s1}; intervallo esatto: {s2}.':
    'Wilson-Intervall: {s1}; exaktes Intervall: {s2}.',
  'Intervallo esatto: {s1}.':
    'Exaktes Intervall: {s1}.',
  'La differenza assoluta dipende dalla scala: riportala insieme agli indici relativi, non al posto loro.':
    'Die absolute Differenz hängt von der Skala ab: Berichte sie zusammen mit den relativen Maßen, nicht an deren Stelle.',
  'Le osservazioni devono essere indipendenti: con misure ripetute o cluster la variabilità è sottostimata.':
    'Die Beobachtungen müssen unabhängig sein: Bei Wiederholungsmessungen oder Clustern wird die Streuung unterschätzt.',
  'L’approssimazione normale è affidabile quando successes e insuccessi sono entrambi almeno 5.':
    'Die Normalapproximation ist zuverlässig, wenn Erfolge und Misserfolge beide mindestens 5 sind.',
  'L’esposizione va dichiarata: lo stesso numero di eventi su esposizioni diverse produce tassi diversi.':
    'Die Exposition muss angegeben werden: Dieselbe Ereigniszahl bei unterschiedlicher Exposition ergibt unterschiedliche Raten.',
  'L’intervallo di Wilson è più stretto e stabile del Wald; quello di Clopper–Pearson garantisce la copertura nominale anche con pochi casi.':
    'Das Wilson-Intervall ist schmaler und stabiler als das Wald-Intervall; Clopper–Pearson garantiert die nominale Abdeckung auch bei wenigen Fällen.',
  'L’intervallo trasforma l’intervallo esatto di Clopper–Pearson della proporzione condizionata.':
    'Das Intervall transformiert das exakte Clopper–Pearson-Intervall des bedingten Anteils.',
  'L’intervallo usa la relazione con la χ² (Garwood): è lo stesso di poisson.test.':
    'Das Intervall nutzt die χ²-Beziehung (Garwood): Es entspricht poisson.test.',
  'L’intervallo è di Wald: con proporzioni vicine a 0 o 1 e gruppi piccoli tende a sottocoprire.':
    'Das Intervall ist ein Wald-Intervall: Bei Anteilen nahe 0 oder 1 und kleinen Gruppen deckt es zu wenig ab.',
  'Null proportion':
    'Nullanteil',
  'Null rate':
    'Nullrate',
  'Odds ratio':
    'Odds Ratio',
  'Primo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.':
    'Erste Gruppe: {s1} Ereignisse bei Exposition {s2}, Rate {s3}.',
  'Primo gruppo: {s1} su {s2} ({s3}); secondo gruppo: {s4} su {s5} ({s6}).':
    'Erste Gruppe: {s1} von {s2} ({s3}); zweite Gruppe: {s4} von {s5} ({s6}).',
  'Proportion':
    'Anteil',
  'Proporzione (un campione)':
    'Anteil (eine Stichprobe)',
  'Proporzione di “{s1}” in {s2}: {s3} ({s4}).':
    'Anteil von „{s1}“ in {s2}: {s3} ({s4}).',
  'Proporzioni (due campioni)':
    'Anteile (zwei Stichproben)',
  'Rapporto tra i tassi di {s1}: {s2} ({s3}).':
    'Ratenverhältnis für {s1}: {s2} ({s3}).',
  'Rapporto tra tassi':
    'Ratenverhältnis',
  'Rapporto {s1} (CI {s2}); p esatto {s3}.':
    'Verhältnis {s1} (KI {s2}); exaktes p {s3}.',
  'Rate':
    'Rate',
  'Rate ratio':
    'Ratenverhältnis',
  'Report di lettura — Due proporzioni':
    'Lesebeitrag — Zwei Anteile',
  'Report di lettura — Due tassi di Poisson':
    'Lesebeitrag — Zwei Poisson-Raten',
  'Report di lettura — Proporzione':
    'Lesebeitrag — Anteil',
  'Report di lettura — Tasso di Poisson':
    'Lesebeitrag — Poisson-Rate',
  'Rischio relativo e odds ratio descrivono l’associazione, ma non sostituiscono la differenza assoluta: un RR grande può nascondere un effetto piccolo.':
    'Relatives Risiko und Odds Ratio beschreiben die Assoziation, ersetzen aber nicht die absolute Differenz: Ein großes RR kann einen kleinen Effekt verbergen.',
  'Rischio relativo {s1}; odds ratio {s2}.':
    'Relatives Risiko {s1}; Odds Ratio {s2}.',
  'Risk ratio':
    'Relatives Risiko',
  'Second group':
    'Zweite Gruppe',
  'Secondo gruppo: {s1} eventi su esposizione {s2}, tasso {s3}.':
    'Zweite Gruppe: {s1} Ereignisse bei Exposition {s2}, Rate {s3}.',
  'Sovradispersione e cluster violano l’assunzione di Poisson e rendono il p troppo piccolo.':
    'Überdispersion und Cluster verletzen die Poisson-Annahme und machen p zu klein.',
  'Successes':
    'Erfolge',
  'Tassi di Poisson (due campioni)':
    'Poisson-Raten (zwei Stichproben)',
  'Tasso di Poisson (un campione)':
    'Poisson-Rate (eine Stichprobe)',
  'Tasso di {s1}: {s2} per unità di esposizione ({s3}).':
    'Rate von {s1}: {s2} je Expositionseinheit ({s3}).',
  'Tasso nullo {s1}: p esatto {s2}.':
    'Nullrate {s1}: exaktes p {s2}.',
  'Test condizionale esatto sul totale degli eventi; intervallo ottenuto trasformando l’intervallo esatto di Clopper–Pearson.':
    'Exakter bedingter Test auf die Gesamtzahl der Ereignisse; Intervall durch Transformation des exakten Clopper–Pearson-Intervalls.',
  'Test z con varianza pooled (equivalente al χ² di Pearson senza correzione) e intervallo di Wald per la differenza.':
    'Gepoolter z-Test (äquivalent zum Pearson-χ² ohne Korrektur) und Wald-Intervall für die Differenz.',
  'Trials':
    'Versuche',
  'Un p grande non dimostra che la proporzione sia uguale al valore nullo: guarda l’intervallo.':
    'Ein großes p beweist nicht, dass der Anteil dem Nullwert entspricht: Betrachte das Intervall.',
  'Un rapporto di 1 non prova l’assenza di differenza: guarda l’intervallo.':
    'Ein Verhältnis von 1 beweist nicht, dass kein Unterschied besteht: Betrachte das Intervall.',
  'Un tasso di Poisson conta eventi per unità di esposizione: tempo, persone, lotti o righe.':
    'Eine Poisson-Rate zählt Ereignisse je Expositionseinheit: Zeit, Personen, Lose oder Zeilen.',
  'Valore nullo {s1}: p esatto {s2}, p asintotico {s3}.':
    'Nullwert {s1}: exaktes p {s2}, asymptotisches p {s3}.',
  'p esatto da binom.test; intervallo di Wilson e intervallo esatto di Clopper–Pearson al {s1}%.':
    'Exaktes p aus binom.test; Wilson-Intervall und exaktes Clopper–Pearson-Intervall zu {s1} %.',
  'p esatto dalle code di Poisson; intervallo esatto basato sulla χ² (Garwood), come poisson.test.':
    'Exaktes p aus den Poisson-Schwänzen; exaktes Intervall über χ² (Garwood), wie poisson.test.',
  '{s1} = “{s2}”':
    '{s1} = „{s2}“',
  '{s1} eventi su esposizione {s2}: tasso {s3}.':
    '{s1} Ereignisse bei Exposition {s2}: Rate {s3}.',
  '{s1} successi su {s2} osservazioni: proporzione {s3}.':
    '{s1} Erfolge von {s2} Beobachtungen: Anteil {s3}.',
};
