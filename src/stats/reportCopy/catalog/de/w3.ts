/** German: W3 report and table prose (GLMM). */
export const w3Copy: Record<string, string> = {
  'Binomiale':
    'Binomial',
  'BLUP di intercetta e pendenza':
    'BLUP für Achsenabschnitt und Steigung',
  'CI {s1}% · z di Wald':
    'KI {s1}% · Wald-z',
  'Con pochi gruppi le componenti di varianza sono instabili e l’ICC va letto con prudenza.':
    'Bei wenigen Gruppen sind die Varianzkomponenten instabil, und der ICC ist mit Vorsicht zu lesen.',
  'Con pochi punti per gruppo la stima della pendenza casuale è instabile e può collassare verso zero.':
    'Bei wenigen Punkten pro Gruppe ist die Schätzung der zufälligen Steigung instabil und kann gegen null kollabieren.',
  'Convergenza non raggiunta: le stime non sono affidabili.':
    'Konvergenz nicht erreicht: Die Schätzungen sind nicht zuverlässig.',
  'Convergenza raggiunta.':
    'Konvergenz erreicht.',
  'Correlazione':
    'Korrelation',
  'Correlazione (intercetta–pendenza)':
    'Korrelation (Achsenabschnitt–Steigung)',
  'Covarianza':
    'Kovarianz',
  'Covarianza (intercetta–pendenza)':
    'Kovarianz (Achsenabschnitt–Steigung)',
  'Effetti casuali per gruppo':
    'Zufällige Effekte nach Gruppe',
  'Famiglia {s1} · link {s2} · effetti casuali per {s3}':
    'Familie {s1} · Link {s2} · zufällige Effekte für {s3}',
  'Gaussiana':
    'Gauß',
  'Gli effetti casuali sono assunti normali e la verosimiglianza è approssimata: AIC e BIC vanno confrontati solo tra modelli con la stessa risposta e struttura.':
    'Die zufälligen Effekte werden als normalverteilt angenommen und die Likelihood ist approximiert: AIC und BIC sollten nur zwischen Modellen mit derselben Antwort und Struktur verglichen werden.',
  'Gruppi con pochi casi sono stimati con maggiore incertezza: la colonna N aiuta a pesare la lettura.':
    'Gruppen mit wenigen Fällen werden mit größerer Unsicherheit geschätzt: Die Spalte N hilft, die Lesart zu gewichten.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso: i gruppi con pochi casi sono tirati verso la media generale.':
    'BLUPs sind gruppenkonditionale Schätzungen mit Schrumpfung zum festen Effekt: Gruppen mit wenigen Fällen werden zum Gesamtmittelwert hin gezogen.',
  'I BLUP sono stime condizionate al gruppo, con contrazione verso l’effetto fisso (shrinkage).':
    'BLUPs sind gruppenkonditionale Schätzungen mit Schrumpfung zum festen Effekt (Shrinkage).',
  'I BLUP sono stime condizionate al gruppo: la loro variabilità non va confrontata con i coefficienti fissi.':
    'BLUPs sind gruppenkonditionale Schätzungen: Ihre Variabilität darf nicht mit den festen Koeffizienten verglichen werden.',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi; la pendenza di {s3} varia tra gruppi (varianza {s4}).':
    'ICC = {s1}: {s2}% der Variabilität liegt zwischen den Gruppen; die Steigung von {s3} variiert zwischen den Gruppen (Varianz {s4}).',
  'I coefficienti fissi sono sulla scala del link: con logit B è un log-odds, con log è una differenza di log-medie, con identity coincide con la scala della risposta.':
    'Die festen Koeffizienten liegen auf der Link-Skala: Bei Logit ist B ein Log-Odds, bei Log eine Differenz von Log-Mittelwerten, bei Identity entspricht sie der Skala der Antwort.',
  'Identità':
    'Identität',
  'Il modello assume normalità degli effetti casuali e residui omoschedastici.':
    'Das Modell setzt normalverteilte zufällige Effekte und homoskedastische Residuen voraus.',
  'Il modello non ha raggiunto la convergenza: le stime degli effetti e delle varianze non sono affidabili.':
    'Das Modell hat die Konvergenz nicht erreicht: Die Schätzungen der Effekte und Varianzen sind nicht zuverlässig.',
  'Il modello stima un’intercetta e una pendenza per ogni gruppo, trattandole come estrazioni da una popolazione normale.':
    'Das Modell schätzt einen Achsenabschnitt und eine Steigung für jede Gruppe und behandelt sie als Stichproben aus einer normalen Population.',
  'Il motore copre famiglie gaussiana, binomiale e Poisson con un solo fattore di raggruppamento e al più una pendenza casuale.':
    'Die Engine deckt die Familien Gauß, Binomial und Poisson mit einem einzigen Gruppierungsfaktor und höchstens einer zufälligen Steigung ab.',
  'Il test z è asintotico: con pochi gruppi i gradi di libertà effettivi sono incerti.':
    'Der z-Test ist asymptotisch: Bei wenigen Gruppen sind die effektiven Freiheitsgrade unsicher.',
  'Il test z è asintotico: non usa gradi di libertà Satterthwaite o Kenward–Roger.':
    'Der z-Test ist asymptotisch: Er verwendet keine Satterthwaite- oder Kenward–Roger-Freiheitsgrade.',
  'Il test z è di Wald: con gruppi piccoli l’approssimazione può divergere dal test di verosimiglianza.':
    'Der z-Test ist ein Wald-Test: Bei kleinen Gruppen kann die Näherung vom Likelihood-Verhältnistest abweichen.',
  'Intercetta':
    'Achsenabschnitt',
  'La covarianza tra intercetta e pendenza descrive se i gruppi che partono più alti tendono a crescere più o meno rapidamente.':
    'Die Kovarianz zwischen Achsenabschnitt und Steigung beschreibt, ob Gruppen, die höher starten, tendenziell schneller oder langsamer wachsen.',
  'La pendenza media è un effetto fisso; la sua variabilità tra gruppi è un effetto casuale.':
    'Die mittlere Steigung ist ein fester Effekt; ihre Variabilität zwischen den Gruppen ist ein zufälliger Effekt.',
  'La verosimiglianza è approssimata con Laplace: con gruppi piccoli o risposte estreme l’approssimazione può essere imprecisa.':
    'Die Likelihood wird mit Laplace approximiert: Bei kleinen Gruppen oder extremen Antworten kann die Näherung ungenau sein.',
  'Le varianze sono sulla scala del predittore lineare: per binomiale e Poisson non sono componenti di varianza della risposta osservata.':
    'Die Varianzen liegen auf der Skala des linearen Prädiktors: Bei Binomial und Poisson sind sie keine Varianzkomponenten der beobachteten Antwort.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: un ICC alto indica che ignorare il gruppo sottostima l’errore standard degli effetti fissi.':
    'Der ICC ist der Anteil der Varianz, der den Gruppen zuzuschreiben ist: Ein hoher ICC zeigt, dass das Ignorieren der Gruppe den Standardfehler der festen Effekte unterschätzt.',
  'L’ICC è la quota di varianza attribuibile ai gruppi: valori alti indicano osservazioni molto correlate entro gruppo.':
    'Der ICC ist der Anteil der Varianz, der den Gruppen zuzuschreiben ist: Hohe Werte zeigen Beobachtungen, die innerhalb einer Gruppe stark korreliert sind.',
  'Log':
    'Log',
  'Logit':
    'Logit',
  'Modello lineare misto con pendenza casuale':
    'Lineares gemischtes Modell mit zufälliger Steigung',
  'Nella famiglia binomiale la separazione (esiti perfettamente separati) rende le stime instabili o divergenti.':
    'In der Binomialfamilie macht die Separation (perfekt getrennte Ergebnisse) die Schätzungen instabil oder divergent.',
  'Non estrapolare oltre i livelli osservati dei predittori né a gruppi nuovi non rappresentati nel campione.':
    'Nicht über die beobachteten Prädiktorstufen hinaus und nicht auf neue, in der Stichprobe nicht vertretene Gruppen extrapolieren.',
  'Pendenza':
    'Steigung',
  'Poisson':
    'Poisson',
  'Report del modello misto con pendenza casuale':
    'Bericht zum gemischten Modell mit zufälliger Steigung',
  'Report di lettura — Modello lineare generalizzato misto':
    'Lesebericht — Generalisiertes lineares gemischtes Modell',
  'Rispetto al GLM, il GLMM aggiunge effetti casuali che assorbono la correlazione entro gruppo; rispetto al LMM, estende il modello a risposte non normali tramite famiglia e link.':
    'Gegenüber dem GLM fügt das GLMM zufällige Effekte hinzu, die die Korrelation innerhalb der Gruppen absorbieren; gegenüber dem LMM erweitert es das Modell über Familie und Link auf nicht normale Antworten.',
  '{s1} ~ {s2} + (1 + {s3} | {s4}) · CI {s5}%':
    '{s1} ~ {s2} + (1 + {s3} | {s4}) · KI {s5}%',
  '{s1} ~ {s2} · effetti casuali per {s3} · CI {s4}%':
    '{s1} ~ {s2} · zufällige Effekte für {s3} · KI {s4}%',
  '{s1} gruppi hanno effetti casuali stimati (BLUP); famiglia {s2}, link {s3}.':
    '{s1} Gruppen haben geschätzte zufällige Effekte (BLUPs); Familie {s2}, Link {s3}.',
  '{s1} gruppi · pendenza casuale su {s2}':
    '{s1} Gruppen · zufällige Steigung über {s2}',
  '{s1}: nessun predittore risulta significativo al livello scelto, con effetti casuali per {s2}; ICC = {s3}.':
    '{s1}: Kein Prädiktor ist auf dem gewählten Niveau signifikant, mit zufälligen Effekten für {s2}; ICC = {s3}.',
  '{s1} predittore/i su {s2} risultano significativi al livello di confidenza del {s3}%.':
    '{s1} Prädiktor(en) von {s2} sind auf dem {s3}%-Konfidenzniveau signifikant.',
  '{s1} spiegato da {s2} predittore/i con effetti casuali per {s3}; ICC = {s4}.':
    '{s1} erklärt durch {s2} Prädiktor(en) mit zufälligen Effekten für {s3}; ICC = {s4}.',
  'SE intercetta':
    'SE Achsenabschnitt',
  'SE pendenza':
    'SE Steigung',
  'Servono almeno 5–10 gruppi per stimare una varianza di pendenza con una precisione accettabile.':
    'Mindestens 5–10 Gruppen sind nötig, um eine Steigungsvarianz mit akzeptabler Präzision zu schätzen.',
  'Stima di massima verosimiglianza con effetti casuali normali e residui omoschedastici.':
    'Maximum-Likelihood-Schätzung mit normalen zufälligen Effekten und homoskedastischen Residuen.',
  'Una varianza di pendenza vicina a zero indica che i gruppi crescono allo stesso modo; una correlazione positiva indica che i gruppi con intercetta più alta tendono ad avere pendenze più ripide.':
    'Eine Steigungsvarianz nahe null zeigt, dass die Gruppen gleich wachsen; eine positive Korrelation zeigt, dass Gruppen mit höherem Achsenabschnitt tendenziell steilere Steigungen haben.',
  'Una varianza stimata al bordo (vicina a zero) o una correlazione vicina a ±1 segnala un modello al limite dello spazio dei parametri.':
    'Eine am Rand geschätzte Varianz (nahe null) oder eine Korrelation nahe ±1 weist auf ein Modell an der Grenze des Parameterraums hin.',
  'Un GLMM serve quando le osservazioni sono raggruppate: dentro lo stesso gruppo le misure si somigliano e i residui non sono indipendenti.':
    'Ein GLMM ist nötig, wenn Beobachtungen gruppiert sind: Innerhalb derselben Gruppe ähneln sich die Messungen, und die Residuen sind nicht unabhängig.',
  'Varianza della pendenza = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Varianz der Steigung = {s1}; Korrelation Achsenabschnitt–Steigung = {s2}.',
  'Varianza della pendenza casuale = {s1}; correlazione intercetta–pendenza = {s2}.':
    'Varianz der zufälligen Steigung = {s1}; Korrelation Achsenabschnitt–Steigung = {s2}.',
  'Varianza dell’intercetta casuale = {s1}; ICC = {s2}: il {s3}% della variabilità è attribuibile ai gruppi.':
    'Varianz des zufälligen Achsenabschnitts = {s1}; ICC = {s2}: {s3}% der Variabilität ist den Gruppen zuzuschreiben.',
  'Varianza pendenza':
    'Varianz Steigung',
  'Test degli effetti fissi': 'Tests der festen Effekte',
  'ChiSquare': 'Chi-Quadrat',
  'Con predittori a una colonna il test è il quadrato dello z: il p-value coincide con quello della tabella dei coefficienti.': 'Bei einspaltigen Prädiktoren ist der Test das Quadrat von z; der p-Wert entspricht der Koeffiziententabelle.',
  'La tabella delle componenti di varianza riporta SE e CI di Wald su scala log: un intervallo ampio dice che servono piu gruppi per una stima stabile.': 'Die Tabelle der Varianzkomponenten enthält einen Standardfehler und ein Wald-KI auf der Log-Skala: ein breites Intervall zeigt, dass mehr Gruppen für eine stabile Schätzung nötig sind.',
  'I test degli effetti fissi riportano il Wald per termine: con una sola colonna per termine coincide con lo z al quadrato.': 'Die Tests der festen Effekte geben den Wald-Test je Termin an: bei einer Spalte je Termin entspricht er dem quadrierten z.',
  'Wald per termine · CI {s1}%': 'Wald je Termin · {s1}% KI',
  'Wald per termine · df {s1} · {s2}': 'Wald je Termin · df {s1} · {s2}',
};
