import type { HelpTopic } from './types';

/**
 * L4 procedure pages, German edition.
 */
export const l4Topics: HelpTopic[] = [
  {
    id: "partition",
    area: "procedures",
    title: "Partition (Regressionsbaum)",
    summary: "Die Daten mit einem Regressionsbaum in homogene Blätter aufteilen.",
    tutorial: {
      goal: "Ein numerisches Ergebnis mit wenigen Wenn-dann-Regeln erklären.",
      steps: [
        "Wählen Sie die numerische Ergebnisvariable und einen oder mehrere numerische Prädiktoren.",
        "Legen Sie die maximale Tiefe und die minimale Zahl der Fälle je Teilung fest.",
        "Führen Sie die Analyse aus und lesen Sie Baum, Teilungsliste und Blattbericht.",
      ],
      expected: "Ein Baumdiagramm, Teilungsregeln, Blattmittelwerte und Variablenbedeutung.",
    },
    advanced: {
      assumptions: ["Die Ergebnisvariable ist numerisch; die Prädiktoren sind numerisch und vollständig."],
      whenToUse: ["Explorative Erklärung, Segmentierung und nicht lineare Effekte."],
      whenNotToUse: ["Formale Inferenz oder kausale Aussagen; verwenden Sie stattdessen ein Regressionsmodell."],
      reading: [
        "Jeder innere Knoten ist eine Schwelle; der Blattmittelwert ist die Vorhersage.",
        "Die Variablenbedeutung summiert die jedem Prädiktor zugerechnete Fehlerreduktion.",
      ],
      pitfalls: [
        "Tiefe Bäume überanpassen: Validieren Sie an einer separaten Stichprobe, bevor Sie den Regeln vertrauen.",
        "Schwellen hängen von den Daten ab und können sich mit einer anderen Stichprobe ändern.",
      ],
      charts: ["Baumdiagramm", "Beobachtet vs. vorhergesagt", "Variablenbedeutung"],
      glossary: [
        { term: "Blatt", definition: "Eine endgültige Gruppe, deren Mittelwert die Vorhersage ist." },
        { term: "SSE", definition: "Summe der quadrierten Differenzen zwischen beobachteten und vorhergesagten Werten." },
      ],
    },
    seeAlso: ["regression", "cluster"],
  },
  {
    id: "quality",
    area: "procedures",
    title: "Qualität (SPC)",
    summary: "Regelkarten, Prozessfähigkeit, Pareto, Messsystemanalyse, Annahmestichproben und multivariate Regelkarten.",
    tutorial: {
      goal: "Prüfen, ob ein Prozess stabil, fähig und zuverlässig gemessen ist.",
      steps: [
        "Wählen Sie den Modus: Regelkarte, Prozessfähigkeit, Pareto, Streuung, Toleranzintervall, CUSUM, Gage R&R, Annahmestichprobe oder T²-Karte.",
        "Wählen Sie die numerische Variable (oder die Kategorie für Pareto).",
        "Wählen Sie für Gage R&R die Spalten Teil und Bediener; legen Sie für die Annahmestichprobe n, c und die Losgröße fest; wählen Sie für T² mindestens zwei gemeinsam gemessene Variablen.",
        "Legen Sie bei Bedarf Spezifikationsgrenzen, die Untergruppengröße und den Anteil der Grundgesamtheit für das Toleranzintervall fest.",
        "Führen Sie die Analyse aus und lesen Sie Karte, Kennzahlen und Lesetext.",
      ],
      expected: "Eine Regelkarte mit Grenzen, Fähigkeitskennzahlen, eine Gage-R&R-Tabelle, eine OC-Kurve oder eine T²-Karte, dazu Tabellen.",
    },
    advanced: {
      assumptions: ["Die Beobachtungen liegen in ihrer tatsächlichen zeitlichen Reihenfolge vor; die Untergruppen sind sinnvoll."],
      whenToUse: ["Prozessüberwachung, Vergleich der Streuung zwischen Gruppen, Priorisierung von Fehlern."],
      whenNotToUse: ["Fähigkeit vor Stabilität beurteilen; eine Fähigkeitskennzahl für einen instabilen Prozess ist irreführend."],
      reading: [
        "Punkte außerhalb der Eingriffsgrenzen sind Signale, kein Beweis für eine Änderung.",
        "Cp ist der potenzielle Spielraum; Cpk berücksichtigt zusätzlich einen Mittelwert, der weit von der Spezifikationsmitte entfernt liegt.",
        "Die kumulierte Pareto-Linie zeigt, welche Kategorien zuerst anzugehen sind.",
        "Das Toleranzintervall deckt einen Anteil der Grundgesamtheit ab, nicht den Mittelwert; die CUSUM summiert kleine anhaltende Verschiebungen.",
        "Gage R&R unter 10% ist akzeptabel, 10–30% grenzwertig und über 30% gefährdet Entscheidungen über Teile.",
        "In der OC-Kurve ist die AQL die Qualität, die zu 95% angenommen wird, die LTPD die zu 10% angenommene Qualität.",
        "Ein T²-Punkt außerhalb der Grenze zeigt eine ungewöhnliche Kombination der Variablen, nicht welche Variable sich verschoben hat.",
      ],
      pitfalls: [
        "Eingriffsgrenzen sind keine Spezifikationsgrenzen.",
        "Die Prozessfähigkeit setzt Normalität und einen stabilen Prozess voraus.",
        "Eine Gage-R&R-Studie braucht ein balanciertes gekreuztes Design: jedes Teil von jedem Bediener gemessen.",
        "Die T²-Karte setzt unabhängige, annähernd normalverteilte Beobachtungen voraus.",
      ],
      charts: ["Regelkarte", "Fähigkeitshistogramm", "Pareto-Diagramm", "Boxplot der Streuung", "Toleranzintervall", "Gage-R&R-Varianzkomponenten", "OC- und AOQ-Kurven", "Hotelling-T²-Karte"],
      glossary: [
        { term: "UCL/LCL", definition: "Obere und untere Eingriffsgrenze bei ±3 Sigma von der Mitte." },
        { term: "Cpk", definition: "Fähigkeitskennzahl, die den Abstand zwischen Mittelwert und Spezifikationsgrenzen berücksichtigt." },
        { term: "Gage R&R", definition: "Anteil der Gesamtstreuung, der vom Messsystem stammt: Wiederholbarkeit plus Reproduzierbarkeit." },
        { term: "AQL", definition: "Annahmefähige Qualitätslage: Eingangsfehleranteil, der mit 95% Wahrscheinlichkeit angenommen wird." },
      ],
    },
    seeAlso: ["descriptive", "distfit"],
  },
  {
    id: "cluster",
    area: "procedures",
    title: "Clusteranalyse",
    summary: "Hierarchische Gruppierung mit Dendrogramm und Clusterprofilen.",
    tutorial: {
      goal: "Gruppen ähnlicher Beobachtungen über mehrere numerische Variablen finden.",
      steps: [
        "Wählen Sie mindestens zwei numerische Variablen.",
        "Wählen Sie die Verknüpfung und die Zahl der Cluster.",
        "Führen Sie die Analyse aus und lesen Sie Dendrogramm, Clustermittelwerte und Profile.",
      ],
      expected: "Ein Dendrogramm, Clustergrößen, Clustermittelwerte und standardisierte Profile.",
    },
    advanced: {
      assumptions: ["Die Variablen liegen auf vergleichbaren Skalen oder die Standardisierung ist aktiviert."],
      whenToUse: ["Segmentierung, explorative Typologien, Auffinden natürlicher Gruppen."],
      whenNotToUse: ["Prüfen, ob Gruppen existieren; dafür liefert Clustering keinen p-Wert."],
      reading: [
        "Die Höhe einer Fusion ist die Distanz zwischen den zusammengeführten Gruppen.",
        "Standardisierte Profile zeigen, welche Variablen jeden Cluster prägen.",
      ],
      pitfalls: [
        "Verschiedene Verknüpfungen oder Schnitte ergeben verschiedene Cluster.",
        "Sehr kleine Cluster können Ausreißer statt echter Gruppen sein.",
      ],
      charts: ["Dendrogramm", "Clusterprofile", "Clustergrößen"],
      glossary: [
        { term: "Verknüpfung", definition: "Die Regel, die die Distanz zwischen zwei Clustern misst." },
        { term: "Dendrogramm", definition: "Ein Baum, der Reihenfolge und Höhe der Fusionen zeigt." },
      ],
    },
    seeAlso: ["multivariate", "partition"],
  },
  {
    id: "discriminant",
    area: "procedures",
    title: "Diskriminanz / MANOVA",
    summary: "Bekannte Gruppen trennen und ihren multivariaten Mittelwertunterschied testen.",
    tutorial: {
      goal: "Prüfen, ob sich Gruppen bei mehreren numerischen Variablen gemeinsam unterscheiden.",
      steps: [
        "Wählen Sie die Gruppierungsspalte und mindestens einen numerischen Prädiktor.",
        "Führen Sie die Analyse aus und lesen Sie Wilks-Lambda, die univariaten Tests und das kanonische Diagramm.",
        "Prüfen Sie die Klassifikationsmatrix, um zu sehen, wie gut die Gruppen klassifiziert werden.",
      ],
      expected: "MANOVA-Tabelle, Diskriminanzkoeffizienten, kanonisches Streudiagramm und Profildiagramm.",
    },
    advanced: {
      assumptions: ["Unabhängige Beobachtungen, ähnliche Gruppenkovarianzen, kontinuierliche Prädiktoren."],
      whenToUse: ["Bekannte Gruppen, Klassifikationsregeln, multivariater Gruppenvergleich."],
      whenNotToUse: ["Auffinden unbekannter Gruppen (verwenden Sie Clustering) oder mehr Variablen als Fälle."],
      reading: [
        "Ein kleines Wilks-Lambda und ein kleines p zeigen eine Trennung der Gruppen.",
        "Kanonische Achsen sind die Richtungen, die die Gruppen am besten trennen.",
        "Die Genauigkeit auf den Trainingsdaten ist optimistisch verzerrt: Validieren Sie an einer separaten Stichprobe.",
      ],
      pitfalls: [
        "Unausgewogene Gruppen können die Genauigkeit dominieren.",
        "Kollineare Prädiktoren machen die Kovarianzmatrix singulär.",
      ],
      charts: ["Kanonisches Streudiagramm", "Gruppenprofile", "Koeffizienten-Heatmap"],
      glossary: [
        { term: "Wilks-Lambda", definition: "Eine multivariate Teststatistik, die bei Unterschieden zwischen den Gruppen nahe null liegt." },
        { term: "Kanonische Funktion", definition: "Eine Linearkombination der Variablen, die die Trennung der Gruppen maximiert." },
      ],
    },
    seeAlso: ["multivariate", "anova"],
  },
  {
    id: "doe",
    area: "procedures",
    title: "Responsefläche und DOE-Planung",
    summary: "Quadratische Oberfläche für zwei Faktoren und ein Generator für faktorielle und Response-Surface-Pläne.",
    tutorial: {
      goal: "Die optimale Kombination zweier Faktoren finden oder die zu erhebenden Versuche planen.",
      steps: [
        "Wählen Sie den Modus: Responsefläche für vorhandene Daten oder Versuchsplan-Generator für eine neue Run-Matrix.",
        "Wählen Sie für die Oberfläche die Ergebnisvariable und zwei Faktoren sowie ein lineares oder quadratisches Modell.",
        "Wählen Sie für den Generator Plantyp, Anzahl der Faktoren und Zentralpunkte.",
        "Führen Sie die Analyse aus und lesen Sie Oberfläche und stationären Punkt oder Matrix und Plan.",
      ],
      expected: "Eine projizierte Oberfläche mit stationärem Punkt oder eine Planmatrix mit Runs, axialen und zentralen Punkten sowie Aliasen.",
    },
    advanced: {
      assumptions: ["Die Ergebnisvariable ist kontinuierlich; die Faktoren sind numerisch; die Residuen sind unabhängig."],
      whenToUse: ["Prozessoptimierung, Krümmung und Interaktion zwischen zwei Faktoren."],
      whenNotToUse: ["Kausale Aussagen ohne Versuchsplan, Wiederholungen und Randomisierung."],
      reading: [
        "Höhenlinien verbinden Faktorkombinationen mit derselben vorhergesagten Ergebnisgröße.",
        "Ein Sattelpunkt ist kein Optimum: Er steigt in eine Richtung und fällt in die andere.",
        "Ein vollfaktorieller Plan enthält jede Ecke; eine Halbfraktion spart Runs auf Kosten einiger Effekte.",
        "Im zentral zusammengesetzten Plan schätzen axiale Punkte die Krümmung, Zentralpunkte den reinen Fehler.",
      ],
      pitfalls: [
        "Die Oberfläche gilt nur innerhalb des beobachteten Faktorbereichs.",
        "Eine quadratische Anpassung ersetzt kein Versuchsdesign.",
        "Erzeugte Runs müssen weiterhin randomisiert und vor Störfaktoren geschützt werden.",
      ],
      charts: ["Responsefläche", "Konturkarte", "Modellkoeffizienten", "Plan-Karte"],
      glossary: [
        { term: "Stationärer Punkt", definition: "Der Punkt, an dem der Gradient der Oberfläche null ist." },
        { term: "Höhenlinie", definition: "Eine Linie mit konstanter vorhergesagter Ergebnisgröße." },
        { term: "CCD", definition: "Zentral zusammengesetzter Plan: faktorielle Ecken, axiale Punkte und Zentralruns." },
        { term: "Auflösung", definition: "Wie stark Haupteffekte in einer Fraktion mit Interaktionen vermengt sind." },
      ],
    },
    seeAlso: ["factorial", "regression"],
  },
  {
    id: "proportions",
    area: "procedures",
    title: "Anteile und Raten",
    summary: "Ein- und Zweistichprobentests für Anteile und Poisson-Raten.",
    tutorial: {
      goal: "Entscheiden, ob ein Anteil oder eine Ereignisrate von einem Zielwert oder zwischen zwei Gruppen abweicht.",
      dataset: "two_groups_binary.csv",
      steps: [
        "Wählen Sie einen oder zwei Anteile oder eine bzw. zwei Poisson-Raten.",
        "Wählen Sie das binäre Ergebnis (oder die Zählspalte) und die Gruppenspalte für die Zweistichprobenmodi.",
        "Legen Sie Erfolgsausprägung, Nullwert und Exposition je Zeile fest, wenn nötig.",
        "Führen Sie die Analyse aus und lesen Sie exakten Test, Intervall und Effektstärke.",
      ],
      expected: "Eine Tabelle mit Erfolgen, Versuchen, Schätzung, exaktem p und Intervall sowie Differenz oder Ratenverhältnis bei zwei Gruppen.",
    },
    advanced: {
      assumptions: [
        "Die Beobachtungen sind innerhalb und zwischen den Gruppen unabhängig.",
        "Poisson-Zählungen sind ganzzahlige Ereignisse mit bekannter Exposition und Varianz gleich dem Mittelwert.",
      ],
      whenToUse: ["Vergleich von Konversions-, Fehler- oder Inzidenzraten bzw. Zählungen je Expositionseinheit."],
      whenNotToUse: ["Wiederholte Messungen oder geclusterte Daten: Die Unabhängigkeit ist verletzt."],
      reading: [
        "Bei kleinen Zählungen ist das exakte p der Referenzwert; das asymptotische p ist eine Normalapproximation.",
        "Das Wilson-Intervall ist stabiler als das Wald-Intervall; Clopper–Pearson garantiert die nominale Abdeckung.",
        "Relatives Risiko und Odds Ratio ersetzen nicht die absolute Differenz.",
      ],
      pitfalls: [
        "Ein großes Odds Ratio kann bei seltenen Ereignissen eine winzige absolute Differenz verbergen.",
        "Die Exposition muss angegeben werden: Dieselbe Zählung bei unterschiedlicher Exposition ergibt unterschiedliche Raten.",
      ],
      charts: ["Intervallplot"],
      glossary: [
        { term: "Exaktes p", definition: "Wahrscheinlichkeit aller Ergebnisse, die unter der Nullhypothese mindestens so unwahrscheinlich sind wie das beobachtete." },
        { term: "Ratenverhältnis", definition: "Verhältnis zweier Ereignisraten; 1 bedeutet gleiche Raten." },
      ],
    },
    seeAlso: ["chisquare", "ttest"],
  },
  {
    id: "variances",
    area: "procedures",
    title: "Varianzen",
    summary: "Eine Varianz, F-Test und Bartlett/Levene für die Gleichheit der Streuungen.",
    tutorial: {
      goal: "Prüfen, ob eine Varianz von einem Zielwert oder zwischen Gruppen abweicht.",
      dataset: "plantgrowth.csv",
      steps: [
        "Wählen Sie eine Varianz oder zwei bzw. mehr Varianzen.",
        "Wählen Sie die numerische Variable und bei zwei oder mehr Gruppen die Gruppenspalte.",
        "Geben Sie für den Einstichprobentest die Nullvarianz ein.",
        "Führen Sie die Analyse aus und vergleichen Sie F, Bartlett und Levene, bevor Sie einen Mittelwerttest wählen.",
      ],
      expected: "Eine Varianztabelle mit exaktem Intervall sowie F-/Bartlett-/Levene-p-Werten bei Gruppen.",
    },
    advanced: {
      assumptions: [
        "Die Beobachtungen sind unabhängig und für χ² und F-Intervalle normalverteilt.",
        "Levene auf Medianen ist robuster, setzt aber unabhängige Gruppen voraus.",
      ],
      whenToUse: ["Homoskedastizität vor t-Test oder ANOVA prüfen oder die Streuung eines Prozesses vergleichen."],
      whenNotToUse: ["Bei sehr kleinen Gruppen haben die Tests wenig Power; bevorzugen Sie Welch-Verfahren."],
      reading: [
        "Der F-Test gilt für zwei Gruppen; bei mehr Gruppen Bartlett oder Levene verwenden.",
        "Bartlett ist unter Normalität leistungsfähig, wird aber durch Ausreißer und schwere Ränder verzerrt.",
        "Levene auf Medianen verringert den Einfluss von Extremen und ist die sichere Standardwahl.",
      ],
      pitfalls: [
        "Ein nicht signifikanter Test beweist keine gleichen Varianzen: Betrachten Sie Intervall und Boxplots.",
        "Die Varianz liegt auf der quadrierten Skala: Berichten Sie die Standardabweichung.",
      ],
      charts: ["Boxplot", "Intervallplot"],
      glossary: [
        { term: "Homoskedastizität", definition: "Gleichheit der Varianzen zwischen Gruppen, Voraussetzung von gepooltem t-Test und ANOVA." },
        { term: "Levene-Test", definition: "ANOVA über absolute Abweichungen von einem Gruppenmaß; die Medianvariante ist Brown–Forsythe." },
      ],
    },
    seeAlso: ["ttest", "anova"],
  },
];
