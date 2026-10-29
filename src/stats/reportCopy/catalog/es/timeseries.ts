/** es: report and table prose (normalised). */
export const timeseriesCopy: Record<string, string> = {
  ' · periodo stagionale = {s1}':
    ' · periodo estacional = {s1}',
  ' (ADF p ≈ {s1} resta solo informativo)':
    ' (el p de ADF ≈ {s1} queda solo como información)',
  ', compatibile con una successione casuale':
    ', compatible con una sucesión aleatoria',
  ', la successione non è casuale':
    ', la sucesión no es aleatoria',
  '{s1} = {s2} ({s3}): {s4}.':
    '{s1} = {s2} ({s3}): {s4}.',
  'ACF':
    'ACF',
  'Attenzione: almeno una radice è vicina o dentro il cerchio unitario, quindi la stima è al limite della regione ammissibile e le previsioni vanno lette con prudenza.':
    'Atención: al menos una raíz está cerca o dentro del círculo unitario, así que la estimación está en el límite de la región admisible y las previsiones deben leerse con prudencia.',
  'Autocorrelazione e autocorrelazione parziale':
    'Autocorrelación y autocorrelación parcial',
  'autocorrelazione presente':
    'autocorrelación presente',
  'banda di confidenza ±1,96/√N = ±{s1}':
    'banda de confianza ±1.96/√N = ±{s1}',
  'Barre oltre la banda indicano autocorrelazione non spiegata dal caso.':
    'Barras fuera de la banda indican autocorrelación no explicada por el azar.',
  'batte il riferimento più semplice (RMSE {s1})':
    'supera al modelo de referencia más simple (RMSE {s1})',
  'c’è un {s1} (Mann–Kendall p = {s2})':
    'hay una {s1} (p de Mann–Kendall = {s2})',
  'circa {s1} deviazioni standard':
    'aproximadamente {s1} desviaciones estándar',
  'compatibile con il caso':
    'compatible con el azar',
  'Con orizzonti lunghi l’errore cresce: oltre un ciclo stagionale le previsioni vanno lette come indicazione di direzione.':
    'Con horizontes largos el error crece: más allá de un ciclo estacional las previsiones deben leerse como indicación de dirección.',
  'Confronto dei modelli di previsione':
    'Comparación de los modelos de previsión',
  'Dettaglio':
    'Detalle',
  'Deviazione standard':
    'Desviación estándar',
  'Differenziazione: {s1}; scelta {s2}. {s3}':
    'Diferenciación: {s1}; elección {s2}. {s3}',
  'è sostanzialmente equivalente al riferimento più semplice (RMSE {s1})':
    'es sustancialmente equivalente al modelo de referencia más simple (RMSE {s1})',
  'Errore standard residuo':
    'Error estándar residual',
  'Errore standard residuo sulla scala modellata: {s1} su {s2} osservazioni efficaci.':
    'Error estándar residual en la escala modelada: {s1} sobre {s2} observaciones efectivas.',
  'errore su un campione di validazione (ultimo 20% della serie)':
    'error sobre una muestra de validación (último 20 % de la serie)',
  'Forza della stagionalità':
    'Fuerza de la estacionalidad',
  'Forza della stagionalità = {s1} (0 = nessuna, 1 = stagionalità dominante).':
    'Fuerza de la estacionalidad = {s1} (0 = ninguna, 1 = estacionalidad dominante).',
  'Gli indici per posizione nel ciclo dicono quali periodi stanno sopra o sotto la tendenza: sono scostamenti medi, non valori assoluti.':
    'Los índices por posición en el ciclo dicen qué periodos están por encima o por debajo de la tendencia: son desviaciones medias, no valores absolutos.',
  'Gli indici sono scostamenti medi dal trend, centrati su zero: valori positivi indicano periodi sopra la tendenza.':
    'Los índices son desviaciones medias respecto a la tendencia, centradas en cero: los valores positivos indican periodos por encima de la tendencia.',
  'Gli intervalli di previsione non includono l’incertezza sulla stima dei parametri né sulla scelta dell’ordine; volatilità condizionale (GARCH) e regressori esterni non sono modellati.':
    'Los intervalos de previsión no incluyen la incertidumbre sobre la estimación de los parámetros ni sobre la elección del orden; la volatilidad condicional (GARCH) y los regresores externos no se modelan.',
  'Gli intervalli includono l’accumulo di incertezza dovuto alla differenziazione, ma non l’incertezza sulla stima dei parametri né quella sulla scelta dell’ordine.':
    'Los intervalos incluyen la acumulación de incertidumbre debida a la diferenciación, pero no la incertidumbre sobre la estimación de los parámetros ni la de la elección del orden.',
  'il distacco dal secondo classificato è Δ AICc = {s1}, quindi la scelta è netta':
    'la distancia al segundo clasificado es Δ AICc = {s1}, así que la elección es clara',
  'Il MAPE non è definito quando la serie contiene zeri.':
    'El MAPE no está definido cuando la serie contiene ceros.',
  'Il modello {s1} porta la previsione da {s2} al passo {s3} a {s4} al passo {s5}, su {s6} passi.':
    'El modelo {s1} lleva la previsión de {s2} en el paso {s3} a {s4} en el paso {s5}, sobre {s6} pasos.',
  'Il modello migliore in validazione è {s1} (RMSE = {s2}, MAE = {s3}): qualità {s4} rispetto alla variabilità della serie.':
    'El mejor modelo en validación es {s1} (RMSE = {s2}, MAE = {s3}): calidad {s4} respecto a la variabilidad de la serie.',
  'il secondo classificato è a Δ AICc = {s1}, quindi i dati non distinguono nettamente i due ordini':
    'el segundo clasificado está a Δ AICc = {s1}, así que los datos no distinguen claramente los dos órdenes',
  'Il test ADF non è calcolabile su questa serie: la differenziazione va decisa a mano.':
    'La prueba ADF no se puede calcular en esta serie: la diferenciación debe decidirse a mano.',
  'Il test ADF sulla serie dà p ≈ {s1}: {s2}.':
    'La prueba ADF sobre la serie da p ≈ {s1}: {s2}.',
  'Il test dei runs verifica che l’ordine dei valori sia casuale, non la loro distribuzione.':
    'La prueba de rachas comprueba que el orden de los valores sea aleatorio, no su distribución.',
  'Il test di autocorrelazione sui residui non è calcolabile.':
    'La prueba de autocorrelación sobre los residuos no se puede calcular.',
  'Imposta un periodo stagionale (per esempio 12 per dati mensili, 4 per trimestrali) per stimare gli indici e scomporre la serie.':
    'Define un periodo estacional (por ejemplo 12 para datos mensuales, 4 para trimestrales) para estimar los índices y descomponer la serie.',
  'In validazione sugli ultimi {s1} valori l’RMSE è {s2} e il modello {s3}.':
    'En validación sobre los últimos {s1} valores el RMSE es {s2} y el modelo {s3}.',
  'Indice':
    'Índice',
  'Indici stagionali':
    'Índices estacionales',
  'Intervallo al {s1}%: {s2} – {s3} al primo passo e {s4} – {s5} all’ultimo; l’ampiezza passa da {s6} a {s7}, come ci si aspetta quando l’orizzonte cresce.':
    'Intervalo al {s1} %: {s2} – {s3} en el primer paso y {s4} – {s5} en el último; la amplitud pasa de {s6} a {s7}, como se espera cuando crece el horizonte.',
  'L’ACF misura quanto un valore è correlato con quelli precedenti. Se le barre restano dentro la banda ±1,96/√N, la serie non mostra memoria temporale; se escono, il passato contiene informazione sul presente.':
    'La ACF mide cuánto se correlaciona un valor con los anteriores. Si las barras quedan dentro de la banda ±1.96/√N, la serie no muestra memoria temporal; si salen, el pasado contiene información sobre el presente.',
  'L’analisi descrittiva di una serie storica verifica se i valori sono indipendenti dal tempo: trend, autocorrelazione e stagionalità sono le tre strutture che rendono una serie diversa da un campione casuale.':
    'El análisis descriptivo de una serie temporal comprueba si los valores son independientes del tiempo: tendencia, autocorrelación y estacionalidad son las tres estructuras que hacen que una serie sea distinta de una muestra aleatoria.',
  'la componente stagionale domina la variabilità attorno al trend.':
    'la componente estacional domina la variabilidad en torno a la tendencia.',
  'la componente stagionale è presente ma non domina la variabilità attorno al trend.':
    'la componente estacional está presente pero no domina la variabilidad en torno a la tendencia.',
  'La differenziazione è impostata a mano, quindi l’ordine non dipende dai test{s1}.':
    'La diferenciación se fija a mano, así que el orden no depende de las pruebas{s1}.',
  'La forza della stagionalità è {s1}: {s2}':
    'La fuerza de la estacionalidad es {s1}: {s2}',
  'La PACF isola la correlazione al lag k al netto dei lag intermedi: un taglio netto dopo il lag 1 suggerisce un processo AR(1).':
    'La PACF aísla la correlación en el retardo k al margen de los retardos intermedios: un corte neto después del retardo 1 sugiere un proceso AR(1).',
  'La pendenza di Sen è la mediana delle pendenze tra tutte le coppie di punti: è robusta agli outlier.':
    'La pendiente de Sen es la mediana de las pendientes entre todas las parejas de puntos: es robusta frente a valores atípicos.',
  'la radice unitaria non è rifiutata, quindi almeno una differenziazione serve':
    'no se rechaza la raíz unitaria, así que hace falta al menos una diferenciación',
  'La ricerca automatica sull\'ordine ha scelto {s1} (AICc = {s2}): {s3}.':
    'La búsqueda automática del orden ha elegido {s1} (AICc = {s2}): {s3}.',
  'La ricerca degli ordini è limitata a p e q ≤ 2 (≤ 1 con meno di 30 osservazioni) e a un termine stagionale AR e MA: ordini maggiori non vengono esplorati.':
    'La búsqueda de órdenes se limita a p y q ≤ 2 (≤ 1 con menos de 30 observaciones) y a un término estacional AR y MA: no se exploran órdenes mayores.',
  'La scomposizione è additiva; con ampiezza stagionale proporzionale al livello serve un modello moltiplicativo.':
    'La descomposición es aditiva; con amplitud estacional proporcional al nivel hace falta un modelo multiplicativo.',
  'La serie è troppo corta per confrontare modelli di previsione.':
    'La serie es demasiado corta para comparar modelos de previsión.',
  'La serie non permette di stimare un modello ARIMA: le previsioni restano quelle dei modelli semplici.':
    'La serie no permite estimar un modelo ARIMA: las previsiones siguen siendo las de los modelos simples.',
  'la stazionarietà non è rifiutata, quindi la serie non va differenziata':
    'no se rechaza la estacionariedad, así que la serie no debe diferenciarse',
  'La stima ARIMA è condizionale (somma dei quadrati dei residui) e non a massima verosimiglianza esatta: con serie molto corte i primi residui pesano di più.':
    'La estimación ARIMA es condicional (suma de cuadrados de los residuos) y no de máxima verosimilitud exacta: con series muy cortas los primeros residuos pesan más.',
  'Lag':
    'Retardo',
  'le autocorrelazioni non sono congiuntamente significative (Ljung–Box p = {s1}): non emerge una struttura temporale forte':
    'las autocorrelaciones no son conjuntamente significativas (p de Ljung–Box = {s1}): no emerge una estructura temporal fuerte',
  'le autocorrelazioni sono congiuntamente significative (Ljung–Box p = {s1}): i valori dipendono dai precedenti':
    'las autocorrelaciones son conjuntamente significativas (p de Ljung–Box = {s1}): los valores dependen de los anteriores',
  'Le previsioni non hanno una validazione fuori campione: l’errore in campione è ottimista perché i parametri sono stati stimati sugli stessi dati.':
    'Las previsiones no tienen validación fuera de muestra: el error en muestra es optimista porque los parámetros se estimaron sobre los mismos datos.',
  'Le previsioni sono puntuali: non incorporano l’incertezza del modello né quella dei dati.':
    'Las previsiones son puntuales: no incorporan la incertidumbre del modelo ni la de los datos.',
  'Le prime e le ultime osservazioni non hanno trend stimato: la media mobile centrata non è definita ai bordi.':
    'Las primeras y las últimas observaciones no tienen tendencia estimada: la media móvil centrada no está definida en los bordes.',
  'Le prossime {s1} previsioni partono da {s2} e arrivano a {s3}.':
    'Las próximas {s1} previsiones parten de {s2} y llegan a {s3}.',
  'Le radici AR e MA stanno fuori dal cerchio unitario: il modello è stazionario e invertibile, quindi le previsioni convergono invece di divergere.':
    'Las raíces AR y MA quedan fuera del círculo unitario: el modelo es estacionario e invertible, así que las previsiones convergen en lugar de divergir.',
  'Lettura':
    'Lectura',
  'Limite alto':
    'Límite superior',
  'Limite basso':
    'Límite inferior',
  'Ljung–Box (lag 1–{s1})':
    'Ljung–Box (retardos 1–{s1})',
  'Ljung–Box verifica se le prime autocorrelazioni sono congiuntamente nulle.':
    'Ljung–Box comprueba si las primeras autocorrelaciones son conjuntamente nulas.',
  'Ljung–Box: Q = {s1} con p = {s2}. {s3}.':
    'Ljung–Box: Q = {s1} con p = {s2}. {s3}.',
  'MAE':
    'MAE',
  'Mann–Kendall (trend)':
    'Mann–Kendall (tendencia)',
  'Mann–Kendall è non parametrico e resistente agli outlier: p piccolo indica una tendenza monotona.':
    'Mann–Kendall es no paramétrica y resistente a los valores atípicos: un p pequeño indica una tendencia monótona.',
  'MAPE %':
    'MAPE %',
  'Massimo':
    'Máximo',
  'Media':
    'Media',
  'Metrica':
    'Métrica',
  'Minimo':
    'Mínimo',
  'Modello':
    'Modelo',
  'Modello {s1}':
    'Modelo {s1}',
  'modello additivo · periodo {s1}':
    'modelo aditivo · periodo {s1}',
  'molto buona':
    'muy buena',
  'N = {s1}{s2}':
    'N = {s1}{s2}',
  'Nessun termine AR o MA significativo: il modello si riduce a una media (o a un drift) più rumore.':
    'Ningún término AR o MA significativo: el modelo se reduce a una media (o a una deriva) más ruido.',
  'nessun trend monotono':
    'ninguna tendencia monótona',
  'nessuna autocorrelazione residua, il modello ha catturato la memoria della serie':
    'ninguna autocorrelación residual; el modelo ha capturado la memoria de la serie',
  'nessuna autocorrelazione rilevante':
    'ninguna autocorrelación relevante',
  'non batte il riferimento più semplice (RMSE {s1}): la struttura aggiuntiva non ripaga':
    'no supera al modelo de referencia más simple (RMSE {s1}): la estructura adicional no compensa',
  'non c’è evidenza di un {s1} (Mann–Kendall p = {s2})':
    'no hay evidencia de una {s1} (p de Mann–Kendall = {s2})',
  'non calcolabile':
    'no calculable',
  'non ci sono altri ordini confrontabili':
    'no hay otros órdenes comparables',
  'Non è stato possibile stimare un modello ARIMA su questa serie: le previsioni mostrate sono quelle dei modelli semplici.':
    'No ha sido posible estimar un modelo ARIMA sobre esta serie: las previsiones mostradas son las de los modelos simples.',
  'orizzonte {s1} passi':
    'horizonte {s1} pasos',
  'Osservazioni':
    'Observaciones',
  'Osservazioni efficaci':
    'Observaciones efectivas',
  'p':
    'p',
  'PACF':
    'PACF',
  'Passo':
    'Paso',
  'Pendenza di Sen':
    'Pendiente de Sen',
  'Pendenza di Sen = {s1} per passo: {s2} mediana, robusta agli outlier.':
    'Pendiente de Sen = {s1} por paso: {s2} mediana, robusta frente a valores atípicos.',
  'Posizione nel ciclo':
    'Posición en el ciclo',
  'Previsione':
    'Previsión',
  'Previsioni ({s1})':
    'Previsiones ({s1})',
  'Primo valore':
    'Primer valor',
  'Questi modelli servono da riferimento: il migliore viene confrontato con l’ARIMA, che è il modello usato per le previsioni con intervalli.':
    'Estos modelos sirven de referencia: el mejor se compara con el ARIMA, que es el modelo usado para las previsiones con intervalos.',
  'Qui {s1}, e {s2}.':
    'Aquí {s1}, y {s2}.',
  'Report di lettura':
    'Informe de lectura',
  'Residui: Ljung–Box {s1} → {s2}.':
    'Residuos: Ljung–Box {s1} → {s2}.',
  'Residuo':
    'Residuo',
  'resta autocorrelazione non spiegata, l’ordine andrebbe rivisto':
    'queda autocorrelación no explicada; habría que revisar el orden',
  'RMSE':
    'RMSE',
  'RMSE e MAE sono nella stessa unità della serie; il MAPE è percentuale e non è definito se la serie contiene zeri.':
    'RMSE y MAE están en la misma unidad de la serie; el MAPE es porcentual y no está definido si la serie contiene ceros.',
  'scala non calcolabile':
    'escala no calculable',
  'scarsa (peggio della media)':
    'pobre (peor que la media)',
  'Scelta della differenziazione':
    'Elección de la diferenciación',
  'Scomposizione':
    'Descomposición',
  'Serie':
    'Serie',
  'serie = trend + stagionalità + residuo':
    'serie = tendencia + estacionalidad + residuo',
  'Serie di {s1} osservazioni: {s2}.':
    'Serie de {s1} observaciones: {s2}.',
  'serie non casuale':
    'serie no aleatoria',
  'Serie storica':
    'Serie temporal',
  'Serie troppo corta per una validazione fuori campione: l’errore disponibile è quello di adattamento.':
    'Serie demasiado corta para una validación fuera de muestra: el error disponible es el de ajuste.',
  'Sintesi della serie':
    'Resumen de la serie',
  'Sono previsioni puntuali: l’intervallo di incertezza crescerebbe con l’orizzonte e non è incluso.':
    'Son previsiones puntuales: el intervalo de incertidumbre crecería con el horizonte y no se incluye.',
  'Stagionalità':
    'Estacionalidad',
  'Stagionalità non richiesta':
    'Estacionalidad no solicitada',
  'Statistica':
    'Estadístico',
  'Su questa base viene stimato un modello ARIMA/SARIMA: memoria e stagionalità stimate servono a costruire previsioni con intervalli, non solo a descrivere la serie.':
    'Sobre esta base se estima un modelo ARIMA/SARIMA: la memoria y la estacionalidad estimadas sirven para construir previsiones con intervalos, no solo para describir la serie.',
  't':
    't',
  'termine non significativo, il suo contributo non si distingue dal caso':
    'término no significativo, su contribución no se distingue del azar',
  'termine significativo, aggiunge memoria al modello':
    'término significativo, añade memoria al modelo',
  'Test':
    'Prueba',
  'Test ADF sulla serie':
    'Prueba ADF sobre la serie',
  'Test dei runs: p = {s1}{s2}.':
    'Prueba de rachas: p = {s1}{s2}.',
  'Test di casualità e trend':
    'Pruebas de aleatoriedad y tendencia',
  'Trend':
    'Tendencia',
  'trend {s1}':
    'tendencia {s1}',
  'trend crescente':
    'tendencia creciente',
  'trend decrescente':
    'tendencia decreciente',
  'Trend e casualità':
    'Tendencia y aleatoriedad',
  'Trend, stagionalità e previsioni assumono che il futuro continui il pattern osservato: cambi di regime non sono previsti.':
    'Tendencia, estacionalidad y previsiones suponen que el futuro continúa el patrón observado: no se prevén cambios de régimen.',
  'Ultimo valore':
    'Último valor',
  'Validazione fuori campione: RMSE = {s1}, MAE = {s2}; il modello {s3}.':
    'Validación fuera de muestra: RMSE = {s1}, MAE = {s2}; el modelo {s3}.',
  'Valore':
    'Valor',
  'Variazione dal primo all’ultimo valore: {s1} ({s2}).':
    'Cambio del primer al último valor: {s1} ({s2}).',
  'Variazione totale':
    'Cambio total',
  'Wald–Wolfowitz (runs)':
    'Wald–Wolfowitz (rachas)',
};
