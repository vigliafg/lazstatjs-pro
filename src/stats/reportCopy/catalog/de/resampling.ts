/** German prose of the resampling procedure and its tables. */
export const resamplingCopy: Record<string, string> = {
  "Report di resampling":
    "Resampling-Bericht",
  "Differenza {s1} = {s2}; permutazione p = {s3}.":
    "Differenz {s1} = {s2}; Permutations-p = {s3}.",
  "delle medie":
    "der Mittelwerte",
  "delle mediane":
    "der Mediane",
  "Differenza oltre il caso":
    "Differenz über den Zufall hinaus",
  "Differenza compatibile con il caso":
    "Differenz mit dem Zufall vereinbar",
  "Gruppi: {s1} (N = {s2}) e {s3} (N = {s4}).":
    "Gruppen: {s1} (N = {s2}) und {s3} (N = {s4}).",
  "CI bootstrap {s1}%: {s2} – {s3}.":
    "Bootstrap-KI {s1} %: {s2} – {s3}.",
  "La permutazione rimescola le etichette di gruppo: se la differenza osservata è rara sotto rimescolamento, l’associazione con il gruppo è difficile da spiegare con il caso.":
    "Die Permutation mischt die Gruppenzuordnung neu: Ist die beobachtete Differenz unter Neumischung selten, ist der Zusammenhang mit der Gruppe kaum durch Zufall zu erklären.",
  "Il CI bootstrap non contiene lo zero: la direzione della differenza è coerente, ma il p e il CI rispondono a domande leggermente diverse.":
    "Das Bootstrap-KI enthält die Null nicht: Die Richtung der Differenz ist stimmig, aber p und KI beantworten leicht unterschiedliche Fragen.",
  "Il CI bootstrap contiene lo zero: la differenza osservata è compatibile con il caso.":
    "Das Bootstrap-KI enthält die Null: Die beobachtete Differenz ist mit dem Zufall vereinbar.",
  "Permutazione e bootstrap assumono scambiabilità tra gruppi e osservazioni indipendenti.":
    "Permutation und Bootstrap setzen Austauschbarkeit zwischen den Gruppen und unabhängige Beobachtungen voraus.",
  "Con gruppi molto piccoli il p minimo raggiungibile è limitato dal numero di permutazioni.":
    "Bei sehr kleinen Gruppen ist das minimal erreichbare p durch die Zahl der Permutationen begrenzt.",
  "Statistiche per gruppo":
    "Statistiken pro Gruppe",
  "Differenza di medie":
    "Differenz der Mittelwerte",
  "Differenza di mediane":
    "Differenz der Mediane",
  "Gruppo":
    "Gruppe",
  "N":
    "N",
  "Statistica":
    "Statistik",
  "Differenza osservata ({s1} − {s2}): {s3}.":
    "Beobachtete Differenz ({s1} − {s2}): {s3}.",
  "Inferenza di resampling":
    "Resampling-Inferenz",
  "{s1} permutazioni · {s2} bootstrap · CI {s3}%":
    "{s1} Permutationen · {s2} Bootstrap · KI {s3} %",
  "Metrica":
    "Metrik",
  "Valore":
    "Wert",
  "Differenza osservata":
    "Beobachtete Differenz",
  "p permutation (due code)":
    "Permutations-p (zweiseitig)",
  "CI bootstrap low":
    "Bootstrap-KI unten",
  "CI bootstrap high":
    "Bootstrap-KI oben",
  "Il p di permutazione non assume normalità: confronta la differenza osservata con la distribuzione sotto etichette casuali.":
    "Das Permutations-p setzt keine Normalität voraus: Es vergleicht die beobachtete Differenz mit der Verteilung unter zufälligen Gruppenzuordnungen.",
  "Il CI bootstrap percentile ricampiona dentro ciascun gruppo; con pochi casi può essere instabile.":
    "Das Perzentil-Bootstrap-KI resampelt innerhalb jeder Gruppe; bei wenigen Fällen kann es instabil sein.",
};
