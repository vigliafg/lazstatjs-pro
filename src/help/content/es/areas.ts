import type { HelpTopic } from '../types';

/** Chapters that explain the application itself, before the procedures. */
export const areaTopics: HelpTopic[] = [
  {
    id: 'start-tour',
    area: 'start',
    title: 'Primeros pasos: datos, análisis y resultados',
    summary: 'Todo el ciclo en tres pasos, para que sepas dónde está cada cosa.',
    tutorial: {
      goal: 'Ejecutar un primer análisis de principio a fin sin saber nada del programa.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre DATOS: es una hoja de cálculo con una fila de cabecera y una columna por variable.',
        'Pulsa Importar y elige score-groups.csv: el delimitador y los decimales se detectan automáticamente.',
        'Comprueba el tipo bajo cada cabecera: num para números y cat para grupos.',
        'Cambia a ANÁLISIS, busca «Prueba t», rellena el panel de configuración y pulsa Ejecutar análisis.',
        'Lee el informe de lectura que cierra cada ejecución y descarga el informe HTML desde la barra de salida.',
      ],
      expected: 'En la salida aparecen las tablas, los gráficos y un comentario en lenguaje llano; volver a ejecutar nunca sobrescribe la tarjeta anterior.',
    },
    advanced: {
      whenToUse: [
        'Cuando quieras un único flujo para datos, cálculo e informes sin mover archivos entre programas.',
        'Cuando necesites un resultado reproducible: los datos y los parámetros se quedan dentro del proyecto .lzs.',
      ],
      reading: [
        'Las tarjetas de salida son instantáneas: se quedan como se generaron aunque los datos cambien después.',
        'La etiqueta «obsoleto» significa que la cuadrícula cambió después de generar ese resultado.',
      ],
      pitfalls: [
        'No edites nunca los números del informe: corrige los datos y vuelve a ejecutar.',
        'Guarda el proyecto antes de experimentos largos: el guardado automático vive en el navegador.',
      ],
      glossary: [
        { term: 'Procedimiento', definition: 'Un único análisis estadístico, por ejemplo la prueba t.' },
        { term: 'Tarjeta de resultado', definition: 'El bloque que contiene las tablas, los gráficos y el informe de una ejecución.' },
      ],
    },
    seeAlso: ['data-import', 'analysis-workflow', 'output-console'],
  },
  {
    id: 'data-import',
    area: 'data',
    title: 'Importar archivos CSV, TSV, Excel, SPSS y Stata',
    summary: 'Traer los datos sin romper números y categorías.',
    tutorial: {
      goal: 'Importar un archivo con decimales con coma y grupos escritos con letras.',
      dataset: 'score-groups.csv',
      steps: [
        'Desde DATOS pulsa Importar y elige el archivo: CSV, TSV, TXT, JSON, Excel (.xlsx) y SPSS/Stata (.sav/.dta); la vista previa muestra las primeras filas.',
        'Comprueba el delimitador detectado (coma, punto y coma, tabulador) y el separador decimal.',
        'Indica si la primera fila es la cabecera y elige Aplicar como = Sustituir la cuadrícula.',
        'Pulsa Importar y lee cuántas filas y columnas han entrado.',
      ],
      expected: 'La cuadrícula muestra una columna por variable y una fila por observación, con tipos de columna adecuados.',
    },
    advanced: {
      assumptions: [
        'Cada fila es una observación completa; las variables son columnas.',
        'Los códigos de ausencia deben declararse después de importar (p. ej. -9, NA).',
      ],
      whenToUse: [
        'Archivos exportados desde Excel, R, SPSS o una encuesta en línea.',
        'Varios archivos con las mismas columnas para apilarlos en vertical (Añadir filas).',
      ],
      whenNotToUse: ['Datos no organizados como una fila por caso: reestructúralos primero.'],
      reading: [
        '«filas y columnas importadas» confirma el tamaño; «cabeceras duplicadas renombradas» señala nombres repetidos.',
        '«BOM eliminado» es normal en los archivos guardados por Excel.',
      ],
      pitfalls: [
        'Un separador decimal equivocado convierte los números en texto: comprueba el tipo después de importar.',
        'Las celdas vacías siempre están ausentes; no hace falta ningún código especial.',
      ],
      glossary: [
        { term: 'Delimitador', definition: 'El carácter que separa las columnas en un archivo de texto.' },
        { term: 'Código de ausencia', definition: 'Un valor convencional como -9 que debe leerse como ausente.' },
      ],
    },
    seeAlso: ['data-editor', 'data-clean', 'projects'],
  },
  {
    id: 'data-editor',
    area: 'data',
    title: 'Editar datos en la cuadrícula',
    summary: 'Tipos de columna, validación, deshacer y relleno rápido.',
    tutorial: {
      goal: 'Corregir un valor y convertir una columna de texto en números.',
      dataset: 'score-groups.csv',
      steps: [
        'Haz doble clic en una celda y escribe el nuevo valor; Intro confirma y baja.',
        'Cambia el tipo en el desplegable bajo la cabecera (num, int, cat, str).',
        'Pulsa Validar para listar las celdas no válidas; Corrección automática intenta la conversión.',
        'Usa Ctrl+Z para deshacer y Ctrl+Y para rehacer; selecciona un rango y pulsa Ctrl+D para rellenar hacia abajo.',
      ],
      expected: 'La celda muestra el nuevo valor, la barra de estado actualiza el recuento de no válidas y deshacer restaura el estado anterior.',
    },
    advanced: {
      whenToUse: [
        'Correcciones pequeñas o sistemáticas antes de un análisis.',
        'Añadir columnas calculadas con una fórmula (p. ej. Score_Post - Score_Pre).',
      ],
      reading: [
        'El tipo de columna guía la validación, la Corrección automática y la exportación a Excel; los análisis siguen deduciendo los números de los valores.',
        'El inspector de variables muestra valores ausentes, valores distintos y roles.',
      ],
      pitfalls: [
        'Renombrar una columna actualiza las fórmulas, pero los parámetros de análisis que la usan deben volver a seleccionarse.',
        'Ordenar la cuadrícula cambia el orden de las filas: los análisis emparejados dependen de ese orden.',
      ],
      glossary: [
        { term: 'Validación', definition: 'Comprobar que cada celda es compatible con el tipo declarado.' },
        { term: 'Columna calculada', definition: 'Una columna cuyo valor es una fórmula, recalculada en cada edición.' },
      ],
    },
    seeAlso: ['data-import', 'data-clean', 'levels'],
  },
  {
    id: 'data-clean',
    area: 'data',
    title: 'Limpiar y transformar datos',
    summary: 'Buscar y reemplazar, valores ausentes, filas vacías y duplicados.',
    tutorial: {
      goal: 'Unificar una etiqueta escrita de varias formas y rellenar las celdas vacías con la media.',
      dataset: 'score-groups.csv',
      steps: [
        'Pulsa Limpiar y abre Buscar / Reemplazar; elige una columna o Todas las columnas.',
        'Escribe el texto que hay que buscar y el reemplazo, y pulsa Aplicar.',
        'En la sección de ausentes elige Media y pulsa Rellenar para la columna numérica.',
        'En la sección de orden elimina filas vacías y duplicados de uno en uno, leyendo el mensaje de resultado.',
      ],
      expected: 'Un mensaje indica cuántas sustituciones o celdas han cambiado; toda operación se puede deshacer con Ctrl+Z.',
    },
    advanced: {
      whenToUse: [
        'Antes de cualquier análisis, para evitar categorías duplicadas (Sí/sí, SI/si).',
        'Para quitar filas que son copias exactas e inflan los recuentos.',
      ],
      whenNotToUse: ['No imputes la media cuando faltan muchos valores o no faltan al azar: plantéate la imputación múltiple.'],
      reading: [
        '«No se encontraron coincidencias» significa que el texto no existe, no que la operación haya fallado.',
        '«celdas rellenadas con» indica el valor usado para la imputación.',
      ],
      pitfalls: [
        'La sustitución con expresiones regulares es potente: pruébala primero en una columna.',
        'La imputación de la media reduce la variabilidad y subestima los errores estándar.',
      ],
      glossary: [
        { term: 'Imputación simple', definition: 'Sustituir un valor ausente por la media, la mediana, la moda o una constante.' },
        { term: 'Duplicado', definition: 'Una fila idéntica a otra en todas las columnas.' },
      ],
    },
    seeAlso: ['data-editor', 'levels', 'mi'],
  },
  {
    id: 'levels',
    area: 'data',
    title: 'Niveles y etiquetas de los grupos',
    summary: 'Da nombres legibles a los códigos, elige el orden y el nivel de referencia.',
    tutorial: {
      goal: 'Mostrar «Tratamiento» y «Control» en lugar de 1 y 0 en las tablas.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre el menú de la columna de grupo y elige Editar niveles.',
        'Escribe una etiqueta junto a cada código y ordénalos con las flechas.',
        'Marca el grupo que quieras como referencia del modelo.',
        'Pulsa Aplicar niveles y vuelve a ejecutar el análisis.',
      ],
      expected: 'Las tablas, los gráficos y los informes usan las etiquetas; los análisis basados en modelos comparan con la referencia.',
    },
    advanced: {
      whenToUse: [
        'Siempre que un grupo tenga códigos numéricos poco claros.',
        'En modelos con intercepto: la referencia decide cómo se leen los coeficientes.',
      ],
      reading: [
        'El código se queda en las celdas; la etiqueta es solo presentación.',
        'Las celdas con valores fuera de la lista aparecen como «no en la lista» y se quedan en los datos.',
      ],
      pitfalls: [
        'Quitar un nivel nunca borra observaciones: solo cambia cómo se muestran.',
        'Cambiar la referencia cambia los coeficientes, no la calidad del modelo.',
      ],
      glossary: [
        { term: 'Nivel de referencia', definition: 'La categoría con la que se comparan los demás grupos en el modelo.' },
        { term: 'Codificación de tratamiento', definition: 'Un esquema en el que cada grupo se compara con la referencia.' },
      ],
    },
    seeAlso: ['data-editor', 'anova', 'regression'],
  },
  {
    id: 'analysis-workflow',
    area: 'analysis',
    title: 'Elegir y ejecutar un análisis',
    summary: 'Biblioteca, búsqueda, panel de configuración, nivel de confianza y nuevas ejecuciones.',
    tutorial: {
      goal: 'Encontrar el procedimiento adecuado y obtener un resultado completo.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre ANÁLISIS: la biblioteca lista los procedimientos por familia.',
        'Escribe el nombre de la prueba o el problema en el cuadro de búsqueda (p. ej. «comparar dos grupos»).',
        'Selecciona el procedimiento: el panel de configuración muestra solo los parámetros necesarios.',
        'Elige las variables, fija el nivel de confianza y pulsa Ejecutar análisis (Ctrl/⌘+Enter).',
        'Usa En vivo para volver a ejecutar automáticamente cuando cambien los datos o los parámetros.',
      ],
      expected: 'Se añade una nueva tarjeta a la salida; la anterior se queda para comparar.',
    },
    advanced: {
      whenToUse: [
        'Siempre: es el único camino a las tablas, los gráficos y el informe escrito.',
        'En vivo es cómodo mientras exploras, pero debería estar desactivado en procedimientos pesados.',
      ],
      reading: [
        'La insignia «pesado» marca los procedimientos que conviene ejecutar de forma explícita.',
        'Si una columna ha cambiado, el procedimiento te pide volver a seleccionar las variables afectadas.',
      ],
      pitfalls: [
        'Cambiar el nivel de confianza no cambia los datos, pero cambia todas las estimaciones.',
        'Volver a ejecutar sin cambios crea tarjetas duplicadas: usa Aplicar para reutilizar los parámetros.',
      ],
      glossary: [
        { term: 'Nivel de confianza', definition: 'La cobertura de los intervalos: el 95 % es la elección habitual.' },
        { term: 'Instantánea', definition: 'Una copia estática de un resultado, independiente de los datos posteriores.' },
      ],
    },
    seeAlso: ['choosing-test', 'output-console', 'start-tour'],
  },
  {
    id: 'choosing-test',
    area: 'analysis',
    title: '¿Qué prueba debo usar?',
    summary: 'Un mapa rápido de la pregunta al procedimiento, más el asistente guiado.',
    tutorial: {
      goal: 'Elegir un procedimiento a partir del tipo de pregunta y de datos.',
      dataset: 'score-groups.csv',
      steps: [
        'Abre el procedimiento guiado (familia Guiado).',
        'Elige la pregunta: describir, comparar grupos o predecir un resultado.',
        'Define el resultado, los grupos y si las medidas son independientes o emparejadas.',
        'Lee la recomendación y pulsa Abrir para cargar el procedimiento con los parámetros preparados.',
      ],
      expected: 'El procedimiento sugerido se abre en el panel con las variables ya seleccionadas; solo tienes que ejecutarlo.',
    },
    advanced: {
      whenToUse: ['Al principio, cuando no quieras elegir la familia equivocada.'],
      reading: [
        'Resultado numérico + 2 grupos independientes → prueba t o Mann-Whitney; más grupos → ANOVA o Kruskal-Wallis.',
        'Resultado numérico + medidas emparejadas → prueba t emparejada o Wilcoxon.',
        'Resultado binario → logística o chi-cuadrado; tiempo hasta un evento → supervivencia.',
      ],
      pitfalls: [
        'La recomendación nunca comprueba los supuestos: verifica la normalidad, la independencia y el tamaño de la muestra.',
        'Con pocos casos, las pruebas no paramétricas suelen encajar mejor.',
      ],
      glossary: [
        { term: 'Emparejado', definition: 'Medidas repetidas en la misma unidad (antes/después).' },
        { term: 'No paramétrico', definition: 'Una prueba que no supone una forma de distribución concreta.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'ttest', 'nonparamrm'],
  },
  {
    id: 'output-console',
    area: 'output',
    title: 'Leer y exportar resultados',
    summary: 'Tarjetas, esquema, copia, gráficos PNG, informes HTML/Word y libros de Excel.',
    tutorial: {
      goal: 'Sacar los resultados en un formato que puedas usar.',
      dataset: 'score-groups.csv',
      steps: [
        'Ejecuta un análisis y mira la tarjeta: primero las tablas, luego los gráficos y después el informe de lectura.',
        'Abre el Esquema para saltar a una tarjeta o contráela con la flecha.',
        'Pulsa Informe para descargar un archivo HTML imprimible, o Word para uno editable.',
        'Usa XLSX para obtener datos y tablas en un libro; Gráficos descarga los archivos PNG.',
      ],
      expected: 'Los archivos descargados contienen los mismos números que se ven en pantalla, con títulos y cabeceras coherentes.',
    },
    advanced: {
      whenToUse: [
        'Para compartir un resultado con alguien que no usa el programa.',
        'Para archivar una versión congelada de un análisis.',
      ],
      reading: [
        '«obsoleto» significa que los datos cambiaron después de la ejecución: vuelve a ejecutar antes de exportar.',
        'Las tarjetas restauradas de un proyecto son estáticas: copiar y exportar funcionan, recalcular no.',
      ],
      pitfalls: [
        'Exportar una tarjeta obsoleta produce un informe formalmente correcto pero desactualizado.',
        'El filtro de filas «solo vista» no cambia los números que usan los análisis.',
      ],
      glossary: [
        { term: 'Informe de lectura', definition: 'El comentario en lenguaje llano que cierra cada análisis.' },
        { term: 'Libro', definition: 'El archivo .xlsx con varias hojas, una por tabla.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'projects'],
  },
  {
    id: 'projects',
    area: 'output',
    title: 'Guardar y reabrir un proyecto',
    summary: 'Archivos .lzs, guardado automático y cómo restaurar una copia de seguridad.',
    tutorial: {
      goal: 'Conservar datos, configuración y parámetros para continuar mañana.',
      dataset: 'score-groups.csv',
      steps: [
        'Desde DATOS pulsa Guardar proyecto y pon nombre al archivo .lzs.',
        'Recarga la página: el guardado automático restaura la sesión desde el navegador.',
        'Pulsa Abrir proyecto y elige el archivo para sustituir la sesión actual.',
        'Desde Ajustes puedes restaurar una copia de seguridad de IndexedDB si el guardado automático ha fallado.',
      ],
      expected: 'Al abrir vuelves a encontrar la cuadrícula, los niveles, los parámetros y las tarjetas de salida guardadas.',
    },
    advanced: {
      whenToUse: [
        'Antes de cambiar de conjunto de datos o probar experimentos arriesgados.',
        'Para compartir un caso con un colega, junto con los datos y los parámetros.',
      ],
      reading: [
        'El proyecto también guarda instantáneas de la salida: legibles pero no recalculables.',
        'Los campos añadidos en versiones más recientes son opcionales: los archivos antiguos se abren con valores predeterminados.',
      ],
      pitfalls: [
        'El guardado automático vive en el navegador: borrar los datos del sitio lo elimina.',
        'Un archivo .lzs no es una copia de seguridad de los datos originales: conserva también el CSV de origen.',
      ],
      glossary: [
        { term: '.lzs', definition: 'El formato del proyecto: JSON con datos, configuración y parámetros.' },
        { term: 'Copia de seguridad de IndexedDB', definition: 'Una copia local de seguridad que usa el guardado automático.' },
      ],
    },
    seeAlso: ['data-import', 'output-console'],
  },
];
