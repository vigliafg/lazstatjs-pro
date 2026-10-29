/** es: report and table prose (normalised). */
export const anovaCopy: Record<string, string> = {
  ', Brown–Forsythe {s1}':
    ', Brown–Forsythe {s1}',
  ', η² = {s1} (effetto {s2})':
    ', η² = {s1} (efecto {s2})',
  '; Cohen’s d = {s1} ({s2})':
    '; d de Cohen = {s1} ({s2})',
  '{s1} (soglia α = {s2}).':
    '{s1} (umbral α = {s2}).',
  '{s1} per {s2} · CI {s3}%':
    '{s1} por {s2} · CI {s3}%',
  '{s1} vs {s2}':
    '{s1} frente a {s2}',
  '{s1}: differenza {s2}, {s3} → {s4}{s5}.':
    '{s1}: diferencia {s2}, {s3} → {s4}{s5}.',
  '{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.':
    '{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.',
  'Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.':
    'Al menos una media de grupo es distinta de las demás: se rechaza la hipótesis nula de medias todas iguales.',
  'alternativa con varianze diseguali':
    'alternativa con varianzas desiguales',
  'Alternativa non parametrica':
    'Alternativa no paramétrica',
  'ANOVA a una via':
    'ANOVA de un factor',
  'assunzione di varianze uguali plausibile':
    'supuesto de varianzas iguales plausible',
  'Assunzioni':
    'Supuestos',
  'Assunzioni e robustezza':
    'Supuestos y robustez',
  'Between (gruppi)':
    'Entre (grupos)',
  'Brown–Forsythe (mediana)':
    'Brown–Forsythe (mediana)',
  'CI della media entro gruppo: t di Student con df = n_gruppo − 1.':
    'CI de la media dentro del grupo: t de Student con df = n_grupo − 1.',
  'CI high':
    'CI superior',
  'CI low':
    'CI inferior',
  'Cohen\'s d':
    'd de Cohen',
  'Cohen’s d per confronto usa la SD within pooled (√MS_within).':
    'La d de Cohen por comparación usa la SD within combinada (√MS_within).',
  'Cohen\'s f':
    'f de Cohen',
  'Come leggere i numeri':
    'Cómo leer los números',
  'Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.':
    'Con grupos muy desequilibrados o varianzas muy distintas, la prueba clásica puede dar valores p poco fiables: usa el ANOVA de Welch o Kruskal–Wallis.',
  'conferma che almeno un gruppo si distribuisce diversamente':
    'confirma que al menos un grupo se distribuye de forma distinta',
  'conferma la differenza tra le medie anche senza assumere varianze uguali':
    'confirma la diferencia entre las medias incluso sin suponer varianzas iguales',
  'Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.':
    'Compara los dos resultados: si divergen, el resultado paramétrico depende del supuesto de normalidad y debe presentarse con más prudencia.',
  'Confronti post-hoc ({s1})':
    'Comparaciones post-hoc ({s1})',
  'Confronto':
    'Comparación',
  'Controllo':
    'Comprobación',
  'correzione Bonferroni':
    'corrección de Bonferroni',
  'correzione FDR':
    'corrección FDR',
  'correzione Holm':
    'corrección de Holm',
  'Descrittive per gruppo':
    'Descriptivos por grupo',
  'df':
    'df',
  'df1':
    'df1',
  'df2':
    'df2',
  'differenza significativa':
    'diferencia significativa',
  'Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.':
    'Dunn usa la varianza de los rangos con corrección por los empates; p corregido con Holm o Bonferroni.',
  'Effect size':
    'Tamaño del efecto',
  'F':
    'F',
  'F = MS_between / MS_within; p da F({s1}, {s2}).':
    'F = MS_between / MS_within; p de F({s1}, {s2}).',
  'F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.':
    'F compara la variabilidad entre los grupos con la de dentro de los grupos: valores cercanos a 1 indican que los grupos no se distinguen.',
  'FDR (Benjamini–Hochberg)':
    'FDR (Benjamini–Hochberg)',
  'Games–Howell (Welch pairwise)':
    'Games–Howell (Welch por pares)',
  'Gruppi diversi':
    'Grupos distintos',
  'Gruppo':
    'Grupo',
  'H':
    'H',
  'H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.':
    'H corregido por los rangos empatados; η²_H = (H − k + 1)/(N − k) es un tamaño del efecto.',
  'H₀: tutte le medie uguali · α = {s1}':
    'H₀: todas las medias iguales · α = {s1}',
  'I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.':
    'Los CI son individuales (no simultáneos) al nivel elegido; con Holm/Bonferroni el p está corregido, el CI no.',
  'I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.':
    'Los grupos deben proceder de observaciones independientes: la misma unidad no debe aparecer en dos grupos.',
  'I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.':
    'Los valores p post-hoc ya están corregidos: úsalos en lugar de los p de las pruebas t individuales, que serían demasiado optimistas.',
  'Il fattore {s1} spiega una parte {s2} della variabilità di {s3}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.':
    'El factor {s1} explica una parte {s2} de la variabilidad de {s3}. Para saber qué grupos se distinguen, lee las comparaciones post-hoc de arriba.',
  'Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.':
    'La razón max(SD)/min(SD) es una comprobación descriptiva adicional de la homogeneidad.',
  'Il test principale':
    'La prueba principal',
  'In pratica':
    'En la práctica',
  'In un ANOVA a una via partial η² coincide con η².':
    'En un ANOVA de un factor, el η² parcial coincide con el η².',
  'Interpretazione':
    'Interpretación',
  'Jarque–Bera {s1}':
    'Jarque–Bera {s1}',
  'Kruskal–Wallis H (non parametrico)':
    'Kruskal–Wallis H (no paramétrico)',
  'Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.':
    'Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.',
  'L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.':
    'El ANOVA compara la variabilidad entre los grupos con la interna a los grupos: si los grupos difieren de verdad, la primera es grande respecto a la segunda.',
  'L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.':
    'El ANOVA solo dice que los grupos no son todos iguales: para saber qué parejas difieren hacen falta las comparaciones por pares, con los valores p ya corregidos por el número de comparaciones.',
  'L’ANOVA non è calcolabile con i dati disponibili.':
    'El ANOVA no se puede calcular con los datos disponibles.',
  'L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.':
    'El ANOVA requiere observaciones independientes: las medidas repetidas en la misma unidad necesitan un modelo para datos emparejados.',
  'L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.':
    'No se rechaza la hipótesis nula de medias todas iguales: los datos no muestran diferencias fiables entre los grupos.',
  'La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.':
    'La significación global no dice qué grupos difieren: siempre hacen falta las comparaciones post-hoc.',
  'Le medie di {s1} differiscono tra i gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}){s6}.':
    'Las medias de {s1} difieren entre los grupos de {s2}: F = {s3}, {s4} (umbral α = {s5}){s6}.',
  'Levene (media)':
    'Levene (media)',
  'Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.':
    'Levene significativo: varianzas no homogéneas. Presenta también el ANOVA de Welch y/o Kruskal-Wallis.',
  'Max':
    'Máx',
  'Mean':
    'Media',
  'Mean diff':
    'Diferencia de medias',
  'Mean rank':
    'Rango medio',
  'Median':
    'Mediana',
  'Medie dei gruppi':
    'Medias de los grupos',
  'Min':
    'Mín',
  'Misura':
    'Medida',
  'MS':
    'MS',
  'N':
    'N',
  'Nessuna differenza':
    'Ninguna diferencia',
  'nessuna differenza affidabile':
    'ninguna diferencia fiable',
  'Nessuna evidenza di eteroschedasticità.':
    'Ninguna evidencia de heterocedasticidad.',
  'Non ci sono prove sufficienti che {s1} sposti {s2}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.':
    'No hay pruebas suficientes de que {s1} desplace {s2}. Con grupos pequeños el ANOVA tiene poca potencia: la ausencia de significación no equivale a la ausencia de efecto.',
  'non conferma differenze tra i gruppi':
    'no confirma diferencias entre los grupos',
  'non conferma la differenza quando le varianze sono libere di differire':
    'no confirma la diferencia cuando las varianzas pueden diferir',
  'Non emerge una differenza tra le medie di {s1} nei gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}).':
    'No emerge una diferencia entre las medias de {s1} en los grupos de {s2}: F = {s3}, {s4} (umbral α = {s5}).',
  'non quantificabile':
    'no cuantificable',
  'normalità residui del gruppo (N = {s1})':
    'normalidad de los residuos del grupo (N = {s1})',
  'Nota':
    'Nota',
  'omogeneità descrittiva delle SD':
    'homogeneidad descriptiva de las SD',
  'omoschedasticità':
    'homocedasticidad',
  'Omoschedasticità non verificabile con questi dati.':
    'Homocedasticidad no verificable con estos datos.',
  'Omoschedasticità: Levene {s1}{s2} → {s3}.':
    'Homocedasticidad: Levene {s1}{s2} → {s3}.',
  'p':
    'p',
  'p corretto':
    'p corregido',
  'p non corretto':
    'p sin corregir',
  'partial η²':
    'η² parcial',
  'Post-hoc':
    'Post-hoc',
  'Post-hoc Dunn':
    'Post-hoc de Dunn',
  'Ranghi per gruppo':
    'Rangos por grupo',
  'Rank sum':
    'Suma de rangos',
  'rapporto sd':
    'razón de SD',
  'Rapporto SD max/min':
    'Razón SD máx/mín',
  'Rapporto tra SD massima e minima: {s1} (valori molto sopra 2 indicano gruppi con dispersione diversa).':
    'Razón entre la SD máxima y la mínima: {s1} (valores muy por encima de 2 indican grupos con dispersión distinta).',
  'Report di lettura — ANOVA a una via':
    'Informe de lectura — ANOVA de un factor',
  'robusto agli outlier':
    'robusto frente a valores atípicos',
  'SD':
    'SD',
  'SE':
    'SE',
  'Source':
    'Fuente',
  'SS':
    'SS',
  'Statistica':
    'Estadístico',
  'Statistica F = {s1} con df = ({s2}, {s3}).':
    'Estadístico F = {s1} con df = ({s2}, {s3}).',
  'Stima':
    'Estimación',
  't':
    't',
  'Tukey–Kramer (approssimazione Bonferroni)':
    'Tukey–Kramer (aproximación de Bonferroni)',
  'Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.':
    'Tukey–Kramer usa aquí la aproximación t con ajuste de Bonferroni: se indica explícitamente para no presentarla como el rango estudentizado exacto.',
  'Varianza spiegata dai gruppi: η² = {s1}, cioè circa il {s2}% della variabilità totale di {s3}.':
    'Varianza explicada por los grupos: η² = {s1}, es decir, alrededor del {s2} % de la variabilidad total de {s3}.',
  'varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis':
    'varianzas no homogéneas, así que el ANOVA clásico es arriesgado y conviene usar Welch o Kruskal–Wallis',
  'Verifica se la media di {s1} cambia tra i livelli del fattore {s2}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.':
    'Comprueba si la media de {s1} cambia entre los niveles del factor {s2}. La hipótesis nula es que todas las medias de los grupos son iguales.',
  'Welch ANOVA':
    'ANOVA de Welch',
  'Welch ANOVA: {s1} → {s2}.':
    'ANOVA de Welch: {s1} → {s2}.',
  'Within (errore)':
    'Dentro (error)',
  'z':
    'z',
  'ε²':
    'ε²',
  'η²':
    'η²',
  'η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.':
    'η² (eta cuadrado) es la proporción de variabilidad explicada por el factor: 0.01 pequeña, 0.06 media, 0.14 grande.',
  'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.':
    'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.',
  'η²_H':
    'η²_H',
  'η²_H = {s1}: dimensione dell’effetto stimata sui ranghi.':
    'η²_H = {s1}: tamaño del efecto estimado sobre los rangos.',
  'ω²':
    'ω²',
  'ω² = {s1}: stima meno distorta della quota di varianza spiegata nella popolazione.':
    'ω² = {s1}: estimación menos sesgada de la proporción de varianza explicada en la población.',
};
