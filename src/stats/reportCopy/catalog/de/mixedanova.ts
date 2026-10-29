/** de: report and table prose (normalised). */
export const mixedanovaCopy: Record<string, string> = {
  '{s1} gruppi × {s2} condizioni': '{s1} Gruppen × {s2} Bedingungen',
  '{s1} soggetti, {s2} gruppi, {s3} condizioni within.':
    '{s1} Personen, {s2} Gruppen, {s3} Innerhalb-Personen-Bedingungen.',
  A: 'A',
  'ANOVA mista split-plot': 'Gemischte Split-Plot-ANOVA',
  B: 'B',
  'c{s1}': 's{s1}',
  'CI high': 'KI oben',
  'CI low': 'KI unten',
  'Con gruppi sbilanciati l’ANOVA split-plot classica non è banale: qui è riportata la decomposizione standard.':
    'Bei unbalancierten Gruppen ist die klassische Split-Plot-ANOVA nicht trivial: Hier wird die Standardzerlegung berichtet.',
  'Con più di due condizioni within l’assunzione di sfericità è controllata nella tabella dedicata.':
    'Bei mehr als zwei Within-Bedingungen wird die Sphärizitätsannahme in der eigenen Tabelle geprüft.',
  'Confronti tra gruppi sulle medie marginali e tra condizioni within; p aggiustati con Holm.':
    'Vergleiche zwischen Gruppen über die marginalen Mittelwerte und zwischen Within-Bedingungen; p mit Holm adjustiert.',
  'Contrasti pairwise (Holm)': 'Paarweise Kontraste (Holm)',
  df: 'df',
  Differenza: 'Differenz',
  'Effetto between non significativo':
    'Nicht signifikanter Zwischen-Personen-Effekt',
  'Effetto between significativo': 'Signifikanter Zwischen-Personen-Effekt',
  'EM mean': 'EM-Mittelwert',
  'EM means (marginali non pesate)': 'EM-Mittelwerte (ungewichtet marginal)',
  F: 'F',
  Fattore: 'Faktor',
  'Fattore {s1}: F({s2}, {s3}) = {s4}, p = {s5}.':
    'Faktor {s1}: F({s2}, {s3}) = {s4}, p = {s5}.',
  'Fattore between: {s1}. Fattore within: condizioni selezionate.':
    'Zwischen-Personen-Faktor: {s1}. Innerhalb-Personen-Faktor: ausgewählte Bedingungen.',
  Fonte: 'Quelle',
  'GG epsilon': 'GG-Epsilon',
  Gruppo: 'Gruppe',
  'HF epsilon': 'HF-Epsilon',
  'Il fattore between confronta i gruppi sulle medie delle condizioni; il fattore within confronta le condizioni dentro soggetto.':
    'Der Zwischen-Personen-Faktor vergleicht die Gruppen über die Mittelwerte der Bedingungen; der Innerhalb-Personen-Faktor vergleicht die Bedingungen innerhalb einer Person.',
  'Il fattore between è testato sui soggetti within-groups; il fattore within e l’interazione sull’errore within.':
    'Der Zwischen-Personen-Faktor wird an den Personen innerhalb der Gruppen getestet; der Innerhalb-Personen-Faktor und die Interaktion am Within-Fehler.',
  'Il modello assume sfericità per il fattore within con più di due livelli; la tabella riporta Mauchly, epsilon e p corrette GG.':
    'Das Modell setzt Sphärizität für den Innerhalb-Personen-Faktor mit mehr als zwei Stufen voraus; die Tabelle berichtet Mauchly, Epsilon und GG-korrigierte p.',
  'L’interazione è significativa: l’effetto del tempo cambia tra i gruppi, quindi vanno lette le medie cella più che gli effetti principali.':
    'Die Interaktion ist signifikant: Der Effekt der Zeit ändert sich zwischen den Gruppen, daher sind eher die Zellmittelwerte als die Haupteffekte zu lesen.',
  'L’interazione non è significativa: gli effetti principali sono interpretabili separatamente.':
    'Die Interaktion ist nicht signifikant: Die Haupteffekte sind getrennt interpretierbar.',
  'Le EM means marginali non pesate valgono {s1} come media complessiva; in caso di gruppi sbilanciati sono la lettura corretta degli effetti principali.':
    'Die ungewichteten marginalen EM-Mittelwerte betragen {s1} als Gesamtmittel; bei unbalancierten Gruppen sind sie die korrekte Lesart der Haupteffekte.',
  'Le EM means mediano i livelli dell’altro fattore con pesi uguali, quindi non coincidono con le medie grezze in un disegno sbilanciato.':
    'Die EM-Mittelwerte mitteln die Stufen des anderen Faktors mit gleichen Gewichten und stimmen daher in einem unbalancierten Design nicht mit den rohen Mittelwerten überein.',
  'Le p corrette GG usano epsilon di Greenhouse–Geisser; con epsilon vicino a 1 la correzione è minima.':
    'Die GG-korrigierten p verwenden das Greenhouse–Geisser-Epsilon; bei Epsilon nahe 1 ist die Korrektur minimal.',
  Livello: 'Stufe',
  'Mauchly · CI {s1}%': 'Mauchly · KI {s1} %',
  'Mauchly testa la sfericità della matrice di covarianza within.':
    'Mauchly prüft die Sphärizität der Within-Kovarianzmatrix.',
  'Mauchly W': 'Mauchly W',
  'Mauchly χ²': 'Mauchly χ²',
  Media: 'Mittelwert',
  'Media marginale complessiva = {s1}.':
    'Gesamter marginaler Mittelwert = {s1}.',
  'Medie cella': 'Zellmittelwerte',
  Metrica: 'Metrik',
  MS: 'MS',
  p: 'p',
  'p Group×Time (GG)': 'p Gruppe×Zeit (GG)',
  'p Holm': 'p Holm',
  'p Mauchly': 'p Mauchly',
  'p Time (GG)': 'p Zeit (GG)',
  'Report ANOVA mista': 'Bericht zur gemischten ANOVA',
  SE: 'SE',
  'Sfericità e correzioni': 'Sphärizität und Korrekturen',
  'Sfericità: Mauchly p = {s1}, ε GG = {s2}; p corretti GG: tempo {s3}, interazione {s4}.':
    'Sphärizität: Mauchly p = {s1}, ε GG = {s2}; GG-korrigierte p: Zeit {s3}, Interaktion {s4}.',
  SS: 'QS',
  'Stime bilanciate sui livelli dei fattori':
    'Über die Faktorstufen balancierte Schätzungen',
  t: 't',
  'Una riga per soggetto; ogni soggetto deve avere tutte le condizioni.':
    'Eine Zeile pro Person; jede Person muss alle Bedingungen haben.',
  'Una sola osservazione per soggetto e condizione: nessun effetto casuale oltre al soggetto.':
    'Nur eine Beobachtung pro Person und Bedingung: kein zufälliger Effekt außer der Person.',
  Valore: 'Wert',
  'Within: F({s1}, {s2}) = {s3}, p = {s4}; interazione F({s5}, {s6}) = {s7}, p = {s8}.':
    'Within: F({s1}, {s2}) = {s3}, p = {s4}; Interaktion F({s5}, {s6}) = {s7}, p = {s8}.',
  'η² parziale': 'partielles η²',
};
