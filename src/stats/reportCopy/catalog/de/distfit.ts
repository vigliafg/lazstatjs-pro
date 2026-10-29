/** de: report and table prose (normalised). */
export const distfitCopy: Record<string, string> = {
  ', {s1} della seconda ({s2}, ΔAIC = {s3})':
    ', {s1} als die zweite ({s2}, ΔAIC = {s3})',
  '{s1} = {s2}': '{s1} = {s2}',
  '95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).':
    'Geschätztes 95. Perzentil: {s1} (5 % der Beobachtungen sollten darüber liegen).',
  'AD A²': 'AD A²',
  AIC: 'AIC',
  'AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.':
    'AIC = 2k − 2·logL: Je niedriger, desto besser erklärt die Verteilung die Daten unter Berücksichtigung der Parameterzahl.',
  'Assunzioni e cautele': 'Annahmen und Vorsichtsmaßnahmen',
  BIC: 'BIC',
  'Bontà di adattamento': 'Anpassungsgüte',
  'chiaramente migliore': 'deutlich besser',
  'CI {s1}% non applicabile ai percentili stimati':
    'CI {s1} % nicht anwendbar auf geschätzte Perzentile',
  'Come leggere il confronto': 'Wie der Vergleich zu lesen ist',
  'Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.':
    'Bei kleinem N sind die Ränder am unsichersten: Lesen Sie P1 oder P99 nicht als verlässliche Grenzen.',
  'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.':
    'Bei kleinem N sind die Schätzungen der Ränder instabil: Extreme Perzentile sind mit Vorsicht zu berichten.',
  'Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.':
    'Vergleichen Sie nur Zeilen mit demselben AIC (gleicher Datensatz): Unterschiede unter 2 sind vernachlässigbar, über 10 deutlich.',
  'Cosa ci fai con questa distribuzione':
    'Was Sie mit dieser Verteilung tun können',
  Distribuzione: 'Verteilung',
  'Distribuzione stimata': 'Geschätzte Verteilung',
  'Distribuzioni stimate': 'Geschätzte Verteilungen',
  'Fit non disponibile': 'Anpassung nicht verfügbar',
  'I parametri stimati': 'Die geschätzten Parameter',
  'I percentili sono quelli della distribuzione stimata, non i percentili osservati.':
    'Die Perzentile sind die der geschätzten Verteilung, nicht die beobachteten Perzentile.',
  'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.':
    'Die Anpassung sucht die theoretische Verteilung, die die beobachtete Stichprobe am plausibelsten macht; sie dient dazu, die Variable zu beschreiben, Perzentile zu schätzen und Regelkarten oder Zuverlässigkeitsanalysen zu speisen.',
  'Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.':
    'Das gewählte Konfidenzniveau ({s1} %) gilt nicht für Perzentile, die aus einer angepassten Verteilung geschätzt werden.',
  'Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.':
    'Das KS-p ist asymptotisch und nicht für geschätzte Parameter korrigiert: Es neigt zu optimistischen Werten, verwenden Sie es als Hinweis.',
  'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.':
    'Der p-Wert des KS-Tests wird mit der asymptotischen Formel berechnet und korrigiert nicht für die geschätzten Parameter: Er ist ein Hinweis, nicht endgültig.',
  'KS = Kolmogorov–Smirnov · AD = Anderson–Darling':
    'KS = Kolmogorov–Smirnov · AD = Anderson–Darling',
  'KS D': 'KS D',
  'KS D = {s1} (p indicativo {s2}): {s3}.':
    'KS D = {s1} (p als Hinweis {s2}): {s3}.',
  'KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.':
    'KS misst den maximalen Abstand zwischen empirischer und theoretischer Summenfunktion; AD gewichtet die Ränder stärker.',
  'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).':
    'Das AIC sagt nicht, dass die gewählte Verteilung „wahr“ ist: Es sagt, dass sie unter den geprüften die am wenigsten schlechte ist. Liegen die ersten beiden weniger als 2 Punkte auseinander, unterscheiden die Daten sie nicht, und die Wahl muss nach externen Kriterien erfolgen (Träger, Verhalten der Ränder, Einfachheit).',
  'La bontà di adattamento non è calcolabile.':
    'Die Anpassungsgüte ist nicht berechenbar.',
  'La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).':
    'Die Verteilung, die die Daten am besten beschreibt, ist die {s1} (AIC = {s2}).',
  'la distribuzione non è un buon adattamento ai dati':
    'die Verteilung passt nicht gut zu den Daten',
  'La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.':
    'Die Wahl hier richtet sich nach dem AIC, der die Anpassung belohnt und zusätzliche Parameter bestraft. Die {s1} hat AIC = {s2}{s3}.',
  'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.':
    'Verteilungen mit positivem Träger (Lognormal, Exponential, Gamma, Weibull) erfordern Werte > 0; null oder negative Werte schließen sie aus.',
  'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.':
    'Die Beobachtungen müssen unabhängig sein und aus derselben Population stammen.',
  'Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.':
    'Die Schätzungen sind Maximum-Likelihood (MLE): Sie wählen die Parameter, die die beobachteten Daten am wahrscheinlichsten machen.',
  'Log-verosimiglianza': 'Log-Likelihood',
  'Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.':
    'Log-Likelihood = {s1}: der Absolutwert ist kaum interpretierbar, nützlich nur zum Vergleich von Modellen.',
  'Mediana stimata: {s1}.': 'Geschätzter Median: {s1}.',
  'moderatamente migliore': 'mäßig besser',
  'Nessuna distribuzione stimabile con questi dati.':
    'Mit diesen Daten ist keine Verteilung schätzbar.',
  'non c’è evidenza contraria all’adattamento':
    'es gibt keine Evidenz gegen die Anpassung',
  'non calcolabile': 'nicht berechenbar',
  'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).':
    'Modelle mit zensierten Daten (Weibull auf trunkierten Überlebensdaten) sind nicht enthalten.',
  'ordinamento per AIC · N = {s1}': 'Ordnung nach AIC · N = {s1}',
  'p KS (indicativo)': 'KS p (Hinweis)',
  'P{s1}': 'P{s1}',
  Parametri: 'Parameter',
  'Parametri (MLE)': 'Parameter (MLE)',
  'Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.':
    'Parameter: {s1}. Es handelt sich um Maximum-Likelihood-Schätzungen, nicht um Stichprobenmittelwerte.',
  Percentile: 'Perzentil',
  'Percentili della distribuzione migliore ({s1})':
    'Perzentile der besten Verteilung ({s1})',
  'praticamente equivalente': 'praktisch gleichwertig',
  'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.':
    'Sie können sie nutzen, um Spezifikationsgrenzen festzulegen, die Wahrscheinlichkeit einer Überschreitung zu schätzen oder konsistente simulierte Daten zu erzeugen.',
  'Report di lettura': 'Lesetext',
  'Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.':
    'Mindestens drei Werte sind nötig und bei Verteilungen mit positivem Träger alle Werte größer als null.',
  'Un buon AIC non compensa un disegno di campionamento distorto.':
    'Ein gutes AIC gleicht kein verzerrtes Auswahldesign aus.',
  'Valore stimato': 'Geschätzter Wert',
};
