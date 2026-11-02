/** Spanish chart copy for the L4 procedures. */
export const l4ChartCopy: Record<string, string> = {
  "Cumulata eventi": "Eventos acumulados",
  "Curva di lift cumulata": "Curva de lift acumulada",
  "Eventi catturati ordinando per probabilità stimata":
    "Eventos capturados al ordenar por probabilidad estimada",
  "L’asse orizzontale è la quota di casi ordinati dal rischio più alto al più basso; quello verticale è la quota di eventi già catturata. Una curva sopra la diagonale indica che il modello concentra gli eventi nei casi a rischio alto.":
    "El eje horizontal es la cuota de casos ordenados del riesgo más alto al más bajo; el vertical, la cuota de eventos ya capturada. Una curva por encima de la diagonal indica que el modelo concentra los eventos en los casos de riesgo alto.",
  "Quota di casi ordinati (%)": "Cuota de casos ordenados (%)",
  "Eventi catturati (%)": "Eventos capturados (%)",
  "Albero di partizione": "Árbol de partición",
  "{s1} foglie · R² = {s2}": "{s1} hojas · R² = {s2}",
  "Ogni riquadro è una regola: a sinistra i valori sotto la soglia, a destra quelli uguali o superiori. Le foglie mostrano la media prevista e il numero di osservazioni.":
    "Cada recuadro es una regla: a la izquierda los valores por debajo del umbral, a la derecha los iguales o superiores. Las hojas muestran la media prevista y el número de observaciones.",
  Nodo: "Nodo",
  Profondità: "Profundidad",
  "Osservati vs previsti": "Observados vs. previstos",
  "R² = {s1} · RMSE = {s2}": "R² = {s1} · RMSE = {s2}",
  "I punti vicini alla diagonale sono previsioni accurate; la dispersione verticale è l’errore che l’albero non riesce a spiegare.":
    "Los puntos cercanos a la diagonal son predicciones exactas; la dispersión vertical es el error que el árbol no logra explicar.",
  Previsto: "Previsto",
  "Importanza delle variabili": "Importancia de las variables",
  "Quota della riduzione totale della varianza":
    "Cuota de la reducción total de la varianza",
  "La barra somma la riduzione di errore ottenuta da ogni variabile in tutti i nodi in cui è stata usata: non è un coefficiente e non ha segno.":
    "La barra suma la reducción de error obtenida por cada variable en todos los nodos en que se ha usado: no es un coeficiente y no tiene signo.",
  "Importanza (%)": "Importancia (%)",
  "Partition — albero di regressione": "Partición — árbol de regresión",
  "Risposta: {s1} · {s2} predittori": "Respuesta: {s1} · {s2} predictores",
  "Pareto — {s1}": "Pareto — {s1}",
  "{s1} osservazioni · {s2} categorie": "{s1} observaciones · {s2} categorías",
  "Grafico di Pareto": "Gráfico de Pareto",
  "{s1} categorie · {s2} osservazioni": "{s1} categorías · {s2} observaciones",
  "Le barre sono i conteggi in ordine decrescente; la linea è la percentuale cumulata. Poche categorie spiegano la maggior parte dei casi.":
    "Las barras son los recuentos en orden decreciente; la línea es el porcentaje acumulado. Pocas categorías explican la mayoría de los casos.",
  "Cumulata (%)": "Acumulado (%)",
  "Variabilità — {s1} per {s2}": "Variabilidad — {s1} por {s2}",
  "{s1} gruppi · {s2} osservazioni": "{s1} grupos · {s2} observaciones",
  "Variabilità per gruppo": "Variabilidad por grupo",
  "{s1} gruppi": "{s1} grupos",
  "Ogni scatola mostra mediana, quartili e baffi Tukey; i punti sono le osservazioni. Serve a vedere se la variabilità cambia tra gruppi, non solo la media.":
    "Cada caja muestra la mediana, los cuartiles y los bigotes de Tukey; los puntos son las observaciones. Sirve para ver si la variabilidad cambia entre grupos, no solo la media.",
  "Capacità — {s1}": "Capacidad — {s1}",
  "LSL {s1} · USL {s2} · target {s3}": "LSL {s1} · USL {s2} · objetivo {s3}",
  "Distribuzione e specifiche": "Distribución y especificaciones",
  "Cp = {s1} · Cpk = {s2}": "Cp = {s1} · Cpk = {s2}",
  "Le linee verticali sono i limiti di specifica e il target; la curva è la densità normale con la stessa media e deviazione standard. Se la distribuzione esce dai limiti il processo produce fuori specifica.":
    "Las líneas verticales son los límites de especificación y el objetivo; la curva es la densidad normal con la misma media y desviación estándar. Si la distribución sale de los límites, el proceso produce valores fuera de especificación.",
  LSL: "LSL",
  USL: "USL",
  Target: "Objetivo",
  "Carta di controllo — {s1}": "Gráfico de control — {s1}",
  "XBar-R · {s1} sottogruppi di {s2}": "XBar-R · {s1} subgrupos de {s2}",
  "{s1} · {s2} punti": "{s1} · {s2} puntos",
  Individui: "Individuos",
  CL: "CL",
  "Carta di controllo": "Gráfico de control",
  "{s1} punti fuori controllo su {s2}": "{s1} puntos fuera de control de {s2}",
  "La linea centrale è il livello del processo; le linee tratteggiate sono i limiti a ±3 sigma. Un punto oltre i limiti è un segnale da investigare, non una prova che il processo sia cambiato.":
    "La línea central es el nivel del proceso; las líneas discontinuas son los límites a ±3 sigma. Un punto más allá de los límites es una señal que investigar, no una prueba de que el proceso haya cambiado.",
  EWMA: "EWMA",
  "Il report di qualità descrive il processo osservato; non sostituisce una carta di controllo validata su dati di produzione.":
    "El informe de calidad describe el proceso observado; no sustituye un gráfico de control validado con datos de producción.",
  Dendrogramma: "Dendrograma",
  "{s1} osservazioni · {s2} cluster": "{s1} observaciones · {s2} clústeres",
  "Ogni linea unisce due gruppi alla distanza a cui sono stati fusi: più in alto è l’unione, più diversi erano i gruppi. Il taglio orizzontale definisce il numero di cluster.":
    "Cada línea une dos grupos a la distancia a la que se fusionaron: cuanto más arriba está la unión, más distintos eran los grupos. El corte horizontal define el número de clústeres.",
  Distanza: "Distancia",
  "Profili dei cluster": "Perfiles de los clústeres",
  "Medie standardizzate per variabile": "Medias estandarizadas por variable",
  "Ogni linea è un cluster: i valori sopra zero indicano una media più alta della media generale, quelli sotto zero una media più bassa. Serve a capire quali variabili distinguono i gruppi.":
    "Cada línea es un clúster: los valores por encima de cero indican una media más alta que la media general, y los valores por debajo de cero, una media más baja. Sirve para entender qué variables distinguen a los grupos.",
  "Profilo standardizzato": "Perfil estandarizado",
  "Dimensione dei cluster": "Tamaño de los clústeres",
  "Un cluster molto piccolo può essere un gruppo reale oppure un insieme di casi anomali: va esaminato prima di interpretarlo.":
    "Un clúster muy pequeño puede ser un grupo real o un conjunto de casos anómalos: examínalo antes de interpretarlo.",
  "Analisi cluster": "Análisis de clústeres",
  "{s1} variabili · {s2} osservazioni · legame {s3}":
    "{s1} variables · {s2} observaciones · enlace {s3}",
  "Grafico canonico": "Gráfico canónico",
  "LD1 × LD2 · {s1} gruppi": "LD1 × LD2 · {s1} grupos",
  "Ogni punto è un caso proiettato sulle prime due funzioni discriminanti; i gruppi lontani sono più facili da separare. Con una sola funzione il secondo asse è zero.":
    "Cada punto es un caso proyectado sobre las dos primeras funciones discriminantes; los grupos alejados son más fáciles de separar. Con una sola función, el segundo eje es cero.",
  "Profilo delle medie per gruppo": "Perfil de las medias por grupo",
  "Medie standardizzate delle variabili":
    "Medias estandarizadas de las variables",
  "Ogni linea è un gruppo: linee parallele indicano che i gruppi differiscono allo stesso modo su tutte le variabili; linee che si incrociano indicano un profilo diverso.":
    "Cada línea es un grupo: las líneas paralelas indican que los grupos difieren del mismo modo en todas las variables; las líneas que se cruzan indican un perfil distinto.",
  "Media standardizzata": "Media estandarizada",
  "Coefficienti discriminanti": "Coeficientes discriminantes",
  "Peso di ogni variabile in ogni gruppo":
    "Peso de cada variable en cada grupo",
  "Il colore mostra segno e intensità del coefficiente: variabili con pesi opposti separano i gruppi in direzioni diverse. La scala è comune a tutte le celle.":
    "El color muestra el signo y la intensidad del coeficiente: las variables con pesos opuestos separan los grupos en direcciones distintas. La escala es común a todas las celdas.",
  "Analisi discriminante / MANOVA": "Análisis discriminante / MANOVA",
  "{s1} gruppi · {s2} predittori · N = {s3}":
    "{s1} grupos · {s2} predictores · N = {s3}",
  "Superficie di risposta": "Superficie de respuesta",
  "{s1} in funzione di {s2} e {s3}": "{s1} en función de {s2} y {s3}",
  "La griglia è una proiezione 2D di una superficie 3D: mostra la forma e le zone alte o basse, non i valori esatti. I punti sono le osservazioni proiettate sullo stesso piano.":
    "La cuadrícula es una proyección 2D de una superficie 3D: muestra la forma y las zonas altas o bajas, no los valores exactos. Los puntos son las observaciones proyectadas sobre el mismo plano.",
  "Curve di livello": "Curvas de nivel",
  "{s1} previsto": "{s1} previsto",
  "Le linee collegano combinazioni di fattori con la stessa risposta prevista. Curve vicine indicano un cambiamento rapido; curve chiuse indicano un massimo o un minimo.":
    "Las líneas unen combinaciones de factores con la misma respuesta prevista. Curvas cercanas indican un cambio rápido; curvas cerradas indican un máximo o un mínimo.",
  "Coefficienti del modello": "Coeficientes del modelo",
  "Effetto di ogni termine sulla risposta":
    "Efecto de cada término sobre la respuesta",
  "La barra è la stima del coefficiente; il segno dice se la risposta cresce o cala quando il termine aumenta. L’intercetta è omessa perché non è un effetto.":
    "La barra es la estimación del coeficiente; el signo indica si la respuesta crece o decrece cuando el término aumenta. La intersección se omite porque no es un efecto.",
  "Superficie di risposta (DOE)": "Superficie de respuesta (DOE)",
  "{s1} · N = {s2} · modello {s3}": "{s1} · N = {s2} · modelo {s3}",
  quadratico: "cuadrático",
  lineare: "lineal",
  "Row": "Fila",
  "Run length": "Longitud de racha",
  "Frequenza": "Frecuencia",
  "Frequenze: {s1}": "Frecuencias: {s1}",
  "{s1} osservazioni, {s2} modalità": "{s1} observaciones, {s2} niveles",
  "Distribuzione e valori estremi": "Distribución y valores extremos",
  "Scatola e baffi delle variabili selezionate": "Diagrama de caja de las variables seleccionadas",
  "Valori anomali": "Valores atípicos",
  "Sequenza osservata: {s1}": "Secuencia observada: {s1}",
  "Valori nell’ordine delle righe, punto di taglio {s1}": "Valores en el orden de las filas, punto de corte {s1}",
  "Una tendenza o un ciclo visibile spiega perché il test rifiuta la casualità; il test non localizza il punto di rottura.": "Una tendencia o un ciclo visible explica por qué la prueba rechaza la aleatoriedad; la prueba no localiza el punto de ruptura.",
  "Lunghezza delle sequenze: {s1}": "Longitudes de las rachas: {s1}",
  "{s1} sequenze osservate": "{s1} rachas observadas",
  "Count": "Recuento",
  "Frequenze": "Frecuencias",
  "Variable": "Variable",
  "Value": "Valor",
  "Test delle sequenze": "Prueba de rachas",
};
