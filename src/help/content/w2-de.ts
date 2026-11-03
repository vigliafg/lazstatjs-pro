import type { HelpTopic } from './types';

/** Verfahren Welle 2: GLM, Quantils-, nichtlineare und multinomiale Regression. */
export const w2Topics: HelpTopic[] = [
  {
    id: 'glm',
    area: 'procedures',
    title: 'Verallgemeinertes lineares Modell (GLM)',
    summary: 'Familien Gauß, Binomial, Poisson und Gamma mit wählbarer Link-Funktion.',
    tutorial: {
      goal: 'Schätzen, wie sich ein Score mit dem Alter ändert, wenn das Ergebnis nicht einfach ein stetiger Mittelwert ist.',
      dataset: 'score-groups.csv',
      steps: [
        'Abhängige Variable = Score, unabhängige = Age.',
        'Wählen Sie die Familie: Gauß für einen stetigen Score, Binomial für 0/1, Poisson für Zählungen, Gamma für positive schiefe Beträge.',
        'Wählen Sie eine zur Familie passende Link-Funktion: Identität, Log, Logit, Probit oder Invers.',
        'Führen Sie das Modell aus und lesen Sie die Koeffizienten auf der Link-Skala zusammen mit Devianz und AIC.',
      ],
      expected: 'Koeffiziententabelle auf der Link-Skala, Anpassungsgüte (Devianz, AIC), Residuen und bei einem Prädiktor das Profil des geschätzten Mittelwerts.',
    },
    advanced: {
      assumptions: [
        'Unabhängige Beobachtungen und eine Antwort, deren Varianz zur gewählten Familie passt.',
        'Die Link-Funktion verbindet den Erwartungswert mit einem linearen Prädiktor: der lineare Teil muss korrekt sein.',
        'Binomial braucht eine 0/1-Antwort, Poisson nicht negative Zählungen, Gamma strikt positive Werte.',
      ],
      whenToUse: [
        'Stetiges, aber schiefes oder heteroskedastisches Ergebnis, typischerweise Gamma mit Log-Link.',
        'Binäres Ergebnis, wenn ein Probit-Link oder eine Familie außerhalb des klassischen Logistikmenüs gebraucht wird.',
        'Zählungen, wenn Sie den Poisson-Log-Link mit Devianzdiagnostik vergleichen wollen.',
      ],
      whenNotToUse: [
        'Binäres Ergebnis, das in das eigene logistische Verfahren mit Odds Ratios und Cutoff-Analyse passt.',
        'Überdispersion bei Zählungen: die negative Binomialregression ist meist besser.',
        'Wiederholte oder geclusterte Messungen: verwenden Sie gemischte Modelle oder GEE.',
      ],
      reading: [
        'Koeffizienten liegen auf der Link-Skala: bei Log-Link ist exp(β) ein multiplikatives Verhältnis, bei Logit ein Odds Ratio.',
        'Eine Restdevianz weit über den Freiheitsgraden zeigt Überdispersion, besonders bei Poisson und Binomial.',
        'AIC vergleicht Modelle mit derselben Antwort und Familie; es ist kein absolutes Maß für die Anpassung.',
      ],
      pitfalls: [
        'Einen Koeffizienten mit Log-Link als additive Änderung des Ergebnisses lesen.',
        'Die Gauß-Familie bei einer 0/1- oder Zählantwort behalten, nur weil das Modell läuft.',
        'Einen Probit-Link wählen und die Koeffizienten danach als Odds Ratios interpretieren.',
      ],
      charts: [
        'Beobachtete und geschätzte Werte: Punkte nahe der Diagonale sprechen für gute Kalibrierung.',
        'Residuen gegen geschätzte Werte: ein Trichter oder eine Kurve verrät die falsche Familie oder Link-Funktion.',
        'Profil des geschätzten Mittelwerts: bei einem Prädiktor die angepasste Kurve im beobachteten Bereich.',
      ],
      glossary: [
        { term: 'Link', definition: 'Die Funktion, die den Erwartungswert mit dem linearen Prädiktor verbindet.' },
        { term: 'Devianz', definition: 'Ein Maß der Anpassungsgüte: kleiner ist besser und zwischen geschachtelten Modellen vergleichbar.' },
        { term: 'Überdispersion', definition: 'Größere Varianz als die Familie annimmt, wodurch die Standardfehler aufgebläht werden.' },
      ],
    },
    seeAlso: ['regression', 'logistic', 'countreg'],
  },
  {
    id: 'quantile',
    area: 'procedures',
    title: 'Quantilsregression',
    summary: 'Ein bedingtes Quantil (τ) statt des Mittelwerts modellieren, robust gegen Ausreißer.',
    tutorial: {
      goal: 'Prüfen, ob das Alter den medianen Score verschiebt, nicht nur den Durchschnitt.',
      dataset: 'score-groups.csv',
      steps: [
        'Abhängige Variable = Score, unabhängige = Age.',
        'Setzen Sie τ: 0,5 ist der Median, 0,1 und 0,9 beschreiben die unteren und oberen Ränder.',
        'Führen Sie das Modell aus und lesen Sie den Koeffizienten jedes Prädiktors bei diesem Quantil.',
        'Wiederholen Sie mit einem anderen τ und vergleichen Sie die beiden Geraden.',
      ],
      expected: 'Koeffizienten, Standardfehler und CI für das gewählte Quantil; bei einem Prädiktor die Quantilsgerade und die Residuenabbildung.',
    },
    advanced: {
      assumptions: [
        'Unabhängige Beobachtungen; beim gewählten τ ist das bedingte Quantil linear in den Prädiktoren.',
        'Keine Annahme normalverteilter Residuen oder konstanter Varianz.',
      ],
      whenToUse: [
        'Schiefe Ergebnisse, Ausreißer oder Interesse an den Rändern (Einkommen, Latenzen, Scores).',
        'Wenn der Effekt eines Prädiktors über die Verteilung hinweg unterschiedlich sein kann.',
      ],
      whenNotToUse: [
        'Wenn ein einzelner durchschnittlicher Effekt gebraucht wird und der Mittelwert das Ziel ist.',
        'Bei sehr kleinen Stichproben: jedes Randquantil nutzt wenige wirksame Beobachtungen.',
      ],
      reading: [
        'Der Koeffizient ist die Änderung des τ-Quantils für eine Einheit mehr im Prädiktor.',
        'Unterschiedliche Steigungen über die τ bedeuten, dass der Prädiktor in der Mitte anders wirkt als an den Rändern.',
        'Die Standardfehler stammen aus der Quantilstheorie (Sandwich-Typ); bei wenigen Fällen sind die Intervalle breit.',
      ],
      pitfalls: [
        'Einen Mediankoeffizienten als durchschnittlichen Effekt lesen: der Mittelwert kann woanders liegen.',
        'Sich kreuzende Quantilsgeraden (τ1 < τ2, aber die Gerade von τ1 liegt oben) sprechen für ein falsch spezifiziertes Modell.',
      ],
      charts: [
        'Quantilsgerade: Beobachtungen mit der angepassten τ-Geraden; die Steigung ist der Quantileffekt.',
        'Residuen gegen geschätzte Quantile: eine Struktur zeigt, dass das lineare Quantilmodell falsch ist.',
      ],
      glossary: [
        { term: 'Quantil τ', definition: 'Der Wert, unter dem ein Anteil τ der bedingten Verteilung liegt.' },
        { term: 'Medianregression', definition: 'Quantilsregression mit τ = 0,5, robust gegen extreme Beobachtungen.' },
      ],
    },
    seeAlso: ['regression', 'nonparamrm', 'lmm'],
  },
  {
    id: 'nonlinear',
    area: 'procedures',
    title: 'Nichtlineare Regression',
    summary: 'Exponential-, Logistik-, Gompertz-, Potenz- und Michaelis–Menten-Kurven nach kleinsten Quadraten.',
    tutorial: {
      goal: 'Eine Kurve anpassen, die schnell steigt und dann abflacht, und ihre Parameter lesen.',
      dataset: 'score-groups.csv',
      steps: [
        'Abhängige Variable = Score, Prädiktor = Time.',
        'Wählen Sie die Form: Exponential, Logistik, Gompertz, Potenz oder Michaelis–Menten.',
        'Führen Sie das Modell aus, prüfen Sie die Konvergenz und lesen Sie die Parameter mit ihren CI.',
        'Betrachten Sie Kurve und Residuen; probieren Sie eine andere Form, wenn das Muster systematisch ist.',
      ],
      expected: 'Parametertabelle mit SE, t, p und CI, R², RMSE, angepasste Kurve und Residuenabbildung.',
    },
    advanced: {
      assumptions: [
        'Die gewählte Funktionsform ist korrekt; die Residuen sind unabhängig und etwa homoskedastisch.',
        'Der Prädiktorbereich deckt den Teil der Kurve ab, den Sie beschreiben wollen.',
        'Genügend verschiedene Prädiktorwerte, um alle Parameter zu identifizieren.',
      ],
      whenToUse: [
        'Wachstum, Zerfall, Sättigung und Dosis-Wirkung, die eine Gerade nicht beschreibt.',
        'Wenn die Parameter eine Bedeutung haben: Asymptote, Rate, Halbsättigung.',
      ],
      whenNotToUse: [
        'Wenn eine Transformation die Beziehung linear und interpretierbar macht, etwa log–log für ein Potenzgesetz.',
        'Bei wenigen Punkten oder schmalem Prädiktorbereich: die Parameter sind schwach identifiziert.',
      ],
      reading: [
        'Exponential y = a·exp(b·x): b > 0 ist Wachstum, b < 0 ist Zerfall.',
        'Logistik L/(1+exp(−k(x−x0))): L ist die obere Asymptote, k die Steilheit, x0 der Wendepunkt.',
        'Gompertz a·exp(−b·exp(−c·x)): asymmetrisches Wachstum, das sich der Asymptote langsamer nähert.',
        'Potenz a·x^b: b ist der Exponent; Michaelis–Menten vmax·x/(km+x): km ist die Halbsättigung.',
      ],
      pitfalls: [
        'R² zwischen verschiedenen Kurven vergleichen, ohne das Residuenmuster zu prüfen.',
        'Einer konvergierten Anpassung mit breiten oder unplausiblen Parameterintervallen vertrauen.',
        'Über den beobachteten Prädiktorbereich hinaus extrapolieren, besonders beim Exponentialwachstum.',
      ],
      charts: [
        'Geschätzte Kurve: Beobachtungen mit der überlagerten angepassten Kurve.',
        'Residuen gegen geschätzte Werte: systematische Bögen zeigen die falsche Kurve.',
      ],
      glossary: [
        { term: 'Asymptote', definition: 'Der Wert, dem die Kurve bei wachsendem Prädiktor zustrebt.' },
        { term: 'Halbsättigung', definition: 'Der Prädiktorwert, bei dem die Antwort die Hälfte ihres Maximums erreicht (km).' },
      ],
    },
    seeAlso: ['regression', 'glm', 'countreg'],
  },
  {
    id: 'multinomial',
    area: 'procedures',
    title: 'Multinomiale logistische Regression',
    summary: 'Nominales Ergebnis mit drei oder mehr Klassen, jede gegen eine Referenzklasse verglichen.',
    tutorial: {
      goal: 'Schätzen, wie Prädiktoren die Wahrscheinlichkeit jeder Klasse eines nominalen Ergebnisses verändern.',
      steps: [
        'Ergebnis = die kategoriale Spalte mit mindestens drei Klassen, zum Beispiel niedrig/mittel/hoch.',
        'Wählen Sie die numerischen Prädiktoren.',
        'Führen Sie das Modell aus und lesen Sie je einen Koeffizientenblock pro Klasse gegen die Referenzklasse.',
        'Prüfen Sie die Gesamtgenauigkeit und die Genauigkeit je Klasse, bevor Sie der Klassifikation trauen.',
      ],
      expected: 'Koeffizienten und relative Risikoverhältnisse mit CI je Klasse gegen die Referenz, Gesamtgenauigkeit und Klassifikationstabelle.',
    },
    advanced: {
      assumptions: [
        'Unabhängige Beobachtungen; die Log-Odds jeder Klasse gegen die Referenz sind linear in den Prädiktoren.',
        'Unabhängigkeit von irrelevanten Alternativen: eine Klasse hinzuzufügen oder zu entfernen soll die anderen nicht verändern.',
        'Jede Klasse hat genügend Beobachtungen für die Zahl der Parameter.',
      ],
      whenToUse: [
        'Nominales Ergebnis mit mehr als zwei ungeordneten Kategorien, etwa Verkehrsmittel oder Produktwahl.',
        'Wenn klassenspezifische Effekte statt eines einzelnen binären Kontrasts gebraucht werden.',
      ],
      whenNotToUse: [
        'Geordnete Klassen: die ordinale logistische Regression ist sparsamer.',
        'Binäres Ergebnis: verwenden Sie die logistische Regression.',
        'Sehr seltene Klassen: die Schätzungen sind instabil.',
      ],
      reading: [
        'Jede Klasse wird mit der Referenzklasse verglichen: exp(β) ist ein relatives Risikoverhältnis, keine Wahrscheinlichkeit.',
        'Ein Verhältnis über 1 bedeutet, dass der Prädiktor die Odds dieser Klasse gegenüber der Referenz erhöht.',
        'Die Gesamtgenauigkeit kann hoch sein, nur weil eine Klasse dominiert: lesen Sie auch die Genauigkeit je Klasse.',
      ],
      pitfalls: [
        'Relative Risikoverhältnisse als Wahrscheinlichkeiten oder als Risikoverhältnisse interpretieren.',
        'Die Referenzklasse wechseln und dieselben Zahlen erwarten: der Vergleich ändert sich.',
        'Die multinomiale Regression verwenden, obwohl die Klassen geordnet sind.',
      ],
      charts: [
        'Verteilung der vorhergesagten Klassen: jeder Balken zählt, wie viele Beobachtungen das Modell dieser Klasse zuweist.',
        'Genauigkeit je Klasse: korrekt klassifizierter Anteil pro Klasse, mit der Gesamtgenauigkeit als Referenzlinie.',
      ],
      glossary: [
        { term: 'Referenzklasse', definition: 'Die Klasse, gegen die alle anderen verglichen werden.' },
        { term: 'Relatives Risikoverhältnis', definition: 'Die multiplikative Änderung der Odds einer Klasse gegen die Referenz für eine Einheit mehr im Prädiktor.' },
        { term: 'Softmax', definition: 'Die Funktion, die Klassenwerte in Wahrscheinlichkeiten umwandelt, die sich zu eins summieren.' },
      ],
    },
    seeAlso: ['logistic', 'multivariate', 'ordinal'],
  },
];
