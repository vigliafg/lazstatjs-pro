/** fr: report and table prose (normalised). */
export const lmmCopy: Record<string, string> = {
  '{s1} ~ {s2} + (1 | {s3}) · CI {s4}%':
    '{s1} ~ {s2} + (1 | {s3}) · IC {s4} %',
  'CI {s1}% · t con df = {s2}':
    'IC {s1} % · t avec dl = {s2}',
  'CI high':
    'IC haut',
  'CI low':
    'IC bas',
  'Con meno di 5–10 gruppi la varianza tra gruppi è imprecisa.':
    'Avec moins de 5–10 groupes, la variance entre groupes est imprécise.',
  'Effetti fissi':
    'Effets fixes',
  'Gruppi':
    'Groupes',
  'ICC':
    'ICC',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi ({s3}).':
    'ICC = {s1} : {s2} % de la variabilité se situe entre les groupes ({s3}).',
  'ICC = varianza tra gruppi / varianza totale.':
    'ICC = variance entre groupes / variance totale.',
  'Metrica':
    'Métrique',
  'Modello lineare misto':
    'Modèle linéaire mixte',
  'Modello: esito ~ {s1} + (1 | {s2}), {s3} gruppi, {s4} osservazioni.':
    'Modèle : réponse ~ {s1} + (1 | {s2}), {s3} groupes, {s4} observations.',
  'N':
    'N',
  'p':
    'p',
  'p e CI usano una t con df = N − parametri; con pochi gruppi sono approssimati.':
    'p et IC utilisent une loi t avec dl = N − paramètres ; avec peu de groupes, ils sont approchés.',
  'REML logLik (a meno di costante)':
    'logVrais REML (à une constante près)',
  'Report del modello misto':
    'Rapport du modèle mixte',
  'SE':
    'SE',
  'Solo intercetta casuale: non sono stimati slope casuali.':
    'Intercept aléatoire seulement : les pentes aléatoires ne sont pas estimées.',
  'Stima':
    'Estimation',
  'Stima REML con intercetta casuale per gruppo.':
    'Estimation REML avec intercept aléatoire par groupe.',
  'Struttura di gruppo modesta':
    'Structure de groupe modérée',
  'Struttura di gruppo rilevante':
    'Structure de groupe notable',
  't':
    't',
  'Termine':
    'Terme',
  'Valore':
    'Valeur',
  'Varianza dell’intercetta = {s1}; varianza residua = {s2}.':
    'Variance de l’intercept = {s1} ; variance résiduelle = {s2}.',
  'Varianza intercetta':
    'Variance de l’intercept',
  'Varianza residua':
    'Variance résiduelle',
  'Componenti di varianza': 'Composantes de variance',
  'Intercetta casuale': 'Ordonnée aléatoire',
  'Profilo di verosimiglianza · CI {s1}%': 'Profil de vraisemblance · IC {s1}%',
  'Gli intervalli sono di profilo: non assumono una forma simmetrica e possono avvicinarsi allo zero.': 'Les intervalles proviennent du profil de vraisemblance : ils ne sont pas symétriques et peuvent approcher zéro.',
  'Le componenti di varianza portano SE e IC di profilo: l’intervallo dell’intercetta casuale dice quanto la stima dipenda da pochi gruppi.': 'Les composantes de variance portent une erreur type et un IC de profil : l’intervalle de l’ordonnée aléatoire indique à quel point l’estimation dépend de peu de groupes.',
  'Test degli effetti fissi': 'Tests des effets fixes',
  'F': 'F',
  'df1': 'ddl1',
  'df2': 'ddl2',
  'Con predittori a una colonna F è il quadrato del t: il p-value coincide con quello della tabella dei coefficienti.': 'Avec des prédicteurs à une colonne, F est le carré de t : la p-valeur est celle du tableau des coefficients.',
  'Il test degli effetti fissi riporta il Wald per termine: con predittori a una colonna F è il quadrato del t della tabella dei coefficienti.': 'Les tests des effets fixes donnent le Wald par terme : avec des prédicteurs à une colonne, F est le carré du t du tableau des coefficients.',
  'Wald per termine · CI {s1}%': 'Wald par terme · IC {s1}%',
  'Wald per termine · df {s1} · {s2}': 'Wald par terme · ddl {s1} · {s2}',
  'Stima e CI {s1}%': 'Estimation et IC {s1}%',
};
