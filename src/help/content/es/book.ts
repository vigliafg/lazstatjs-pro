import type { HelpBook, HelpChapter } from '../types';
import { orderTopics } from '../order';
import { areaTopics } from './areas';
import { coreTopics } from './procedures-core';
import { moreTopics } from './procedures-more';

const chapters: HelpChapter[] = [
  { id: 'start', title: 'Primeros pasos', blurb: 'Todo el ciclo en tres pasos, de la cuadrícula al informe.' },
  { id: 'data', title: 'Los datos', blurb: 'Importar, editar, limpiar y dar nombres legibles a los grupos.' },
  { id: 'analysis', title: 'Los análisis', blurb: 'Elegir el procedimiento, configurarlo, volver a ejecutarlo.' },
  { id: 'procedures', title: 'Los procedimientos, uno por uno', blurb: 'Un tutorial con ejemplo y una lectura avanzada en palabras sencillas.' },
  { id: 'output', title: 'Resultados y proyecto', blurb: 'Leer la salida, exportarla, guardar y reabrir el trabajo.' },
];

export const esBook: HelpBook = {
  locale: 'es',
  title: 'Manual de LazStats',
  subtitle: 'Estadística aplicada con el programa, en dos niveles',
  preface:
    'Cada página tiene dos niveles. El nivel A es un tutorial con un ejemplo que se ejecuta paso a paso; el nivel B explica los supuestos, cuándo usar el procedimiento, cómo leer su salida y qué errores evitar, con palabras sencillas incluso para los procedimientos avanzados. Las páginas pueden leerse en secuencia o imprimirse como un libro.',
  ui: {
    contents: 'Índice',
    tutorial: 'Tutorial',
    advanced: 'Avanzado',
    tutorialHint: 'Paso a paso con un ejemplo',
    advancedHint: 'Supuestos, lectura y trampas, en palabras sencillas',
    search: 'Buscar en el manual',
    searchEmpty: 'Ninguna página coincide con la búsqueda.',
    next: 'Siguiente',
    previous: 'Anterior',
    back: 'Volver al índice',
    print: 'Imprimir el libro',
    openApp: 'Abrir el programa',
    exampleData: 'Datos de ejemplo',
    expected: 'Lo que deberías ver',
    assumptions: 'Supuestos',
    whenToUse: 'Cuándo usarlo',
    whenNotToUse: 'Cuándo evitarlo',
    reading: 'Cómo leer la salida',
    pitfalls: 'Errores que evitar',
    glossary: 'Palabras clave',
    seeAlso: 'Ver también',
    updated: 'Manual alineado con las funciones actuales del programa',
  },
  chapters,
  topics: orderTopics([...areaTopics, ...coreTopics, ...moreTopics]),
};
