import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export interface ChiSquareReportInput {
  tables: TableSpec[];
  level: number;
  row1: string;
  row2: string;
  col1: string;
  col2: string;
}

export const chiSquareReport = (input: ChiSquareReportInput): ReportSpec => {
  const { tables, level, row1, row2, col1, col2 } = input;
  const alpha = alphaText(level);

  const tests = rowsOf(tables, 'chisq-tests');
  const pearson = rowLike(tests, 'test', 'pearson');
  const g2 = rowLike(tests, 'test', 'likelihood');
  const yates = rowLike(tests, 'test', 'yates');
  const fisher = rowLike(tests, 'test', 'fisher');

  const chi2 = num(pearson, 'statistic');
  const chi2P = num(pearson, 'p');
  const fisherP = num(fisher, 'p');
  const significant = isDecided(chi2P, level);

  const effects = rowsOf(tables, 'chisq-effects');
  const phi = num(rowBy(effects, 'measure', 'φ (phi)'), 'estimate');
  const oddsRatio = num(rowBy(effects, 'measure', copy('Odds Ratio')), 'estimate');
  const orLo = num(rowBy(effects, 'measure', copy('Odds Ratio')), 'ciLo');
  const orHi = num(rowBy(effects, 'measure', copy('Odds Ratio')), 'ciHi');
  const relativeRisk = num(rowBy(effects, 'measure', copy('Relative Risk')), 'estimate');

  const assumptions = rowsOf(tables, 'chisq-assumptions');
  const minExpected = num(rowBy(assumptions, 'metric', copy('Frequenza attesa minima')), 'value');
  const lowCells = num(rowBy(assumptions, 'metric', copy('Celle con E < 5')), 'value');
  const total = num(rowBy(assumptions, 'metric', 'N'), 'value');

  const cells = rowsOf(tables, 'chisq-contingency');
  const strongestCell = cells.reduce<TableRow | null>((best, cell) => {
    const adjusted = num(cell, 'adjusted');
    if (!Number.isFinite(adjusted)) return best;
    if (!best) return cell;
    return Math.abs(adjusted) > Math.abs(num(best, 'adjusted')) ? cell : best;
  }, null);

  const smallSample = Number.isFinite(minExpected) && minExpected < 5;
  const headline = !Number.isFinite(chi2P)
    ? copy('Il test non è calcolabile con i dati disponibili.')
    : significant
      ? copy('Esiste un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}){s8}.', { s1: row1, s2: row2, s3: col1, s4: col2, s5: show(chi2, 3), s6: describeP(chi2P), s7: alpha, s8: Number.isFinite(phi) ? copy(', φ = {s1} ({s2})', { s1: show(phi, 3), s2: interpretPhi(phi) }) : '' })
      : copy('Non emerge un’associazione tra {s1}/{s2} e {s3}/{s4}: χ² = {s5}, {s6} (soglia α = {s7}).', { s1: row1, s2: row2, s3: col1, s4: col2, s5: show(chi2, 3), s6: describeP(chi2P), s7: alpha });

  const sections: ReportSection[] = [
    {
      heading: copy('Il test principale'),
      bullets: [
        copy('Pearson χ² = {s1} con df = {s2}, {s3} (α = {s4}).', { s1: show(chi2, 3), s2: showInt(num(pearson, 'df')), s3: describeP(chi2P), s4: alpha }),
        Number.isFinite(num(g2, 'statistic')) ? copy('Rapporto di verosimiglianza G² = {s1}, {s2}: lettura alternativa, di solito concorde.', { s1: show(num(g2, 'statistic'), 3), s2: describeP(num(g2, 'p')) }) : '',
        Number.isFinite(num(yates, 'p')) ? copy('Correzione di continuità di Yates: {s1} (più prudente su tabelle 2×2).', { s1: describeP(num(yates, 'p')) }) : '',
        Number.isFinite(fisherP) ? copy('Fisher esatto: {s1} → {s2}; è il riferimento quando le frequenze attese sono piccole.', { s1: describeP(fisherP), s2: isDecided(fisherP, level) ? copy('conferma l’associazione') : copy('non conferma l’associazione') }) : '',
        significant
          ? copy('Le due variabili non sono indipendenti: la distribuzione delle risposte cambia tra le righe.')
          : copy('Le differenze osservate sono compatibili con l’indipendenza tra righe e colonne.'),
      ].filter(Boolean),
    },
    {
      heading: copy('Dove sta l’associazione'),
      bullets: [
        strongestCell
          ? copy('La cella che contribuisce di più è «{s1}»: osservati {s2}, attesi {s3}, residuo aggiustato {s4} → {s5}.', { s1: text(strongestCell, 'cell'), s2: showInt(num(strongestCell, 'observed')), s3: show(num(strongestCell, 'expected'), 2), s4: show(num(strongestCell, 'adjusted'), 2), s5: Math.abs(num(strongestCell, 'adjusted')) > 2 ? copy('differenza rispetto all’atteso superiore a 2, quindi rilevante') : copy('scostamento contenuto') })
          : copy('Nessuna cella dominante.'),
        copy('Totale osservazioni: {s1}. Composizione per riga: {s2} {s3}% in {s4}, {s5}% in {s6}.', { s1: showInt(total), s2: col1, s3: show(num(cells[0], 'rowPct'), 1), s4: row1, s5: show(num(cells[2], 'rowPct'), 1), s6: row2 }),
        copy('Le percentuali di riga rendono confrontabili gruppi con numerosità diverse; le percentuali di colonna rispondono alla domanda inversa.'),
      ],
    },
    {
      heading: copy('Quanto è forte l’associazione'),
      bullets: [
        Number.isFinite(phi) ? copy('φ = {s1}: associazione {s2} (0.1 debole, 0.3 moderata, 0.5 forte su tabelle 2×2).', { s1: show(phi, 3), s2: interpretPhi(phi) }) : copy('φ non calcolabile.'),
        Number.isFinite(oddsRatio) ? copy('Odds ratio = {s1} (CI {s2}% {s3}): le odds di {s4} in {s5} sono {s6}.', { s1: show(oddsRatio, 3), s2: level, s3: showCI(orLo, orHi, 3), s4: col1, s5: row1, s6: oddsRatio > 1 ? copy('{s1} volte quelle di {s2}', { s1: show(oddsRatio, 2), s2: row2 }) : copy('{s1} volte (cioè meno) di quelle di {s2}', { s1: show(1 / oddsRatio, 2), s2: row2 }) }) : copy('Odds ratio non calcolabile (celle a zero).'),
        Number.isFinite(relativeRisk) ? copy('Rischio relativo = {s1}: {s2} ha un rischio di {s3} {s4} rispetto a {s5}.', { s1: show(relativeRisk, 3), s2: row1, s3: col1, s4: relativeRisk > 1 ? 'maggiore' : 'minore', s5: row2 }) : '',
      ].filter(Boolean),
    },
    {
      heading: 'Assunzioni',
      bullets: [
        Number.isFinite(minExpected) ? copy('Frequenza attesa minima = {s1}; celle con atteso < 5: {s2} su 4. {s3}', { s1: show(minExpected, 2), s2: showInt(lowCells), s3: smallSample ? copy('La regola di Cochran non è rispettata: usa Fisher esatto (o Yates) e diffida del χ² classico.') : copy('La regola di Cochran è rispettata: il χ² classico è affidabile.') }) : copy('Frequenze attese non disponibili.'),
        copy('Ogni osservazione deve stare in una sola cella: conteggi ripetuti della stessa unità gonfiano artificialmente la significatività.'),
      ],
    },
    {
      heading: copy('Come leggere i numeri'),
      bullets: [
        P_SENTENCE,
        copy('Il residuo aggiustato dice quanto una cella è lontana da quanto ci si aspetterebbe se le variabili fossero indipendenti: oltre ±2 è un segnale concreto.'),
        copy(`φ misura la forza dell’associazione su una scala 0–1; con tabelle più grandi di 2×2 si usa Cramér’s V.`),
      ],
    },
    {
      heading: copy('In pratica'),
      body: [
        significant
          ? copy('C’è un legame tra le due variabili, ma la forza è {s1}: con molti dati anche un legame debole diventa significativo, quindi valuta l’ampiezza prima di agire.', { s1: Number.isFinite(phi) ? interpretPhi(phi) : copy('da quantificare') })
          : copy('Non ci sono prove di un legame tra le due variabili su questi dati. Con numerosità ridotta l’assenza di significatività può riflettere mancanza di potenza più che vera indipendenza.'),
      ],
    },
  ];

  return {
    id: 'report-chisquare',
    title: copy('Report di lettura — Chi quadrato'),
    headline,
    badge: significant ? copy('Associazione presente') : copy('Variabili indipendenti'),
    tone: significant ? (smallSample ? 'caution' : 'positive') : 'neutral',
    intro: [
      copy('Verifica se due variabili categoriche sono indipendenti: le righe sono {s1} e {s2}, le colonne {s3} e {s4}.', { s1: row1, s2: row2, s3: col1, s4: col2 }),
      copy('Confronta i conteggi osservati con quelli attesi se non ci fosse alcun legame: se le differenze sono troppo grandi per il caso, l’indipendenza viene rifiutata.'),
    ],
    sections,
    limitations: [
      copy('Il χ² richiede frequenze attese sufficienti: sotto 5 per cella il test classico è inaffidabile e va usato Fisher esatto.'),
      copy('La significatività dipende dalla numerosità: con campioni molto grandi anche associazioni irrilevanti risultano significative.'),
      copy('Il test è omnibus: non indica da solo quale cella o quale direzione spieghi l’associazione.'),
    ],
  };
};
