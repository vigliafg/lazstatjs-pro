import { fmtEst, fmtP } from '../format';
import { describeP, isDecided, show, showInt, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

const associationWord = (value: number): string => {
  if (!Number.isFinite(value)) return 'non calcolabile';
  if (value < 0.1) return 'trascurabile';
  if (value < 0.3) return 'debole';
  if (value < 0.5) return 'moderata';
  return 'forte';
};

/** Plain-language reading of a contingency table. */
export const contingencyReport = (tables: TableSpec[], level: number): ReportSpec => {
  const tests = tableById(tables, 'cont-tests')?.rows ?? [];
  const pearson = tests[0];
  const association = tableById(tables, 'cont-association')?.rows ?? [];
  const residuals = tableById(tables, 'cont-residuals')?.rows ?? [];
  const observed = tableById(tables, 'cont-observed');
  const n = Number(observed?.subtitle?.match(/N = (\d+)/)?.[1] ?? NaN);

  const chi2 = Number(pearson?.statistic ?? NaN);
  const df = Number(pearson?.df ?? NaN);
  const p = Number(pearson?.p ?? NaN);
  const significant = isDecided(p, level);
  const cramers = Number(association.find(row => String(row.measure).includes('Cramér'))?.value ?? NaN);
  const strength = associationWord(cramers);
  const lowCells = Number(
    tableById(tables, 'cont-expected')?.notes?.find(note => note.includes('attesa < 5'))?.match(/^(\d+)/)?.[1] ?? NaN
  );
  const exactRow = tests.find(row => String(row.test).includes('Fisher'));
  const monteCarloRow = tests.find(row => String(row.test).includes('Monte Carlo'));

  const drivers = residuals
    .filter(row => Number.isFinite(Number(row.adjusted)) && Math.abs(Number(row.adjusted)) >= 2)
    .sort((a, b) => Math.abs(Number(b.adjusted)) - Math.abs(Number(a.adjusted)))
    .slice(0, 4)
    .map(row => {
      const direction = Number(row.adjusted) > 0 ? 'più osservazioni' : 'meno osservazioni';
      return `${String(row.cell)}: ${direction} del previsto (residuo aggiustato ${fmtEst(Number(row.adjusted), 2)})`;
    });

  const headline = !Number.isFinite(p)
    ? 'Tabelle troppo piccole o con celle vuote: il test non è calcolabile.'
    : significant
      ? `Le due variabili non sono indipendenti (χ² = ${fmtEst(chi2, 3)}, df = ${df}, p = ${fmtP(p)}).`
      : `Nessuna evidenza di associazione (χ² = ${fmtEst(chi2, 3)}, df = ${df}, p = ${fmtP(p)}).`;

  return {
    id: 'contingency',
    title: 'Report di lettura',
    headline,
    badge: significant ? 'Associazione significativa' : 'Nessuna associazione rilevata',
    tone: significant ? 'positive' : 'neutral',
    intro: [
      'Il test del χ² confronta le frequenze che osservi con quelle che ti aspetteresti se le due variabili categoriche fossero completamente indipendenti.',
      'L’ipotesi nulla è “indipendenza”: nessuna relazione tra riga e colonna. Un p piccolo significa che le differenze tra osservato e atteso sono troppo grandi per essere solo rumore campionario.',
    ],
    sections: [
      {
        heading: 'La lettura dei risultati',
        body: [
          `La tabella ha N = ${showInt(n)} osservazioni e ${df} gradi di libertà. Il χ² di Pearson vale ${show(chi2, 3)}: ${describeP(p)}${Number.isFinite(p) ? significant ? `, sotto la soglia α = ${(1 - level / 100).toFixed(2)}: l’ipotesi di indipendenza viene rifiutata.` : `, sopra la soglia α = ${(1 - level / 100).toFixed(2)}: l’ipotesi di indipendenza non viene rifiutata.` : '.'}`,
          Number.isFinite(Number(exactRow?.p))
            ? `Con celle piccole il test esatto di Fisher dà p = ${fmtP(Number(exactRow?.p))}: è il valore da preferire in una tabella 2×2 con attese basse.`
            : '',
          Number.isFinite(Number(monteCarloRow?.p))
            ? `Poiché ${Number.isFinite(lowCells) ? lowCells : 'alcune'} celle hanno attesa sotto 5, ho aggiunto un p Monte Carlo con margini fissi (${fmtP(Number(monteCarloRow?.p))}): non dipende dall’approssimazione asintotica.`
            : '',
        ].filter(Boolean),
      },
      {
        heading: 'Dove sta l’associazione',
        body: [
          'Il χ² dice che qualcosa c’è, non dove. I residui aggiustati rispondono a questa domanda: valori oltre ±2 indicano le celle che si discostano dall’indipendenza più di quanto il caso spieghi.',
        ],
        bullets: drivers.length > 0 ? drivers : ['Nessuna cella supera la soglia di ±2: l’associazione è diffusa, non concentrata in una combinazione specifica.'],
      },
      {
        heading: 'Quanto è forte',
        body: [
          Number.isFinite(cramers)
            ? `Cramér’s V = ${show(cramers, 3)}: un’associazione ${strength} (0 = indipendenza, 1 = legame deterministico). Il p-value può essere piccolissimo anche per associazioni debolissime se N è grande: la forza va letta qui, non nel p.`
            : 'La misura di associazione non è calcolabile con questi dati.',
        ],
      },
      {
        heading: 'Assunzioni da controllare',
        bullets: [
          'Osservazioni indipendenti: ogni riga del dataset deve essere una unità diversa, non una misura ripetuta.',
          'Categorie esaustive e mutuamente esclusive: ogni osservazione cade in una sola cella.',
          'Regola di Cochran: nessuna attesa < 1 e non più del 20% delle celle con attesa < 5; se cade, usa Fisher (2×2) o il p Monte Carlo.',
          'Il test non dice nulla sulla direzione causale: associazione non è causa.',
        ],
      },
    ],
    limitations: [
      'Tabelle molto grandi con molte categorie rare rendono il χ² instabile anche con N elevato.',
      'Con dati raggruppati per convenienza (non campionati) il p-value non ha il significato nominale.',
    ],
  };
};
