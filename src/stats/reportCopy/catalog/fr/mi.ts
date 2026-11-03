/** fr: report and table prose (normalised). */
export const miCopy: Record<string, string> = {
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} cellules imputées avec {s2} jeux de données ; FMI maximal {s3}.',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} lignes · {s2} imputations · {s3} itérations',
  '% mancante':
    '% manquant',
  'CI {s1}%':
    'IC {s1} %',
  'CI high':
    'IC haut',
  'CI low':
    'IC bas',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Coefficients mis en commun avec les règles de Rubin ; R² est la moyenne des imputations.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'Avec peu d’observations ou des variables très corrélées, le modèle d’imputation peut être instable.',
  'Dati mancanti':
    'Données manquantes',
  'df Rubin':
    'dl Rubin',
  'FMI':
    'FMI',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'Le niveau de confiance des estimations mises en commun est de {s1} %.',
  'Imputazione stabile':
    'Imputation stable',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'L’imputation suppose des données manquantes au hasard (MAR) conditionnellement aux autres variables.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'La fraction d’information manquante est contenue : les estimations sont relativement stables.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'Les estimations mises en commun combinent la variabilité intra- et inter-imputations : les IC tiennent compte de l’incertitude due aux données manquantes.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'Les estimations mises en commun rapportées ici concernent la moyenne et l’écart-type, pas des modèles de régression complets.',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'Les variables sélectionnées sont imputées par un modèle linéaire sur les autres variables.',
  'Mancanti':
    'Manquants',
  'Media':
    'Moyenne',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Modèle d’imputation : régression linéaire par chaînes, {s1} itérations par jeu de données.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Modèle linéaire mis en commun : R² moyen = {s1} sur {s2} prédicteurs.',
  'Molte informazioni mancanti':
    'Beaucoup d’information manquante',
  'Nessun modello di regressione pooled richiesto.':
    'Aucun modèle de régression mis en commun demandé.',
  'Osservati':
    'Observés',
  'p':
    'p',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Mise en commun de Rubin : variance totale = variance intra + (1 + 1/m)·variance inter.',
  'R² medio = {s1} · {s2}% CI':
    'R² moyen = {s1} · IC {s2} %',
  'Regressione pooled':
    'Régression mise en commun',
  'Report di imputazione multipla':
    'Rapport d’imputation multiple',
  'SD pooled':
    'SD mises en commun',
  'SE':
    'SE',
  'Stime pooled (Rubin)':
    'Estimations mises en commun (Rubin)',
  't':
    't',
  'Termine':
    'Terme',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'Une FMI élevée indique que les données manquantes dominent l’incertitude : interprétez les estimations avec prudence.',
  'Variabile':
    'Variable',
  'Variabili: {s1}.':
    'Variables : {s1}.',
  'β':
    'β',
  'Riepilogo per variabile': 'Récapitulatif par variable',
  'Codici osservati': 'Codes observés',
  'Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.': 'Les variables catégorielles sont imputées par régression logistique (deux catégories) ou multinomiale (plus de deux) sur les autres variables et les covariables numériques.',
  'Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.': 'Les catégories sont les codes entiers observés, triés numériquement ; l’imputation ne peut pas produire de nouveaux codes.',
  'Conteggi osservati e completati per categoria': 'Effectifs observés et complétés par catégorie',
  'Dopo l’ultima delle {s1} imputazioni': 'Après la dernière des {s1} imputations',
  'Completati': 'Complétés',
  'Prop. osservata': 'Prop. observée',
  'Prop. completata': 'Prop. complétée',
  'I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.': 'Les effectifs complétés proviennent du dernier jeu de données imputé : ils comparent la distribution observée à celle reconstruite.',
  'Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.': 'Une différence systématique entre proportions observée et complétée indique que le modèle d’imputation déplace la distribution.',
  'Proporzioni pooled (Rubin)': 'Proportions pooled (Rubin)',
  'CI {s1}% · pooling sulle {s2} imputazioni': 'IC {s1} % · pooling sur {s2} imputations',
  'Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.': 'Pooling de Rubin sur les proportions : variance totale = variance within + (1 + 1/m)·variance between.',
  'Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.': 'Les proportions de chaque variable somment à 1 ; les intervalles des catégories rares peuvent être très larges.',
  'Report di imputazione multipla categorica': 'Rapport d’imputation multiple catégorielle',
  '{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.': '{s1} cellules catégorielles imputées avec {s2} jeux de données ; FMI maximal {s3}.',
  'Variabili categoriche: {s1}.': 'Variables catégorielles : {s1}.',
  'Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.': 'Modèle d’imputation : régressions logistique ou multinomiale en chaîne, {s1} itérations par jeu de données.',
  'Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.': 'Catégories observées : {s1} au total ; les proportions pooled sont combinées avec les règles de Rubin.',
  'Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.': 'Les proportions pooled sont la moyenne des proportions de catégorie sur les {s1} imputations ; les intervalles combinent la variabilité intra- et inter-imputations.',
  'Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.': 'Chaque variable ne conserve que ses catégories observées : l’imputation n’invente pas de nouveaux codes, mais redistribue les lignes manquantes entre les catégories existantes.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.': 'Une FMI élevée indique que les données manquantes dominent l’incertitude des proportions : interprétez les estimations avec prudence.',
  'La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.': 'La fraction d’information manquante est contenue : les proportions pooled sont relativement stables.',
  'Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.': 'Le modèle suppose des données manquantes au hasard (MAR) conditionnellement aux autres variables catégorielles et aux covariables numériques incluses.',
  'Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.': 'Les autres variables catégorielles entrent comme indicatrices (K−1 par variable) avec les valeurs courantes de la chaîne ; les covariables numériques entrent comme effets linéaires.',
  'Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.': 'Les lignes utilisées pour estimer chaque modèle conditionnel sont celles où la variable à imputer est observée ; les autres variables peuvent déjà avoir été imputées dans la même itération.',
  'Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.': 'Catégories avec une proportion pooled inférieure à 5 % : {s1}. Ces estimations sont les plus sensibles au modèle et au nombre d’imputations.',
  'Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.': 'Aucune catégorie pooled ne descend sous 5 % : les proportions estimées ne sont pas extrêmes.',
  'Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.': 'Avec des catégories rares, les erreurs standard peuvent être instables même lorsque le modèle converge.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.': 'L’imputation suppose des données manquantes au hasard (MAR) conditionnellement aux variables observées : si le mécanisme est MNAR, les estimations peuvent être biaisées.',
  'Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.': 'Le parcours catégoriel n’utilise pas la maximum de vraisemblance à information complète (FIML) : l’incertitude provient du pooling de Rubin sur les imputations.',
  'Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.': 'Aucun modèle hiérarchique ou multiniveau n’est disponible pour les catégories : les structures de clustering ne sont pas modélisées.',
  'Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.': 'Les catégories rares et les variables quasi séparées rendent les coefficients logistiques instables, et donc les proportions imputées aussi.',
  'Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.': 'Les estimations pooled rapportées ici concernent les proportions de catégorie, pas des modèles de régression catégorielle complets.',
};
