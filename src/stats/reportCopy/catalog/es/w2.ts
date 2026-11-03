/** Spanish: W2 report and table prose. */
export const w2Copy: Record<string, string> = {
  'Sì': 'Sí',
  'Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.':
    'Ningún grupo queda fuera de las líneas de decisión: las medias son compatibles con la media general.',
  '{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.':
    '{s1} grupo(s) quedan fuera de las líneas de decisión: {s2}.',
  'Report di lettura — ANOM': 'Informe de lectura — ANOM',
  'L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.':
    'El ANOM (análisis de medias) compara cada media de grupo con la media general, usando líneas de decisión que tienen en cuenta el número de grupos y la variabilidad intragrupo.',
  'È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.':
    'Es la versión gráfica e intuitiva del ANOVA: en lugar de una única prueba global, muestra qué grupos se alejan.',
  'Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.':
    'Las líneas se construyen al nivel α = {s1}%; un grupo fuera de los intervalos merece una revisión, no una conclusión automática.',
  'Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.':
    'Con grupos desequilibrados cada grupo tiene límites propios, porque su media tiene una precisión distinta.',
  'Cautele': 'Precauciones',
  'Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.':
    'El valor crítico usa la aproximación Bonferroni-t: es ligeramente conservador respecto a la distribución exacta del máximo módulo estudentizado.',
  'L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.':
    'El ANOM no sustituye al ANOVA: sirve para localizar las diferencias, no para estimar su magnitud.',
  'Con molti gruppi e pochi dati per gruppo la potenza resta bassa.':
    'Con muchos grupos y pocos datos por grupo, la potencia sigue siendo baja.',
  'Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.':
    'La prueba presupone observaciones independientes y una variabilidad comparable entre los grupos.',
  'Report di lettura — Modello lineare generalizzato':
    'Informe de lectura — Modelo lineal generalizado',
  '{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.':
    '{s1} explicado por {s2} predictor(es) con familia {s3} y enlace {s4}; desviación = {s5}.',
  'Il modello non ha raggiunto la convergenza: le stime non sono affidabili.':
    'El modelo no ha alcanzado la convergencia: las estimaciones no son fiables.',
  'Regressione': 'Regresión',
  'Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.':
    'El GLM extiende la regresión lineal a respuestas no normales: la familia define la varianza y el enlace conecta la media con los predictores.',
  'La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.':
    'La elección de familia y enlace forma parte del modelo: no es un detalle técnico, cambia el significado de los coeficientes.',
  'Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.':
    'Desviación = {s1} con {s2} grados de libertad; desviación nula = {s3}.',
  'Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.':
    'Log-verosimilitud = {s1}; AIC = {s2}; iteraciones = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello scelto.':
    '{s1} predictor(es) de {s2} resultan significativos al nivel elegido.',
  '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.': '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.',
  'Come leggerlo': 'Cómo leerlo',
  'Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.':
    'Con enlace log los coeficientes son diferencias de log-media: exp(B) es una razón de medias, no de probabilidades.',
  'Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.':
    'Con enlace logit/probit la respuesta es una probabilidad: B debe leerse en la escala latente.',
  'Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.':
    'Con familia Gamma la respuesta debe ser estrictamente positiva; con Poisson debe ser un recuento.',
  'Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.':
    'Comprueba la desviación residual y los residuos: un modelo puede converger y seguir mal especificado.',
  'Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.':
    'El motor cubre las familias gaussiana, binomial, Poisson y Gamma; Tweedie y las cuasi-verosimilitudes no están incluidas.',
  'La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.':
    'La bondad del modelo no se resume en un R²: compara la desviación, el AIC y el diagnóstico de los residuos.',
  'La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.':
    'La regresión probit modela la probabilidad de un resultado binario (sí/no) mediante la función de distribución normal estándar, en lugar del logit que usa la regresión logística.',
  'Come leggere i coefficienti probit': 'Cómo leer los coeficientes probit',
  'B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.':
    'B mide el desplazamiento del predictor latente normal: exp(B) no es un odds ratio y no debe interpretarse como tal.',
  'I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.':
    'Los coeficientes se estiman ajustando por los demás predictores y con un CI al {s1}%: un intervalo que contiene 0 corresponde a un efecto no significativo.',
  '{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).':
    '{s1}: {s2}% de clasificaciones correctas ({s3} de {s4}).',
  'Report di regressione multinomiale': 'Informe de regresión multinomial',
  'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.':
    'El modelo distingue {s1} clases con una exactitud del {s2}%; la clase de referencia es «{s3}».',
  'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.':
    'La regresión logística multinomial modela la probabilidad de pertenencia a cada una de varias clases nominales (no ordenadas) a partir de uno o más predictores.',
  'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.':
    'Cada clase se compara con la clase de referencia «{s1}»: los coeficientes describen cuánto cambia el logit de esa clase respecto a la referencia por una unidad más del predictor.',
  'Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.':
    'Se analizaron {s1} observaciones completas en {s2} clases y {s3} predictor(es).',
  'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.':
    'El modelo clasifica correctamente el {s1}% de las observaciones; la clase con la exactitud más alta es {s2}.',
  '{s1} ({s2}%)': '{s1} ({s2}%)',
  'non disponibile': 'no disponible',
  '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).':
    '{s1} predictor(es) muestran al menos un coeficiente significativo al nivel elegido ({s2}).',
  'Nessun coefficiente raggiunge la significatività al livello scelto.':
    'Ningún coeficiente alcanza la significación al nivel elegido.',
  'Convergenza del modello: {s1}.': 'Convergencia del modelo: {s1}.',
  'Accuratezza per classe': 'Exactitud por clase',
  'La tabella di classificazione non è disponibile.':
    'La tabla de clasificación no está disponible.',
  'Come leggere i coefficienti': 'Cómo leer los coeficientes',
  'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.':
    'Un odds ratio mayor que 1 indica que una unidad más del predictor aumenta las probabilidades de la clase respecto a la referencia; un valor menor que 1 las reduce.',
  'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.':
    'Los odds ratio se estiman ajustando por los demás predictores y con un intervalo de confianza al {s1}%: si el intervalo contiene 1, el efecto no se distingue de cero.',
  'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.':
    'Las pruebas sobre los coeficientes son de Wald (z = B/EE): con muestras pequeñas o clases raras pueden ser menos fiables que una comparación basada en la verosimilitud.',
  'Le osservazioni devono essere indipendenti tra loro (una riga = una unità).':
    'Las observaciones deben ser independientes entre sí (una fila = una unidad).',
  'Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.':
    'Las clases del resultado son nominales: el orden alfabético o numérico no implica una jerarquía.',
  'La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.':
    'La relación entre cada predictor y el logit de las clases es lineal: comprueba la forma o usa transformaciones.',
  'Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.':
    'Se necesitan observaciones suficientes para cada clase: las clases raras o vacías hacen inestables las estimaciones.',
  'La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.':
    'La separación perfecta (clases predichas sin errores) infla los coeficientes e invalida las pruebas.',
  'Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.':
    'No se incluyen efectos aleatorios, interacciones entre predictores ni regresión penalizada.',
  'L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.':
    'La exactitud depende de la distribución de las clases: compárala siempre con la frecuencia de la clase más común.',
  'Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.':
    'El modelo no maneja resultados ordenados: para categorías ordenadas se necesita una regresión ordinal.',
  'Report di lettura — ANOVA gerarchica': 'Informe de lectura — ANOVA jerárquica',
  '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.':
    '{s1} dentro de {s2}: efecto externo {s3}, efecto interno {s4}.',
  'L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.':
    'El ANOVA jerárquica trata un factor anidado dentro de otro: cada nivel del factor interno pertenece a un solo nivel del factor externo.',
  'È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.':
    'Es el diseño típico de clases dentro de escuelas, sujetos dentro de centros o lotes dentro de proveedores.',
  'Fattore esterno {s1}: F = {s2}, p = {s3}.': 'Factor externo {s1}: F = {s2}, p = {s3}.',
  'Fattore interno {s1}: F = {s2}, p = {s3}.': 'Factor interno {s1}: F = {s2}, p = {s3}.',
  'Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.':
    'Si el factor externo es significativo, los grupos mayores difieren entre sí más allá de la variabilidad de las subclases.',
  'Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.':
    'Si el factor interno es significativo, las subclases difieren dentro de los grupos: la estructura anidada explica parte de la variabilidad.',
  'Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.':
    'No interpretes el factor interno como un efecto principal «limpio»: su significado depende del factor externo.',
  'Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.':
    'El modelo asume normalidad y varianza constante dentro de cada celda; con celdas muy desequilibradas las estimaciones de los componentes de varianza son aproximadas.',
  '{s1}: {s2} (CI {s3} – {s4}), {s5}.': '{s1}: {s2} (CI {s3} – {s4}), {s5}.',
  'Report di lettura — Regressione non lineare': 'Informe de lectura — Regresión no lineal',
  'La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.':
    'La curva {s1} se ajusta bien a los datos: explica el {s2}% de la variabilidad de {s3}.',
  'La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.':
    'La curva {s1} explica el {s2}% de la variabilidad de {s3}: el ajuste es parcial.',
  'La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.':
    'La curva {s1} explica solo el {s2}% de la variabilidad de {s3}: la forma elegida no describe bien los datos.',
  'R² {s1}': 'R² {s1}',
  'La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.':
    'La regresión no lineal estima los parámetros de una curva elegida a priori, en lugar de una recta: la forma del modelo es una hipótesis, no un resultado de los datos.',
  'Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.':
    'La comparación entre curvas distintas no se hace con el R²: los modelos con distinto número de parámetros deben compararse con criterios que penalizan la complejidad.',
  'La curva e i suoi parametri': 'La curva y sus parámetros',
  'Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.':
    'Modelo {s1} estimado sobre {s2} observaciones, con {s3} grados de libertad residuales; la convergencia se alcanzó en {s4} iteraciones.',
  'R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).':
    'R² = {s1}, R² corregido = {s2}, RMSE = {s3} (en la unidad de {s4}).',
  'Parametri stimati': 'Parámetros estimados',
  'La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.':
    'La convergencia indica que el algoritmo encontró un punto estable, no que el modelo sea el correcto: comprueba siempre los residuos y la forma de la curva.',
  'L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.':
    'El algoritmo no ha alcanzado la convergencia: las estimaciones no son fiables y no deben interpretarse como resultado.',
  '{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.':
    '{s1} parámetros de {s2} tienen un p por debajo del {s3}%: un parámetro no significativo puede seguir siendo necesario para la forma de la curva.',
  'La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.':
    'La curva interpolada entre los puntos observados es una síntesis del modelo: fuera del intervalo de los datos su forma no está verificada.',
  'La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².':
    'La elección de la curva debe proceder del conocimiento del fenómeno, no solo de la comparación de los R².',
  'Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.':
    'Las estimaciones por mínimos cuadrados son sensibles a los valores extremos y a los puntos con alto apalancamiento.',
  'Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.':
    'Los errores estándar suponen residuos independientes y de varianza constante: con datos temporales o medidas repetidas deben revisarse.',
  'Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.':
    'Con pocos puntos respecto a los parámetros la estimación es inestable: se necesitan más observaciones que parámetros.',
  'Report di lettura — Regressione penalizzata': 'Informe de lectura — Regresión penalizada',
  '{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).':
    '{s1}: {s2} coeficientes no nulos de {s3} (λ = {s4}, α = {s5}).',
  'Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.':
    'Ridge, LASSO y elastic net añaden una penalización a los coeficientes para reducir la varianza de las estimaciones y gestionar la colinealidad.',
  'LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.':
    'LASSO puede anular coeficientes, produciendo un modelo disperso; ridge los reduce sin anularlos; elastic net combina ambos comportamientos.',
  'Variabili mantenute: {s1}.': 'Variables mantenidas: {s1}.',
  'nessuna': 'ninguna',
  'R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.':
    'R² = {s1}; coeficientes no nulos = {s2}; iteraciones = {s3}.',
  'Convergenza: {s1}.': 'Convergencia: {s1}.',
  'Come scegliere λ': 'Cómo elegir λ',
  'λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.':
    'λ no debe elegirse mirando el R² en la muestra: se necesita validación cruzada o un criterio externo.',
  'Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.':
    'Valores grandes simplifican el modelo pero pueden excluir señales reales; valores pequeños se acercan al OLS y a su inestabilidad.',
  'Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.':
    'Las variables se estandarizan internamente: los coeficientes solo son comparables entre sí tras esta transformación.',
  'Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.':
    'El nivel de confianza {s1}% se indica por coherencia con los demás procedimientos, pero los intervalos de los coeficientes penalizados no son interpretables como los del OLS.',
  'La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.':
    'La penalización introduce sesgo: los coeficientes no son estimadores insesgados y los errores estándar clásicos no se aplican.',
  'La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.':
    'La selección de λ y la estimación de la varianza requieren remuestreo, no incluido en este procedimiento.',
  'Report di lettura — Regressione polinomiale': 'Informe de lectura — Regresión polinómica',
  '{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).':
    '{s1} explicado por un polinomio de grado {s2} en {s3} (R² = {s4}).',
  'La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.':
    'La regresión polinómica extiende la recta a una curva: añade potencias de {s1} para captar tendencias no lineales.',
  'Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.':
    'El grado mide la flexibilidad de la curva; un grado alto reduce los residuos pero aumenta el riesgo de sobreajuste.',
  'R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.':
    'R² = {s1}, R² ajustado = {s2}, F = {s3}, p = {s4}.',
  'Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.':
    'El término de grado más alto es {s1}: B = {s2}, p = {s3}.',
  'RMSE = {s1}; AIC = {s2}; BIC = {s3}.': 'RMSE = {s1}; AIC = {s2}; BIC = {s3}.',
  'Come scegliere il grado': 'Cómo elegir el grado',
  'Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.':
    'Compara el R² ajustado, el AIC y el BIC entre grados distintos: el grado más alto no es automáticamente mejor.',
  'Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.':
    'Mira el gráfico: una curva que persigue cada punto es una señal de sobreajuste.',
  'Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.':
    'No extrapoles fuera del intervalo observado de {s1}: los polinomios divergen rápidamente.',
  'La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.':
    'La colinealidad entre potencias hace inestables los coeficientes individuales aunque la curva esté bien estimada: interpreta la forma, no solo los signos.',
  'Quantile (τ)': 'Cuantil (τ)',
  'sì': 'sí',
  'Funzione obiettivo': 'Función objetivo',
  '{s1}: β = {s2} (CI 95% {s3}), {s4}.': '{s1}: β = {s2} (CI 95% {s3}), {s4}.',
  'Report di lettura — Regressione quantilica': 'Informe de lectura — Regresión cuantílica',
  'Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.':
    'El símplex no ha alcanzado la convergencia: las estimaciones no son fiables.',
  'Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).':
    'En el cuantil τ = {s1}, ningún coeficiente de predictor es significativo (p < {s2}).',
  'Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).':
    'En el cuantil τ = {s1}, 1 coeficiente de predictor de {s2} es significativo (p < {s3}).',
  'Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).':
    'En el cuantil τ = {s1}, {s2} coeficientes de predictor de {s3} son significativos (p < {s4}).',
  'Non convergente': 'No convergente',
  'La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.':
    'La regresión cuantílica estima cómo cambia un cuantil condicional de Y, no la media: en lugar de la suma de cuadrados minimiza una pérdida absoluta asimétrica.',
  'Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.':
    'Con τ = 0,5 es una regresión mediana, robusta frente a valores atípicos; con τ cercano a 0 o 1 describe la cola baja o alta de la distribución.',
  'Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.':
    'El modelo usa {s1} observaciones completas y {s2} parámetros (incluida la intersección), con {s3} iteraciones del símplex.',
  'Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.':
    'El símplex ha alcanzado la convergencia y la pérdida mínima vale {s1}.',
  'La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.':
    'No se ha alcanzado la convergencia: aumenta el presupuesto de iteraciones o reduce los predictores antes de leer los coeficientes.',
  'β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.':
    'β mide cuánto cambia el cuantil τ de Y por una unidad más del predictor, manteniendo los demás constantes.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.':
    'La intersección es el cuantil τ estimado cuando todos los predictores valen cero: a menudo no tiene una interpretación sustantiva.',
  'Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.':
    'Un intervalo que contiene cero es compatible con ningún efecto al nivel elegido; el p es de Wald y usa errores estándar aproximados.',
  'Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.':
    'Con varios predictores el gráfico de puntos muestra el perfil del primer predictor en las medias de los demás, no una superficie completa.',
  'Perché scegliere un quantile': 'Por qué elegir un cuantil',
  'La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.':
    'La media es sensible a los valores atípicos y a las colas pesadas; la mediana y los demás cuantiles describen el centro o los extremos de la distribución condicionada.',
  'Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.':
    'Comparar cuantiles distintos del mismo modelo muestra si el efecto de un predictor cambia a lo largo de la distribución, algo que la regresión lineal no pone de manifiesto.',
  'Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.':
    'El precio es que cada cuantil debe estimarse por separado: las rectas de cuantiles próximos pueden cruzarse y no hay una verosimilitud única que comparar con una prueba LR.',
  'Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.':
    'El modelo es lineal en los parámetros para el cuantil elegido: si la relación cambia de forma en las colas, se necesitan transformaciones o términos añadidos.',
  'Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.':
    'Se necesitan observaciones suficientes cerca de τ: con colas extremas y muestras pequeñas las estimaciones se vuelven inestables.',
  'Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.':
    'Los errores estándar usan la aproximación de Powell/Hall–Sheather (quantreg, se = "nid") y pueden no ser fiables con pocos casos o residuos degenerados.',
  'La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.':
    'Hay que controlar la convergencia del símplex: un número de iteraciones en el límite indica un problema numérico, no un resultado.',
  'Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.':
    'No se incluyen intervalos bootstrap, pruebas entre cuantiles ni corrección para colas extremas.',
  'Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.':
    'El modelo es lineal en los parámetros: las relaciones no lineales requieren transformaciones o términos añadidos.',
  'La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.':
    'La bondad de ajuste no se resume en un R²: evalúa la pérdida asimétrica y la comparación entre cuantiles.',
  'Report di lettura — Selezione delle variabili': 'Informe de lectura — Selección de variables',
  'Il modello scelto contiene {s1} predittore/i: {s2}.':
    'El modelo elegido contiene {s1} predictor(es): {s2}.',
  'Nessun predittore supera il criterio: resta il modello con la sola intercetta.':
    'Ningún predictor supera el criterio: queda el modelo con solo la intersección.',
  'La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.':
    'La selección de variables busca un modelo más simple sin perder capacidad explicativa, comparando subconjuntos de predictores.',
  'La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.':
    'La búsqueda exhaustiva examina todos los subconjuntos; el stepwise añade o elimina una variable a la vez siguiendo el criterio elegido.',
  'Il modello con il BIC più basso usa {s1} variabili: {s2}.':
    'El modelo con el BIC más bajo usa {s1} variables: {s2}.',
  'Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.':
    'El stepwise examinó {s1} pasos y se detuvo con {s2} predictor(es).',
  'Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.':
    'Modelo final: R² = {s1}, R² ajustado = {s2}, F = {s3}.',
  'Il modello finale non contiene predittori significativi.':
    'El modelo final no contiene predictores significativos.',
  'La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.':
    'La selección automática tiende a sobreestimar la significación: los p-valores tras la selección no están ajustados.',
  'Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.':
    'Con muchos predictores la búsqueda exhaustiva es limitada: el número de subconjuntos crece de forma exponencial.',
  'Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.':
    'Usa la selección para explorar y luego confirma el modelo con datos independientes o validación cruzada.',
  'Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.':
    'El criterio BIC penaliza más que el AIC: produce modelos más parcimoniosos.',
  'I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.':
    'Los resultados dependen del criterio y de la dirección elegidos; indica siempre ambos junto con el nivel de confianza del {s1}%.',
  'Analisi delle medie (ANOM)': 'Análisis de medias (ANOM)',
  '{s1} per {s2} · α = {s3}': '{s1} por {s2} · α = {s3}',
  'Fuori limiti': 'Fuera de límites',
  'No': 'No',
  'Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.':
    'Media general = {s1}; cuadrado medio intragrupo = {s2} con {s3} grados de libertad.',
  'Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.':
    'El valor crítico h = {s1} usa la aproximación Bonferroni-t de la distribución del máximo módulo estudentizado.',
  '{s1} · famiglia {s2} · link {s3} · CI {s4}%': '{s1} · familia {s2} · enlace {s3} · CI {s4}%',
  'I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.':
    'Los coeficientes están en la escala del enlace: su interpretación cambia con la familia y el enlace.',
  'Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.':
    'La prueba z es de Wald; con muestras pequeñas puede diferir de la prueba de desviación.',
  'Devianza': 'Desviación',
  'Devianza nulla': 'Desviación nula',
  'df nullo': 'gl de la desviación nula',
  'Dispersione': 'Dispersión',
  'La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.':
    'La desviación mide la distancia respecto al modelo saturado; la desviación nula, la distancia respecto al modelo con solo la intersección.',
  'Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.':
    'Para familias con dispersión estimada (Gaussiana, Gamma) el cociente desviación/gl es un diagnóstico, no una prueba.',
  'Modello probit': 'Modelo probit',
  'stima di massima verosimiglianza (probit)': 'estimación de máxima verosimilitud (probit)',
  'Coefficienti ed exp(B)': 'Coeficientes y exp(B)',
  'exp(B)': 'exp(B)',
  'exp(B) CI low': 'exp(B) CI inferior',
  'exp(B) CI high': 'exp(B) CI superior',
  'Nel modello probit B è il coefficiente sulla scala normale latente: exp(B) non è un odds ratio ma un fattore moltiplicativo sul predittore latente.':
    'En el modelo probit B es el coeficiente en la escala normal latente: exp(B) no es un odds ratio sino un factor multiplicativo sobre el predictor latente.',
  'Un B positivo aumenta la probabilità dell’esito; l’effetto marginale dipende dal punto in cui viene valutato.':
    'Un B positivo aumenta la probabilidad del resultado; el efecto marginal depende del punto en que se evalúa.',
  'Modello multinomiale': 'Modelo multinomial',
  'stima di massima verosimiglianza · N = {s1}': 'estimación de máxima verosimilitud · N = {s1}',
  'Classi': 'Clases',
  'Classe di riferimento': 'Clase de referencia',
  'Accuratezza complessiva (%)': 'Exactitud global (%)',
  'no': 'no',
  'Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.':
    'El modelo estima una probabilidad para cada clase; la clase de referencia tiene los coeficientes fijados a cero.',
  'La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.':
    'La desviación compara la verosimilitud del modelo con la de un modelo saturado: valores más bajos indican un mejor ajuste.',
  'Coefficienti per classe': 'Coeficientes por clase',
  'Classe di riferimento: {s1} · CI {s2}%': 'Clase de referencia: {s1} · CI {s2}%',
  'Classe': 'Clase',
  'Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.':
    'Cada clase se compara con la clase de referencia: un OR > 1 aumenta las probabilidades de esa clase respecto a la referencia.',
  'I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.':
    'Los coeficientes se estiman ajustando por los demás predictores; la intersección no tiene un odds ratio interpretable.',
  'Classificazione per classe': 'Clasificación por clase',
  'Accuratezza complessiva: {s1}%': 'Exactitud global: {s1}%',
  'Corrette': 'Correctas',
  'Accuratezza (%)': 'Exactitud (%)',
  'Probabilità media (%)': 'Probabilidad media (%)',
  'La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.':
    'La clase predicha es la de mayor probabilidad estimada; la exactitud por clase es el cociente entre las clasificaciones correctas y las observaciones de esa clase.',
  'Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.':
    'Las clases raras pueden tener una exactitud inestable porque se calcula sobre pocas observaciones.',
  'ANOVA gerarchica': 'ANOVA jerárquica',
  '{s1} per {s2} annidato in {s3}': '{s1} para {s2} anidado en {s3}',
  'dentro': 'dentro de',
  'Errore': 'Error',
  'Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.':
    'El factor externo se contrasta contra el cuadrado medio del factor anidado, no contra el residuo.',
  'Il fattore interno è testato contro il residuo entro cella.':
    'El factor interno se contrasta contra el residuo dentro de cada celda.',
  'Descrittive per cella': 'Descriptivas por celda',
  'Componenti di varianza': 'Componentes de varianza',
  'Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.':
    'Estimaciones aproximadas para el modelo de efectos aleatorios; con celdas desequilibradas son indicativas.',
  'Esponenziale': 'Exponencial',
  'Logistica': 'Logística',
  'Gompertz': 'Gompertz',
  'Michaelis–Menten': 'Michaelis–Menten',
  'Parametri del modello': 'Parámetros del modelo',
  'Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.':
    'Las estimaciones son por mínimos cuadrados sobre la curva elegida; los errores estándar proceden de la matriz jacobiana en el punto óptimo.',
  'Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.':
    'La prueba t se refiere al parámetro individual: un p pequeño indica que el parámetro es distinto de cero en la escala de la curva.',
  '{s1} su {s2}': '{s1} de {s2}',
  'SSE': 'SSE',
  'R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.':
    'El R² compara la curva con la media de Y: no dice si la forma del modelo es la correcta, solo cuánto explica respecto a una recta plana.',
  'RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.':
    'El RMSE está en la misma unidad que la variable dependiente y resume el error típico de la curva.',
  'Coefficienti penalizzati': 'Coeficientes penalizados',
  '{s1} · {s2} · λ = {s3} · CI {s4}%': '{s1} · {s2} · λ = {s3} · CI {s4}%',
  'Coefficiente': 'Coeficiente',
  'I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.':
    'Los coeficientes están en la escala original de las variables; el modelo se estimó sobre predictores estandarizados.',
  'Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.':
    'Con LASSO los coeficientes exactamente nulos indican variables excluidas del modelo.',
  'Penalità': 'Penalización',
  'Coefficienti non nulli': 'Coeficientes no nulos',
  'λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.':
    'λ gobierna la fuerza de la penalización: valores más altos producen modelos más simples.',
  'α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.':
    'α = 0 es ridge, α = 1 es LASSO, los valores intermedios son elastic net.',
  'Coefficienti del polinomio': 'Coeficientes del polinomio',
  '{s1} su {s2} · grado {s3}': '{s1} de {s2} · grado {s3}',
  'Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.':
    'El modelo usa la base polinómica bruta: los coeficientes son los de x, x², … sin ortogonalización.',
  'CI al {s1}%.': 'CI al {s1}%.',
  'Gradi di libertà': 'Grados de libertad',
  '(Intercept)': '(Intercepto)',
  'Coefficienti della regressione quantilica': 'Coeficientes de la regresión cuantílica',
  '{s1} · τ = {s2}': '{s1} · τ = {s2}',
  'β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.':
    'β mide la variación del cuantil τ de la respuesta por una unidad más del predictor, ajustando por los demás.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.':
    'La intersección es el cuantil τ estimado cuando todos los predictores valen cero.',
  'Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.':
    'Los intervalos son normales al 95%; el p es de Wald a dos colas y usa errores estándar aproximados.',
  'Adattamento del modello quantilico': 'Ajuste del modelo cuantílico',
  '{s1} osservazioni · {s2} parametri': '{s1} observaciones · {s2} parámetros',
  'Residui assoluti medi': 'Residuos absolutos medios',
  'La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.':
    'La función objetivo es la suma de la pérdida asimétrica ρτ: con τ = 0,5 coincide con la regresión mediana.',
  'Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.':
    'El número de iteraciones cuenta los pivotes del símplex; un valor muy alto señala un problema numérico.',
  'Aggiunta': 'Adición',
  'Rimozione': 'Eliminación',
  'Partenza': 'Inicio',
  'Stop': 'Parada',
  'Migliori sottoinsiemi': 'Mejores subconjuntos',
  'Un modello per dimensione · criterio: {s1}': 'Un modelo por dimensión · criterio: {s1}',
  'La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.':
    'La búsqueda exhaustiva evalúa todos los subconjuntos hasta un máximo de 8 predictores; por encima de ese umbral el coste crece rápidamente.',
  'Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.':
    'El Cp compara cada modelo con el modelo completo: valores cercanos al número de parámetros indican un buen compromiso.',
  'Percorso stepwise': 'Trayectoria stepwise',
  'Direzione: {s1}': 'Dirección: {s1}',
  'Azione': 'Acción',
  'Modello selezionato': 'Modelo seleccionado',
  'R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.':
    'R² = {s1}; R² ajustado = {s2}; F = {s3}; p = {s4}.',
  'Report di lettura — MANCOVA': 'Informe de lectura — MANCOVA',
  'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.': 'Efecto de {s1} sobre {s2} variables, ajustado por {s3}: λ de Wilks = {s4}, p = {s5}.',
  'nessuna covariata': 'ninguna covariable',
  'La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.': 'La MANCOVA amplía la MANOVA con covariables continuas: compara grupos en varios resultados a la vez, corrigiendo por variables que podrían explicar parte de las diferencias.',
  'Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.': 'La prueba multivariada responde a «¿importa el grupo, ajustado por las covariables?»; las pruebas univariadas localizan el efecto en cada variable.',
  'Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.': 'λ de Wilks = {s1}, F = {s2} con {s3} y {s4} grados de libertad, p = {s5}.',
  '{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.': '{s1} de {s2} variables muestran un efecto de grupo significativo al nivel elegido.',
  '{s1}: F = {s2}, p = {s3}.': '{s1}: F = {s2}, p = {s3}.',
  'Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.': 'Las medias ajustadas son los valores esperados si todos los grupos tuvieran la misma media de las covariables: comparan los grupos «manteniendo constantes» las covariables.',
  'Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.': 'Un efecto multivariado significativo puede ocultar variables no significativas y viceversa: lea juntas la prueba global y las univariadas.',
  'Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.': 'Las covariables deben medirse antes del tratamiento y no ser consecuencias del grupo: de lo contrario, el ajuste elimina parte del efecto que se quiere estimar.',
  'Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.': 'El modelo supone relaciones lineales entre covariables y resultados y pendientes homogéneas entre grupos; compruebe estos puntos antes de confiar en el valor p.',
  'Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.': 'No se incluyen términos de interacción grupo × covariable, contrastes planificados ni correcciones por pruebas múltiples.',
  'Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.': 'Con grupos pequeños o covariables colineales las estimaciones se vuelven inestables y la prueba multivariada pierde potencia.',
  'Test multivariato': 'Prueba multivariada',
  'Wilk’s lambda · CI {s1}%': 'Lambda de Wilks · IC {s1}%',
  'Wilk’s lambda': 'Lambda de Wilks',
  'Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.': 'La prueba multivariada evalúa el efecto del grupo sobre todas las variables dependientes a la vez, ajustado por las covariables.',
  'L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.': 'La aproximación F de Rao es la que usa car::Anova; con muestras pequeñas el valor p puede diferir ligeramente.',
  'ANCOVA univariata per variabile': 'ANCOVA univariada por variable',
  'Effetto del gruppo al netto delle covariate': 'Efecto del grupo ajustado por las covariables',
  'Medie aggiustate': 'Medias ajustadas',
  'Valori attesi alle medie delle covariate': 'Valores esperados en las medias de las covariables',
};

