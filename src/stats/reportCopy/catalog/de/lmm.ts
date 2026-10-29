/** de: report and table prose (normalised). */
export const lmmCopy: Record<string, string> = {
  '{s1} ~ {s2} + (1 | {s3}) · CI {s4}%': '{s1} ~ {s2} + (1 | {s3}) · CI {s4} %',
  'CI {s1}% · t con df = {s2}': 'CI {s1} % · t mit df = {s2}',
  'CI high': 'CI oben',
  'CI low': 'CI unten',
  'Con meno di 5–10 gruppi la varianza tra gruppi è imprecisa.':
    'Mit weniger als 5–10 Gruppen ist die Varianz zwischen den Gruppen ungenau.',
  'Effetti fissi': 'Feste Effekte',
  Gruppi: 'Gruppen',
  ICC: 'ICC',
  'ICC = {s1}: il {s2}% della variabilità è tra gruppi ({s3}).':
    'ICC = {s1}: {s2} % der Variabilität liegt zwischen den Gruppen ({s3}).',
  'ICC = varianza tra gruppi / varianza totale.':
    'ICC = Varianz zwischen Gruppen / Gesamtvarianz.',
  Metrica: 'Metrik',
  'Modello lineare misto': 'Lineares gemischtes Modell',
  'Modello: esito ~ {s1} + (1 | {s2}), {s3} gruppi, {s4} osservazioni.':
    'Modell: Ergebnis ~ {s1} + (1 | {s2}), {s3} Gruppen, {s4} Beobachtungen.',
  N: 'N',
  p: 'p',
  'p e CI usano una t con df = N − parametri; con pochi gruppi sono approssimati.':
    'p und CI verwenden eine t mit df = N − Parameter; bei wenigen Gruppen sind sie approximativ.',
  'REML logLik (a meno di costante)': 'REML-LogLik (bis auf eine Konstante)',
  'Report del modello misto': 'Bericht zum gemischten Modell',
  SE: 'SE',
  'Solo intercetta casuale: non sono stimati slope casuali.':
    'Nur zufälliger Achsenabschnitt: Es werden keine zufälligen Steigungen geschätzt.',
  Stima: 'Schätzung',
  'Stima REML con intercetta casuale per gruppo.':
    'REML-Schätzung mit zufälligem Achsenabschnitt pro Gruppe.',
  'Struttura di gruppo modesta': 'Geringe Gruppenstruktur',
  'Struttura di gruppo rilevante': 'Relevante Gruppenstruktur',
  t: 't',
  Termine: 'Term',
  Valore: 'Wert',
  'Varianza dell’intercetta = {s1}; varianza residua = {s2}.':
    'Varianz des Achsenabschnitts = {s1}; Residuenvarianz = {s2}.',
  'Varianza intercetta': 'Varianz des Achsenabschnitts',
  'Varianza residua': 'Residuenvarianz',
};
