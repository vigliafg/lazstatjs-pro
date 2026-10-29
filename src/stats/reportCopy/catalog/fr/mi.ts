/** Prose française du rapport d’imputation multiple et de ses tableaux. */
export const miCopy: Record<string, string> = {
  'Report di imputazione multipla': 'Rapport d’imputation multiple',
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} cellules imputées avec {s2} jeux de données ; FMI maximal {s3}.',
  'Molte informazioni mancanti': 'Beaucoup d’information manquante',
  'Imputazione stabile': 'Imputation stable',
  'Variabili: {s1}.': 'Variables : {s1}.',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Modèle d’imputation : régression linéaire par chaînes, {s1} itérations par jeu de données.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'Les estimations mises en commun combinent la variabilité intra- et inter-imputations : les IC tiennent compte de l’incertitude due aux données manquantes.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'Une FMI élevée indique que les données manquantes dominent l’incertitude : interprétez les estimations avec prudence.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'La fraction d’information manquante est contenue : les estimations sont relativement stables.',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'Le niveau de confiance des estimations mises en commun est de {s1} %.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Modèle linéaire mis en commun : R² moyen = {s1} sur {s2} prédicteurs.',
  'Nessun modello di regressione pooled richiesto.':
    'Aucun modèle de régression mis en commun demandé.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'L’imputation suppose des données manquantes au hasard (MAR) conditionnellement aux autres variables.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'Avec peu d’observations ou des variables très corrélées, le modèle d’imputation peut être instable.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'Les estimations mises en commun rapportées ici concernent la moyenne et l’écart-type, pas des modèles de régression complets.',
  'Dati mancanti': 'Données manquantes',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} lignes · {s2} imputations · {s3} itérations',
  Variabile: 'Variable',
  Osservati: 'Observés',
  Mancanti: 'Manquants',
  '% mancante': '% manquant',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'Les variables sélectionnées sont imputées par un modèle linéaire sur les autres variables.',
  'Stime pooled (Rubin)': 'Estimations mises en commun (Rubin)',
  'CI {s1}%': 'IC {s1} %',
  Media: 'Moyenne',
  SE: 'SE',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'SD pooled': 'SD mises en commun',
  'df Rubin': 'dl Rubin',
  FMI: 'FMI',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Mise en commun de Rubin : variance totale = variance intra + (1 + 1/m)·variance inter.',
  'Regressione pooled': 'Régression mise en commun',
  'R² medio = {s1} · {s2}% CI': 'R² moyen = {s1} · IC {s2} %',
  Termine: 'Terme',
  β: 'β',
  t: 't',
  p: 'p',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Coefficients mis en commun avec les règles de Rubin ; R² est la moyenne des imputations.',
};
