/** es: report and table prose (normalised). */
export const distfitCopy: Record<string, string> = {
  ', {s1} della seconda ({s2}, ΔAIC = {s3})':
    ', {s1} que la segunda ({s2}, ΔAIC = {s3})',
  '{s1} = {s2}':
    '{s1} = {s2}',
  '95° percentile stimato: {s1} (il 5% delle osservazioni dovrebbe superarlo).':
    'Percentil 95 estimado: {s1} (el 5 % de las observaciones debería superarlo).',
  'AD A²':
    'AD A²',
  'AIC':
    'AIC',
  'AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.':
    'AIC = 2k − 2·logL: cuanto más bajo, mejor explica la distribución los datos teniendo en cuenta el número de parámetros.',
  'Assunzioni e cautele':
    'Supuestos y cautelas',
  'BIC':
    'BIC',
  'Bontà di adattamento':
    'Bondad de ajuste',
  'chiaramente migliore':
    'claramente mejor',
  'CI {s1}% non applicabile ai percentili stimati':
    'CI {s1}% no aplicable a los percentiles estimados',
  'Come leggere il confronto':
    'Cómo leer la comparación',
  'Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.':
    'Con N pequeño las colas son lo más incierto: evita leer P1 o P99 como límites fiables.',
  'Con N piccolo le stime delle code sono instabili: i percentili estremi vanno riportati con prudenza.':
    'Con N pequeño las estimaciones de las colas son inestables: los percentiles extremos deben presentarse con prudencia.',
  'Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.':
    'Compara solo las filas con el mismo AIC (mismo conjunto de datos): las diferencias por debajo de 2 son despreciables; por encima de 10 son claras.',
  'Cosa ci fai con questa distribuzione':
    'Qué puedes hacer con esta distribución',
  'Distribuzione':
    'Distribución',
  'Distribuzione stimata':
    'Distribución estimada',
  'Distribuzioni stimate':
    'Distribuciones estimadas',
  'Fit non disponibile':
    'Ajuste no disponible',
  'I parametri stimati':
    'Los parámetros estimados',
  'I percentili sono quelli della distribuzione stimata, non i percentili osservati.':
    'Los percentiles son los de la distribución estimada, no los percentiles observados.',
  'Il fitting cerca la distribuzione teorica che rende più plausibile il campione osservato, e serve per descrivere la variabile, stimare percentili e alimentare carte di controllo o analisi di affidabilità.':
    'El ajuste busca la distribución teórica que hace más plausible la muestra observada, y sirve para describir la variable, estimar percentiles y alimentar cartas de control o análisis de fiabilidad.',
  'Il livello di confidenza scelto ({s1}%) non si applica ai percentili stimati da una distribuzione fittata.':
    'El nivel de confianza elegido ({s1} %) no se aplica a los percentiles estimados a partir de una distribución ajustada.',
  'Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.':
    'El p del KS es asintótico y no está corregido por los parámetros estimados: tiende a ser optimista; úsalo como indicación.',
  'Il p-value del test KS è calcolato con la formula asintotica e non corregge per i parametri stimati: è indicativo, non definitivo.':
    'El valor p de la prueba KS se calcula con la fórmula asintótica y no corrige por los parámetros estimados: es indicativo, no definitivo.',
  'KS = Kolmogorov–Smirnov · AD = Anderson–Darling':
    'KS = Kolmogorov–Smirnov · AD = Anderson–Darling',
  'KS D':
    'KS D',
  'KS D = {s1} (p indicativo {s2}): {s3}.':
    'KS D = {s1} (p indicativo {s2}): {s3}.',
  'KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.':
    'KS mide la distancia máxima entre la acumulada empírica y la teórica; AD da más peso a las colas.',
  'L’AIC non dice che la distribuzione scelta sia “vera”: dice che è la meno peggiore tra quelle provate. Se le prime due sono a meno di 2 punti, i dati non distinguono tra loro e la scelta va fatta con criteri esterni (supporto, comportamento delle code, semplicità).':
    'El AIC no dice que la distribución elegida sea «verdadera»: dice que es la menos mala entre las probadas. Si las dos primeras están a menos de 2 puntos, los datos no las distinguen y la elección debe hacerse con criterios externos (soporte, comportamiento de las colas, simplicidad).',
  'La bontà di adattamento non è calcolabile.':
    'La bondad de ajuste no se puede calcular.',
  'La distribuzione che descrive meglio i dati è la {s1} (AIC = {s2}).':
    'La distribución que mejor describe los datos es la {s1} (AIC = {s2}).',
  'la distribuzione non è un buon adattamento ai dati':
    'la distribución no se ajusta bien a los datos',
  'La scelta qui è guidata dall’AIC, che premia l’adattamento e penalizza i parametri in più. La {s1} ha AIC = {s2}{s3}.':
    'La elección aquí está guiada por el AIC, que premia el ajuste y penaliza los parámetros adicionales. La {s1} tiene AIC = {s2}{s3}.',
  'Le distribuzioni a supporto positivo (lognormale, esponenziale, gamma, Weibull) richiedono valori > 0; i valori nulli o negativi le escludono.':
    'Las distribuciones de soporte positivo (lognormal, exponencial, gamma, Weibull) requieren valores > 0; los valores nulos o negativos las excluyen.',
  'Le osservazioni devono essere indipendenti e provenire dalla stessa popolazione.':
    'Las observaciones deben ser independientes y proceder de la misma población.',
  'Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.':
    'Las estimaciones son de máxima verosimilitud (MLE): eligen los parámetros que hacen más probables los datos observados.',
  'Log-verosimiglianza':
    'Log-verosimilitud',
  'Log-verosimiglianza = {s1}: valore assoluto poco interpretabile, utile solo per confrontare modelli.':
    'Log-verosimilitud = {s1}: valor absoluto poco interpretable, útil solo para comparar modelos.',
  'Mediana stimata: {s1}.':
    'Mediana estimada: {s1}.',
  'moderatamente migliore':
    'moderadamente mejor',
  'Nessuna distribuzione stimabile con questi dati.':
    'Ninguna distribución estimable con estos datos.',
  'non c’è evidenza contraria all’adattamento':
    'no hay evidencia contraria al ajuste',
  'non calcolabile':
    'no calculable',
  'Non sono inclusi modelli con dati censurati (Weibull su dati di sopravvivenza troncati).':
    'No se incluyen modelos con datos censurados (Weibull sobre datos de supervivencia truncados).',
  'ordinamento per AIC · N = {s1}':
    'ordenación por AIC · N = {s1}',
  'p KS (indicativo)':
    'p de KS (indicativo)',
  'P{s1}':
    'P{s1}',
  'Parametri':
    'Parámetros',
  'Parametri (MLE)':
    'Parámetros (MLE)',
  'Parametri: {s1}. Sono stime di massima verosimiglianza, non medie campionarie.':
    'Parámetros: {s1}. Son estimaciones de máxima verosimilitud, no medias muestrales.',
  'Percentile':
    'Percentil',
  'Percentili della distribuzione migliore ({s1})':
    'Percentiles de la mejor distribución ({s1})',
  'praticamente equivalente':
    'prácticamente equivalente',
  'Puoi usarla per definire limiti di specifica, stimare la probabilità di superare una soglia o generare dati simulati coerenti.':
    'Puedes usarla para definir límites de especificación, estimar la probabilidad de superar un umbral o generar datos simulados coherentes.',
  'Report di lettura':
    'Informe de lectura',
  'Servono almeno tre valori e, per le distribuzioni a supporto positivo, tutti i valori maggiori di zero.':
    'Hacen falta al menos tres valores y, para las distribuciones de soporte positivo, todos los valores mayores que cero.',
  'Un buon AIC non compensa un disegno di campionamento distorto.':
    'Un buen AIC no compensa un diseño de muestreo sesgado.',
  'Valore stimato':
    'Valor estimado',
};
