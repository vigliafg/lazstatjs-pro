/** fr: report and table prose (normalised). */
export const anovaCopy: Record<string, string> = {
  ', Brown–Forsythe {s1}':
    ', Brown–Forsythe {s1}',
  ', η² = {s1} (effetto {s2})':
    ', η² = {s1} (effet {s2})',
  '; Cohen’s d = {s1} ({s2})':
    ' ; Cohen’s d = {s1} ({s2})',
  '{s1} (soglia α = {s2}).':
    '{s1} (seuil α = {s2}).',
  '{s1} per {s2} · CI {s3}%':
    '{s1} par {s2} · IC {s3} %',
  '{s1} vs {s2}':
    '{s1} vs {s2}',
  '{s1}: differenza {s2}, {s3} → {s4}{s5}.':
    '{s1} : différence {s2}, {s3} → {s4}{s5}.',
  '{s1}: n = {s2}, media {s3} (CI {s4}% {s5}), mediana {s6}, SD {s7}.':
    '{s1} : n = {s2}, moyenne {s3} (IC {s4} % {s5}), médiane {s6}, SD {s7}.',
  'Almeno una media di gruppo è diversa dalle altre: l’ipotesi nulla di medie tutte uguali viene rifiutata.':
    'Au moins une moyenne de groupe diffère des autres : l’hypothèse nulle de moyennes toutes égales est rejetée.',
  'alternativa con varianze diseguali':
    'alternative avec variances inégales',
  'Alternativa non parametrica':
    'Alternative non paramétrique',
  'ANOVA a una via':
    'ANOVA à un facteur',
  'assunzione di varianze uguali plausibile':
    'hypothèse de variances égales plausible',
  'Assunzioni':
    'Hypothèses',
  'Assunzioni e robustezza':
    'Hypothèses et robustesse',
  'Between (gruppi)':
    'Inter-groupes',
  'Brown–Forsythe (mediana)':
    'Brown–Forsythe (médiane)',
  'CI della media entro gruppo: t di Student con df = n_gruppo − 1.':
    'IC de la moyenne dans le groupe : t de Student avec dl = n_groupe − 1.',
  'CI high':
    'IC haut',
  'CI low':
    'IC bas',
  'Cohen\'s d':
    'Cohen\'s d',
  'Cohen’s d per confronto usa la SD within pooled (√MS_within).':
    'Cohen’s d par comparaison utilise la SD intra mise en commun (√MS_intra).',
  'Cohen\'s f':
    'Cohen\'s f',
  'Come leggere i numeri':
    'Comment lire les nombres',
  'Con gruppi molto sbilanciati o varianze molto diverse il test classico può dare p inaffidabili: usa Welch ANOVA o Kruskal–Wallis.':
    'Avec des groupes très déséquilibrés ou des variances très différentes, le test classique peut donner des p non fiables : utilisez l’ANOVA de Welch ou Kruskal–Wallis.',
  'conferma che almeno un gruppo si distribuisce diversamente':
    'confirme qu’au moins un groupe se distribue différemment',
  'conferma la differenza tra le medie anche senza assumere varianze uguali':
    'confirme la différence entre les moyennes même sans supposer des variances égales',
  'Confronta i due esiti: se divergono, il risultato parametrico dipende dall’assunzione di normalità e va presentato con maggiore prudenza.':
    'Comparez les deux résultats : s’ils divergent, le résultat paramétrique dépend de l’hypothèse de normalité et doit être présenté avec plus de prudence.',
  'Confronti post-hoc ({s1})':
    'Comparaisons post-hoc ({s1})',
  'Confronto':
    'Comparaison',
  'Controllo':
    'Contrôle',
  'correzione Bonferroni':
    'correction de Bonferroni',
  'correzione FDR':
    'correction FDR',
  'correzione Holm':
    'correction de Holm',
  'Descrittive per gruppo':
    'Descriptives par groupe',
  'df':
    'dl',
  'df1':
    'dl1',
  'df2':
    'dl2',
  'differenza significativa':
    'différence significative',
  'Dunn usa la varianza dei ranghi con correzione per i pari; p corretto con Holm o Bonferroni.':
    'Dunn utilise la variance des rangs avec correction pour les rangs égaux ; p corrigée avec Holm ou Bonferroni.',
  'Effect size':
    'Taille d’effet',
  'F':
    'F',
  'F = MS_between / MS_within; p da F({s1}, {s2}).':
    'F = MS_inter / MS_intra ; p issue d’une F({s1}, {s2}).',
  'F confronta la variabilità tra i gruppi con quella dentro i gruppi: valori vicini a 1 indicano che i gruppi non si distinguono.':
    'F compare la variabilité entre les groupes avec celle à l’intérieur des groupes : des valeurs proches de 1 indiquent que les groupes ne se distinguent pas.',
  'FDR (Benjamini–Hochberg)':
    'FDR (Benjamini–Hochberg)',
  'Games–Howell (Welch pairwise)':
    'Games–Howell (Welch par paires)',
  'Gruppi diversi':
    'Groupes différents',
  'Gruppo':
    'Groupe',
  'H':
    'H',
  'H corretto per i ranghi pari; η²_H = (H − k + 1)/(N − k) è una dimensione dell’effetto.':
    'H corrigé pour les rangs égaux ; η²_H = (H − k + 1)/(N − k) est une taille d’effet.',
  'H₀: tutte le medie uguali · α = {s1}':
    'H₀ : toutes les moyennes égales · α = {s1}',
  'I CI sono individuali (non simultanei) al livello scelto; per Holm/Bonferroni il p è corretto, il CI no.':
    'Les IC sont individuels (non simultanés) au niveau choisi ; pour Holm/Bonferroni, la p est corrigée, l’IC non.',
  'I gruppi dovrebbero provenire da osservazioni indipendenti: la stessa unità non deve comparire in due gruppi.':
    'Les groupes doivent provenir d’observations indépendantes : la même unité ne doit pas apparaître dans deux groupes.',
  'I p post-hoc sono già corretti: usali al posto dei p dei singoli t-test, che sarebbero troppo ottimisti.':
    'Les p post-hoc sont déjà corrigées : utilisez-les à la place des p des tests t individuels, qui seraient trop optimistes.',
  'Il fattore {s1} spiega una parte {s2} della variabilità di {s3}. Per capire quali gruppi si distinguono, leggi i confronti post-hoc qui sopra.':
    'Le facteur {s1} explique une part {s2} de la variabilité de {s3}. Pour comprendre quels groupes se distinguent, lisez les comparaisons post-hoc ci-dessus.',
  'Il rapporto max(SD)/min(SD) è un ulteriore controllo descrittivo della omogeneità.':
    'Le rapport max(SD)/min(SD) est un contrôle descriptif supplémentaire de l’homogénéité.',
  'Il test principale':
    'Le test principal',
  'In pratica':
    'En pratique',
  'In un ANOVA a una via partial η² coincide con η².':
    'Dans une ANOVA à un facteur, l’η² partiel coïncide avec η².',
  'Interpretazione':
    'Interprétation',
  'Jarque–Bera {s1}':
    'Jarque–Bera {s1}',
  'Kruskal–Wallis H (non parametrico)':
    'Kruskal–Wallis H (non paramétrique)',
  'Kruskal–Wallis: H = {s1} con df = {s2}, {s3} → {s4}.':
    'Kruskal–Wallis : H = {s1} avec dl = {s2}, {s3} → {s4}.',
  'L’ANOVA confronta la variabilità tra i gruppi con quella interna ai gruppi: se i gruppi differiscono davvero, la prima è grande rispetto alla seconda.':
    'L’ANOVA compare la variabilité entre les groupes avec celle interne aux groupes : si les groupes diffèrent vraiment, la première est grande par rapport à la seconde.',
  'L’ANOVA dice solo che i gruppi non sono tutti uguali: per sapere quali coppie differiscono servono i confronti a coppie, con p già corretti per il numero di confronti.':
    'L’ANOVA dit seulement que les groupes ne sont pas tous égaux : pour savoir quelles paires diffèrent, il faut les comparaisons par paires, avec des p déjà corrigées pour le nombre de comparaisons.',
  'L’ANOVA non è calcolabile con i dati disponibili.':
    'L’ANOVA n’est pas calculable avec les données disponibles.',
  'L’ANOVA richiede osservazioni indipendenti: misure ripetute sulla stessa unità richiedono un modello per dati appaiati.':
    'L’ANOVA exige des observations indépendantes : des mesures répétées sur la même unité demandent un modèle pour données appariées.',
  'L’ipotesi nulla di medie tutte uguali non viene rifiutata: i dati non mostrano differenze affidabili tra i gruppi.':
    'L’hypothèse nulle de moyennes toutes égales n’est pas rejetée : les données ne montrent pas de différences fiables entre les groupes.',
  'La significatività globale non dice quali gruppi differiscono: servono sempre i confronti post-hoc.':
    'La significativité globale ne dit pas quels groupes diffèrent : les comparaisons post-hoc sont toujours nécessaires.',
  'Le medie di {s1} differiscono tra i gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}){s6}.':
    'Les moyennes de {s1} diffèrent entre les groupes de {s2} : F = {s3}, {s4} (seuil α = {s5}){s6}.',
  'Levene (media)':
    'Levene (moyenne)',
  'Levene significativo: varianze non omogenee. Riportare anche la Welch ANOVA e/o Kruskal-Wallis.':
    'Levene significatif : variances non homogènes. Rapportez aussi l’ANOVA de Welch et/ou Kruskal-Wallis.',
  'Max':
    'Max',
  'Mean':
    'Moyenne',
  'Mean diff':
    'Diff. moyennes',
  'Mean rank':
    'Rang moyen',
  'Median':
    'Médiane',
  'Medie dei gruppi':
    'Moyennes des groupes',
  'Min':
    'Min',
  'Misura':
    'Mesure',
  'MS':
    'MS',
  'N':
    'N',
  'Nessuna differenza':
    'Aucune différence',
  'nessuna differenza affidabile':
    'aucune différence fiable',
  'Nessuna evidenza di eteroschedasticità.':
    'Aucune preuve d’hétéroscédasticité.',
  'Non ci sono prove sufficienti che {s1} sposti {s2}. Con gruppi piccoli l’ANOVA ha poca potenza: l’assenza di significatività non equivale all’assenza di effetto.':
    'Il n’y a pas assez de preuves que {s1} déplace {s2}. Avec de petits groupes, l’ANOVA a peu de puissance : l’absence de significativité n’équivaut pas à l’absence d’effet.',
  'non conferma differenze tra i gruppi':
    'ne confirme pas de différences entre les groupes',
  'non conferma la differenza quando le varianze sono libere di differire':
    'ne confirme pas la différence lorsque les variances sont libres de différer',
  'Non emerge una differenza tra le medie di {s1} nei gruppi di {s2}: F = {s3}, {s4} (soglia α = {s5}).':
    'Aucune différence n’apparaît entre les moyennes de {s1} dans les groupes de {s2} : F = {s3}, {s4} (seuil α = {s5}).',
  'non quantificabile':
    'non quantifiable',
  'normalità residui del gruppo (N = {s1})':
    'normalité des résidus du groupe (N = {s1})',
  'Nota':
    'Note',
  'omogeneità descrittiva delle SD':
    'homogénéité descriptive des SD',
  'omoschedasticità':
    'homoscédasticité',
  'Omoschedasticità non verificabile con questi dati.':
    'Homoscédasticité non vérifiable avec ces données.',
  'Omoschedasticità: Levene {s1}{s2} → {s3}.':
    'Homoscédasticité : Levene {s1}{s2} → {s3}.',
  'p':
    'p',
  'p corretto':
    'p corrigée',
  'p non corretto':
    'p non corrigée',
  'partial η²':
    'η² partiel',
  'Post-hoc':
    'Post-hoc',
  'Post-hoc Dunn':
    'Post-hoc de Dunn',
  'Ranghi per gruppo':
    'Rangs par groupe',
  'Rank sum':
    'Somme des rangs',
  'rapporto sd':
    'rapport sd',
  'Rapporto SD max/min':
    'Rapport SD max/min',
  'Rapporto tra SD massima e minima: {s1} (valori molto sopra 2 indicano gruppi con dispersione diversa).':
    'Rapport entre SD maximale et minimale : {s1} (des valeurs très supérieures à 2 indiquent des groupes de dispersion différente).',
  'Report di lettura — ANOVA a una via':
    'Rapport de lecture — ANOVA à un facteur',
  'robusto agli outlier':
    'robuste aux valeurs aberrantes',
  'SD':
    'SD',
  'SE':
    'SE',
  'Source':
    'Source',
  'SS':
    'SS',
  'Statistica':
    'Statistique',
  'Statistica F = {s1} con df = ({s2}, {s3}).':
    'Statistique F = {s1} avec dl = ({s2}, {s3}).',
  'Stima':
    'Estimation',
  't':
    't',
  'Tukey–Kramer (approssimazione Bonferroni)':
    'Tukey–Kramer (approximation de Bonferroni)',
  'Tukey–Kramer qui usa l’approssimazione t con aggiustamento Bonferroni: riportato esplicitamente per non spacciarla per il range studentizzato esatto.':
    'Tukey–Kramer utilise ici l’approximation t avec ajustement de Bonferroni : c’est signalé explicitement pour ne pas la faire passer pour l’étendue studentisée exacte.',
  'Varianza spiegata dai gruppi: η² = {s1}, cioè circa il {s2}% della variabilità totale di {s3}.':
    'Variance expliquée par les groupes : η² = {s1}, soit environ {s2} % de la variabilité totale de {s3}.',
  'varianze non omogenee, quindi l’ANOVA classica è a rischio e conviene usare Welch o Kruskal–Wallis':
    'variances non homogènes, donc l’ANOVA classique est à risque et il vaut mieux utiliser Welch ou Kruskal–Wallis',
  'Verifica se la media di {s1} cambia tra i livelli del fattore {s2}. L’ipotesi nulla è che tutte le medie dei gruppi siano uguali.':
    'Vérifie si la moyenne de {s1} change entre les niveaux du facteur {s2}. L’hypothèse nulle est que toutes les moyennes des groupes sont égales.',
  'Welch ANOVA':
    'ANOVA de Welch',
  'Welch ANOVA: {s1} → {s2}.':
    'ANOVA de Welch : {s1} → {s2}.',
  'Within (errore)':
    'Intra-groupes (erreur)',
  'z':
    'z',
  'ε²':
    'ε²',
  'η²':
    'η²',
  'η² (eta quadro) è la quota di variabilità spiegata dal fattore: 0.01 piccolo, 0.06 medio, 0.14 grande.':
    'η² (êta carré) est la part de variabilité expliquée par le facteur : 0.01 petit, 0.06 moyen, 0.14 grand.',
  'η² = SS_between / SS_total; ω² = (SS_between − (k−1)·MS_within)/(SS_total + MS_within); ε² = (SS_between − (k−1)·MS_within)/SS_total.':
    'η² = SS_inter / SS_total ; ω² = (SS_inter − (k−1)·MS_intra)/(SS_total + MS_intra) ; ε² = (SS_inter − (k−1)·MS_intra)/SS_total.',
  'η²_H':
    'η²_H',
  'η²_H = {s1}: dimensione dell’effetto stimata sui ranghi.':
    'η²_H = {s1} : taille d’effet estimée sur les rangs.',
  'ω²':
    'ω²',
  'ω² = {s1}: stima meno distorta della quota di varianza spiegata nella popolazione.':
    'ω² = {s1} : estimation moins biaisée de la part de variance expliquée dans la population.',
};
