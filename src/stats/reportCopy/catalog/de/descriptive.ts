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
  'CI {s1}%': 'CI {s1} %',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
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
  'media {s1} (CI {s2}% {s3})': 'Mittelwert {s1} (CI {s2} % {s3})',
  'Media e mediana: la media è il baricentro e risente degli estremi, la mediana è il valore centrale e resta stabile. Se differiscono molto, la distribuzione è asimmetrica.':
    'Mittelwert und Median: Der Mittelwert ist der Schwerpunkt und reagiert auf Extremwerte, der Median ist der mittlere Wert und bleibt stabil. Unterscheiden sie sich stark, ist die Verteilung schief.',
  Median: 'Median',
  'Median CI high': 'Median-CI oben',
  'Median CI low': 'Median-CI unten',
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
  'Frequenze':
    'Häufigkeiten',
  'Value':
    'Wert',
  'Count':
    'Anzahl',
  'Percent':
    'Prozent',
  'Cumulative count':
    'Kumulierte Anzahl',
  'Cumulative %':
    'Kumuliert %',
  'Chi-square':
    'Chi-Quadrat',
  'p-value':
    'p-Wert',
  'Low':
    'Niedrig',
  'High':
    'Hoch',
  'Outlier':
    'Ausreißer',
  'Regolare':
    'Unauffällig',
  'Test per valori anomali':
    'Ausreißertests',
  'Statistic':
    'Statistik',
  'Critical value':
    'Kritischer Wert',
  'Side':
    'Seite',
  'Verdict':
    'Ergebnis',
  'Test delle sequenze':
    'Runs-Test',
  'Cut point':
    'Trennwert',
  'Above cut':
    'Über dem Trennwert',
  'Below cut':
    'Unter dem Trennwert',
  'Runs':
    'Runs',
  'Expected runs':
    'Erwartete Runs',
  'Exact p':
    'Exaktes p',
  'Conteggi':
    'Anzahlen',
  'Risultato per variabile':
    'Ergebnis je Variable',
  'Percentuali calcolate sulle osservazioni non mancanti ({s1} su {s2}).':
    'Prozente bezogen auf die nicht fehlenden Beobachtungen ({s1} von {s2}).',
  'Intervallo di Wilson al {s1}% per la proporzione di ogni modalità.':
    'Wilson-Intervall zu {s1} % für den Anteil jeder Ausprägung.',
  'Bontà di adattamento (quote uguali)':
    'Anpassungstest (gleiche Anteile)',
  'Confronta le frequenze osservate con quote uguali tra le modalità: un p piccolo indica modalità più rappresentate di altre.':
    'Vergleicht die beobachteten Häufigkeiten mit gleichen Anteilen: ein kleines p bedeutet, dass manche Ausprägungen häufiger sind.',
  'Grubbs: test bilaterale sull’osservazione più lontana dalla media, con correzione per il numero di candidati.':
    'Grubbs: zweiseitiger Test für die am weitesten vom Mittelwert entfernte Beobachtung, korrigiert für die Zahl der Kandidaten.',
  'Dixon: rapporto fra le differenze adiacenti; definito solo per 3–30 osservazioni e più robusto agli estremi.':
    'Dixon: Verhältnis benachbarter Differenzen; nur für 3–30 Beobachtungen definiert und robuster gegen Extreme.',
  'Le osservazioni sono divise in due lati rispetto al punto di taglio (mediana per default); un numero di sequenze troppo basso indica clustering, troppo alto alternanza.':
    'Die Beobachtungen werden am Trennwert (standardmäßig Median) in zwei Seiten geteilt; zu wenige Runs bedeuten Klumpung, zu viele Abwechslung.',
  'Il p asintotico usa l’approssimazione normale con correzione di continuità; il p esatto è disponibile fino a 50 osservazioni.':
    'Das asymptotische p nutzt die Normalapproximation mit Stetigkeitskorrektur; das exakte p ist bis 50 Beobachtungen verfügbar.',
  'Livello di confidenza: {s1}%.':
    'Konfidenzniveau: {s1} %.',
  '{s1} modalità su {s2} osservazioni non mancanti':
    '{s1} Ausprägungen bei {s2} nicht fehlenden Beobachtungen',
  'la più frequente è “{s1}” con {s2} casi':
    'am häufigsten ist „{s1}“ mit {s2} Fällen',
  'le quote uguali sono rifiutate (χ² = {s1}, p = {s2})':
    'gleiche Anteile werden verworfen (χ² = {s1}, p = {s2})',
  'le quote uguali non sono rifiutate (χ² = {s1}, p = {s2})':
    'gleiche Anteile werden nicht verworfen (χ² = {s1}, p = {s2})',
  '{s1}: {s2}; {s3}{s4}.':
    '{s1}: {s2}; {s3}{s4}.',
  'Report di lettura — Frequenze':
    'Lesebeitrag — Häufigkeiten',
  'La variabile {s1} ha {s2} modalità distinte.':
    'Die Variable {s1} hat {s2} verschiedene Ausprägungen.',
  'Frequenze di {s1} variabili, {s2} modalità in tutto.':
    'Häufigkeiten für {s1} Variablen, insgesamt {s2} Ausprägungen.',
  'La tabella di frequenza conta quante volte compare ogni modalità e mostra la percentuale sul totale delle osservazioni valide.':
    'Die Häufigkeitstabelle zählt, wie oft jede Ausprägung vorkommt, und zeigt ihren Anteil an den gültigen Beobachtungen.',
  'L’intervallo di Wilson tiene conto della numerosità: con pochi casi è largo anche quando la percentuale sembra precisa.':
    'Das Wilson-Intervall berücksichtigt den Stichprobenumfang: bei wenigen Fällen ist es breit, auch wenn der Prozentwert präzise wirkt.',
  'Il conteggio ignora le celle vuote; la percentuale è calcolata sul totale non mancante, non sul numero di righe.':
    'Die Zählung ignoriert leere Zellen; der Prozentwert bezieht sich auf die nicht fehlenden Werte, nicht auf die Zeilenzahl.',
  'Il test di bontà di adattamento confronta le modalità con quote uguali: serve a capire se una categoria domina, non a stimare la sua proporzione.':
    'Der Anpassungstest vergleicht die Ausprägungen mit gleichen Anteilen: er zeigt, ob eine Kategorie dominiert, nicht wie groß ihr Anteil ist.',
  'Con molte modalità il test χ² diventa fragile: raggruppa le categorie rare prima di leggerlo.':
    'Bei vielen Ausprägungen wird der χ²-Test fragil: seltene Kategorien vor der Interpretation zusammenfassen.',
  'Le frequenze descrivono il campione osservato: non dicono nulla sulla popolazione senza un modello o un disegno di campionamento.':
    'Häufigkeiten beschreiben die beobachtete Stichprobe: ohne Modell oder Stichprobendesign sagen sie nichts über die Grundgesamtheit.',
  'Una variabile continua con molti valori distinti non va conteggiata: usa la sintesi descrittiva o crea classi.':
    'Eine stetige Variable mit vielen verschiedenen Werten gehört nicht in eine Häufigkeitstabelle: nutze die deskriptive Übersicht oder bilde Klassen.',
  'Le percentuali non sono indipendenti tra loro: sommano a 100 e un intervallo alla volta non corregge per i confronti multipli.':
    'Prozente sind nicht unabhängig: sie summieren sich zu 100, und ein Intervall allein korrigiert nicht für Mehrfachvergleiche.',
  '{s1}: nessuno dei due test segnala valori anomali.':
    '{s1}: keiner der beiden Tests meldet einen Ausreißer.',
  '{s1}: Grubbs e Dixon segnalano entrambi un valore anomalo.':
    '{s1}: Grubbs und Dixon melden beide einen Ausreißer.',
  '{s1}: Grubbs segnala un valore anomalo, Dixon no.':
    '{s1}: Grubbs meldet einen Ausreißer, Dixon nicht.',
  '{s1}: Dixon segnala un valore anomalo, Grubbs no.':
    '{s1}: Dixon meldet einen Ausreißer, Grubbs nicht.',
  'Grubbs G = {s1}, p = {s2}':
    'Grubbs G = {s1}, p = {s2}',
  'Dixon {s1} = {s2}, p = {s3}':
    'Dixon {s1} = {s2}, p = {s3}',
  'Dixon non applicabile (servono 3–30 osservazioni)':
    'Dixon nicht anwendbar (3–30 Beobachtungen nötig)',
  'Report di lettura — Valori anomali':
    'Lesebeitrag — Ausreißer',
  'Test dei valori anomali per {s1}.':
    'Ausreißertests für {s1}.',
  'Test dei valori anomali per {s1} variabili: {s2} con almeno un segnale.':
    'Ausreißertests für {s1} Variablen: {s2} mit mindestens einem Signal.',
  'Grubbs e Dixon rispondono alla stessa domanda — l’osservazione più estrema è compatibile con le altre? — ma con assunzioni diverse.':
    'Grubbs und Dixon beantworten dieselbe Frage — ist die extremste Beobachtung mit den übrigen vereinbar? — aber mit unterschiedlichen Annahmen.',
  'Un test significativo non prova che il dato sia un errore: dice che è improbabile estrarlo da una popolazione normale con la stessa media e dispersione.':
    'Ein signifikanter Test beweist nicht, dass der Wert ein Fehler ist: er sagt nur, dass er aus einer normalverteilten Grundgesamtheit mit gleichem Mittelwert und gleicher Streuung unwahrscheinlich ist.',
  'Grubbs standardizza lo scarto dalla media con la deviazione standard: risente degli estremi e va usato con campioni non troppo piccoli.':
    'Grubbs standardisiert die Abweichung vom Mittelwert mit der Standardabweichung: er reagiert auf Extreme und braucht ausreichend große Stichproben.',
  'Dixon confronta differenze adiacenti ed è più robusto, ma è definito solo tra 3 e 30 osservazioni.':
    'Dixon vergleicht benachbarte Differenzen und ist robuster, aber nur für 3 bis 30 Beobachtungen definiert.',
  'Il p-value è già corretto per il fatto che il candidato è il massimo scarto, non un’osservazione scelta a priori.':
    'Der p-Wert berücksichtigt bereits, dass der Kandidat die größte Abweichung ist und nicht vorab gewählt wurde.',
  'Entrambi i test assumono una popolazione normale: con distribuzioni asimmetriche il p-value non è affidabile.':
    'Beide Tests setzen eine normalverteilte Grundgesamtheit voraus: bei schiefen Verteilungen ist der p-Wert unzuverlässig.',
  'Un outlier può essere un caso reale e importante: verifica la fonte prima di escluderlo.':
    'Ein Ausreißer kann ein echter und wichtiger Fall sein: vor dem Ausschluss die Quelle prüfen.',
  'Con molti valori estremi il test segnala solo il più lontano: ripetilo dopo aver rimosso il caso o usa una regola robusta come MAD.':
    'Bei vielen Extremwerten meldet der Test nur den entferntesten: nach dem Entfernen wiederholen oder eine robuste Regel wie den MAD verwenden.',
  'meno sequenze del previsto: le osservazioni tendono a raggrupparsi':
    'weniger Runs als erwartet: die Beobachtungen neigen zur Klumpung',
  'più sequenze del previsto: le osservazioni tendono ad alternarsi':
    'mehr Runs als erwartet: die Beobachtungen neigen zur Abwechslung',
  '; p esatto {s1}':
    '; exaktes p {s1}',
  '{s1}: {s2} sequenze su {s3} osservazioni (attese {s4}); {s5} (p = {s6}{s7}).':
    '{s1}: {s2} Runs bei {s3} Beobachtungen (erwartet {s4}); {s5} (p = {s6}{s7}).',
  'Report di lettura — Test delle sequenze':
    'Lesebeitrag — Runs-Test',
  'Sequenze di {s1} rispetto al punto di taglio {s2}.':
    'Runs von {s1} um den Trennwert {s2}.',
  'Test delle sequenze per {s1} variabili: {s2} con ordine non casuale.':
    'Runs-Test für {s1} Variablen: {s2} mit nicht zufälliger Reihenfolge.',
  'Il test delle sequenze controlla se l’ordine delle righe è casuale: conta quante volte il valore attraversa il punto di taglio.':
    'Der Runs-Test prüft, ob die Zeilenreihenfolge zufällig ist: er zählt, wie oft der Wert den Trennwert überschreitet.',
  'Serve per dati raccolti in sequenza — tempo, ordine di produzione, righe di un foglio — dove una tendenza o un ciclo rompe l’indipendenza.':
    'Er ist für sequenziell erhobene Daten gedacht — Zeit, Produktionsreihenfolge, Tabellenzeilen —, wo ein Trend oder ein Zyklus die Unabhängigkeit bricht.',
  'Il punto di taglio predefinito è la mediana, così i due lati hanno all’incirca lo stesso numero di osservazioni.':
    'Der Standard-Trennwert ist der Median, sodass beide Seiten etwa gleich viele Beobachtungen enthalten.',
  'Il z confronta le sequenze osservate con quelle attese sotto casualità; la correzione di continuità rende il test più prudente.':
    'Das z vergleicht die beobachteten Runs mit den unter Zufälligkeit erwarteten; die Stetigkeitskorrektur macht den Test vorsichtiger.',
  'Il p esatto enumera tutte le disposizioni possibili: è il riferimento quando il campione è piccolo e l’approssimazione normale è dubbia.':
    'Das exakte p zählt alle möglichen Anordnungen auf: es ist die Referenz, wenn die Stichprobe klein und die Normalapproximation fraglich ist.',
  'Il test rileva dipendenza dall’ordine, non la forma della dipendenza: un p piccolo non distingue tendenza, ciclo e cluster.':
    'Der Test erkennt Abhängigkeit von der Reihenfolge, nicht ihre Form: ein kleines p unterscheidet nicht zwischen Trend, Zyklus und Klumpung.',
  'Le osservazioni con valore uguale al punto di taglio finiscono nel lato basso: con molti pareggi il test diventa conservativo.':
    'Beobachtungen gleich dem Trennwert zählen zur unteren Seite: bei vielen Gleichständen wird der Test konservativ.',
  'Il test assume che le osservazioni siano altrimenti identicamente distribuite: un cambiamento di livello a metà serie lo fa rifiutare anche senza vera dipendenza. Il livello usato è {s1}.':
    'Der Test setzt voraus, dass die Beobachtungen ansonsten identisch verteilt sind: ein Niveauwechsel in der Mitte der Reihe lässt ihn auch ohne echte Abhängigkeit verwerfen. Das verwendete Niveau ist {s1}.',
  'Intervallo di tolleranza':
    'Toleranzintervall',
  'Population proportion':
    'Anteil der Grundgesamtheit',
  'Confidence':
    'Konfidenz',
  'Factor k':
    'Faktor k',
  'Lower bound':
    'Untere Grenze',
  'Upper bound':
    'Obere Grenze',
  'Observed coverage':
    'Beobachtete Abdeckung',
  'x̄ ± k·s: l’intervallo contiene la proporzione indicata della popolazione, non della media.':
    'x̄ ± k·s: Das Intervall enthält den angegebenen Anteil der Grundgesamtheit, nicht des Mittelwerts.',
  'Fattore calcolato con l’approssimazione di Howe; il metodo esatto basato sulla t non centrale differisce di circa lo 0,1% per n = 10.':
    'Faktor mit Howes Näherung berechnet; die exakte Methode über die nichtzentrale t weicht bei n = 10 um etwa 0,1 % ab.',
  'Report di lettura — Intervallo di tolleranza':
    'Lesebeitrag — Toleranzintervall',
  '{s1}% della popolazione di {s2} è compreso tra {s3} e {s4}, con confidenza {s5}%.':
    '{s1} % der Grundgesamtheit von {s2} liegt zwischen {s3} und {s4}, bei {s5} % Konfidenz.',
  'Intervallo':
    'Intervall',
  'L’intervallo di tolleranza risponde a una domanda diversa dal CI della media: non dove sta la media, ma quale intervallo coprirà una quota della popolazione.':
    'Das Toleranzintervall beantwortet eine andere Frage als das KI des Mittelwerts: nicht wo der Mittelwert liegt, sondern welches Intervall einen Anteil der Grundgesamtheit abdeckt.',
  'Serve per specifiche, limiti di accettazione e valori di riferimento, dove conta la dispersione individuale e non l’incertezza della stima.':
    'Er dient Spezifikationen, Annahmegrenzen und Referenzwerten, bei denen die individuelle Streuung zählt und nicht die Unsicherheit der Schätzung.',
  'Risultato':
    'Ergebnis',
  'Media {s1}, deviazione standard {s2}, fattore k = {s3}.':
    'Mittelwert {s1}, Standardabweichung {s2}, Faktor k = {s3}.',
  'Intervallo: da {s1} a {s2}; copre il {s3}% della popolazione con confidenza {s4}%.':
    'Intervall: von {s1} bis {s2}; es deckt {s3} % der Grundgesamtheit bei {s4} % Konfidenz ab.',
  'Ampiezza dell’intervallo: {s1}. Si restringe aumentando n o riducendo la confidenza richiesta.':
    'Intervallbreite: {s1}. Sie nimmt ab, wenn n wächst oder die geforderte Konfidenz sinkt.',
  'La confidenza riguarda la procedura: se ripetessi il campionamento, una quota pari alla confidenza degli intervalli costruiti coprirebbe davvero la proporzione richiesta.':
    'Die Konfidenz betrifft das Verfahren: Bei wiederholter Stichprobenziehung würde der der Konfidenz entsprechende Anteil der Intervalle den geforderten Anteil tatsächlich abdecken.',
  'Con pochi casi k è grande: un intervallo di tolleranza al 95/95 su dieci osservazioni è largo oltre tre deviazioni standard per lato.':
    'Bei wenigen Fällen ist k groß: Ein 95/95-Toleranzintervall bei zehn Beobachtungen reicht je Seite über drei Standardabweichungen.',
  'La copertura osservata nel campione non è la copertura della popolazione: con n piccolo è quasi sempre vicina al 100%.':
    'Die im Sample beobachtete Abdeckung ist nicht die der Grundgesamtheit: bei kleinem n liegt sie fast immer nahe 100 %.',
  'L’intervallo assume una popolazione normale e osservazioni indipendenti: con distribuzioni asimmetriche va usato un metodo non parametrico.':
    'Das Intervall setzt eine normalverteilte Grundgesamtheit und unabhängige Beobachtungen voraus: bei schiefen Verteilungen ist eine nicht parametrische Methode nötig.',
  'Non sostituisce un’analisi di capacità: Cp/Cpk confrontano la dispersione con le specifiche, l’intervallo di tolleranza stima dove cadono le unità.':
    'Es ersetzt keine Fähigkeitsanalyse: Cp/Cpk vergleichen die Streuung mit den Spezifikationen, das Toleranzintervall schätzt, wo die Einheiten liegen.',
  'Con campioni molto piccoli l’approssimazione di Howe può differire leggermente dal fattore esatto della t non centrale.':
    'Bei sehr kleinen Stichproben kann Howes Näherung leicht vom exakten Faktor der nichtzentralen t abweichen.',
  'Observation':
    'Beobachtung',
  'C+':
    'C+',
  'C−':
    'C−',
  'Signal':
    'Signal',
  'C+ accumula gli scostamenti sopra il target, C− quelli sotto: entrambi partono da zero e non scendono mai sotto zero.':
    'C+ summiert Abweichungen über dem Ziel, C− die darunter: beide starten bei null und fallen nie darunter.',
  'k = {s1}·σ (allowance), h = {s2}·σ (intervallo di decisione); il primo punto oltre h è il segnale.':
    'k = {s1}·σ (Allowance), h = {s2}·σ (Entscheidungsintervall); der erste Punkt jenseits von h ist das Signal.',
  'Report di lettura — CUSUM':
    'Lesebeitrag — CUSUM',
  'CUSUM di {s1}: {s2}':
    'CUSUM von {s1}: {s2}',
  'Il primo segnale è al punto {s1} verso l’alto e al punto {s2} verso il basso.':
    'Das erste Signal liegt bei Punkt {s1} nach oben und bei Punkt {s2} nach unten.',
  'Il primo segnale è al punto {s1}, verso l’alto.':
    'Das erste Signal liegt bei Punkt {s1} nach oben.',
  'Il primo segnale è al punto {s1}, verso il basso.':
    'Das erste Signal liegt bei Punkt {s1} nach unten.',
  'Nessun punto supera l’intervallo di decisione: il processo resta sotto controllo.':
    'Kein Punkt überschreitet das Entscheidungsintervall: Der Prozess bleibt unter Kontrolle.',
  'La CUSUM somma gli scostamenti dal target: piccoli spostamenti persistenti si accumulano e superano il limite anche quando nessun punto singolo esce dai limiti di una carta Shewhart.':
    'Die CUSUM summiert die Abweichungen vom Ziel: Kleine anhaltende Verschiebungen summieren sich und überschreiten die Grenze, auch wenn kein einzelner Punkt die Grenzen einer Shewhart-Karte verlässt.',
  'È la carta giusta per turni, lotti e processi continui, dove conta la deriva lenta e non il singolo valore anomalo.':
    'Sie ist die richtige Karte für Schichten, Lose und kontinuierliche Prozesse, bei denen die langsame Drift zählt und nicht der einzelne Ausreißer.',
  'Target {s1}, σ {s2}; allowance k = {s3}·σ, intervallo h = {s4}·σ (limite {s5}).':
    'Ziel {s1}, σ {s2}; Allowance k = {s3}·σ, Intervall h = {s4}·σ (Grenze {s5}).',
  'Valore finale di C+: {s1}; di C−: {s2}.':
    'Endwert von C+: {s1}; von C−: {s2}.',
  'C+ misura quanto il processo è stato sopra il target, C− quanto è stato sotto; i due lati si leggono separatamente.':
    'C+ misst, wie weit der Prozess über dem Ziel lag, C− wie weit darunter; beide Seiten werden getrennt gelesen.',
  'Dopo un segnale la carta va azzerata o ricalcolata: la somma continua a crescere e non dice più quando è avvenuto il cambiamento.':
    'Nach einem Signal muss die Karte zurückgesetzt oder neu berechnet werden: Die Summe wächst weiter und sagt nicht mehr, wann die Änderung eintrat.',
  'k = 0,5σ è la scelta classica per uno spostamento di 1σ; h = 4σ dà pochi falsi allarmi, h = 5σ è ancora più prudente.':
    'k = 0,5σ ist die klassische Wahl für eine Verschiebung um 1σ; h = 4σ erzeugt wenige Fehlalarme, h = 5σ ist noch vorsichtiger.',
  'La CUSUM assume osservazioni indipendenti e in ordine cronologico: con autocorrelazione i falsi allarmi aumentano.':
    'Die CUSUM setzt unabhängige Beobachtungen in chronologischer Reihenfolge voraus: Bei Autokorrelation steigen die Fehlalarme.',
  'Non stima il punto di cambiamento: per quello servono metodi di change-point o la lettura congiunta con la carta di controllo.':
    'Er schätzt den Wechselpunkt nicht: dafür braucht es Change-Point-Methoden oder die gemeinsame Lesart mit der Regelkarte.',
  'Target e σ devono venire da una fase stabile: usarli da un processo fuori controllo rende il grafico fuorviante.':
    'Ziel und σ müssen aus einer stabilen Phase stammen: Aus einem außer Kontrolle geratenen Prozess entnommen, wird die Karte irreführend.',
  'CUSUM':
    'CUSUM',
};
