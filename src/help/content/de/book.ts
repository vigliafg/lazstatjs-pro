import type { HelpBook, HelpChapter } from "../types";
import { orderTopics } from "../order";
import { areaTopics } from "./areas";
import { coreTopics } from "./procedures-core";
import { moreTopics } from "./procedures-more";
import { l4Topics } from '../l4-de';
import { w2Topics } from '../w2-de';
import { w3Topics } from '../w3-de';
import { w4Topics } from '../w4-de';
import { w5Topics } from '../w5-de';
import { w6Topics } from '../w6-de';
import { w7Topics } from '../w7-de';
import { w9Topics } from '../w9-de';

import { chartGuides } from './charts';

const chapters: HelpChapter[] = [
  {
    id: "start",
    title: "Erste Schritte",
    blurb: "Der ganze Ablauf in drei Schritten, vom Raster bis zum Bericht.",
  },
  {
    id: "data",
    title: "Die Daten",
    blurb:
      "Importieren, bearbeiten, bereinigen und den Gruppen lesbare Namen geben.",
  },
  {
    id: "analysis",
    title: "Analysen",
    blurb: "Das Verfahren wählen, einrichten, erneut ausführen.",
  },
  {
    id: "procedures",
    title: "Verfahren, eines nach dem anderen",
    blurb:
      "Ein Tutorial mit einem Beispiel und eine fortgeschrittene Lektüre in verständlichen Worten.",
  },
  {
    id: "output",
    title: "Ergebnisse und Projekt",
    blurb:
      "Die Ausgabe lesen, exportieren, die Arbeit speichern und erneut öffnen sowie das Erscheinungsbild anpassen.",
  },
];

export const deBook: HelpBook = {
  locale: "de",
  title: "LazStats Handbuch",
  subtitle: "Angewandte Statistik mit dem Programm, auf zwei Ebenen",
  preface:
    "Jede Seite hat zwei Ebenen. Ebene A ist ein Tutorial mit einem durchgearbeiteten Beispiel; Ebene B erklärt Annahmen, wann das Verfahren einzusetzen ist, wie seine Ausgabe zu lesen ist und welche Fehler zu vermeiden sind — in verständlicher Sprache, auch bei fortgeschrittenen Verfahren. Die Seiten können der Reihe nach gelesen oder als Buch gedruckt werden.",
  ui: {
    contents: "Inhalt",
    tutorial: "Tutorial",
    advanced: "Erweitert",
    tutorialHint: "Schritt für Schritt mit einem durchgearbeiteten Beispiel",
    advancedHint: "Annahmen, Lesart und Fallstricke, in verständlichen Worten",
    search: "Das Handbuch durchsuchen",
    searchEmpty: "Keine Seite entspricht dieser Suche.",
    next: "Weiter",
    previous: "Zurück",
    back: "Zurück zum Inhalt",
    print: "Buch drucken",
    openApp: "Das Programm öffnen",
    exampleData: "Beispieldaten",
    expected: "Was Sie sehen sollten",
    assumptions: "Annahmen",
    whenToUse: "Wann Sie es verwenden",
    whenNotToUse: "Wann Sie es vermeiden",
    reading: "Wie Sie die Ausgabe lesen",
    pitfalls: "Fehler, die Sie vermeiden sollten",
    glossary: "Wichtige Begriffe",

    charts: "Diagramme",
    seeAlso: "Siehe auch",
    updated: "Handbuch abgestimmt auf die aktuellen Funktionen des Programms",
  },
  chapters,
  topics: orderTopics([...areaTopics, ...coreTopics, ...moreTopics, ...l4Topics, ...w2Topics, ...w3Topics, ...w4Topics, ...w5Topics, ...w6Topics, ...w7Topics, ...w9Topics]).map(topic => ({
    ...topic,
    advanced: {
      ...topic.advanced,
      ...(chartGuides[topic.id] ? { charts: chartGuides[topic.id] } : {}),
    },
  })),
};
