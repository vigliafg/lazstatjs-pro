import { fmtEst, fmtP } from '../format';
import { copy, sourceOf } from '../reportCopy';
import { describeP, isDecided, show, showInt, tableById } from '../reportKit';
import type { ReportSpec } from '../report';
import type { TableSpec } from '../types';

const associationWord = (value: number): string => {
  if (!Number.isFinite(value)) return copy('non calcolabile');
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
    tableById(tables, 'cont-expected')?.notes?.find(note => sourceOf(note).includes('attesa < 5'))?.match(/^(\d+)/)?.[1] ?? NaN
  );
  const exactRow = tests.find(row => String(row.test).includes('Fisher'));
  const monteCarloRow = tests.find(row => String(row.test).includes('Monte Carlo'));

  const drivers = residuals
    .filter(row => Number.isFinite(Number(row.adjusted)) && Math.abs(Number(row.adjusted)) >= 2)
    .sort((a, b) => Math.abs(Number(b.adjusted)) - Math.abs(Number(a.adjusted)))
    .slice(0, 4)
    .map(row => {
      const direction = Number(row.adjusted) > 0 ? copy('più osservazioni') : copy('meno osservazioni');
      return copy('{s1}: {s2} del previsto (residuo aggiustato {s3})', { s1: String(row.cell), s2: direction, s3: fmtEst(Number(row.adjusted), 2) });
    });

  const headline = !Number.isFinite(p)
    ? copy('Tabelle troppo piccole o con celle vuote: il test non è calcolabile.')
    : significant
      ? copy('Le due variabili non sono indipendenti (χ² = {s1}, df = {s2}, p = {s3}).', { s1: fmtEst(chi2, 3), s2: df, s3: fmtP(p) })
      : copy('Nessuna evidenza di associazione (χ² = {s1}, df = {s2}, p = {s3}).', { s1: fmtEst(chi2, 3), s2: df, s3: fmtP(p) });

  return {
    id: 'contingency',
    title: copy('Report di lettura'),
    headline,
    badge: significant ? copy('Associazione significativa') : copy('Nessuna associazione rilevata'),
    tone: significant ? 'positive' : 'neutral',
    intro: [
      copy('Il test del χ² confronta le frequenze che osservi con quelle che ti aspetteresti se le due variabili categoriche fossero completamente indipendenti.'),
      copy('L’ipotesi nulla è “indipendenza”: nessuna relazione tra riga e colonna. Un p piccolo significa che le differenze tra osservato e atteso sono troppo grandi per essere solo rumore campionario.'),
    ],
    sections: [
      {
        heading: copy('La lettura dei risultati'),
        body: [
          copy('La tabella ha N = {s1} osservazioni e {s2} gradi di libertà. Il χ² di Pearson vale {s3}: {s4}{s5}', { s1: showInt(n), s2: df, s3: show(chi2, 3), s4: describeP(p), s5: Number.isFinite(p) ? significant ? copy(', sotto la soglia α = {s1}: l’ipotesi di indipendenza viene rifiutata.', { s1: (1 - level / 100).toFixed(2) }) : copy(', sopra la soglia α = {s1}: l’ipotesi di indipendenza non viene rifiutata.', { s1: (1 - level / 100).toFixed(2) }) : '.' }),
          Number.isFinite(Number(exactRow?.p))
            ? copy('Con celle piccole il test esatto di Fisher dà p = {s1}: è il valore da preferire in una tabella 2×2 con attese basse.', { s1: fmtP(Number(exactRow?.p)) })
            : '',
          Number.isFinite(Number(monteCarloRow?.p))
            ? copy('Poiché {s1} celle hanno attesa sotto 5, ho aggiunto un p Monte Carlo con margini fissi ({s2}): non dipende dall’approssimazione asintotica.', { s1: Number.isFinite(lowCells) ? lowCells : 'alcune', s2: fmtP(Number(monteCarloRow?.p)) })
            : '',
        ].filter(Boolean),
      },
      {
        heading: copy('Dove sta l’associazione'),
        body: [
          copy('Il χ² dice che qualcosa c’è, non dove. I residui aggiustati rispondono a questa domanda: valori oltre ±2 indicano le celle che si discostano dall’indipendenza più di quanto il caso spieghi.'),
        ],
        bullets: drivers.length > 0 ? drivers : [copy('Nessuna cella supera la soglia di ±2: l’associazione è diffusa, non concentrata in una combinazione specifica.')],
      },
      {
        heading: copy('Quanto è forte'),
        body: [
          Number.isFinite(cramers)
            ? copy('Cramér’s V = {s1}: un’associazione {s2} (0 = indipendenza, 1 = legame deterministico). Il p-value può essere piccolissimo anche per associazioni debolissime se N è grande: la forza va letta qui, non nel p.', { s1: show(cramers, 3), s2: strength })
            : copy('La misura di associazione non è calcolabile con questi dati.'),
        ],
      },
      {
        heading: copy('Assunzioni da controllare'),
        bullets: [
          copy('Osservazioni indipendenti: ogni riga del dataset deve essere una unità diversa, non una misura ripetuta.'),
          copy('Categorie esaustive e mutuamente esclusive: ogni osservazione cade in una sola cella.'),
          copy('Regola di Cochran: nessuna attesa < 1 e non più del 20% delle celle con attesa < 5; se cade, usa Fisher (2×2) o il p Monte Carlo.'),
          copy('Il test non dice nulla sulla direzione causale: associazione non è causa.'),
        ],
      },
    ],
    limitations: [
      copy('Tabelle molto grandi con molte categorie rare rendono il χ² instabile anche con N elevato.'),
      copy('Con dati raggruppati per convenienza (non campionati) il p-value non ha il significato nominale.'),
    ],
  };
};
