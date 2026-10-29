import type { HelpTopic } from '../types';

/** Chapters that explain the application itself, before the procedures. */
export const areaTopics: HelpTopic[] = [
  {
    id: "start-tour",
    area: "start",
    title: "Erste Schritte: Daten, Analyse, Ergebnisse",
    summary: "Der ganze Ablauf in drei Schritten, damit Sie wissen, wo alles liegt.",
    tutorial: {
      goal: "Eine erste Analyse von Anfang bis Ende durchführen, ohne etwas über das Programm zu wissen.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie DATEN: Es ist eine Tabelle mit Kopfzeile und einer Spalte pro Variable.",
        "Drücken Sie Importieren und wählen Sie score-groups.csv: Trennzeichen und Dezimalstellen werden automatisch erkannt.",
        "Prüfen Sie den Typ unter jeder Kopfzeile: num für Zahlen, cat für Gruppen.",
        "Wechseln Sie zu ANALYSE, suchen Sie „T-Test“, füllen Sie den Einrichtungsbereich aus und drücken Sie „Analyse ausführen“.",
        "Lesen Sie den Lesetext, der jeden Lauf abschließt, und laden Sie den HTML-Bericht über die Ausgabeleiste herunter.",
      ],
      expected: "In der Ausgabe erscheinen Tabellen, gegebenenfalls Diagramme und ein Kommentar in verständlicher Sprache; ein erneuter Lauf überschreibt die vorherige Karte nie.",
    },
    advanced: {
      whenToUse: [
        "Wenn Sie einen einzigen Ablauf für Daten, Berechnung und Bericht möchten, ohne Dateien zwischen Programmen zu verschieben.",
        "Wenn Sie ein reproduzierbares Ergebnis benötigen: Daten und Parameter bleiben im .lzs-Projekt.",
      ],
      reading: [
        "Ausgabekarten sind Momentaufnahmen: Sie bleiben so, wie sie erzeugt wurden, auch wenn sich die Daten später ändern.",
        "Die Markierung „veraltet“ bedeutet, dass sich das Raster nach der Erzeugung dieses Ergebnisses geändert hat.",
      ],
      pitfalls: [
        "Bearbeiten Sie niemals Zahlen im Bericht: Korrigieren Sie die Daten und führen Sie die Analyse erneut aus.",
        "Speichern Sie das Projekt vor langen Versuchen: Das automatische Speichern liegt im Browser.",
      ],
      glossary: [
        { term: "Verfahren", definition: "Eine einzelne statistische Analyse, zum Beispiel der t-Test." },
        { term: "Ergebniskarte", definition: "Der Block mit Tabellen, Diagrammen und dem Bericht eines Laufs." },
      ],
    },
    seeAlso: ["data-import", "analysis-workflow", "output-console"],
  },
  {
    id: "data-import",
    area: "data",
    title: "CSV-, TSV-, Excel-, SPSS- und Stata-Dateien importieren",
    summary: "Daten einlesen, ohne Zahlen und Kategorien zu beschädigen.",
    tutorial: {
      goal: "Eine Datei mit Komma-Dezimalstellen und Textgruppen importieren.",
      dataset: "score-groups.csv",
      steps: [
        "Drücken Sie in DATEN auf Importieren und wählen Sie die Datei: CSV, TSV, TXT, JSON, Excel (.xlsx) sowie SPSS/Stata (.sav/.dta); die Vorschau zeigt die ersten Zeilen.",
        "Prüfen Sie das erkannte Trennzeichen (Komma, Semikolon, Tabulator) und das Dezimaltrennzeichen.",
        "Geben Sie an, ob die erste Zeile die Kopfzeile ist, und wählen Sie Anwenden als = Raster überschreiben.",
        "Drücken Sie Importieren und lesen Sie, wie viele Zeilen und Spalten übernommen wurden.",
      ],
      expected: "Das Raster zeigt eine Spalte pro Variable und eine Zeile pro Beobachtung, mit sinnvollen Spaltentypen.",
    },
    advanced: {
      assumptions: [
        "Jede Zeile ist eine vollständige Beobachtung; Variablen sind Spalten.",
        "Fehlende Codes müssen nach dem Import deklariert werden (z. B. -9, NA).",
      ],
      whenToUse: [
        "Dateien, die aus Excel, R, SPSS oder einer Online-Umfrage exportiert wurden.",
        "Mehrere Dateien mit denselben Spalten, die untereinander gestapelt werden sollen (Zeilen anhängen).",
      ],
      whenNotToUse: ["Daten, die nicht als eine Zeile pro Fall organisiert sind: Formen Sie sie zuerst um."],
      reading: [
        "„Zeilen und Spalten importiert“ bestätigt die Größe; „doppelte Kopfzeilen umbenannt“ weist auf wiederholte Namen hin.",
        "„BOM entfernt“ ist bei Dateien normal, die von Excel gespeichert wurden.",
      ],
      pitfalls: [
        "Ein falsches Dezimaltrennzeichen macht Zahlen zu Text: Prüfen Sie den Typ nach dem Import.",
        "Leere Zellen gelten immer als fehlend; ein besonderer Code ist nicht nötig.",
      ],
      glossary: [
        { term: "Trennzeichen", definition: "Das Zeichen, das in einer Textdatei die Spalten trennt." },
        { term: "Fehlender Code", definition: "Ein vereinbarter Wert wie -9, der als fehlend gelesen werden muss." },
      ],
    },
    seeAlso: ["data-editor", "data-clean", "projects"],
  },
  {
    id: "data-editor",
    area: "data",
    title: "Daten im Raster bearbeiten",
    summary: "Spaltentypen, Validierung, Rückgängig und schnelles Füllen.",
    tutorial: {
      goal: "Einen Wert korrigieren und eine Textspalte in Zahlen umwandeln.",
      dataset: "score-groups.csv",
      steps: [
        "Doppelklicken Sie auf eine Zelle und geben Sie den neuen Wert ein; Enter bestätigt und bewegt sich nach unten.",
        "Ändern Sie den Typ im Auswahlfeld unter der Kopfzeile (num, int, cat, str).",
        "Drücken Sie Prüfen, um ungültige Zellen aufzulisten; Automatisch korrigieren versucht die Umwandlung.",
        "Mit Strg+Z machen Sie rückgängig, mit Strg+Y wiederholen; wählen Sie einen Bereich und drücken Sie Strg+D, um nach unten zu füllen.",
      ],
      expected: "Die Zelle zeigt den neuen Wert, die Statusleiste aktualisiert die Zahl der ungültigen Zellen und Rückgängig stellt den vorherigen Zustand wieder her.",
    },
    advanced: {
      whenToUse: [
        "Kleine oder systematische Korrekturen vor einer Analyse.",
        "Berechnete Spalten mit einer Formel hinzufügen (z. B. Score_Post - Score_Pre).",
      ],
      reading: [
        "Der Spaltentyp steuert Validierung, automatische Korrektur und den Excel-Export; Analysen leiten Zahlen weiterhin aus den Werten ab.",
        "Der Variableninspektor zeigt fehlende Werte, verschiedene Werte und Rollen.",
      ],
      pitfalls: [
        "Das Umbenennen einer Spalte aktualisiert Formeln, aber Analyseparameter, die sie verwenden, müssen neu ausgewählt werden.",
        "Das Sortieren des Rasters ändert die Zeilenreihenfolge: Gepaarte Analysen hängen von dieser Reihenfolge ab.",
      ],
      glossary: [
        { term: "Validierung", definition: "Prüfen, ob jede Zelle mit dem deklarierten Typ vereinbar ist." },
        { term: "Berechnete Spalte", definition: "Eine Spalte, deren Wert eine Formel ist und bei jeder Änderung neu berechnet wird." },
      ],
    },
    seeAlso: ["data-import", "data-clean", "levels"],
  },
  {
    id: "data-clean",
    area: "data",
    title: "Daten bereinigen und transformieren",
    summary: "Suchen und Ersetzen, fehlende Werte, leere Zeilen und Duplikate.",
    tutorial: {
      goal: "Eine unterschiedlich geschriebene Beschriftung vereinheitlichen und leere Zellen mit dem Mittelwert füllen.",
      dataset: "score-groups.csv",
      steps: [
        "Drücken Sie Bereinigen und öffnen Sie Suchen / Ersetzen; wählen Sie eine Spalte oder Alle Spalten.",
        "Geben Sie den zu suchenden Text und die Ersetzung ein und drücken Sie Anwenden.",
        "Wählen Sie im Abschnitt Fehlend den Mittelwert und drücken Sie Füllen für die numerische Spalte.",
        "Entfernen Sie unter Aufräumen leere Zeilen und Duplikate nacheinander und lesen Sie dabei die Ergebnismeldung.",
      ],
      expected: "Eine Meldung berichtet, wie viele Ersetzungen oder Zellen geändert wurden; jeder Vorgang lässt sich mit Strg+Z rückgängig machen.",
    },
    advanced: {
      whenToUse: [
        "Vor jeder Analyse, um doppelte Kategorien zu vermeiden (Ja/ja, SI/si).",
        "Um Zeilen zu entfernen, die exakte Kopien sind und die Anzahlen aufblähen.",
      ],
      whenNotToUse: [
        "Füllen Sie nicht mit dem Mittelwert, wenn viele Werte fehlen oder nicht zufällig fehlen: Erwägen Sie die multiple Imputation.",
      ],
      reading: [
        "„Keine Treffer“ bedeutet, dass der Text nicht existiert, nicht dass der Vorgang fehlgeschlagen ist.",
        "„Zellen gefüllt mit“ berichtet den für die Imputation verwendeten Wert.",
      ],
      pitfalls: [
        "Das Ersetzen mit Regex ist mächtig: Testen Sie es zuerst in einer Spalte.",
        "Die Mittelwertimputation verringert die Streuung und unterschätzt die Standardfehler.",
      ],
      glossary: [
        {
          term: "Einfache Imputation",
          definition: "Ersetzen eines fehlenden Werts durch Mittelwert, Median, Modus oder eine Konstante.",
        },
        { term: "Duplikat", definition: "Eine Zeile, die in jeder Spalte mit einer anderen übereinstimmt." },
      ],
    },
    seeAlso: ["data-editor", "levels", "mi"],
  },
  {
    id: "levels",
    area: "data",
    title: "Gruppenstufen und Beschriftungen",
    summary: "Codes lesbare Namen geben, Reihenfolge und Referenzstufe wählen.",
    tutorial: {
      goal: "In Tabellen „Behandlung“ und „Kontrolle“ statt 1 und 0 anzeigen.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie das Menü der Gruppenspalte und wählen Sie Stufen bearbeiten.",
        "Geben Sie neben jedem Code eine Beschriftung ein und ordnen Sie sie mit den Pfeilen.",
        "Markieren Sie die Gruppe, die Sie als Modellreferenz möchten.",
        "Drücken Sie Stufen anwenden und führen Sie die Analyse erneut aus.",
      ],
      expected: "Tabellen, Diagramme und Berichte verwenden die Beschriftungen; modellbasierte Analysen vergleichen gegen die Referenz.",
    },
    advanced: {
      whenToUse: [
        "Immer wenn eine Gruppe kryptische numerische Codes hat.",
        "In Modellen mit Achsenabschnitt: Die Referenz entscheidet, wie die Koeffizienten zu lesen sind.",
      ],
      reading: [
        "Der Code bleibt in den Zellen; die Beschriftung ist reine Darstellung.",
        "Zellen mit Werten außerhalb der Liste erscheinen als „nicht in der Liste“ und bleiben in den Daten.",
      ],
      pitfalls: [
        "Das Entfernen einer Stufe löscht nie Beobachtungen: Es ändert nur, wie sie angezeigt werden.",
        "Das Ändern der Referenz ändert die Koeffizienten, nicht die Modellqualität.",
      ],
      glossary: [
        { term: "Referenzstufe", definition: "Die Kategorie, mit der die anderen Gruppen im Modell verglichen werden." },
        { term: "Treatment-Kodierung", definition: "Ein Schema, bei dem jede Gruppe mit der Referenz verglichen wird." },
      ],
    },
    seeAlso: ["data-editor", "anova", "regression"],
  },
  {
    id: "analysis-workflow",
    area: "analysis",
    title: "Eine Analyse auswählen und ausführen",
    summary: "Bibliothek, Suche, Einrichtungsbereich, Konfidenzniveau und erneute Läufe.",
    tutorial: {
      goal: "Das richtige Verfahren finden und ein vollständiges Ergebnis erhalten.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie ANALYSE: Die Bibliothek listet die Verfahren nach Familie auf.",
        "Geben Sie den Testnamen oder das Problem in das Suchfeld ein (z. B. „zwei Gruppen vergleichen“).",
        "Wählen Sie das Verfahren: Der Einrichtungsbereich zeigt nur die Parameter, die es benötigt.",
        "Wählen Sie die Variablen, legen Sie das Konfidenzniveau fest und drücken Sie „Analyse ausführen“ (Strg/⌘+Enter).",
        "Verwenden Sie Live, um bei Änderungen der Daten oder Parameter automatisch erneut auszuführen.",
      ],
      expected: "Eine neue Karte wird an die Ausgabe angehängt; die vorherige bleibt zum Vergleich erhalten.",
    },
    advanced: {
      whenToUse: [
        "Immer: Es ist der einzige Weg zu Tabellen, Diagrammen und dem schriftlichen Bericht.",
        "Live ist beim Erkunden praktisch, sollte aber bei aufwendigen Verfahren ausgeschaltet sein.",
      ],
      reading: [
        "Die Markierung „aufwendig“ kennzeichnet Verfahren, die ausdrücklich ausgeführt werden müssen.",
        "Wenn sich eine Spalte geändert hat, bittet das Verfahren darum, die betroffenen Variablen neu auszuwählen.",
      ],
      pitfalls: [
        "Das Ändern des Konfidenzniveaus ändert nicht die Daten, aber jede Schätzung.",
        "Ein erneuter Lauf ohne Änderungen erzeugt doppelte Karten: Verwenden Sie Anwenden, um Parameter wiederzuverwenden.",
      ],
      glossary: [
        { term: "Konfidenzniveau", definition: "Die Abdeckung der Intervalle: 95 % ist die übliche Wahl." },
        { term: "Momentaufnahme", definition: "Eine statische Kopie eines Ergebnisses, unabhängig von späteren Daten." },
      ],
    },
    seeAlso: ["choosing-test", "output-console", "start-tour"],
  },
  {
    id: "choosing-test",
    area: "analysis",
    title: "Welchen Test soll ich verwenden?",
    summary: "Eine kurze Karte von der Frage zum Verfahren, plus der geführte Assistent.",
    tutorial: {
      goal: "Ein Verfahren aus der Art der Frage und der Daten auswählen.",
      dataset: "score-groups.csv",
      steps: [
        "Öffnen Sie das geführte Verfahren (Familie Geführt).",
        "Wählen Sie die Frage: beschreiben, Gruppen vergleichen oder ein Ergebnis vorhersagen.",
        "Legen Sie das Ergebnis, die Gruppen und fest, ob die Messungen unabhängig oder gepaart sind.",
        "Lesen Sie die Empfehlung und drücken Sie Öffnen, um das Verfahren mit fertigen Parametern zu laden.",
      ],
      expected: "Das vorgeschlagene Verfahren öffnet sich im Bereich mit bereits ausgewählten Variablen; Sie müssen es nur ausführen.",
    },
    advanced: {
      whenToUse: ["Am Anfang, wenn Sie nicht die falsche Familie wählen möchten."],
      reading: [
        "Numerisches Ergebnis + 2 unabhängige Gruppen → t-Test oder Mann-Whitney; mehr Gruppen → ANOVA oder Kruskal-Wallis.",
        "Numerisches Ergebnis + gepaarte Messungen → gepaarter t-Test oder Wilcoxon.",
        "Binäres Ergebnis → Logistik oder Chi-Quadrat; Zeit bis zu einem Ereignis → Überlebensanalyse.",
      ],
      pitfalls: [
        "Die Empfehlung prüft nie die Annahmen: Prüfen Sie Normalität, Unabhängigkeit und Stichprobengröße.",
        "Bei wenigen Fällen passen nicht parametrische Tests oft besser.",
      ],
      glossary: [
        { term: "Gepaart", definition: "Wiederholte Messungen an derselben Einheit (vorher/nachher)." },
        { term: "Nicht parametrisch", definition: "Ein Test, der keine bestimmte Verteilungsform voraussetzt." },
      ],
    },
    seeAlso: ["analysis-workflow", "ttest", "nonparamrm"],
  },
  {
    id: "output-console",
    area: "output",
    title: "Ergebnisse lesen und exportieren",
    summary: "Karten, Gliederung, Kopieren, PNG-Diagramme, HTML-/Word-Berichte und Excel-Arbeitsmappen.",
    tutorial: {
      goal: "Ergebnisse in einem Format entnehmen, das Sie verwenden können.",
      dataset: "score-groups.csv",
      steps: [
        "Führen Sie eine Analyse aus und sehen Sie sich die Karte an: zuerst Tabellen, dann Diagramme, dann den Lesetext.",
        "Öffnen Sie die Gliederung, um zu einer Karte zu springen, oder klappen Sie sie mit dem Pfeil ein.",
        "Drücken Sie Bericht, um eine druckbare HTML-Datei herunterzuladen, oder Word für eine bearbeitbare.",
        "Mit XLSX erhalten Sie Daten und Tabellen in einer Arbeitsmappe; Diagramme lädt die PNG-Dateien herunter.",
      ],
      expected: "Die heruntergeladenen Dateien enthalten dieselben Zahlen wie auf dem Bildschirm, mit einheitlichen Titeln und Kopfzeilen.",
    },
    advanced: {
      whenToUse: [
        "Um ein Ergebnis mit jemandem zu teilen, der das Programm nicht verwendet.",
        "Um eine eingefrorene Version einer Analyse zu archivieren.",
      ],
      reading: [
        "„veraltet“ bedeutet, dass sich die Daten nach dem Lauf geändert haben: Führen Sie vor dem Export erneut aus.",
        "Aus einem Projekt wiederhergestellte Karten sind statisch: Kopieren und Exportieren funktionieren, die Neuberechnung nicht.",
      ],
      pitfalls: [
        "Der Export einer veralteten Karte erzeugt einen formal korrekten, aber überholten Bericht.",
        "Der Zeilenfilter „nur Ansicht“ ändert nicht die von Analysen verwendeten Zahlen.",
      ],
      glossary: [
        { term: "Lesetext", definition: "Der Kommentar in verständlicher Sprache, der jede Analyse abschließt." },
        { term: "Arbeitsmappe", definition: "Die .xlsx-Datei mit mehreren Tabellenblättern, eines pro Tabelle." },
      ],
    },
    seeAlso: ["analysis-workflow", "projects"],
  },
  {
    id: "projects",
    area: "output",
    title: "Ein Projekt speichern und erneut öffnen",
    summary: ".lzs-Dateien, automatisches Speichern und Wiederherstellen einer Sicherung.",
    tutorial: {
      goal: "Daten, Einstellungen und Parameter behalten, um morgen weiterzumachen.",
      dataset: "score-groups.csv",
      steps: [
        "Drücken Sie in DATEN auf Projekt speichern und benennen Sie die .lzs-Datei.",
        "Laden Sie die Seite neu: Das automatische Speichern stellt die Sitzung aus dem Browser wieder her.",
        "Drücken Sie Projekt öffnen und wählen Sie die Datei, um die aktuelle Sitzung zu ersetzen.",
        "In den Einstellungen können Sie eine IndexedDB-Sicherung wiederherstellen, wenn das automatische Speichern fehlgeschlagen ist.",
      ],
      expected: "Nach dem Öffnen finden Sie das Raster, die Stufen, die Parameter und die gespeicherten Ausgabekarten wieder.",
    },
    advanced: {
      whenToUse: [
        "Vor einem Wechsel des Datensatzes oder riskanten Versuchen.",
        "Um einen Fall zusammen mit Daten und Parametern an eine Kollegin oder einen Kollegen weiterzugeben.",
      ],
      reading: [
        "Das Projekt enthält auch Ausgabe-Momentaufnahmen: lesbar, aber nicht neu berechenbar.",
        "In neueren Versionen hinzugefügte Felder sind optional: Alte Dateien öffnen sich mit Standardwerten.",
      ],
      pitfalls: [
        "Das automatische Speichern liegt im Browser: Das Löschen der Websitedaten entfernt es.",
        "Eine .lzs-Datei ist keine Sicherung der Originaldaten: Behalten Sie auch die Quell-CSV.",
      ],
      glossary: [
        { term: ".lzs", definition: "Das Projektformat: JSON mit Daten, Einstellungen und Parametern." },
        { term: "IndexedDB-Sicherung", definition: "Eine lokale Sicherheitskopie, die vom automatischen Speichern verwendet wird." },
      ],
    },
    seeAlso: ["data-import", "output-console"],
  },
];
