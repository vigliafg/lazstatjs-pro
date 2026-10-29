/** de: report and table prose (normalised). */
export const anovaCopy: Record<string, string> = {
  ', Brown–Forsythe {s1}': ', Brown–Forsythe {s1}',
  ', η² = {s1} (effetto {s2})': ', η² = {s1} (Effekt: {s2})',
  '; Cohen’s d = {s1} ({s2})': '; Cohen’s d = {s1} ({s2})',
  '{s1} (soglia α = {s2}).': '{s1} (Schwelle α = {s2}).',
  '{s1} per {s2} · CI {s3}%': '{s1} pro {s2} · CI {s3} %',
  '{s1} vs {s2}': '{s1} vs. {s2}',
  '{s1}: differenza {s2}, {s3} → {s4}{s5}.':
    '{s1}: Differenz {s2}, {s3} → {s4}{s5}.',
  '{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.':
    '{s1}: n = {s2}, Mittelwert {s3} (CI {s4} % {s5}), Median {s6}, SD {s7}.',
  'Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.':
    'Mindestens ein Gruppenmittelwert weicht von den anderen ab: Die Nullhypothese gleicher Mittelwerte wird verworfen.',
  'alternativa con varianze diseguali': 'Alternative bei ungleichen Varianzen',
  'Alternativa non parametrica': 'Nicht parametrische Alternative',
  'ANOVA a una via': 'Einfaktorielle ANOVA',
  'assunzione di varianze uguali plausibile':
    'Annahme gleicher Varianzen plausibel',
  Assunzioni: 'Annahmen',
  'Assunzioni e robustezza': 'Annahmen und Robustheit',
  'Between (gruppi)': 'Zwischen (Gruppen)',
  'Brown–Forsythe (mediana)': 'Brown–Forsythe (Median)',
  'CI della media entro gruppo: t di Student con df = n_gruppo − 1.':
    'CI des Mittelwerts innerhalb der Gruppe: Students t mit df = n_Gruppe − 1.',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  "Cohen's d": "Cohen's d",
  'Cohen’s d per confronto usa la SD within pooled (√MS_within).':
    'Cohens d pro Vergleich verwendet die gepoolte Within-SD (√MS_innerhalb).',
  "Cohen's f": "Cohen's f",
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.':
    'Bei sehr unbalancierten Gruppen oder sehr unterschiedlichen Varianzen kann der klassische Test unzuverlässige p liefern: Verwenden Sie die Welch-ANOVA oder Kruskal–Wallis.',
  'conferma che almeno un gruppo si distribuisce diversamente':
    'bestätigt, dass sich mindestens eine Gruppe anders verteilt',
  'conferma la differenza tra le medie anche senza assumere varianze uguali':
    'bestätigt den Unterschied zwischen den Mittelwerten auch ohne Annahme gleicher Varianzen',
  'Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.':
    'Vergleichen Sie die beiden Ergebnisse: Weichen sie voneinander ab, hängt das parametrische Ergebnis von der Normalitätsannahme ab und ist mit größerer Vorsicht zu berichten.',
  'Confronti post-hoc ({s1})': 'Post-hoc-Vergleiche ({s1})',
  Confronto: 'Vergleich',
  Controllo: 'Prüfung',
  'correzione Bonferroni': 'Bonferroni-Korrektur',
  'correzione FDR': 'FDR-Korrektur',
  'correzione Holm': 'Holm-Korrektur',
  'Descrittive per gruppo': 'Deskriptive Werte pro Gruppe',
  df: 'df',
  df1: 'df1',
  df2: 'df2',
  'differenza significativa': 'signifikanter Unterschied',
  'Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.':
    'Dunn verwendet die Rangvarianz mit Korrektur für Bindungen; p korrigiert mit Holm oder Bonferroni.',
  'Effect size': 'Effektstärke',
  F: 'F',
  'F = MS_between / MS_within; p da F({s1}, {s2}).':
    'F = MS_zwischen / MS_innerhalb; p aus F({s1}, {s2}).',
  'F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.':
    'F vergleicht die Variabilität zwischen den Gruppen mit der innerhalb der Gruppen: Werte nahe 1 zeigen, dass sich die Gruppen nicht unterscheiden.',
  'FDR (Benjamini–Hochberg)': 'FDR (Benjamini–Hochberg)',
  'Games–Howell (Welch pairwise)': 'Games–Howell (Welch paarweise)',
  'Gruppi diversi': 'Unterschiedliche Gruppen',
  Gruppo: 'Gruppe',
  H: 'H',
  'H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.':
    'H korrigiert für Rangbindungen; η²_H = (H − k + 1)/(N − k) ist eine Effektstärke.',
  'H₀: tutte le medie uguali · α = {s1}':
    'H₀: alle Mittelwerte gleich · α = {s1}',
  'I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.':
    'Die CI sind individuell (nicht simultan) auf dem gewählten Niveau; bei Holm/Bonferroni ist das p korrigiert, das CI nicht.',
  'I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.':
    'Die Gruppen sollten aus unabhängigen Beobachtungen stammen: Dieselbe Einheit darf nicht in zwei Gruppen auftauchen.',
  'I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.':
    'Die Post-hoc-p sind bereits korrigiert: Verwenden Sie sie statt der p der einzelnen t-Tests, die zu optimistisch wären.',
  'Il fattore {s1} spiega una parte {s2} della variabilità di {s3}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.':
    'Der Faktor {s1} erklärt einen Teil ({s2}) der Variabilität von {s3}. Um zu verstehen, welche Gruppen sich unterscheiden, lesen Sie die Post-hoc-Vergleiche oben.',
  'Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.':
    'Das Verhältnis max(SD)/min(SD) ist eine weitere deskriptive Prüfung der Homogenität.',
  'Il test principale': 'Der Haupttest',
  'In pratica': 'In der Praxis',
  'In un ANOVA a una via partial η² coincide con η².':
    'In einer einfaktoriellen ANOVA stimmt das partielle η² mit η² überein.',
  Interpretazione: 'Interpretation',
  'Jarque–Bera {s1}': 'Jarque–Bera {s1}',
  'Kruskal–Wallis H (non parametrico)': 'Kruskal–Wallis H (nicht parametrisch)',
  'Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.':
    'Kruskal–Wallis: H = {s1} mit df = {s2}, {s3} → {s4}.',
  'L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.':
    'Die ANOVA vergleicht die Variabilität zwischen den Gruppen mit der innerhalb der Gruppen: Unterscheiden sich die Gruppen tatsächlich, ist die erste im Verhältnis zur zweiten groß.',
  'L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.':
    'Die ANOVA sagt nur, dass die Gruppen nicht alle gleich sind: Welche Paare sich unterscheiden, zeigen die paarweisen Vergleiche, deren p bereits für die Zahl der Vergleiche korrigiert ist.',
  'L’ANOVA non è calcolabile con i dati disponibili.':
    'Die ANOVA ist mit den verfügbaren Daten nicht berechenbar.',
  'L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.':
    'Die ANOVA setzt unabhängige Beobachtungen voraus: Wiederholte Messungen an derselben Einheit erfordern ein Modell für gepaarte Daten.',
  'L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.':
    'Die Nullhypothese gleicher Mittelwerte wird nicht verworfen: Die Daten zeigen keine verlässlichen Unterschiede zwischen den Gruppen.',
  'La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.':
    'Die globale Signifikanz sagt nicht, welche Gruppen sich unterscheiden: Dafür braucht es immer die Post-hoc-Vergleiche.',
  'Le medie di {s1} differiscono tra i gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}){s6}.':
    'Die Mittelwerte von {s1} unterscheiden sich zwischen den Gruppen von {s2}: F = {s3}, {s4} (Schwelle α = {s5}){s6}.',
  'Levene (media)': 'Levene (Mittelwert)',
  'Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.':
    'Levene signifikant: Varianzen nicht homogen. Berichten Sie zusätzlich die Welch-ANOVA und/oder Kruskal-Wallis.',
  Max: 'Max',
  Mean: 'Mittelwert',
  'Mean diff': 'Mittlere Differenz',
  'Mean rank': 'Mittlerer Rang',
  Median: 'Median',
  'Medie dei gruppi': 'Gruppenmittelwerte',
  Min: 'Min',
  Misura: 'Maß',
  MS: 'MS',
  N: 'N',
  'Nessuna differenza': 'Kein Unterschied',
  'nessuna differenza affidabile': 'kein verlässlicher Unterschied',
  'Nessuna evidenza di eteroschedasticità.':
    'Kein Hinweis auf Heteroskedastizität.',
  'Non ci sono prove sufficienti che {s1} sposti {s2}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.':
    'Es gibt nicht genügend Belege dafür, dass {s1} {s2} verschiebt. Bei kleinen Gruppen hat die ANOVA wenig Power: Fehlende Signifikanz bedeutet nicht fehlenden Effekt.',
  'non conferma differenze tra i gruppi':
    'bestätigt keine Unterschiede zwischen den Gruppen',
  'non conferma la differenza quando le varianze sono libere di differire':
    'bestätigt den Unterschied nicht, wenn die Varianzen frei variieren dürfen',
  'Non emerge una differenza tra le medie di {s1} nei gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}).':
    'Es zeigt sich kein Unterschied zwischen den Mittelwerten von {s1} in den Gruppen von {s2}: F = {s3}, {s4} (Schwelle α = {s5}).',
  'non quantificabile': 'nicht quantifizierbar',
  'normalità residui del gruppo (N = {s1})':
    'Normalität der Residuen der Gruppe (N = {s1})',
  Nota: 'Notiz',
  'omogeneità descrittiva delle SD': 'deskriptive Homogenität der SD',
  omoschedasticità: 'Homoskedastizität',
  'Omoschedasticità non verificabile con questi dati.':
    'Homoskedastizität mit diesen Daten nicht prüfbar.',
  'Omoschedasticità: Levene {s1}{s2} → {s3}.':
    'Homoskedastizität: Levene {s1}{s2} → {s3}.',
  p: 'p',
  'p corretto': 'korrigiertes p',
  'p non corretto': 'unkorrigiertes p',
  'partial η²': 'partielles η²',
  'Post-hoc': 'Post-hoc',
  'Post-hoc Dunn': 'Post-hoc Dunn',
  'Ranghi per gruppo': 'Ränge pro Gruppe',
  'Rank sum': 'Rangsumme',
  'rapporto sd': 'SD-Verhältnis',
  'Rapporto SD max/min': 'Verhältnis SD max/min',
  'Rapporto tra SD massima e minima: {s1} (valori molto sopra 2 indicano gruppi con dispersione diversa).':
    'Verhältnis zwischen größter und kleinster SD: {s1} (Werte deutlich über 2 deuten auf Gruppen mit unterschiedlicher Streuung hin).',
  'Report di lettura — ANOVA a una via': 'Lesetext — einfaktorielle ANOVA',
  'robusto agli outlier': 'robust gegenüber Ausreißern',
  SD: 'SD',
  SE: 'SE',
  Source: 'Quelle',
  SS: 'QS',
  Statistica: 'Statistik',
  'Statistica F = {s1} con df = ({s2}, {s3}).':
    'F-Statistik = {s1} mit df = ({s2}, {s3}).',
  Stima: 'Schätzung',
  t: 't',
  'Tukey–Kramer (approssimazione Bonferroni)':
    'Tukey–Kramer (Bonferroni-Näherung)',
  'Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.':
    'Tukey–Kramer verwendet hier die t-Näherung mit Bonferroni-Adjustierung: ausdrücklich genannt, damit sie nicht für die exakte studentisierte Spannweite gehalten wird.',
  'Varianza spiegata dai gruppi: η² = {s1}, cioè circa il {s2}% della variabilità totale di {s3}.':
    'Durch die Gruppen erklärte Varianz: η² = {s1}, also etwa {s2} % der gesamten Variabilität von {s3}.',
  'varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis':
    'Varianzen nicht homogen, daher ist die klassische ANOVA riskant und Welch oder Kruskal–Wallis vorzuziehen',
  'Verifica se la media di {s1} cambia tra i livelli del fattore {s2}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.':
    'Prüft, ob sich der Mittelwert von {s1} zwischen den Stufen des Faktors {s2} ändert. Die Nullhypothese lautet, dass alle Gruppenmittelwerte gleich sind.',
  'Welch ANOVA': 'Welch-ANOVA',
  'Welch ANOVA: {s1} → {s2}.': 'Welch-ANOVA: {s1} → {s2}.',
  'Within (errore)': 'Innerhalb (Fehler)',
  z: 'z',
  'ε²': 'ε²',
  'η²': 'η²',
  'η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.':
    'η² (Eta-Quadrat) ist der durch den Faktor erklärte Variabilitätsanteil: 0.01 klein, 0.06 mittel, 0.14 groß.',
  'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.':
    'η² = QS_zwischen / QS_total; ω² = (QS_zwischen − (k−1)·MS_innerhalb)/(QS_total + MS_innerhalb); ε² = (QS_zwischen − (k−1)·MS_innerhalb)/QS_total.',
  'η²_H': 'η²_H',
  'η²_H = {s1}: dimensione dell’effetto stimata sui ranghi.':
    'η²_H = {s1}: auf den Rängen geschätzte Effektstärke.',
  'ω²': 'ω²',
  'ω² = {s1}: stima meno distorta della quota di varianza spiegata nella popolazione.':
    'ω² = {s1}: eine weniger verzerrte Schätzung des Anteils erklärter Varianz in der Population.',
};
