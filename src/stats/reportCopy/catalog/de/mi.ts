/** de: report and table prose (normalised). */
export const miCopy: Record<string, string> = {
  '{s1} celle imputate con {s2} dataset; FMI massimo {s3}.':
    '{s1} Zellen mit {s2} Datensätzen imputiert; maximaler FMI {s3}.',
  '{s1} righe · {s2} imputazioni · {s3} iterazioni':
    '{s1} Zeilen · {s2} Imputationen · {s3} Iterationen',
  '% mancante': '% fehlend',
  'CI {s1}%': 'CI {s1} %',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'Coefficienti pooled con regole di Rubin; R² è la media delle imputazioni.':
    'Gepoolte Koeffizienten nach den Rubin-Regeln; R² ist der Mittelwert über die Imputationen.',
  'Con poche osservazioni o variabili molto correlate il modello di imputazione può essere instabile.':
    'Bei wenigen Beobachtungen oder stark korrelierten Variablen kann das Imputationsmodell instabil sein.',
  'Dati mancanti': 'Fehlende Daten',
  'df Rubin': 'Rubin-df',
  FMI: 'FMI',
  'Il livello di confidenza delle stime pooled è {s1}%.':
    'Das Konfidenzniveau der gepoolten Schätzungen beträgt {s1} %.',
  'Imputazione stabile': 'Stabile Imputation',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle altre variabili.':
    'Die Imputation setzt fehlende Daten als zufällig (MAR) bedingt auf die anderen Variablen voraus.',
  'La frazione di informazione mancante è contenuta: le stime sono relativamente stabili.':
    'Der Anteil fehlender Information ist gering: Die Schätzungen sind relativ stabil.',
  'Le stime pooled combinano la variabilità dentro e tra le imputazioni: i CI tengono conto dell’incertezza dovuta ai dati mancanti.':
    'Die gepoolten Schätzungen kombinieren die Variabilität innerhalb und zwischen den Imputationen: Die CI berücksichtigen die Unsicherheit durch die fehlenden Daten.',
  'Le stime pooled qui riportate riguardano media e SD, non modelli di regressione completi.':
    'Die hier berichteten gepoolten Schätzungen betreffen Mittelwert und SD, nicht vollständige Regressionsmodelle.',
  'Le variabili selezionate vengono imputate con un modello lineare sulle altre variabili.':
    'Die ausgewählten Variablen werden mit einem linearen Modell auf den anderen Variablen imputiert.',
  Mancanti: 'Fehlend',
  Media: 'Mittelwert',
  'Modello di imputazione: regressione lineare a catene, {s1} iterazioni per dataset.':
    'Imputationsmodell: lineare Regression mit Ketten, {s1} Iterationen pro Datensatz.',
  'Modello lineare pooled: R² medio = {s1} su {s2} predittori.':
    'Gepooltes lineares Modell: mittleres R² = {s1} bei {s2} Prädiktoren.',
  'Molte informazioni mancanti': 'Viele fehlende Informationen',
  'Nessun modello di regressione pooled richiesto.':
    'Kein gepooltes Regressionsmodell angefordert.',
  Osservati: 'Beobachtet',
  p: 'p',
  'Pooling di Rubin: varianza totale = varianza within + (1 + 1/m)·varianza between.':
    'Rubin-Pooling: Gesamtvarianz = Within-Varianz + (1 + 1/m)·Between-Varianz.',
  'R² medio = {s1} · {s2}% CI': 'Mittleres R² = {s1} · CI {s2} %',
  'Regressione pooled': 'Gepoolte Regression',
  'Report di imputazione multipla': 'Bericht zur multiplen Imputation',
  'SD pooled': 'Gepoolte SD',
  SE: 'SE',
  'Stime pooled (Rubin)': 'Gepoolte Schätzungen (Rubin)',
  t: 't',
  Termine: 'Term',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza: interpreta le stime con cautela.':
    'Ein hoher FMI zeigt, dass die fehlenden Daten die Unsicherheit dominieren: Interpretieren Sie die Schätzungen mit Vorsicht.',
  Variabile: 'Variable',
  'Variabili: {s1}.': 'Variablen: {s1}.',
  β: 'β',
  'Riepilogo per variabile': 'Zusammenfassung je Variable',
  'Codici osservati': 'Beobachtete Codes',
  'Le variabili categoriche sono imputate con una regressione logistica (due categorie) o multinomiale (più categorie) sulle altre variabili e sulle covariabili numeriche.': 'Kategoriale Variablen werden mit logistischer Regression (zwei Kategorien) oder multinomialer Regression (mehr als zwei) auf die anderen Variablen und die numerischen Kovariablen imputiert.',
  'Le categorie sono i codici interi osservati, ordinati numericamente; l’imputazione non può produrre codici nuovi.': 'Kategorien sind die beobachteten ganzzahligen Codes, numerisch sortiert; die Imputation kann keine neuen Codes erzeugen.',
  'Conteggi osservati e completati per categoria': 'Beobachtete und vervollständigte Häufigkeiten je Kategorie',
  'Dopo l’ultima delle {s1} imputazioni': 'Nach der letzten der {s1} Imputationen',
  'Completati': 'Vervollständigt',
  'Prop. osservata': 'Beob. Anteil',
  'Prop. completata': 'Vervollst. Anteil',
  'I conteggi completati sono quelli dell’ultimo dataset imputato: servono a confrontare la distribuzione osservata con quella ricostruita.': 'Die vervollständigten Häufigkeiten stammen aus dem letzten imputierten Datensatz: Sie vergleichen die beobachtete Verteilung mit der rekonstruierten.',
  'Una differenza sistematica tra proporzione osservata e completata segnala che il modello di imputazione sta spostando la distribuzione.': 'Eine systematische Differenz zwischen beobachteten und vervollständigten Anteilen zeigt an, dass das Imputationsmodell die Verteilung verschiebt.',
  'Proporzioni pooled (Rubin)': 'Gepoolte Anteile (Rubin)',
  'CI {s1}% · pooling sulle {s2} imputazioni': 'CI {s1} % · Pooling über {s2} Imputationen',
  'Pooling di Rubin sulle proporzioni: varianza totale = varianza within + (1 + 1/m)·varianza between.': 'Rubin-Pooling für Anteile: Gesamtvarianz = Within-Varianz + (1 + 1/m)·Between-Varianz.',
  'Le proporzioni di ciascuna variabile sommano a 1; gli intervalli di categorie rare possono essere molto ampi.': 'Die Anteile jeder Variablen summieren sich zu 1; Intervalle für seltene Kategorien können sehr breit sein.',
  'Report di imputazione multipla categorica': 'Bericht zur kategorialen multiplen Imputation',
  '{s1} celle categoriche imputate con {s2} dataset; FMI massimo {s3}.': '{s1} kategoriale Zellen mit {s2} Datensätzen imputiert; maximaler FMI {s3}.',
  'Variabili categoriche: {s1}.': 'Kategoriale Variablen: {s1}.',
  'Modello di imputazione: catene con regressione logistica o multinomiale, {s1} iterazioni per dataset.': 'Imputationsmodell: verkettete logistische oder multinomiale Regression, {s1} Iterationen je Datensatz.',
  'Categorie osservate: {s1} in totale; le proporzioni pooled sono combinate con le regole di Rubin.': 'Beobachtete Kategorien: insgesamt {s1}; die gepoolten Anteile werden mit den Rubin-Regeln kombiniert.',
  'Le proporzioni pooled sono la media delle proporzioni di categoria nelle {s1} imputazioni; gli intervalli combinano la variabilità dentro e tra le imputazioni.': 'Die gepoolten Anteile sind der Mittelwert der Kategorieanteile über die {s1} Imputationen; die Intervalle kombinieren die Variabilität innerhalb und zwischen den Imputationen.',
  'Ogni variabile mantiene solo le categorie osservate: l’imputazione non inventa codici nuovi, ma redistribuisce le righe mancanti tra le categorie esistenti.': 'Jede Variable behält nur ihre beobachteten Kategorien: Die Imputation erfindet keine neuen Codes, sondern verteilt fehlende Zeilen auf bestehende Kategorien um.',
  'Una FMI alta indica che i dati mancanti dominano l’incertezza delle proporzioni: interpreta le stime con cautela.': 'Ein hoher FMI zeigt an, dass die fehlenden Daten die Unsicherheit der Anteile dominieren: Interpretiere die Schätzungen mit Vorsicht.',
  'La frazione di informazione mancante è contenuta: le proporzioni pooled sono relativamente stabili.': 'Der Anteil fehlender Information ist gering: Die gepoolten Anteile sind relativ stabil.',
  'Il modello assume che i dati manchino a caso (MAR) condizionatamente alle altre variabili categoriche e alle covariabili numeriche incluse.': 'Das Modell setzt fehlende Daten als zufällig (MAR) bedingt auf die anderen kategorialen Variablen und die einbezogenen numerischen Kovariablen voraus.',
  'Le altre variabili categoriche entrano nel modello come dummy (K−1 per variabile) usando i valori correnti della catena; le covariabili numeriche entrano come effetti lineari.': 'Die anderen kategorialen Variablen gehen als Dummies (K−1 je Variable) mit den aktuellen Kettenwerten ein; numerische Kovariablen gehen als lineare Effekte ein.',
  'Le righe usate per stimare ciascun modello condizionale sono quelle in cui la variabile da imputare è osservata; le altre variabili possono essere già state imputate nella stessa iterazione.': 'Die Zeilen, die zur Schätzung jedes bedingten Modells verwendet werden, sind diejenigen, in denen die zu imputierende Variable beobachtet ist; die anderen Variablen können in derselben Iteration bereits imputiert worden sein.',
  'Categorie con proporzione pooled inferiore al 5%: {s1}. Queste stime sono le più sensibili al modello e al numero di imputazioni.': 'Kategorien mit einem gepoolten Anteil unter 5 %: {s1}. Diese Schätzungen reagieren am empfindlichsten auf das Modell und die Anzahl der Imputationen.',
  'Nessuna categoria pooled scende sotto il 5%: le proporzioni stimate sono distribuite in modo non estremo.': 'Keine gepoolte Kategorie liegt unter 5 %: Die geschätzten Anteile sind nicht extrem verteilt.',
  'Con categorie rare gli errori standard possono essere instabili anche quando il modello converge.': 'Bei seltenen Kategorien können die Standardfehler instabil sein, auch wenn das Modell konvergiert.',
  'L’imputazione assume dati mancanti a caso (MAR) condizionatamente alle variabili osservate: se il meccanismo è MNAR le stime possono essere distorte.': 'Die Imputation setzt fehlende Daten als zufällig (MAR) bedingt auf die beobachteten Variablen voraus: Bei einem MNAR-Mechanismus können die Schätzungen verzerrt sein.',
  'Il percorso categorico non usa la massima verosimiglianza a informazione completa (FIML): l’incertezza è quella del pooling di Rubin sulle imputazioni.': 'Der kategoriale Pfad verwendet keine Full-Information-Maximum-Likelihood (FIML): Die Unsicherheit stammt aus dem Rubin-Pooling über die Imputationen.',
  'Non è disponibile un modello gerarchico o multilivello per le categorie: strutture di clustering non vengono modellate.': 'Für Kategorien ist kein hierarchisches oder mehrstufiges Modell verfügbar: Clusterstrukturen werden nicht modelliert.',
  'Categorie rare e variabili quasi separate rendono instabili i coefficienti logistici e quindi le proporzioni imputate.': 'Seltene Kategorien und quasi-getrennte Variablen machen die logistischen Koeffizienten und damit die imputierten Anteile instabil.',
  'Le stime pooled qui riportate riguardano le proporzioni di categoria, non modelli di regressione categorica completi.': 'Die hier berichteten gepoolten Schätzungen betreffen Kategorieanteile, nicht vollständige kategoriale Regressionsmodelle.',
};
