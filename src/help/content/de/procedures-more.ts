import type { HelpTopic } from '../types';

/** Procedure chapters: multivariate, categorical, survival, time series and design. */
export const moreTopics: HelpTopic[] = [
  {
    id: "wizard",
    area: "procedures",
    title: "Geführtes Verfahren",
    summary: "Von der Frage zum richtigen Verfahren, mit bereits gesetzten Variablen.",
    tutorial: {
      goal: "Nicht wissen, welchen Test Sie verwenden sollen, und sich vom Programm führen lassen.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie das geführte Verfahren und wählen Sie die Frage (beschreiben, vergleichen, vorhersagen).",
        "Legen Sie Ergebnis, Gruppen und fest, ob die Messungen unabhängig oder gepaart sind.",
        "Lesen Sie die Empfehlung und drücken Sie Öffnen, um das Verfahren zu laden.",
        "Führen Sie die Analyse aus und prüfen Sie die Annahmen im Lesetext.",
      ],
      expected: "Das vorgeschlagene Verfahren öffnet sich mit bereits ausgewählten Variablen.",
    },
    advanced: {
      whenToUse: ["Zu Beginn einer Analyse oder wenn das Design nicht offensichtlich ist."],
      reading: ["Behandeln Sie die Empfehlung als Ausgangspunkt, nicht als Urteil."],
      pitfalls: ["Der Assistent prüft keine Annahmen und kennt die Datenqualität nicht."],
      glossary: [
        { term: "Empfehlung", definition: "Das Verfahren, das aus Ergebnis, Gruppen und Design vorgeschlagen wird." },
      ],
    },
    seeAlso: ["choosing-test", "analysis-workflow"],
  },
  {
    id: "gee",
    area: "procedures",
    title: "GEE",
    summary: "Marginale Effekte mit clustergerobusten Standardfehlern.",
    tutorial: {
      goal: "Den durchschnittlichen Behandlungseffekt auf gruppierten Daten schätzen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das Ergebnis, die festen Prädiktoren und die Clusterspalte.",
        "Wählen Sie die Arbeitskorrelation (Unabhängigkeit oder Austauschbar).",
        "Führen Sie das Modell aus und lesen Sie die Koeffizienten mit robusten Fehlern.",
      ],
      expected: "Marginale Koeffizienten mit CI und ein Hinweis auf die verwendete Arbeitskorrelation.",
    },
    advanced: {
      assumptions: [
        "Beobachtungen innerhalb eines Clusters können korreliert sein; Ziel ist der Populationsdurchschnitt.",
      ],
      whenToUse: ["Längsschnitt- oder geclusterte Daten mit vielen Gruppen."],
      whenNotToUse: ["Wenige Cluster: Gemischte Modelle sind besser."],
      reading: ["Die Effekte sind marginal: über die Population gemittelt, nicht personenspezifisch."],
      pitfalls: ["Das Ändern der Arbeitskorrelation ändert die Standardfehler, nicht die Koeffizienten."],
      glossary: [
        { term: "Marginal", definition: "Ein über die Population gemittelter Effekt, nicht bedingt auf ein Cluster." },
        { term: "Austauschbar", definition: "Eine Korrelationsstruktur, die für jedes Paar innerhalb eines Clusters gleich ist." },
      ],
    },
    seeAlso: ["lmm", "repeatedanova"],
  },
  {
    id: "multivariate",
    area: "procedures",
    title: "Multivariate Analyse (PCA, α, EFA)",
    summary: "Variablen reduzieren, interne Konsistenz messen oder latente Faktoren suchen.",
    tutorial: {
      goal: "Sechs Items einer Skala zu wenigen Komponenten zusammenfassen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die Analyse: PCA zum Reduzieren, Cronbachs α für die Konsistenz, EFA für latente Faktoren.",
        "Wählen Sie die Items; aktivieren Sie die Korrelationsmatrix, wenn sich die Skalen unterscheiden.",
        "Führen Sie die Analyse aus und lesen Sie Eigenwerte, erklärte Varianz und Ladungen.",
      ],
      expected: "Komponenten oder Faktoren mit Ladungen, erklärter Varianz und Eignungsindizes (KMO, Bartlett).",
    },
    advanced: {
      assumptions: ["Items, die in dieselbe Richtung zeigen; vollständige Fälle; eine ausreichende Stichprobe."],
      whenToUse: ["Fragebögen erstellen oder validieren; korrelierte Variablen reduzieren."],
      whenNotToUse: ["Bei wenigen Fällen im Verhältnis zur Zahl der Items."],
      reading: [
        "Hohe absolute Ladungen bedeuten, dass das Item an diese Komponente gebunden ist.",
        "Ein sehr hohes α kann auf redundante Items hindeuten, nicht nur auf Konsistenz.",
      ],
      pitfalls: [
        "Zu rotieren und die Zahl der Faktoren beim Betrachten der Ergebnisse zu wählen führt zu nicht replizierbaren Lösungen.",
      ],
      glossary: [
        { term: "Ladung", definition: "Die Korrelation zwischen einem Item und einer Komponente oder einem Faktor." },
        { term: "KMO", definition: "Ein Index für die Eignung der Stichprobe bei der Faktorenanalyse." },
      ],
    },
    seeAlso: ["correlation", "mi"],
  },
  {
    id: "chisquare",
    area: "procedures",
    title: "Chi-Quadrat 2×2",
    summary: "Zusammenhang zwischen zwei binären Variablen, mit dem exakten Test nach Fisher.",
    tutorial: {
      goal: "Prüfen, ob sich der Anteil der Erfolge zwischen zwei Gruppen unterscheidet.",
      dataset: "score-groups.csv",
      steps: [
        "Geben Sie die Häufigkeiten in den vier Zellen ein oder verwenden Sie eine Vorlage.",
        "Aktivieren Sie den exakten Test nach Fisher.",
        "Führen Sie den Test aus und lesen Sie Chi-Quadrat, p und die Assoziationsmaße.",
      ],
      expected: "Häufigkeitstabelle, Chi-Quadrat mit Freiheitsgraden, Fisher und Odds Ratio mit CI.",
    },
    advanced: {
      assumptions: ["Unabhängige Beobachtungen; für Chi-Quadrat ausreichend große erwartete Häufigkeiten."],
      whenToUse: ["Zwei kategoriale Variablen mit je zwei Stufen."],
      whenNotToUse: ["Größere Tabellen (verwenden Sie R×C) oder gepaarte Messungen (McNemar)."],
      reading: ["Bei niedrigen erwarteten Häufigkeiten ist Fishers p zuverlässiger als Chi-Quadrat."],
      pitfalls: [
        "Prozentsätze, die auf der falschen Randverteilung berechnet werden, führen zu umgekehrten Schlussfolgerungen.",
      ],
      glossary: [
        { term: "Erwartete Häufigkeit", definition: "Die Anzahl, die Sie sehen würden, wenn die beiden Variablen unabhängig wären." },
        { term: "Odds Ratio", definition: "Das Verhältnis der Odds zwischen den beiden Gruppen." },
      ],
    },
    seeAlso: ["contingency", "logistic"],
  },
  {
    id: "contingency",
    area: "procedures",
    title: "R×C-Kontingenztabellen",
    summary: "Tabellen größer als 2×2, mit Assoziationsmaßen und Monte Carlo.",
    tutorial: {
      goal: "Den Zusammenhang zwischen Altersgruppe und Präferenz prüfen.",
      dataset: "score-groups.csv",
      steps: [
        "Fügen Sie Zeilen und Spalten hinzu, bis die Tabelle zu Ihren Daten passt.",
        "Geben Sie Häufigkeiten und Beschriftungen ein.",
        "Aktivieren Sie Monte Carlo, wenn viele Zellen niedrige erwartete Häufigkeiten haben.",
        "Führen Sie die Analyse aus und lesen Sie Chi-Quadrat, Cramér’s V und standardisierte Residuen.",
      ],
      expected: "Tabelle mit Randsummen, Chi-Quadrat, Cramér’s V und den Zellen, die den Zusammenhang tragen.",
    },
    advanced: {
      assumptions: ["Unabhängige Beobachtungen; angemessene erwartete Häufigkeiten."],
      whenToUse: ["Zwei kategoriale Variablen mit mehr als zwei Stufen."],
      whenNotToUse: ["Sehr dünn besetzte Tabellen mit wenigen Fällen: Erwägen Sie, Kategorien zusammenzuführen."],
      reading: [
        "Standardisierte Residuen jenseits von ±2 markieren die für den Zusammenhang verantwortlichen Zellen.",
      ],
      pitfalls: ["Cramér’s V hängt von der Tabellengröße ab: Vergleichen Sie nur ähnliche Tabellen."],
      glossary: [
        { term: "Cramér’s V", definition: "Ein Assoziationsmaß zwischen 0 und 1 für Tabellen jeder Größe." },
        { term: "Standardisiertes Residuum", definition: "Beobachtet minus erwartet, in Standardabweichungseinheiten." },
      ],
    },
    seeAlso: ["chisquare", "agreement"],
  },
  {
    id: "agreement",
    area: "procedures",
    title: "Übereinstimmung zwischen Messungen (ICC, Bland–Altman, Kappa)",
    summary: "Wie stark zwei Methoden oder Beurteiler übereinstimmen, nicht nur ob sie korrelieren.",
    tutorial: {
      goal: "Prüfen, ob zwei Messmethoden dasselbe Ergebnis liefern.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie ICC für kontinuierliche Messungen, Kappa für Kategorien, Bland–Altman für den grafischen Vergleich.",
        "Wählen Sie die beiden Spalten mit den Messungen derselben Person.",
        "Führen Sie die Analyse aus und lesen Sie den ICC mit CI oder das Diagramm mit den Übereinstimmungsgrenzen.",
      ],
      expected: "ICC mit Konfidenzintervall und Modelltyp oder ein Bland–Altman-Diagramm mit Verzerrung und Grenzen.",
    },
    advanced: {
      assumptions: [
        "Beide Messungen beziehen sich auf dieselben Einheiten; bei Kappa müssen die Kategorien übereinstimmen.",
      ],
      whenToUse: ["Validierung von Instrumenten, Vergleich zwischen Beurteilern, Wiederholbarkeit."],
      whenNotToUse: ["Um eine Beziehung zu schätzen: Übereinstimmung ist nicht Korrelation."],
      reading: [
        "Ein ICC nahe 1 bedeutet hohe Übereinstimmung; unter 0.5 ist sie schlecht.",
        "Bland–Altman zeigt, ob die zweite Methode systematisch über- oder unterschätzt.",
      ],
      pitfalls: [
        "Eine hohe Korrelation kann eine systematische Verzerrung verbergen: Sehen Sie sich immer die mittlere Differenz an.",
      ],
      glossary: [
        {
          term: "ICC",
          definition: "Intraklassenkorrelation: der Anteil der Streuung, der auf echte Unterschiede zwischen Personen zurückgeht.",
        },
        { term: "Übereinstimmungsgrenzen", definition: "Das Intervall, das 95 % der Differenzen zwischen den beiden Methoden enthält." },
      ],
    },
    seeAlso: ["correlation", "contingency"],
  },
  {
    id: "survival",
    area: "procedures",
    title: "Überleben (Kaplan–Meier)",
    summary: "Überlebenskurven und Log-Rank-Test für die Zeit bis zu einem Ereignis.",
    tutorial: {
      goal: "Die Zeit bis zur Genesung zwischen zwei Gruppen vergleichen.",
      dataset: "score-groups.csv",
      steps: [
        "Legen Sie die Zeitspalte und die Ereignisspalte fest (0/1).",
        "Wählen Sie die Gruppenvariable.",
        "Führen Sie die Analyse aus und lesen Sie den Log-Rank-Test und das mediane Überleben pro Gruppe.",
      ],
      expected: "Kaplan–Meier-Kurven, Zahlen unter Risiko, Log-Rank-p und Mediane mit CI.",
    },
    advanced: {
      assumptions: [
        "Nicht informative Zensierung: Personen, die die Studie verlassen, dürfen sich nicht systematisch unterscheiden.",
      ],
      whenToUse: ["Zeit bis zu einem Ereignis mit unvollständiger Nachbeobachtung."],
      whenNotToUse: [
        "Vollständig beobachtete Zeiten ohne Zensierung: Ein Vergleich von Mittelwert oder Median genügt.",
      ],
      reading: [
        "Der Log-Rank-Test vergleicht die Kurven über die gesamte Nachbeobachtung, nicht zu einem gewählten Zeitpunkt.",
      ],
      pitfalls: ["Das Ignorieren der Zensierung unterschätzt die Zeiten; Zeit null muss für alle definiert sein."],
      glossary: [
        { term: "Zensierung", definition: "Eine Beobachtung, die endet, bevor das Ereignis eintrat." },
        { term: "Log-Rank", definition: "Ein Test, der Überlebenskurven zwischen Gruppen vergleicht." },
      ],
    },
    seeAlso: ["cox", "parametric"],
  },
  {
    id: "cox",
    area: "procedures",
    title: "Cox-Proportional-Hazards",
    summary: "Effekt mehrerer Variablen auf das Hazard, ausgedrückt als Hazard Ratios.",
    tutorial: {
      goal: "Den Effekt des Alters auf das Ereignisrisiko schätzen, adjustiert für die Gruppe.",
      dataset: "score-groups.csv",
      steps: [
        "Legen Sie Zeit, Ereignis und Prädiktoren fest.",
        "Führen Sie das Modell aus und lesen Sie die Hazard Ratios mit CI.",
        "Prüfen Sie den Test auf proportionale Hazards.",
      ],
      expected: "Koeffizienten mit Hazard Ratios, CI, globale Tests und die Prüfung der Proportionalität.",
    },
    advanced: {
      assumptions: ["Proportionale Hazards: Der relative Effekt bleibt über die Zeit konstant."],
      whenToUse: ["Zeit bis zum Ereignis mit mehreren erklärenden Variablen."],
      whenNotToUse: ["Scheitert die Proportionalität, benötigen Sie ein zeitabhängiges Modell."],
      reading: [
        "Ein Hazard Ratio von 1.5 bedeutet ein um 50 % höheres momentanes Risiko, bei Konstanthaltung der anderen Variablen.",
      ],
      pitfalls: ["Ein großes HR bedeutet weder klinische Relevanz noch einen konstanten Effekt über die Zeit."],
      glossary: [
        { term: "Hazard Ratio", definition: "Das Verhältnis der momentanen Ereignisrisiken zwischen zwei Stufen." },
        { term: "Proportionalität", definition: "Der relative Effekt ändert sich nicht über die Zeit." },
      ],
    },
    seeAlso: ["survival", "stratcox", "tdcox"],
  },
  {
    id: "stratcox",
    area: "procedures",
    title: "Geschichtetes Cox",
    summary: "Eine eigene Basislinie pro Schicht und gemeinsame Koeffizienten.",
    tutorial: {
      goal: "Für ein Rekrutierungszentrum mit unterschiedlichen Basisrisiken adjustieren.",
      dataset: "score-groups.csv",
      steps: [
        "Legen Sie Zeit, Ereignis, Prädiktoren und die Schichtvariable fest.",
        "Führen Sie das Modell aus und prüfen Sie, ob jede Schicht genügend Ereignisse hat.",
        "Lesen Sie die gemeinsamen Koeffizienten und die Informationen pro Schicht.",
      ],
      expected: "Über die Schichten gemeinsame Koeffizienten, mit unterschiedlichen Basislinien und globalen Tests.",
    },
    advanced: {
      assumptions: ["Proportionale Hazards innerhalb jeder Schicht; keine Schätzung für den Schichteffekt selbst."],
      whenToUse: [
        "Wenn eine Variable die Proportionalität verletzt oder ein Design-Störfaktor ist (Zentrum, Charge).",
      ],
      whenNotToUse: ["Wenn Sie den Effekt der Schichtvariablen schätzen möchten."],
      reading: ["Das Modell liefert kein HR für die Schicht: Sie wird in die Basislinie aufgenommen."],
      pitfalls: ["Schichten mit wenigen Ereignissen machen die gemeinsamen Schätzungen instabil."],
      glossary: [
        { term: "Schicht", definition: "Eine Untergruppe mit eigener Basislinien-Hazardfunktion." },
        { term: "Basislinie", definition: "Das Referenz-Hazard, wenn alle Kovariaten null sind." },
      ],
    },
    seeAlso: ["cox", "tdcox"],
  },
  {
    id: "tdcox",
    area: "procedures",
    title: "Zeitabhängiges Cox",
    summary: "Kovariaten, die ihren Wert während der Nachbeobachtung ändern, im Start-Stopp-Format.",
    tutorial: {
      goal: "Den Effekt einer Behandlung modellieren, die während der Studie beginnt.",
      dataset: "score-groups.csv",
      steps: [
        "Organisieren Sie die Daten im Start-Stopp-Format: eine Zeile pro Zeitintervall.",
        "Legen Sie Start, Ende, Ereignis und die sich ändernden Kovariaten fest.",
        "Führen Sie das Modell aus und lesen Sie die Hazard Ratios mit CI.",
      ],
      expected: "Koeffizienten mit HR, Anzahl der Intervalle und Zeilen pro Person.",
    },
    advanced: {
      assumptions: ["Kovariaten fehlerfrei gemessen und vor dem Ereignis bekannt."],
      whenToUse: ["Behandlungen, die zu unterschiedlichen Zeiten beginnen, sich ändernde Expositionen."],
      whenNotToUse: ["Wenn die Kovariate vom künftigen Ergebnis abhängt: Gefahr umgekehrter Kausalität."],
      reading: ["Jede Zeile trägt für die Zeit bei, in der die Kovariate diesen Wert hat."],
      pitfalls: ["Eine Kovariate, die sich als Reaktion auf das Ergebnis ändert, erzeugt verzerrte Schätzungen."],
      glossary: [
        { term: "Start-Stopp", definition: "Ein Format, bei dem jede Zeile ein Zeitintervall mit seinen Werten ist." },
        { term: "Interne Zensierung", definition: "Intervalle, die ohne Ereignis enden, während die Nachbeobachtung weiterläuft." },
      ],
    },
    seeAlso: ["cox", "stratcox"],
  },
  {
    id: "parametric",
    area: "procedures",
    title: "Parametrisches Überleben (AFT)",
    summary: "Weibull- und Exponentialmodelle für die Zeit bis zum Ereignis.",
    tutorial: {
      goal: "Parametrische Schätzungen und vorhergesagte Zeiten erhalten, nicht nur Hazard Ratios.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die Verteilung (Weibull oder Exponential).",
        "Legen Sie Zeit, Ereignis und Prädiktoren fest.",
        "Führen Sie das Modell aus und lesen Sie die Koeffizienten auf der Zeitskala und den Formparameter.",
      ],
      expected: "AFT-Koeffizienten, Formparameter mit CI und Kriterien zum Vergleich der Verteilungen.",
    },
    advanced: {
      assumptions: ["Die gewählte Verteilung beschreibt die Zeiten tatsächlich; Ereignis 0/1; positive Zeiten."],
      whenToUse: ["Wenn Sie eine vorhergesagte Zeit benötigen, nicht nur ein Hazard Ratio."],
      whenNotToUse: ["Wenn die Form der Verteilung deutlich anders ist."],
      reading: ["Auf der AFT-Skala verkürzt ein negativer Koeffizient die erwartete Zeit bis zum Ereignis."],
      pitfalls: ["Die Verteilung aus den Daten zu wählen und dann ihre Anpassung nicht zu prüfen."],
      glossary: [
        { term: "AFT", definition: "Accelerated Failure Time: ein Modell, das die erwartete Zeit mit einem Faktor multipliziert." },
        { term: "Formparameter", definition: "Bestimmt, wie sich das momentane Risiko über die Zeit ändert." },
      ],
    },
    seeAlso: ["survival", "cox", "distfit"],
  },
  {
    id: "timeseries",
    area: "procedures",
    title: "Zeitreihe (ARIMA)",
    summary: "Trend, Saisonalität und Prognosen mit ARIMA/SARIMA.",
    tutorial: {
      goal: "Die nächsten Werte einer Monatsreihe prognostizieren.",
      dataset: "score-groups.csv",
      steps: [
        "Legen Sie die Spalte der Reihe und gegebenenfalls die saisonale Periode fest.",
        "Lassen Sie die Differenzenbildung beim ersten Lauf auf Automatisch (ADF).",
        "Legen Sie den Prognosehorizont fest und führen Sie die Analyse aus.",
        "Prüfen Sie die Residuen: kein sichtbares Muster und begrenzte Autokorrelation.",
      ],
      expected: "Parameterschätzungen, Residuendiagnostik, Prognosen mit Intervallen und das Diagramm der Reihe.",
    },
    advanced: {
      assumptions: ["Stationarität nach der Differenzenbildung; Residuen nahe an weißem Rauschen."],
      whenToUse: ["Reihen mit Autokorrelationsstruktur und genügend Beobachtungen."],
      whenNotToUse: ["Sehr kurze Reihen oder strukturelle Brüche, die nicht modelliert werden."],
      reading: [
        "Die Ordnungen p, d, q beschreiben Gedächtnis, Differenzenbildung und gleitenden Durchschnitt; bei gleicher Spezifikation ist ein niedrigeres AIC vorzuziehen.",
      ],
      pitfalls: ["Prognosen über lange Horizonte haben breite Intervalle: Stellen Sie sie nicht als sicher dar."],
      glossary: [
        { term: "Stationarität", definition: "Mittelwert und Varianz bleiben über die Zeit stabil." },
        { term: "SARIMA", definition: "ARIMA mit einer saisonalen Komponente." },
      ],
    },
    seeAlso: ["regression", "distfit"],
  },
  {
    id: "mi",
    area: "procedures",
    title: "Fehlende Daten (multiple Imputation)",
    summary: "Imputation mit verketteten Gleichungen und Rubin-Pooling.",
    tutorial: {
      goal: "Fehlende Daten behandeln, ohne Fälle zu löschen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die Modellvariablen und die Hilfsvariablen.",
        "Legen Sie die Zahl der Imputationen (mindestens 5) und die Iterationen fest.",
        "Führen Sie die Analyse aus und lesen Sie die gepoolten Schätzungen mit CI und den Anteil fehlender Information.",
      ],
      expected: "Gepoolte Schätzungen, Standardfehler zwischen den Imputationen und Diagnostik zur Zahl der Imputationen.",
    },
    advanced: {
      assumptions: ["MAR: Das Fehlen hängt von beobachteten Variablen ab, nicht von den unbeobachteten Werten."],
      whenToUse: ["Fehlende Werte über mehrere Variablen verteilt, mit einem definierten Analysemodell."],
      whenNotToUse: ["Systematisches, an das Ergebnis gebundenes Fehlen (MNAR) ohne explizites Modell."],
      reading: ["Ein hoher Anteil fehlender Information legt nahe, die Zahl der Imputationen zu erhöhen."],
      pitfalls: ["Die Ergebnisvariable zu imputieren kann Zusammenhänge verdecken; verwenden Sie es mit Vorsicht."],
      glossary: [
        { term: "MAR", definition: "Das Fehlen hängt von beobachteten Variablen ab, nicht vom fehlenden Wert selbst." },
        { term: "Rubin-Pooling", definition: "Regeln, die Schätzungen und Unsicherheit über die Imputationen kombinieren." },
      ],
    },
    seeAlso: ["data-clean", "lmm"],
  },
  {
    id: "samplesize",
    area: "procedures",
    title: "Stichprobengröße und Power",
    summary: "Wie viele Fälle Sie brauchen oder wie viel Power Ihre Fälle liefern.",
    tutorial: {
      goal: "Berechnen, wie viele Personen ein t-Test für zwei Gruppen benötigt.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das Design (z. B. Zwei unabhängige Mittelwerte).",
        "Geben Sie die erwartete Differenz, die Standardabweichung, α und die gewünschte Power ein.",
        "Führen Sie die Berechnung aus und lesen Sie n pro Gruppe und das Gesamt-n.",
      ],
      expected: "Stichprobengröße pro Gruppe und insgesamt, mit Hinweisen zu Rundung und erwarteten Dropouts.",
    },
    advanced: {
      assumptions: ["Differenz und Streuung sind Designhypothesen, keine Ergebnisse."],
      whenToUse: ["Vor der Datenerhebung; um die Power einer bereits durchgeführten Studie zu beurteilen."],
      whenNotToUse: ["Verwenden Sie die beobachtete Post-hoc-Power nicht als Beweis für die Validität."],
      reading: ["Kleinere erwartete Differenzen oder eine höhere geforderte Power erhöhen n deutlich."],
      pitfalls: ["Eine zu hoch angesetzte erwartete Differenz erzeugt eine unterpowerte Studie."],
      glossary: [
        { term: "Power", definition: "Die Wahrscheinlichkeit, einen tatsächlich vorhandenen Effekt zu entdecken." },
        { term: "Minimal relevante Differenz", definition: "Der kleinste Effekt, der klinisch von Bedeutung wäre." },
      ],
    },
    seeAlso: ["tost", "resampling"],
  },
  {
    id: "resampling",
    area: "procedures",
    title: "Resampling",
    summary: "Permutations- und Bootstrap-Inferenz als Alternative zu klassischen Tests.",
    tutorial: {
      goal: "Zwei Gruppen vergleichen, ohne Normalität vorauszusetzen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die Statistik (Differenz der Mittelwerte oder Mediane) und die Variablen.",
        "Legen Sie die Zahl der Permutationen und der Bootstrap-Wiederholungen fest.",
        "Führen Sie die Analyse aus und lesen Sie das Permutations-p und das Bootstrap-Intervall.",
      ],
      expected: "Nullverteilung, Permutations-p und Bootstrap-Intervall der Differenz.",
    },
    advanced: {
      assumptions: ["Austauschbarkeit zwischen den Gruppen unter der Nullhypothese; eine repräsentative Stichprobe."],
      whenToUse: ["Kleine Stichproben, nicht standardisierte Statistiken, schiefe Verteilungen."],
      whenNotToUse: ["Abhängige Daten ohne einen angemessenen Resampling-Plan."],
      reading: ["Das Permutations-p setzt keine Normalität voraus, hängt aber von der Zahl der Permutationen ab."],
      pitfalls: ["Zu wenige Wiederholungen ergeben instabile p-Werte: Verwenden Sie mindestens einige Tausend."],
      glossary: [
        { term: "Permutation", definition: "Zufällige Neuzuweisung der Gruppenzuordnung." },
        { term: "Bootstrap", definition: "Resampling mit Zurücklegen, um die Streuung zu schätzen." },
      ],
    },
    seeAlso: ["nonparamrm", "samplesize"],
  },
];
