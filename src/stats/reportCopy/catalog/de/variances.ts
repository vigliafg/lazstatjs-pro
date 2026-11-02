/** German prose of the variance reports. */
export const variancesCopy: Record<string, string> = {
  'Bartlett assume la normalità ed è sensibile agli outlier; Levene sulle mediane è più robusto.':
    'Bartlett setzt Normalität voraus und reagiert auf Ausreißer; Levene auf Medianen ist robuster.',
  'Bartlett è potente sotto normalità ma falsato da outlier e code pesanti.':
    'Bartlett ist unter Normalität leistungsfähig, wird aber durch Ausreißer und schwere Ränder verzerrt.',
  'Con pochi casi l’intervallo è molto largo: servono più osservazioni per stimare una varianza con precisione.':
    'Bei wenigen Fällen ist das Intervall sehr breit: Für eine präzise Varianzschätzung sind mehr Beobachtungen nötig.',
  'Confronto delle varianze di {s1} tra i gruppi di {s2}.':
    'Vergleich der Varianzen von {s1} zwischen den Gruppen von {s2}.',
  'F test (first two groups)':
    'F-Test (erste zwei Gruppen)',
  'F, Bartlett e Levene rispondono alla stessa domanda con assunzioni diverse: le varianze dei gruppi sono uguali?':
    'F, Bartlett und Levene beantworten dieselbe Frage mit unterschiedlichen Annahmen: Sind die Gruppenvarianzen gleich?',
  'F: p = {s1}; Bartlett: χ² = {s2}, p = {s3}; Levene: F = {s4}, p = {s5}.':
    'F: p = {s1}; Bartlett: χ² = {s2}, p = {s3}; Levene: F = {s4}, p = {s5}.',
  'F: rapporto tra le varianze dei primi due gruppi, intervallo esatto.':
    'F: Verhältnis der Varianzen der ersten beiden Gruppen, exaktes Intervall.',
  'I gruppi devono essere indipendenti e le osservazioni dentro ogni gruppo indipendenti.':
    'Die Gruppen müssen unabhängig sein und die Beobachtungen innerhalb jeder Gruppe ebenfalls.',
  'Il test F è definito per due gruppi; con più gruppi usa Bartlett o Levene.':
    'Der F-Test ist für zwei Gruppen definiert; bei mehr Gruppen Bartlett oder Levene verwenden.',
  'Il test confronta la varianza osservata con il valore nullo; l’intervallo dice quanto è incerta la stima.':
    'Der Test vergleicht die beobachtete Varianz mit dem Nullwert; das Intervall zeigt die Unsicherheit der Schätzung.',
  'Il test χ² sulla varianza assume una popolazione normale: con distribuzioni asimmetriche il p non è affidabile.':
    'Der χ²-Varianztest setzt eine normalverteilte Grundgesamtheit voraus: Bei schiefen Verteilungen ist p unzuverlässig.',
  'Intervallo della varianza: {s1}.':
    'Varianzintervall: {s1}.',
  'Intervallo esatto della varianza ottenuto invertendo la χ².':
    'Exaktes Varianzintervall durch Invertieren der χ²-Verteilung.',
  'La varianza è nella scala al quadrato: per leggere l’intervallo nella scala dei dati usa la deviazione standard.':
    'Die Varianz liegt auf der quadrierten Skala: Für das Intervall auf der Datenskala die Standardabweichung verwenden.',
  'La varianza è sensibile agli outlier: un solo valore estremo può dominarla.':
    'Die Varianz reagiert auf Ausreißer: Ein einzelner Extremwert kann sie dominieren.',
  'Le osservazioni devono essere indipendenti e normali.':
    'Die Beobachtungen müssen unabhängig und normalverteilt sein.',
  'Levene (median)':
    'Levene (Median)',
  'Levene sulle mediane riduce l’effetto degli estremi ed è il default più sicuro.':
    'Levene auf Medianen verringert den Einfluss von Extremen und ist die sichere Standardwahl.',
  'Levene sulle mediane è la scelta più robusta quando i gruppi sono piccoli o la distribuzione non è normale.':
    'Levene auf Medianen ist die robusteste Wahl bei kleinen Gruppen oder nicht normaler Verteilung.',
  'L’intervallo è asimmetrico: la varianza stimata non sta al centro, perché la distribuzione di s² è asimmetrica.':
    'Das Intervall ist asymmetrisch: Die geschätzte Varianz liegt nicht in der Mitte, weil s² schief verteilt ist.',
  'Nessuno dei tre test sostituisce l’ispezione grafica della dispersione: guarda le scatole.':
    'Keiner der drei Tests ersetzt die grafische Prüfung der Streuung: Betrachten Sie die Boxplots.',
  'Null variance':
    'Nullvarianz',
  'Report di lettura — Uguaglianza delle varianze':
    'Lesebeitrag — Gleichheit der Varianzen',
  'Report di lettura — Varianza':
    'Lesebeitrag — Varianz',
  'Test di uguaglianza delle varianze':
    'Tests auf Gleichheit der Varianzen',
  'Varianza (un campione)':
    'Varianz (eine Stichprobe)',
  'Varianza di {s1}: {s2} ({s3}).':
    'Varianz von {s1}: {s2} ({s3}).',
  'Varianza nulla {s1}: χ² = {s2}, df = {s3}, p = {s4}.':
    'Nullvarianz {s1}: χ² = {s2}, df = {s3}, p = {s4}.',
  'Varianze per gruppo':
    'Varianzen je Gruppe',
  'Varianze: {s1} e {s2}; rapporto {s3} (CI {s4}).':
    'Varianzen: {s1} und {s2}; Verhältnis {s3} (KI {s4}).',
  '{s1} osservazioni: varianza {s2}, deviazione standard {s3}.':
    '{s1} Beobachtungen: Varianz {s2}, Standardabweichung {s3}.',
  'χ² = (n − 1)·s²/σ₀² con n − 1 gradi di libertà; il p è a due code.':
    'χ² = (n − 1)·s²/σ₀² mit n − 1 Freiheitsgraden; p ist zweiseitig.',
};
