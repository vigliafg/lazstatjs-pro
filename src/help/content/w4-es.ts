import type { HelpTopic } from './types';

/** Procedimientos de la oleada 4: modelos log-lineales para tablas de dos vías. */
export const w4Topics: HelpTopic[] = [
  {
    id: 'loglinear',
    area: 'procedures',
    title: 'Modelo log-lineal para tablas de dos vías',
    summary: 'Modelo de Poisson para los recuentos de una tabla de dos vías: independencia o interacción saturada.',
    tutorial: {
      goal: 'Decidir si las categorías de fila y columna de una tabla de dos vías están asociadas y cuantificar la asociación.',
      steps: [
        'Elegir las etiquetas de fila y columna e introducir los recuentos observados celda por celda.',
        'Empezar con el modelo de independencia: estima solo los efectos principales de fila y columna.',
        'Ejecutar y leer G², sus grados de libertad y el valor p.',
        'Si el modelo de independencia no se ajusta, pasar al modelo saturado para ver cuánto se alejan las celdas de la independencia.',
        'Leer los coeficientes en la escala log y exp(β) como factores multiplicativos.',
        'En una tabla 2×2, leer la exponencial de la interacción como odds ratio con su intervalo de confianza.',
      ],
      expected:
        'Una tabla de ajuste con G², df, p, desviación nula y AIC; una tabla de coeficientes con β, SE, z, p, exp(β) y CI; recuentos esperados y residuos estandarizados; un heatmap de los residuos y barras observado/esperado.',
    },
    advanced: {
      assumptions: [
        'Los recuentos son observaciones independientes, una por celda, y cada unidad cae en una sola celda.',
        'El recuento esperado de cada celda es positivo; la varianza de Poisson es igual a la media.',
        'El logaritmo del recuento esperado es una función lineal de los efectos de fila y columna, y de su interacción en el modelo saturado.',
        'Con recuentos esperados pequeños la aproximación χ² de G² es frágil.',
      ],
      whenToUse: [
        'Dos variables categóricas cruzadas, cuando se quiere una prueba de independencia basada en un modelo.',
        'Cuando se necesitan recuentos esperados, residuos y una lectura de la asociación a nivel de coeficientes.',
        'Para comparar el modelo de independencia con el saturado en una tabla 2×2 y obtener el odds ratio.',
      ],
      whenNotToUse: [
        'Tres o más factores categóricos: hacen falta interacciones de orden superior y esta página solo cubre tablas de dos vías.',
        'Tablas muy dispersas con muchas celdas nulas: los métodos exactos o penalizados son más seguros.',
      ],
      reading: [
        'G² es la estadística de razón de verosimilitud: valores grandes respecto a sus grados de libertad indican que los recuentos esperados del modelo están lejos de los observados.',
        'En una tabla de dos vías el modelo de independencia tiene (R−1)(C−1) grados de libertad residuales; el modelo saturado no tiene ninguno y reproduce exactamente los datos.',
        'Los coeficientes están en escala log: exp(β) es el factor por el que cambia el recuento esperado al cambiar la categoría, manteniendo fijo el otro factor.',
        'En una tabla 2×2 el coeficiente de interacción es el log odds ratio; exp(β) = 1 significa independencia.',
      ],
      pitfalls: [
        'Leer el p de un coeficiente como prueba del modelo completo: empezar por G² y los grados de libertad residuales.',
        'Interpretar la asociación como causalidad: el orden fila/columna es arbitrario y el modelo no dice qué variable influye en la otra.',
        'Ignorar los recuentos esperados pequeños: el p de G² puede ser anticonservador.',
        'Usar el modelo saturado como evidencia: siempre se ajusta y no tiene prueba.',
      ],
      charts: [
        'Heatmap de los residuos estandarizados, con las celdas lejos de cero resaltadas.',
        'Barras observado/esperado por celda, para ver dónde falla el modelo.',
      ],
      glossary: [
        { term: 'G²', definition: 'Estadística de razón de verosimilitud que compara los recuentos observados con los esperados del modelo.' },
        { term: 'Modelo saturado', definition: 'Modelo con un parámetro por celda; reproduce los datos y tiene cero grados de libertad residuales.' },
        { term: 'Odds ratio', definition: 'Cociente entre los odds de un grupo y los del otro; exp(interacción) en un modelo log-lineal 2×2.' },
      ],
    },
    seeAlso: ['contingency', 'chisquare'],
  },
];
