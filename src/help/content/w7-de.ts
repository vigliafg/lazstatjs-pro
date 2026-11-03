import type { HelpTopic } from './types';
import { procedureTopic } from './template';

/** Welle-7-Verfahren: VAR/VECM, GARCH und State-Space-Modelle. */
export const w7Topics: HelpTopic[] = [
  procedureTopic({
    id: 'var',
    title: 'VAR / VECM',
    summary: 'Mehrere Zeitreihen gemeinsam modellieren, Granger-Kausalität prüfen und Fehlerkorrektur schätzen.',
    goal: 'Beschreiben, wie jede Reihe von der eigenen Vergangenheit und der der anderen abhängt, und langfristige Beziehungen von kurzfristiger Dynamik trennen.',
    steps: [
      'Mindestens zwei numerische Reihen in zeitlicher Reihenfolge wählen.',
      'Verzögerungen auf 0 lassen für automatische AIC-Auswahl oder eine feste Ordnung eingeben.',
      'VAR für stationäre Reihen, VECM für kointegrierte I(1)-Reihen wählen.',
      'Koeffizienten, Granger-Tests, Impulsantworten und Varianzzerlegung lesen.',
    ],
    expected:
      'VAR-Zusammenfassung mit Stabilität, Koeffizienten, Granger-Tests, Impulsantworten und Varianzzerlegung; das VECM ergänzt Kointegrationsvektor und Anpassungsgeschwindigkeiten.',
    whenToUse: [
      'Wenn mehrere Reihen gemeinsam verlaufen und ihre gemeinsame Dynamik modelliert werden soll.',
      'Wenn geprüft werden soll, ob die Vergangenheit einer Reihe die Prognose einer anderen verbessert.',
      'Wenn eine stabile langfristige Beziehung zwischen nichtstationären Reihen vermutet wird.',
    ],
    assumptions: [
      'Die Reihen sind stationär oder bis zur Stationarität differenziert; das VECM verlangt I(1)-Reihen mit Kointegration.',
      'Die Residuen sind nach der gewählten Ordnung seriell unkorreliert.',
      'Es gibt genügend Beobachtungen für die Parameterzahl.',
    ],
    whenNotToUse: [
      'Bei sehr kurzen Reihen wächst die Parameterzahl schnell.',
      'Wenn nur ein Ziel interessiert: ein univariates ARIMA oder eine Regression ist einfacher.',
      'Wenn Strukturbrüche dominieren und nicht modelliert werden.',
    ],
    reading: [
      'Ein stabiles VAR hat alle charakteristischen Wurzeln außerhalb des Einheitskreises.',
      'Ein signifikanter Granger-Test bedeutet Prognosekraft, nicht strukturelle Kausalität.',
      'Impulsantworten hängen von der Cholesky-Reihenfolge ab.',
      'Im VECM zeigt ein negatives signifikantes α eine Korrektur der Abweichung von der Langfristbeziehung.',
    ],
    pitfalls: [
      'Ein VAR auf trendenden Niveaus ohne Stationaritätsprüfung schätzen.',
      'Granger-Kausalität als strukturelle Kausalität lesen.',
      'Impulsantworten ohne Identifikationsannahme interpretieren.',
      'Engle–Granger bei mehreren Kointegrationsbeziehungen verwenden.',
    ],
    charts: ['Impulsantworten nach Schock und Antwort.', 'Anteile der Prognosefehlervarianz am letzten Horizont.'],
    glossary: [
      { term: 'VAR', definition: 'System von Autoregressionen, eine Gleichung pro Reihe, mit den Verzögerungen aller Reihen.' },
      { term: 'Kointegration', definition: 'Stationäre Linearkombination nichtstationärer Reihen.' },
      { term: 'Impulsantwort', definition: 'Änderung der Reihen nach einem Schock von einer Standardabweichung.' },
    ],
    seeAlso: ['timeseries', 'statespace'],
  }),
  procedureTopic({
    id: 'garch',
    title: 'GARCH',
    summary: 'Bedingte Volatilität schätzen, die sich mit einem GARCH(1,1)-Modell zeitlich klumpt.',
    goal: 'Das Niveau einer Reihe von ihrer zeitvariablen Volatilität trennen und die Größe künftiger Schwankungen prognostizieren.',
    steps: [
      'Die Rendite- oder Veränderungsreihe in zeitlicher Reihenfolge wählen.',
      'Den Prognosehorizont einstellen.',
      'Das Modell schätzen und Persistenz, Langfristvarianz und Halbwertszeit lesen.',
      'Den Ljung–Box-Test auf standardisierten Residuen prüfen.',
    ],
    expected:
      'Modellzusammenfassung, Koeffizienten mit Standardfehlern, Residuendiagnostik und Prognosen der bedingten Varianz.',
    whenToUse: [
      'Wenn die Größe der Schwankungen über die Zeit wechselt und sich in ruhigen und turbulenten Phasen klumpt.',
      'Wenn eine Volatilitätsprognose oder eine zeitvariable Skala für Risikomaße gebraucht wird.',
      'Wenn Residuen eines Mittelwertmodells noch Autokorrelation in den Quadraten zeigen.',
    ],
    assumptions: [
      'Die bedingte Varianz folgt der GARCH-Rekursion mit positiven ω, α, β und α + β < 1.',
      'Die standardisierten Innovationen sind annähernd unkorreliert; Normalität ist bequem, aber nicht nötig.',
      'Der Mittelwert ist konstant oder bereits entfernt.',
    ],
    whenNotToUse: [
      'Wenn Volatilität auf positive und negative Schocks unterschiedlich reagiert: ein asymmetrisches Modell verwenden.',
      'Wenn die Reihe Trend oder deterministische Saisonalität im Mittelwert hat.',
      'Mit weniger als etwa dreißig Beobachtungen.',
    ],
    reading: [
      'α misst die Reaktion auf die letzte Innovation, β das Gedächtnis der vergangenen Volatilität.',
      'Persistenz nahe 1 bedeutet langlebige Volatilitätsschocks; die Halbwertszeit ist die Zahl der Perioden bis zur Halbierung.',
      'Die Langfristvarianz ist ω/(1 − α − β), wenn α + β < 1.',
      'Die bedingte SD ist die erwartete Schwankungsskala, kein Konfidenzintervall für den Mittelwert.',
    ],
    pitfalls: [
      'Varianzprognosen mit Preisprognosen verwechseln.',
      'Residuenautokorrelation in den Quadraten ignorieren.',
      'Die Halbwertszeit bei α + β ≥ 1 berichten, wo sie undefiniert ist.',
      'Das Modell als vollständige Beschreibung von Tails und Asymmetrie behandeln.',
    ],
    charts: ['Reihe mit bedingter Standardabweichung.', 'Autokorrelation der standardisierten Residuen.'],
    glossary: [
      { term: 'ARCH-Effekt', definition: 'Abhängigkeit der aktuellen Varianz von recenten quadrierten Innovationen.' },
      { term: 'Persistenz', definition: 'α + β im GARCH(1,1), die Abklinggeschwindigkeit von Volatilitätsschocks.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
  procedureTopic({
    id: 'statespace',
    title: 'State-Space und Markov-Switching',
    summary: 'Ein latentes Niveau oder einen Trend mit dem Kalman-Filter schätzen oder zwei Regime mit einem Markov-Switching-AR(1).',
    goal: 'Signal und Rauschen trennen und Reihen beschreiben, die zwischen verschiedenen Regimen wechseln.',
    steps: [
      'Das lokale Niveau-/Trendmodell oder das Markov-Switching-Modell mit zwei Regimen wählen.',
      'Die Reihe und den Prognosehorizont wählen.',
      'Beim lokalen Modell entscheiden, ob ein stochastischer Trend enthalten ist.',
      'Geglättete Zustände und Prognose lesen oder Regimewahrscheinlichkeiten und Übergangsmatrix.',
    ],
    expected:
      'Lokales Modell: Varianzschätzungen, gefilterte und geglättete Zustände, Prognosen mit Intervallen. Markov-Switching: Regimemittel und -varianzen, Übergangsmatrix, geglättete Wahrscheinlichkeiten und Prognosen.',
    whenToUse: [
      'Wenn die beobachtete Reihe eine verrauschte Messung einer glatteren latenten Größe ist.',
      'Wenn die Reihe zwischen ruhigen und turbulenten oder niedrigen und hohen Phasen wechselt.',
      'Wenn eine fundierte Interpolation rauschender oder fehlender Historie gebraucht wird.',
    ],
    assumptions: [
      'Das lokale Modell ist linear und gaussianisch mit unabhängigen Innovationen.',
      'Das Markov-Modell hat zwei Regime, konstante Übergangswahrscheinlichkeiten und ein AR(1)-Mittel pro Regime.',
      'Die Regimezahl ist bekannt und die Labels sind durch die Startwerte identifiziert.',
    ],
    whenNotToUse: [
      'Wenn Regimewechsel von beobachteten Kovariaten getrieben werden: ein Schwellenmodell ist klarer.',
      'Bei sehr kurzen Reihen sind Varianzen und Regime-Labels instabil.',
      'Wenn eine einfache Trendregression die Frage beantwortet.',
    ],
    reading: [
      'Der gefilterte Zustand nutzt nur die Vergangenheit; der geglättete Zustand die ganze Reihe.',
      'Im lokalen Modell bedeutet eine große Beobachtungsvarianz viel Messrauschen.',
      'Im Markov-Modell ist die erwartete Regimedauer 1/(1 − p).',
      'Die Prognose mittelt die Regime mit ihren Übergangswahrscheinlichkeiten.',
    ],
    pitfalls: [
      'Den gefilterten Zustand lesen, als nutzte er future Beobachtungen.',
      'Einen stochastischen Trend erzwingen, obwohl das Niveau-Modell bessere AIC/BIC hat.',
      'Regime-Labels ohne inhaltliche Prüfung interpretieren.',
      'Die Unsicherheit der Regimeklassifikation ignorieren.',
    ],
    charts: ['Beobachtete Reihe, geglättetes Niveau und Prognose.', 'Geglättete Wahrscheinlichkeit des zweiten Regimes.'],
    glossary: [
      { term: 'Kalman-Filter', definition: 'Rekursive Aktualisierung eines latenten Zustands aus verrauschten Beobachtungen.' },
      { term: 'Smoother', definition: 'Schätzung des latenten Zustands aus der ganzen Reihe, Vergangenheit und Zukunft.' },
      { term: 'Markov-Switching', definition: 'Modell, in dem Parameter gemäß einer verborgenen Markov-Kette wechseln.' },
    ],
    seeAlso: ['timeseries', 'var'],
  }),
];
