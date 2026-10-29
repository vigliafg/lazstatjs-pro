/** de: report and table prose (normalised). */
export const resamplingCopy: Record<string, string> = {
  '{s1} permutazioni · {s2} bootstrap · CI {s3}%':
    '{s1} Permutationen · {s2} Bootstrap · KI {s3} %',
  'CI bootstrap {s1}%: {s2} – {s3}.': 'Bootstrap-KI {s1} %: {s2} – {s3}.',
  'CI bootstrap high': 'Bootstrap-KI oben',
  'CI bootstrap low': 'Bootstrap-KI unten',
  'Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.':
    'Bei sehr kleinen Gruppen ist das minimal erreichbare p durch die Zahl der Permutationen begrenzt.',
  'delle mediane': 'der Mediane',
  'delle medie': 'der Mittelwerte',
  'Differenza {s1} = {s2}; permutazione p = {s3}.':
    'Differenz {s1} = {s2}; Permutations-p = {s3}.',
  'Differenza compatibile con il caso': 'Differenz mit dem Zufall vereinbar',
  'Differenza di mediane': 'Differenz der Mediane',
  'Differenza di medie': 'Differenz der Mittelwerte',
  'Differenza oltre il caso': 'Differenz über den Zufall hinaus',
  'Differenza osservata': 'Beobachtete Differenz',
  'Differenza osservata ({s1} − {s2}): {s3}.':
    'Beobachtete Differenz ({s1} − {s2}): {s3}.',
  'Gruppi: {s1} (N = {s2}) e {s3} (N = {s4}).':
    'Gruppen: {s1} (N = {s2}) und {s3} (N = {s4}).',
  Gruppo: 'Gruppe',
  'Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.':
    'Das Bootstrap-KI enthält die Null: Die beobachtete Differenz ist mit dem Zufall vereinbar.',
  'Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.':
    'Das Bootstrap-KI enthält die Null nicht: Die Richtung der Differenz ist stimmig, aber p und KI beantworten leicht unterschiedliche Fragen.',
  'Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.':
    'Das Perzentil-Bootstrap-KI resampelt innerhalb jeder Gruppe; bei wenigen Fällen kann es instabil sein.',
  'Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.':
    'Das Permutations-p setzt keine Normalität voraus: Es vergleicht die beobachtete Differenz mit der Verteilung unter zufälligen Gruppenzuordnungen.',
  'Inferenza di resampling': 'Resampling-Inferenz',
  'La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.':
    'Die Permutation mischt die Gruppenzuordnung neu: Ist die beobachtete Differenz unter Neumischung selten, ist der Zusammenhang mit der Gruppe kaum durch Zufall zu erklären.',
  Metrica: 'Metrik',
  N: 'N',
  'p permutation (due code)': 'Permutations-p (zweiseitig)',
  'Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.':
    'Permutation und Bootstrap setzen Austauschbarkeit zwischen den Gruppen und unabhängige Beobachtungen voraus.',
  'Report di resampling': 'Resampling-Bericht',
  Statistica: 'Statistik',
  'Statistiche per gruppo': 'Statistiken pro Gruppe',
  Valore: 'Wert',
};
