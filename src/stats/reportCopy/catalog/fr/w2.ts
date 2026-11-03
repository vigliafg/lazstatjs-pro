/** French: W2 report and table prose. */
export const w2Copy: Record<string, string> = {
  'Sì': 'Oui',
  'Nessun gruppo cade fuori dalle linee di decisione: le medie sono compatibili con la media generale.':
    'Aucun groupe ne sort des lignes de décision : les moyennes sont compatibles avec la moyenne générale.',
  '{s1} gruppo/i cadono fuori dalle linee di decisione: {s2}.':
    '{s1} groupe(s) sortent des lignes de décision : {s2}.',
  'Report di lettura — ANOM': 'Rapport de lecture — ANOM',
  'L’ANOM (analisi delle medie) confronta ogni media di gruppo con la media generale, usando linee di decisione che tengono conto del numero di gruppi e della variabilità entro gruppo.':
    'L’ANOM (analyse des moyennes) compare chaque moyenne de groupe à la moyenne générale, à l’aide de lignes de décision qui tiennent compte du nombre de groupes et de la variabilité intra-groupe.',
  'È la versione grafica e intuitiva dell’ANOVA: invece di un solo test globale mostra quali gruppi si allontanano.':
    'C’est la version graphique et intuitive de l’ANOVA : au lieu d’un seul test global, elle montre quels groupes s’écartent.',
  'Le linee sono costruite al livello α = {s1}%; un gruppo fuori dagli intervalli merita un controllo, non una conclusione automatica.':
    'Les lignes sont construites au niveau α = {s1} % ; un groupe hors des intervalles mérite une vérification, pas une conclusion automatique.',
  'Con gruppi sbilanciati ogni gruppo ha limiti propri, perché la sua media ha una precisione diversa.':
    'Avec des groupes déséquilibrés, chaque groupe a ses propres limites, car sa moyenne a une précision différente.',
  'Cautele': 'Précautions',
  'Il valore critico usa l’approssimazione Bonferroni-t: è leggermente conservativo rispetto alla distribuzione esatta del massimo modulo studentizzato.':
    'La valeur critique utilise l’approximation de Bonferroni-t : elle est légèrement conservatrice par rapport à la distribution exacte du module studentisé maximal.',
  'L’ANOM non sostituisce l’ANOVA: serve a localizzare le differenze, non a stimarne l’entità.':
    'L’ANOM ne remplace pas l’ANOVA : elle sert à localiser les différences, non à en estimer l’ampleur.',
  'Con molti gruppi e pochi dati per gruppo la potenza resta bassa.':
    'Avec beaucoup de groupes et peu de données par groupe, la puissance reste faible.',
  'Il test presuppone osservazioni indipendenti e variabilità confrontabile tra i gruppi.':
    'Le test suppose des observations indépendantes et une variabilité comparable entre les groupes.',
  'Report di lettura — Modello lineare generalizzato':
    'Rapport de lecture — Modèle linéaire généralisé',
  '{s1} spiegato da {s2} predittore/i con famiglia {s3} e link {s4}; devianza = {s5}.':
    '{s1} expliqué par {s2} prédicteur(s) avec famille {s3} et lien {s4} ; déviance = {s5}.',
  'Il modello non ha raggiunto la convergenza: le stime non sono affidabili.':
    'Le modèle n’a pas atteint la convergence : les estimations ne sont pas fiables.',
  'Regressione': 'Régression',
  'Il GLM estende la regressione lineare a risposte non normali: la famiglia definisce la varianza, il link collega la media ai predittori.':
    'Le GLM étend la régression linéaire aux réponses non normales : la famille définit la variance, le lien relie la moyenne aux prédicteurs.',
  'La scelta di famiglia e link è parte del modello: non è un dettaglio tecnico, cambia il significato dei coefficienti.':
    'Le choix de la famille et du lien fait partie du modèle : ce n’est pas un détail technique, cela change le sens des coefficients.',
  'Devianza = {s1} su {s2} gradi di libertà; devianza nulla = {s3}.':
    'Déviance = {s1} pour {s2} degrés de liberté ; déviance nulle = {s3}.',
  'Log-verosimiglianza = {s1}; AIC = {s2}; iterazioni = {s3}.':
    'Log-vraisemblance = {s1} ; AIC = {s2} ; itérations = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello scelto.':
    '{s1} prédicteur(s) sur {s2} sont significatifs au niveau choisi.',
  '{s1}: B = {s2} (CI {s3} – {s4}), p = {s5}.': '{s1} : B = {s2} (IC {s3} – {s4}), p = {s5}.',
  'Come leggerlo': 'Comment le lire',
  'Con link log i coefficienti sono differenze di log-media: exp(B) è un rapporto di medie, non di probabilità.':
    'Avec un lien log, les coefficients sont des différences de log-moyenne : exp(B) est un rapport de moyennes, non de probabilités.',
  'Con link logit/probit la risposta è una probabilità: B va letto sulla scala latente.':
    'Avec un lien logit/probit, la réponse est une probabilité : B se lit sur l’échelle latente.',
  'Con famiglia Gamma la risposta deve essere strettamente positiva; con Poisson deve essere un conteggio.':
    'Avec la famille Gamma, la réponse doit être strictement positive ; avec Poisson, ce doit être un décompte.',
  'Controlla la devianza residua e i residui: un modello può convergere e restare mal specificato.':
    'Contrôlez la déviance résiduelle et les résidus : un modèle peut converger et rester mal spécifié.',
  'Il motore copre le famiglie gaussiana, binomiale, Poisson e Gamma; Tweedie e quasi-verosimiglianze non sono incluse.':
    'Le moteur couvre les familles gaussienne, binomiale, Poisson et Gamma ; Tweedie et les quasi-vraisemblances ne sont pas incluses.',
  'La bontà del modello non è riassunta da un R²: confronta devianza, AIC e diagnostica dei residui.':
    'La qualité du modèle ne se résume pas à un R² : comparez la déviance, l’AIC et le diagnostic des résidus.',
  'La regressione probit modella la probabilità di un esito binario (sì/no) tramite la funzione di ripartizione normale standard, invece del logit usato dalla regressione logistica.':
    'La régression probit modélise la probabilité d’un résultat binaire (oui/non) via la fonction de répartition normale standard, au lieu du logit utilisé par la régression logistique.',
  'Come leggere i coefficienti probit': 'Comment lire les coefficients probit',
  'B misura lo spostamento del predittore latente normale: exp(B) non è un odds ratio e non va letto come tale.':
    'B mesure le déplacement du prédicteur latent normal : exp(B) n’est pas un odds ratio et ne doit pas être lu comme tel.',
  'I coefficienti sono stimati al netto degli altri predittori e con un CI al {s1}%: un intervallo che contiene 0 corrisponde a un effetto non significativo.':
    'Les coefficients sont estimés en tenant compte des autres prédicteurs et avec un IC à {s1} % : un intervalle contenant 0 correspond à un effet non significatif.',
  '{s1}: {s2}% di classificazioni corrette ({s3} su {s4}).':
    '{s1} : {s2} % de classifications correctes ({s3} sur {s4}).',
  'Report di regressione multinomiale': 'Rapport de régression multinomiale',
  'Il modello distingue {s1} classi con un’accuratezza del {s2}%; la classe di riferimento è “{s3}”.':
    'Le modèle distingue {s1} classes avec une exactitude de {s2} % ; la classe de référence est « {s3} ».',
  'La regressione logistica multinomiale modella la probabilità di appartenenza a ciascuna di più classi nominali (non ordinate) a partire da uno o più predittori.':
    'La régression logistique multinomiale modélise la probabilité d’appartenance à chacune de plusieurs classes nominales (non ordonnées) à partir d’un ou plusieurs prédicteurs.',
  'Ogni classe è confrontata con la classe di riferimento “{s1}”: i coefficienti descrivono quanto il logit di quella classe cambia rispetto al riferimento per un’unità in più del predittore.':
    'Chaque classe est comparée à la classe de référence « {s1} » : les coefficients décrivent de combien le logit de cette classe change par rapport à la référence pour une unité supplémentaire du prédicteur.',
  'Sono state analizzate {s1} osservazioni complete su {s2} classi e {s3} predittore/i.':
    '{s1} observations complètes ont été analysées sur {s2} classes et {s3} prédicteur(s).',
  'Il modello classifica correttamente il {s1}% delle osservazioni; la classe con l’accuratezza più alta è {s2}.':
    'Le modèle classe correctement {s1} % des observations ; la classe dont l’exactitude est la plus élevée est {s2}.',
  '{s1} ({s2}%)': '{s1} ({s2} %)',
  'non disponibile': 'non disponible',
  '{s1} predittore/i mostrano almeno un coefficiente significativo al livello scelto ({s2}).':
    '{s1} prédicteur(s) présentent au moins un coefficient significatif au niveau choisi ({s2}).',
  'Nessun coefficiente raggiunge la significatività al livello scelto.':
    'Aucun coefficient n’atteint la significativité au niveau choisi.',
  'Convergenza del modello: {s1}.': 'Convergence du modèle : {s1}.',
  'Accuratezza per classe': 'Exactitude par classe',
  'La tabella di classificazione non è disponibile.':
    'La table de classification n’est pas disponible.',
  'Come leggere i coefficienti': 'Comment lire les coefficients',
  'Un odds ratio maggiore di 1 indica che un’unità in più del predittore aumenta le probabilità della classe rispetto al riferimento; un valore minore di 1 le riduce.':
    'Un odds ratio supérieur à 1 indique qu’une unité supplémentaire du prédicteur augmente les probabilités de la classe par rapport à la référence ; une valeur inférieure à 1 les réduit.',
  'Gli odds ratio sono stimati al netto degli altri predittori e con un intervallo di confidenza al {s1}%: se l’intervallo contiene 1 l’effetto non è distinguibile da zero.':
    'Les odds ratio sont estimés en tenant compte des autres prédicteurs et avec un intervalle de confiance à {s1} % : si l’intervalle contient 1, l’effet n’est pas distinguable de zéro.',
  'I test sui coefficienti sono di Wald (z = B/SE): con campioni piccoli o classi rare possono essere meno affidabili di un confronto basato sulla verosimiglianza.':
    'Les tests sur les coefficients sont de Wald (z = B/SE) : avec de petits échantillons ou des classes rares, ils peuvent être moins fiables qu’une comparaison fondée sur la vraisemblance.',
  'Le osservazioni devono essere indipendenti tra loro (una riga = una unità).':
    'Les observations doivent être indépendantes entre elles (une ligne = une unité).',
  'Le classi dell’esito sono nominali: l’ordine alfabetico o numerico non implica una graduatoria.':
    'Les classes de la réponse sont nominales : l’ordre alphabétique ou numérique n’implique pas de classement.',
  'La relazione tra ogni predittore e il logit delle classi è lineare: controlla la forma o usa trasformazioni.':
    'La relation entre chaque prédicteur et le logit des classes est linéaire : vérifiez la forme ou utilisez des transformations.',
  'Servono osservazioni sufficienti per ogni classe: classi rare o vuote rendono le stime instabili.':
    'Il faut suffisamment d’observations pour chaque classe : des classes rares ou vides rendent les estimations instables.',
  'La separazione perfetta (classi predette senza errori) gonfia i coefficienti e invalida i test.':
    'La séparation parfaite (classes prédites sans erreur) gonfle les coefficients et invalide les tests.',
  'Non sono inclusi effetti casuali, interazioni tra predittori o regressione penalizzata.':
    'Les effets aléatoires, les interactions entre prédicteurs et la régression pénalisée ne sont pas inclus.',
  'L’accuratezza dipende dalla distribuzione delle classi: confrontala sempre con la frequenza della classe più comune.':
    'L’exactitude dépend de la distribution des classes : comparez-la toujours à la fréquence de la classe la plus fréquente.',
  'Il modello non gestisce esiti ordinati: per categorie ordinate serve una regressione ordinale.':
    'Le modèle ne gère pas les réponses ordonnées : pour des catégories ordonnées, il faut une régression ordinale.',
  'Report di lettura — ANOVA gerarchica': 'Rapport de lecture — ANOVA hiérarchique',
  '{s1} dentro {s2}: effetto esterno {s3}, effetto interno {s4}.':
    '{s1} dans {s2} : effet externe {s3}, effet interne {s4}.',
  'L’ANOVA gerarchica tratta un fattore annidato dentro un altro: ogni livello del fattore interno appartiene a un solo livello del fattore esterno.':
    'L’ANOVA hiérarchique traite d’un facteur emboîté dans un autre : chaque niveau du facteur interne appartient à un seul niveau du facteur externe.',
  'È il disegno tipico di classi dentro scuole, soggetti dentro centri o lotti dentro fornitori.':
    'C’est le plan typique de classes dans des écoles, de sujets dans des centres ou de lots chez des fournisseurs.',
  'Fattore esterno {s1}: F = {s2}, p = {s3}.': 'Facteur externe {s1} : F = {s2}, p = {s3}.',
  'Fattore interno {s1}: F = {s2}, p = {s3}.': 'Facteur interne {s1} : F = {s2}, p = {s3}.',
  'Se il fattore esterno è significativo, i gruppi maggiori differiscono tra loro oltre la variabilità delle sottoclassi.':
    'Si le facteur externe est significatif, les groupes principaux diffèrent entre eux au-delà de la variabilité des sous-classes.',
  'Se il fattore interno è significativo, le sottoclassi differiscono dentro i gruppi: la struttura annidata spiega una parte della variabilità.':
    'Si le facteur interne est significatif, les sous-classes diffèrent au sein des groupes : la structure emboîtée explique une partie de la variabilité.',
  'Non interpretare il fattore interno come un effetto principale “pulito”: il suo significato dipende dal fattore esterno.':
    'N’interprétez pas le facteur interne comme un effet principal « net » : son sens dépend du facteur externe.',
  'Il modello assume normalità e varianza costante entro cella; con celle molto sbilanciate le stime dei componenti di varianza sono approssimate.':
    'Le modèle suppose la normalité et une variance constante dans chaque cellule ; avec des cellules très déséquilibrées, les estimations des composantes de variance sont approximatives.',
  '{s1}: {s2} (CI {s3} – {s4}), {s5}.': '{s1} : {s2} (IC {s3} – {s4}), {s5}.',
  'Report di lettura — Regressione non lineare': 'Rapport de lecture — Régression non linéaire',
  'La curva {s1} aderisce bene ai dati: spiega il {s2}% della variabilità di {s3}.':
    'La courbe {s1} s’ajuste bien aux données : elle explique {s2} % de la variabilité de {s3}.',
  'La curva {s1} spiega il {s2}% della variabilità di {s3}: l’adattamento è parziale.':
    'La courbe {s1} explique {s2} % de la variabilité de {s3} : l’ajustement est partiel.',
  'La curva {s1} spiega solo il {s2}% della variabilità di {s3}: la forma scelta non descrive bene i dati.':
    'La courbe {s1} n’explique que {s2} % de la variabilité de {s3} : la forme choisie ne décrit pas bien les données.',
  'R² {s1}': 'R² {s1}',
  'La regressione non lineare stima i parametri di una curva scelta a priori, invece di una retta: la forma del modello è un’ipotesi, non un risultato dei dati.':
    'La régression non linéaire estime les paramètres d’une courbe choisie a priori, plutôt que d’une droite : la forme du modèle est une hypothèse, pas un résultat des données.',
  'Il confronto tra curve diverse non si fa con l’R²: modelli con un numero diverso di parametri vanno confrontati con criteri che penalizzano la complessità.':
    'La comparaison entre courbes différentes ne se fait pas avec le R² : des modèles ayant un nombre différent de paramètres doivent être comparés avec des critères qui pénalisent la complexité.',
  'La curva e i suoi parametri': 'La courbe et ses paramètres',
  'Modello {s1} stimato su {s2} osservazioni, con {s3} gradi di libertà residui; la convergenza è stata raggiunta in {s4} iterazioni.':
    'Modèle {s1} estimé sur {s2} observations, avec {s3} degrés de liberté résiduels ; la convergence a été atteinte en {s4} itérations.',
  'R² = {s1}, R² corretto = {s2}, RMSE = {s3} (nella unità di {s4}).':
    'R² = {s1}, R² corrigé = {s2}, RMSE = {s3} (dans l’unité de {s4}).',
  'Parametri stimati': 'Paramètres estimés',
  'La convergenza dice che l’algoritmo ha trovato un punto stabile, non che il modello sia quello giusto: controlla sempre i residui e la forma della curva.':
    'La convergence indique que l’algorithme a trouvé un point stable, pas que le modèle soit le bon : contrôlez toujours les résidus et la forme de la courbe.',
  'L’algoritmo non ha raggiunto la convergenza: le stime non sono affidabili e non vanno lette come risultato.':
    'L’algorithme n’a pas atteint la convergence : les estimations ne sont pas fiables et ne doivent pas être lues comme un résultat.',
  '{s1} parametri su {s2} hanno un p sotto il {s3}%: un parametro non significativo può comunque essere necessario alla forma della curva.':
    '{s1} paramètres sur {s2} ont un p inférieur à {s3} % : un paramètre non significatif peut néanmoins être nécessaire à la forme de la courbe.',
  'La curva interpolata tra i punti osservati è una sintesi del modello: fuori dall’intervallo dei dati la sua forma non è verificata.':
    'La courbe interpolée entre les points observés est une synthèse du modèle : hors de l’intervalle des données, sa forme n’est pas vérifiée.',
  'La scelta della curva deve venire dalla conoscenza del fenomeno, non dal solo confronto degli R².':
    'Le choix de la courbe doit découler de la connaissance du phénomène, pas seulement de la comparaison des R².',
  'Le stime ai minimi quadrati sono sensibili ai valori estremi e ai punti con leva alta.':
    'Les estimations aux moindres carrés sont sensibles aux valeurs extrêmes et aux points à fort levier.',
  'Gli errori standard assumono residui indipendenti e a varianza costante: con dati nel tempo o misure ripetute vanno rivisti.':
    'Les erreurs standard supposent des résidus indépendants et à variance constante : avec des données temporelles ou des mesures répétées, elles doivent être revues.',
  'Con pochi punti rispetto ai parametri la stima è instabile: servono più osservazioni che parametri.':
    'Avec peu de points par rapport aux paramètres, l’estimation est instable : il faut plus d’observations que de paramètres.',
  'Report di lettura — Regressione penalizzata': 'Rapport de lecture — Régression pénalisée',
  '{s1}: {s2} coefficienti non nulli su {s3} (λ = {s4}, α = {s5}).':
    '{s1} : {s2} coefficients non nuls sur {s3} (λ = {s4}, α = {s5}).',
  'Ridge, LASSO ed elastic net aggiungono una penalità ai coefficienti per ridurre la varianza delle stime e gestire la collinearità.':
    'Ridge, LASSO et elastic net ajoutent une pénalité aux coefficients pour réduire la variance des estimations et gérer la colinéarité.',
  'LASSO può azzerare coefficienti, producendo un modello sparso; ridge li riduce senza azzerarli; elastic net combina i due comportamenti.':
    'LASSO peut annuler des coefficients et produire un modèle parcimonieux ; ridge les réduit sans les annuler ; elastic net combine les deux comportements.',
  'Variabili mantenute: {s1}.': 'Variables retenues : {s1}.',
  'nessuna': 'aucune',
  'R² = {s1}; coefficienti non nulli = {s2}; iterazioni = {s3}.':
    'R² = {s1} ; coefficients non nuls = {s2} ; itérations = {s3}.',
  'Convergenza: {s1}.': 'Convergence : {s1}.',
  'Come scegliere λ': 'Comment choisir λ',
  'λ non va scelto guardando l’R² sul campione: serve validazione incrociata o un criterio esterno.':
    'λ ne doit pas être choisi en regardant le R² sur l’échantillon : il faut une validation croisée ou un critère externe.',
  'Valori grandi semplificano il modello ma possono escludere segnali reali; valori piccoli si avvicinano all’OLS e alla sua instabilità.':
    'Des valeurs grandes simplifient le modèle mais peuvent exclure des signaux réels ; des valeurs petites s’approchent de l’OLS et de son instabilité.',
  'Le variabili sono standardizzate internamente: i coefficienti restano confrontabili tra loro solo dopo questa trasformazione.':
    'Les variables sont standardisées en interne : les coefficients ne restent comparables entre eux qu’après cette transformation.',
  'Il livello di confidenza {s1}% è indicato per coerenza con le altre procedure, ma gli intervalli dei coefficienti penalizzati non sono interpretabili come quelli OLS.':
    'Le niveau de confiance {s1} % est indiqué par cohérence avec les autres procédures, mais les intervalles des coefficients pénalisés ne s’interprètent pas comme ceux de l’OLS.',
  'La penalizzazione introduce distorsione: i coefficienti non sono stimatori non distorti e gli errori standard classici non si applicano.':
    'La pénalisation introduit un biais : les coefficients ne sont pas des estimateurs sans biais et les erreurs standard classiques ne s’appliquent pas.',
  'La selezione di λ e la stima della varianza richiedono ricampionamento, non incluso in questa procedura.':
    'La sélection de λ et l’estimation de la variance nécessitent un rééchantillonnage, non inclus dans cette procédure.',
  'Report di lettura — Regressione polinomiale': 'Rapport de lecture — Régression polynomiale',
  '{s1} spiegato da un polinomio di grado {s2} in {s3} (R² = {s4}).':
    '{s1} expliqué par un polynôme de degré {s2} en {s3} (R² = {s4}).',
  'La regressione polinomiale estende la retta a una curva: aggiunge potenze di {s1} per catturare andamenti non lineari.':
    'La régression polynomiale étend la droite à une courbe : elle ajoute des puissances de {s1} pour capter des tendances non linéaires.',
  'Il grado misura la flessibilità della curva; un grado alto riduce i residui ma aumenta il rischio di overfitting.':
    'Le degré mesure la souplesse de la courbe ; un degré élevé réduit les résidus mais augmente le risque de surajustement.',
  'R² = {s1}, R² adattato = {s2}, F = {s3}, p = {s4}.':
    'R² = {s1}, R² ajusté = {s2}, F = {s3}, p = {s4}.',
  'Il termine di grado più alto è {s1}: B = {s2}, p = {s3}.':
    'Le terme de degré le plus élevé est {s1} : B = {s2}, p = {s3}.',
  'RMSE = {s1}; AIC = {s2}; BIC = {s3}.': 'RMSE = {s1} ; AIC = {s2} ; BIC = {s3}.',
  'Come scegliere il grado': 'Comment choisir le degré',
  'Confronta R² adattato, AIC e BIC tra gradi diversi: il grado più alto non è automaticamente migliore.':
    'Comparez le R² ajusté, l’AIC et le BIC entre différents degrés : le degré le plus élevé n’est pas automatiquement le meilleur.',
  'Guarda il grafico: una curva che insegue ogni punto è un segnale di overfitting.':
    'Regardez le graphique : une courbe qui poursuit chaque point est un signe de surajustement.',
  'Non estrapolare fuori dall’intervallo osservato di {s1}: i polinomi divergono rapidamente.':
    'N’extrapolez pas hors de l’intervalle observé de {s1} : les polynômes divergent rapidement.',
  'La collinearità tra potenze rende i singoli coefficienti instabili anche quando la curva è ben stimata: interpreta la forma, non solo i segni.':
    'La colinéarité entre puissances rend les coefficients individuels instables même lorsque la courbe est bien estimée : interprétez la forme, pas seulement les signes.',
  'Quantile (τ)': 'Quantile (τ)',
  'sì': 'oui',
  'Funzione obiettivo': 'Fonction objectif',
  '{s1}: β = {s2} (CI 95% {s3}), {s4}.': '{s1} : β = {s2} (IC 95 % {s3}), {s4}.',
  'Report di lettura — Regressione quantilica': 'Rapport de lecture — Régression quantile',
  'Il simplesso non ha raggiunto la convergenza: le stime non sono affidabili.':
    'Le simplexe n’a pas atteint la convergence : les estimations ne sont pas fiables.',
  'Al quantile τ = {s1}, nessun coefficiente di predittore è significativo (p < {s2}).':
    'Au quantile τ = {s1}, aucun coefficient de prédicteur n’est significatif (p < {s2}).',
  'Al quantile τ = {s1}, 1 coefficiente di predittore su {s2} è significativo (p < {s3}).':
    'Au quantile τ = {s1}, 1 coefficient de prédicteur sur {s2} est significatif (p < {s3}).',
  'Al quantile τ = {s1}, {s2} coefficienti di predittore su {s3} sono significativi (p < {s4}).':
    'Au quantile τ = {s1}, {s2} coefficients de prédicteur sur {s3} sont significatifs (p < {s4}).',
  'Non convergente': 'Non convergé',
  'La regressione quantilica stima come cambia un quantile condizionale di Y, non la media: al posto della somma dei quadrati minimizza una perdita assoluta asimmetrica.':
    'La régression quantile estime comment change un quantile conditionnel de Y, et non la moyenne : au lieu de la somme des carrés, elle minimise une perte absolue asymétrique.',
  'Con τ = 0,5 è una regressione mediana, robusta agli outlier; con τ vicino a 0 o 1 descrive la coda bassa o alta della distribuzione.':
    'Avec τ = 0,5, c’est une régression médiane, robuste aux valeurs aberrantes ; avec τ proche de 0 ou 1, elle décrit la queue basse ou haute de la distribution.',
  'Il modello usa {s1} osservazioni complete e {s2} parametri (intercetta inclusa), con {s3} iterazioni del simplesso.':
    'Le modèle utilise {s1} observations complètes et {s2} paramètres (constante incluse), avec {s3} itérations du simplexe.',
  'Il simplesso ha raggiunto la convergenza e la perdita minima vale {s1}.':
    'Le simplexe a atteint la convergence et la perte minimale vaut {s1}.',
  'La convergenza non è stata raggiunta: aumenta il budget di iterazioni o riduci i predittori prima di leggere i coefficienti.':
    'La convergence n’a pas été atteinte : augmentez le budget d’itérations ou réduisez les prédicteurs avant de lire les coefficients.',
  'β misura di quanto cambia il quantile τ di Y per una unità in più del predittore, mantenendo gli altri costanti.':
    'β mesure de combien change le quantile τ de Y pour une unité supplémentaire du prédicteur, les autres restant constants.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero: spesso non ha un’interpretazione sostantiva.':
    'La constante est le quantile τ estimé lorsque tous les prédicteurs valent zéro : elle n’a souvent pas d’interprétation substantielle.',
  'Un intervallo che contiene zero è compatibile con nessun effetto al livello scelto; il p è di Wald e usa errori standard approssimati.':
    'Un intervalle contenant zéro est compatible avec l’absence d’effet au niveau choisi ; le p est de Wald et utilise des erreurs standard approximées.',
  'Con più predittori il grafico a punti mostra il profilo del primo predittore alle medie degli altri, non una superficie completa.':
    'Avec plusieurs prédicteurs, le graphique en points montre le profil du premier prédicteur aux moyennes des autres, pas une surface complète.',
  'Perché scegliere un quantile': 'Pourquoi choisir un quantile',
  'La media è sensibile agli outlier e alle code pesanti; la mediana e gli altri quantili descrivono il centro o gli estremi della distribuzione condizionata.':
    'La moyenne est sensible aux valeurs aberrantes et aux queues épaisses ; la médiane et les autres quantiles décrivent le centre ou les extrémités de la distribution conditionnelle.',
  'Confrontare quantili diversi dello stesso modello mostra se l’effetto di un predittore cambia lungo la distribuzione, cosa che la regressione lineare non evidenzia.':
    'Comparer différents quantiles du même modèle montre si l’effet d’un prédicteur change le long de la distribution, ce que la régression linéaire ne met pas en évidence.',
  'Il prezzo è che ogni quantile va stimato separatamente: le rette di quantili vicini possono incrociarsi e non c’è una verosimiglianza unica da confrontare con un test LR.':
    'Le prix à payer est que chaque quantile doit être estimé séparément : les droites de quantiles voisins peuvent se croiser et il n’y a pas de vraisemblance unique à comparer avec un test LR.',
  'Il modello è lineare nei parametri per il quantile scelto: se la relazione cambia forma nelle code, servono trasformazioni o termini aggiunti.':
    'Le modèle est linéaire en les paramètres pour le quantile choisi : si la relation change de forme dans les queues, il faut des transformations ou des termes supplémentaires.',
  'Servono osservazioni sufficienti vicino a τ: con code estreme e campioni piccoli le stime diventano instabili.':
    'Il faut suffisamment d’observations près de τ : avec des queues extrêmes et de petits échantillons, les estimations deviennent instables.',
  'Gli errori standard usano l’approssimazione di Powell/Hall–Sheather (quantreg, se = "nid") e possono essere inaffidabili con pochi casi o residui degeneri.':
    'Les erreurs standard utilisent l’approximation de Powell/Hall–Sheather (quantreg, se = « nid ») et peuvent être peu fiables avec peu de cas ou des résidus dégénérés.',
  'La convergenza del simplesso va controllata: un numero di iterazioni al limite indica un problema numerico, non un risultato.':
    'Il faut contrôler la convergence du simplexe : un nombre d’itérations à la limite indique un problème numérique, pas un résultat.',
  'Non sono inclusi intervalli bootstrap, test tra quantili o correzione per code estreme.':
    'Les intervalles bootstrap, les tests entre quantiles et la correction pour queues extrêmes ne sont pas inclus.',
  'Il modello è lineare nei parametri: relazioni non lineari richiedono trasformazioni o termini aggiunti.':
    'Le modèle est linéaire en les paramètres : les relations non linéaires nécessitent des transformations ou des termes supplémentaires.',
  'La bontà di adattamento non è riassunta da un R²: valuta la perdita asimmetrica e il confronto tra quantili.':
    'La qualité de l’ajustement ne se résume pas à un R² : évaluez la perte asymétrique et la comparaison entre quantiles.',
  'Report di lettura — Selezione delle variabili': 'Rapport de lecture — Sélection des variables',
  'Il modello scelto contiene {s1} predittore/i: {s2}.':
    'Le modèle choisi contient {s1} prédicteur(s) : {s2}.',
  'Nessun predittore supera il criterio: resta il modello con la sola intercetta.':
    'Aucun prédicteur ne dépasse le critère : il reste le modèle avec la constante seule.',
  'La selezione delle variabili cerca un modello più semplice senza perdere capacità esplicativa, confrontando sottoinsiemi di predittori.':
    'La sélection de variables cherche un modèle plus simple sans perdre de capacité explicative, en comparant des sous-ensembles de prédicteurs.',
  'La ricerca esaustiva guarda tutti i sottoinsiemi; lo stepwise aggiunge o toglie una variabile alla volta seguendo il criterio scelto.':
    'La recherche exhaustive examine tous les sous-ensembles ; la méthode stepwise ajoute ou retire une variable à la fois selon le critère choisi.',
  'Il modello con il BIC più basso usa {s1} variabili: {s2}.':
    'Le modèle au BIC le plus bas utilise {s1} variables : {s2}.',
  'Lo stepwise ha esaminato {s1} passi e si è fermato con {s2} predittore/i.':
    'La méthode stepwise a examiné {s1} étapes et s’est arrêtée avec {s2} prédicteur(s).',
  'Modello finale: R² = {s1}, R² adattato = {s2}, F = {s3}.':
    'Modèle final : R² = {s1}, R² ajusté = {s2}, F = {s3}.',
  'Il modello finale non contiene predittori significativi.':
    'Le modèle final ne contient aucun prédicteur significatif.',
  'La selezione automatica tende a sovrastimare la significatività: i p-value dopo la scelta non sono aggiustati.':
    'La sélection automatique tend à surestimer la significativité : les p-values après la sélection ne sont pas ajustées.',
  'Con molti predittori la ricerca esaustiva è limitata: il numero di sottoinsiemi cresce in modo esponenziale.':
    'Avec beaucoup de prédicteurs, la recherche exhaustive est limitée : le nombre de sous-ensembles croît de façon exponentielle.',
  'Usa la selezione per esplorare, poi conferma il modello su dati indipendenti o con validazione incrociata.':
    'Utilisez la sélection pour explorer, puis confirmez le modèle sur des données indépendantes ou par validation croisée.',
  'Il criterio BIC penalizza di più l’AIC: produce modelli più parsimoniosi.':
    'Le critère BIC pénalise davantage que l’AIC : il produit des modèles plus parcimonieux.',
  'I risultati dipendono dal criterio e dalla direzione scelti; riporta sempre entrambi insieme al livello di confidenza del {s1}%.':
    'Les résultats dépendent du critère et de la direction choisis ; indiquez toujours les deux avec le niveau de confiance de {s1} %.',
  'Analisi delle medie (ANOM)': 'Analyse des moyennes (ANOM)',
  '{s1} per {s2} · α = {s3}': '{s1} pour {s2} · α = {s3}',
  'Fuori limiti': 'Hors limites',
  'No': 'Non',
  'Media generale = {s1}; media quadratica entro gruppi = {s2} con {s3} gradi di libertà.':
    'Moyenne générale = {s1} ; carré moyen intra-groupe = {s2} avec {s3} degrés de liberté.',
  'Il valore critico h = {s1} usa l’approssimazione Bonferroni-t della distribuzione del massimo modulo studentizzato.':
    'La valeur critique h = {s1} utilise l’approximation de Bonferroni-t de la distribution du module studentisé maximal.',
  '{s1} · famiglia {s2} · link {s3} · CI {s4}%': '{s1} · famille {s2} · lien {s3} · IC {s4} %',
  'I coefficienti sono sulla scala del link: la loro interpretazione cambia con famiglia e link.':
    'Les coefficients sont sur l’échelle du lien : leur interprétation change avec la famille et le lien.',
  'Il test z è di Wald; con campioni piccoli può divergere dal test di devianza.':
    'Le test z est de Wald ; avec de petits échantillons, il peut diverger du test de déviance.',
  'Devianza': 'Déviance',
  'Devianza nulla': 'Déviance nulle',
  'df nullo': 'ddl de la déviance nulle',
  'Dispersione': 'Dispersion',
  'La devianza misura la distanza dal modello saturo; la devianza nulla quella dal solo intercetta.':
    'La déviance mesure la distance au modèle saturé ; la déviance nulle, celle au modèle avec la constante seule.',
  'Per famiglie con dispersione stimata (Gaussiana, Gamma) il rapporto devianza/df è una diagnostica, non un test.':
    'Pour les familles à dispersion estimée (gaussienne, Gamma), le rapport déviance/ddl est un diagnostic, pas un test.',
  'Modello probit': 'Modèle probit',
  'stima di massima verosimiglianza (probit)': 'estimation du maximum de vraisemblance (probit)',
  'Coefficienti ed exp(B)': 'Coefficients et exp(B)',
  'exp(B)': 'exp(B)',
  'exp(B) CI low': 'exp(B) IC bas',
  'exp(B) CI high': 'exp(B) IC haut',
  'Nel modello probit B è il coefficiente sulla scala normale latente: exp(B) non è un odds ratio ma un fattore moltiplicativo sul predittore latente.':
    'Dans le modèle probit, B est le coefficient sur l’échelle normale latente : exp(B) n’est pas un odds ratio mais un facteur multiplicatif sur le prédicteur latent.',
  'Un B positivo aumenta la probabilità dell’esito; l’effetto marginale dipende dal punto in cui viene valutato.':
    'Un B positif augmente la probabilité de la réponse ; l’effet marginal dépend du point où il est évalué.',
  'Modello multinomiale': 'Modèle multinomial',
  'stima di massima verosimiglianza · N = {s1}':
    'estimation du maximum de vraisemblance · N = {s1}',
  'Classi': 'Classes',
  'Classe di riferimento': 'Classe de référence',
  'Accuratezza complessiva (%)': 'Exactitude globale (%)',
  'no': 'non',
  'Il modello stima una probabilità per ogni classe; la classe di riferimento ha coefficienti fissati a zero.':
    'Le modèle estime une probabilité pour chaque classe ; la classe de référence a des coefficients fixés à zéro.',
  'La deviance confronta la verosimiglianza del modello con quella di un modello saturo: valori più bassi indicano un adattamento migliore.':
    'La déviance compare la vraisemblance du modèle à celle d’un modèle saturé : des valeurs plus basses indiquent un meilleur ajustement.',
  'Coefficienti per classe': 'Coefficients par classe',
  'Classe di riferimento: {s1} · CI {s2}%': 'Classe de référence : {s1} · IC {s2} %',
  'Classe': 'Classe',
  'Ogni classe è confrontata con la classe di riferimento: OR > 1 aumenta le probabilità di quella classe rispetto al riferimento.':
    'Chaque classe est comparée à la classe de référence : un OR > 1 augmente les probabilités de cette classe par rapport à la référence.',
  'I coefficienti sono stimati al netto degli altri predittori; l’intercetta non ha un odds ratio interpretabile.':
    'Les coefficients sont estimés en tenant compte des autres prédicteurs ; la constante n’a pas d’odds ratio interprétable.',
  'Classificazione per classe': 'Classification par classe',
  'Accuratezza complessiva: {s1}%': 'Exactitude globale : {s1} %',
  'Corrette': 'Correctes',
  'Accuratezza (%)': 'Exactitude (%)',
  'Probabilità media (%)': 'Probabilité moyenne (%)',
  'La classe predetta è quella con la probabilità stimata più alta; l’accuratezza per classe è il rapporto tra classificazioni corrette e osservazioni di quella classe.':
    'La classe prédite est celle dont la probabilité estimée est la plus élevée ; l’exactitude par classe est le rapport entre les classifications correctes et les observations de cette classe.',
  'Le classi rare possono avere un’accuratezza instabile perché calcolata su poche osservazioni.':
    'Les classes rares peuvent avoir une exactitude instable car elle est calculée sur peu d’observations.',
  'ANOVA gerarchica': 'ANOVA hiérarchique',
  '{s1} per {s2} annidato in {s3}': '{s1} pour {s2} emboîté dans {s3}',
  'dentro': 'dans',
  'Errore': 'Erreur',
  'Il fattore esterno è testato contro la media quadratica del fattore annidato, non contro il residuo.':
    'Le facteur externe est testé contre le carré moyen du facteur emboîté, et non contre le résidu.',
  'Il fattore interno è testato contro il residuo entro cella.':
    'Le facteur interne est testé contre le résidu intra-cellule.',
  'Descrittive per cella': 'Statistiques descriptives par cellule',
  'Componenti di varianza': 'Composantes de variance',
  'Stime approssimate per il modello a effetti casuali; con celle sbilanciate sono indicative.':
    'Estimations approximatives pour le modèle à effets aléatoires ; avec des cellules déséquilibrées, elles sont indicatives.',
  'Esponenziale': 'Exponentiel',
  'Logistica': 'Logistique',
  'Gompertz': 'Gompertz',
  'Michaelis–Menten': 'Michaelis–Menten',
  'Parametri del modello': 'Paramètres du modèle',
  'Le stime sono ai minimi quadrati sulla curva scelta; gli errori standard vengono dalla matrice jacobiana al punto di ottimo.':
    'Les estimations sont aux moindres carrés sur la courbe choisie ; les erreurs standard proviennent de la matrice jacobienne au point optimal.',
  'Il test t riguarda il singolo parametro: p piccolo indica che il parametro è distinto da zero nella scala della curva.':
    'Le test t porte sur le paramètre individuel : un p petit indique que le paramètre diffère de zéro sur l’échelle de la courbe.',
  '{s1} su {s2}': '{s1} sur {s2}',
  'SSE': 'SSE',
  'R² confronta la curva con la media di Y: non dice se la forma del modello è quella giusta, solo quanto spiega rispetto a una retta piatta.':
    'Le R² compare la courbe à la moyenne de Y : il ne dit pas si la forme du modèle est la bonne, seulement combien elle explique par rapport à une droite plate.',
  'RMSE è nella stessa unità della variabile dipendente e riassume l’errore tipico della curva.':
    'Le RMSE est dans la même unité que la variable dépendante et résume l’erreur typique de la courbe.',
  'Coefficienti penalizzati': 'Coefficients pénalisés',
  '{s1} · {s2} · λ = {s3} · CI {s4}%': '{s1} · {s2} · λ = {s3} · IC {s4} %',
  'Coefficiente': 'Coefficient',
  'I coefficienti sono sulla scala originale delle variabili; il modello è stato stimato su predittori standardizzati.':
    'Les coefficients sont sur l’échelle d’origine des variables ; le modèle a été estimé sur des prédicteurs standardisés.',
  'Con LASSO i coefficienti esattamente nulli indicano variabili escluse dal modello.':
    'Avec LASSO, les coefficients exactement nuls indiquent des variables exclues du modèle.',
  'Penalità': 'Pénalité',
  'Coefficienti non nulli': 'Coefficients non nuls',
  'λ governa la forza della penalizzazione: valori più alti producono modelli più semplici.':
    'λ gouverne la force de la pénalisation : des valeurs plus élevées produisent des modèles plus simples.',
  'α = 0 è ridge, α = 1 è LASSO, valori intermedi sono elastic net.':
    'α = 0 correspond à ridge, α = 1 à LASSO, les valeurs intermédiaires à elastic net.',
  'Coefficienti del polinomio': 'Coefficients du polynôme',
  '{s1} su {s2} · grado {s3}': '{s1} sur {s2} · degré {s3}',
  'Il modello usa la base polinomiale grezza: i coefficienti sono quelli di x, x², … senza ortogonalizzazione.':
    'Le modèle utilise la base polynomiale brute : les coefficients sont ceux de x, x², … sans orthogonalisation.',
  'CI al {s1}%.': 'IC à {s1} %.',
  'Gradi di libertà': 'Degrés de liberté',
  '(Intercept)': '(Intercept)',
  'Coefficienti della regressione quantilica': 'Coefficients de la régression quantile',
  '{s1} · τ = {s2}': '{s1} · τ = {s2}',
  'β misura la variazione del quantile τ della risposta per una unità in più del predittore, al netto degli altri.':
    'β mesure la variation du quantile τ de la réponse pour une unité supplémentaire du prédicteur, les autres étant contrôlés.',
  'L’intercetta è il quantile τ stimato quando tutti i predittori valgono zero.':
    'La constante est le quantile τ estimé lorsque tous les prédicteurs valent zéro.',
  'Gli intervalli sono normali al 95%; il p è di Wald a due code e usa errori standard approssimati.':
    'Les intervalles sont normaux à 95 % ; le p est de Wald bilatéral et utilise des erreurs standard approximées.',
  'Adattamento del modello quantilico': 'Ajustement du modèle quantile',
  '{s1} osservazioni · {s2} parametri': '{s1} observations · {s2} paramètres',
  'Residui assoluti medi': 'Résidus absolus moyens',
  'La funzione obiettivo è la somma della perdita asimmetrica ρτ: con τ = 0,5 coincide con la regressione mediana.':
    'La fonction objectif est la somme de la perte asymétrique ρτ : avec τ = 0,5, elle coïncide avec la régression médiane.',
  'Il numero di iterazioni conta i pivot del simplesso; un valore molto alto segnala un problema numerico.':
    'Le nombre d’itérations compte les pivots du simplexe ; une valeur très élevée signale un problème numérique.',
  'Aggiunta': 'Ajout',
  'Rimozione': 'Retrait',
  'Partenza': 'Départ',
  'Stop': 'Arrêt',
  'Migliori sottoinsiemi': 'Meilleurs sous-ensembles',
  'Un modello per dimensione · criterio: {s1}': 'Un modèle par dimension · critère : {s1}',
  'La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.':
    'La recherche exhaustive évalue tous les sous-ensembles jusqu’à un maximum de 8 prédicteurs ; au-delà de ce seuil, le coût croît rapidement.',
  'Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.':
    'Le Cp compare chaque modèle au modèle complet : des valeurs proches du nombre de paramètres indiquent un bon compromis.',
  'Percorso stepwise': 'Cheminement stepwise',
  'Direzione: {s1}': 'Direction : {s1}',
  'Azione': 'Action',
  'Modello selezionato': 'Modèle sélectionné',
  'R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.':
    'R² = {s1} ; R² ajusté = {s2} ; F = {s3} ; p = {s4}.',
  'Report di lettura — MANCOVA': 'Rapport de lecture — MANCOVA',
  'Effetto di {s1} su {s2} variabili, al netto di {s3}: Wilk’s λ = {s4}, p = {s5}.': 'Effet de {s1} sur {s2} variables, ajusté pour {s3} : λ de Wilks = {s4}, p = {s5}.',
  'nessuna covariata': 'aucune covariable',
  'La MANCOVA estende la MANOVA aggiungendo covariate continue: confronta i gruppi su più esiti simultaneamente, correggendo per variabili che potrebbero spiegare parte delle differenze.': 'La MANCOVA étend la MANOVA avec des covariables continues : elle compare les groupes sur plusieurs résultats à la fois, en corrigeant pour des variables qui pourraient expliquer une partie des différences.',
  'Il test multivariato risponde alla domanda “il gruppo conta, al netto delle covariate?”; i test univariati localizzano l’effetto sulle singole variabili.': 'Le test multivarié répond à la question « le groupe compte-t-il, ajusté pour les covariables ? » ; les tests univariés localisent l’effet sur chaque variable.',
  'Wilk’s λ = {s1}, F = {s2} con {s3} e {s4} gradi di libertà, p = {s5}.': 'λ de Wilks = {s1}, F = {s2} avec {s3} et {s4} degrés de liberté, p = {s5}.',
  '{s1} variabili su {s2} mostrano un effetto di gruppo significativo al livello scelto.': '{s1} variables sur {s2} montrent un effet de groupe significatif au niveau choisi.',
  '{s1}: F = {s2}, p = {s3}.': '{s1} : F = {s2}, p = {s3}.',
  'Le medie aggiustate sono i valori attesi se tutti i gruppi avessero la stessa media delle covariate: servono a confrontare i gruppi “a parità di” covariate.': 'Les moyennes ajustées sont les valeurs attendues si tous les groupes avaient la même moyenne des covariables : elles comparent les groupes « à covariables constantes ».',
  'Un effetto multivariato significativo può nascondere variabili non significative e viceversa: leggi insieme il test globale e quelli univariati.': 'Un effet multivarié significatif peut masquer des variables non significatives et inversement : lisez ensemble le test global et les tests univariés.',
  'Le covariate devono essere misurate prima del trattamento e non essere conseguenze del gruppo: altrimenti la correzione toglie parte dell’effetto che vuoi stimare.': 'Les covariables doivent être mesurées avant le traitement et ne pas être des conséquences du groupe : sinon l’ajustement retire une partie de l’effet que vous voulez estimer.',
  'Il modello assume relazioni lineari tra covariate ed esiti e omogeneità delle pendenze tra gruppi; controlla questi punti prima di fidarti del p.': 'Le modèle suppose des relations linéaires entre covariables et résultats et des pentes homogènes entre groupes ; vérifiez ces points avant de faire confiance au p.',
  'Non sono inclusi termini di interazione gruppo × covariata, contrasti pianificati o correzioni per test multipli.': 'Les termes d’interaction groupe × covariable, les contrastes planifiés et les corrections pour tests multiples ne sont pas inclus.',
  'Con gruppi piccoli o covariate collineari le stime diventano instabili e il test multivariato perde potenza.': 'Avec de petits groupes ou des covariables colinéaires, les estimations deviennent instables et le test multivarié perd de la puissance.',
  'Test multivariato': 'Test multivarié',
  'Wilk’s lambda · CI {s1}%': 'Lambda de Wilks · IC {s1} %',
  'Wilk’s lambda': 'Lambda de Wilks',
  'Il test multivariato valuta l’effetto del gruppo su tutte le variabili dipendenti insieme, al netto delle covariate.': 'Le test multivarié évalue l’effet du groupe sur toutes les variables dépendantes ensemble, ajusté pour les covariables.',
  'L’approssimazione F di Rao è quella usata da car::Anova; con campioni piccoli il p può differire leggermente.': 'L’approximation F de Rao est celle utilisée par car::Anova ; avec de petits échantillons, le p peut différer légèrement.',
  'ANCOVA univariata per variabile': 'ANCOVA univariée par variable',
  'Effetto del gruppo al netto delle covariate': 'Effet du groupe ajusté pour les covariables',
  'Medie aggiustate': 'Moyennes ajustées',
  'Valori attesi alle medie delle covariate': 'Valeurs attendues aux moyennes des covariables',
};

