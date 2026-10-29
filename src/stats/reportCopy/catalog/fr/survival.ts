/** fr: report and table prose (normalised). */
export const survivalCopy: Record<string, string> = {
  ' Intervallo {s1} – {s2}.':
    ' Intervalle {s1} – {s2}.',
  '{s1} intervalli di uguale ampiezza':
    '{s1} intervalles de même largeur',
  'A':
    'A',
  'A rischio':
    'À risque',
  'All’ultimo tempo osservato la sopravvivenza stimata è {s1} ({s2}%).':
    'Au dernier temps observé, la survie estimée est {s1} ({s2} %).',
  'Assunzioni e cautele':
    'Hypothèses et précautions',
  'Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.':
    'Censure non informative : ceux qui sortent de l’étude ne doivent pas avoir un risque différent de ceux qui restent.',
  'Censurati':
    'Censurés',
  'CI {s1}% log-log · stima prodotto-limite':
    'IC {s1} % log-log · estimation produit-limite',
  'CI high':
    'IC haut',
  'CI low':
    'IC bas',
  'Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.':
    'Avec plus de deux groupes, l’hazard ratio n’est pas rapporté : utilisez la régression de Cox pour un HR ajusté.',
  'Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.':
    'Avec peu d’événements par groupe, le test a peu de puissance et le HR est instable.',
  'Confronto tra gruppi':
    'Comparaison entre groupes',
  'Confronto tra gruppi non richiesto':
    'Comparaison entre groupes non demandée',
  'Curva di Kaplan–Meier':
    'Courbe de Kaplan–Meier',
  'Da':
    'De',
  'df':
    'dl',
  'Eventi':
    'Événements',
  'Gruppi: {s1}. Il log-rank dà χ² = {s2} con p = {s3}: {s4}':
    'Groupes : {s1}. Le log-rank donne χ² = {s2} avec p = {s3} : {s4}',
  'Gruppo':
    'Groupe',
  'Hazard ratio':
    'Hazard ratio',
  'Hazard ratio (Mantel–Haenszel)':
    'Hazard ratio (Mantel–Haenszel)',
  'Hazard ratio = {s1} ({s2} – {s3}): {s4}':
    'Hazard ratio = {s1} ({s2} – {s3}) : {s4}',
  'HR CI high':
    'IC HR haut',
  'HR CI low':
    'IC HR bas',
  'I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.':
    'Les censurés sortent du risque sans faire descendre la courbe : c’est pourquoi une analyse de survie est nécessaire plutôt qu’une moyenne.',
  'I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).':
    'Les temps de censure coïncidant avec un événement sont traités comme des événements au même temps (aucune correction pour les ex æquo au-delà de la gestion standard du risk set).',
  'Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.':
    'L’IC de la médiane dérive des intervalles log-log de la courbe ; le RMST est l’aire sous la courbe jusqu’au dernier temps observé.',
  'Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.':
    'Le log-rank suppose des risques proportionnels : des courbes qui se croisent exigent d’autres tests.',
  'Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.':
    'Le log-rank compare le nombre d’événements observés dans chaque groupe à ceux attendus si les courbes étaient égales.',
  'Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.':
    'Le log-rank donne le même poids à tous les temps ; si le risque change au cours du temps (courbes qui se croisent), il peut ne pas voir de différences réelles.',
  'Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).':
    'Le log-rank n’ajuste pas sur des covariables : pour des hazard ratios ajustés ou plus de deux groupes, utilisez l’onglet Cox (PH).',
  'il primo gruppo ha un rischio di evento maggiore.':
    'le premier groupe a un risque d’événement plus élevé.',
  'il primo gruppo ha un rischio di evento minore.':
    'le premier groupe a un risque d’événement plus faible.',
  'Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.':
    'Le temps zéro doit être défini de façon homogène pour toutes les observations.',
  'L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.':
    'L’analyse de survie estime combien de temps passe avant un événement (guérison, panne, abandon) en tenant compte des observations censurées, c’est-à-dire de ceux qui n’ont pas encore eu l’événement à la fin de l’étude.',
  'L’hazard ratio è riportato solo per due gruppi.':
    'L’hazard ratio n’est rapporté que pour deux groupes.',
  'L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.':
    'L’hazard ratio est estimé avec l’approche Mantel–Haenszel : HR > 1 indique un risque plus élevé dans le premier groupe.',
  'La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.':
    'La courbe devient imprécise dans les queues, où peu d’observations restent à risque : regardez la colonne « à risque ».',
  'La curva e la mediana':
    'La courbe et la médiane',
  'La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).':
    'La courbe ne descend pas sous 0,50 avant le dernier temps observé : la médiane n’est pas atteinte (elle n’est pas « infinie », simplement non estimable avec ce suivi).',
  'La mediana di sopravvivenza è {s1}: a quel tempo la curva scende sotto 0,50.{s2}':
    'La médiane de survie est {s1} : à ce temps, la courbe descend sous 0,50.{s2}',
  'La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.':
    'La médiane est le temps où la courbe descend à 0,50 : si elle n’est pas atteinte, elle reste non calculable.',
  'La mediana non viene raggiunta: {s1} eventi su {s2}.':
    'La médiane n’est pas atteinte : {s1} événements sur {s2}.',
  'La sopravvivenza finale non è calcolabile.':
    'La survie finale n’est pas calculable.',
  'Le curve dei gruppi differiscono (log-rank p = {s1}).':
    'Les courbes des groupes diffèrent (p du log-rank = {s1}).',
  'le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.':
    'les courbes ne sont pas compatibles avec l’hypothèse d’égale survie.',
  'Life table (tutta la coorte)':
    'Table de survie (toute la cohorte)',
  'Log-rank test':
    'Log-rank test',
  'Mediana':
    'Médiane',
  'Mediana di sopravvivenza: {s1} ({s2} eventi su {s3}).':
    'Médiane de survie : {s1} ({s2} événements sur {s3}).',
  'N':
    'N',
  'N = {s1} · eventi = {s2} · censurati = {s3}':
    'N = {s1} · événements = {s2} · censurés = {s3}',
  'Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.':
    'Dans la table de survie, les censurés de l’intervalle contribuent pour moitié au temps à risque.',
  'Nessuna differenza tra le curve dei gruppi (log-rank p = {s1}).':
    'Aucune différence entre les courbes des groupes (p du log-rank = {s1}).',
  'non c’è evidenza che le curve differiscano.':
    'rien n’indique que les courbes diffèrent.',
  'Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.':
    'Les modèles paramétriques (Weibull, exponentiel) avec données censurées ne sont pas estimés.',
  'p':
    'p',
  'Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.':
    'Ici, il y a {s1} observations, {s2} événements et {s3} censurés : traiter les censurés comme « aucun événement » ou les exclure donnerait des estimations biaisées, alors que Kaplan–Meier les maintient à risque tant qu’ils sont observés.',
  'Report di lettura':
    'Rapport de lecture',
  'RMST':
    'RMST',
  'RMST = {s1}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.':
    'RMST = {s1} : aire moyenne sous la courbe jusqu’au dernier temps, c’est-à-dire le temps moyen passé sans événement dans l’horizon observé.',
  'RMST non calcolabile.':
    'RMST non calculable.',
  'S(t)':
    'S(t)',
  'S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.':
    'S(t) est la probabilité estimée d’être encore « en vie » (sans événement) au temps t.',
  'Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.':
    'Sélectionnez une variable de groupe pour comparer deux courbes ou plus avec le log-rank.',
  'Sintesi di sopravvivenza':
    'Synthèse de survie',
  'Tempo':
    'Temps',
  'Valore':
    'Valeur',
  'Voce':
    'Élément',
  'χ²':
    'χ²',
};
