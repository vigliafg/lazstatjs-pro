/** es: report and table prose (normalised). */
export const agreementCopy: Record<string, string> = {
  '{s1} coppie · CI {s2}%':
    '{s1} parejas · CI {s2}%',
  '{s1} soggetti × {s2} misure · CI {s3}%':
    '{s1} sujetos × {s2} mediciones · CI {s3}%',
  '{s1} soggetti × {s2} rater · {s3} categorie · CI {s4}%':
    '{s1} sujetos × {s2} evaluadores · {s3} categorías · CI {s4}%',
  'Accordo atteso':
    'Concordancia esperada',
  'Accordo debole':
    'Concordancia débil',
  'Accordo moderato':
    'Concordancia moderada',
  'Accordo osservato':
    'Concordancia observada',
  'Accordo osservato = {s1}; accordo atteso per caso = {s2}.':
    'Concordancia observada = {s1}; concordancia esperada por azar = {s2}.',
  'Accordo quasi perfetto':
    'Concordancia casi perfecta',
  'Accordo sostanziale':
    'Concordancia sustancial',
  'Affidabilità bassa':
    'Fiabilidad baja',
  'Affidabilità buona':
    'Fiabilidad buena',
  'Affidabilità moderata':
    'Fiabilidad moderada',
  'Bias':
    'Sesgo',
  'bias + 1.96·SD':
    'sesgo + 1.96·SD',
  'Bias = {s1} (CI {s2}%: {s3} – {s4}).':
    'Sesgo = {s1} (CI {s2}%: {s3} – {s4}).',
  'bias − 1.96·SD':
    'sesgo − 1.96·SD',
  'Bias contenuto':
    'Sesgo contenido',
  'Bias da valutare':
    'Sesgo que valorar',
  'bias proporzionale':
    'sesgo proporcional',
  'Bland–Altman':
    'Bland–Altman',
  'CI bias high':
    'CI sesgo superior',
  'CI bias low':
    'CI sesgo inferior',
  'CI high':
    'CI superior',
  'CI limite inf. high':
    'CI límite inf. superior',
  'CI limite inf. low':
    'CI límite inf. inferior',
  'CI limite sup. high':
    'CI límite sup. superior',
  'CI limite sup. low':
    'CI límite sup. inferior',
  'CI low':
    'CI inferior',
  'Cohen kappa':
    'Kappa de Cohen',
  'Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.':
    'Con dos evaluadores se usa el kappa de Cohen; las discrepancias pueden ponderarse si las categorías están ordenadas.',
  'Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.':
    'Con más de dos evaluadores se usa el kappa de Fleiss; las discrepancias entre evaluadores no se ponderan.',
  'Dettaglio':
    'Detalle',
  'dispersione delle differenze':
    'dispersión de las diferencias',
  'F':
    'F',
  'Fleiss kappa':
    'Kappa de Fleiss',
  'H0: pendenza = 0':
    'H0: pendiente = 0',
  'I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.':
    'Los límites de concordancia no son límites de confianza: describen la variabilidad individual.',
  'I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).':
    'Los límites de concordancia se estiman como sesgo ± 1.96·SD; sus CI usan la aproximación sqrt(3·SD²/n).',
  'ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.':
    'Un ICC cercano a 1 indica que las mediciones son intercambiables; los valores por debajo de 0.5 indican que la variabilidad entre sujetos no se distingue del error de medición.',
  'ICC(1,1) one-way':
    'ICC(1,1) de una vía',
  'ICC(2,1) = {s1} su {s2} misure e {s3} soggetti.':
    'ICC(2,1) = {s1} en {s2} mediciones y {s3} sujetos.',
  'ICC(2,1) absolute agreement':
    'ICC(2,1) concordancia absoluta',
  'ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.':
    'ICC(2,1) es el modelo two-way random de efectos mixtos con concordancia absoluta.',
  'ICC(3,1) consistency':
    'ICC(3,1) consistencia',
  'ICC(3,1) di consistenza = {s1}; F = {s2}, p = {s3}.':
    'ICC(3,1) de consistencia = {s1}; F = {s2}, p = {s3}.',
  'ICC(3,1) ignora la differenza sistematica tra rater (consistency).':
    'ICC(3,1) ignora la diferencia sistemática entre evaluadores (consistencia).',
  'Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.':
    'El sesgo es la diferencia media sistemática; los límites de concordancia describen cuánto pueden divergir las dos mediciones en un mismo sujeto.',
  'Il livello di confidenza richiesto è {s1}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.':
    'El nivel de confianza solicitado es el {s1} %, pero el ICC es un índice descriptivo: no hay una prueba de superioridad.',
  'Intraclass correlation':
    'Correlación intraclase',
  'Kappa':
    'Kappa',
  'Kappa = {s1} (CI {s2}%: {s3} – {s4}).':
    'Kappa = {s1} (CI {s2}%: {s3} – {s4}).',
  'Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.':
    'Kappa corrige la concordancia observada por la esperada por azar. Los umbrales 0.4/0.6/0.8 son convenciones, no leyes.',
  'Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.':
    'Kappa es sensible a la prevalencia de las categorías y al número de categorías.',
  'Kappa non pesata: tutte le discordanze contano allo stesso modo.':
    'Kappa sin ponderar: todas las discrepancias cuentan igual.',
  'Kappa pesata {s1} sulle categorie ordinate.':
    'Kappa ponderado {s1} sobre las categorías ordenadas.',
  'L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.':
    'El ICC depende de la variabilidad de la muestra: una muestra restringida puede inflarlo.',
  'La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.':
    'La pendiente es significativa: el sesgo no es constante y crece o decrece con el nivel de la medición.',
  'Limite inferiore':
    'Límite inferior',
  'Limite superiore':
    'Límite superior',
  'Limiti di accordo: {s1} – {s2}.':
    'Límites de concordancia: {s1} – {s2}.',
  'media delle differenze':
    'media de las diferencias',
  'Metrica':
    'Métrica',
  'MS between raters':
    'MS entre evaluadores',
  'MS between subjects':
    'MS entre sujetos',
  'MS residual':
    'MS residual',
  'Non c’è evidenza di un bias proporzionale al livello della misura.':
    'No hay evidencia de un sesgo proporcional al nivel de la medición.',
  'p':
    'p',
  'p = {s1} contro kappa = 0.':
    'p = {s1} frente a kappa = 0.',
  'p pendenza':
    'p de la pendiente',
  'Pendenza del bias sulla media = {s1} (p = {s2}).':
    'Pendiente del sesgo sobre la media = {s1} (p = {s2}).',
  'Pendenza su media':
    'Pendiente sobre la media',
  'Report Bland–Altman':
    'Informe de Bland–Altman',
  'Report di accordo categorico':
    'Informe de concordancia categórica',
  'Report di affidabilità':
    'Informe de fiabilidad',
  'SD differenze':
    'SD de las diferencias',
  'SE':
    'SE',
  'Una pendenza significativa indica che il bias cambia con la grandezza della misura.':
    'Una pendiente significativa indica que el sesgo cambia con la magnitud de la medición.',
  'Valore':
    'Valor',
  'z':
    'z',
};
