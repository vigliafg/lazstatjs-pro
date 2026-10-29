import type { ReportSection, ReportSpec, TableRow, TableSpec } from './shared';
import { copy } from '../reportCopy';
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
  const methodLabel = method === 'spearman' ? copy('Spearman ρ') : method === 'kendall' ? copy('Kendall τ') : copy('Pearson r');

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
      ? copy('non calcolabile')
      : pair.r > 0
        ? copy('positiva (al crescere di una cresce l’altra)')
        : copy('negativa (al crescere di una l’altra cala)');
    const r2 = Number.isFinite(pair.r) ? pair.r * pair.r : NaN;
    return copy('{s1} × {s2}: {s3} = {s4}, {s5} → associazione {s6}; relazione {s7}; r² = {s8} ({s9}% di varianza condivisa){s10}.', { s1: pair.a, s2: pair.b, s3: methodLabel, s4: show(pair.r, 3), s5: describeP(pair.pValue), s6: isDecided(pair.pValue, level) ? copy('{s1} e significativa', { s1: interpretR(pair.r) }) : copy('non significativa'), s7: direction, s8: show(r2, 3), s9: show(r2 * 100, 1), s10: method !== 'pearson' && Number.isFinite(pair.pearsonR) ? copy('; Pearson r = {s1} ({s2})', { s1: show(pair.pearsonR, 3), s2: describeP(pair.pearsonP) }) : '' });
  });

  const headline = !strongest || !Number.isFinite(strongest.r)
    ? copy('Nessuna correlazione calcolabile con i dati disponibili.')
    : isDecided(strongest.pValue, level)
      ? copy('L’associazione più forte è {s1} × {s2}: {s3} = {s4}, {s5} e significativa ({s6}).', { s1: strongest.a, s2: strongest.b, s3: methodLabel, s4: show(strongest.r, 3), s5: interpretR(strongest.r), s6: describeP(strongest.pValue) })
      : copy('Nessuna associazione raggiunge la significatività: la più forte è {s1} × {s2} ({s3} = {s4}, {s5}).', { s1: strongest.a, s2: strongest.b, s3: methodLabel, s4: show(strongest.r, 3), s5: describeP(strongest.pValue) });

  const sections: ReportSection[] = [
    { heading: copy('Coppia per coppia'), bullets },
    {
      heading: copy('Quanto è forte il legame'),
      bullets: [
        Number.isFinite(strongest?.r ?? NaN)
          ? copy('Il coefficiente va da −1 a +1: {s1} corrisponde a un legame {s2}; il segno indica solo la direzione.', { s1: show(strongest!.r, 3), s2: interpretR(strongest!.r) })
          : copy('Coefficiente non disponibile.'),
        Number.isFinite(strongest?.r ?? NaN)
          ? copy('r² = {s1}: le due variabili condividono circa il {s2}% della variabilità, il resto dipende da altro.', { s1: show(strongest!.r * strongest!.r, 3), s2: show(strongest!.r * strongest!.r * 100, 1) })
          : '',
        significant.length === 0
          ? copy('Nessuna coppia supera la soglia scelta: le oscillazioni osservate sono compatibili con il caso.')
          : copy('{s1} {s2} la soglia di significatività: con molti confronti qualche falso positivo è atteso, quindi dai priorità alle associazioni più forti e coerenti con l’ipotesi di partenza.', { s1: significant.length, s2: significant.length === 1 ? copy('coppia supera') : copy('coppie superano') }),
      ].filter(Boolean),
    },
  ];

  const partial = rowsOf(tables, 'corr-partial');
  if (partial.length > 0) {
    sections.push({
      heading: copy('Correlazioni parziali'),
      body: [
        copy('La correlazione parziale misura il legame tra due variabili togliendo l’effetto delle altre: se crolla rispetto a quella semplice, il legame era in buona parte spiegato dalle variabili controllate.'),
      ],
      bullets: partial.map(row => copy('{s1} × {s2} controllando {s3}: r = {s4}, {s5} → {s6}.', { s1: text(row, 'a'), s2: text(row, 'b'), s3: text(row, 'controls'), s4: show(num(row, 'r'), 3), s5: describeP(num(row, 'p')), s6: isDecided(num(row, 'p'), level) ? copy('legame residuo significativo') : copy('nessun legame residuo affidabile') })),
    });
  }

  sections.push({
    heading: copy('Come leggere i numeri'),
    bullets: [
      method === 'pearson'
        ? copy('Pearson misura un legame lineare: una relazione curva forte può dare r vicino a zero.')
        : method === 'spearman'
          ? copy('Spearman lavora sui ranghi: misura un legame monotono e resiste agli outlier e alle scale non lineari.')
          : copy('Kendall confronta coppie concordanti e discordanti: è robusto e adatto a campioni piccoli con molti ranghi pari.'),
      copy('p < {s1} indica che il coefficiente è difficilmente spiegabile dal solo caso; non dice che il legame sia forte.', { s1: alpha }),
      copy('N varia tra le coppie quando alcune righe hanno valori mancanti: coefficienti con N molto diverso non sono direttamente confrontabili.'),
    ],
  });

  return {
    id: 'report-correlation',
    title: copy('Report di lettura — Correlazione'),
    headline,
    badge: significant.length > 0 ? copy('Associazione presente') : copy('Nessuna associazione'),
    tone: significant.length > 0 ? 'positive' : 'neutral',
    intro: [
      copy('Misura se due variabili si muovono insieme e con quale intensità, senza ipotizzare quale delle due influenzi l’altra.'),
      copy('Il coefficiente è compreso tra −1 e +1: lo zero indica assenza di legame, i valori estremi un legame quasi perfetto in una direzione o nell’altra.'),
    ],
    sections,
    limitations: [
      copy('Correlazione non è causalità: una terza variabile può spiegare entrambe, oppure la direzione può essere inversa.'),
      copy('Gli outlier e le distribuzioni molto asimmetriche possono gonfiare o azzerare il coefficiente: controlla sempre il grafico a dispersione.'),
      copy('Una correlazione calcolata su un intervallo ristretto di valori tende a sottostimare il legame reale.'),
    ],
  };
};
