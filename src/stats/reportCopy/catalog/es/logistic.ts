/** es: report and table prose (normalised). */
export const logisticCopy: Record<string, string> = {
  '{s1} · N = {s2}':
    '{s1} · N = {s2}',
  '{s1} predittori pesano':
    '{s1} predictores pesan',
  '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: un’unità in più {s6} le probabilità dell’esito di circa {s7}%.':
    '{s1}: OR = {s2} (CI {s3} – {s4}), p = {s5}: una unidad más {s6} las probabilidades del desenlace en alrededor del {s7} %.',
  '{s1}%':
    '{s1}%',
  '1 predittore pesa':
    '1 predictor pesa',
  'Accuratezza':
    'Exactitud',
  'AIC':
    'AIC',
  'Almeno un coefficiente è molto grande: i dati separano quasi perfettamente gli esiti e le stime/SE non sono affidabili.':
    'Al menos un coeficiente es muy grande: los datos separan casi perfectamente los desenlaces y las estimaciones/SE no son fiables.',
  'Assunzioni e cautele':
    'Supuestos y cautelas',
  'Attenzione: separazione':
    'Atención: separación',
  'AUC':
    'AUC',
  'AUC = {s1}: probabilità che un caso con esito positivo riceva un punteggio più alto di un caso negativo. Accuratezza alla soglia scelta: {s2}.':
    'AUC = {s1}: probabilidad de que un caso con desenlace positivo reciba una puntuación más alta que un caso negativo. Exactitud en el umbral elegido: {s2}.',
  'B':
    'B',
  'BIC':
    'BIC',
  'CI {s1}%':
    'CI {s1}%',
  'Classificazione':
    'Clasificación',
  'Coefficienti e odds ratio':
    'Coeficientes y odds ratios',
  'Come leggere gli odds ratio':
    'Cómo leer los odds ratios',
  'Cox–Snell R²':
    'Cox–Snell R²',
  'df':
    'df',
  'Diagnostica':
    'Diagnóstico',
  'Eventi (Y = 1)':
    'Eventos (Y = 1)',
  'Eventi per parametro':
    'Eventos por parámetro',
  'Firth penalized likelihood':
    'Verosimilitud penalizada de Firth',
  'Gli esiti devono essere indipendenti tra loro (una riga = una unità).':
    'Los desenlaces deben ser independientes entre sí (una fila = una unidad).',
  'Gli OR sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 1 corrisponde a un effetto non significativo.':
    'Los OR se estiman al margen de los demás predictores y con un CI del {s1} %: un intervalo que contiene 1 corresponde a un efecto no significativo.',
  'I dati separano quasi perfettamente gli esiti: le stime non sono affidabili.':
    'Los datos separan casi perfectamente los desenlaces: las estimaciones no son fiables.',
  'Il modello contiene {s1} predittore/i su {s2} osservazioni e {s3} eventi.':
    'El modelo contiene {s1} predictor(es) sobre {s2} observaciones y {s3} eventos.',
  'Il modello è significativo (LR p = {s1}) e {s2} sul risultato.':
    'El modelo es significativo (p de LR = {s1}) y {s2} sobre el resultado.',
  'Il modello non è significativo (LR p = {s1}).':
    'El modelo no es significativo (p de LR = {s1}).',
  'Il p è di Wald (z = B/SE): con campioni piccoli o effetti forti può essere meno affidabile del test LR.':
    'El p es de Wald (z = B/SE): con muestras pequeñas o efectos fuertes puede ser menos fiable que la prueba LR.',
  'Il test LR confronta il modello con quello che contiene solo l’intercetta: p piccolo = almeno un predittore aggiunge informazione.':
    'La prueba LR compara el modelo con el que contiene solo el intercepto: p pequeño = al menos un predictor añade información.',
  'Il test LR vale {s1} con {s2} gradi di libertà: {s3}':
    'La prueba LR vale {s1} con {s2} grados de libertad: {s3}',
  'L’accuratezza dipende dalla soglia: riportala sempre insieme a sensibilità e specificità.':
    'La exactitud depende del umbral: preséntala siempre junto con la sensibilidad y la especificidad.',
  'L’AUC non dipende dalla soglia: 0,5 è il caso, 0,7 accettabile, 0,8 buono, 0,9 eccellente.':
    'El AUC no depende del umbral: 0.5 es el azar, 0.7 aceptable, 0.8 bueno, 0.9 excelente.',
  'L’intervallo dell’OR è calcolato su scala logaritmica: exp(B ± z·SE). Se contiene 1, l’effetto non è significativo.':
    'El intervalo del OR se calcula en escala logarítmica: exp(B ± z·SE). Si contiene 1, el efecto no es significativo.',
  'L’ipotesi nulla del test LR è “nessun predittore aggiunge informazione rispetto alla sola intercetta”; ogni coefficiente risponde invece alla domanda “questo predittore pesa, al netto degli altri?”.':
    'La hipótesis nula de la prueba LR es «ningún predictor añade información respecto a solo el intercepto»; cada coeficiente responde en cambio a la pregunta «¿este predictor pesa, al margen de los demás?».',
  'L’odds ratio non è un rischio relativo: OR = 2 significa che gli odds raddoppiano, non che la probabilità raddoppia. Con esiti frequenti la differenza tra le due letture è grande, con esiti rari è piccola.':
    'El odds ratio no es un riesgo relativo: OR = 2 significa que las odds se duplican, no que la probabilidad se duplique. Con desenlaces frecuentes la diferencia entre las dos lecturas es grande; con desenlaces raros es pequeña.',
  'La bontà di adattamento è riassunta da pseudo-R² e AUC: non sostituiscono un controllo dei residui per la forma della relazione.':
    'La bondad de ajuste se resume con pseudo-R² y AUC: no sustituyen una comprobación de los residuos para la forma de la relación.',
  'La lettura dei risultati':
    'La lectura de los resultados',
  'La regressione logistica modella la probabilità di un esito binario (sì/no) in funzione di uno o più predittori, invece di modellare direttamente il valore medio come fa la regressione lineare.':
    'La regresión logística modela la probabilidad de un desenlace binario (sí/no) en función de uno o más predictores, en lugar de modelar directamente el valor medio como hace la regresión lineal.',
  'La relazione tra predittore e logit della probabilità è lineare: con predittori continui controlla la forma o usa trasformazioni.':
    'La relación entre predictor y logit de la probabilidad es lineal: con predictores continuos comprueba la forma o usa transformaciones.',
  'La separazione (outcome predetto perfettamente) gonfia i coefficienti e invalida i test.':
    'La separación (desenlace predicho perfectamente) infla los coeficientes e invalida las pruebas.',
  'La soglia 0,5 è arbitraria: se il costo di un falso negativo è alto, abbassala e guarda come cambiano sensibilità e specificità.':
    'El umbral 0.5 es arbitrario: si el coste de un falso negativo es alto, bájalo y mira cómo cambian la sensibilidad y la especificidad.',
  'La verosimiglianza penalizzata di Firth mantiene finite le stime; gli errori standard restano approssimati.':
    'La verosimilitud penalizada de Firth mantiene finitas las estimaciones; los errores estándar siguen siendo aproximados.',
  'Le pseudo-R² non hanno il significato dell’R² lineare: valori intorno a 0,2–0,4 indicano già un buon adattamento.':
    'Las pseudo-R² no tienen el significado de la R² lineal: valores en torno a 0.2–0.4 indican ya un buen ajuste.',
  'Log-verosimiglianza':
    'Log-verosimilitud',
  'Log-verosimiglianza nulla':
    'Log-verosimilitud nula',
  'LR χ² (vs modello nullo)':
    'LR χ² (frente al modelo nulo)',
  'McFadden R²':
    'McFadden R²',
  'McFadden R² = {s1}: valori sopra 0,2 indicano un modello con potere esplicativo reale, ma non vanno confrontati con l’R² della regressione lineare.':
    'McFadden R² = {s1}: valores por encima de 0.2 indican un modelo con poder explicativo real, pero no deben compararse con la R² de la regresión lineal.',
  'Metrica':
    'Métrica',
  'Modello debole':
    'Modelo débil',
  'Modello informativo':
    'Modelo informativo',
  'Modello logistico':
    'Modelo logístico',
  'Nagelkerke R²':
    'Nagelkerke R²',
  'non calcolabile.':
    'no calculable.',
  'non rifiuta l’ipotesi che nessun predittore conti.':
    'no rechaza la hipótesis de que ningún predictor cuente.',
  'Non sono inclusi modelli con effetti casuali, interazioni, regressione penalizzata o aggiustamento per dati sbilanciati.':
    'No se incluyen modelos con efectos aleatorios, interacciones, regresión penalizada ni ajuste por datos desequilibrados.',
  'OR':
    'OR',
  'OR > 1 aumenta le probabilità dell’esito per un’unità in più del predittore; OR < 1 le riduce. OR = 1 non ha effetto.':
    'OR > 1 aumenta las probabilidades del desenlace por una unidad más del predictor; OR < 1 las reduce. OR = 1 no tiene efecto.',
  'OR CI high':
    'OR CI superior',
  'OR CI low':
    'OR CI inferior',
  'Osservazioni':
    'Observaciones',
  'p':
    'p',
  'p del modello':
    'p del modelo',
  'Predittore':
    'Predictor',
  'Quanto discrimina il modello':
    'Cuánto discrimina el modelo',
  'Raccogli più casi, riduci i predittori o usa una regressione penalizzata (Firth).':
    'Recoge más casos, reduce los predictores o usa una regresión penalizada (Firth).',
  'Report di lettura':
    'Informe de lectura',
  'rifiuta l’ipotesi che nessun predittore conti.':
    'rechaza la hipótesis de que ningún predictor cuente.',
  'SE':
    'SE',
  'Sensibilità':
    'Sensibilidad',
  'Separazione gestita da Firth':
    'Separación tratada con Firth',
  'Servono eventi sufficienti: meno di 10 eventi per parametro rende le stime instabili (regola pratica EPV).':
    'Hacen falta eventos suficientes: menos de 10 eventos por parámetro hace inestables las estimaciones (regla práctica EPV).',
  'soglia p ≥ {s1} → Y = 1':
    'umbral p ≥ {s1} → Y = 1',
  'Specificità':
    'Especificidad',
  'stima di massima verosimiglianza':
    'estimación de máxima verosimilitud',
  'Valore':
    'Valor',
  'Wald z':
    'z de Wald',
};
