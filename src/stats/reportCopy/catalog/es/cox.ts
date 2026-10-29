/** es: report and table prose (normalised). */
export const coxCopy: Record<string, string> = {
  ' Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati.':
    ' Aquí hay {s1} observaciones, {s2} eventos y {s3} censurados.',
  '; B = {s1}':
    '; B = {s1}',
  '{s1} osservazioni · {s2} eventi · {s3} covariariate':
    '{s1} observaciones · {s2} eventos · {s3} covariables',
  '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.':
    '{s1}: HR = {s2} ({s3} – {s4}), {s5} → {s6}{s7}.',
  '{s1}: stima instabile (B = {s2}, errore standard = {s3}), coerente con separazione quasi completa: l’hazard ratio non è interpretabile.':
    '{s1}: estimación inestable (B = {s2}, error estándar = {s3}), coherente con separación casi completa: el hazard ratio no es interpretable.',
  '{s1}: stima non disponibile.':
    '{s1}: estimación no disponible.',
  'A rischio':
    'En riesgo',
  'AIC':
    'AIC',
  'AIC = {s1}: utile solo per confrontare modelli stimati sugli stessi dati.':
    'AIC = {s1}: útil solo para comparar modelos estimados sobre los mismos datos.',
  'almeno un coefficiente è diverso da zero':
    'al menos un coeficiente es distinto de cero',
  'Avviso {s1}':
    'Aviso {s1}',
  'B':
    'B',
  'B è il logaritmo dell’hazard ratio: B > 0 indica rischio maggiore quando la covariata aumenta.':
    'B es el logaritmo del hazard ratio: B > 0 indica mayor riesgo cuando aumenta la covariable.',
  'buona capacità di ordinare i tempi':
    'buena capacidad de ordenar los tiempos',
  'Censurati':
    'Censurados',
  'Coefficienti e hazard ratio':
    'Coeficientes y hazard ratios',
  'Come leggere i numeri':
    'Cómo leer los números',
  'Come regola pratica servono almeno 10 eventi per covariata: sotto questa soglia le stime sono instabili.':
    'Como regla práctica hacen falta al menos 10 eventos por covariable: por debajo de este umbral las estimaciones son inestables.',
  'Con campioni grandi i tre test convergono; con pochi eventi il rapporto di verosimiglianza è il più affidabile.':
    'Con muestras grandes las tres pruebas convergen; con pocos eventos la razón de verosimilitud es la más fiable.',
  'Concordanza (C di Harrell)':
    'Concordancia (C de Harrell)',
  'Concordanza C = {s1}: {s2}.':
    'Concordancia C = {s1}: {s2}.',
  'Convergenza':
    'Convergencia',
  'Covariata':
    'Covariable',
  'Covariati':
    'Covariables',
  'df':
    'df',
  'discriminazione discreta':
    'discriminación aceptable',
  'discriminazione modesta':
    'discriminación modesta',
  'È un test asintotico e con pochi eventi ha poca potenza: l’assenza di significatività non prova i rischi proporzionali.':
    'Es una prueba asintótica y con pocos eventos tiene poca potencia: la ausencia de significación no demuestra los riesgos proporcionales.',
  'effetto che cambia nel tempo: l’ipotesi di rischi proporzionali è messa in discussione':
    'efecto que cambia con el tiempo: se cuestiona la hipótesis de riesgos proporcionales',
  'Effetto rilevato':
    'Efecto detectado',
  'Errore std.':
    'Error estándar',
  'Eventi':
    'Eventos',
  'Eventi per covariata':
    'Eventos por covariable',
  'Eventi per covariata: {s1}. Sotto 10 le stime diventano fragili e il modello può essere sovra-adattato.':
    'Eventos por covariable: {s1}. Por debajo de 10, las estimaciones se vuelven frágiles y el modelo puede sobreajustarse.',
  'H₀(t)':
    'H₀(t)',
  'H₀(t) è il rischio cumulato valutato al profilo medio delle covariariate: un profilo ipotetico ma stabile numericamente anche con età o punteggi lontani da zero.':
    'H₀(t) es el riesgo acumulado evaluado en el perfil medio de las covariables: un perfil hipotético pero numéricamente estable incluso con edades o puntuaciones lejos de cero.',
  'HR':
    'HR',
  'HR = 1 significa nessun effetto; l’intervallo che contiene 1 è coerente con l’assenza di associazione.':
    'HR = 1 significa ningún efecto; el intervalo que contiene 1 es coherente con la ausencia de asociación.',
  'HR = 1: nessun effetto. HR > 1: rischio maggiore per valori più alti della covariata. HR < 1: effetto protettivo.':
    'HR = 1: ningún efecto. HR > 1: mayor riesgo para valores más altos de la covariable. HR < 1: efecto protector.',
  'HR high':
    'HR superior',
  'HR low':
    'HR inferior',
  'I censurati restano a rischio finché sono osservati: Cox usa questa informazione, mentre scartarli o trattarli come eventi distorce le stime.':
    'Los censurados siguen en riesgo mientras son observados: Cox usa esta información, mientras que descartarlos o tratarlos como eventos distorsiona las estimaciones.',
  'I p-value sono test di Wald e non tengono conto dell’incertezza sugli altri coefficienti.':
    'Los valores p son pruebas de Wald y no tienen en cuenta la incertidumbre sobre los demás coeficientes.',
  'I rischi proporzionali sono un’assunzione del modello: il test riportato è asintotico e con pochi eventi ha poca potenza.':
    'Los riesgos proporcionales son un supuesto del modelo: la prueba presentada es asintótica y con pocos eventos tiene poca potencia.',
  'I tempi di evento uguali sono gestiti con l’approssimazione di Breslow, che con molti pareggi può sottostimare lievemente gli errori standard.':
    'Los tiempos de evento iguales se tratan con la aproximación de Breslow, que con muchos empates puede subestimar ligeramente los errores estándar.',
  'IC {s1}% · HR per un’unità di incremento della covariata':
    'CI {s1}% · HR por una unidad de incremento de la covariable',
  'IC dell’HR che non contiene 1 è coerente con un test di Wald significativo; l’intervallo è moltiplicativo, quindi 0,5 e 2 sono effetti simmetrici.':
    'Un CI del HR que no contiene 1 es coherente con una prueba de Wald significativa; el intervalo es multiplicativo, así que 0.5 y 2 son efectos simétricos.',
  'Il modello di Cox non è stimabile con i dati disponibili.':
    'El modelo de Cox no se puede estimar con los datos disponibles.',
  'Il modello è significativo (LR χ² = {s1}, {s2}) e la covariata più forte è {s3} (HR = {s4}).':
    'El modelo es significativo (LR χ² = {s1}, {s2}) y la covariable más fuerte es {s3} (HR = {s4}).',
  'Il modello nel suo insieme':
    'El modelo en conjunto',
  'Il modello non è significativo (LR χ² = {s1}, {s2}): le covariariate non spiegano i tempi di evento meglio del caso.':
    'El modelo no es significativo (LR χ² = {s1}, {s2}): las covariables no explican los tiempos de evento mejor que el azar.',
  'il modello spiega i tempi meglio del nulla':
    'el modelo explica los tiempos mejor que el nulo',
  'Il profilo di rischio cambia con {s1}: per ogni unità in più l’hazard ratio è {s2}. Riporta sempre l’IC e il numero di eventi, e verifica se l’effetto è stabile nei sottogruppi.':
    'El perfil de riesgo cambia con {s1}: por cada unidad más, el hazard ratio es {s2}. Presenta siempre el CI y el número de eventos, y comprueba si el efecto es estable en los subgrupos.',
  'Il test aggiunge un coefficiente per covariata × log(t): se quel coefficiente è diverso da zero l’effetto cambia con il tempo.':
    'La prueba añade un coeficiente por covariable × log(t): si ese coeficiente es distinto de cero, el efecto cambia con el tiempo.',
  'Il test confronta il modello con uno che aggiunge covariata × log(t): un p piccolo segnala che l’effetto non è costante.':
    'La prueba compara el modelo con uno que añade covariable × log(t): un p pequeño indica que el efecto no es constante.',
  'Il test globale dà {s1}: l’effetto di almeno una covariata sembra cambiare nel tempo. Il modello resta una sintesi media, ma HR unico e curve di sopravvivenza previste vanno presentati con prudenza; valuta interazioni con il tempo o modelli stratificati.':
    'La prueba global da {s1}: el efecto de al menos una covariable parece cambiar con el tiempo. El modelo sigue siendo un resumen medio, pero el HR único y las curvas de supervivencia previstas deben presentarse con prudencia; valora interacciones con el tiempo o modelos estratificados.',
  'Il test globale dà {s1}: non emerge un cambiamento dell’effetto nel tempo, quindi l’ipotesi di rischi proporzionali è compatibile con i dati.':
    'La prueba global da {s1}: no emerge un cambio del efecto con el tiempo, así que la hipótesis de riesgos proporcionales es compatible con los datos.',
  'Il test score valutato in β = 0 coincide, per una sola covariata dicotomica, con il log-rank.':
    'La prueba score evaluada en β = 0 coincide, para una sola covariable dicotómica, con el log-rank.',
  'In pratica':
    'En la práctica',
  'ipotesi nulla: tutti i coefficienti uguali a zero':
    'hipótesis nula: todos los coeficientes iguales a cero',
  'Iterazioni':
    'Iteraciones',
  'L’hazard ratio confronta il rischio istantaneo di evento per un incremento unitario della covariata, a parità delle altre: HR = 2 significa rischio doppio in ogni istante, non durata doppia.':
    'El hazard ratio compara el riesgo instantáneo de evento por un incremento unitario de la covariable, manteniendo las demás constantes: HR = 2 significa riesgo doble en cada instante, no duración doble.',
  'La C di Harrell misura l’ordinamento dei tempi, non la calibrazione: un modello può ordinare bene e sbagliare le probabilità assolute.':
    'La C de Harrell mide el orden de los tiempos, no la calibración: un modelo puede ordenar bien y equivocarse en las probabilidades absolutas.',
  'La C di Harrell misura la capacità del modello di ordinare i tempi: 0,5 = caso, 1 = ordine perfetto.':
    'La C de Harrell mide la capacidad del modelo de ordenar los tiempos: 0.5 = azar, 1 = orden perfecto.',
  'La regressione di Cox mette in relazione il tempo fino all’evento con una o più covariariate, senza assumere una forma specifica per il rischio di base.{s1}':
    'La regresión de Cox relaciona el tiempo hasta el evento con una o más covariables, sin suponer una forma concreta para el riesgo basal.{s1}',
  'La relazione tra covariata e log-rischio è assunta lineare: per effetti non lineari servono trasformazioni o spline.':
    'Se supone lineal la relación entre covariable y log-riesgo: para efectos no lineales hacen falta transformaciones o splines.',
  'La sopravvivenza di base è valutata al profilo medio delle covariariate e può non corrispondere a un soggetto reale.':
    'La supervivencia basal se evalúa en el perfil medio de las covariables y puede no corresponder a un sujeto real.',
  'La stima è al limite della regione ammissibile: una covariata predice quasi perfettamente chi ha l’evento. Il coefficiente e l’hazard ratio non vanno riportati come effetto; riduci le covariariate del modello, controlla se la variabile è una conseguenza dell’esito o usa un test esatto.':
    'La estimación está en el límite de la región admisible: una covariable predice casi perfectamente quién tiene el evento. El coeficiente y el hazard ratio no deben presentarse como efecto; reduce las covariables del modelo, comprueba si la variable es una consecuencia del desenlace o usa una prueba exacta.',
  'La verosimiglianza parziale di Cox non richiede di specificare la forma della funzione di rischio di base.':
    'La verosimilitud parcial de Cox no requiere especificar la forma de la función de riesgo basal.',
  'Le covariariate non mostrano un’associazione affidabile con il tempo di evento. Con pochi eventi il modello ha poca potenza: l’assenza di significatività non dimostra l’assenza di effetto.':
    'Las covariables no muestran una asociación fiable con el tiempo de evento. Con pocos eventos el modelo tiene poca potencia: la ausencia de significación no demuestra la ausencia de efecto.',
  'le covariariate sono associate al rischio già senza stima completa':
    'las covariables se asocian al riesgo ya sin estimación completa',
  'Lettura':
    'Lectura',
  'Log-verosimiglianza':
    'Log-verosimilitud',
  'Log-verosimiglianza nulla':
    'Log-verosimilitud nula',
  'Nessun coefficiente disponibile.':
    'Ningún coeficiente disponible.',
  'nessun coefficiente distinguibile da zero':
    'ningún coeficiente distinguible de cero',
  'Nessun effetto':
    'Ningún efecto',
  'nessuna associazione affidabile con il rischio':
    'ninguna asociación fiable con el riesgo',
  'nessuna associazione iniziale rilevante':
    'ninguna asociación inicial relevante',
  'nessuna evidenza contro i rischi proporzionali':
    'ninguna evidencia contra los riesgos proporcionales',
  'nessuna prova che le covariariate spieghino i tempi':
    'ninguna prueba de que las covariables expliquen los tiempos',
  'non calcolabile':
    'no calculable',
  'Non calcolabile':
    'No calculable',
  'non modifica':
    'no modifica',
  'Non sono inclusi covariariate dipendenti dal tempo, effetti casuali, stratificazione o rischi competitivi.':
    'No se incluyen covariables dependientes del tiempo, efectos aleatorios, estratificación ni riesgos competitivos.',
  'non verificabile con questi dati':
    'no verificable con estos datos',
  'Ogni covariata':
    'Cada covariable',
  'Osservazioni':
    'Observaciones',
  'p':
    'p',
  'p grande è ciò che si vuole vedere: indica che l’ipotesi di rischio proporzionale regge.':
    'Un p grande es lo que se quiere ver: indica que la hipótesis de riesgo proporcional se sostiene.',
  'peggio del caso, controlla i segni':
    'peor que el azar, revisa los signos',
  'Per un profilo x la sopravvivenza è S₀(t) elevato a exp((x − x̄)′B): la curva di base non va letta come la sopravvivenza media della coorte.':
    'Para un perfil x, la supervivencia es S₀(t) elevado a exp((x − x̄)′B): la curva basal no debe leerse como la supervivencia media de la cohorte.',
  'Rapporto di verosimiglianza':
    'Razón de verosimilitud',
  'Rapporto di verosimiglianza: χ² = {s1} con {s2} gradi di libertà, {s3} (soglia α = {s4}).':
    'Razón de verosimilitud: χ² = {s1} con {s2} grados de libertad, {s3} (umbral α = {s4}).',
  'Report di lettura — Regressione di Cox':
    'Informe de lectura — Regresión de Cox',
  'Rischi proporzionali':
    'Riesgos proporcionales',
  'Rischio cumulato di base':
    'Riesgo acumulado basal',
  'S₀(t)':
    'S₀(t)',
  'Score (log-rank generalizzato)':
    'Score (log-rank generalizado)',
  'servono più eventi (o tempi tutti positivi) per stimare il modello con interazioni':
    'hacen falta más eventos (o tiempos todos positivos) para estimar el modelo con interacciones',
  'Sintesi del modello di Cox':
    'Resumen del modelo de Cox',
  'Statistica':
    'Estadístico',
  'stimatore di Breslow · profilo medio delle covariariate':
    'estimador de Breslow · perfil medio de las covariables',
  'Stime instabili':
    'Estimaciones inestables',
  'Stime instabili: {s1} separa quasi completamente gli eventi, quindi l’hazard ratio (B = {s2}) non è interpretabile.':
    'Estimaciones inestables: {s1} separa casi por completo los eventos, así que el hazard ratio (B = {s2}) no es interpretable.',
  'Tempo':
    'Tiempo',
  'Termine':
    'Término',
  'Test':
    'Prueba',
  'test di interazione con log(tempo)':
    'prueba de interacción con log(tiempo)',
  'Test globali sul modello':
    'Pruebas globales sobre el modelo',
  'un aumento di una unità {s1} il rischio istantaneo di evento':
    'un aumento de una unidad {s1} el riesgo instantáneo de evento',
  'Valore':
    'Valor',
  'Verifica dei rischi proporzionali':
    'Comprobación de los riesgos proporcionales',
  'Voce':
    'Concepto',
  'z':
    'z',
  'χ²':
    'χ²',
};
