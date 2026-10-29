/** es: report and table prose (normalised). */
export const survivalCopy: Record<string, string> = {
  ' Intervallo {s1} – {s2}.':
    ' Intervalo {s1} – {s2}.',
  '{s1} intervalli di uguale ampiezza':
    '{s1} intervalos de igual amplitud',
  'A':
    'A',
  'A rischio':
    'En riesgo',
  'All’ultimo tempo osservato la sopravvivenza stimata è {s1} ({s2}%).':
    'En el último tiempo observado la supervivencia estimada es {s1} ({s2} %).',
  'Assunzioni e cautele':
    'Supuestos y cautelas',
  'Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.':
    'Censura no informativa: quien sale del estudio no debe tener un riesgo distinto de quien permanece.',
  'Censurati':
    'Censurados',
  'CI {s1}% log-log · stima prodotto-limite':
    'CI {s1}% log-log · estimación producto-límite',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.':
    'Con más de dos grupos no se presenta el hazard ratio: usa la regresión de Cox para un HR ajustado.',
  'Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.':
    'Con pocos eventos por grupo la prueba tiene poca potencia y el HR es inestable.',
  'Confronto tra gruppi':
    'Comparación entre grupos',
  'Confronto tra gruppi non richiesto':
    'Comparación entre grupos no solicitada',
  'Curva di Kaplan–Meier':
    'Curva de Kaplan–Meier',
  'Da':
    'Desde',
  'df':
    'df',
  'Eventi':
    'Eventos',
  'Gruppi: {s1}. Il log-rank dà χ² = {s2} con p = {s3}: {s4}':
    'Grupos: {s1}. El log-rank da χ² = {s2} con p = {s3}: {s4}',
  'Gruppo':
    'Grupo',
  'Hazard ratio':
    'Hazard ratio',
  'Hazard ratio (Mantel–Haenszel)':
    'Hazard ratio (Mantel–Haenszel)',
  'Hazard ratio = {s1} ({s2} – {s3}): {s4}':
    'Hazard ratio = {s1} ({s2} – {s3}): {s4}',
  'HR CI high':
    'HR CI superior',
  'HR CI low':
    'HR CI inferior',
  'I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.':
    'Los censurados salen del riesgo sin hacer bajar la curva: es la razón por la que hace falta un análisis de supervivencia en lugar de una media.',
  'I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).':
    'Los tiempos de censura coincidentes con un evento se tratan como eventos al mismo tiempo (ninguna corrección de empates más allá del tratamiento estándar del conjunto de riesgo).',
  'Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.':
    'El CI de la mediana deriva de los intervalos log-log de la curva; el RMST es el área bajo la curva hasta el último tiempo observado.',
  'Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.':
    'El log-rank supone riesgos proporcionales: las curvas que se cruzan requieren otras pruebas.',
  'Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.':
    'El log-rank compara el número de eventos observados en cada grupo con los esperados si las curvas fueran iguales.',
  'Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.':
    'El log-rank da el mismo peso a todos los tiempos; si el riesgo cambia con el tiempo (curvas que se cruzan), puede no ver diferencias reales.',
  'Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).':
    'El log-rank no ajusta por covariables: para hazard ratios ajustados o para más de dos grupos, usa la pestaña Cox (PH).',
  'il primo gruppo ha un rischio di evento maggiore.':
    'el primer grupo tiene un riesgo de evento mayor.',
  'il primo gruppo ha un rischio di evento minore.':
    'el primer grupo tiene un riesgo de evento menor.',
  'Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.':
    'El tiempo cero debe definirse de forma homogénea para todas las observaciones.',
  'L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.':
    'El análisis de supervivencia estima cuánto tiempo pasa hasta un evento (curación, fallo, abandono) teniendo en cuenta las observaciones censuradas, es decir, de quienes aún no han tenido el evento cuando termina el estudio.',
  'L’hazard ratio è riportato solo per due gruppi.':
    'El hazard ratio se presenta solo para dos grupos.',
  'L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.':
    'El hazard ratio se estima con el enfoque de Mantel–Haenszel: HR > 1 indica mayor riesgo en el primer grupo.',
  'La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.':
    'La curva se vuelve imprecisa en las colas, donde quedan pocas observaciones en riesgo: mira la columna «en riesgo».',
  'La curva e la mediana':
    'La curva y la mediana',
  'La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).':
    'La curva no baja por debajo de 0.50 dentro del último tiempo observado: no se alcanza la mediana (no es «infinita», simplemente no es estimable con este seguimiento).',
  'La mediana di sopravvivenza è {s1}: a quel tempo la curva scende sotto 0,50.{s2}':
    'La mediana de supervivencia es {s1}: en ese momento la curva baja por debajo de 0.50.{s2}',
  'La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.':
    'La mediana es el tiempo en que la curva baja a 0.50: si no se alcanza, queda no calculable.',
  'La mediana non viene raggiunta: {s1} eventi su {s2}.':
    'No se alcanza la mediana: {s1} eventos de {s2}.',
  'La sopravvivenza finale non è calcolabile.':
    'La supervivencia final no se puede calcular.',
  'Le curve dei gruppi differiscono (log-rank p = {s1}).':
    'Las curvas de los grupos difieren (p de log-rank = {s1}).',
  'le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.':
    'las curvas no son compatibles con la hipótesis de igual supervivencia.',
  'Life table (tutta la coorte)':
    'Tabla de vida (toda la cohorte)',
  'Log-rank test':
    'Prueba de log-rank',
  'Mediana':
    'Mediana',
  'Mediana di sopravvivenza: {s1} ({s2} eventi su {s3}).':
    'Mediana de supervivencia: {s1} ({s2} eventos de {s3}).',
  'N':
    'N',
  'N = {s1} · eventi = {s2} · censurati = {s3}':
    'N = {s1} · eventos = {s2} · censurados = {s3}',
  'Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.':
    'En la tabla de vida, los censurados en el intervalo contribuyen con la mitad al tiempo en riesgo.',
  'Nessuna differenza tra le curve dei gruppi (log-rank p = {s1}).':
    'Ninguna diferencia entre las curvas de los grupos (p de log-rank = {s1}).',
  'non c’è evidenza che le curve differiscano.':
    'no hay evidencia de que las curvas difieran.',
  'Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.':
    'No se estiman modelos paramétricos (Weibull, exponencial) con datos censurados.',
  'p':
    'p',
  'Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.':
    'Aquí hay {s1} observaciones, {s2} eventos y {s3} censurados: tratar a los censurados como «ningún evento» o excluirlos daría estimaciones sesgadas, mientras que Kaplan–Meier los mantiene en riesgo mientras son observados.',
  'Report di lettura':
    'Informe de lectura',
  'RMST':
    'RMST',
  'RMST = {s1}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.':
    'RMST = {s1}: área media bajo la curva hasta el último tiempo, es decir, el tiempo medio transcurrido sin evento dentro del horizonte observado.',
  'RMST non calcolabile.':
    'RMST no calculable.',
  'S(t)':
    'S(t)',
  'S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.':
    'S(t) es la probabilidad estimada de seguir «vivo» (sin evento) en el tiempo t.',
  'Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.':
    'Selecciona una variable de grupo para comparar dos o más curvas con el log-rank.',
  'Sintesi di sopravvivenza':
    'Resumen de supervivencia',
  'Tempo':
    'Tiempo',
  'Valore':
    'Valor',
  'Voce':
    'Concepto',
  'χ²':
    'χ²',
};
