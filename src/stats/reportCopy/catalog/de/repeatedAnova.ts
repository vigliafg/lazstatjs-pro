/** de: report and table prose (normalised). */
export const repeatedAnovaCopy: Record<string, string> = {
  ' corretto GG': ' GG-korrigiert',
  '{s1} soggetti · {s2} condizioni · CI {s3}%':
    '{s1} Personen · {s2} Bedingungen · KI {s3} %',
  '{s1}, {s2}': '{s1}, {s2}',
  '1 = sfericità perfetta': '1 = perfekte Sphärizität',
  'ANOVA a misure ripetute': 'Messwiederholungs-ANOVA',
  'Assunzioni e cautele': 'Annahmen und Vorsichtsmaßnahmen',
  'CI = media ± t({s1}%, df = {s2})·SE.':
    'KI = Mittelwert ± t({s1} %, df = {s2})·SE.',
  'CI high': 'KI oben',
  'CI low': 'KI unten',
  'Con pochi soggetti Mauchly è poco potente: considera comunque le correzioni se ε è basso.':
    'Bei wenigen Personen ist Mauchly wenig mächtig: Erwägen Sie die Korrekturen trotzdem, wenn ε niedrig ist.',
  Condizione: 'Bedingung',
  'Condizioni (within)': 'Bedingungen (within)',
  'Descrittive per condizione': 'Deskriptive Werte pro Bedingung',
  Dettaglio: 'Detail',
  df: 'df',
  'df = {s1}': 'df = {s1}',
  'df = {s1}, {s2}': 'df = {s1}, {s2}',
  'df corretti con ε HF': 'df mit HF-ε korrigiert',
  'Differenza rilevata': 'Unterschied festgestellt',
  'Errore (Condizioni × Soggetti)': 'Fehler (Bedingungen × Personen)',
  F: 'F',
  'F (df non corretti)': 'F (unkorrigierte df)',
  'F = MS_condizioni / MS_errore, con df = (k−1) e (n−1)(k−1).':
    'F = MS_Bedingungen / MS_Fehler, mit df = (k−1) und (n−1)(k−1).',
  'F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}':
    'F({s1}, {s2}) = {s3}, p{s4} = {s5}: {s6}',
  'L’ANOVA a misure ripetute confronta k condizioni misurate sulle stesse unità, separando la variabilità tra condizioni da quella tra soggetti.':
    'Die Messwiederholungs-ANOVA vergleicht k Bedingungen, die an denselben Einheiten gemessen wurden, und trennt die Variabilität zwischen den Bedingungen von der zwischen den Personen.',
  'L’ANOVA within non dice quali condizioni differiscano: servono confronti post-hoc.':
    'Die Within-ANOVA sagt nicht, welche Bedingungen sich unterscheiden: Dafür braucht es Post-hoc-Vergleiche.',
  'La lettura dei risultati': 'Die Lesart der Ergebnisse',
  'La sfericità riguarda le differenze tra tutte le coppie di condizioni, non le varianze delle singole condizioni.':
    'Die Sphärizität betrifft die Differenzen zwischen allen Paaren von Bedingungen, nicht die Varianzen der einzelnen Bedingungen.',
  'Le condizioni confrontate sono {s1}.':
    'Die verglichenen Bedingungen sind {s1}.',
  'Le condizioni differiscono (F = {s1}, p = {s2}{s3}).':
    'Die Bedingungen unterscheiden sich (F = {s1}, p = {s2}{s3}).',
  'Le correzioni GG/HF modificano i gradi di libertà ma non le medie: gli effetti descrittivi restano invariati.':
    'Die GG/HF-Korrekturen verändern die Freiheitsgrade, nicht die Mittelwerte: Die deskriptiven Effekte bleiben unverändert.',
  'Le righe incomplete vengono escluse: ogni soggetto deve avere tutte le k misure.':
    'Unvollständige Zeilen werden ausgeschlossen: Jede Person muss alle k Messungen haben.',
  'limite inferiore = 1/(k−1)': 'Untergrenze = 1/(k−1)',
  'Mauchly p': 'Mauchly p',
  'Mauchly p = {s1}: l’assunzione di sfericità è violata. Usa il p corretto Greenhouse–Geisser ({s2}, ε = {s3}) o Huynh–Feldt ({s4}).':
    'Mauchly p = {s1}: Die Sphärizitätsannahme ist verletzt. Verwenden Sie das Greenhouse–Geisser-korrigierte p ({s2}, ε = {s3}) oder Huynh–Feldt ({s4}).',
  'Mauchly p = {s1}: non ci sono prove di violazione; il p non corretto è utilizzabile.':
    'Mauchly p = {s1}: Es gibt keine Hinweise auf eine Verletzung; das unkorrigierte p ist verwendbar.',
  'Mauchly richiede normalità multivariata; con n piccolo il test ha potenza bassa.':
    'Mauchly setzt multivariate Normalität voraus; bei kleinem n hat der Test wenig Power.',
  'Mauchly W': 'Mauchly W',
  'Mauchly χ²': 'Mauchly χ²',
  Media: 'Mittelwert',
  Metrica: 'Metrik',
  MS: 'MS',
  N: 'N',
  'Nessuna differenza': 'Kein Unterschied',
  'Nessuna differenza tra le condizioni (F = {s1}, p = {s2}{s3}).':
    'Kein Unterschied zwischen den Bedingungen (F = {s1}, p = {s2}{s3}).',
  'nessuna violazione': 'keine Verletzung',
  'non rifiuta l’ipotesi di uguali medie.':
    'verwirft die Hypothese gleicher Mittelwerte nicht.',
  'Non sono inclusi disegni misti, più fattori within o covariate.':
    'Gemischte Designs, mehrere Within-Faktoren oder Kovariaten sind nicht enthalten.',
  p: 'p',
  'p GG': 'p GG',
  'p HF': 'p HF',
  'p non corretto': 'unkorrigiertes p',
  'più liberale di GG': 'liberaler als GG',
  'Report di lettura': 'Lesetext',
  'rifiuta l’ipotesi che le medie delle condizioni siano uguali.':
    'verwirft die Hypothese, dass die Mittelwerte der Bedingungen gleich sind.',
  SD: 'SD',
  'Se Mauchly è significativo, riportare il p corretto GG (conservativo) o HF.':
    'Ist Mauchly signifikant, berichten Sie das GG-korrigierte p (konservativ) oder HF.',
  'Sfericità e correzioni': 'Sphärizität und Korrekturen',
  'sfericità non rifiutata': 'Sphärizität nicht verworfen',
  'Sfericità violata': 'Sphärizität verletzt',
  'sfericità violata: usare la correzione':
    'Sphärizität verletzt: Korrektur verwenden',
  Sorgente: 'Quelle',
  SS: 'QS',
  'SS condizioni / SS totale': 'QS Bedingungen / QS total',
  'valido solo con sfericità': 'nur bei Sphärizität gültig',
  Valore: 'Wert',
  'ε Greenhouse': 'ε Greenhouse',
  'ε Greenhouse–Geisser': 'ε Greenhouse–Geisser',
  'ε Huynh–Feldt': 'ε Huynh–Feldt',
  'η² generalizzato': 'Verallgemeinertes η²',
  'η²p': 'η²p',
  'η²p = {s1} · η²G = {s2}.': 'η²p = {s1} · η²G = {s2}.',
  'η²p = {s1}: effetto {s2}. η²G = {s3}.':
    'η²p = {s1}: Effekt {s2}. η²G = {s3}.',
};
