import type { HelpTopic } from './types';

/** Welle 3: verallgemeinerte lineare gemischte Modelle. */
export const w3Topics: HelpTopic[] = [
  {
    id: 'glmm',
    area: 'procedures',
    title: 'Verallgemeinertes lineares gemischtes Modell (GLMM)',
    summary:
      'Zufällige Achsenabschnitte und Steigungen für binäre, Zähl- und kontinuierliche Endpunkte mit nicht-gaußscher Familie.',
    tutorial: {
      goal: 'Den Effekt einer Behandlung auf einen binären oder einen Zählendpunkt schätzen, wenn die Beobachtungen geclustert sind (Wiederholungsvisiten, Zentren, Würfe) und die Clusterung nicht ignoriert werden darf.',
      steps: [
        'Zielvariable: der Endpunkt auf seiner natürlichen Skala, zum Beispiel eine 0/1-Antwort oder eine Anzahl pro Visite.',
        'Familie und Link: binomial mit Logit für 0/1, Poisson mit Log für Zählungen, gaußsch mit Identität für einen annähernd normalverteilten Endpunkt.',
        'Feste Effekte: die Prädiktoren, deren Effekt in der Population interessiert, etwa Behandlung, Zeit und deren Interaktion.',
        'Gruppierungsspalte: die Kennung des Clusters (Person, Zentrum, Charge). Jede Zeile muss die Ebene tragen, zu der sie gehört.',
        'Zufällige Effekte: mit einem zufälligen Achsenabschnitt für die Gruppierungsspalte beginnen und eine zufällige Steigung für die Zeit nur dann ergänzen, wenn das Design genügend Cluster und Wiederholungsmessungen hat.',
        'Modell schätzen und die festen Koeffizienten auf der Link-Skala, die Varianzkomponenten, den ICC und die bedingten Modi (BLUPs) je Cluster lesen.',
      ],
      expected:
        'Tabelle der festen Effekte mit Standardfehlern, z-Werten und Konfidenzintervallen auf der Link-Skala; Varianzkomponenten der zufälligen Effekte (Varianz des Achsenabschnitts, Varianz der Steigung, Korrelation zwischen beiden); Dispersions- oder Residuenparameter, wo die Familie ihn verlangt; ICC; BLUPs für jede Ebene der Gruppierungsspalte; Informationskriterien (AIC, BIC) für den Modellvergleich.',
    },
    advanced: {
      assumptions: [
        'Bedingte Unabhängigkeit: gegeben ihre zufälligen Effekte folgt jede Beobachtung der gewählten Familie und ist von den übrigen unabhängig.',
        'Die zufälligen Effekte sind normalverteilt mit Erwartungswert null und einer über alle Cluster konstanten Kovarianzmatrix.',
        'Die Cluster sind voneinander unabhängig und austauschbar; keine Cluster-Variable fehlt im festen Teil.',
        'Der lineare Prädiktor ist auf der Link-Skala korrekt spezifiziert: richtiger Link, richtige funktionale Form, keine wichtige Interaktion ausgelassen.',
        'Genügend Cluster zur Schätzung einer Varianz: 20–30 Ebenen sind ein praktisches Minimum für einen zufälligen Achsenabschnitt, für eine zufällige Steigung deutlich mehr.',
      ],
      whenToUse: [
        'Binäre, Zähl- oder schiefe Endpunkte, die wiederholt an denselben Personen gemessen werden, wo ein Marginalmodell die Korrelation innerhalb der Person verdecken würde.',
        'Multizentrische oder geclusterte Designs, in denen der Clustereffekt eine zu modellierende Störgröße ist und keine Menge fester Kontraste.',
        'Zählungen mit Überdispersion, die durch die Clusterung und nicht durch einen zusätzlichen Dispersionsparameter erklärt wird.',
        'Wenn clusterspezifische Vorhersagen gebraucht werden, also der BLUP jeder Person oder jedes Zentrums, neben den Populationsmittelwerten.',
      ],
      whenNotToUse: [
        'Kontinuierliche, annähernd normalverteilte Endpunkte mit geclusterten Daten: ein lineares gemischtes Modell ist einfacher und braucht keine Approximation.',
        'Nur ein binärer oder ein Zählendpunkt pro Person ohne Clusterung: die gewöhnliche logistische bzw. Zählregression genügt.',
        'Sehr wenige Cluster (unter etwa zehn): Varianzkomponenten werden schlecht geschätzt und die Standardfehler der festen Effekte sind unzuverlässig; feste Effekte für das Cluster oder ein Marginalansatz mit Kleinstichproben-Korrektur sind dann zu erwägen.',
        'Wenn nur populationsgemittelte Effekte gebraucht werden und die Korrelation direkt modelliert werden darf: GEE ist robuster gegenüber falsch spezifizierten zufälligen Effekten.',
      ],
      reading: [
        'Feste Koeffizienten sind bedingte, clusterspezifische Effekte: bei Logit-Link ist exp(β) ein Odds Ratio für eine Person mit festgehaltenem zufälligem Effekt und betragsmäßig größer als das marginale Odds Ratio einer einfachen logistischen Regression.',
        'Bei Log-Link ist exp(β) ein Ratenverhältnis; bei Identitäts-Link ist der Koeffizient eine additive Änderung des Mittelwerts.',
        'Die Achsenabschnittsvarianz σ²ᵤ misst, wie stark das Ausgangsniveau zwischen Clustern schwankt; die Steigungsvarianz misst, wie stark der Effekt eines Prädiktors variiert, und die Korrelation zwischen Achsenabschnitt und Steigung sagt, ob Cluster mit höherem Start auch schneller steigen.',
        'Der ICC ist der Anteil der Varianz auf der latenten Skala, der auf das Cluster entfällt: σ²ᵤ / (σ²ᵤ + π²/3) beim Logit, σ²ᵤ / (σ²ᵤ + 1) beim Log und σ²ᵤ / (σ²ᵤ + σ²) beim gaußschen Identitätsmodell. Er beschreibt die Clusterung, nicht die erklärte Varianz.',
        'Ein BLUP ist die geschätzte Abweichung eines Clusters von der Populationsgeraden, zur Null hin geschrumpft im Verhältnis zur geringen Information dieses Clusters; er ist eine Vorhersage, kein getesteter Parameter.',
      ],
      pitfalls: [
        'Ein bedingtes Odds Ratio so lesen, als wäre es das marginale der logistischen Regression (oder umgekehrt), und beide numerisch vergleichen.',
        'Eine zufällige Steigung mit nur wenigen Clustern schätzen: die Varianz kollabiert auf null oder das Modell konvergiert nicht, und die Standardfehler verlieren ihre Bedeutung.',
        'BLUPs als Daten in einer zweistufigen Analyse behandeln; es sind geschrumpfte Schätzungen mit eigener Unsicherheit.',
        'Vergessen, dass die Laplace-Approximation eine Näherung bleibt: bei binären Daten mit wenigen Beobachtungen je Cluster können die Varianzkomponenten nach unten verzerrt sein; mit adaptiver Gauß-Hermite-Quadratur nachschätzen oder die Sensitivität prüfen.',
        'Eine Varianzkomponente mit einem gewöhnlichen Likelihood-Quotienten-Test gegen null prüfen; die Null liegt am Rand des Parameterraums und der p-Wert ist konservativ.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt: Punkte nach Cluster gefärbt mit der Diagonale als Referenz, um Kalibrierung und auffällige Cluster zu erkennen.',
        'Caterpillar-Plot der zufälligen Effekte: der Größe nach geordnete BLUPs mit ungefähren Konfidenzbereichen, um Ausreißercluster und das Ausmaß der Schrumpfung zu sehen.',
        'Residuen gegen vorhergesagte Werte: Pearson- oder randomisierte Quantilresiduen gegen den linearen Prädiktor, um falschen Link, verbleibende Krümmung oder Heteroskedastizität aufzudecken.',
      ],
      glossary: [
        {
          term: 'Zufälliger Achsenabschnitt',
          definition:
            'Clusterspezifische Verschiebung des Ausgangsniveaus auf der Link-Skala, gezogen aus einer Normalverteilung, deren Varianz geschätzt wird.',
        },
        {
          term: 'Zufällige Steigung',
          definition:
            'Clusterspezifische Abweichung im Effekt eines Prädiktors, mit eigener Varianz und Korrelation zum Achsenabschnitt.',
        },
        {
          term: 'Varianzkomponente',
          definition:
            'Geschätzte Varianz oder Kovarianz der zufälligen Effekte, welche die Variabilität zwischen Clustern beschreibt.',
        },
        {
          term: 'ICC',
          definition:
            'Intraklassenkorrelation: Anteil der Varianz auf der latenten Skala, der zwischen den Clustern liegt.',
        },
        {
          term: 'BLUP',
          definition:
            'Bester linearer unverzerrter Prädiktor: geschrumpfte bedingte Schätzung eines Clustereffekts.',
        },
        {
          term: 'Laplace-Approximation',
          definition:
            'Taylor-Entwicklung zweiter Ordnung um den bedingten Modus der zufälligen Effekte, mit der die Likelihood integriert wird.',
        },
        {
          term: 'Bedingtes Modell',
          definition:
            'Modell, dessen Koeffizienten ein einzelnes Cluster beschreiben, im Gegensatz zum marginalen, über die Population gemittelten Modell.',
        },
      ],
    },
    seeAlso: ['lmm', 'logistic', 'countreg', 'glm'],
  },
];
