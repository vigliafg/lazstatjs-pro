/** fr: report and table prose (normalised). */
export const factorialCopy: Record<string, string> = {
  ' · con interazione':
    ' · avec interaction',
  ' · solo effetti principali':
    ' · effets principaux seulement',
  '{s1} × {s2}':
    '{s1} × {s2}',
  '{s1} combinazioni · {s2}':
    '{s1} combinaisons · {s2}',
  '{s1} effetto/i {s2} al livello {s3}.':
    '{s1} effet(s) {s2} au seuil {s3}.',
  '{s1} x {s2}{s3} · N = {s4}':
    '{s1} x {s2}{s3} · N = {s4}',
  '{s1}: F({s2}, {s3}) = {s4}, {s5}, η² parziale = {s6}':
    '{s1} : F({s2}, {s3}) = {s4}, {s5}, η² partiel = {s6}',
  '{s1}: η² parziale = {s2}, ω² = {s3}':
    '{s1} : η² partiel = {s2}, ω² = {s3}',
  '{s1}\\\\u0000{s2}':
    '{s1}\\u0000{s2}',
  'ANOVA a due fattori':
    'ANOVA à deux facteurs',
  'Assunzioni e diagnostica':
    'Hypothèses et diagnostics',
  'Celle con N = 1':
    'Cellules avec N = 1',
  'Con celle singole la variabilità interna non è stimabile e il test non è calcolabile.':
    'Avec des cellules uniques, la variabilité interne n’est pas estimable et le test n’est pas calculable.',
  'Con una cella per combinazione il disegno non è stimabile: servono repliche.':
    'Avec une cellule par combinaison, le plan n’est pas estimable : il faut des réplicats.',
  'Cosa non dice il test':
    'Ce que le test ne dit pas',
  'Dati insufficienti per stimare il modello.':
    'Données insuffisantes pour estimer le modèle.',
  'deviazione standard dei residui':
    'écart-type des résidus',
  'df':
    'dl',
  'Diagnostica del modello':
    'Diagnostics du modèle',
  'disegno bilanciato':
    'plan équilibré',
  'disegno non bilanciato':
    'plan non équilibré',
  'è significativo':
    'est significatif',
  'Effetti significativi':
    'Effets significatifs',
  'F':
    'F',
  'F = {s1}, df = {s2}, {s3}: {s4}':
    'F = {s1}, dl = {s2}, {s3} : {s4}',
  'F = MS_effetto / MS_residui, con df residui = {s1} (N − numero di celle).':
    'F = MS_effet / MS_résidus, avec dl résiduels = {s1} (N − nombre de cellules).',
  'Il modello è additivo a due fattori: non gestisce blocchi, covariate, misure ripetute o tre fattori.':
    'Le modèle est additif à deux facteurs : il ne gère ni blocs, ni covariables, ni mesures répétées, ni trois facteurs.',
  'Il modello spiega {s1} delle {s2} unità di SS totale; il resto sono i residui.':
    'Le modèle explique {s1} des {s2} unités de SS totale ; le reste correspond aux résidus.',
  'Interazione presente':
    'Interaction présente',
  'L’ANOVA a due fattori separa la variabilità della risposta in tre pezzi: quanto dipende dal primo fattore, quanto dal secondo e quanto dalla loro combinazione.':
    'L’ANOVA à deux facteurs sépare la variabilité de la réponse en trois parts : ce qui dépend du premier facteur, ce qui dépend du second et ce qui dépend de leur combinaison.',
  'L’interazione {s1} è significativa: l’effetto di un fattore dipende dal livello dell’altro.':
    'L’interaction {s1} est significative : l’effet d’un facteur dépend du niveau de l’autre.',
  'L’interazione è significativa ({s1}): gli effetti principali non vanno letti da soli, perché l’effetto di ciascun fattore cambia a seconda del livello dell’altro. Guarda le medie per cella e il grafico: le linee non parallele sono la firma dell’interazione.':
    'L’interaction est significative ({s1}) : les effets principaux ne doivent pas être lus seuls, car l’effet de chaque facteur change selon le niveau de l’autre. Regardez les moyennes par cellule et le graphique : des lignes non parallèles sont la signature de l’interaction.',
  'L’interazione non è significativa: gli effetti dei due fattori possono essere letti separatamente, come se agissero in modo additivo.':
    'L’interaction n’est pas significative : les effets des deux facteurs peuvent être lus séparément, comme s’ils agissaient de façon additive.',
  'L’ipotesi nulla di ogni riga è “nessun effetto”: se il p scende sotto la soglia, quel termine spiega più variabilità di quanto il caso saprebbe produrre.':
    'L’hypothèse nulle de chaque ligne est « aucun effet » : si la p descend sous le seuil, ce terme explique plus de variabilité que le hasard ne saurait en produire.',
  'La lettura dei risultati':
    'La lecture des résultats',
  'Le somme dei quadrati sono sequenziali (Type I) nell’ordine indicato: in un disegno bilanciato coincidono con le Type III.':
    'Les sommes des carrés sont séquentielles (Type I) dans l’ordre indiqué : dans un plan équilibré, elles coïncident avec les Type III.',
  'Le SS sequenziali dipendono dall’ordine dei termini quando il disegno non è bilanciato; in quel caso un software che riporta Type III può dare numeri diversi.':
    'Les SS séquentielles dépendent de l’ordre des termes lorsque le plan n’est pas équilibré ; dans ce cas, un logiciel qui rapporte des Type III peut donner des nombres différents.',
  'Lettura':
    'Lecture',
  'Levene (celle)':
    'Levene (cellules)',
  'Levene sulle celle: p = {s1}. Se è sotto 0,05 le varianze non sono omogenee e l’F può essere distorto, soprattutto con gruppi di dimensione diversa.':
    'Levene sur les cellules : p = {s1}. Si elle est inférieure à 0,05, les variances ne sont pas homogènes et le F peut être biaisé, surtout avec des groupes de tailles différentes.',
  'Lilliefors (residui)':
    'Lilliefors (résidus)',
  'Lilliefors sui residui: p = {s1}. Con residui non normali valuta una trasformazione (log, radice) o un’analisi per ranghi.':
    'Lilliefors sur les résidus : p = {s1}. Avec des résidus non normaux, envisagez une transformation (log, racine) ou une analyse sur les rangs.',
  'Livello di confidenza scelto: {s1}% (usato nel report).':
    'Niveau de confiance choisi : {s1} % (utilisé dans le rapport).',
  'Media':
    'Moyenne',
  'Medie marginali · {s1}':
    'Moyennes marginales · {s1}',
  'Medie per cella':
    'Moyennes par cellule',
  'Metrica':
    'Métrique',
  'MS':
    'MS',
  'N':
    'N',
  'Nessun effetto':
    'Aucun effet',
  'Nessun effetto raggiunge la significatività al livello {s1}.':
    'Aucun effet n’atteint la significativité au seuil {s1}.',
  'Osservazioni indipendenti: nessuna struttura di misure ripetute o di blocchi è modellata qui.':
    'Observations indépendantes : aucune structure de mesures répétées ou de blocs n’est modélisée ici.',
  'p':
    'p',
  'p < 0.001':
    'p < 0.001',
  'p = {s1}':
    'p = {s1}',
  'penalizza il numero di parametri':
    'pénalise le nombre de paramètres',
  'Quanto pesa ogni effetto':
    'Le poids de chaque effet',
  'quota di variabilità spiegata dal modello':
    'part de variabilité expliquée par le modèle',
  'R²':
    'R²',
  'R² = {s1}: il modello spiega questa quota della variabilità totale.':
    'R² = {s1} : le modèle explique cette part de la variabilité totale.',
  'R² aggiustato':
    'R² ajusté',
  'Report di lettura':
    'Rapport de lecture',
  'residui compatibili con la normalità':
    'résidus compatibles avec la normalité',
  'residui non normali: valuta la trasformazione':
    'résidus non normaux : envisagez la transformation',
  'RMSE':
    'RMSE',
  'SD':
    'SD',
  'Sono le medie che alimentano il grafico dell’interazione: se le linee non sono parallele, l’effetto di un fattore cambia a seconda del livello dell’altro.':
    'Ce sont les moyennes qui alimentent le graphique de l’interaction : si les lignes ne sont pas parallèles, l’effet d’un facteur change selon le niveau de l’autre.',
  'sono significativi':
    'sont significatifs',
  'Sorgente':
    'Source',
  'SS':
    'SS',
  'una cella con una sola osservazione non permette di stimare la variabilità interna':
    'une cellule avec une seule observation ne permet pas d’estimer la variabilité interne',
  'Una F significativa dice che almeno una media differisce, non quale coppia: per quello servono i confronti post-hoc. E nessuna F stabilisce la direzione causale degli effetti.':
    'Une F significative dit qu’au moins une moyenne diffère, pas quelle paire : pour cela, il faut les comparaisons post-hoc. Et aucune F n’établit la direction causale des effets.',
  'Valore':
    'Valeur',
  'varianze compatibili':
    'variances compatibles',
  'varianze non omogenee':
    'variances non homogènes',
  'η² parziale':
    'η² partiel',
  'η² parziale = SS_effetto / (SS_effetto + SS_residui): quota di variabilità non spiegata dal resto del modello.':
    'η² partiel = SS_effet / (SS_effet + SS_résidus) : part de variabilité non expliquée par le reste du modèle.',
  'η² parziale dice quale quota della variabilità residua (dopo gli altri termini) spiega quel termine: 0,01 è piccolo, 0,06 medio, 0,14 grande secondo i riferimenti di Cohen. ω² corregge il bias verso l’alto e può essere più piccolo, soprattutto con pochi df.':
    'L’η² partiel indique quelle part de la variabilité résiduelle (après les autres termes) ce terme explique : 0,01 est petit, 0,06 moyen, 0,14 grand selon les repères de Cohen. ω² corrige le biais vers le haut et peut être plus petit, surtout avec peu de dl.',
  'ω²':
    'ω²',
};
