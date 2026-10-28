/** Regole di dipendenza tra le cartelle di `src/`. */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Un ciclo rende impossibile ragionare sui confini.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'stats-non-dipende-dalla-ui',
      severity: 'error',
      comment: 'stats/ è il motore: non conosce React, schermate, hook o I/O.',
      from: { path: '^src/stats/' },
      to: { path: '^src/(ui|analyses|hooks|io|components)/' },
    },
    {
      name: 'grid-non-dipende-dalla-ui',
      severity: 'error',
      comment: 'grid/ è il modello dati: non conosce schermate, analisi o I/O.',
      from: { path: '^src/grid/' },
      to: { path: '^src/(ui|analyses|hooks|io)/' },
    },
    {
      name: 'components-non-dipendono-dalla-ui',
      severity: 'error',
      comment: 'components/ è riusabile: non conosce schermate, analisi o hook.',
      from: { path: '^src/components/' },
      to: { path: '^src/(ui|analyses|hooks)/' },
    },
    {
      name: 'io-non-dipende-dalla-ui',
      severity: 'error',
      comment: 'io/ legge e scrive file: non conosce schermate, analisi o hook.',
      from: { path: '^src/io/' },
      to: { path: '^src/(ui|analyses|hooks)/' },
    },
    {
      name: 'analyses-non-dipendono-dalla-ui',
      severity: 'error',
      comment: 'analysis/ descrive form e calcolo: la UI li compone, non viceversa.',
      from: { path: '^src/analyses/' },
      to: { path: '^src/ui/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.test\\.tsx?$' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    reporterOptions: {
      dot: { collapsePattern: 'node_modules/[^/]+' },
      archi: { collapsePattern: '^(src/[^/]+)/' },
    },
  },
};
