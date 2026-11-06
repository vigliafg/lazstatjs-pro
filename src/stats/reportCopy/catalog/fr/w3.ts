/** French: W3 report and table prose (GLMM). */
export const w3Copy: Record<string, string> = {
  'Binomiale':
    'Binomiale',
  'BLUP di intercetta e pendenza':
    'BLUP d’ordonnée à l’origine et de pente',
  'CI {s1}% · z di Wald':
    'IC {s1}% · z de Wald',
  'Con pochi gruppi le componenti di varianza sono instabili e l’ICC va letto con prudenza.':
    'Avec peu de groupes, les composantes de variance sont instables et l’ICC doit être lu avec prudence.',
  'Con pochi punti per gruppo la stima della pendenza casuale è instabile e può collassare verso zero.':
    'Avec peu de points par groupe, l’estimation de la pente aléatoire est instable et peut s’effondrer vers zéro.',
  'Convergenza non raggiunta: le stime non sono affidabili.':
    'Convergence non atteinte : les estimations ne sont pas fiables.',
  'Convergenza raggiunta.':
    'Convergence atteinte.',
  'Correlazione':
    'Corrélation',
  'Correlazione (intercetta–pendenza)':
    'Corrélation (ordonnée à l’origine–pente)',
  'Covarianza':
    'Covariance',
  'Covarianza (intercetta–pendenza)':
    'Covariance (ordonnée à l’origine–pente)',
  'Effetti casuali per gruppo':
    'Effets aléatoires par groupe',
  'Famiglia {s1} · link {s2} · effetti casuali per {s3}':
    'Famille {s1} · lien {s2} · effets aléatoires pour {s3}',
  'Gaussiana':
    'Gaussienne',
  'Gli effetti casuali sono assunti normali e la verosimiglianza è approssimata: AIC e BIC vanno confrontati solo tra modelli con la stessa risposta e struttura.':
    'Les effets aléatoires sont supposés normaux et la vraisemblance est approchée : l’AIC et le BIC ne doivent être comparés qu’entre modèles ayant la même réponse et la même structure.',
  'Gruppi con pochi casi sono stimati con maggiore incertezza: la colonna N aiuta a pesare la lettura.':
    'Les groupes avec peu de cas sont estimés avec une plus grande incertitude : la colonne N aide à pondérer la lecture.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso: i gruppi con pochi casi sono tirati verso la media generale.':
    'Les BLUP sont des estimations conditionnelles au groupe, contractées vers l’effet fixe : les groupes avec peu de cas sont tirés vers la moyenne générale.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso (shrinkage).':
    'Les BLUP sont des estimations conditionnelles au groupe, contractées vers l’effet fixe (shrinkage).',
  'I BLUP sono stime condizionate al gruppo: la loro variabilità non va confrontata con i coefficienti fissi.':
    'Les BLUP sont des estimations conditionnelles au groupe : leur variabilité ne doit pas être comparée aux coefficients fixes.',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi; la pendenza di {s3} varia tra gruppi (varianza {s4}).':
    'ICC = {s1} : {s2}% de la variabilité est entre les groupes ; la pente de {s3} varie entre les groupes (variance {s4}).',
  'I coefficienti fissi sono sulla scala del link: con logit B è un log-odds, con log è una differenza di log-medie, con identity coincide con la scala della risposta.':
    'Les coefficients fixes sont sur l’échelle du lien : avec logit, B est un log-odds, avec log c’est une différence de log-moyennes, avec identity il coïncide avec l’échelle de la réponse.',
  'Identità':
    'Identité',
  'Il modello assume normalità degli effetti casuali e residui omoschedastici.':
    'Le modèle suppose la normalité des effets aléatoires et des résidus homoscédastiques.',
  'Il modello non ha raggiunto la convergenza: le stime degli effetti e delle varianze non sono affidabili.':
    'Le modèle n’a pas atteint la convergence : les estimations des effets et des variances ne sont pas fiables.',
  'Il modello stima un’intercetta e una pendenza per ogni gruppo, trattandole come estrazioni da una popolazione normale.':
    'Le modèle estime une ordonnée à l’origine et une pente pour chaque groupe, en les traitant comme des tirages d’une population normale.',
  'Il motore copre famiglie gaussiana, binomiale e Poisson con un solo fattore di raggruppamento e al più una pendenza casuale.':
    'Le moteur couvre les familles gaussienne, binomiale et Poisson avec un seul facteur de regroupement et au plus une pente aléatoire.',
  'Il test z è asintotico: con pochi gruppi i gradi di libertà effettivi sono incerti.':
    'Le test z est asymptotique : avec peu de groupes, les degrés de liberté effectifs sont incertains.',
  'Il test z è asintotico: non usa gradi di libertà Satterthwaite o Kenward–Roger.':
    'Le test z est asymptotique : il n’utilise pas les degrés de liberté de Satterthwaite ou de Kenward–Roger.',
  'Il test z è di Wald: con gruppi piccoli l’approssimazione può divergere dal test di verosimiglianza.':
    'Le test z est un test de Wald : avec de petits groupes, l’approximation peut diverger du test de vraisemblance.',
  'Intercetta':
    'Ordonnée à l’origine',
  'La covarianza tra intercetta e pendenza descrive se i gruppi che partono più alti tendono a crescere più o meno rapidamente.':
    'La covariance entre l’ordonnée à l’origine et la pente décrit si les groupes qui partent plus haut ont tendance à croître plus ou moins vite.',
  'La pendenza media è un effetto fisso; la sua variabilità tra gruppi è un effetto casuale.':
    'La pente moyenne est un effet fixe ; sa variabilité entre les groupes est un effet aléatoire.',
  'La verosimiglianza è approssimata con Laplace: con gruppi piccoli o risposte estreme l’approssimazione può essere imprecisa.':
    'La vraisemblance est approchée par Laplace : avec de petits groupes ou des réponses extrêmes, l’approximation peut être imprécise.',
  'Le varianze sono sulla scala del predittore lineare: per binomiale e Poisson non sono componenti di varianza della risposta osservata.':
    'Les variances sont sur l’échelle du prédicteur linéaire : pour binomiale et Poisson, ce ne sont pas des composantes de variance de la réponse observée.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: un ICC alto indica che ignorare il gruppo sottostima l’errore standard degli effetti fissi.':
    'L’ICC est la part de variance attribuable aux groupes : un ICC élevé indique qu’ignorer le groupe sous-estime l’erreur standard des effets fixes.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: valori alti indicano osservazioni molto correlate entro gruppo.':
    'L’ICC est la part de variance attribuable aux groupes : des valeurs élevées indiquent des observations fortement corrélées au sein du groupe.',
  'Log':
    'Log',
  'Logit':
    'Logit',
  'Modello lineare misto con pendenza casuale':
    'Modèle linéaire mixte à pente aléatoire',
  'Nella famiglia binomiale la separazione (esiti perfettamente separati) rende le stime instabili o divergenti.':
    'Dans la famille binomiale, la séparation (issues parfaitement séparées) rend les estimations instables ou divergentes.',
  'Non estrapolare oltre i livelli osservati dei predittori né a gruppi nuovi non rappresentati nel campione.':
    'Ne pas extrapoler au-delà des niveaux observés des prédicteurs ni à de nouveaux groupes non représentés dans l’échantillon.',
  'Pendenza':
    'Pente',
  'Poisson':
    'Poisson',
  'Report del modello misto con pendenza casuale':
    'Rapport du modèle mixte à pente aléatoire',
  'Report di lettura — Modello lineare generalizzato misto':
    'Rapport de lecture — Modèle linéaire généralisé mixte',
  'Rispetto al GLM, il GLMM aggiunge effetti casuali che assorbono la correlazione entro gruppo; rispetto al LMM, estende il modello a risposte non normali tramite famiglia e link.':
    'Par rapport au GLM, le GLMM ajoute des effets aléatoires qui absorbent la corrélation intra-groupe ; par rapport au LMM, il étend le modèle à des réponses non normales via la famille et le lien.',
  '{s1} ~ {s2} + (1 + {s3} | {s4}) · CI {s5}%':
    '{s1} ~ {s2} + (1 + {s3} | {s4}) · IC {s5}%',
  '{s1} ~ {s2} · effetti casuali per {s3} · CI {s4}%':
    '{s1} ~ {s2} · effets aléatoires pour {s3} · IC {s4}%',
  '{s1} gruppi hanno effetti casuali stimati (BLUP); famiglia {s2}, link {s3}.':
    '{s1} groupes ont des effets aléatoires estimés (BLUP) ; famille {s2}, lien {s3}.',
  '{s1} gruppi · pendenza casuale su {s2}':
    '{s1} groupes · pente aléatoire sur {s2}',
  '{s1}: nessun predittore risulta significativo al livello scelto, con effetti casuali per {s2}; ICC = {s3}.':
    '{s1} : aucun prédicteur n’est significatif au niveau choisi, avec des effets aléatoires pour {s2} ; ICC = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello di confidenza del {s3}%.':
    '{s1} prédicteur(s) sur {s2} sont significatifs au niveau de confiance de {s3}%.',
  '{s1} spiegato da {s2} predittore/i con effetti casuali per {s3}; ICC = {s4}.':
    '{s1} expliqué par {s2} prédicteur(s) avec des effets aléatoires pour {s3} ; ICC = {s4}.',
  'SE intercetta':
    'ES ordonnée à l’origine',
  'SE pendenza':
    'ES pente',
  'Servono almeno 5–10 gruppi per stimare una varianza di pendenza con una precisione accettabile.':
    'Il faut au moins 5–10 groupes pour estimer une variance de pente avec une précision acceptable.',
  'Stima di massima verosimiglianza con effetti casuali normali e residui omoschedastici.':
    'Estimation par maximum de vraisemblance avec effets aléatoires normaux et résidus homoscédastiques.',
  'Una varianza di pendenza vicina a zero indica che i gruppi crescono allo stesso modo; una correlazione positiva indica che i gruppi con intercetta più alta tendono ad avere pendenze più ripide.':
    'Une variance de pente proche de zéro indique que les groupes croissent de la même façon ; une corrélation positive indique que les groupes ayant une ordonnée à l’origine plus élevée ont tendance à avoir des pentes plus fortes.',
  'Una varianza stimata al bordo (vicina a zero) o una correlazione vicina a ±1 segnala un modello al limite dello spazio dei parametri.':
    'Une variance estimée à la limite (proche de zéro) ou une corrélation proche de ±1 signale un modèle à la limite de l’espace des paramètres.',
  'Un GLMM serve quando le osservazioni sono raggruppate: dentro lo stesso gruppo le misure si somigliano e i residui non sono indipendenti.':
    'Un GLMM est nécessaire lorsque les observations sont regroupées : au sein d’un même groupe, les mesures se ressemblent et les résidus ne sont pas indépendants.',
  'Varianza della pendenza = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Variance de la pente = {s1} ; corrélation ordonnée à l’origine–pente = {s2}.',
  'Varianza della pendenza casuale = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Variance de la pente aléatoire = {s1} ; corrélation ordonnée à l’origine–pente = {s2}.',
  'Varianza dell’intercetta casuale = {s1}; ICC = {s2}: il {s3}% della variabilità è attribuibile ai gruppi.':
    'Variance de l’ordonnée à l’origine aléatoire = {s1} ; ICC = {s2} : {s3}% de la variabilité est attribuable aux groupes.',
  'Varianza pendenza':
    'Variance pente',
  'Test degli effetti fissi': 'Tests des effets fixes',
  'ChiSquare': 'Khi-deux',
  'df': 'ddl',
  'Con predittori a una colonna il test è il quadrato dello z: il p-value coincide con quello della tabella dei coefficienti.': 'Avec des prédicteurs à une colonne, le test est le carré de z : la p-valeur est celle du tableau des coefficients.',
  'La tabella delle componenti di varianza riporta SE e CI di Wald su scala log: un intervallo ampio dice che servono piu gruppi per una stima stabile.': 'Le tableau des composantes de variance donne une erreur type et un IC de Wald sur l’échelle log : un intervalle large indique qu’il faut plus de groupes pour une estimation stable.',
  'I test degli effetti fissi riportano il Wald per termine: con una sola colonna per termine coincide con lo z al quadrato.': 'Les tests des effets fixes donnent le Wald par terme : avec une seule colonne par terme, il vaut le carré du z.',
  'Wald per termine · CI {s1}%': 'Wald par terme · IC {s1}%',
  'Wald per termine · df {s1} · {s2}': 'Wald par terme · ddl {s1} · {s2}',
};
