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
  {
    id: 'pls',
    area: 'procedures',
    title: 'Partielle kleinste Quadrate (PLS)',
    summary:
      'Latente Komponenten, die die Kovarianz mit dem Ergebnis maximieren, für viele korrelierte Prädiktoren.',
    tutorial: {
      goal: 'Ein kontinuierliches Ergebnis aus vielen stark korrelierten Prädiktoren vorhersagen, bei denen die gewöhnliche Regression instabile oder unlesbare Koeffizienten liefert.',
      steps: [
        'Abhängige Variable: das kontinuierliche Ergebnis.',
        'Prädiktoren: die korrelierten Messungen, etwa Spektralbänder, Sensorkanäle oder Fragebogenitems.',
        'Komponenten: mit zwei oder drei beginnen und erhöhen, solange Q² in der Kreuzvalidierung steigt.',
        'Kreuzvalidierungsfaltungen: fünf sind üblich; null schaltet Q² ab.',
        'Modell ausführen und Koeffizienten, erklärte Varianz je Komponente, kumuliertes R² und Q² sowie die VIP-Werte lesen.',
      ],
      expected:
        'Eine Koeffiziententabelle auf der ursprünglichen Skala, eine Komponententabelle mit R², kumuliertem R² und Q², eine VIP-Tabelle mit der Schwelle bei eins sowie Diagramme für beobachtet gegen vorhergesagt und für die Anpassung je Komponente.',
    },
    advanced: {
      whenToUse: [
        'Viele stark kollineare Prädiktoren, wie in Spektroskopie, Chemometrie, Omik oder Sensordaten.',
        'Die Vorhersage ist das Ziel und die einzelnen Koeffizienten sind nicht Gegenstand der Inferenz.',
        'Die Zahl der Prädiktoren ist nahe an oder größer als die Zahl der Beobachtungen.',
        'Sie möchten wenige interpretierbare latente Richtungen statt eines Blackbox-Modells.',
      ],
      whenNotToUse: [
        'Sie brauchen p-Werte oder einen kausalen Effekt je Prädiktor: dann ist eine Regression mit klarem Design besser.',
        'Es gibt wenige, schwach korrelierte Prädiktoren: OLS ist einfacher und lesbarer.',
        'Die Beziehung ist stark nichtlinear: Splines oder Baummodelle passen möglicherweise besser.',
        'Kreuzvalidierung ist nicht möglich, weil die Stichprobe winzig oder die Beobachtungen abhängig sind.',
      ],
      reading: [
        'Ein Koeffizient ist die Änderung des Ergebnisses pro Einheit des Prädiktors, wenn die anderen über die Komponenten auf ihren beobachteten Werten gehalten werden; er ist kein partieller Regressionseffekt.',
        'R² ist der Anteil der Ergebnisvarianz in der Stichprobe; Q² ist derselbe Anteil unter Kreuzvalidierung und die ehrliche Maßzahl der Vorhersagekraft.',
        'VIP über eins markiert Prädiktoren, die mehr als durchschnittlich zu den Komponenten beitragen; VIP ist ein Auswahlkriterium, kein Signifikanztest.',
        'Wählen Sie die kleinste Komponentenzahl, nach der Q² nicht mehr steigt; danach wird vor allem Rauschen angepasst.',
      ],
      pitfalls: [
        'Die Komponentenzahl nur nach R² wählen, das immer steigt und Überanpassung verdeckt.',
        'Einen PLS-Koeffizienten als partiellen OLS-Effekt oder kausalen Effekt lesen.',
        'Die Prädiktoren nicht zentrieren, sodass die erste Komponente vor allem den Mittelwert erfasst.',
        'Kreuzvalidierungsfaltungen verwenden, die bei gruppierten Daten Informationen zwischen Training und Test durchlassen.',
        'VIP als p-Wert oder als Beweis für die Wichtigkeit eines Prädiktors berichten.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt mit der Diagonale als Referenz und nach Residuum gefärbten Punkten.',
        'R² und Q² je Komponentenzahl, um das kleinste nützliche Modell zu wählen.',
        'VIP-Werte je Prädiktor mit der Linie bei eins.',
      ],
    },
    seeAlso: ['regression', 'glm', 'mars'],
  },
  {
    id: 'mars',
    area: 'procedures',
    title: 'GAM / MARS (adaptive Splines)',
    summary:
      'Stückweise lineare Hinge-Funktionen, automatisch gewählt, mit optionalen Interaktionen und GCV-Beschneidung.',
    tutorial: {
      goal: 'Eine flexible nichtlineare Beziehung zwischen einem kontinuierlichen Ergebnis und einem oder mehreren Prädiktoren anpassen, ohne die Funktionsform vorzugeben.',
      steps: [
        'Abhängige Variable: das kontinuierliche Ergebnis.',
        'Prädiktoren: die kontinuierlichen Variablen, deren Effekt sich krümmen oder die Richtung ändern kann.',
        'Maximaler Grad: eins für additive Effekte, zwei für das Produkt zweier Hinge-Funktionen.',
        'Maximale Terme: ein Budget für die Basisfunktionen; mit etwa zwanzig beginnen und die Beschneidung reduzieren lassen.',
        'Strafterm und Beschneidung: den Standardwert zwei behalten und die GCV-Beschneidung aktivieren, sofern nicht das volle Vorwärtsmodell benötigt wird.',
        'Modell ausführen und die ausgewählten Terme, Knoten, GCV, R² und die Prädiktorwichtigkeit lesen.',
      ],
      expected:
        'Eine Tabelle der ausgewählten Hinge-Terme mit Knoten und Koeffizienten, eine Anpassungstabelle mit RSS, GCV, R² und adjustiertem R², eine Wichtigkeitstabelle sowie Diagramme für beobachtet gegen vorhergesagt und für den partiellen Effekt des Hauptprädiktors.',
    },
    advanced: {
      whenToUse: [
        'Die Form des Effekts ist unbekannt oder ändert über den Wertebereich die Richtung.',
        'Sie möchten eine automatische Alternative zur Wahl eines Polynomgrades.',
        'Sie müssen viele Prädiktoren auf nichtlineare Effekte und Interaktionen prüfen.',
        'Die Vorhersage ist wichtiger als ein einzelner interpretierbarer Koeffizient.',
      ],
      whenNotToUse: [
        'Sie brauchen einen Koeffizienten je Prädiktor mit klarer kausaler Interpretation.',
        'Sie müssen weit über den beobachteten Bereich hinaus extrapolieren: Hinge-Funktionen sind lokal.',
        'Die Stichprobe ist sehr klein oder alle Prädiktoren sind kategorial.',
        'Ein einfaches lineares oder polynomiales Modell passt bereits und ist leichter zu erklären.',
      ],
      reading: [
        'Jeder Hinge-Term ist eine Steigungsänderung an einem Knoten: ein positiver Koeffizient erhöht die Steigung danach, ein negativer senkt sie.',
        'Die GCV balanciert die Residuenquadratsumme gegen die Zahl der Terme; niedriger ist besser und sie steuert die Beschneidung.',
        'Die ausgewählten Terme sind die nach der Beschneidung verbliebenen Teile; ein Prädiktor ohne Term hat keinen erkennbaren nichtlinearen Beitrag.',
        'Das Diagramm des partiellen Effekts hält die anderen Prädiktoren auf ihren beobachteten Werten und zeigt die dem einen Prädiktor zugeschriebene Form.',
      ],
      pitfalls: [
        'Ein sehr großes Vorwärtsmodell bauen und die Beschneidung vergessen, sodass die Anpassung dem Rauschen folgt.',
        'Über die beobachteten Knoten hinaus extrapolieren, wo die stückweise Form willkürlich ist.',
        'Einen Hinge-Koeffizienten als Gesamtsteigung statt als lokale Änderung lesen.',
        'Interaktionen ignorieren, wenn das Residuenbild noch Struktur zeigt.',
        'GCV zwischen Modellen mit unterschiedlich vielen vollständigen Zeilen vergleichen.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt mit der Diagonale zur Kalibrierungskontrolle.',
        'Profil des partiellen Effekts des ersten Prädiktors bei beobachteten Werten der übrigen.',
        'Prädiktorwichtigkeit, gemessen am Anpassungsverlust beim Entfernen des Prädiktors.',
      ],
    },
    seeAlso: ['regression', 'nonlinear', 'pls'],
  },
  {
    id: 'iv',
    area: 'procedures',
    title: 'Instrumentalvariablen (2SLS)',
    summary:
      'Ein konsistenter Effekt für einen endogenen Regressor, mit Instrumenten, die ihn beeinflussen, aber nicht direkt auf das Ergebnis wirken.',
    tutorial: {
      goal: 'Den Effekt eines Prädiktors schätzen, der wegen ausgelassener Variablen, Messfehler oder Simultaneität mit dem Fehler korreliert ist.',
      steps: [
        'Ergebnis: die kontinuierliche abhängige Variable.',
        'Endogene Prädiktoren: die Regressoren, deren Effekt Sie wollen, die aber nicht exogen sind.',
        'Instrumente: Variablen, die die endogenen Regressoren vorhersagen und nur über sie auf das Ergebnis wirken.',
        'Exogene Prädiktoren: Kontrollen, die bereits gültige Instrumente für sich selbst sind.',
        'Robuste Standardfehler: HC1 aktivieren, wenn die Residuenvarianz nicht konstant ist.',
        'Modell ausführen und strukturelle Koeffizienten, partielle F der ersten Stufe, Sargan- und Wu–Hausman-Test lesen.',
      ],
      expected:
        'Eine strukturelle Gleichung mit Koeffizienten, Standardfehlern, t-Werten und Intervallen, eine Tabelle der ersten Stufe mit den ausgeschlossenen Instrumenten und ihrer partiellen F, eine Diagnostiktabelle mit Sargan und Wu–Hausman sowie Diagramme für beobachtet gegen vorhergesagt und OLS gegen 2SLS.',
    },
    advanced: {
      whenToUse: [
        'Nicht beobachtete ausgelassene Variablen, die mit einem Regressor korreliert sind.',
        'Messfehler in einem zentralen Regressor, wenn eine zweite Messung oder ein Instrument verfügbar ist.',
        'Simultaneität, etwa bei Angebot und Nachfrage oder Preis und Menge.',
        'Natürliche Experimente, randomisierte Ermutigungsdesigns und Politikinstrumente.',
      ],
      whenNotToUse: [
        'Die Instrumente sind schwach: eine F der ersten Stufe unter etwa zehn macht 2SLS verzerrt und die Standardfehler unzuverlässig.',
        'Die Ausschlussbedingung ist nicht glaubwürdig: die Gültigkeit eines Instruments lässt sich aus den Daten allein nicht prüfen.',
        'Sie brauchen den durchschnittlichen Effekt der Population und die Effekte sind heterogen.',
        'Es gibt kein glaubwürdiges Instrument: eine IV-Schätzung mit schlechtem Instrument ist schlechter als eine ehrliche OLS mit Einschränkung.',
      ],
      reading: [
        'Der 2SLS-Koeffizient ist der Effekt einer Einheit Änderung des endogenen Regressors für den Teil der Variation, der von den Instrumenten getrieben wird.',
        'Die partielle F der ersten Stufe prüft, ob die ausgeschlossenen Instrumente Erklärungskraft hinzufügen; Werte unter zehn signalisieren schwache Instrumente.',
        'Sargan prüft die Überidentifikationsrestriktionen, wenn es mehr Instrumente als endogene Regressoren gibt; ein großer p-Wert ist mit Gültigkeit vereinbar, aber kein Beweis.',
        'Wu–Hausman vergleicht OLS und 2SLS; ein kleiner p-Wert spricht für Endogenität und für die Notwendigkeit von 2SLS.',
      ],
      pitfalls: [
        'Ein schwaches Instrument verwenden, das 2SLS in Richtung OLS verschiebt und die Standardfehler aufbläht.',
        'Das Ergebnis oder eine Post-Treatment-Variable unter die Instrumente aufnehmen.',
        'Einen nicht signifikanten Sargan-Test als Beweis der Instrumentengültigkeit behandeln.',
        'Vergessen, dass die Ausschlussbedingung eine Annahme und kein Test ist.',
        'OLS und 2SLS vergleichen, ohne erste Stufe und Diagnostik zu berichten.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt aus der strukturellen Gleichung.',
        'OLS- und 2SLS-Koeffizienten des endogenen Regressors nebeneinander mit Intervallen.',
        'Residuen gegen vorhergesagt zur Kontrolle verbleibender Struktur.',
      ],
    },
    seeAlso: ['regression', 'panel', 'selection'],
  },
  {
    id: 'panel',
    area: 'procedures',
    title: 'Panelmodell (feste und zufällige Effekte)',
    summary:
      'Within-Effekte und GLS-Zufallseffekte für wiederholte Beobachtungen derselben Einheiten.',
    tutorial: {
      goal: 'Den Effekt zeitvariierender Prädiktoren schätzen und dabei stabile, nicht beobachtete Unterschiede zwischen Einheiten kontrollieren.',
      steps: [
        'Ergebnis: die wiederholt gemessene kontinuierliche abhängige Variable.',
        'Prädiktoren: die zeitvariierenden Regressoren.',
        'Einheit: die Spalte, die die Einheit identifiziert (Person, Firma, Land).',
        'Zeit: die Spalte, die die wiederholten Beobachtungen innerhalb jeder Einheit ordnet.',
        'Modell: feste Effekte, zufällige Effekte oder beide zum Vergleich mit dem Hausman-Test.',
        'Modell ausführen und Within-Koeffizienten, Varianzkomponenten, Hausman-Test und Einheitseffekte lesen.',
      ],
      expected:
        'Eine Tabelle mit festen Effekten und geclusterten Standardfehlern, eine Tabelle mit GLS-Zufallseffekten, Varianzkomponenten für Einheit und Fehler, den Hausman-Test sowie Diagramme für beobachtet gegen vorhergesagt und für die Einheitseffekte.',
    },
    advanced: {
      whenToUse: [
        'Längsschnittdaten mit wiederholten Beobachtungen derselben Einheiten.',
        'Sie möchten alle stabilen Confounder zwischen Einheiten entfernen, beobachtet oder nicht.',
        'Aggregierte Paneldaten, etwa Länder oder Firmen über Jahre.',
        'Sie müssen Within- und Between-Variation vergleichen.',
      ],
      whenNotToUse: [
        'Der interessierende Prädiktor ist zeitinvariant: feste Effekte absorbieren ihn vollständig.',
        'Der Hausman-Test lehnt zufällige Effekte ab: die RE-Schätzung ist inkonsistent.',
        'Es gibt sehr wenige Einheiten, sodass Varianzkomponenten und geclusterte Standardfehler unzuverlässig sind.',
        'Das Modell ist dynamisch und enthält die verzögerte abhängige Variable: der Within-Schätzer ist verzerrt.',
      ],
      reading: [
        'Ein Koeffizient mit festen Effekten ist die durchschnittliche Änderung innerhalb einer Einheit, wenn sich ihr Prädiktor ändert; er identifiziert den Effekt aus der Within-Variation.',
        'Ein Zufallseffekt-Koeffizient ist eine präzisionsgewichtete Kombination aus Within- und Between-Variation und effizienter, wenn die Annahme gilt.',
        'Der Hausman-Test vergleicht beide: ein kleiner p-Wert zeigt systematische Unterschiede und spricht für feste Effekte.',
        'Die Einheitsvarianz misst, wie persistent die Variabilität zwischen Einheiten ist; die idiosynkratische Komponente ist das verbleibende Within-Rauschen.',
      ],
      pitfalls: [
        'Einen Fest-Effekt-Koeffizienten als Between-Vergleich interpretieren.',
        'Einen zeitinvarianten Prädiktor in ein Modell mit festen Effekten aufnehmen und sich wundern, warum er verschwindet.',
        'Zufällige Effekte verwenden, wenn der Hausman-Test sie ablehnt.',
        'Serielle Korrelation ignorieren und nicht geclusterte Standardfehler berichten.',
        'Ein kurzes Panel behandeln, als hätte es viele Einheiten.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt zur Kalibrierungskontrolle über das ganze Panel.',
        'Caterpillar-Diagramm der Einheitseffekte, sortiert, zum Erkennen auffälliger Einheiten.',
        'Koeffizienten mit festen und zufälligen Effekten mit Intervallen.',
      ],
    },
    seeAlso: ['regression', 'lmm', 'iv'],
  },
  {
    id: 'selection',
    area: 'procedures',
    title: 'Tobit und Heckman-Selektion',
    summary:
      'Zensierte Regression für begrenzte Ergebnisse und zweistufige Korrektur für Stichprobenselektion.',
    tutorial: {
      goal: 'Den Effekt von Prädiktoren schätzen, wenn das Ergebnis nur oberhalb oder unterhalb einer Schwelle oder nur für eine ausgewählte Teilgruppe beobachtet wird.',
      steps: [
        'Modell: Tobit für ein zensiertes Ergebnis, Heckman für eine ausgewählte Stichprobe.',
        'Ergebnis: die zensierte Variable für Tobit oder das beobachtete Ergebnis für Heckman.',
        'Prädiktoren: die Regressoren der Ergebnisgleichung.',
        'Zensierungsgrenzen: die untere und optional die obere Schwelle für Tobit.',
        'Selektionsindikator und Selektionsprädiktoren: die 0/1-Inklusionsvariable und die Variablen, die die Inklusion erklären; mindestens eine Variable aufnehmen, die nicht in der Ergebnisgleichung steht.',
        'Modell ausführen und Koeffizienten, Sigma, Rho und den Koeffizienten der inversen Mills-Ratio lesen.',
      ],
      expected:
        'Für Tobit Koeffizienten auf der latenten Skala mit Standardfehlern, Sigma, Log-Likelihood und AIC. Für Heckman eine Ergebnisgleichung, eine Selektionsgleichung, Sigma, Rho, Lambda, die inverse Mills-Ratio und einen Wald-Test der Selektionskorrektur. Diagramme zeigen beobachtet gegen vorhergesagt und das Zensierungs- oder Selektionsmuster.',
    },
    advanced: {
      whenToUse: [
        'Löhne, die nur für Erwerbstätige beobachtet werden, mit Nichtteilnahme als Selektionsmechanismus.',
        'Ausgaben oder Stunden mit einer sinnvollen unteren Grenze und echter Zensierung.',
        'Nachweisgrenzen in Labormessungen.',
        'Selektion auf nicht beobachtbare Faktoren, die Matching auf beobachtete Kovariaten nicht behandelt.',
      ],
      whenNotToUse: [
        'Die Nullen sind echte Ergebnisse und keine zensierten Werte: ein Zwei-Teil- oder Hurdle-Modell ist geeigneter.',
        'Die Selektion hängt vermutlich nur von beobachteten Kovariaten ab: Propensity-Matching ist transparenter.',
        'Es gibt keine Ausschlussrestriktion: Heckman ist nur über die Nichtlinearität der inversen Mills-Ratio identifiziert und fragil.',
        'Die Fehler sind stark nichtnormal oder heteroskedastisch: Tobit und Heckman sind inkonsistent.',
      ],
      reading: [
        'Tobit-Koeffizienten sind Effekte auf das latente unzensierte Ergebnis, nicht auf den beobachteten Mittelwert; der Effekt auf den beobachteten Mittelwert schrumpft mit der Wahrscheinlichkeit, nicht zensiert zu sein.',
        'Sigma ist die Standardabweichung des latenten Fehlers; ein großes Sigma bedeutet substanzielle Zensierung.',
        'In Heckman ist Rho die Korrelation zwischen Selektions- und Ergebnis-Fehler; ein von null verschiedenes Rho zeigt, dass die Selektion zählt.',
        'Lambda ist der Koeffizient der inversen Mills-Ratio in der Ergebnisgleichung; er ist der Korrekturterm, kein kausaler Effekt.',
        'Die Selektionsgleichung sollte ein Instrument enthalten, das die Inklusion vorhersagt, aber aus der Ergebnisgleichung ausgeschlossen werden kann; ohne es beruht die Identifikation nur auf der Funktionsform.',
      ],
      pitfalls: [
        'Tobit-Koeffizienten als Effekte auf das beobachtete statt auf das latente Ergebnis lesen.',
        'Heckman ohne Ausschlussrestriktion verwenden und das Ergebnis als robust behandeln.',
        'OLS auf der selektierten Stichprobe verwenden und den Selektionsbias ignorieren.',
        'Zensierung und Trunkierung verwechseln: zensierte Einheiten bleiben als Grenzwerte im Sample, trunkierte fehlen ganz.',
        'Glauben, der zweistufige Heckman sei Maximum-Likelihood: er ist konsistent, aber weniger effizient, und die Standardfehler brauchen die Korrektur.',
      ],
      charts: [
        'Beobachtet gegen vorhergesagt auf der beobachteten Skala.',
        'Tobit: latenter Mittelwert gegen beobachtetes Ergebnis mit der Zensierungslinie.',
        'Heckman: Verteilung der inversen Mills-Ratio und Selektionswahrscheinlichkeit nach Ergebnis.',
      ],
    },
    seeAlso: ['regression', 'iv', 'propensity'],
  },
  {
    id: 'mediation',
    area: 'procedures',
    title: 'Mediationsanalyse',
    summary:
      'Indirekte, direkte und totale Effekte eines Prädiktors über einen Mediator, mit Sobel- und Bootstrap-Intervallen.',
    tutorial: {
      goal: 'Quantifizieren, wie viel des Effekts eines Prädiktors auf das Ergebnis über eine Zwischenvariable läuft.',
      steps: [
        'Ergebnis: die kontinuierliche Zielvariable.',
        'Prädiktor: die Exposition oder unabhängige Variable.',
        'Mediator: die Zwischenvariable, die auf dem Pfad liegen soll.',
        'Kovariaten: optionale Confounder der Beziehungen Prädiktor–Mediator, Prädiktor–Ergebnis und Mediator–Ergebnis.',
        'Bootstrap-Wiederholungen: 1000 sind ein sinnvoller Start; null lässt nur Sobel- und Delta-Intervalle.',
        'Modell ausführen und die Pfade a, b und c′, den indirekten und totalen Effekt, den medierten Anteil und das Bootstrap-Intervall lesen.',
      ],
      expected:
        'Eine Pfadtabelle mit a, b und c′, eine Effekttabelle mit totalem, direktem und indirektem Effekt samt Standardfehlern und Intervallen, den medierten Anteil sowie ein Diagramm der Effektgrößen und der Bootstrap-Verteilung des indirekten Effekts.',
    },
    advanced: {
      whenToUse: [
        'Mechanismusfragen: nicht nur ob X auf Y wirkt, sondern über welchen Pfad.',
        'Prozessevaluation und klinische oder psychologische Pfade.',
        'Es gibt eine glaubwürdige zeitliche Reihenfolge und die wichtigsten Confounder wurden gemessen.',
        'Der indirekte Effekt ist die Zielgröße, nicht ein einzelner Regressionskoeffizient.',
      ],
      whenNotToUse: [
        'Die Daten sind querschnittlich und die zeitliche Reihenfolge nur angenommen: nennen Sie es Assoziation, nicht Mediation.',
        'Es gibt einen nicht gemessenen Mediator–Ergebnis-Confounder, der von der Exposition beeinflusst wird.',
        'Prädiktor und Mediator interagieren: ein Modell moderierter Mediation ist nötig.',
        'Der totale Effekt ist nahe null, was den medierten Anteil instabil und uninterpretierbar macht.',
      ],
      reading: [
        'Der indirekte Effekt ist a × b; der totale Effekt ist c′ + a × b; der direkte Effekt ist c′.',
        'Der medierte Anteil ist der indirekte Effekt geteilt durch den totalen; er ist instabil, wenn der totale Effekt klein ist, und kann außerhalb von 0–1 liegen.',
        'Der Sobel-Standardfehler nutzt die Delta-Methode und ist konservativ; das percentile Bootstrap-Intervall wird meist bevorzugt.',
        'Ein Bootstrap-Intervall, das null ausschließt, ist Evidenz für einen indirekten Effekt; es ist keine bayessche Posterior-Wahrscheinlichkeit.',
      ],
      pitfalls: [
        'Eine Querschnittsassoziation ohne glaubwürdige zeitliche Reihenfolge Mediation nennen.',
        'Confounding der Mediator–Ergebnis-Beziehung ignorieren.',
        'Den medierten Anteil berichten, wenn der totale Effekt nahe null ist.',
        'Den Sobel-Test als einzige Inferenz nutzen, wenn der indirekte Effekt schief verteilt ist.',
        'Den Bootstrap-Seed nicht fixieren, sodass sich das Intervall bei jedem Lauf ändert.',
      ],
      charts: [
        'Effektgrößen für direkten, indirekten und totalen Effekt mit Intervallen.',
        'Bootstrap-Verteilung des indirekten Effekts mit Perzentilintervall und markierter Null.',
        'Pfadkoeffizienten a, b und c′ auf einen Blick.',
      ],
    },
    seeAlso: ['regression', 'propensity'],
  },
  {
    id: 'propensity',
    area: 'procedures',
    title: 'Propensity Score',
    summary:
      'Matching und inverse Wahrscheinlichkeitsgewichtung für Behandlungseffekte in Beobachtungsdaten.',
    tutorial: {
      goal: 'Eine behandelte und eine unbehandelte Gruppe vergleichen, wenn die Behandlung nicht randomisiert war, aber die relevanten Confounder gemessen wurden.',
      steps: [
        'Behandlung: der 0/1-Indikator für die Behandlung.',
        'Ergebnis: die kontinuierliche Antwort.',
        'Kovariaten: die Prä-Treatment-Variablen, die sowohl Behandlung als auch Ergebnis vorhersagen.',
        'Methode: Nearest-Neighbour-Matching oder inverse Wahrscheinlichkeitsgewichtung.',
        'Caliper und Verhältnis: beim Matching die maximale Distanz in Standardabweichungen des Logit-Scores und die Zahl der Kontrollen je behandelter Einheit.',
        'Modell ausführen und Propensity-Modell, Balancetabelle vor und nach der Anpassung, ATT und Zahl der gematchten oder effektiven Beobachtungen lesen.',
      ],
      expected:
        'Eine Tabelle des Propensity-Modells, eine Balancetabelle mit standardisierten Mittelwertdifferenzen vor und nach Matching oder Gewichtung, den ATT mit Standardfehler und Intervall, die Zahl der gematchten Einheiten oder die effektive Stichprobengröße sowie Diagramme für die Score-Überlappung und die Balance-Verbesserung.',
    },
    advanced: {
      whenToUse: [
        'Beobachtungsstudien, in denen die Zuweisung von gemessenen Confoundern abhängt.',
        'Programmevaluation und vergleichende Wirksamkeitsforschung.',
        'Sie möchten behandelte und unbehandelte Gruppen vergleichbar machen, bevor Sie den Effekt schätzen.',
        'Der Zielparameter ist der Effekt auf die Behandelten (ATT).',
      ],
      whenNotToUse: [
        'Nicht gemessenes Confounding ist plausibel: Matching kann es nicht entfernen.',
        'Die Gruppen überlappen kaum, sodass viele behandelte Einheiten keine vergleichbaren Kontrollen haben.',
        'Ein glaubwürdiges Instrument ist verfügbar: IV zielt auf einen anderen, oft glaubwürdigeren Effekt.',
        'Die Behandlung variiert über die Zeit oder die Kovariaten werden nach der Behandlung gemessen.',
      ],
      reading: [
        'Der ATT ist der durchschnittliche Effekt für die behandelten Einheiten, nicht für die ganze Population; der ATE erfordert eine Gewichtung der gesamten Stichprobe.',
        'Eine standardisierte Mittelwertdifferenz unter 0,1 nach der Anpassung ist die übliche Faustregel für gute Balance.',
        'Der Caliper verwirft behandelte Einheiten ohne nahe Kontrolle; ein kleinerer Caliper verbessert die Balance, ändert aber den Zielparameter und verkleinert die Stichprobe.',
        'Inverse Wahrscheinlichkeitsgewichtung gibt Behandelten Gewicht 1/e und Kontrollen 1/(1−e); sehr große Gewichte zeigen schlechte Überlappung.',
      ],
      pitfalls: [
        'Balance mit Signifikanztests statt mit standardisierten Differenzen beurteilen.',
        'Den gemeinsamen Träger ignorieren und auf behandelte Einheiten ohne vergleichbare Kontrollen extrapolieren.',
        'Post-Treatment-Variablen oder das Ergebnis in das Propensity-Modell aufnehmen.',
        'Den ATT berichten, als wäre er der durchschnittliche Effekt für alle.',
        'Matching ohne Prüfung der Balance der gematchten Stichprobe verwenden.',
      ],
      charts: [
        'Überlappung der Propensity Scores zwischen Behandelten und Kontrollen.',
        'Love-Plot der standardisierten Mittelwertdifferenzen vor und nach der Anpassung.',
        'ATT mit Konfidenzintervall und Zahl der gematchten oder effektiven Beobachtungen.',
      ],
    },
    seeAlso: ['logistic', 'iv', 'regression'],
  },
];
