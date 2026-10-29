/** Prose française du rapport de concordance et de ses tableaux. */
export const agreementCopy: Record<string, string> = {
  'Report di affidabilità': 'Rapport de fiabilité',
  'ICC(2,1) = {s1} su {s2} misure e {s3} soggetti.':
    'ICC(2,1) = {s1} sur {s2} mesures et {s3} sujets.',
  'Affidabilità buona': 'Fiabilité bonne',
  'Affidabilità moderata': 'Fiabilité modérée',
  'Affidabilità bassa': 'Fiabilité faible',
  'ICC(3,1) di consistenza = {s1}; F = {s2}, p = {s3}.':
    'ICC(3,1) de cohérence = {s1} ; F = {s2}, p = {s3}.',
  'ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.':
    'Un ICC proche de 1 indique que les mesures sont interchangeables ; des valeurs inférieures à 0,5 indiquent que la variabilité entre sujets ne se distingue pas de l’erreur de mesure.',
  'Il livello di confidenza richiesto è {s1}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.':
    'Le niveau de confiance demandé est de {s1} %, mais l’ICC est un indice descriptif : il n’y a pas de test de supériorité.',
  'L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.':
    'L’ICC dépend de la variabilité de l’échantillon : un échantillon étroit peut le gonfler.',
  'Report Bland–Altman': 'Rapport Bland–Altman',
  'Bias = {s1} (CI {s2}%: {s3} – {s4}).':
    'Biais = {s1} (IC {s2} % : {s3} – {s4}).',
  'Bias contenuto': 'Biais contenu',
  'Bias da valutare': 'Biais à évaluer',
  'Limiti di accordo: {s1} – {s2}.': 'Limites de concordance : {s1} – {s2}.',
  'Pendenza del bias sulla media = {s1} (p = {s2}).':
    'Pente du biais sur la moyenne = {s1} (p = {s2}).',
  'Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.':
    'Le biais est la différence moyenne systématique ; les limites de concordance décrivent dans quelle mesure les deux mesures peuvent diverger pour un même sujet.',
  'La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.':
    'La pente est significative : le biais n’est pas constant et augmente ou diminue avec le niveau de la mesure.',
  'Non c’è evidenza di un bias proporzionale al livello della misura.':
    'Il n’y a pas de preuve d’un biais proportionnel au niveau de la mesure.',
  'I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.':
    'Les limites de concordance ne sont pas des limites de confiance : ils décrivent la variabilité individuelle.',
  'Report di accordo categorico': 'Rapport de concordance catégorielle',
  'Kappa = {s1} (CI {s2}%: {s3} – {s4}).':
    'Kappa = {s1} (IC {s2} % : {s3} – {s4}).',
  'Accordo quasi perfetto': 'Concordance presque parfaite',
  'Accordo sostanziale': 'Concordance substantielle',
  'Accordo moderato': 'Concordance modérée',
  'Accordo debole': 'Concordance faible',
  'Accordo osservato = {s1}; accordo atteso per caso = {s2}.':
    'Concordance observée = {s1} ; concordance attendue par hasard = {s2}.',
  'p = {s1} contro kappa = 0.': 'p = {s1} contre kappa = 0.',
  'Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.':
    'Kappa corrige la concordance observée de celle attendue par hasard. Les seuils 0,4/0,6/0,8 sont des conventions, pas des lois.',
  'Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.':
    'Avec plus de deux juges, le kappa de Fleiss est utilisé ; les désaccords entre juges ne sont pas pondérés.',
  'Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.':
    'Avec deux juges, le kappa de Cohen est utilisé ; les désaccords peuvent être pondérés si les catégories sont ordonnées.',
  'Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.':
    'Kappa est sensible à la prévalence des catégories et à leur nombre.',
  'Intraclass correlation': 'Corrélation intraclasse',
  '{s1} soggetti × {s2} misure · CI {s3}%':
    '{s1} sujets × {s2} mesures · IC {s3} %',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  'ICC(1,1) one-way': 'ICC(1,1) à un facteur',
  'ICC(2,1) absolute agreement': 'ICC(2,1) accord absolu',
  'ICC(3,1) consistency': 'ICC(3,1) cohérence',
  F: 'F',
  p: 'p',
  'MS between subjects': 'MS entre sujets',
  'MS between raters': 'MS entre juges',
  'MS residual': 'MS résiduelle',
  'ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.':
    'ICC(2,1) est le modèle two-way random à effets mixtes avec accord absolu.',
  'ICC(3,1) ignora la differenza sistematica tra rater (consistency).':
    'ICC(3,1) ignore la différence systématique entre juges (cohérence).',
  'Bland–Altman': 'Bland–Altman',
  '{s1} coppie · CI {s2}%': '{s1} paires · IC {s2} %',
  Dettaglio: 'Détail',
  Bias: 'Biais',
  'media delle differenze': 'moyenne des différences',
  'SD differenze': 'SD des différences',
  'dispersione delle differenze': 'dispersion des différences',
  'Limite superiore': 'Limite supérieure',
  'bias + 1.96·SD': 'biais + 1.96·SD',
  'Limite inferiore': 'Limite inférieure',
  'bias − 1.96·SD': 'biais − 1.96·SD',
  'CI bias low': 'IC biais bas',
  'CI bias high': 'IC biais haut',
  'CI limite sup. low': 'IC limite sup. bas',
  'CI limite sup. high': 'IC limite sup. haut',
  'CI limite inf. low': 'IC limite inf. bas',
  'CI limite inf. high': 'IC limite inf. haut',
  'Pendenza su media': 'Pente sur la moyenne',
  'bias proporzionale': 'biais proportionnel',
  'p pendenza': 'p pente',
  'H0: pendenza = 0': 'H0 : pente = 0',
  'I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).':
    'Les limites de concordance sont estimés comme biais ± 1.96·SD ; leurs IC utilisent l’approximation sqrt(3·SD²/n).',
  'Una pendenza significativa indica che il bias cambia con la grandezza della misura.':
    'Une pente significative indique que le biais change avec la grandeur de la mesure.',
  'Cohen kappa': 'Kappa de Cohen',
  'Fleiss kappa': 'Kappa de Fleiss',
  '{s1} soggetti × {s2} rater · {s3} categorie · CI {s4}%':
    '{s1} sujets × {s2} juges · {s3} catégories · IC {s4} %',
  'Accordo osservato': 'Concordance observée',
  'Accordo atteso': 'Concordance attendue',
  Kappa: 'Kappa',
  SE: 'SE',
  z: 'z',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'Kappa non pesata: tutte le discordanze contano allo stesso modo.':
    'Kappa non pondéré : tous les désaccords comptent de la même façon.',
  'Kappa pesata {s1} sulle categorie ordinate.':
    'Kappa pondéré {s1} sur les catégories ordonnées.',
};
