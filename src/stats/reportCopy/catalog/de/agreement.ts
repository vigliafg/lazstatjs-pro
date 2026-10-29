/** de: report and table prose (normalised). */
export const agreementCopy: Record<string, string> = {
  '{s1} coppie · CI {s2}%': '{s1} Paare · KI {s2} %',
  '{s1} soggetti × {s2} misure · CI {s3}%':
    '{s1} Personen × {s2} Messungen · KI {s3} %',
  '{s1} soggetti × {s2} rater · {s3} categorie · CI {s4}%':
    '{s1} Personen × {s2} Beurteiler · {s3} Kategorien · KI {s4} %',
  'Accordo atteso': 'Erwartete Übereinstimmung',
  'Accordo debole': 'Schwache Übereinstimmung',
  'Accordo moderato': 'Mäßige Übereinstimmung',
  'Accordo osservato': 'Beobachtete Übereinstimmung',
  'Accordo osservato = {s1}; accordo atteso per caso = {s2}.':
    'Beobachtete Übereinstimmung = {s1}; zufällig erwartete Übereinstimmung = {s2}.',
  'Accordo quasi perfetto': 'Nahezu perfekte Übereinstimmung',
  'Accordo sostanziale': 'Substanzielle Übereinstimmung',
  'Affidabilità bassa': 'Geringe Reliabilität',
  'Affidabilità buona': 'Gute Reliabilität',
  'Affidabilità moderata': 'Mittlere Reliabilität',
  Bias: 'Bias',
  'bias + 1.96·SD': 'Bias + 1.96·SD',
  'Bias = {s1} (CI {s2}%: {s3} – {s4}).':
    'Bias = {s1} (KI {s2} %: {s3} – {s4}).',
  'bias − 1.96·SD': 'Bias − 1.96·SD',
  'Bias contenuto': 'Bias gering',
  'Bias da valutare': 'Bias zu prüfen',
  'bias proporzionale': 'proportionaler Bias',
  'Bland–Altman': 'Bland–Altman',
  'CI bias high': 'KI Bias oben',
  'CI bias low': 'KI Bias unten',
  'CI high': 'KI oben',
  'CI limite inf. high': 'KI untere Grenze oben',
  'CI limite inf. low': 'KI untere Grenze unten',
  'CI limite sup. high': 'KI obere Grenze oben',
  'CI limite sup. low': 'KI obere Grenze unten',
  'CI low': 'KI unten',
  'Cohen kappa': 'Cohen-Kappa',
  'Con due rater viene usato Cohen kappa; le discordanze possono essere pesate se le categorie sono ordinate.':
    'Bei zwei Beurteilern wird Cohen-Kappa verwendet; Abweichungen können gewichtet werden, wenn die Kategorien geordnet sind.',
  'Con più di due rater viene usato Fleiss kappa; le discordanze tra rater non sono pesate.':
    'Bei mehr als zwei Beurteilern wird Fleiss-Kappa verwendet; Abweichungen zwischen den Beurteilern werden nicht gewichtet.',
  Dettaglio: 'Detail',
  'dispersione delle differenze': 'Streuung der Differenzen',
  F: 'F',
  'Fleiss kappa': 'Fleiss-Kappa',
  'H0: pendenza = 0': 'H0: Steigung = 0',
  'I limiti di accordo non sono limiti di confidenza: descrivono la variabilità individuale.':
    'Die Übereinstimmungsgrenzen sind keine Konfidenzgrenzen: Sie beschreiben die individuelle Variabilität.',
  'I limiti di accordo sono stimati come bias ± 1.96·SD; i loro CI usano l’approssimazione sqrt(3·SD²/n).':
    'Die Übereinstimmungsgrenzen werden als Bias ± 1.96·SD geschätzt; ihre KI verwenden die Näherung sqrt(3·SD²/n).',
  'ICC vicino a 1 indica che le misure sono intercambiabili; valori sotto 0,5 indicano che la variabilità tra soggetti non è distinguibile dall’errore di misura.':
    'Ein ICC nahe 1 bedeutet, dass die Messungen austauschbar sind; Werte unter 0,5 bedeuten, dass die Variabilität zwischen den Personen nicht von der Streuung durch Messfehler zu unterscheiden ist.',
  'ICC(1,1) one-way': 'ICC(1,1) einfaktoriell',
  'ICC(2,1) = {s1} su {s2} misure e {s3} soggetti.':
    'ICC(2,1) = {s1} bei {s2} Messungen und {s3} Personen.',
  'ICC(2,1) absolute agreement': 'ICC(2,1) absolute Übereinstimmung',
  'ICC(2,1) è il modello two-way random a effetti misti con accordo assoluto.':
    'ICC(2,1) ist das zweifaktorielle Random-Effects-Modell mit absoluter Übereinstimmung.',
  'ICC(3,1) consistency': 'ICC(3,1) Konsistenz',
  'ICC(3,1) di consistenza = {s1}; F = {s2}, p = {s3}.':
    'ICC(3,1) der Konsistenz = {s1}; F = {s2}, p = {s3}.',
  'ICC(3,1) ignora la differenza sistematica tra rater (consistency).':
    'ICC(3,1) ignoriert den systematischen Unterschied zwischen Beurteilern (Konsistenz).',
  'Il bias è la differenza media sistematica; i limiti di accordo descrivono quanto le due misure possono divergere per un singolo soggetto.':
    'Der Bias ist die systematische mittlere Differenz; die Übereinstimmungsgrenzen beschreiben, wie weit die beiden Messungen bei einer einzelnen Person auseinanderliegen können.',
  'Il livello di confidenza richiesto è {s1}%, ma l’ICC è un indice descrittivo: non c’è un test di superiorità.':
    'Das geforderte Konfidenzniveau beträgt {s1} %, aber der ICC ist ein deskriptiver Index: Es gibt keinen Überlegenheitstest.',
  'Intraclass correlation': 'Intraklassenkorrelation',
  Kappa: 'Kappa',
  'Kappa = {s1} (CI {s2}%: {s3} – {s4}).':
    'Kappa = {s1} (KI {s2} %: {s3} – {s4}).',
  'Kappa corregge l’accordo osservato per quello atteso dal caso. Le soglie 0,4/0,6/0,8 sono convenzioni, non leggi.':
    'Kappa korrigiert die beobachtete Übereinstimmung um die zufällig erwartete. Die Schwellen 0,4/0,6/0,8 sind Konventionen, keine Naturgesetze.',
  'Kappa è sensibile alla prevalenza delle categorie e al numero di categorie.':
    'Kappa ist empfindlich gegenüber der Prävalenz der Kategorien und der Zahl der Kategorien.',
  'Kappa non pesata: tutte le discordanze contano allo stesso modo.':
    'Ungewichtetes Kappa: Alle Abweichungen zählen gleich.',
  'Kappa pesata {s1} sulle categorie ordinate.':
    'Gewichtetes Kappa {s1} über die geordneten Kategorien.',
  'L’ICC dipende dalla variabilità del campione: un campione ristretto può gonfiarlo.':
    'Der ICC hängt von der Variabilität der Stichprobe ab: Eine eingeschränkte Stichprobe kann ihn aufblähen.',
  'La pendenza è significativa: il bias non è costante e cresce o cala con il livello della misura.':
    'Die Steigung ist signifikant: Der Bias ist nicht konstant und steigt oder fällt mit dem Niveau der Messung.',
  'Limite inferiore': 'Untere Grenze',
  'Limite superiore': 'Obere Grenze',
  'Limiti di accordo: {s1} – {s2}.': 'Übereinstimmungsgrenzen: {s1} – {s2}.',
  'media delle differenze': 'Mittelwert der Differenzen',
  Metrica: 'Metrik',
  'MS between raters': 'MS zwischen Beurteilern',
  'MS between subjects': 'MS zwischen Personen',
  'MS residual': 'MS Residuen',
  'Non c’è evidenza di un bias proporzionale al livello della misura.':
    'Es gibt keinen Hinweis auf einen zum Messniveau proportionalen Bias.',
  p: 'p',
  'p = {s1} contro kappa = 0.': 'p = {s1} gegen Kappa = 0.',
  'p pendenza': 'p der Steigung',
  'Pendenza del bias sulla media = {s1} (p = {s2}).':
    'Steigung des Bias gegenüber dem Mittelwert = {s1} (p = {s2}).',
  'Pendenza su media': 'Steigung über dem Mittelwert',
  'Report Bland–Altman': 'Bland–Altman-Bericht',
  'Report di accordo categorico': 'Bericht zur kategorialen Übereinstimmung',
  'Report di affidabilità': 'Zuverlässigkeitsbericht',
  'SD differenze': 'SD der Differenzen',
  SE: 'SE',
  'Una pendenza significativa indica che il bias cambia con la grandezza della misura.':
    'Eine signifikante Steigung zeigt, dass sich der Bias mit der Größe der Messung ändert.',
  Valore: 'Wert',
  z: 'z',
};
