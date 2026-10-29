/** es: report and table prose (normalised). */
export const regressionCopy: Record<string, string> = {
  ' ({s1})':
    ' ({s1})',
  ' + ({s1}) × {s2}':
    ' + ({s1}) × {s2}',
  ', Lilliefors {s1}':
    ', Lilliefors {s1}',
  '; VIF = {s1} segnala collinearità':
    '; VIF = {s1} señala colinealidad',
  '; β standardizzato = {s1}':
    '; β tipificado = {s1}',
  '{s1} · CI {s2}%':
    '{s1} · CI {s2}%',
  '{s1} ~ {s2}':
    '{s1} ~ {s2}',
  '{s1} osservazioni con residuo studentizzato oltre 3 SD: verificane l’influenza sulle stime.':
    '{s1} observaciones con residuo estudentizado más allá de 3 SD: comprueba su influencia en las estimaciones.',
  '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. In media, un aumento di una unità di {s7} {s8} {s9} di {s10} a parità delle altre variabili{s11}{s12}.':
    '{s1}: B = {s2} (CI {s3}% {s4}), {s5} → {s6}. En promedio, un aumento de una unidad de {s7} {s8} {s9} de {s10} manteniendo constantes las demás variables{s11}{s12}.',
  '→ collinearità problematica: i coefficienti dei predittori coinvolti sono instabili':
    '→ colinealidad problemática: los coeficientes de los predictores implicados son inestables',
  '→ collinearità sotto la soglia di attenzione (5)':
    '→ colinealidad por debajo del umbral de atención (5)',
  '|DFBETAS| massimo':
    '|DFBETAS| máximo',
  '√(SSE / {s1})':
    '√(SSE / {s1})',
  '≈2 assenza di autocorrelazione; ordine righe':
    '≈2 ausencia de autocorrelación; orden de filas',
  'Adjusted R²':
    'R² ajustada',
  'AIC':
    'AIC',
  'ANOVA del modello':
    'ANOVA del modelo',
  'aumenta':
    'aumenta',
  'B':
    'B',
  'B è il cambiamento atteso nella variabile dipendente per una unità in più del predittore, tenendo fermi gli altri: l’unità conta, e molto.':
    'B es el cambio esperado en la variable dependiente por una unidad más del predictor, manteniendo fijos los demás: la unidad importa, y mucho.',
  'BIC':
    'BIC',
  'Breusch–Pagan {s1} → {s2}.':
    'Breusch–Pagan {s1} → {s2}.',
  'Breusch–Pagan LM':
    'Breusch–Pagan LM',
  'Breusch–Pagan p':
    'p de Breusch–Pagan',
  'Breusch–Pagan richiede l’ipotesi di normalità dei residui; con N piccolo ha potenza limitata.':
    'Breusch–Pagan requiere el supuesto de normalidad de los residuos; con N pequeño tiene potencia limitada.',
  'CI {s1}% · stima OLS':
    'CI {s1}% · estimación OLS',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'CI: B ± t({s1}%, df = {s2})·SE. β std. = B·SD(x)/SD(y).':
    'CI: B ± t({s1}%, df = {s2})·SE. β tip. = B·SD(x)/SD(y).',
  'Coefficienti':
    'Coeficientes',
  'Come leggere i numeri':
    'Cómo leer los números',
  'Con più predittori il Theil–Sen è calcolato separatamente per ciascun predittore e non controlla gli altri: usarlo solo come diagnostica descrittiva.':
    'Con más predictores, el Theil–Sen se calcula por separado para cada predictor y no controla los demás: úsalo solo como diagnóstico descriptivo.',
  'Condition index > 30':
    'Índice de condición > 30',
  'Condition index di Belsley calcolato sugli autovalori di XᵀX dopo scala a norma unitaria: valori > 30 suggeriscono collinearità, > 100 sono gravi.':
    'Índice de condición de Belsley calculado sobre los valores propios de XᵀX tras escalar a norma unitaria: valores > 30 sugieren colinealidad; > 100 son graves.',
  'Condition index massimo':
    'Índice de condición máximo',
  'Confronto tra OLS e stimatore robusto{s1}: se le due pendenze sono simili, gli outlier non stanno distorcendo il risultato.':
    'Comparación entre OLS y estimador robusto{s1}: si las dos pendientes son similares, los valores atípicos no están distorsionando el resultado.',
  'Cook\'s D > 1':
    'D de Cook > 1',
  'Cook\'s D massimo':
    'D de Cook máxima',
  'corretto per numero di predittori':
    'ajustada por el número de predictores',
  'Dettaglio':
    'Detalle',
  'df':
    'df',
  'DFBETAS oltre 2/√n':
    'DFBETAS más allá de 2/√n',
  'Diagnostica dei residui':
    'Diagnóstico de los residuos',
  'Diagnostica del modello':
    'Diagnóstico del modelo',
  'Differenza percentuale: {s1}%.':
    'Diferencia porcentual: {s1} %.',
  'diminuisce':
    'disminuye',
  'Durbin–Watson':
    'Durbin–Watson',
  'Equazione stimata: {s1} = {s2}{s3}.':
    'Ecuación estimada: {s1} = {s2}{s3}.',
  'Errori standard robusti':
    'Errores estándar robustos',
  'eteroschedasticità dei residui':
    'heterocedasticidad de los residuos',
  'eteroschedasticità dei residui: gli errori standard e i p-value possono essere inaffidabili':
    'heterocedasticidad de los residuos: los errores estándar y los valores p pueden no ser fiables',
  'Eteroschedasticità non verificabile.':
    'Heterocedasticidad no verificable.',
  'Excess kurtosis':
    'Curtosis en exceso',
  'F':
    'F',
  'F con 1 e df del modello aumentato':
    'F con 1 y df del modelo aumentado',
  'F({s1}, {s2})':
    'F({s1}, {s2})',
  'h_ii = x_iᵀ(XᵀX)⁻¹x_i':
    'h_ii = x_iᵀ(XᵀX)⁻¹x_i',
  'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matrice di covarianza robusta non assume varianza costante.':
    'HC1 = n/(n−k−1); HC3 = 1/(1−h)². La matriz de covarianza robusta no supone varianza constante.',
  'I gradi di libertà restano n−k−1; con pochi casi i test robusti sono instabili.':
    'Los grados de libertad siguen siendo n−k−1; con pocos casos las pruebas robustas son inestables.',
  'I predittori con effetto affidabile sono: {s1}. L’associazione stimata non è una prova di causa-effetto: serve un disegno che escluda fattori confondenti.':
    'Los predictores con efecto fiable son: {s1}. La asociación estimada no es una prueba de causa-efecto: hace falta un diseño que excluya factores de confusión.',
  'I residui Theil–Sen sono disponibili per la regressione semplice; con più predittori il TS è univariato e non definisce un modello congiunto.':
    'Los residuos Theil–Sen están disponibles para la regresión simple; con más predictores el TS es univariado y no define un modelo conjunto.',
  'Il CI al {s1}% del coefficiente è la forbice dei valori plausibili: se contiene lo zero l’effetto non è distinguibile da nessun effetto.':
    'El CI al {s1} % del coeficiente es el abanico de valores plausibles: si contiene el cero, el efecto no se distingue de ningún efecto.',
  'Il modello cerca la retta (o l’iperpiano) che rende minima la somma degli scarti al quadrato: i coefficienti indicano l’effetto di ogni variabile tenendo ferme le altre.':
    'El modelo busca la recta (o el hiperplano) que hace mínima la suma de los desvíos al cuadrado: los coeficientes indican el efecto de cada variable manteniendo fijas las demás.',
  'Il modello è significativo (F = {s1}, {s2}) e spiega il {s3}% della variabilità di {s4}.':
    'El modelo es significativo (F = {s1}, {s2}) y explica el {s3} % de la variabilidad de {s4}.',
  'il modello nel complesso è utile':
    'el modelo en conjunto es útil',
  'il modello nel complesso non è distinguibile dal caso':
    'el modelo en conjunto no se distingue del azar',
  'Il modello nel suo insieme':
    'El modelo en conjunto',
  'Il modello non è significativo (F = {s1}, {s2}): i predittori non spiegano {s3} meglio del caso.':
    'El modelo no es significativo (F = {s1}, {s2}): los predictores no explican {s3} mejor que el azar.',
  'Il modello non è stimabile con i dati disponibili.':
    'El modelo no se puede estimar con los datos disponibles.',
  'In pratica':
    'En la práctica',
  'influenza su singolo coefficiente':
    'influencia sobre un coeficiente concreto',
  'Intercept':
    'Intercepto',
  'Jarque–Bera p':
    'p de Jarque–Bera',
  'La regressione descrive associazioni, non cause: variabili omesse o invertite possono spiegare lo stesso pattern.':
    'La regresión describe asociaciones, no causas: variables omitidas o invertidas pueden explicar el mismo patrón.',
  'Le previsioni valgono solo dentro l’intervallo dei valori osservati: fuori da quel range l’estrapolazione è arbitraria.':
    'Las predicciones solo valen dentro del intervalo de los valores observados: fuera de ese rango la extrapolación es arbitraria.',
  'Le righe incomplete vengono scartate per intero: se i dati mancanti non sono casuali il modello può essere distorto.':
    'Las filas incompletas se descartan por completo: si los datos ausentes no son aleatorios, el modelo puede estar sesgado.',
  'Leverage massimo':
    'Apalancamiento máximo',
  'Lilliefors p':
    'p de Lilliefors',
  'Max':
    'Máx',
  'Mean':
    'Media',
  'Median':
    'Mediana',
  'Metrica':
    'Métrica',
  'Min':
    'Mín',
  'Modello non utile':
    'Modelo no útil',
  'Modello utile':
    'Modelo útil',
  'MS':
    'MS',
  'N':
    'N',
  'n·ln(SSE/n) + 2(k+1)':
    'n·ln(SSE/n) + 2(k+1)',
  'n·ln(SSE/n) + ln(n)(k+1)':
    'n·ln(SSE/n) + ln(n)(k+1)',
  'Nessun coefficiente disponibile.':
    'Ningún coeficiente disponible.',
  'Nessun predittore mostra un effetto affidabile: il modello, così com’è, non è uno strumento di previsione utile su questi dati.':
    'Ningún predictor muestra un efecto fiable: el modelo, tal como está, no es una herramienta de predicción útil con estos datos.',
  'Nessun residuo studentizzato oltre 3 SD: nessun caso fortemente anomalo rispetto al modello.':
    'Ningún residuo estudentizado más allá de 3 SD: ningún caso fuertemente anómalo respecto al modelo.',
  'nessuna evidenza contro la normalità dei residui':
    'ninguna evidencia contra la normalidad de los residuos',
  'nessuna evidenza di effetto':
    'ninguna evidencia de efecto',
  'nessuna evidenza di eteroschedasticità':
    'ninguna evidencia de heterocedasticidad',
  'non cambia':
    'no cambia',
  'non linearità da potenze dei valori adattati':
    'no linealidad por potencias de los valores ajustados',
  'non stimabile':
    'no estimable',
  'Normalità dei residui: Jarque–Bera {s1}{s2} → {s3}.':
    'Normalidad de los residuos: Jarque–Bera {s1}{s2} → {s3}.',
  'Nota':
    'Nota',
  'numero di dimensioni coinvolte':
    'número de dimensiones implicadas',
  'numero di osservazioni':
    'número de observaciones',
  'Ogni predittore':
    'Cada predictor',
  'OLS':
    'OLS',
  'OLS B':
    'B de OLS',
  'OLS vs Theil–Sen':
    'OLS frente a Theil–Sen',
  'osservazioni complete (k = {s1} predittori)':
    'observaciones completas (k = {s1} predictores)',
  'Osservazioni usate: {s1} (solo righe complete su tutte le variabili del modello).':
    'Observaciones usadas: {s1} (solo filas completas en todas las variables del modelo).',
  'outlier sui residui studentizzati':
    'atípicos en los residuos estudentizados',
  'p':
    'p',
  'p (F)':
    'p (F)',
  'Parametro':
    'Parámetro',
  'Pendenza OLS = {s1}, pendenza Theil–Sen = {s2} (CI {s3}% {s4}).':
    'Pendiente OLS = {s1}, pendiente Theil–Sen = {s2} (CI {s3}% {s4}).',
  'Predictor':
    'Predictor',
  'predittore significativo':
    'predictor significativo',
  'quadrati e prodotti incrociati dei predittori':
    'cuadrados y productos cruzados de los predictores',
  'quota di varianza spiegata':
    'proporción de varianza explicada',
  'R':
    'R',
  'R²':
    'R²',
  'R² = {s1} → il modello spiega il {s2}% della variabilità di {s3}.':
    'R² = {s1} → el modelo explica el {s2} % de la variabilidad de {s3}.',
  'R² alto non significa modello corretto: guarda sempre residui, diagnostica e senso delle variabili.':
    'Una R² alta no significa un modelo correcto: mira siempre los residuos, el diagnóstico y el sentido de las variables.',
  'R² corretto = {s1} → quota spiegata al netto del numero di predittori; se è molto più basso di R² il modello è sovra-adattato.':
    'R² ajustada = {s1} → proporción explicada al descontar el número de predictores; si es mucho más baja que la R², el modelo está sobreajustado.',
  'R² e F assumono un modello con intercetta. AIC/BIC sono definiti a meno di una costante additiva.':
    'R² y F suponen un modelo con intercepto. AIC/BIC se definen salvo una constante aditiva.',
  'Report di lettura — Regressione':
    'Informe de lectura — Regresión',
  'RESET F (ŷ²)':
    'RESET F (ŷ²)',
  'RESET p':
    'p de RESET',
  'residui non gaussiani: gli intervalli di confidenza vanno letti con prudenza':
    'residuos no gaussianos: los intervalos de confianza deben leerse con prudencia',
  'Residui OLS':
    'Residuos OLS',
  'Residui oltre 3 SD':
    'Residuos más allá de 3 SD',
  'Residui studentizzati |z| > 3':
    'Residuos estudentizados |z| > 3',
  'Residui Theil–Sen':
    'Residuos Theil–Sen',
  'SD':
    'SD',
  'SE':
    'SE',
  'SE of estimate':
    'SE de la estimación',
  'SE robusto':
    'SE robusto',
  'Sintesi del modello':
    'Resumen del modelo',
  'Skewness':
    'Asimetría',
  'Slope':
    'Pendiente',
  'soglia {s1}':
    'umbral {s1}',
  'Source':
    'Fuente',
  'SS':
    'SS',
  'Stima come {s1} cambia al variare di {s2} e quanto quella relazione spiega dei dati osservati.':
    'Estima cómo cambia {s1} al variar {s2} y cuánto de los datos observados explica esa relación.',
  'Stima robusta Theil–Sen':
    'Estimación robusta Theil–Sen',
  'Stimatore robusto Theil–Sen':
    'Estimador robusto Theil–Sen',
  'Stimatori robusti univariati':
    'Estimadores robustos univariados',
  't':
    't',
  'test globale del modello':
    'prueba global del modelo',
  'Test globale: F = {s1}, {s2} (α = {s3}) → {s4}.':
    'Prueba global: F = {s1}, {s2} (α = {s3}) → {s4}.',
  'Theil–Sen':
    'Theil–Sen',
  'Theil–Sen slope':
    'Pendiente de Theil–Sen',
  'Theil–Sen: mediana delle pendenze tra tutte le coppie di punti; CI bootstrap percentile (600 repliche, seed fisso).':
    'Theil–Sen: mediana de las pendientes entre todas las parejas de puntos; CI bootstrap percentil (600 réplicas, semilla fija).',
  'Tolerance':
    'Tolerancia',
  'TS CI high':
    'TS CI superior',
  'TS CI low':
    'TS CI inferior',
  'Valore':
    'Valor',
  'valori > 1 indicano osservazioni influenti':
    'valores > 1 indican observaciones influyentes',
  'VIF':
    'VIF',
  'VIF = 1/(1−R²_aux) da regressione del predittore sugli altri; valori > 5 indicano collinearità problematica.':
    'VIF = 1/(1−R²_aux) de la regresión del predictor sobre los demás; valores > 5 indican colinealidad problemática.',
  'VIF massimo = {s1} {s2}.':
    'VIF máximo = {s1} {s2}.',
  'White LM':
    'White LM',
  'White p':
    'p de White',
  'White usa n·R² della regressione ausiliaria (quadrati e prodotti incrociati); RESET2 aggiunge ŷ². DFBETAS misura il cambio standardizzato di un coefficiente eliminando un’osservazione.':
    'White usa n·R² de la regresión auxiliar (cuadrados y productos cruzados); RESET2 añade ŷ². DFBETAS mide el cambio tipificado de un coeficiente al eliminar una observación.',
  'X scalato a norma unitaria; > 30 collinearità':
    'X escalada a norma unitaria; > 30 colinealidad',
  'β std.':
    'β tip.',
  'χ² con {s1} df':
    'χ² con {s1} df',
};
