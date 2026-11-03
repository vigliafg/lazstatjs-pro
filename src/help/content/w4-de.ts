import type { HelpTopic } from './types';

/** Verfahren der Welle 4: log-lineare Modelle für zweidimensionale Tabellen. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Log-lineares Modell für zweidimensionale Tabellen',
    summary: 'Poisson-Modell für die Häufigkeiten einer zweidimensionalen Tabelle: Unabhängigkeit oder gesättigte Interaktion.',
    tutorial: {
      goal: 'Entscheiden, ob die Zeilen- und Spaltenkategorien einer zweidimensionalen Tabelle assoziiert sind, und die Assoziation quantifizieren.',
      steps: [
        'Zeilen- und Spaltenbeschriftungen wählen und die beobachteten Häufigkeiten Zelle für Zelle eingeben.',
        'Mit dem Unabhängigkeitsmodell beginnen: Es schätzt nur die Haupteffekte von Zeile und Spalte.',
        'Ausführen und G², die zugehörigen Freiheitsgrade und den p-Wert lesen.',
        'Passt das Unabhängigkeitsmodell nicht, zum gesättigten Modell wechseln, um zu sehen, wie weit sich die Zellen von der Unabhängigkeit entfernen.',
        'Die Koeffizienten auf der Log-Skala und exp(β) als multiplikative Faktoren lesen.',
        'Bei einer 2×2-Tabelle den Exponenten der Interaktion als Odds Ratio mit Konfidenzintervall lesen.',
      ],
      expected:
        'Eine Anpassungstabelle mit G², df, p, Null-Devianz und AIC; eine Koeffiziententabelle mit β, SE, z, p, exp(β) und CI; erwartete Häufigkeiten und standardisierte Residuen; eine Heatmap der Residuen und Balken beobachtet/erwartet.',
    },
    advanced: {
      assumptions: [
        'Die Häufigkeiten sind unabhängige Beobachtungen, eine pro Zelle, und jede Einheit fällt in genau eine Zelle.',
        'Die erwartete Häufigkeit jeder Zelle ist positiv; die Poisson-Varianz entspricht dem Mittelwert.',
        'Der Logarithmus der erwarteten Häufigkeit ist eine lineare Funktion der Zeilen- und Spalteneffekte und im gesättigten Modell ihrer Interaktion.',
        'Bei kleinen erwarteten Häufigkeiten ist die χ²-Approximation von G² fragil.',
      ],
      whenToUse: [
        'Zwei kategoriale Variablen kreuztabelliert, wenn ein modellbasierter Unabhängigkeitstest gewünscht ist.',
        'Wenn erwartete Häufigkeiten, Residuen und eine Deutung der Assoziation auf Koeffizientenebene gebraucht werden.',
        'Um bei einer 2×2-Tabelle das Unabhängigkeitsmodell mit dem gesättigten Modell zu vergleichen und das Odds Ratio zu erhalten.',
      ],
      whenNotToUse: [
        'Drei oder mehr kategoriale Faktoren: Es braucht Interaktionen höherer Ordnung, und diese Seite behandelt nur zweidimensionale Tabellen.',
        'Sehr dünn besetzte Tabellen mit vielen Nullzellen: exakte oder penalisierte Verfahren sind sicherer.',
      ],
      reading: [
        'G² ist die Likelihood-Ratio-Statistik: Große Werte relativ zu den Freiheitsgraden bedeuten, dass die erwarteten Häufigkeiten des Modells weit von den beobachteten entfernt sind.',
        'In einer zweidimensionalen Tabelle hat das Unabhängigkeitsmodell (R−1)(C−1) Residualfreiheitsgrade; das gesättigte Modell hat keine und reproduziert die Daten exakt.',
        'Die Koeffizienten liegen auf der Log-Skala: exp(β) ist der Faktor, um den sich die erwartete Häufigkeit ändert, wenn die Kategorie wechselt und der andere Faktor festgehalten wird.',
        'Bei einer 2×2-Tabelle ist der Interaktionskoeffizient der Log-Odds-Ratio; exp(β) = 1 bedeutet Unabhängigkeit.',
      ],
      pitfalls: [
        'Den p-Wert eines Koeffizienten als Test des gesamten Modells lesen: zuerst G² und die Residualfreiheitsgrade prüfen.',
        'Assoziation als Kausalität deuten: Die Reihenfolge von Zeile und Spalte ist willkürlich, und das Modell sagt nicht, welche Variable die andere beeinflusst.',
        'Kleine erwartete Häufigkeiten ignorieren: Der G²-p-Wert kann anti-konservativ sein.',
        'Das gesättigte Modell als Beleg verwenden: Es passt immer und hat keinen Test.',
      ],
      charts: [
        'Heatmap der standardisierten Residuen mit hervorgehobenen Zellen weit von null.',
        'Balken beobachtet/erwartet je Zelle, um zu sehen, wo das Modell danebenliegt.',
      ],
      glossary: [
        { term: 'G²', definition: 'Likelihood-Ratio-Statistik, die beobachtete Häufigkeiten mit den erwarteten Häufigkeiten des Modells vergleicht.' },
        { term: 'Gesättigtes Modell', definition: 'Modell mit einem Parameter pro Zelle; es reproduziert die Daten und hat null Residualfreiheitsgrade.' },
        { term: 'Odds Ratio', definition: 'Verhältnis der Odds einer Gruppe zu den Odds der anderen; exp(Interaktion) in einem log-linearen 2×2-Modell.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
