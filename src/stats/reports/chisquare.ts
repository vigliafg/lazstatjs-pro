import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
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
  const oddsRatio = num(rowBy(effects, 'measure', 'Odds Ratio'), 'estimate');
  const orLo = num(rowBy(effects, 'measure', 'Odds Ratio'), 'ciLo');
  const orHi = num(rowBy(effects, 'measure', 'Odds Ratio'), 'ciHi');
  const relativeRisk = num(rowBy(effects, 'measure', 'Relative Risk'), 'estimate');

  const assumptions = rowsOf(tables, 'chisq-assumptions');
  const minExpected = num(rowBy(assumptions, 'metric', 'Frequenza attesa minima'), 'value');
  const lowCells = num(rowBy(assumptions, 'metric', 'Celle con E < 5'), 'value');
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
    ? 'Il test non è calcolabile con i dati disponibili.'
    : significant
      ? `Esiste un’associazione tra ${row1}/${row2} e ${col1}/${col2}: χ² = ${show(chi2, 3)}, ${describeP(chi2P)} (soglia α = ${alpha})${Number.isFinite(phi) ? `, φ = ${show(phi, 3)} (${interpretPhi(phi)})` : ''}.`
      : `Non emerge un’associazione tra ${row1}/${row2} e ${col1}/${col2}: χ² = ${show(chi2, 3)}, ${describeP(chi2P)} (soglia α = ${alpha}).`;

  const sections: ReportSection[] = [
    {
      heading: 'Il test principale',
      bullets: [
        `Pearson χ² = ${show(chi2, 3)} con df = ${showInt(num(pearson, 'df'))}, ${describeP(chi2P)} (α = ${alpha}).`,
        Number.isFinite(num(g2, 'statistic')) ? `Rapporto di verosimiglianza G² = ${show(num(g2, 'statistic'), 3)}, ${describeP(num(g2, 'p'))}: lettura alternativa, di solito concorde.` : '',
        Number.isFinite(num(yates, 'p')) ? `Correzione di continuità di Yates: ${describeP(num(yates, 'p'))} (più prudente su tabelle 2×2).` : '',
        Number.isFinite(fisherP) ? `Fisher esatto: ${describeP(fisherP)} → ${isDecided(fisherP, level) ? 'conferma l’associazione' : 'non conferma l’associazione'}; è il riferimento quando le frequenze attese sono piccole.` : '',
        significant
          ? 'Le due variabili non sono indipendenti: la distribuzione delle risposte cambia tra le righe.'
          : 'Le differenze osservate sono compatibili con l’indipendenza tra righe e colonne.',
      ].filter(Boolean),
    },
    {
      heading: 'Dove sta l’associazione',
      bullets: [
        strongestCell
          ? `La cella che contribuisce di più è «${text(strongestCell, 'cell')}»: osservati ${showInt(num(strongestCell, 'observed'))}, attesi ${show(num(strongestCell, 'expected'), 2)}, residuo aggiustato ${show(num(strongestCell, 'adjusted'), 2)} → ${Math.abs(num(strongestCell, 'adjusted')) > 2 ? 'differenza rispetto all’atteso superiore a 2, quindi rilevante' : 'scostamento contenuto'}.`
          : 'Nessuna cella dominante.',
        `Totale osservazioni: ${showInt(total)}. Composizione per riga: ${col1} ${show(num(cells[0], 'rowPct'), 1)}% in ${row1}, ${show(num(cells[2], 'rowPct'), 1)}% in ${row2}.`,
        'Le percentuali di riga rendono confrontabili gruppi con numerosità diverse; le percentuali di colonna rispondono alla domanda inversa.',
      ],
    },
    {
      heading: 'Quanto è forte l’associazione',
      bullets: [
        Number.isFinite(phi) ? `φ = ${show(phi, 3)}: associazione ${interpretPhi(phi)} (0.1 debole, 0.3 moderata, 0.5 forte su tabelle 2×2).` : 'φ non calcolabile.',
        Number.isFinite(oddsRatio) ? `Odds ratio = ${show(oddsRatio, 3)} (CI ${level}% ${showCI(orLo, orHi, 3)}): le odds di ${col1} in ${row1} sono ${oddsRatio > 1 ? `${show(oddsRatio, 2)} volte quelle di ${row2}` : `${show(1 / oddsRatio, 2)} volte (cioè meno) di quelle di ${row2}`}.` : 'Odds ratio non calcolabile (celle a zero).',
        Number.isFinite(relativeRisk) ? `Rischio relativo = ${show(relativeRisk, 3)}: ${row1} ha un rischio di ${col1} ${relativeRisk > 1 ? 'maggiore' : 'minore'} rispetto a ${row2}.` : '',
      ].filter(Boolean),
    },
    {
      heading: 'Assunzioni',
      bullets: [
        Number.isFinite(minExpected) ? `Frequenza attesa minima = ${show(minExpected, 2)}; celle con atteso < 5: ${showInt(lowCells)} su 4. ${smallSample ? 'La regola di Cochran non è rispettata: usa Fisher esatto (o Yates) e diffida del χ² classico.' : 'La regola di Cochran è rispettata: il χ² classico è affidabile.'}` : 'Frequenze attese non disponibili.',
        'Ogni osservazione deve stare in una sola cella: conteggi ripetuti della stessa unità gonfiano artificialmente la significatività.',
      ],
    },
    {
      heading: 'Come leggere i numeri',
      bullets: [
        P_SENTENCE,
        'Il residuo aggiustato dice quanto una cella è lontana da quanto ci si aspetterebbe se le variabili fossero indipendenti: oltre ±2 è un segnale concreto.',
        `φ misura la forza dell’associazione su una scala 0–1; con tabelle più grandi di 2×2 si usa Cramér’s V.`,
      ],
    },
    {
      heading: 'In pratica',
      body: [
        significant
          ? `C’è un legame tra le due variabili, ma la forza è ${Number.isFinite(phi) ? interpretPhi(phi) : 'da quantificare'}: con molti dati anche un legame debole diventa significativo, quindi valuta l’ampiezza prima di agire.`
          : 'Non ci sono prove di un legame tra le due variabili su questi dati. Con numerosità ridotta l’assenza di significatività può riflettere mancanza di potenza più che vera indipendenza.',
      ],
    },
  ];

  return {
    id: 'report-chisquare',
    title: 'Report di lettura — Chi quadrato',
    headline,
    badge: significant ? 'Associazione presente' : 'Variabili indipendenti',
    tone: significant ? (smallSample ? 'caution' : 'positive') : 'neutral',
    intro: [
      `Verifica se due variabili categoriche sono indipendenti: le righe sono ${row1} e ${row2}, le colonne ${col1} e ${col2}.`,
      'Confronta i conteggi osservati con quelli attesi se non ci fosse alcun legame: se le differenze sono troppo grandi per il caso, l’indipendenza viene rifiutata.',
    ],
    sections,
    limitations: [
      'Il χ² richiede frequenze attese sufficienti: sotto 5 per cella il test classico è inaffidabile e va usato Fisher esatto.',
      'La significatività dipende dalla numerosità: con campioni molto grandi anche associazioni irrilevanti risultano significative.',
      'Il test è omnibus: non indica da solo quale cella o quale direzione spieghi l’associazione.',
    ],
  };
};
