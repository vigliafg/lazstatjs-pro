import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Wave 6 procedures (compact de edition). */
export const w6Topics: HelpTopic[] = [
  procedureTopic({
    id: "competing", title: "Wettbewerbsrisiken", summary: "Schätzt die kumulative Inzidenz einer Ursache, während andere Ursachen um dieselbe Ereigniszeit konkurrieren.",
    goal: "Messen, wie oft eine bestimmte Ursache auftritt, wenn Personen durch andere Ursachen ausscheiden können.",
    steps: ["Zeit- und Ereignisspalte mit den Ursachencodes wählen (0 = zensiert).", "Den Code der interessierenden Ursache eintragen.", "Kovariaten wählen und das Fine–Gray-Modell ausführen.", "Kumulative Inzidenzkurve und Subverteilungs-Hazard-Ratios lesen."],
    expected: "Übersicht über Ereignisse und Ursachen, Fine–Gray-Koeffizienten mit sHR und kumulative Inzidenzkurve für das mittlere Profil.",
    whenToUse: ["Wenn ein Ereignis mehrere sich ausschließende, nicht unabhängige Ursachen hat.", "Wenn die Wahrscheinlichkeit einer Ursache über die Zeit gefragt ist."],
    assumptions: ["Die Ursachen sind vollständig und sich ausschließend; Zensierung ist nicht informativ.", "Die Subverteilungs-Hazard-Ratios sind zeitlich konstant."],
    reading: ["Die CIF ist die Wahrscheinlichkeit der gewählten Ursache bis t bei Existenz der anderen Ursachen.", "Kaplan–Meier behandelt konkurrierende Ereignisse als Zensierung und ist nicht die CIF."],
    pitfalls: ["Die CIF als 1 − Überleben der gewählten Ursache lesen.", "Die Ursache erst nach den Ergebnissen auswählen."],
    charts: ["Kumulative Inzidenzkurve der gewählten Ursache.", "Forest-Plot der Subverteilungs-Hazard-Ratios."],
  }),
  procedureTopic({
    id: "recurrent", title: "Rezidivierende Ereignisse", summary: "Modelliert wiederholte Ereignisse pro Person mit Andersen–Gill oder Wei–Lin–Weissfeld und robusten Fehlern.",
    goal: "Den Effekt von Kovariaten auf die Rate wiederholter Ereignisse schätzen, ohne Ereignisse derselben Person als unabhängig zu behandeln.",
    steps: ["Subjekt-ID sowie Start-, Stopp- und Ereignisspalte im Start-Stopp-Format wählen.", "Andersen–Gill für den Gesamtprozess oder Wei–Lin–Weissfeld für ereignisspezifische Schichten wählen.", "Kovariaten hinzufügen und ausführen.", "Hazard-Ratios und robuste Intervalle lesen."],
    expected: "Übersicht über Personen und Episoden, Hazard-Ratios mit geclusterten Standardfehlern und globale Tests.",
    whenToUse: ["Wenn dieselbe Person das Ereignis mehrfach erlebt: Rückfälle, Ausfälle, Aufnahmen.", "Wenn Ereignisse einer Person plausibel korreliert sind."],
    assumptions: ["Nicht informative Zensierung und kohärente Start-Stopp-Intervalle.", "AG annimmt einen gemeinsamen Effekt; WLW eine eigene Basis pro Ereignisnummer."],
    reading: ["AG hält die Person nach jedem Ereignis im Risikosatz und nutzt Kalenderzeit.", "WLW nutzt die Zeit seit dem vorherigen Ereignis und eine Schicht pro Ereignisnummer."],
    pitfalls: ["Jede Zeile als unabhängige Person behandeln.", "Kalenderzeit und Zeit zwischen Ereignissen verwechseln."],
    charts: ["Forest-Plot der robusten Hazard-Ratios."],
  }),
  procedureTopic({
    id: "alt", title: "Beschleunigte Lebensdauertests", summary: "Verknüpft die Lebensdauer mit einer Belastungsvariable über ein Weibull-AFT und meldet den Beschleunigungsfaktor.",
    goal: "Die Lebensdauer bei Nutzbelastung aus Tests bei höheren Belastungen schätzen.",
    steps: ["Zeit, Ereignis und Belastungsspalte wählen.", "Beziehung wählen: Arrhenius (1/Belastung), inverse Potenz (log Belastung) oder exponentiell (Belastung).", "Nutzbelastung und weitere Kovariaten eingeben.", "Ausführen und Beschleunigungsfaktor sowie Zeitverhältnisse lesen."],
    expected: "Weibull-AFT-Übersicht mit Beschleunigungsfaktor, Zeitverhältnissen und Balkendiagramm des Faktors.",
    whenToUse: ["Wenn Bauteile bei höherer Belastung als im Betrieb getestet werden.", "Wenn der Ausfallmechanismus über die Belastungsstufen gleich bleibt."],
    assumptions: ["Die Weibull-Verteilung beschreibt die Zeiten und der Mechanismus ändert sich nicht.", "Die Belastung ist fehlerfrei gemessen und die Stufen sind gut getrennt."],
    reading: ["Der Faktor vergleicht die Lebensdauer bei Nutzbelastung mit der bei der niedrigsten beobachteten Belastung.", "Das Zeitverhältnis bezieht sich auf eine Einheit der transformierten Belastung."],
    pitfalls: ["Weit über den getesteten Bereich extrapolieren ohne physikalische Begründung.", "Das Zeitverhältnis auf die rohe Belastung beziehen."],
    charts: ["Forest-Plot der Zeitverhältnisse.", "Balkendiagramm des Beschleunigungsfaktors."],
  }),
  procedureTopic({
    id: "reliability", title: "Zuverlässigkeitswachstum und RBD", summary: "Verfolgt eine Crow–AMSAA-Wachstumskurve oder kombiniert Bauteilzuverlässigkeiten in einem Reihen-/Parallelschema.",
    goal: "Prüfen, ob ein reparierbares System besser wird, oder die Systemzuverlässigkeit aus den Bauteilen berechnen.",
    steps: ["Wachstum für kumulierte Ausfälle über die Zeit wählen oder RBD zum Kombinieren der Zuverlässigkeiten.", "Bei Wachstum Zeit- und Ausfallspalte wählen und ausführen.", "Bei RBD die Zuverlässigkeit jedes Bauteils eingeben und parallele Bauteile im selben Stadium gruppieren.", "Parameter bzw. Systemzuverlässigkeit lesen und das schwächste Stadium finden."],
    expected: "Bei Wachstum: β, λ, kumulative und momentane MTBF sowie beobachtete und angepasste Ausfälle. Bei RBD: Zuverlässigkeit pro Stadium und des Systems.",
    whenToUse: ["Wenn ein reparierbares System verbessert wird und die Ausfälle seltener werden sollen.", "Wenn die Systemzuverlässigkeit aus den Bauteilen abgeleitet werden soll."],
    assumptions: ["Wachstum: nichthomogener Poisson-Prozess mit Potenzintensität und kumulativen Korrekturen.", "RBD: unabhängige Bauteile mit bekanntem Zuverlässigkeitswert."],
    reading: ["β < 1 bedeutet eine sinkende Ausfallrate; β = 1 ist ein homogener Poisson-Prozess.", "In Reihe ist die Systemzuverlässigkeit das Produkt der Stufen; parallel gilt 1 − Π(1 − r)."],
    pitfalls: ["Die Wachstumskurve als Prognose über den beobachteten Zeitraum hinaus lesen.", "Vergessen, dass eine Stufe in Reihe das System stoppt."],
    charts: ["Beobachtete und erwartete kumulierte Ausfälle (Wachstum).", "Zuverlässigkeit pro Stufe (RBD)."],
  }),
];
