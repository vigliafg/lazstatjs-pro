/** fr: report and table prose (normalised). */
export const contingencyCopy: Record<string, string> = {
  ', sopra la soglia α = {s1}: l’ipotesi di indipendenza non viene rifiutata.':
    ', au-dessus du seuil α = {s1} : l’hypothèse d’indépendance n’est pas rejetée.',
  ', sotto la soglia α = {s1}: l’ipotesi di indipendenza viene rifiutata.':
    ', sous le seuil α = {s1} : l’hypothèse d’indépendance est rejetée.',
  '{s1} · {s2}':
    '{s1} · {s2}',
  '{s1} × {s2} · N = {s3}':
    '{s1} × {s2} · N = {s3}',
  '{s1} cella/e su {s2} hanno attesa < 5: l\'approssimazione χ² è fragile (regola di Cochran).':
    '{s1} cellule(s) sur {s2} ont un effectif attendu < 5 : l’approximation χ² est fragile (règle de Cochran).',
  '{s1}: {s2} del previsto (residuo aggiustato {s3})':
    '{s1} : {s2} du prévu (résidu ajusté {s3})',
  '0 = nessuna associazione, 1 = associazione perfetta':
    '0 = aucune association, 1 = association parfaite',
  'Ampiezza dell’associazione':
    'Ampleur de l’association',
  'Associazione significativa':
    'Association significative',
  'Assunzioni da controllare':
    'Hypothèses à vérifier',
  'c{s1}':
    'c{s1}',
  'Categorie esaustive e mutuamente esclusive: ogni osservazione cade in una sola cella.':
    'Catégories exhaustives et mutuellement exclusives : chaque observation tombe dans une seule cellule.',
  'Cella':
    'Cellule',
  'Coefficiente di contingenza C':
    'Coefficient de contingence C',
  'Col {s1}':
    'Col. {s1}',
  'Con celle piccole il test esatto di Fisher dà p = {s1}: è il valore da preferire in una tabella 2×2 con attese basse.':
    'Avec de petites cellules, le test exact de Fisher donne p = {s1} : c’est la valeur à préférer dans un tableau 2×2 avec de faibles effectifs attendus.',
  'Con dati raggruppati per convenienza (non campionati) il p-value non ha il significato nominale.':
    'Avec des données regroupées par commodité (non échantillonnées), la valeur p n’a pas sa signification nominale.',
  'Contributo χ²':
    'Contribution χ²',
  'Cramér’s V':
    'Cramér’s V',
  'Cramér’s V = {s1}: un’associazione {s2} (0 = indipendenza, 1 = legame deterministico). Il p-value può essere piccolissimo anche per associazioni debolissime se N è grande: la forza va letta qui, non nel p.':
    'Cramér’s V = {s1} : une association {s2} (0 = indépendance, 1 = lien déterministe). La valeur p peut être infime même pour des associations très faibles si N est grand : la force se lit ici, pas dans la p.',
  'df':
    'dl',
  'df = (righe − 1)(colonne − 1) = {s1}.':
    'dl = (lignes − 1)(colonnes − 1) = {s1}.',
  'Dipende dal numero di categorie: confrontabile solo tra tabelle di stessa forma':
    'Dépend du nombre de catégories : comparable seulement entre tableaux de même forme',
  'Dove sta l’associazione':
    'Où se situe l’association',
  'E':
    'E',
  'E = (totale riga × totale colonna) / N':
    'E = (total ligne × total colonne) / N',
  'Fisher\'s exact (two-sided)':
    'Fisher exact (bilatéral)',
  'Frequenze attese sotto indipendenza':
    'Effectifs attendus sous indépendance',
  'Il contributo è quanto quella cella pesa nel χ² totale: le prime posizioni spiegano l’associazione.':
    'La contribution correspond au poids de cette cellule dans le χ² total : les premières positions expliquent l’association.',
  'Il p-value dipende da N; queste misure no, ed è per questo che vanno riportate insieme.':
    'La valeur p dépend de N ; ces mesures non, et c’est pourquoi elles doivent être rapportées ensemble.',
  'Il test del χ² confronta le frequenze che osservi con quelle che ti aspetteresti se le due variabili categoriche fossero completamente indipendenti.':
    'Le test du χ² compare les effectifs que vous observez à ceux que vous attendriez si les deux variables catégorielles étaient totalement indépendantes.',
  'Il test dice che esiste un’associazione, non quanto sia forte né in quale direzione: per quello servono residui e misure di associazione.':
    'Le test dit qu’une association existe, ni sa force ni sa direction : pour cela, il faut les résidus et les mesures d’association.',
  'Il test non dice nulla sulla direzione causale: associazione non è causa.':
    'Le test ne dit rien de la direction causale : association n’est pas cause.',
  'Il χ² dice che qualcosa c’è, non dove. I residui aggiustati rispondono a questa domanda: valori oltre ±2 indicano le celle che si discostano dall’indipendenza più di quanto il caso spieghi.':
    'Le χ² dit qu’il y a quelque chose, pas où. Les résidus ajustés répondent à cette question : des valeurs au-delà de ±2 indiquent les cellules qui s’écartent de l’indépendance plus que le hasard ne l’explique.',
  'L’ipotesi nulla è “indipendenza”: nessuna relazione tra riga e colonna. Un p piccolo significa che le differenze tra osservato e atteso sono troppo grandi per essere solo rumore campionario.':
    'L’hypothèse nulle est « indépendance » : aucune relation entre ligne et colonne. Une p petite signifie que les différences entre observé et attendu sont trop grandes pour n’être que du bruit d’échantillonnage.',
  'La lettura dei risultati':
    'La lecture des résultats',
  'La misura di associazione non è calcolabile con questi dati.':
    'La mesure d’association n’est pas calculable avec ces données.',
  'La tabella ha N = {s1} osservazioni e {s2} gradi di libertà. Il χ² di Pearson vale {s3}: {s4}{s5}':
    'Le tableau a N = {s1} observations et {s2} degrés de liberté. Le χ² de Pearson vaut {s3} : {s4}{s5}',
  'Le attese sono le frequenze che si vedrebbero se le due variabili fossero indipendenti.':
    'Les attendus sont les effectifs que l’on verrait si les deux variables étaient indépendantes.',
  'Le due variabili non sono indipendenti (χ² = {s1}, df = {s2}, p = {s3}).':
    'Les deux variables ne sont pas indépendantes (χ² = {s1}, dl = {s2}, p = {s3}).',
  'Lettura':
    'Lecture',
  'Likelihood ratio G²':
    'Rapport de vraisemblance G²',
  'meno osservazioni':
    'moins d’observations',
  'Misura':
    'Mesure',
  'Monte Carlo ({s1} tavole, margini fissi)':
    'Monte-Carlo ({s1} tables, marges fixes)',
  'Nessuna associazione rilevata':
    'Aucune association détectée',
  'Nessuna cella supera la soglia di ±2: l’associazione è diffusa, non concentrata in una combinazione specifica.':
    'Aucune cellule ne dépasse le seuil de ±2 : l’association est diffuse, non concentrée sur une combinaison précise.',
  'Nessuna evidenza di associazione (χ² = {s1}, df = {s2}, p = {s3}).':
    'Aucune preuve d’association (χ² = {s1}, dl = {s2}, p = {s3}).',
  'non calcolabile':
    'non calculable',
  'O':
    'O',
  'Ogni cella contiene il numero di osservazioni con quella combinazione di categorie.':
    'Chaque cellule contient le nombre d’observations avec cette combinaison de catégories.',
  'Osservazioni indipendenti: ogni riga del dataset deve essere una unità diversa, non una misura ripetuta.':
    'Observations indépendantes : chaque ligne du jeu de données doit être une unité différente, et non une mesure répétée.',
  'p':
    'p',
  'Pearson χ²':
    'Pearson χ²',
  'Per tabelle 2×2 coincide con la correlazione tra le due variabili binarie':
    'Pour les tableaux 2×2, coïncide avec la corrélation entre les deux variables binaires',
  'più osservazioni':
    'plus d’observations',
  'Poiché {s1} celle hanno attesa sotto 5, ho aggiunto un p Monte Carlo con margini fissi ({s2}): non dipende dall’approssimazione asintotica.':
    'Comme {s1} cellules ont un effectif attendu inférieur à 5, j’ai ajouté une p Monte-Carlo à marges fixes ({s2}) : elle ne dépend pas de l’approximation asymptotique.',
  'Quanto è forte':
    'Quelle est sa force',
  'Regola di Cochran: nessuna attesa < 1 e non più del 20% delle celle con attesa < 5; se cade, usa Fisher (2×2) o il p Monte Carlo.':
    'Règle de Cochran : aucune attente < 1 et pas plus de 20 % des cellules avec une attente < 5 ; si elle n’est pas respectée, utilisez Fisher (2×2) ou la p Monte-Carlo.',
  'Report di lettura':
    'Rapport de lecture',
  'Residui e contributi al χ²':
    'Résidus et contributions au χ²',
  'Residuo aggiustato':
    'Résidu ajusté',
  'Residuo standardizzato = (O − E)/√E':
    'Résidu standardisé = (O − E)/√E',
  'Residuo std.':
    'Résidu std.',
  'Riga':
    'Ligne',
  'Row {s1}':
    'Ligne {s1}',
  'Statistica':
    'Statistique',
  'Tabella di contingenza (frequenze osservate)':
    'Tableau de contingence (effectifs observés)',
  'Tabelle molto grandi con molte categorie rare rendono il χ² instabile anche con N elevato.':
    'Des tableaux très grands avec beaucoup de catégories rares rendent le χ² instable même avec un N élevé.',
  'Tabelle troppo piccole o con celle vuote: il test non è calcolabile.':
    'Tableau trop petit ou avec des cellules vides : le test n’est pas calculable.',
  'Test':
    'Test',
  'Test di indipendenza':
    'Test d’indépendance',
  'Totale':
    'Total',
  'Tutte le attese sono ≥ 5: l’approssimazione χ² è adeguata.':
    'Tous les attendus sont ≥ 5 : l’approximation χ² est adaptée.',
  'Un residuo aggiustato oltre ±2 segnala la cella che si discosta di più dall’indipendenza.':
    'Un résidu ajusté au-delà de ±2 signale la cellule qui s’écarte le plus de l’indépendance.',
  'Valore':
    'Valeur',
  'Yates (correzione di continuità)':
    'Yates (correction de continuité)',
  'α = {s1}':
    'α = {s1}',
  'φ (phi)':
    'φ (phi)',
  'χ² e G² condividono le stesse assunzioni: osservazioni indipendenti, categorie esaustive, attese sufficientemente grandi.':
    'χ² et G² partagent les mêmes hypothèses : observations indépendantes, catégories exhaustives, attendus suffisamment grands.',
  'Odds ratio comune (MH)': 'Odds ratio commun (MH)',
  'χ² Mantel–Haenszel': 'χ² Mantel–Haenszel',
  'Mantel–Haenszel: odds ratio comune': 'Mantel – Haenszel : rapport de cotes commun',
  '{s1} strati · α = {s2}': '{s1} strates · α = {s2}',
  'L’odds ratio comune combina i rapporti dei singoli strati con i pesi di Mantel–Haenszel; l’intervallo è calcolato su scala logaritmica.': 'L\'odds ratio commun combine les ratios des strates individuelles avec les poids de Mantel – Haenszel ; l\'intervalle est calculé sur une échelle logarithmique.',
  'Il χ² di Mantel–Haenszel verifica l’associazione comune dopo aver aggiustato per lo strato, con correzione di continuità.': 'Le Mantel – Haenszel χ² teste l\'association commune après ajustement pour la strate, avec correction de continuité.',
  'Almeno uno strato aveva una cella vuota: a quelle quattro celle è stato aggiunto 0,5 prima del calcolo.': 'Au moins une strate avait une cellule vide : ces quatre cellules avaient 0,5 ajouté avant le calcul.',
  'Dettaglio per strato': 'Détail par strate',
  'Odds ratio, log-OR e peso MH di ciascuna tabella 2×2': 'Rapport de cotes, log-OR et poids MH de chaque table 2×2',
  'Strato': 'Couche',
  'Log OR': 'Journal OU',
  'Peso MH': 'Poids MH',
  'Il peso MH è b·c/n: è il contributo dello strato al denominatore dell’odds ratio comune.': 'Le poids MH est b·c/n : c\'est la contribution de la strate au dénominateur de l\'odds ratio commun.',
  'Un OR di strato sopra 1 indica maggiore odds nella prima riga; sotto 1 indica maggiore odds nella seconda.': 'Une strate OR supérieure à 1 indique des probabilités plus élevées dans la première ligne ; en dessous de 1 indique des chances plus élevées dans la seconde.',
  'Trend di Cochran–Armitage': 'Tendance Cochran-Armitage',
  'Statistica z² con 1 grado di libertà': 'Statistique z² avec 1 degré de liberté',
  'Cochran–Armitage per il trend': 'Cochran-Armitage pour la tendance',
  'Il test confronta la proporzione di “{s1}” con i punteggi assegnati alle righe: un p piccolo indica un andamento sistematico, non solo una differenza tra gruppi.': 'Le test compare la proportion de « {s1} » avec les scores attribués aux lignes : un petit p indique une tendance systématique, pas seulement une différence entre les groupes.',
  'La statistica è z² e coincide con il test di regressione lineare pesata della proporzione sul punteggio.': 'La statistique est z² et coïncide avec le test de régression linéaire pondérée de la proportion sur le score.',
  'Proporzioni per riga': 'Proportions par rangée',
  'Punteggio, successi e proporzione osservata': 'Score, réussites et proportion observée',
  'Punteggio': 'Score',
  'La proporzione è successi / totale di riga. Il test ordina le righe secondo i punteggi, non secondo l’etichetta.': 'La proportion est le nombre de hits/ligne totale. Le test trie les lignes par scores et non par étiquette.',
  'Enumerazione esatta a margini fissi': 'Dénombrement exact avec marges fixes',
  'Monte Carlo a margini fissi': 'Monte Carlo avec marges fixes',
  '{s1} tavole enumerate': '{s1} tables énumérées',
  '{s1} simulazioni deterministiche': '{s1} simulations déterministes',
  'Tabella 2×2 · p da Fisher': 'Table 2×2 · p de Fisher',
  'Motivo non disponibile': 'Raison non disponible',
  'Test esatto R×C': 'Test R×C exact',
  '{s1} × {s2} · α = {s3}': '{s1} × {s2} · α = {s3}',
  'Statistica Σ|O − E|': 'Statistique Σ|O − E|',
  'Per una tabella 2×2 il p è quello di Fisher a due code; per tabelle più grandi il p somma le probabilità ipergeometriche delle tavole con margini fissi e statistica almeno pari a quella osservata.': 'Pour une table 2 × 2, le p est le p de Fisher bilatéral ; pour les tableaux plus grands, le p somme les probabilités hypergéométriques des tableaux à marges fixes et statistiques au moins égales à celles observées.',
  'Il numero di tavole supera il budget di enumerazione: il p è stimato con un Monte Carlo deterministico a margini fissi.': 'Le nombre de tableaux dépasse le budget de dénombrement : p est estimé avec un Monte Carlo déterministe à marges fixes.',
  'La tabella non permette di calcolare il p esatto: controlla celle, margini e dimensione.': 'Le tableau ne permet pas de calculer le p exact : il contrôle les cellules, les marges et la taille.',
  '{s1}: OR = {s2} (log-OR {s3}, peso {s4})': '{s1} : OU = {s2} (log-OR {s3}, poids {s4})',
  'Non ci sono strati sufficienti: il test di Mantel–Haenszel non è calcolabile.': 'Il n\'y a pas assez de strates : le test de Mantel-Haenszel n\'est pas calculable.',
  'Associazione comune significativa dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).': 'Association commune significative après ajustement pour les strates (χ² MH = {s1}, p = {s2}).',
  'Nessuna associazione comune rilevata dopo l’aggiustamento per strato (χ² MH = {s1}, p = {s2}).': 'Aucune association commune détectée après ajustement pour la strate (χ² MH = {s1}, p = {s2}).',
  'Associazione comune significativa': 'Association commune importante',
  'Nessuna associazione comune': 'Aucune association commune',
  'Il test di Mantel–Haenszel unisce più tabelle 2×2, una per strato, e verifica se l’associazione tra riga e colonna resta la stessa dopo aver tenuto conto dello strato.': 'Le test Mantel – Haenszel joint plusieurs tables 2x2, une par strate, et vérifie si l\'association entre ligne et colonne reste la même après prise en compte de la strate.',
  'È utile quando un fattore di confondimento crea gruppi diversi: invece di ignorarlo, lo si tratta come strato e si stima un odds ratio comune.': 'C\'est utile lorsqu\'un facteur de confusion crée différents groupes : au lieu de l\'ignorer, vous le traitez comme une strate et estimez un rapport de cotes commun.',
  'Gli strati utilizzati sono {s1}. L’odds ratio comune vale {s2} con intervallo {s3} – {s4}: {s5}': 'Les strates utilisés sont {s1}. Le rapport de cotes commun est {s2} avec une plage de {s3} – {s4} : {s5}',
  'p non calcolabile.': 'p non calculable.',
  'Il χ² di Mantel–Haenszel = {s1} supera la soglia α = {s2}: l’ipotesi di associazione comune nulla viene rifiutata.': 'Le Mantel–Haenszel χ² = {s1} dépasse le seuil α = {s2} : l\'hypothèse d\'association commune nulle est rejetée.',
  'Il χ² di Mantel–Haenszel = {s1} non supera la soglia α = {s2}: non ci sono prove sufficienti contro l’associazione comune nulla.': 'Le Mantel – Haenszel χ² = {s1} ne dépasse pas le seuil α = {s2} : les preuves sont insuffisantes contre l\'association commune nulle.',
  'Uno o più strati contenevano una cella vuota: per quel calcolo è stato aggiunto 0,5 a ogni cella, come correzione di continuità.': 'Une ou plusieurs strates contenaient une cellule vide : pour ce calcul, 0,5 a été ajouté à chaque cellule, à titre de correction de continuité.',
  'L’odds ratio comune è una media pesata degli odds ratio di strato: gli strati con più informazioni contano di più.': 'L\'odds ratio commun est une moyenne pondérée des odds ratios des strates : les strates avec plus d\'informations comptent davantage.',
  'Nessuno strato ha un odds ratio calcolabile: controlla le celle e i totali.': 'Aucune des strates n\'a de rapport de cotes calculable - vérifiez les cellules et les totaux.',
  'Ogni strato deve essere una tabella 2×2 completa, con lo stesso significato delle righe e delle colonne in tutti gli strati.': 'Chaque strate doit être un tableau complet 2x2, avec la même signification de lignes et de colonnes dans toutes les strates.',
  'L’odds ratio comune assume che l’associazione non cambi tra gli strati: se cambia, il valore pooled nasconde differenze importanti.': 'Le rapport de cotes commun suppose que l’association ne change pas entre les strates : si c’est le cas, la valeur regroupée cache des différences importantes.',
  'Osservazioni indipendenti e categorie esaustive restano necessarie, come nel χ² semplice.': 'Des observations indépendantes et des catégories exhaustives restent nécessaires, comme dans le χ² simple.',
  'Con molte celle piccole l’approssimazione χ² è fragile: il p va letto con cautela.': 'Avec de nombreuses petites cellules, l\'approximation χ² est fragile : le p doit être lu avec prudence.',
  'Mantel–Haenszel aggiusta per uno o più strati categorici, non per covariate continue.': 'Mantel – Haenszel s\'ajuste pour une ou plusieurs strates catégorielles, et non pour des covariables continues.',
  'Con strati molto diversi tra loro il valore comune può non rappresentare nessuno strato in particolare.': 'Avec des strates très différentes, la valeur commune peut ne représenter aucune strate particulière.',
  'in aumento': 'en augmentation',
  'in diminuzione': 'décroissant',
  'non determinabile': 'non déterminable',
  'Il trend non è calcolabile: servono almeno due righe con totali positivi e punteggi validi.': 'La tendance ne peut pas être calculée : au moins deux lignes avec des totaux positifs et des scores valides sont nécessaires.',
  'La proporzione mostra un trend significativo lungo i punteggi (z² = {s1}, p = {s2}).': 'La proportion montre une tendance significative à travers les scores (z² = {s1}, p = {s2}).',
  'Nessuna evidenza di trend lungo i punteggi (z² = {s1}, p = {s2}).': 'Aucune preuve de tendance le long des scores (z² = {s1}, p = {s2}).',
  'Trend significativo': 'Tendance significative',
  'Nessun trend rilevato': 'Aucune tendance détectée',
  'Il test di Cochran–Armitage verifica se la proporzione di successi cambia in modo sistematico quando le righe della tabella hanno un ordine numerico.': 'Le test Cochran-Armitage teste si la proportion de réussites change systématiquement lorsque les lignes du tableau ont un ordre numérique.',
  'I punteggi stabiliscono la distanza tra le righe: non sono etichette, ma posizioni sulla scala che si vuole testare.': 'Les scores établissent la distance entre les lignes : ce ne sont pas des étiquettes, mais des positions sur l\'échelle que vous souhaitez tester.',
  'La statistica z² vale {s1} con {s2} grado/i di libertà e {s3}.': 'La statistique z² est {s1} avec {s2} degré(s) de liberté et {s3}.',
  'p non calcolabile': 'p non calculable',
  'Il trend è {s1} e supera la soglia α = {s2}: la proporzione cambia con il punteggio più di quanto il caso spieghi.': 'La tendance est {s1} et dépasse le seuil α = {s2} : la proportion évolue avec le score plus que le hasard ne l\'explique.',
  'Il trend osservato è {s1}, ma non supera la soglia α = {s2}: non ci sono prove sufficienti di un andamento sistematico.': 'La tendance observée est {s1}, mais ne dépasse pas le seuil α = {s2} : les preuves d\'une tendance systématique sont insuffisantes.',
  'Le proporzioni osservate': 'Les proportions observées',
  'La tabella riporta, per ogni riga, successi, totale e proporzione. Il grafico lineare collega le proporzioni nell’ordine dei punteggi.': 'Le tableau montre, pour chaque ligne, les réussites, le total et la proportion. Le graphique linéaire relie les proportions dans l’ordre des scores.',
  '{s1} (punteggio {s2}): {s3} su {s4} = {s5}': '{s1} (score {s2}) : {s3} sur {s4} = {s5}',
  'Nessuna proporzione calcolabile con i dati forniti.': 'Aucune proportion calculable avec les données fournies.',
  'Le righe devono avere un ordine numerico plausibile: i punteggi non possono essere scelti dopo aver visto il risultato.': 'Les lignes doivent avoir un ordre numérique plausible : les scores ne peuvent pas être choisis après avoir vu le résultat.',
  'Le osservazioni devono essere indipendenti e ogni riga deve avere un totale positivo.': 'Les observations doivent être indépendantes et chaque ligne doit avoir un total positif.',
  'Il test rileva un trend lineare; un andamento a U può risultare non significativo anche se le proporzioni cambiano.': 'Le test détecte une tendance linéaire ; une tendance en forme de U peut ne pas être significative même si les proportions changent.',
  'Con totali piccoli l’approssimazione χ² è fragile: verifica le frequenze attese e valuta un test esatto.': 'Avec de petits totaux l\'approximation χ² est fragile : vérifiez les fréquences attendues et évaluez un test exact.',
  'Il trend non implica causalità: un punteggio associato alla proporzione può riflettere un altro fattore.': 'La tendance n’implique pas la causalité : un score de proportion peut refléter un autre facteur.',
  'Punteggi arbitrari cambiano la statistica: vanno giustificati prima dell’analisi.': 'Les scores arbitraires modifient les statistiques : ils doivent être justifiés avant analyse.',
  'Il p esatto non è calcolabile per questa tabella.': 'Le p exact n\'est pas calculable pour ce tableau.',
  'Il test esatto rifiuta l’indipendenza (p = {s1}).': 'Le test exact rejette l\'indépendance (p = {s1}).',
  'Il test esatto non rifiuta l’indipendenza (p = {s1}).': 'Le test exact ne rejette pas l\'indépendance (p = {s1}).',
  'Il test esatto calcola il p senza affidarsi all’approssimazione χ²: confronta la tabella osservata con tutte le tabelle che hanno gli stessi margini.': 'Le test exact calcule p sans s\'appuyer sur l\'approximation χ² : il compare le tableau observé avec tous les tableaux ayant les mêmes marges.',
  'È la scelta naturale quando le celle sono piccole o quando la regola di Cochran non è rispettata.': 'C\'est le choix naturel lorsque les cellules sont petites ou lorsque la règle de Cochran n\'est pas respectée.',
  'Il metodo usato è “{s1}”. La statistica Σ|O − E| vale {s2} e il p esatto è {s3}: {s4}': 'La méthode utilisée est « {s1} ». La statistique Σ|O − E| est {s2} et le p exact est {s3} : {s4}',
  'sotto la soglia α = {s1}, quindi l’ipotesi di indipendenza viene rifiutata.': 'en dessous du seuil α = {s1}, alors l’hypothèse d’indépendance est rejetée.',
  'sopra la soglia α = {s1}, quindi l’ipotesi di indipendenza non viene rifiutata.': 'au dessus du seuil α = {s1}, donc l’hypothèse d’indépendance n’est pas rejetée.',
  'La tabella non permette il calcolo esatto: {s1}': 'Le tableau ne permet pas le calcul exact : {s1}',
  'Il numero di tavole con questi margini supera il budget di enumerazione: il p è una stima Monte Carlo deterministica, non un valore esatto.': 'Le nombre de tableaux avec ces marges dépasse le budget de dénombrement : le p est une estimation déterministe de Monte Carlo, pas une valeur exacte.',
  'Per una tabella 2×2 il p è quello di Fisher a due code, che coincide con l’enumerazione esatta delle tavole con margini fissi.': 'Pour un tableau 2 × 2, le p est le p de Fisher bilatéral, qui coïncide avec l\'énumération exacte des tableaux à marges fixes.',
  'Come si legge il p esatto': 'Comment lire le p exact',
  'Il p è la probabilità, sotto indipendenza e con i margini osservati, di ottenere una tabella almeno tanto estrema quanto quella osservata.': 'Le p est la probabilité, sous indépendance et avec marges observées, d\'obtenir un tableau au moins aussi extrême que celui observé.',
  'Non dipende dalla numerosità asintotica: resta valido anche con celle molto piccole, purché l’enumerazione o la simulazione siano affidabili.': 'Elle ne dépend pas de la multiplicité asymptotique : elle reste valable même avec de très petites cellules, tant que le dénombrement ou la simulation est fiable.',
  'Osservazioni indipendenti e categorie esaustive: ogni unità cade in una sola cella.': 'Observations indépendantes et catégories exhaustives : chaque unité est classée dans une seule cellule.',
  'I margini sono trattati come fissi; se il disegno non li fissa, il p esatto va interpretato come condizionale.': 'Les marges sont considérées comme fixes ; si la conception ne les corrige pas, le p exact doit être interprété comme conditionnel.',
  'Con molte categorie il numero di tavole cresce rapidamente: oltre il budget il risultato diventa una stima Monte Carlo.': 'Avec de nombreuses catégories, le nombre de tableaux augmente rapidement : au-delà du budget, le résultat devient une estimation Monte Carlo.',
  'Il test esatto dice se c’è associazione, non quanto sia forte né in quale direzione: usa residui e misure di associazione.': 'Le test exact indique s\'il existe une association, mais non sa force ou sa direction : il utilise des résidus et des mesures d\'association.',
  'Con tabelle molto grandi l’enumerazione è sostituita da una simulazione: riporta sempre il metodo usato.': 'Dans les très grands tableaux, l\'énumération est remplacée par une simulation : elle rend toujours compte de la méthode utilisée.',
};
