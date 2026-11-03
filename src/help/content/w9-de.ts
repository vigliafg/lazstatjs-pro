import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Verfahren der Welle 9: Stichprobe, Lernen, Text, Wahl, Bayes, Meta und räumlich. */
export const w9Topics: HelpTopic[] = [
  procedureTopic({
    id: 'survey',
    title: 'Komplexe Stichprobe',
    summary: 'Designbasierte Mittelwerte, Summen, Anteile und Regression mit Gewichten, Schichten und Clustern.',
    goal: 'Eine Populationsgröße aus einer nicht einfach-zufälligen Stichprobe mit ihren Gewichten und ihrem Design schätzen.',
    steps: [
      'Wählen Sie die Variable und den Schätzer: Mittelwert, Summe, Anteil oder gewichtete Regression.',
      'Im erweiterten Bereich Gewicht, Schicht und Cluster angeben, wenn das Design sie vorsieht.',
      'Starten und Schätzung, Standardfehler, Konfidenzintervall und Designeffekt lesen.',
    ],
    expected: 'Eine Designtabelle, die Schätzungen mit designbasierten Intervallen und bei der Regression die gewichteten Koeffizienten.',
    whenToUse: [
      'Wenn die Einschlusswahrscheinlichkeiten ungleich sind oder die Stichprobe geschichtet und geclustert erhoben wurde.',
      'Wenn ein roher Mittelwert durch über- oder unterrepräsentierte Gruppen verzerrt wäre.',
    ],
    reading: [
      'Ein Designeffekt über 1 bedeutet, dass das Design weniger effizient ist als eine einfache Zufallsstichprobe gleicher gewichteter Größe.',
      'Schichtung senkt die Varianz meist, Cluster erhöhen sie, weil nahe Einheiten sich ähneln.',
    ],
    pitfalls: [
      'Stichprobengewichte als Häufigkeitsgewichte behandeln: die Schätzung ändert sich und der Standardfehler ist falsch.',
      'Die Clusterspalte ignorieren und annehmen, jede Zeile sei unabhängig.',
    ],
    charts: ['Schätzung und Konfidenzintervall.', 'Forest-Plot der gewichteten Regressionskoeffizienten.'],
    seeAlso: ['descriptive', 'regression'],
  }),
  procedureTopic({
    id: 'ml',
    title: 'Maschinelles Lernen',
    summary: 'Random Forest, Gradient Boosting und ein neuronales Netz mit einer versteckten Schicht für numerische Ergebnisse.',
    goal: 'Ein numerisches Ergebnis aus mehreren Prädiktoren vorhersagen, ohne eine lineare oder parametrische Form vorzugeben.',
    steps: [
      'Das numerische Ergebnis und mindestens einen numerischen Prädiktor wählen.',
      'Random Forest, Gradient Boosting oder neuronales Netz wählen.',
      'Bäume, minimale Knotengröße, Schrumpfung oder versteckte Einheiten setzen und einen festen Seed behalten.',
    ],
    expected: 'Anpassungsmaße, Variablenwichtigkeit für die Baummodelle, Vorhersagen und Residuendiagramme.',
    whenToUse: [
      'Wenn die Beziehung nicht linear ist oder Interaktionen enthält, die eine Regression verpassen würde.',
      'Wenn das Ziel die Vorhersage ist und keine interpretierbaren Koeffizienten nötig sind.',
    ],
    reading: [
      'Internes R² mit dem Out-of-Bag-R² vergleichen: eine große Lücke deutet auf Overfitting hin.',
      'Die Wichtigkeit misst die Fehlerreduktion in den Bäumen; sie ist kein kausaler Effekt.',
    ],
    pitfalls: [
      'Das Modell auf denselben Daten wählen, mit denen seine Leistung berichtet wird.',
      'Sehr wenige Daten verwenden: Bäume und Netze lernen das Rauschen schnell auswendig.',
    ],
    charts: ['Beobachtet und vorhergesagt.', 'Residuen und Vorhersagen.', 'Variablenwichtigkeit.'],
    seeAlso: ['regression', 'partition'],
  }),
  procedureTopic({
    id: 'text',
    title: 'Text Mining',
    summary: 'Termhäufigkeiten, TF-IDF, Dokumentähnlichkeit und ein nicht-negatives Themenmodell.',
    goal: 'Ein Korpus kurzer Texte beschreiben und die Begriffe und Themen finden, die Dokumente unterscheiden.',
    steps: [
      'Die Textspalte und optional eine Gruppenspalte wählen.',
      'Häufigkeiten, TF-IDF, Dokumentähnlichkeit oder Themen wählen.',
      'Vokabulargröße, minimale Dokumenthäufigkeit und Anzahl der Themen setzen.',
    ],
    expected: 'Eine Termtabelle, eine Dokument-Term-Ansicht, eine Ähnlichkeitsmatrix oder eine Themenliste mit den wichtigsten Begriffen.',
    whenToUse: [
      'Wenn die Daten offene Antworten, Kommentare, Titel oder kurze Dokumente enthalten.',
      'Wenn vor dem Lesen der Texte eine explorative Karte des Vokabulars nötig ist.',
    ],
    reading: [
      'TF-IDF gewichtet Begriffe ab, die fast überall vorkommen, und hebt unterscheidende Wörter hervor.',
      'Themen und Ähnlichkeiten sind relativ zum Korpus: sie gelten nicht automatisch für anders gefilterte Texte.',
    ],
    pitfalls: [
      'Vergessen, dass Stoppwörter von Sprache und Bereinigung abhängen.',
      'Die Anzahl der Themen als entdeckte Wahrheit statt als Modellentscheidung lesen.',
    ],
    charts: ['Häufigste Begriffe.', 'Themenprävalenz.', 'Dokument-Thema- oder Ähnlichkeits-Heatmap.'],
    seeAlso: ['descriptive', 'cluster'],
  }),
  procedureTopic({
    id: 'choice',
    title: 'Wahl / MaxDiff',
    summary: 'Bedingtes Logit für Auswahlmengen und Best-Worst-Scores für MaxDiff-Experimente.',
    goal: 'Erklären, welche Attribute die Wahl zwischen Alternativen treiben, oder Elemente aus Best-Worst-Aufgaben ordnen.',
    steps: [
      'Für ein Wahlexperiment Auswahlmenge, Alternative, Wahlindikator und die variierenden Attribute wählen.',
      'Für MaxDiff die Spalten Block, Element, bestes und schlechtestes wählen.',
      'Starten und Koeffizienten, vorhergesagte Anteile oder die MaxDiff-Rangliste lesen.',
    ],
    expected: 'Eine Koeffiziententabelle mit Standardfehlern, beobachtete und vorhergesagte Anteile oder eine MaxDiff-Score-Tabelle.',
    whenToUse: [
      'Wenn Befragte eine Alternative aus einer Menge wählen und die Attribute zwischen Alternativen variieren.',
      'Wenn eine Best-Worst-Aufgabe viele Elemente ordnet, ohne eine vollständige Rangliste zu verlangen.',
    ],
    reading: [
      'Ein positiver Koeffizient erhöht die Wahrscheinlichkeit, die Alternative mit diesem Attribut zu wählen.',
      'Das bedingte Logit nutzt nur die Variation innerhalb der Menge: konstante Attribute fallen heraus.',
    ],
    pitfalls: [
      'Attribute aufnehmen, die innerhalb der Mengen nicht variieren: sie sind nicht identifiziert.',
      'Mengen ohne gewählte Alternative oder mit mehr als einer Wahl lassen.',
    ],
    charts: ['Forest-Plot der Koeffizienten.', 'Beobachtete und vorhergesagte Anteile.', 'MaxDiff-Scores und Intervalle.'],
    seeAlso: ['conjoint', 'logistic'],
  }),
  procedureTopic({
    id: 'bayes',
    title: 'Bayes-Analyse',
    summary: 'Posterior-Zusammenfassungen und MCMC-Diagnostik für konjugierte Modelle und Gauß-Regression.',
    goal: 'Die Likelihood mit einer Priori-Verteilung kombinieren und den Parameter durch seine Posterior-Verteilung beschreiben.',
    steps: [
      'Das Modell wählen: Normalmittelwert, binomialer Anteil, Poisson-Rate oder lineare Regression.',
      'Das Ergebnis und bei der Regression die Prädiktoren wählen.',
      'Priori, Iterationen, Burn-in und Anzahl der Ketten setzen.',
    ],
    expected: 'Eine Posterior-Tabelle mit Mittelwert, Median, zentralem Intervall, HDI, Rhat und ESS, dazu Histogramm und Intervallgrafik.',
    whenToUse: [
      'Wenn Vorwissen oder wenige Daten eine Posterior-Zusammenfassung natürlicher machen.',
      'Wenn die vollständige Unsicherheit eines Parameters gebraucht wird, nicht nur ein Punktschätzer.',
    ],
    reading: [
      'Das 95%-HDI ist das kürzeste Intervall, das 95% der Posterior-Masse enthält.',
      'Rhat nahe 1 und hohes ESS zeigen gemischte Ketten; über 1,05 sind mehr Iterationen nötig.',
    ],
    pitfalls: [
      'Eine vage Priori mit sehr wenigen Beobachtungen verwenden und das Ergebnis als objektiv lesen.',
      'Schätzungen aus nicht konvergierten Ketten berichten.',
    ],
    charts: ['Posterior-Histogramm.', 'Posterior-Intervalle mit HDI.', 'Gemeinsame Posteriori zweier Parameter.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'meta',
    title: 'Meta-Analyse',
    summary: 'Fixed- und Random-Effects-Pooling mit Heterogenität, Forest- und Funnel-Plots.',
    goal: 'Die Effekte mehrerer Studien kombinieren und quantifizieren, wie stark sie voneinander abweichen.',
    steps: [
      'Die Effektspalte und ihre Standardfehlerspalte wählen, optional die Studienbezeichnung.',
      'DerSimonian–Laird, REML oder feste Effekte für die Zwischenstudienvarianz wählen.',
      'Starten und gepoolten Effekt, Q, I², τ², Vorhersageintervall und Egger-Test lesen.',
    ],
    expected: 'Eine Pooled-Tabelle, eine Heterogenitätstabelle, die Studientabelle, ein Forest-Plot und ein Funnel-Plot.',
    whenToUse: [
      'Wenn mehrere Studien denselben Effekt schätzen und eine Zusammenfassung mit Unsicherheit nötig ist.',
      'Wenn die Frage die Konsistenz der Evidenz betrifft, nicht nur den Mittelwert.',
    ],
    reading: [
      'I² ist der Anteil der Gesamtvariabilität durch Heterogenität; über 50% gilt oft als substanziell.',
      'Das Vorhersageintervall beschreibt, wo der Effekt einer neuen Studie läge, nicht die Präzision des Mittelwerts.',
    ],
    pitfalls: [
      'Effekte auf verschiedenen Skalen ohne vorherige Umrechnung poolen.',
      'Den Egger-Test als Beweis für Publikationsbias lesen: er zeigt Asymmetrie, kein Urteil.',
    ],
    charts: ['Forest-Plot der Studien und des gepoolten Effekts.', 'Funnel-Plot.', 'Studiengewichte.'],
    seeAlso: ['regression', 'samplesize'],
  }),
  procedureTopic({
    id: 'spatial',
    title: 'Räumliche Statistik',
    summary: 'Moran- und Geary-Tests, lokale Indikatoren und Spatial-Lag-Modell auf Koordinaten.',
    goal: 'Prüfen, ob nahe Einheiten sich stärker ähneln als bei zufälliger Anordnung, und die räumliche Abhängigkeit modellieren.',
    steps: [
      'Die numerische Variable und die beiden Koordinatenspalten wählen.',
      'Moran I, Geary C, lokale Indikatoren oder das Spatial-Lag-Modell wählen.',
      'Nächste Nachbarn und Permutationen setzen; für SAR die Prädiktoren ergänzen.',
    ],
    expected: 'Eine Tabelle zur globalen Autokorrelation, eine Karte, lokale Indikatoren und bei SAR der Lag-Koeffizient und die Regression.',
    whenToUse: [
      'Wenn Beobachtungen georeferenziert sind und Nähe Abhängigkeit erzeugen kann.',
      'Wenn lokale Cluster oder Ausreißer vor der Modellierung gefunden werden sollen.',
    ],
    reading: [
      'Moran I über dem Erwartungswert zeigt positive, darunter negative Autokorrelation.',
      'Permutations-p-Werte setzen keine Normalität voraus, hängen aber von der Zahl der Permutationen ab.',
    ],
    pitfalls: [
      'Die Gewichtsmatrix als gegeben behandeln: anderes k oder Distanzschwelle ändern die Ergebnisse.',
      'Räumliche Autokorrelation als kausalen Effekt der Nachbarn lesen.',
    ],
    charts: ['Karte der Werte oder LISA-Cluster.', 'Lokale Indikatoren.', 'SAR-Koeffizienten.'],
    seeAlso: ['correlation', 'regression'],
  }),
];
