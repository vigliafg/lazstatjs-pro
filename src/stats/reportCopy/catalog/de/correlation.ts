/** de: report and table prose (normalised). */
export const correlationCopy: Record<string, string> = {
  '; Pearson r = {s1} ({s2})': '; Pearson r = {s1} ({s2})',
  '{s1} {s2} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.':
    '{s1} {s2} die Signifikanzschwelle: Bei vielen Vergleichen sind einige falsch positive Ergebnisse zu erwarten, daher priorisieren Sie die stärksten und mit der Ausgangshypothese stimmigen Zusammenhänge.',
  '{s1} × {s2} controllando {s3}: r = {s4}, {s5} → {s6}.':
    '{s1} × {s2} unter Kontrolle von {s3}: r = {s4}, {s5} → {s6}.',
  '{s1} × {s2}: {s3} = {s4}, {s5} → associazione {s6}; relazione {s7}; r² = {s8} ({s9}% di varianza condivisa){s10}.':
    '{s1} × {s2}: {s3} = {s4}, {s5} → {s6} Zusammenhang; Beziehung {s7}; r² = {s8} ({s9} % gemeinsame Varianz){s10}.',
  '{s1} e significativa': '{s1} und signifikant',
  '{s1}-{s2}': '{s1}-{s2}',
  '{s1}{s2}': '{s1}{s2}',
  'Associazione presente': 'Zusammenhang vorhanden',
  'Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.':
    'Berechnet auf vollständigen Fällen für alle ausgewählten Variablen (Listwise Deletion), um eine invertierbare Matrix zu gewährleisten.',
  'CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).':
    'CI von Pearson: Fisher-z-Transformation, tanh(z ± z_krit/√(N−3)).',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'Coefficiente lineare di Pearson.': 'Linearer Koeffizient nach Pearson.',
  'Coefficiente non disponibile.': 'Koeffizient nicht verfügbar.',
  'Come leggere i numeri': 'Wie die Zahlen zu lesen sind',
  'controllando per le altre {s1} variabili · CI {s2}%':
    'unter Kontrolle der anderen {s1} Variablen · CI {s2} %',
  Controllate: 'Kontrolliert',
  'Coppia per coppia': 'Paar für Paar',
  'coppia supera': 'Paar überschreitet',
  'coppie superano': 'Paare überschreiten',
  'Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.':
    'Korrelation ist keine Kausalität: Eine dritte Variable kann beide erklären, oder die Richtung kann umgekehrt sein.',
  'Correlazioni a coppie': 'Paarweise Korrelationen',
  'Correlazioni parziali': 'Partielle Korrelationen',
  'Descrittive delle variabili': 'Deskriptive Werte der Variablen',
  df: 'df',
  'Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.':
    'Ausreißer und sehr schiefe Verteilungen können den Koeffizienten aufblähen oder auf null drücken: Prüfen Sie immer das Streudiagramm.',
  'Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.':
    'Der Koeffizient liegt zwischen −1 und +1: Null bedeutet keine Beziehung, die Extremwerte eine nahezu perfekte Beziehung in die eine oder andere Richtung.',
  'Il coefficiente va da −1 a +1: {s1} corrisponde a un legame {s2}; il segno indica solo la direzione.':
    'Der Koeffizient reicht von −1 bis +1: {s1} entspricht einer {s2} Beziehung; das Vorzeichen zeigt nur die Richtung.',
  'Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.':
    'Kendall vergleicht übereinstimmende und abweichende Paare: Er ist robust und eignet sich für kleine Stichproben mit vielen Rangbindungen.',
  'Kendall τ': 'Kendall τ',
  'L’associazione più forte è {s1} × {s2}: {s3} = {s4}, {s5} e significativa ({s6}).':
    'Der stärkste Zusammenhang ist {s1} × {s2}: {s3} = {s4}, {s5} und signifikant ({s6}).',
  'La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.':
    'Die partielle Korrelation misst die Beziehung zwischen zwei Variablen, nachdem der Effekt der anderen entfernt wurde: Bricht sie gegenüber der einfachen Korrelation ein, wurde die Beziehung zu einem großen Teil durch die kontrollierten Variablen erklärt.',
  'legame residuo significativo': 'signifikante Restbeziehung',
  'Matrice di correlazione di Kendall (τ-b)':
    'Kendall-Korrelationsmatrix (τ-b)',
  'Matrice di correlazione di Pearson (r)': 'Pearson-Korrelationsmatrix (r)',
  'Matrice di correlazione di Spearman (ρ)': 'Spearman-Korrelationsmatrix (ρ)',
  Max: 'Max',
  Mean: 'Mittelwert',
  Median: 'Median',
  'Metodo primario: {s1} · CI {s2}% · eliminazione pairwise':
    'Primäre Methode: {s1} · CI {s2} % · paarweiser Ausschluss',
  Min: 'Min',
  'Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.':
    'Misst, ob sich zwei Variablen gemeinsam bewegen und mit welcher Intensität, ohne anzunehmen, welche von beiden die andere beeinflusst.',
  N: 'N',
  'N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.':
    'N variiert zwischen den Paaren, wenn einige Zeilen fehlende Werte haben: Koeffizienten mit sehr unterschiedlichem N sind nicht direkt vergleichbar.',
  'n={s1}': 'n={s1}',
  'negativa (al crescere di una l’altra cala)':
    'negativ (wächst die eine, sinkt die andere)',
  'nessun legame residuo affidabile': 'keine verlässliche Restbeziehung',
  'Nessuna associazione': 'Kein Zusammenhang',
  'Nessuna associazione raggiunge la significatività: la più forte è {s1} × {s2} ({s3} = {s4}, {s5}).':
    'Kein Zusammenhang erreicht Signifikanz: Der stärkste ist {s1} × {s2} ({s3} = {s4}, {s5}).',
  'Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.':
    'Kein Paar überschreitet die gewählte Schwelle: Die beobachteten Schwankungen sind mit dem Zufall vereinbar.',
  'Nessuna correlazione calcolabile con i dati disponibili.':
    'Mit den verfügbaren Daten ist keine Korrelation berechenbar.',
  'non calcolabile': 'nicht berechenbar',
  'non significativa': 'nicht signifikant',
  'Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.':
    'Jedes Paar verwendet alle Zeilen mit beiden gültigen Werten (paarweiser Ausschluss): N kann zwischen den Paaren variieren.',
  p: 'p',
  'p < {s1} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.':
    'p < {s1} zeigt, dass der Koeffizient kaum allein durch Zufall erklärbar ist; es sagt nicht, dass die Beziehung stark ist.',
  'p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.':
    'p von Pearson und Spearman: t mit df = N − 2. p von Kendall: Normalapproximation mit Korrektur der Rangbindungen.',
  'Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.':
    'Pearson misst eine lineare Beziehung: Eine starke kurvenförmige Beziehung kann r nahe null ergeben.',
  'Pearson r': 'Pearson r',
  'positiva (al crescere di una cresce l’altra)':
    'positiv (wächst die eine, wächst die andere)',
  'Quanto è forte il legame': 'Wie stark die Beziehung ist',
  'r parziale': 'Partielles r',
  'r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).':
    'Partielles r aus der Inversen der Korrelationsmatrix: r_ij·rest = −P_ij/√(P_ii·P_jj); p mit t und df = N − q (q = Anzahl der ausgewählten Variablen).',
  'r²': 'r²',
  'r² = {s1}: le due variabili condividono circa il {s2}% della variabilità, il resto dipende da altro.':
    'r² = {s1}: Die beiden Variablen teilen etwa {s2} % der Variabilität, der Rest hängt von anderem ab.',
  'Report di lettura — Correlazione': 'Lesetext — Korrelation',
  'Rho di Spearman sui ranghi.': 'Spearman-Rho auf den Rängen.',
  SD: 'SD',
  'Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.':
    'Spearman arbeitet auf den Rängen: Er misst eine monotone Beziehung und ist robust gegenüber Ausreißern und nichtlinearen Skalen.',
  'Spearman ρ': 'Spearman ρ',
  'Tau-b di Kendall con correzione dei ranghi pari.':
    'Kendalls Tau-b mit Korrektur der Rangbindungen.',
  'Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.':
    'Unteres Dreieck: Koeffizient mit Signifikanzsternen (* p<.05, ** p<.01, *** p<.001). Oberes Dreieck: N des Paares.',
  'Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.':
    'Eine über einen engen Wertebereich berechnete Korrelation unterschätzt tendenziell die tatsächliche Beziehung.',
  'v{s1}': 'v{s1}',
  'Variabile A': 'Variable A',
  'Variabile B': 'Variable B',
  Variable: 'Variable',
};
