/** de: report and table prose (normalised). */
export const descriptiveCopy: Record<string, string> = {
  '{s1} mancanti': '{s1} fehlend',
  '{s1} valori anomali ({s2}%)': '{s1} Ausreißer ({s2} %)',
  '{s1}: {s2}. Distribuzione: {s3}; {s4}.':
    '{s1}: {s2}. Verteilung: {s3}; {s4}.',
  'asimmetria {s1}, coda a destra': 'Schiefe {s1}, rechtsschief',
  'asimmetria {s1}, coda a sinistra': 'Schiefe {s1}, linksschief',
  'asimmetria {s1}, praticamente simmetrica':
    'Schiefe {s1}, praktisch symmetrisch',
  'asimmetria non disponibile': 'Schiefe nicht verfügbar',
  'Campione e misure di posizione': 'Stichprobe und Lageparameter',
  'CI {s1}%': 'KI {s1} %',
  'CI high': 'KI oben',
  'CI low': 'KI unten',
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'Con pochi dati i test di normalità hanno scarsa potenza; con molti dati sono iper-sensibili.':
    'Bei wenigen Daten haben Normalitätstests wenig Power; bei vielen Daten sind sie überempfindlich.',
  'Cosa fare adesso': 'Was jetzt zu tun ist',
  'CV {s1}%': 'CV {s1} %',
  'CV %': 'CV %',
  "D'Agostino K²": "D'Agostino K²",
  "D'Agostino–Pearson K² combina le trasformazioni normalizzanti di skewness e kurtosi; p da χ² con 2 df.":
    "D'Agostino–Pearson K² kombiniert die normalisierenden Transformationen von Schiefe und Kurtosis; p aus χ² mit 2 df.",
  'Da leggere con cautela: {s1} di {s2} {s3} dalla gaussiana e {s4} {s5} valori anomali oltre 1.5 IQR.':
    'Mit Vorsicht zu lesen: {s1} von {s2} {s3} von der Gaußverteilung ab und {s4} {s5} Ausreißer jenseits von 1.5 IQR.',
  'Da verificare': 'Zu prüfen',
  'Dati insufficienti': 'Unzureichende Daten',
  'Dati regolari': 'Regelmäßige Daten',
  'Definizione di Tukey: outlier se < Q1 − 1.5·IQR o > Q3 + 1.5·IQR; estremi oltre 3·IQR.':
    'Definition nach Tukey: Ausreißer bei < Q1 − 1.5·IQR oder > Q3 + 1.5·IQR; Extremwerte jenseits von 3·IQR.',
  'Dispersione e valori anomali': 'Streuung und Ausreißer',
  'Due gruppi indipendenti: t-test di Welch, oppure Mann–Whitney U se la normalità è rifiutata.':
    'Zwei unabhängige Gruppen: t-Test nach Welch oder Mann–Whitney U, wenn die Normalität verworfen ist.',
  'Estremi 3 IQR': 'Extremwerte 3 IQR',
  'Excess kurtosis': 'Exzess-Kurtosis',
  'Forma e test di normalità': 'Form und Normalitätstests',
  IQR: 'IQR',
  'Jarque–Bera': 'Jarque–Bera',
  'JB p': 'JB p',
  'K² p': 'K² p',
  'KS con parametri stimati: p corretta con metodo Lilliefors (Monte Carlo, 1000 repliche, seed fisso). Il p grezzo di KS sarebbe anti-conservativo.':
    'KS mit geschätzten Parametern: p korrigiert nach der Lilliefors-Methode (Monte Carlo, 1000 Wiederholungen, fester Seed). Das rohe KS-p wäre antikonservativ.',
  'KS D': 'KS D',
  'KS p (Lilliefors)': 'KS p (Lilliefors)',
  'Le celle vuote o non numeriche vengono escluse variabile per variabile, quindi gli N possono differire tra colonne.':
    'Leere oder nicht numerische Zellen werden Variable für Variable ausgeschlossen, daher können sich die N zwischen den Spalten unterscheiden.',
  'Le descrittive non dimostrano relazioni causali né differenze tra gruppi: sono una fotografia del campione.':
    'Deskriptive Statistiken belegen keine kausalen Beziehungen und keine Unterschiede zwischen Gruppen: Sie sind eine Momentaufnahme der Stichprobe.',
  MAD: 'MAD',
  'MAD scalata': 'Skaliertes MAD',
  'MAD scalata = 1.4826 · MAD, stimatore consistente della SD sotto normalità.':
    'Skaliertes MAD = 1.4826 · MAD, ein konsistenter Schätzer der SD unter Normalität.',
  Max: 'Max',
  Mean: 'Mittelwert',
  'media {s1} (CI {s2}% {s3})': 'Mittelwert {s1} (KI {s2} % {s3})',
  'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.':
    'Mittelwert und Median: Der Mittelwert ist der Schwerpunkt und reagiert auf Extremwerte, der Median ist der mittlere Wert und bleibt stabil. Unterscheiden sie sich stark, ist die Verteilung schief.',
  Median: 'Median',
  'Median CI high': 'Median-KI oben',
  'Median CI low': 'Median-KI unten',
  'mediana {s1}': 'Median {s1}',
  Min: 'Min',
  Missing: 'Fehlend',
  'Misure ripetute sulle stesse righe: t-test appaiato o Wilcoxon signed-rank.':
    'Wiederholte Messungen an denselben Zeilen: gepaarter t-Test oder Wilcoxon signed-rank.',
  N: 'N',
  'n = {s1}': 'n = {s1}',
  'Nessuna variabile numerica valida: non c’è nulla da riassumere.':
    'Keine gültige numerische Variable: Es gibt nichts zusammenzufassen.',
  'normalità non rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'Normalität nicht verworfen (JB {s1}, Lilliefors {s2}, K² {s3})',
  'normalità rifiutata (JB {s1}, Lilliefors {s2}, K² {s3})':
    'Normalität verworfen (JB {s1}, Lilliefors {s2}, K² {s3})',
  'Outlier %': 'Ausreißer %',
  'Outlier 1.5 IQR': 'Ausreißer 1.5 IQR',
  p: 'p',
  P1: 'P1',
  P10: 'P10',
  P25: 'P25',
  P5: 'P5',
  P50: 'P50',
  P75: 'P75',
  P90: 'P90',
  P95: 'P95',
  P99: 'P99',
  Q1: 'Q1',
  'Q1/Q3 con il metodo Tukey hinges di jStat (lievemente diverso dal tipo 7 di R per N piccoli); lo stesso metodo è usato nei boxplot.':
    'Q1/Q3 nach der Tukey-Hinges-Methode von jStat (bei kleinem N leicht abweichend von Typ 7 in R); dieselbe Methode wird in den Boxplots verwendet.',
  Q3: 'Q3',
  'Quadro regolare: {s1} {s2} (fino a {s3} osservazioni), distribuzioni compatibili con la gaussiana e nessun valore anomalo.':
    'Regelmäßiges Bild: {s1} {s2} (bis zu {s3} Beobachtungen), Verteilungen mit der Gaußverteilung vereinbar und keine Ausreißer.',
  Quantili: 'Quantile',
  'Quantili interpolati (metodo jStat.percentile).':
    'Interpolierte Quantile (Methode jStat.percentile).',
  'Questa analisi non verifica ipotesi: fotografa ogni variabile per capire dove sta il centro dei dati, quanto sono dispersi e che forma ha la distribuzione.':
    'Diese Analyse prüft keine Hypothesen: Sie beschreibt jede Variable, um zu erkennen, wo das Zentrum der Daten liegt, wie stark sie streuen und welche Form die Verteilung hat.',
  Range: 'Spannweite',
  'Relazione tra variabili: correlazione; per prevedere una variabile da altre, regressione lineare.':
    'Beziehung zwischen Variablen: Korrelation; um eine Variable aus anderen vorherzusagen, lineare Regression.',
  'Report di lettura — Statistiche descrittive':
    'Lesetext — deskriptive Statistik',
  'Risultato variabile per variabile': 'Ergebnis Variable für Variable',
  SD: 'SD',
  'SD (deviazione standard) misura la dispersione nella stessa unità dei dati; il CV (SD/media) la rende confrontabile tra variabili con scale diverse. IQR e MAD sono alternative robuste agli outlier.':
    'Die SD (Standardabweichung) misst die Streuung in derselben Einheit wie die Daten; der CV (SD/Mittelwert) macht sie zwischen Variablen mit unterschiedlichen Skalen vergleichbar. IQR und MAD sind robuste Alternativen gegenüber Ausreißern.',
  'SD {s1}': 'SD {s1}',
  SE: 'SE',
  'SE di skewness e kurtosi secondo le formule di Fisher; z = statistica / SE, p a due code normale.':
    'SE der Schiefe und Kurtosis nach den Formeln von Fisher; z = Statistik / SE, zweiseitiges p aus der Normalverteilung.',
  'Serve a scegliere i test successivi: se media e mediana coincidono e la forma è simmetrica i test parametrici sono adatti; in presenza di asimmetria o valori anomali conviene affiancarli a quelli non parametrici.':
    'Sie dient der Wahl der nächsten Tests: Stimmen Mittelwert und Median überein und ist die Form symmetrisch, passen parametrische Tests; bei Schiefe oder Ausreißern sollten nicht parametrische ergänzt werden.',
  Skewness: 'Schiefe',
  Sum: 'Summe',
  'test di normalità non calcolabili con questo campione':
    'Normalitätstests mit dieser Stichprobe nicht berechenbar',
  'Test di normalità: p ≥ {s1} significa dati compatibili con una gaussiana, p < {s2} la esclude. Con molti dati anche scostamenti irrilevanti diventano significativi: guarda anche istogramma e Q-Q.':
    'Normalitätstests: p ≥ {s1} bedeutet Daten, die mit einer Gaußverteilung vereinbar sind, p < {s2} schließt sie aus. Bei vielen Daten werden auch irrelevante Abweichungen signifikant: Betrachten Sie auch Histogramm und Q-Q.',
  'Tre o più gruppi: ANOVA a una via con post-hoc, oppure Kruskal–Wallis.':
    'Drei oder mehr Gruppen: einfaktorielle ANOVA mit Post-hoc oder Kruskal–Wallis.',
  'Trimmed mean 5%': 'Getrimmter Mittelwert 5 %',
  'Trimmed mean al 5%: media dopo aver rimosso il 5% delle osservazioni a ciascuna coda (0 se N < 20).':
    'Getrimmter Mittelwert zu 5 %: Mittelwert nach Entfernen von 5 % der Beobachtungen an jeder Seite (0 bei N < 20).',
  'Valori anomali: sono le osservazioni oltre 1.5 × IQR dalle cerniere (regola di Tukey). Controlla se sono errori di inserimento o casi reali da mantenere.':
    'Ausreißer: Beobachtungen jenseits von 1.5 × IQR von den Quartilen (Tukey-Regel). Prüfen Sie, ob es Eingabefehler oder reale Fälle sind, die bleiben sollen.',
  'variabile analizzata': 'analysierte Variable',
  'variabile si discosta': 'Variable weicht',
  'variabili analizzate': 'analysierte Variablen',
  'variabili si discostano': 'Variablen weichen',
  Variable: 'Variable',
  Variance: 'Varianz',
  z: 'z',
};
