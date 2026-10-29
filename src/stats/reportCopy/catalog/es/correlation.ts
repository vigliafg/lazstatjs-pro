/** es: report and table prose (normalised). */
export const correlationCopy: Record<string, string> = {
  '; Pearson r = {s1} ({s2})':
    '; Pearson r = {s1} ({s2})',
  '{s1} {s2} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.':
    '{s1} {s2} el umbral de significación: con muchas comparaciones se espera algún falso positivo, así que da prioridad a las asociaciones más fuertes y coherentes con la hipótesis inicial.',
  '{s1} × {s2} controllando {s3}: r = {s4}, {s5} → {s6}.':
    '{s1} × {s2} controlando {s3}: r = {s4}, {s5} → {s6}.',
  '{s1} × {s2}: {s3} = {s4}, {s5} → associazione {s6}; relazione {s7}; r² = {s8} ({s9}% di varianza condivisa){s10}.':
    '{s1} × {s2}: {s3} = {s4}, {s5} → asociación {s6}; relación {s7}; r² = {s8} ({s9} % de varianza compartida){s10}.',
  '{s1} e significativa':
    '{s1} y significativa',
  '{s1}-{s2}':
    '{s1}-{s2}',
  '{s1}{s2}':
    '{s1}{s2}',
  'Associazione presente':
    'Asociación presente',
  'Calcolate su casi completi per tutte le variabili selezionate (listwise deletion), per garantire una matrice invertibile.':
    'Calculadas sobre casos completos para todas las variables seleccionadas (eliminación por lista), para garantizar una matriz invertible.',
  'CI di Pearson: trasformazione z di Fisher, tanh(z ± z_crit/√(N−3)).':
    'CI de Pearson: transformación z de Fisher, tanh(z ± z_crit/√(N−3)).',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'Coefficiente lineare di Pearson.':
    'Coeficiente lineal de Pearson.',
  'Coefficiente non disponibile.':
    'Coeficiente no disponible.',
  'Come leggere i numeri':
    'Cómo leer los números',
  'controllando per le altre {s1} variabili · CI {s2}%':
    'controlando por las otras {s1} variables · CI {s2}%',
  'Controllate':
    'Controladas',
  'Coppia per coppia':
    'Pareja por pareja',
  'coppia supera':
    'pareja supera',
  'coppie superano':
    'parejas superan',
  'Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.':
    'Correlación no es causalidad: una tercera variable puede explicar ambas, o la dirección puede ser inversa.',
  'Correlazioni a coppie':
    'Correlaciones por pares',
  'Correlazioni parziali':
    'Correlaciones parciales',
  'Descrittive delle variabili':
    'Descriptivos de las variables',
  'df':
    'df',
  'Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.':
    'Los valores atípicos y las distribuciones muy asimétricas pueden inflar o anular el coeficiente: revisa siempre el gráfico de dispersión.',
  'Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.':
    'El coeficiente está entre −1 y +1: el cero indica ausencia de relación y los valores extremos una relación casi perfecta en una dirección o en la otra.',
  'Il coefficiente va da −1 a +1: {s1} corrisponde a un legame {s2}; il segno indica solo la direzione.':
    'El coeficiente va de −1 a +1: {s1} corresponde a una relación {s2}; el signo indica solo la dirección.',
  'Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.':
    'Kendall compara parejas concordantes y discordantes: es robusto y adecuado para muestras pequeñas con muchos rangos empatados.',
  'Kendall τ':
    'Kendall τ',
  'L’associazione più forte è {s1} × {s2}: {s3} = {s4}, {s5} e significativa ({s6}).':
    'La asociación más fuerte es {s1} × {s2}: {s3} = {s4}, {s5} y significativa ({s6}).',
  'La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.':
    'La correlación parcial mide la relación entre dos variables eliminando el efecto de las demás: si cae respecto a la simple, la relación se explicaba en buena parte por las variables controladas.',
  'legame residuo significativo':
    'relación residual significativa',
  'Matrice di correlazione di Kendall (τ-b)':
    'Matriz de correlación de Kendall (τ-b)',
  'Matrice di correlazione di Pearson (r)':
    'Matriz de correlación de Pearson (r)',
  'Matrice di correlazione di Spearman (ρ)':
    'Matriz de correlación de Spearman (ρ)',
  'Max':
    'Máx',
  'Mean':
    'Media',
  'Median':
    'Mediana',
  'Metodo primario: {s1} · CI {s2}% · eliminazione pairwise':
    'Método principal: {s1} · CI {s2}% · eliminación por pares',
  'Min':
    'Mín',
  'Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.':
    'Mide si dos variables se mueven juntas y con qué intensidad, sin suponer cuál de las dos influye en la otra.',
  'N':
    'N',
  'N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.':
    'N varía entre las parejas cuando algunas filas tienen valores ausentes: coeficientes con N muy distinto no son directamente comparables.',
  'n={s1}':
    'n={s1}',
  'negativa (al crescere di una l’altra cala)':
    'negativa (al crecer una la otra decrece)',
  'nessun legame residuo affidabile':
    'ninguna relación residual fiable',
  'Nessuna associazione':
    'Ninguna asociación',
  'Nessuna associazione raggiunge la significatività: la più forte è {s1} × {s2} ({s3} = {s4}, {s5}).':
    'Ninguna asociación alcanza la significación: la más fuerte es {s1} × {s2} ({s3} = {s4}, {s5}).',
  'Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.':
    'Ninguna pareja supera el umbral elegido: las oscilaciones observadas son compatibles con el azar.',
  'Nessuna correlazione calcolabile con i dati disponibili.':
    'Ninguna correlación calculable con los datos disponibles.',
  'non calcolabile':
    'no calculable',
  'non significativa':
    'no significativa',
  'Ogni coppia usa tutte le righe con entrambi i valori validi (pairwise deletion): N può variare tra le coppie.':
    'Cada pareja usa todas las filas con ambos valores válidos (eliminación por pares): N puede variar entre las parejas.',
  'p':
    'p',
  'p < {s1} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.':
    'p < {s1} indica que el coeficiente difícilmente se explica solo por el azar; no dice que la relación sea fuerte.',
  'p di Pearson e Spearman: t con df = N − 2. p di Kendall: approssimazione normale con correzione dei ranghi pari.':
    'p de Pearson y Spearman: t con df = N − 2. p de Kendall: aproximación normal con corrección de los rangos empatados.',
  'Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.':
    'Pearson mide una relación lineal: una relación curva fuerte puede dar r cercano a cero.',
  'Pearson r':
    'Pearson r',
  'positiva (al crescere di una cresce l’altra)':
    'positiva (al crecer una crece la otra)',
  'Quanto è forte il legame':
    'Cuán fuerte es la relación',
  'r parziale':
    'r parcial',
  'r parziale da inversa della matrice di correlazione: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t e df = N − q (q = numero di variabili selezionate).':
    'r parcial a partir de la inversa de la matriz de correlación: r_ij·rest = −P_ij/√(P_ii·P_jj); p con t y df = N − q (q = número de variables seleccionadas).',
  'r²':
    'r²',
  'r² = {s1}: le due variabili condividono circa il {s2}% della variabilità, il resto dipende da altro.':
    'r² = {s1}: las dos variables comparten alrededor del {s2} % de la variabilidad; el resto depende de otros factores.',
  'Report di lettura — Correlazione':
    'Informe de lectura — Correlación',
  'Rho di Spearman sui ranghi.':
    'Rho de Spearman sobre los rangos.',
  'SD':
    'SD',
  'Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.':
    'Spearman trabaja sobre los rangos: mide una relación monótona y resiste a los valores atípicos y a las escalas no lineales.',
  'Spearman ρ':
    'Spearman ρ',
  'Tau-b di Kendall con correzione dei ranghi pari.':
    'Tau-b de Kendall con corrección de los rangos empatados.',
  'Triangolo inferiore: coefficiente con stelle di significatività (* p<.05, ** p<.01, *** p<.001). Triangolo superiore: N della coppia.':
    'Triángulo inferior: coeficiente con estrellas de significación (* p<.05, ** p<.01, *** p<.001). Triángulo superior: N de la pareja.',
  'Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.':
    'Una correlación calculada en un intervalo restringido de valores tiende a subestimar la relación real.',
  'v{s1}':
    'v{s1}',
  'Variabile A':
    'Variable A',
  'Variabile B':
    'Variable B',
  'Variable':
    'Variable',
};
