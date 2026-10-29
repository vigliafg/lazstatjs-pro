import type { HelpTopic } from '../types';

/** Procedure chapters: description, comparison of means and regression models. */
export const coreTopics: HelpTopic[] = [
  {
    id: "descriptive",
    area: "procedures",
    title: "Deskriptive Statistik",
    summary: "Mittelwert, Streuung, Quantile, fehlende Werte und Normalitätsprüfungen für jede Variable.",
    tutorial: {
      goal: "Die numerischen Variablen einer Studie zusammenfassen, bevor Sie einen Test wählen.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie Deskriptiv aus der Familie Deskriptiv.",
        "Wählen Sie die numerischen Variablen (Score, Age) und lassen Sie das Konfidenzniveau bei 95 %.",
        "Drücken Sie „Analyse ausführen“ und lesen Sie die Zeile jeder Variable.",
        "Prüfen Sie die Spalte der fehlenden Werte und den Normalitätstest, bevor Sie Gruppen vergleichen.",
      ],
      expected: "Eine Zeile pro Variable mit N, Mittelwert, Standardabweichung, Median, Quartilen, Minimum und Maximum sowie dem Ergebnis der Normalitätsprüfung.",
    },
    advanced: {
      assumptions: ["Mittelwert und Standardabweichung setzen eine quantitative Variable voraus."],
      whenToUse: [
        "Immer, als ersten Schritt: Es zeigt die Form der Daten und die auffälligen Werte.",
        "Um zwischen parametrischen und nicht parametrischen Tests zu entscheiden.",
      ],
      whenNotToUse: ["Bei kategorialen Variablen: Verwenden Sie Häufigkeiten, nicht den Mittelwert."],
      reading: [
        "Ein weit vom Median entfernter Mittelwert deutet auf Schiefe oder extreme Werte hin.",
        "Normalitätstests sind hinweisend: Bei großem N sind sie überempfindlich, bei kleinem N zu schwach.",
      ],
      pitfalls: [
        "Geben Sie die Standardabweichung niemals als Standardfehler aus: Es sind verschiedene Größen.",
        "Ein einzelner Ausreißer kann Mittelwert und Standardabweichung dominieren.",
      ],
      glossary: [
        {
          term: "Standardabweichung",
          definition: "Durchschnittliche Streuung der Werte um den Mittelwert, in derselben Einheit wie die Daten.",
        },
        { term: "Quantil", definition: "Der Wert, unterhalb dessen ein bestimmter Prozentsatz der Beobachtungen liegt." },
      ],
    },
    seeAlso: ["distfit", "ttest"],
  },
  {
    id: "distfit",
    area: "procedures",
    title: "Verteilungsanpassung",
    summary: "Die beobachtete Verteilung mit theoretischen Familien vergleichen und die beste wählen.",
    tutorial: {
      goal: "Herausfinden, welche theoretische Verteilung eine Variable am besten beschreibt.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie das Verfahren und wählen Sie die numerische Variable.",
        "Markieren Sie die zu vergleichenden Verteilungen (Normal, Lognormal, Gamma, Weibull…).",
        "Führen Sie es aus und lesen Sie die Tabelle der Anpassungsgüte.",
        "Führen Sie es erneut nur mit der besten Verteilung aus, um das Vergleichsdiagramm zu erhalten.",
      ],
      expected: "Die Verteilung mit dem besten Kriterium wird hervorgehoben; das Diagramm überlagert die theoretische Dichte und das beobachtete Histogramm.",
    },
    advanced: {
      assumptions: ["Die Beobachtungen müssen unabhängig sein."],
      whenToUse: ["Um eine Familie zu wählen, bevor Sie Zeiten, Zähler oder Beträge modellieren."],
      whenNotToUse: ["Bei weniger als einigen Dutzend Fällen lassen sich die Familien kaum unterscheiden."],
      reading: [
        "Ein niedrigeres AIC/BIC bedeutet eine bessere Anpassung.",
        "Ein p-Wert der Anpassungsgüte beweist keine Normalität: Er misst nur die Evidenz dagegen.",
      ],
      pitfalls: [
        "Die Verteilung aus den Daten zu wählen und sie dann an denselben Daten zu prüfen, überschätzt die Anpassung.",
      ],
      glossary: [
        { term: "AIC", definition: "Ein Kriterium, das die Anpassung belohnt und die Zahl der Parameter bestraft." },
        { term: "Lognormal", definition: "Eine Verteilung, deren Logarithmus normal ist; typisch für Beträge und Zeiten." },
      ],
    },
    seeAlso: ["descriptive", "parametric"],
  },
  {
    id: "ttest",
    area: "procedures",
    title: "T-Test",
    summary: "Zwei Mittelwerte oder zwei gepaarte Messungen vergleichen, mit einer nicht parametrischen Alternative.",
    tutorial: {
      goal: "Prüfen, ob sich der mittlere Score zwischen zwei unabhängigen Gruppen unterscheidet.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie den T-Test und setzen Sie Testart = Unabhängige Stichproben.",
        "Variable 1 = Score, Variable 2 = Group.",
        "Lassen Sie Varianzen auf Welch, sofern Sie nicht wissen, dass sie gleich sind.",
        "Führen Sie ihn aus und lesen Sie Differenz, Konfidenzintervall und p-Wert.",
      ],
      expected: "Zwei deskriptive Zeilen, der t-Test mit Freiheitsgraden, die Differenz mit ihrem CI und der Lesetext.",
    },
    advanced: {
      assumptions: [
        "Unabhängige Beobachtungen; beim gepaarten Test ein Zusammenhang zwischen den beiden Messungen derselben Person.",
        "Bei kleinem N Normalität oder zumindest keine starke Schiefe.",
      ],
      whenToUse: ["Zwei Gruppen oder zwei Zeitpunkte, numerisches Ergebnis."],
      whenNotToUse: ["Mehr als zwei Gruppen (verwenden Sie die ANOVA) oder ein kategoriales Ergebnis."],
      reading: [
        "Der p-Wert beantwortet „wie vereinbar ist das mit keiner Differenz“, nicht die Wahrscheinlichkeit, dass die Nullhypothese wahr ist.",
        "Das Konfidenzintervall zeigt auch, wie groß die Differenz sein könnte: Beurteilen Sie die praktische Relevanz.",
      ],
      pitfalls: [
        "Viele Paare ohne Korrektur zu vergleichen bläht falsch positive Ergebnisse auf.",
        "Ein nicht signifikantes Ergebnis beweist keine Gleichheit: Sehen Sie sich das Intervall an.",
      ],
      glossary: [
        { term: "Welch", definition: "Die t-Test-Variante, die keine gleichen Varianzen voraussetzt." },
        { term: "Cohen's d", definition: "Effektstärke, ausgedrückt in Standardabweichungseinheiten." },
      ],
    },
    seeAlso: ["anova", "nonparamrm", "tost"],
  },
  {
    id: "anova",
    area: "procedures",
    title: "Einfaktorielle ANOVA",
    summary: "Die Mittelwerte von zwei oder mehr Gruppen mit Post-hoc-Tests und Kruskal-Wallis vergleichen.",
    tutorial: {
      goal: "Wissen, ob sich der mittlere Score über drei Behandlungsgruppen ändert.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie die ANOVA, setzen Sie Abhängige Variable = Score und Gruppenvariable = Group.",
        "Lassen Sie Post-hoc = Holm und aktivieren Sie die nicht parametrische Alternative.",
        "Führen Sie sie aus und prüfen Sie die Haupttabelle, dann die Post-hoc-Vergleiche.",
      ],
      expected: "ANOVA-Tabelle mit F, Freiheitsgraden und p; Post-hoc-Differenzen mit CI; Kruskal-Wallis als Kontrolle.",
    },
    advanced: {
      assumptions: ["Unabhängigkeit, normale Residuen, ähnliche Varianzen zwischen den Gruppen."],
      whenToUse: ["Ein Zwischen-Personen-Faktor mit drei oder mehr Stufen."],
      whenNotToUse: [
        "Wiederholte Messungen (verwenden Sie die Messwiederholungs-ANOVA) oder zwei Gruppen (der t-Test ist äquivalent).",
      ],
      reading: [
        "Ein signifikantes p sagt, dass mindestens ein Mittelwert abweicht: Der Post-hoc-Test sagt, welcher.",
        "Ein signifikanter Levene-Test deutet auf ungleiche Varianzen hin: Bevorzugen Sie Welch oder Kruskal-Wallis.",
      ],
      pitfalls: [
        "Wählen Sie den Post-hoc-Test, bevor Sie die Daten betrachten, nicht danach.",
        "Eine erneute ANOVA auf nachträglich gewählten Untergruppen bläht falsch positive Ergebnisse auf.",
      ],
      glossary: [
        { term: "Post-hoc", definition: "Paarweise Vergleiche, die nach einem signifikanten globalen Test ausgeführt werden." },
        {
          term: "Holm",
          definition: "Eine p-Wert-Korrektur, die den familienbezogenen Fehler kontrolliert, ohne zu konservativ zu sein.",
        },
      ],
    },
    seeAlso: ["factorial", "ancova", "nonparamrm"],
  },
  {
    id: "factorial",
    area: "procedures",
    title: "Faktorielle ANOVA",
    summary: "Zwei Zwischen-Personen-Faktoren, Haupteffekte und ihre Interaktion.",
    tutorial: {
      goal: "Prüfen, ob ein Behandlungseffekt vom Geschlecht der Teilnehmenden abhängt.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die abhängige Variable und die beiden Faktoren (Faktor A, Faktor B).",
        "Aktivieren Sie „Interaktion A × B einschließen“.",
        "Führen Sie sie aus und lesen Sie die Effekttabelle: A, B und A × B.",
        "Wenn die Interaktion signifikant ist, besprechen Sie die Zellmittelwerte statt nur der Haupteffekte.",
      ],
      expected: "Eine Zeile pro Effekt mit F, Freiheitsgraden, p und Effektstärke, plus die Zellmittelwerte.",
    },
    advanced: {
      assumptions: ["Unabhängigkeit, normale Residuen, ähnliche Varianzen in den Zellen."],
      whenToUse: ["Zwei kategoriale Zwischen-Personen-Faktoren mit genügend Fällen pro Zelle."],
      whenNotToUse: ["Zellen mit sehr wenigen Fällen machen die Interaktion instabil."],
      reading: [
        "Ein signifikanter Haupteffekt bei signifikanter Interaktion muss mit Vorsicht gelesen werden.",
        "Die Zellmittelwerte zeigen die Richtung der Interaktion.",
      ],
      pitfalls: [
        "Bei unbalancierten Designs ändert die Reihenfolge der Terme die Ergebnisse: Prüfen Sie die Art der Quadratsummen.",
      ],
      glossary: [
        { term: "Interaktion", definition: "Wenn sich der Effekt eines Faktors über die Stufen des anderen ändert." },
        { term: "Haupteffekt", definition: "Der durchschnittliche Effekt eines Faktors unter Vernachlässigung des anderen." },
      ],
    },
    seeAlso: ["anova", "mixedanova"],
  },
  {
    id: "ancova",
    area: "procedures",
    title: "ANCOVA",
    summary: "Gruppen vergleichen und dabei für kontinuierliche Kovariaten adjustieren, mit adjustierten Mittelwerten.",
    tutorial: {
      goal: "Gruppen vergleichen und dabei das Alter der Teilnehmenden berücksichtigen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie die abhängige Variable, den Gruppenfaktor und mindestens eine Kovariate.",
        "Führen Sie sie aus und prüfen Sie den Test auf Homogenität der Steigungen.",
        "Lesen Sie die adjustierten Mittelwerte mit Konfidenzintervallen und die Holm-Vergleiche.",
      ],
      expected: "Gruppeneffekt adjustiert für die Kovariaten, adjustierte Mittelwerte und Diagnostik der Steigungen.",
    },
    advanced: {
      assumptions: [
        "Eine lineare Beziehung zwischen Kovariate und Ergebnis innerhalb jeder Gruppe.",
        "Homogene Steigungen: Ist der Test signifikant, ist die klassische ANCOVA nicht geeignet.",
      ],
      whenToUse: [
        "Gruppen, die bei einer kontinuierlichen Variable unbalanciert sind, welche das Ergebnis beeinflusst.",
      ],
      whenNotToUse: [
        "Eine Kovariate, die nach der Behandlung gemessen wurde: Sie riskieren, den Effekt herauszurechnen.",
      ],
      reading: ["Geben Sie die adjustierten Mittelwerte aus, nicht die rohen."],
      pitfalls: ["Eine mit der Gruppe korrelierte Kovariate macht die Interpretation fragil."],
      glossary: [
        {
          term: "Adjustierte Mittelwerte",
          definition: "Mittelwerte, geschätzt als hätten alle Gruppen denselben mittleren Kovariatenwert.",
        },
        {
          term: "Homogene Steigungen",
          definition: "Die Beziehung zwischen Kovariate und Ergebnis hat in jeder Gruppe dieselbe Steigung.",
        },
      ],
    },
    seeAlso: ["anova", "regression"],
  },
  {
    id: "repeatedanova",
    area: "procedures",
    title: "Messwiederholungs-ANOVA",
    summary: "Bedingungen vergleichen, die an denselben Personen gemessen wurden, mit Sphärizitätskorrekturen.",
    tutorial: {
      goal: "Drei Messungen vergleichen, die an denselben Teilnehmenden erhoben wurden.",
      dataset: "score-groups.csv",
      steps: [
        "Organisieren Sie die Daten im weiten Format: eine Zeile pro Person, eine Spalte pro Bedingung.",
        "Wählen Sie die Spalten der Bedingungen (mindestens drei).",
        "Führen Sie sie aus und prüfen Sie Mauchly sowie die Korrekturen nach Greenhouse–Geisser oder Huynh–Feldt.",
        "Ist der globale Test signifikant, lesen Sie die korrigierten paarweisen Vergleiche.",
      ],
      expected: "Innerhalb-Personen-Tabelle mit F, Sphärizität und korrigiertem p, plus Post-hoc-Vergleiche.",
    },
    advanced: {
      assumptions: ["Sphärizität: Die Differenzen zwischen den Bedingungen haben gleiche Streuung."],
      whenToUse: ["Dieselben Einheiten, an drei oder mehr Gelegenheiten gemessen."],
      whenNotToUse: ["Viele fehlende Daten: Ein gemischtes Modell ist besser."],
      reading: [
        "Ist Mauchly signifikant, verwenden Sie die korrigierten Freiheitsgrade.",
        "Die Korrektur ändert die Freiheitsgrade, nicht die Mittelwerte.",
      ],
      pitfalls: ["Eine falsche Spaltenreihenfolge vergleicht die falschen Bedingungen."],
      glossary: [
        { term: "Sphärizität", definition: "Die Annahme, dass die Varianzen der Differenzen zwischen den Bedingungen gleich sind." },
        { term: "Greenhouse–Geisser", definition: "Eine konservative Korrektur der Freiheitsgrade bei verletzter Sphärizität." },
      ],
    },
    seeAlso: ["mixedanova", "nonparamrm"],
  },
  {
    id: "mixedanova",
    area: "procedures",
    title: "Gemischte ANOVA",
    summary: "Ein Zwischen-Personen-Faktor und Innerhalb-Personen-Bedingungen, mit ihrer Interaktion.",
    tutorial: {
      goal: "Den Verlauf zweier Gruppen über drei Zeitpunkte vergleichen.",
      dataset: "score-groups.csv",
      steps: [
        "Bereiten Sie das weite Format vor: eine Zeile pro Person und eine Spalte pro Zeitpunkt.",
        "Legen Sie die Zwischen-Personen-Gruppe und die Spalten der Innerhalb-Personen-Bedingungen fest.",
        "Führen Sie sie aus und lesen Sie die Effekte Zeit, Gruppe und Zeit × Gruppe.",
      ],
      expected: "Drei Effektzeilen mit korrigierten p-Werten und Mittelwerten pro Gruppe und Zeitpunkt.",
    },
    advanced: {
      assumptions: ["Sphärizität innerhalb der Personen, normale Residuen, Unabhängigkeit zwischen den Personen."],
      whenToUse: ["Längsschnittdesign mit einer Vergleichsgruppe."],
      whenNotToUse: ["Sehr kleine Gruppen oder strukturell fehlende Daten."],
      reading: [
        "Eine signifikante Interaktion bedeutet, dass sich die Gruppen über die Zeit unterschiedlich verändern.",
      ],
      pitfalls: [
        "Das Vermischen von weitem und langem Format erzeugt falsche Spalten und bedeutungslose Ergebnisse.",
      ],
      glossary: [
        { term: "Zwischen den Personen", definition: "Ein Faktor, dessen Stufen verschiedenen Einheiten zugeordnet sind." },
        { term: "Innerhalb der Personen", definition: "Ein Faktor, der an derselben Einheit wiederholt gemessen wird." },
      ],
    },
    seeAlso: ["repeatedanova", "lmm"],
  },
  {
    id: "nonparamrm",
    area: "procedures",
    title: "Nicht parametrische Tests für wiederholte Messungen",
    summary: "Friedman, McNemar, Cochran Q und Jonckheere–Terpstra.",
    tutorial: {
      goal: "Drei Bedingungen vergleichen, ohne Normalität vorauszusetzen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie den Test für Ihr Design: Friedman für geordnete Bedingungen, McNemar für zwei gepaarte binäre Messungen.",
        "Wählen Sie die benötigten Spalten oder Variablen.",
        "Führen Sie ihn aus und lesen Sie die Teststatistik mit ihrem p-Wert sowie bei Friedman den Post-hoc-Test nach Nemenyi.",
      ],
      expected: "Teststatistik, Freiheitsgrade und p; bei Friedman die paarweisen Vergleiche mit Rangdifferenzen.",
    },
    advanced: {
      assumptions: ["Gepaarte Beobachtungen; Cochran Q benötigt ein binäres Ergebnis."],
      whenToUse: ["Kleine Stichproben, ordinale Ergebnisse oder stark schiefe Verteilungen."],
      whenNotToUse: [
        "Große kontinuierliche Stichproben mit regelmäßiger Verteilung: Parametrische Tests sind mächtiger.",
      ],
      reading: [
        "Ein signifikantes p bedeutet, dass mindestens eine Bedingung abweicht; der Post-hoc-Test sagt, welche.",
      ],
      pitfalls: ["Ränge verlieren die Information über die Größe: Geben Sie auch die Mediane an."],
      glossary: [
        { term: "Friedman", definition: "Die nicht parametrische Alternative zur Messwiederholungs-ANOVA." },
        { term: "McNemar", definition: "Ein Test für zwei gepaarte binäre Messungen." },
      ],
    },
    seeAlso: ["repeatedanova", "ttest"],
  },
  {
    id: "tost",
    area: "procedures",
    title: "Äquivalenz (TOST)",
    summary: "Zeigen, dass zwei Behandlungen innerhalb einer vorab festgelegten Marge äquivalent sind.",
    tutorial: {
      goal: "Zeigen, dass ein Generikum innerhalb von ±0.5 äquivalent zum Referenzpräparat ist.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das Design (zwei Gruppen oder gepaarte Messungen).",
        "Legen Sie die Äquivalenzmarge fest (z. B. 0.5), bevor Sie die Daten betrachten.",
        "Führen Sie den Test aus und lesen Sie die beiden einseitigen Tests und das Konfidenzintervall.",
      ],
      expected: "Zwei einseitige p-Werte und eine Äquivalenzaussage nur dann, wenn das gesamte Intervall innerhalb der Marge liegt.",
    },
    advanced: {
      assumptions: ["Dieselben wie beim entsprechenden t-Test; die Marge muss klinisch begründet sein."],
      whenToUse: ["Bioäquivalenz, Nichtunterlegenheit und Vergleich zweier Versionen eines Instruments."],
      whenNotToUse: ["Um das Fehlen einer Differenz ohne vorab festgelegte Marge zu „beweisen“."],
      reading: ["Äquivalenz erfordert, dass das gesamte Intervall innerhalb von ±Marge bleibt."],
      pitfalls: ["Die Marge nach der Betrachtung der Daten zu wählen entwertet das Verfahren."],
      glossary: [
        { term: "TOST", definition: "Two One-Sided Tests, die gemeinsam die Äquivalenz beurteilen." },
        { term: "Marge", definition: "Die größte Differenz, die klinisch noch als akzeptabel gilt." },
      ],
    },
    seeAlso: ["ttest", "samplesize"],
  },
  {
    id: "correlation",
    area: "procedures",
    title: "Korrelation",
    summary: "Pearson, Spearman und Kendall mit Konfidenzintervallen und einer Matrix.",
    tutorial: {
      goal: "Den Zusammenhang zwischen zwei kontinuierlichen Variablen messen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie zwei oder mehr Variablen.",
        "Wählen Sie die primäre Methode: Pearson für lineare Beziehungen, Spearman bei Ausreißern oder Rängen.",
        "Führen Sie sie aus und lesen Sie Koeffizient, CI und p; die Matrix zeigt jedes Paar.",
      ],
      expected: "Koeffizient mit Konfidenzintervall, p-Wert und eine Korrelationsmatrix mit Einsen auf der Diagonale.",
    },
    advanced: {
      assumptions: [
        "Pearson: lineare Beziehung und keine dominierenden Ausreißer. Spearman: nur monotone Beziehung.",
      ],
      whenToUse: ["Zusammenhänge vor einem Modell erkunden oder Kollinearität prüfen."],
      whenNotToUse: ["Für kausale Schlussfolgerungen: Korrelation bestimmt keine Richtung."],
      reading: [
        "Das Vorzeichen gibt die Richtung, der Absolutwert die Stärke.",
        "Bei vielen Variablen sind unkorrigierte p-Werte zu viele: Interpretieren Sie vorsichtig.",
      ],
      pitfalls: [
        "Eine starke Korrelation kann innerhalb von Untergruppen verschwinden oder sich umkehren (Simpson-Paradox).",
      ],
      glossary: [
        { term: "Pearson r", definition: "Ein Maß für den linearen Zusammenhang zwischen zwei quantitativen Variablen." },
        { term: "Spearman ρ", definition: "Eine Rangkorrelation, robust gegenüber Ausreißern." },
      ],
    },
    seeAlso: ["regression", "multivariate"],
  },
  {
    id: "regression",
    area: "procedures",
    title: "Lineare Regression",
    summary: "Kleinste Quadrate mit Diagnostik, robusten Standardfehlern und Theil-Sen.",
    tutorial: {
      goal: "Schätzen, wie stark sich der Score mit steigendem Alter ändert.",
      dataset: "score-groups.csv",
      steps: [
        "Abhängige Variable = Score, Unabhängige = Age.",
        "Lassen Sie OLS und aktivieren Sie unter „Erweitert“ robuste Standardfehler, wenn Sie Heteroskedastizität vermuten.",
        "Führen Sie die Regression aus und lesen Sie Koeffizient, Standardfehler, CI und R².",
        "Prüfen Sie die Diagnosediagramme der Residuen.",
      ],
      expected: "Koeffiziententabelle mit CI, Anpassungsgüte und Residuendiagnostik.",
    },
    advanced: {
      assumptions: [
        "Linearität, unabhängige Fehler, Homoskedastizität, normale Residuen (für die Tests).",
        "Keine extreme Kollinearität zwischen den Prädiktoren.",
      ],
      whenToUse: ["Kontinuierliches Ergebnis und eine annähernd lineare Beziehung."],
      whenNotToUse: ["Binäres Ergebnis (Logistik), Zähler (Poisson/NB), zensierte Zeiten (Überleben)."],
      reading: [
        "Ein Koeffizient ist die erwartete Änderung des Ergebnisses bei einer Einheit mehr des Prädiktors, unter sonst gleichen Bedingungen.",
        "R² beschreibt die erklärte Streuung, nicht die kausale Güte des Modells.",
      ],
      pitfalls: [
        "Extrapolieren außerhalb des beobachteten Bereichs der Prädiktoren.",
        "Einen Koeffizienten in einem Modell mit Interaktion als durchschnittlichen Effekt lesen.",
      ],
      glossary: [
        { term: "HC3", definition: "Ein robuster Schätzer des Standardfehlers, der bei Heteroskedastizität gültig ist." },
        { term: "Theil-Sen", definition: "Eine robuste Gerade, die auf dem Median der paarweisen Steigungen beruht." },
      ],
    },
    seeAlso: ["correlation", "logistic", "ancova"],
  },
  {
    id: "logistic",
    area: "procedures",
    title: "Logistische Regression",
    summary: "Binäres Ergebnis mit Odds Ratios, Grenzwertanalyse und einer Firth-Option.",
    tutorial: {
      goal: "Den Effekt des Alters auf die Wahrscheinlichkeit eines Ereignisses schätzen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie Ergebnis (0/1) und die Prädiktoren.",
        "Führen Sie die Regression aus und lesen Sie die Odds Ratios mit Konfidenzintervallen.",
        "Sehen Sie sich die Klassifikationstabelle und den vorgeschlagenen Grenzwert an.",
        "Aktivieren Sie Firth bei wenigen Ereignissen oder Separation.",
      ],
      expected: "Koeffizienten, Odds Ratios mit CI, Trennschärfemaße und eine Klassifikationstabelle.",
    },
    advanced: {
      assumptions: ["Unabhängige Beobachtungen; Logit linear in den Prädiktoren."],
      whenToUse: ["Dichotomes Ergebnis (ja/nein, lebend/tot, Erfolg/Misserfolg)."],
      whenNotToUse: ["Geordnetes Ergebnis mit mehr als zwei Kategorien (verwenden Sie die ordinale Logistik)."],
      reading: [
        "Odds Ratio 1 = kein Zusammenhang; 2 = verdoppelte Odds, nicht verdoppelte Wahrscheinlichkeit.",
        "Bei seltenen Ereignissen nähert sich das Odds Ratio dem relativen Risiko an.",
      ],
      pitfalls: [
        "Wenige Ereignisse pro Parameter machen die Schätzungen instabil.",
        "Der Grenzwert, der die Trefferquote maximiert, ist nicht unbedingt der klinisch nützliche.",
      ],
      glossary: [
        {
          term: "Odds",
          definition: "Das Verhältnis zwischen der Wahrscheinlichkeit, dass ein Ereignis eintritt, und dass es nicht eintritt.",
        },
        { term: "Firth", definition: "Eine penalisierte Korrektur, die die Verzerrung bei seltenen Ereignissen verringert." },
      ],
    },
    seeAlso: ["regression", "ordinal", "chisquare"],
  },
  {
    id: "countreg",
    area: "procedures",
    title: "Zählregression",
    summary: "Poisson- und negative Binomialmodelle für Zählergebnisse.",
    tutorial: {
      goal: "Die Anzahl der Ereignisse als Funktion eines Prädiktors modellieren.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das Zählergebnis und die Prädiktoren.",
        "Beginnen Sie mit Poisson; liegt die geschätzte Dispersion deutlich über 1, wechseln Sie zur negativen Binomialverteilung.",
        "Führen Sie die Regression aus und lesen Sie die Ratenverhältnisse mit CI.",
      ],
      expected: "Koeffizienten, Ratenverhältnisse, einen Überdispersions-Test und die Anpassungsgüte.",
    },
    advanced: {
      assumptions: ["Nicht negative Zähler; bei Poisson ist der Mittelwert gleich der Varianz."],
      whenToUse: ["Anzahl von Ereignissen, Anrufen oder Defekten pro Einheit."],
      whenNotToUse: ["Zähler mit vielen strukturellen Nullen: Erwägen Sie Modelle mit Nullaufblähung."],
      reading: ["Ein Ratenverhältnis von 1.2 bedeutet einen erwarteten Anstieg der Ereigniszahl um 20 %."],
      pitfalls: ["Eine lineare Regression bei kleinen Zählern erzeugt negative Vorhersagen."],
      glossary: [
        { term: "Überdispersion", definition: "Varianz größer als der Mittelwert, typisch für reale Zähldaten." },
        { term: "NB2", definition: "Negative Binomialverteilung mit einer im Mittelwert quadratischen Varianz." },
      ],
    },
    seeAlso: ["logistic", "regression"],
  },
  {
    id: "ordinal",
    area: "procedures",
    title: "Ordinale logistische Regression",
    summary: "Kumulatives Logit-Modell für geordnete Ergebnisse.",
    tutorial: {
      goal: "Untersuchen, wie ein Prädiktor die Zufriedenheit über geordnete Stufen verschiebt.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das ordinale Ergebnis (mindestens drei geordnete Kategorien).",
        "Wählen Sie die Prädiktoren und prüfen Sie die Stufenreihenfolge in der Spalte.",
        "Führen Sie die Regression aus und lesen Sie die kumulativen Odds Ratios mit CI.",
      ],
      expected: "Koeffizienten mit kumulativen Odds Ratios und einem Test der Annahme proportionaler Odds.",
    },
    advanced: {
      assumptions: ["Proportionale Odds: Der Prädiktoreffekt ist über alle Schnittpunkte hinweg gleich."],
      whenToUse: ["Likert-Skalen, Schweregrad in geordneten Klassen."],
      whenNotToUse: ["Ungeordnete Kategorien: Verwenden Sie multinomial oder Chi-Quadrat."],
      reading: [
        "Das kumulative Odds Ratio beschreibt die Wahrscheinlichkeit, in einer höheren Kategorie oder darüber zu liegen.",
      ],
      pitfalls: ["Scheitert die Proportionalität, benötigen Sie andere Modelle, nicht eine einfache Lesart der OR."],
      glossary: [
        { term: "Kumulatives Logit", definition: "Ein Modell, das jede Kategorie mit allen höheren vergleicht." },
        { term: "Proportionalität", definition: "Die Annahme, dass sich die Prädiktoreffekte über die Schnittpunkte nicht ändern." },
      ],
    },
    seeAlso: ["logistic", "contingency"],
  },
  {
    id: "lmm",
    area: "procedures",
    title: "Lineares gemischtes Modell (LMM)",
    summary: "Zufälliger Achsenabschnitt für wiederholte Messungen oder gruppierte Personen.",
    tutorial: {
      goal: "Wiederholte Messungen analysieren und dabei die Korrelation innerhalb der Personen berücksichtigen.",
      dataset: "score-groups.csv",
      steps: [
        "Wählen Sie das Ergebnis, die festen Prädiktoren und die Spalte der Person oder des Clusters.",
        "Führen Sie das Modell aus und lesen Sie die festen Koeffizienten mit CI.",
        "Vergleichen Sie die Residuenvarianz mit der Varianz des zufälligen Achsenabschnitts.",
      ],
      expected: "Feste Effekte mit Standardfehlern, Schätzung der zufälligen Varianz und Anpassungskriterien.",
    },
    advanced: {
      assumptions: ["Annähernd normale Residuen; korrekte Kovarianzstruktur."],
      whenToUse: ["Längsschnittdaten, Cluster, wiederholte Messungen mit fehlenden Daten."],
      whenNotToUse: ["Wenige Cluster: Die Varianzschätzungen sind instabil."],
      reading: [
        "Feste Koeffizienten lesen sich wie in einer Regression, aber die Fehler berücksichtigen die Gruppierung.",
      ],
      pitfalls: ["Wiederholte Messungen als unabhängig zu behandeln unterschätzt die Standardfehler."],
      glossary: [
        { term: "Fester Effekt", definition: "Ein durchschnittlicher Effekt, der für die Population gilt." },
        { term: "Zufälliger Effekt", definition: "Streuung zwischen Einheiten (Personen oder Clustern)." },
      ],
    },
    seeAlso: ["gee", "repeatedanova"],
  },
];
