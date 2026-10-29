/** de: report and table prose (normalised). */
export const survivalCopy: Record<string, string> = {
  ' Intervallo {s1} – {s2}.': ' Intervall {s1} – {s2}.',
  '{s1} intervalli di uguale ampiezza': '{s1} Intervalle gleicher Breite',
  A: 'A',
  'A rischio': 'Unter Risiko',
  'All’ultimo tempo osservato la sopravvivenza stimata è {s1} ({s2}%).':
    'Zum letzten beobachteten Zeitpunkt beträgt das geschätzte Überleben {s1} ({s2} %).',
  'Assunzioni e cautele': 'Annahmen und Vorsichtsmaßnahmen',
  'Censura non informativa: chi esce dallo studio non deve avere un rischio diverso da chi resta.':
    'Nicht informative Zensierung: Wer die Studie verlässt, darf kein anderes Risiko haben als wer bleibt.',
  Censurati: 'Zensiert',
  'CI {s1}% log-log · stima prodotto-limite':
    'CI {s1} % Log-Log · Produkt-Limit-Schätzung',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'Con più di due gruppi l’hazard ratio non è riportato: usa la regressione di Cox per un HR aggiustato.':
    'Bei mehr als zwei Gruppen wird das Hazard Ratio nicht berichtet: Verwenden Sie die Cox-Regression für ein adjustiertes HR.',
  'Con pochi eventi per gruppo il test ha poca potenza e l’HR è instabile.':
    'Bei wenigen Ereignissen pro Gruppe hat der Test wenig Power und das HR ist instabil.',
  'Confronto tra gruppi': 'Vergleich zwischen den Gruppen',
  'Confronto tra gruppi non richiesto': 'Gruppenvergleich nicht angefordert',
  'Curva di Kaplan–Meier': 'Kaplan–Meier-Kurve',
  Da: 'Von',
  df: 'df',
  Eventi: 'Ereignisse',
  'Gruppi: {s1}. Il log-rank dà χ² = {s2} con p = {s3}: {s4}':
    'Gruppen: {s1}. Der Log-Rank ergibt χ² = {s2} mit p = {s3}: {s4}',
  Gruppo: 'Gruppe',
  'Hazard ratio': 'Hazard Ratio',
  'Hazard ratio (Mantel–Haenszel)': 'Hazard Ratio (Mantel–Haenszel)',
  'Hazard ratio = {s1} ({s2} – {s3}): {s4}':
    'Hazard Ratio = {s1} ({s2} – {s3}): {s4}',
  'HR CI high': 'HR-CI oben',
  'HR CI low': 'HR-CI unten',
  'I censurati escono dal rischio senza far scendere la curva: è il motivo per cui serve un’analisi di sopravvivenza invece di una media.':
    'Zensierte verlassen das Risiko, ohne die Kurve zu senken: Deshalb braucht es eine Überlebensanalyse statt eines Mittelwerts.',
  'I tempi di censura coincidenti con un evento sono trattati come eventi allo stesso tempo (nessuna correzione per i ties oltre alla gestione standard del risk set).':
    'Zensierungszeiten, die mit einem Ereignis zusammenfallen, werden als Ereignisse zum selben Zeitpunkt behandelt (keine Korrektur für Bindungen über die übliche Behandlung des Risikosets hinaus).',
  'Il CI della mediana deriva dagli intervalli log-log della curva; RMST è l’area sotto la curva fino all’ultimo tempo osservato.':
    'Das CI des Medians stammt aus den Log-Log-Intervallen der Kurve; RMST ist die Fläche unter der Kurve bis zum letzten beobachteten Zeitpunkt.',
  'Il log-rank assume rischi proporzionali: curve che si incrociano richiedono altri test.':
    'Der Log-Rank setzt proportionale Risiken voraus: sich kreuzende Kurven erfordern andere Tests.',
  'Il log-rank confronta il numero di eventi osservati in ogni gruppo con quelli attesi se le curve fossero uguali.':
    'Der Log-Rank vergleicht die Anzahl der in jeder Gruppe beobachteten Ereignisse mit den erwarteten, wenn die Kurven gleich wären.',
  'Il log-rank dà lo stesso peso a tutti i tempi; se il rischio cambia nel tempo (curve che si incrociano) può non vedere differenze reali.':
    'Der Log-Rank gewichtet alle Zeitpunkte gleich; ändert sich das Risiko über die Zeit (sich kreuzende Kurven), kann er reale Unterschiede übersehen.',
  'Il log-rank non aggiusta per covariariate: per hazard ratio aggiustati o per più di due gruppi usa la scheda Cox (PH).':
    'Der Log-Rank adjustiert nicht für Kovariaten: Für adjustierte Hazard Ratios oder mehr als zwei Gruppen verwenden Sie den Tab Cox (PH).',
  'il primo gruppo ha un rischio di evento maggiore.':
    'die erste Gruppe hat ein höheres Ereignisrisiko.',
  'il primo gruppo ha un rischio di evento minore.':
    'die erste Gruppe hat ein geringeres Ereignisrisiko.',
  'Il tempo zero deve essere definito in modo omogeneo per tutte le osservazioni.':
    'Der Zeitpunkt null muss für alle Beobachtungen einheitlich definiert sein.',
  'L’analisi di sopravvivenza stima quanto tempo passa prima di un evento (guarigione, guasto, abbandono) tenendo conto delle osservazioni censurate, cioè di chi non ha ancora avuto l’evento quando lo studio finisce.':
    'Die Überlebensanalyse schätzt, wie viel Zeit bis zu einem Ereignis (Genesung, Ausfall, Abbruch) vergeht, und berücksichtigt dabei zensierte Beobachtungen, also Personen, die das Ereignis am Studienende noch nicht hatten.',
  'L’hazard ratio è riportato solo per due gruppi.':
    'Das Hazard Ratio wird nur für zwei Gruppen berichtet.',
  'L’hazard ratio è stimato con l’approccio Mantel–Haenszel: HR > 1 indica rischio maggiore nel primo gruppo.':
    'Das Hazard Ratio wird mit dem Mantel–Haenszel-Ansatz geschätzt: HR > 1 zeigt ein höheres Risiko in der ersten Gruppe.',
  'La curva diventa imprecisa nelle code, dove restano poche osservazioni a rischio: guarda la colonna “a rischio”.':
    'Die Kurve wird an den Rändern ungenau, wo wenige Beobachtungen unter Risiko stehen: Betrachten Sie die Spalte „unter Risiko“.',
  'La curva e la mediana': 'Die Kurve und der Median',
  'La curva non scende sotto 0,50 entro l’ultimo tempo osservato: la mediana non è raggiunta (non è “infinita”, semplicemente non stimabile con questo follow-up).':
    'Die Kurve fällt bis zum letzten beobachteten Zeitpunkt nicht unter 0,50: Der Median wird nicht erreicht (er ist nicht „unendlich“, sondern mit dieser Nachbeobachtung nicht schätzbar).',
  'La mediana di sopravvivenza è {s1}: a quel tempo la curva scende sotto 0,50.{s2}':
    'Das mediane Überleben beträgt {s1}: Zu diesem Zeitpunkt fällt die Kurve unter 0,50.{s2}',
  'La mediana è il tempo in cui la curva scende a 0,50: se non viene raggiunta resta non calcolabile.':
    'Der Median ist der Zeitpunkt, an dem die Kurve auf 0,50 fällt: Wird er nicht erreicht, bleibt er nicht berechenbar.',
  'La mediana non viene raggiunta: {s1} eventi su {s2}.':
    'Der Median wird nicht erreicht: {s1} Ereignisse von {s2}.',
  'La sopravvivenza finale non è calcolabile.':
    'Das Überleben am Ende ist nicht berechenbar.',
  'Le curve dei gruppi differiscono (log-rank p = {s1}).':
    'Die Kurven der Gruppen unterscheiden sich (Log-Rank p = {s1}).',
  'le curve non sono compatibili con l’ipotesi di uguale sopravvivenza.':
    'die Kurven sind nicht mit der Hypothese gleichen Überlebens vereinbar.',
  'Life table (tutta la coorte)': 'Life Table (gesamte Kohorte)',
  'Log-rank test': 'Log-Rank-Test',
  Mediana: 'Median',
  'Mediana di sopravvivenza: {s1} ({s2} eventi su {s3}).':
    'Medianes Überleben: {s1} ({s2} Ereignisse von {s3}).',
  N: 'N',
  'N = {s1} · eventi = {s2} · censurati = {s3}':
    'N = {s1} · Ereignisse = {s2} · zensiert = {s3}',
  'Nella life table i censurati nell’intervallo contribuiscono per metà al tempo a rischio.':
    'In der Life Table tragen die im Intervall zensierten Fälle zur Hälfte zur Risikozeit bei.',
  'Nessuna differenza tra le curve dei gruppi (log-rank p = {s1}).':
    'Kein Unterschied zwischen den Kurven der Gruppen (Log-Rank p = {s1}).',
  'non c’è evidenza che le curve differiscano.':
    'es gibt keinen Hinweis darauf, dass sich die Kurven unterscheiden.',
  'Non sono stimati modelli parametrici (Weibull, esponenziale) con dati censurati.':
    'Parametrische Modelle (Weibull, Exponential) mit zensierten Daten werden nicht geschätzt.',
  p: 'p',
  'Qui ci sono {s1} osservazioni, {s2} eventi e {s3} censurati: trattare i censurati come “nessun evento” o escluderli darebbe stime distorte, mentre Kaplan–Meier li mantiene nel rischio finché sono osservati.':
    'Hier gibt es {s1} Beobachtungen, {s2} Ereignisse und {s3} zensierte Fälle: Zensierte als „kein Ereignis“ zu behandeln oder auszuschließen würde verzerrte Schätzungen ergeben, während Kaplan–Meier sie im Risiko behält, solange sie beobachtet werden.',
  'Report di lettura': 'Lesetext',
  RMST: 'RMST',
  'RMST = {s1}: area media sotto la curva fino all’ultimo tempo, cioè il tempo medio trascorso senza evento entro l’orizzonte osservato.':
    'RMST = {s1}: mittlere Fläche unter der Kurve bis zum letzten Zeitpunkt, also die mittlere Zeit ohne Ereignis innerhalb des beobachteten Horizonts.',
  'RMST non calcolabile.': 'RMST nicht berechenbar.',
  'S(t)': 'S(t)',
  'S(t) è la probabilità stimata di essere ancora “in vita” (senza evento) al tempo t.':
    'S(t) ist die geschätzte Wahrscheinlichkeit, zum Zeitpunkt t noch „am Leben“ (ohne Ereignis) zu sein.',
  'Seleziona una variabile di gruppo per confrontare due o più curve con il log-rank.':
    'Wählen Sie eine Gruppenvariable, um zwei oder mehr Kurven mit dem Log-Rank zu vergleichen.',
  'Sintesi di sopravvivenza': 'Zusammenfassung des Überlebens',
  Tempo: 'Zeit',
  Valore: 'Wert',
  Voce: 'Posten',
  'χ²': 'χ²',
};
