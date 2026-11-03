/** es: report and table prose (normalised). */
export const miCopy: Record<string, string> = {
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} celdas imputadas con {s2} conjuntos de datos; FMI máximo {s3}.',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} filas · {s2} imputaciones · {s3} iteraciones',
  '% mancante':
    '% ausente',
  'CI {s1}%':
    'CI {s1}%',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Coeficientes combinados con las reglas de Rubin; la R² es la media de las imputaciones.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'Con pocas observaciones o variables muy correlacionadas, el modelo de imputación puede ser inestable.',
  'Dati mancanti':
    'Datos ausentes',
  'df Rubin':
    'df de Rubin',
  'FMI':
    'FMI',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'El nivel de confianza de las estimaciones combinadas es el {s1} %.',
  'Imputazione stabile':
    'Imputación estable',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'La imputación supone datos ausentes al azar (MAR) condicionados a las demás variables.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'La fracción de información perdida es contenida: las estimaciones son relativamente estables.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'Las estimaciones combinadas integran la variabilidad dentro y entre las imputaciones: los CI tienen en cuenta la incertidumbre debida a los datos ausentes.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'Las estimaciones combinadas aquí presentadas se refieren a la media y la SD, no a modelos de regresión completos.',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'Las variables seleccionadas se imputan con un modelo lineal sobre las demás variables.',
  'Mancanti':
    'Ausentes',
  'Media':
    'Media',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Modelo de imputación: regresión lineal por cadenas, {s1} iteraciones por conjunto de datos.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Modelo lineal combinado: R² medio = {s1} sobre {s2} predictores.',
  'Molte informazioni mancanti':
    'Mucha información ausente',
  'Nessun modello di regressione pooled richiesto.':
    'No se ha solicitado ningún modelo de regresión combinado.',
  'Osservati':
    'Observados',
  'p':
    'p',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Pooling de Rubin: varianza total = varianza within + (1 + 1/m)·varianza between.',
  'R² medio = {s1} · {s2}% CI':
    'R² medio = {s1} · CI {s2}%',
  'Regressione pooled':
    'Regresión combinada',
  'Report di imputazione multipla':
    'Informe de imputación múltiple',
  'SD pooled':
    'SD combinada',
  'SE':
    'SE',
  'Stime pooled (Rubin)':
    'Estimaciones combinadas (Rubin)',
  't':
    't',
  'Termine':
    'Término',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'Una FMI alta indica que los datos ausentes dominan la incertidumbre: interpreta las estimaciones con cautela.',
  'Variabile':
    'Variable',
  'Variabili: {s1}.':
    'Variables: {s1}.',
  'β':
    'β',
  'Riepilogo per variabile': 'Resumen por variable',
  'Codici osservati': 'Códigos observados',
  'Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.': 'Las variables categóricas se imputan con regresión logística (dos categorías) o multinomial (más de dos) sobre las demás variables y las covariables numéricas.',
  'Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.': 'Las categorías son los códigos enteros observados, ordenados numéricamente; la imputación no puede producir códigos nuevos.',
  'Conteggi osservati e completati per categoria': 'Recuentos observados y completados por categoría',
  'Dopo l’ultima delle {s1} imputazioni': 'Después de la última de las {s1} imputaciones',
  'Completati': 'Completados',
  'Prop. osservata': 'Prop. observada',
  'Prop. completata': 'Prop. completada',
  'I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.': 'Los recuentos completados son los del último conjunto imputado: comparan la distribución observada con la reconstruida.',
  'Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.': 'Una diferencia sistemática entre proporción observada y completada indica que el modelo de imputación está desplazando la distribución.',
  'Proporzioni pooled (Rubin)': 'Proporciones pooled (Rubin)',
  'CI {s1}% · pooling sulle {s2} imputazioni': 'IC {s1} % · pooling sobre {s2} imputaciones',
  'Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.': 'Pooling de Rubin sobre proporciones: varianza total = varianza within + (1 + 1/m)·varianza between.',
  'Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.': 'Las proporciones de cada variable suman 1; los intervalos de categorías raras pueden ser muy amplios.',
  'Report di imputazione multipla categorica': 'Informe de imputación múltiple categórica',
  '{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.': '{s1} celdas categóricas imputadas con {s2} conjuntos; FMI máximo {s3}.',
  'Variabili categoriche: {s1}.': 'Variables categóricas: {s1}.',
  'Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.': 'Modelo de imputación: regresiones logística o multinomial encadenadas, {s1} iteraciones por conjunto.',
  'Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.': 'Categorías observadas: {s1} en total; las proporciones pooled se combinan con las reglas de Rubin.',
  'Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.': 'Las proporciones pooled son la media de las proporciones de categoría en las {s1} imputaciones; los intervalos combinan la variabilidad dentro y entre imputaciones.',
  'Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.': 'Cada variable conserva solo sus categorías observadas: la imputación no inventa códigos nuevos, sino que redistribuye las filas faltantes entre las categorías existentes.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.': 'Un FMI alto indica que los datos faltantes dominan la incertidumbre de las proporciones: interpreta las estimaciones con cautela.',
  'La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.': 'La fracción de información faltante es contenida: las proporciones pooled son relativamente estables.',
  'Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.': 'El modelo asume datos faltantes al azar (MAR) condicionados a las demás variables categóricas y a las covariables numéricas incluidas.',
  'Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.': 'Las demás variables categóricas entran como dummies (K−1 por variable) usando los valores actuales de la cadena; las covariables numéricas entran como efectos lineales.',
  'Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.': 'Las filas usadas para estimar cada modelo condicional son aquellas en las que la variable a imputar está observada; las demás variables pueden haberse imputado ya en la misma iteración.',
  'Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.': 'Categorías con proporción pooled inferior al 5 %: {s1}. Estas estimaciones son las más sensibles al modelo y al número de imputaciones.',
  'Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.': 'Ninguna categoría pooled baja del 5 %: las proporciones estimadas no son extremas.',
  'Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.': 'Con categorías raras los errores estándar pueden ser inestables incluso cuando el modelo converge.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.': 'La imputación asume datos faltantes al azar (MAR) condicionados a las variables observadas: si el mecanismo es MNAR las estimaciones pueden estar sesgadas.',
  'Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.': 'La ruta categórica no usa máxima verosimilitud de información completa (FIML): la incertidumbre proviene del pooling de Rubin sobre las imputaciones.',
  'Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.': 'No hay disponible un modelo jerárquico o multinivel para categorías: las estructuras de clustering no se modelan.',
  'Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.': 'Las categorías raras y las variables casi separadas hacen inestables los coeficientes logísticos y, por tanto, las proporciones imputadas.',
  'Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.': 'Las estimaciones pooled aquí presentadas se refieren a proporciones de categoría, no a modelos de regresión categórica completos.',
};
