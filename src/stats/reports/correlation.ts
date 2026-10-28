import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import {
  P_SENTENCE, alphaOf, alphaText, ciSentence, describeP, fmtCI, fmtEst, fmtP,
  interpretD, interpretEta, interpretPhi, interpretR, isDecided, num, rowBy,
  rowLike, rowsOf, show, showCI, showInt, subtitleOf, tableById, text,
} from './shared';

export interface CorrelationReportInput {
  tables: TableSpec[];
  method: 'pearson' | 'spearman' | 'kendall';
  level: number;
}

export const correlationReport = (input: CorrelationReportInput): ReportSpec => {
  const { tables, method, level } = input;
  const pairs = rowsOf(tables, 'corr-pairs');
  const alpha = alphaText(level);

  const coefficientKey = method === 'spearman' ? 'spearman' : method === 'kendall' ? 'kendall' : 'pearson';
  const pKey = method === 'spearman' ? 'spearmanP' : method === 'kendall' ? 'kendallP' : 'pearsonP';
  const methodLabel = method === 'spearman' ? 'Spearman ρ' : method === 'kendall' ? 'Kendall τ' : 'Pearson r';

  const described = pairs.map(pair => {
    const a = text(pair, 'a');
    const b = text(pair, 'b');
    const r = num(pair, coefficientKey);
    const pValue = num(pair, pKey);
    const pearsonR = num(pair, 'pearson');
    const pearsonP = num(pair, 'pearsonP');
    return { a, b, r, pValue, pearsonR, pearsonP };
  });

  const significant = described.filter(pair => isDecided(pair.pValue, level));
  const strongest = described.reduce<(typeof described)[number] | null>((best, pair) => {
    if (!Number.isFinite(pair.r)) return best;
    if (!best) return pair;
    return Math.abs(pair.r) > Math.abs(best.r) ? pair : best;
  }, null);

  const bullets = described.map(pair => {
    const direction = !Number.isFinite(pair.r)
      ? 'non calcolabile'
      : pair.r > 0
        ? 'positiva (al crescere di una cresce l’altra)'
        : 'negativa (al crescere di una l’altra cala)';
    const r2 = Number.isFinite(pair.r) ? pair.r * pair.r : NaN;
    return `${pair.a} × ${pair.b}: ${methodLabel} = ${show(pair.r, 3)}, ${describeP(pair.pValue)} → associazione ${isDecided(pair.pValue, level) ? `${interpretR(pair.r)} e significativa` : 'non significativa'}; relazione ${direction}; r² = ${show(r2, 3)} (${show(r2 * 100, 1)}% di varianza condivisa)${method !== 'pearson' && Number.isFinite(pair.pearsonR) ? `; Pearson r = ${show(pair.pearsonR, 3)} (${describeP(pair.pearsonP)})` : ''}.`;
  });

  const headline = !strongest || !Number.isFinite(strongest.r)
    ? 'Nessuna correlazione calcolabile con i dati disponibili.'
    : isDecided(strongest.pValue, level)
      ? `L’associazione più forte è ${strongest.a} × ${strongest.b}: ${methodLabel} = ${show(strongest.r, 3)}, ${interpretR(strongest.r)} e significativa (${describeP(strongest.pValue)}).`
      : `Nessuna associazione raggiunge la significatività: la più forte è ${strongest.a} × ${strongest.b} (${methodLabel} = ${show(strongest.r, 3)}, ${describeP(strongest.pValue)}).`;

  const sections: ReportSection[] = [
    { heading: 'Coppia per coppia', bullets },
    {
      heading: 'Quanto è forte il legame',
      bullets: [
        Number.isFinite(strongest?.r ?? NaN)
          ? `Il coefficiente va da −1 a +1: ${show(strongest!.r, 3)} corrisponde a un legame ${interpretR(strongest!.r)}; il segno indica solo la direzione.`
          : 'Coefficiente non disponibile.',
        Number.isFinite(strongest?.r ?? NaN)
          ? `r² = ${show(strongest!.r * strongest!.r, 3)}: le due variabili condividono circa il ${show(strongest!.r * strongest!.r * 100, 1)}% della variabilità, il resto dipende da altro.`
          : '',
        significant.length === 0
          ? 'Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.'
          : `${significant.length} ${significant.length === 1 ? 'coppia supera' : 'coppie superano'} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.`,
      ].filter(Boolean),
    },
  ];

  const partial = rowsOf(tables, 'corr-partial');
  if (partial.length > 0) {
    sections.push({
      heading: 'Correlazioni parziali',
      body: [
        'La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.',
      ],
      bullets: partial.map(row => `${text(row, 'a')} × ${text(row, 'b')} controllando ${text(row, 'controls')}: r = ${show(num(row, 'r'), 3)}, ${describeP(num(row, 'p'))} → ${isDecided(num(row, 'p'), level) ? 'legame residuo significativo' : 'nessun legame residuo affidabile'}.`),
    });
  }

  sections.push({
    heading: 'Come leggere i numeri',
    bullets: [
      method === 'pearson'
        ? 'Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.'
        : method === 'spearman'
          ? 'Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.'
          : 'Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.',
      `p < ${alpha} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.`,
      'N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.',
    ],
  });

  return {
    id: 'report-correlation',
    title: 'Report di lettura — Correlazione',
    headline,
    badge: significant.length > 0 ? 'Associazione presente' : 'Nessuna associazione',
    tone: significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      'Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.',
      'Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.',
    ],
    sections,
    limitations: [
      'Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.',
      'Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.',
      'Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.',
    ],
  };
};
