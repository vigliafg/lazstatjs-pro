/** Prose française du rapport ANOVA à mesures répétées et de ses tableaux. */
export const repeatedAnovaCopy: Record<string, string> = {
  'Mauchly p': 'p de Mauchly',
  'ε Greenhouse': 'ε de Greenhouse',
  'Report di lettura': 'Rapport de lecture',
  'Le condizioni differiscono (F = {s1}, p = {s2}{s3}).':
    'Les conditions diffèrent (F = {s1}, p = {s2}{s3}).',
  ' corretto GG': ' corrigée GG',
  'Nessuna differenza tra le condizioni (F = {s1}, p = {s2}{s3}).':
    'Aucune différence entre les conditions (F = {s1}, p = {s2}{s3}).',
  'Sfericità violata': 'Sphéricité violée',
  'Differenza rilevata': 'Différence détectée',
  'Nessuna differenza': 'Aucune différence',
  'L’ANOVA a misure ripetute confronta k condizioni misurate sulle stesse unità, separando la variabilità tra condizioni da quella tra soggetti.':
    'L’ANOVA à mesures répétées compare k conditions mesurées sur les mêmes unités, en séparant la variabilité entre conditions de celle entre sujets.',
  'Le condizioni confrontate sono {s1}.': 'Les conditions comparées sont {s1}.',
  'La lettura dei risultati': 'La lecture des résultats',
  'F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}':
    'F({s1}, {s2}) = {s3}, p{s4} = {s5} : {s6}',
  'rifiuta l’ipotesi che le medie delle condizioni siano uguali.':
    'rejette l’hypothèse que les moyennes des conditions soient égales.',
  'non rifiuta l’ipotesi di uguali medie.':
    'ne rejette pas l’hypothèse de moyennes égales.',
  'η²p = {s1}: effetto {s2}. η²G = {s3}.':
    'η²p = {s1} : effet {s2}. η²G = {s3}.',
  'η² generalizzato': 'η² généralisé',
  'Mauchly p = {s1}: l’assunzione di sfericità è violata. Usa il p corretto Greenhouse–Geisser ({s2}, ε = {s3}) o Huynh–Feldt ({s4}).':
    'p de Mauchly = {s1} : l’hypothèse de sphéricité est violée. Utilisez la p corrigée par Greenhouse–Geisser ({s2}, ε = {s3}) ou Huynh–Feldt ({s4}).',
  'Mauchly p = {s1}: non ci sono prove di violazione; il p non corretto è utilizzabile.':
    'p de Mauchly = {s1} : aucune preuve de violation ; la p non corrigée est utilisable.',
  'Assunzioni e cautele': 'Hypothèses et précautions',
  'Le righe incomplete vengono escluse: ogni soggetto deve avere tutte le k misure.':
    'Les lignes incomplètes sont exclues : chaque sujet doit avoir les k mesures.',
  'La sfericità riguarda le differenze tra tutte le coppie di condizioni, non le varianze delle singole condizioni.':
    'La sphéricité concerne les différences entre toutes les paires de conditions, et non les variances des conditions individuelles.',
  'Con pochi soggetti Mauchly è poco potente: considera comunque le correzioni se ε è basso.':
    'Avec peu de sujets, Mauchly a peu de puissance : envisagez quand même les corrections si ε est bas.',
  'L’ANOVA within non dice quali condizioni differiscano: servono confronti post-hoc.':
    'L’ANOVA intra-sujet ne dit pas quelles conditions diffèrent : des comparaisons post-hoc sont nécessaires.',
  'Non sono inclusi disegni misti, più fattori within o covariate.':
    'Les plans mixtes, plusieurs facteurs intra-sujet ou des covariables ne sont pas inclus.',
  'Le correzioni GG/HF modificano i gradi di libertà ma non le medie: gli effetti descrittivi restano invariati.':
    'Les corrections GG/HF modifient les degrés de liberté mais pas les moyennes : les effets descriptifs restent inchangés.',
  'ANOVA a misure ripetute': 'ANOVA à mesures répétées',
  '{s1} soggetti · {s2} condizioni · CI {s3}%':
    '{s1} sujets · {s2} conditions · IC {s3} %',
  Sorgente: 'Source',
  SS: 'SS',
  df: 'dl',
  MS: 'MS',
  F: 'F',
  p: 'p',
  'η²p': 'η²p',
  'Condizioni (within)': 'Conditions (intra-sujet)',
  'Errore (Condizioni × Soggetti)': 'Erreur (Conditions × Sujets)',
  'F = MS_condizioni / MS_errore, con df = (k−1) e (n−1)(k−1).':
    'F = MS_conditions / MS_erreur, avec dl = (k−1) et (n−1)(k−1).',
  'η²p = {s1} · η²G = {s2}.': 'η²p = {s1} · η²G = {s2}.',
  'Sfericità e correzioni': 'Sphéricité et corrections',
  'sfericità non rifiutata': 'sphéricité non rejetée',
  'sfericità violata: usare la correzione':
    'sphéricité violée : utiliser la correction',
  Metrica: 'Métrique',
  Valore: 'Valeur',
  Dettaglio: 'Détail',
  'Mauchly W': 'Mauchly W',
  '1 = sfericità perfetta': '1 = sphéricité parfaite',
  'Mauchly χ²': 'Mauchly χ²',
  'df = {s1}': 'dl = {s1}',
  'nessuna violazione': 'aucune violation',
  'ε Greenhouse–Geisser': 'ε de Greenhouse–Geisser',
  'limite inferiore = 1/(k−1)': 'limite inférieure = 1/(k−1)',
  'ε Huynh–Feldt': 'ε de Huynh–Feldt',
  'più liberale di GG': 'plus libéral que GG',
  'F (df non corretti)': 'F (dl non corrigés)',
  '{s1}, {s2}': '{s1}, {s2}',
  'p non corretto': 'p non corrigée',
  'valido solo con sfericità': 'valable seulement avec sphéricité',
  'p GG': 'p GG',
  'df = {s1}, {s2}': 'dl = {s1}, {s2}',
  'p HF': 'p HF',
  'df corretti con ε HF': 'dl corrigés avec ε HF',
  'SS condizioni / SS totale': 'SS conditions / SS total',
  'Mauchly richiede normalità multivariata; con n piccolo il test ha potenza bassa.':
    'Mauchly exige la normalité multivariée ; avec un petit n, le test a une faible puissance.',
  'Se Mauchly è significativo, riportare il p corretto GG (conservativo) o HF.':
    'Si Mauchly est significatif, rapportez la p corrigée GG (conservatrice) ou HF.',
  'Descrittive per condizione': 'Descriptives par condition',
  Condizione: 'Condition',
  N: 'N',
  Media: 'Moyenne',
  SD: 'SD',
  'CI low': 'IC bas',
  'CI high': 'IC haut',
  'CI = media ± t({s1}%, df = {s2})·SE.':
    'IC = moyenne ± t({s1} %, dl = {s2})·SE.',
};
