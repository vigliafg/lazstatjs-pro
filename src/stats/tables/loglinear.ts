import { copy } from '../reportCopy';
import type { LoglinearModel, LoglinearStats } from '../loglinear/types';
import type { TableSpec } from '../types';

const modelName = (model: LoglinearModel): string =>
  model === 'saturated'
    ? copy('Saturato (con interazione)')
    : copy('Indipendenza (effetti principali)');

export const loglinearTables = (stats: LoglinearStats, level: number): TableSpec[] => {
  const tables: TableSpec[] = [];

  tables.push({
    id: 'loglinear-parameters',
    title: copy('Parametri del modello'),
    subtitle: copy('{s1} · {s2} celle, {s3} parametri', {
      s1: modelName(stats.model),
      s2: stats.cells,
      s3: stats.coefficients.length,
    }),
    columns: [
      { key: 'term', label: copy('Termine'), format: 'text' },
      { key: 'beta', label: copy('β'), format: 'dec4' },
      { key: 'se', label: copy('SE'), format: 'dec4' },
      { key: 'z', label: copy('z'), format: 'dec3' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'expBeta', label: copy('exp(β)'), format: 'dec3' },
      { key: 'expLo', label: copy('CI exp(β) basso'), format: 'dec3' },
      { key: 'expHi', label: copy('CI exp(β) alto'), format: 'dec3' },
    ],
    rows: stats.coefficients.map(coefficient => ({
      term: coefficient.term,
      beta: coefficient.beta,
      se: coefficient.se,
      z: coefficient.z,
      p: coefficient.p,
      expBeta: coefficient.expBeta,
      expLo: coefficient.expLo,
      expHi: coefficient.expHi,
    })),
    notes: [
      copy('β è l’effetto additivo sul logaritmo del conteggio atteso; exp(β) è il fattore moltiplicativo sul conteggio.'),
      copy('Il primo livello di riga e di colonna è la categoria di riferimento: i suoi coefficienti (dummy) valgono zero e non compaiono.'),
      copy('I CI sono al {s1}% e sono calcolati sulla scala log, poi riportati su quella moltiplicativa.', { s1: level }),
    ],
  });

  tables.push({
    id: 'loglinear-fit',
    title: copy('Bontà di adattamento'),
    subtitle: copy('G² = 2 Σ O · log(O/E) · df = (R−1)(C−1) per l’indipendenza'),
    columns: [
      { key: 'model', label: copy('Modello'), format: 'text' },
      { key: 'g2', label: copy('G²'), format: 'dec4' },
      { key: 'df', label: copy('df'), format: 'int' },
      { key: 'p', label: copy('p'), format: 'p' },
      { key: 'nullDeviance', label: copy('Devianza nulla'), format: 'dec4' },
      { key: 'dfNull', label: copy('df nulla'), format: 'int' },
      { key: 'logLik', label: copy('Log-verosimiglianza'), format: 'dec3' },
      { key: 'aic', label: copy('AIC'), format: 'dec3' },
      { key: 'n', label: copy('N'), format: 'int' },
    ],
    rows: [
      {
        model: modelName(stats.model),
        g2: stats.deviance,
        df: stats.dfResidual,
        p: stats.p,
        nullDeviance: stats.nullDeviance,
        dfNull: stats.dfNull,
        logLik: stats.logLik,
        aic: stats.aic,
        n: stats.n,
      },
    ],
    notes: [
      stats.model === 'saturated'
        ? copy('Il modello saturo usa un parametro per cella: riproduce esattamente i dati, quindi G² = 0 e df = 0. Non è un test di adattamento.')
        : copy('G² confronta il modello di indipendenza con il modello saturo. Più è grande rispetto ai gradi di libertà, più l’ipotesi di indipendenza è lontana dai dati.'),
      copy('La devianza nulla è quella del modello con la sola intercetta, in cui tutte le celle hanno lo stesso conteggio atteso.'),
      copy('G² e χ² di Pearson sono statistiche diverse ma asintoticamente equivalenti: con le stesse ipotesi e gli stessi df portano alle stesse conclusioni.'),
      stats.model === 'independence'
        ? copy('df = (R − 1)(C − 1) = {s1} per una tabella {s2} × {s3}.', {
            s1: stats.dfResidual,
            s2: stats.rows,
            s3: stats.cols,
          })
        : copy('Nel modello saturo i parametri sono R · C = {s1} e i gradi di libertà residui sono zero.', {
            s1: stats.cells,
          }),
    ],
  });

  tables.push({
    id: 'loglinear-expected',
    title: copy('Frequenze attese dal modello'),
    subtitle: copy('Conteggi attesi sotto {s1}', { s1: modelName(stats.model) }),
    columns: [
      { key: 'label', label: copy('Riga'), format: 'text' },
      ...stats.expected[0].map((_, column) => {
        const label = stats.cellsTable[column]?.col ?? copy('Col {s1}', { s1: column + 1 });
        return { key: copy('c{s1}', { s1: column }), label, format: 'dec2' as const };
      }),
    ],
    rows: stats.expected.map((row, index) => {
      const entry: Record<string, number | string> = {
        label: stats.cellsTable[index * stats.cols]?.row ?? copy('Riga {s1}', { s1: index + 1 }),
      };
      row.forEach((value, column) => {
        entry[copy('c{s1}', { s1: column })] = value;
      });
      return entry;
    }),
    notes: [
      stats.model === 'independence'
        ? copy('Le attese di indipendenza si ottengono come (totale di riga × totale di colonna) / N.')
        : copy('Il modello saturo riproduce i conteggi osservati: le attese coincidono con le celle della tabella.'),
      copy('Celle con attesa piccola rendono fragile l’approssimazione χ² di G²: controlla quante attese sono sotto 5.'),
    ],
  });

  tables.push({
    id: 'loglinear-residuals',
    title: copy('Residui delle celle'),
    subtitle: copy('Residuo standardizzato = (O − E) / √E'),
    columns: [
      { key: 'cell', label: copy('Cella'), format: 'text' },
      { key: 'observed', label: copy('O'), format: 'int' },
      { key: 'expected', label: copy('E'), format: 'dec2' },
      { key: 'residual', label: copy('Residuo std.'), format: 'dec2' },
      { key: 'contribution', label: copy('Contributo G²'), format: 'dec3' },
    ],
    rows: stats.cellsTable.map(cell => ({
      cell: `${cell.row} · ${cell.col}`,
      observed: cell.observed,
      expected: cell.expected,
      residual: cell.residual,
      contribution: cell.contribution,
    })),
    notes: [
      copy('Un residuo oltre ±2 segnala una cella che il modello sottostima o sovrastima più di quanto il caso spieghi.'),
      copy('Il contributo è la parte di G² dovuta a quella cella: le prime posizioni spiegano la mancanza di adattamento.'),
      stats.model === 'saturated'
        ? copy('Con il modello saturo i residui sono tutti nulli per costruzione.')
        : copy('Residui grandi in celle con attesa piccola vanno letti con cautela.'),
    ],
  });

  return tables;
};
