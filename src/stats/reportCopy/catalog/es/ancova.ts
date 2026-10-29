/** Spanish prose of the ANCOVA report. */
export const ancovaCopy: Record<string, string> = {
  'p interazione': 'p de interacción',
  '{s1} covariate': '{s1} covariables',
  'Report di lettura': 'Informe de lectura',
  'Le pendenze differiscono tra i gruppi: l’ANCOVA classica non è affidabile.':
    'Las pendientes difieren entre los grupos: el ANCOVA clásico no es fiable.',
  'Il fattore {s1} ha un effetto dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'El factor {s1} tiene un efecto tras el ajuste por {s2} (F = {s3}, p = {s4}).',
  'Nessun effetto del fattore {s1} dopo l’aggiustamento per {s2} (F = {s3}, p = {s4}).':
    'Ningún efecto del factor {s1} tras el ajuste por {s2} (F = {s3}, p = {s4}).',
  'Pendenze non omogenee': 'Pendientes no homogéneas',
  'Effetto del fattore': 'Efecto del factor',
  'Nessun effetto': 'Ningún efecto',
  'L’ANCOVA confronta le medie dei gruppi dopo aver rimosso la parte di variabilità spiegata da una o più covariate continue.':
    'El ANCOVA compara las medias de los grupos tras eliminar la parte de variabilidad explicada por una o más covariables continuas.',
  'Modello: {s1} + {s2}. Le medie aggiustate sono valutate al valore medio delle covariate.':
    'Modelo: {s1} + {s2}. Las medias ajustadas se evalúan en el valor medio de las covariables.',
  'La lettura dei risultati': 'La lectura de los resultados',
  'Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).':
    'Factor {s1}: F({s2}, {s3}) = {s4}, p = {s5}; η²p = {s6} ({s7}).',
  'La media aggiustata più alta è quella di {s1} ({s2}); la media grezza dello stesso gruppo era {s3}.':
    'La media ajustada más alta es la de {s1} ({s2}); la media bruta del mismo grupo era {s3}.',
  'Medie aggiustate non disponibili.': 'Medias ajustadas no disponibles.',
  'Covariate: {s1}.': 'Covariables: {s1}.',
  '{s1} (F = {s2}, p = {s3})': '{s1} (F = {s2}, p = {s3})',
  'Nessuna covariata nel modello.': 'Ninguna covariable en el modelo.',
  'Omogeneità delle pendenze: F({s1}, {s2}) = {s3}, p = {s4}. {s5}':
    'Homogeneidad de las pendientes: F({s1}, {s2}) = {s3}, p = {s4}. {s5}',
  'df numeratore': 'df del numerador',
  'df denominatore': 'df del denominador',
  'F interazione': 'F de interacción',
  'L’ipotesi è violata: riporta il modello con interazione o analizza i gruppi separatamente.':
    'Se incumple el supuesto: presenta el modelo con interacción o analiza los grupos por separado.',
  'Non ci sono prove che le pendenze differiscano tra i gruppi.':
    'No hay pruebas de que las pendientes difieran entre los grupos.',
  'Il test di omogeneità delle pendenze non è calcolabile (troppi pochi gradi di libertà).':
    'La prueba de homogeneidad de pendientes no se puede calcular (demasiados pocos grados de libertad).',
  'Restano richiesti indipendenza delle osservazioni, linearità della relazione con le covariate e normalità/omoschedasticità dei residui.':
    'Siguen siendo necesarios la independencia de las observaciones, la linealidad de la relación con las covariables y la normalidad/homocedasticidad de los residuos.',
  'Confronti tra gruppi': 'Comparaciones entre grupos',
  'Nessun confronto a coppie disponibile.': 'No hay comparaciones por pares disponibles.',
  'Con correzione Holm risultano significativi: {s1}.':
    'Con la corrección de Holm resultan significativas: {s1}.',
  '{s1} (Δ = {s2}, p = {s3})': '{s1} (Δ = {s2}, p = {s3})',
  'Nessun confronto a coppie resta significativo dopo la correzione di Holm.':
    'Ninguna comparación por pares sigue siendo significativa tras la corrección de Holm.',
  'Le differenze sono calcolate sulle medie aggiustate, non sulle medie grezze.':
    'Las diferencias se calculan sobre las medias ajustadas, no sobre las medias brutas.',
  'Le covariate devono essere misurate prima del trattamento e non essere influenzate dal fattore.':
    'Las covariables deben medirse antes del tratamiento y no deben verse influidas por el factor.',
  'Una covariata con forte errore di misura attenua l’aggiustamento e può ridurre la potenza.':
    'Una covariable con un gran error de medición atenúa el ajuste y puede reducir la potencia.',
  'Le medie aggiustate dipendono dal valore medio delle covariate: con covariate molto sbilanciate l’estrapolazione può essere fragile.':
    'Las medias ajustadas dependen del valor medio de las covariables: con covariables muy desequilibradas la extrapolación puede ser frágil.',
  'L’ANCOVA non crea gruppi equivalenti: rimuove solo la parte di differenza lineare associata alle covariate osservate.':
    'El ANCOVA no crea grupos equivalentes: solo elimina la parte de la diferencia lineal asociada a las covariables observadas.',
  'Un solo fattore categorico: per disegni fattoriali con covariate serve un modello più generale.':
    'Un único factor categórico: los diseños factoriales con covariables necesitan un modelo más general.',
  'Nessuna selezione automatica del modello: tutte le covariate scelte restano nel modello.':
    'Ninguna selección automática del modelo: todas las covariables elegidas se quedan en el modelo.',
  'SS tipo III con codifica treatment: con interazioni il significato dei termini cambia.':
    'SS de tipo III con codificación de tratamiento: con interacciones cambia el significado de los términos.',
  'Termine {s1}': 'Término {s1}',
  '{s1} − {s2}': '{s1} − {s2}',
  'ANCOVA — effetti (SS tipo III)': 'ANCOVA — efectos (SS de tipo III)',
  '{s1} ~ {s2} + {s3} · N = {s4}': '{s1} ~ {s2} + {s3} · N = {s4}',
  'Sorgente': 'Fuente',
  'SS': 'SS',
  'df': 'df',
  'MS': 'MS',
  'F': 'F',
  'p': 'p',
  'η²p': 'η²p',
  'SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).':
    'SS de tipo III: cada término se prueba quitándolo del modelo completo (factor y covariables juntos).',
  'Modello: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.':
    'Modelo: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.',
  'Medie aggiustate per gruppo': 'Medias ajustadas por grupo',
  'valutate alla media delle covariate · CI {s1}%': 'evaluadas en la media de las covariables · CI {s1}%',
  'Gruppo': 'Grupo',
  'N': 'N',
  'Media grezza': 'Media bruta',
  'Media aggiustata': 'Media ajustada',
  'SE': 'SE',
  'CI low': 'CI inferior',
  'CI high': 'CI superior',
  'Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.':
    'Media ajustada = valor esperado del grupo con todas las covariables en su valor medio.',
  'La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.':
    'La diferencia entre la media bruta y la ajustada muestra cuánto pesa el desequilibrio de las covariables entre los grupos.',
  'Coefficienti del modello': 'Coeficientes del modelo',
  'codifica treatment · riferimento: {s1}': 'codificación de tratamiento · referencia: {s1}',
  'Termine': 'Término',
  'B': 'B',
  't': 't',
  'L’intercetta è la media aggiustata del gruppo di riferimento ({s1}).':
    'El intercepto es la media ajustada del grupo de referencia ({s1}).',
  'I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.':
    'Los coeficientes de los grupos son diferencias ajustadas respecto a la referencia; los de las covariables son pendientes comunes.',
  'Omogeneità delle pendenze': 'Homogeneidad de las pendientes',
  'Metrica': 'Métrica',
  'Valore': 'Valor',
  'Dettaglio': 'Detalle',
  '{s1} × covariate': '{s1} × covariables',
  '(k−1) × numero di covariate': '(k−1) × número de covariables',
  'residui del modello con interazioni': 'residuos del modelo con interacciones',
  'p > α: pendenze compatibili': 'p > α: pendientes compatibles',
  'Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.':
    'Si la interacción es significativa, las pendientes difieren entre los grupos: el ANCOVA clásico no es apropiado.',
  'Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.':
    'La prueba compara el modelo completo con y sin todos los productos grupo × covariable.',
  'Confronti a coppie (medie aggiustate)': 'Comparaciones por pares (medias ajustadas)',
  'correzione Holm': 'corrección de Holm',
  'Confronto': 'Comparación',
  'Differenza': 'Diferencia',
  'p Holm': 'p de Holm',
  'Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.':
    'Diferencia = media ajustada del primer grupo − media ajustada del segundo.',
  'p non corretti da t con df = {s1}; la colonna Holm controlla il numero di confronti.':
    'p sin corregir de t con df = {s1}; la columna de Holm controla el número de comparaciones.',
};
