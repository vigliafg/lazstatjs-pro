/** English prose of the wizard report and its tables. */
export const wizardCopy: Record<string, string> = {
  'Report di lettura — Statistical Wizard':
    'Reading report — Statistical Wizard',
  'La domanda scelta è «{s1}»: il wizard legge la struttura del foglio e propone l’analisi adatta, con l’alternativa da usare se le assunzioni non reggono.':
    'The question chosen is «{s1}»: the wizard reads the structure of the sheet and proposes the suitable analysis, with the alternative to use if the assumptions do not hold.',
  'Raccomandazione: {s1}. Il wizard non ricalcola i test: apre la scheda giusta, dove la stessa analisi è già implementata e testata.':
    'Recommendation: {s1}. The wizard does not recompute the tests: it opens the right sheet, where the same analysis is already implemented and tested.',
  'Perché questa analisi':
    'Why this analysis',
  'Cosa selezionare':
    'What to select',
  'Controlli e alternative':
    'Checks and alternatives',
  'Nessun controllo automatico disponibile: verifica le assunzioni nella scheda.':
    'No automatic check available: verify the assumptions in the sheet.',
  'Alternativa: {s1}':
    'Alternative: {s1}',
  'Stato del foglio':
    'Sheet status',
  'Colonne lette: {s1}{s2}.':
    'Columns read: {s1}{s2}.',
  ', di cui {s1} con valori mancanti':
    ', of which {s1} with missing values',
  ', nessuna con valori mancanti':
    ', none with missing values',
  'Soglia di significatività usata nei controlli: α = {s1} (livello {s2}%).':
    'Significance threshold used in the checks: α = {s1} ({s2}% level).',
  'Le colonne con pochi livelli vengono trattate come categoriche, quelle quasi tutte numeriche come continue.':
    'Columns with few levels are treated as categorical, those that are almost all numeric as continuous.',
  'Il wizard è un consulente: la raccomandazione dipende da come hai descritto la domanda e dalla classificazione automatica delle colonne.':
    'The wizard is an adviser: the recommendation depends on how you described the question and on the automatic classification of the columns.',
  'I test di normalità e di omoschedasticità sono di screening e non sostituiscono l’esame grafico delle distribuzioni.':
    'The normality and homoscedasticity tests are screening tools and do not replace a graphical examination of the distributions.',
  'Il wizard non esegue il test né precompila i campi: apre la scheda dell’analisi, dove scegli le colonne e premi Run.':
    'The wizard does not run the test or prefill the fields: it opens the analysis sheet, where you choose the columns and press Run.',
  'Nessun controllo automatico su disegno dello studio, indipendenza delle osservazioni o dati mancanti non casuali.':
    'No automatic check on study design, independence of observations or non-random missing data.',
  'Audit delle colonne':
    'Column audit',
  '{s1} colonne · classificazione automatica':
    '{s1} columns · automatic classification',
  'Colonna':
    'Column',
  'Tipo':
    'Type',
  'Livelli':
    'Levels',
  'Normalità p':
    'Normality p',
  'Tipo numerico: almeno il 95% dei valori non vuoti è numerico. Binaria: due soli livelli.':
    'Numeric type: at least 95% of the non-empty values are numeric. Binary: only two levels.',
  'Il p di normalità è il test di Lilliefors (α = {s1}): con pochi dati ha poca potenza, con molti è iper-sensibile.':
    'The normality p is the Lilliefors test (α = {s1}): with little data it has low power, with lots it is over-sensitive.',
  'Esito per gruppo':
    'Outcome by group',
  'Le medie descrivono i gruppi; il test scelto dal wizard confronta medie o ranghi a seconda delle assunzioni.':
    'The means describe the groups; the test chosen by the wizard compares means or ranks depending on the assumptions.',
  'Levene (uguaglianza delle varianze)':
    'Levene (equality of variances)',
  'varianze diverse: Welch o test dei ranghi':
    'different variances: Welch or rank test',
  'Normalità di {s1}':
    'Normality of {s1}',
  'normalità rifiutata':
    'normality rejected',
  'compatibile con la gaussiana':
    'compatible with the Gaussian',
  'Normalità delle differenze appaiate':
    'Normality of the paired differences',
  'differenze non gaussiane':
    'non-Gaussian differences',
  'differenze compatibili con la gaussiana':
    'differences compatible with the Gaussian',
  'Controlli sulle assunzioni':
    'Assumption checks',
  '{s1} gruppi':
    '{s1} groups',
  'nessun gruppo selezionato':
    'no group selected',
  'I controlli sono di screening: con pochi dati i test di normalità hanno poca potenza, con molti sono iper-sensibili.':
    'The checks are screening: with little data the normality tests have low power, with lots they are over-sensitive.',
  'Percorso consigliato':
    'Recommended path',
  'Cosa fare':
    'What to do',
  'Apri {s1} e premi Run Analysis.':
    'Open {s1} and press Run Analysis.',
};
