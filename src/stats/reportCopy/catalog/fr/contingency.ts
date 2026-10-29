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
};
