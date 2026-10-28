import { fmtEst } from '../format';
import { showInt } from '../reportKit';
import type { TableSpec } from '../types';
import type { SampleSizeDesign, SampleSizeOptions, SampleSizeResult } from '../samplesize/types';
import {
  powerAt,
  sampleSizeAnova,
  sampleSizeCorrelation,
  sampleSizeOneMean,
  sampleSizePrecision,
  sampleSizeTwoMeans,
  sampleSizeTwoProportions,
} from '../kernels/samplesize';

/** Main entry point used by the planner tab: validates, solves and tabulates. */
export const sampleSizeTables = (options: SampleSizeOptions): { tables: TableSpec[]; result: SampleSizeResult } => {
  let result: SampleSizeResult;

  switch (options.design) {
    case 'twoMeans':
      result = sampleSizeTwoMeans(options.delta ?? 0, options.sd ?? 0, options.alpha, options.power, options.tails);
      break;
    case 'oneMean':
    case 'paired':
      result = sampleSizeOneMean(
        options.delta ?? 0,
        options.sd ?? 0,
        options.alpha,
        options.power,
        options.tails,
        options.design
      );
      break;
    case 'twoProportions':
      result = sampleSizeTwoProportions(options.p1 ?? 0, options.p2 ?? 0, options.alpha, options.power, options.tails);
      break;
    case 'correlation':
      result = sampleSizeCorrelation(options.r ?? 0, options.alpha, options.power, options.tails);
      break;
    case 'anova':
      result = sampleSizeAnova(options.groups ?? 3, options.f ?? 0.25, options.alpha, options.power);
      break;
    default:
      result = sampleSizeTwoMeans(0, 0);
  }

  if (!Number.isFinite(result.nPerGroup)) return { tables: [], result };

  const precision = options.margin && options.margin > 0 && options.sd
    ? sampleSizePrecision(options.sd, options.margin, 100 * (1 - options.alpha), options.design === 'twoMeans' ? 2 : 1)
    : NaN;

  const steps = Math.min(30, Math.max(8, Math.ceil(result.nPerGroup / 2)));
  const perStep = Math.max(1, Math.ceil((result.nPerGroup * 1.5) / steps));
  const curve: { n: number; power: number }[] = [];
  for (let n = Math.max(2, perStep); n <= result.nPerGroup * 2; n += perStep) {
    curve.push({ n, power: powerAt(options, n) });
  }
  if (curve.length > 0 && curve[curve.length - 1].n < result.nPerGroup) {
    curve.push({ n: result.nPerGroup, power: powerAt(options, result.nPerGroup) });
  }

  const designLabel: Record<SampleSizeDesign, string> = {
    twoMeans: 'Due medie indipendenti',
    oneMean: 'Una media',
    paired: 'Due medie appaiate',
    twoProportions: 'Due proporzioni',
    correlation: 'Correlazione',
    anova: 'ANOVA a una via',
  };

  const inputRows = [
    { parameter: 'Disegno', value: designLabel[options.design] },
    { parameter: 'α', value: options.alpha.toFixed(3) },
    { parameter: 'Potenza target', value: `${fmtEst(options.power * 100, 1)}%` },
    { parameter: 'Code', value: options.tails === 2 ? 'due' : 'una' },
  ];
  if (options.design === 'twoMeans' || options.design === 'oneMean' || options.design === 'paired') {
    inputRows.push({ parameter: 'Differenza da rilevare', value: fmtEst(options.delta ?? NaN, 4) });
    inputRows.push({ parameter: 'SD (dei differenziali se appaiato)', value: fmtEst(options.sd ?? NaN, 4) });
  }
  if (options.design === 'twoProportions') {
    inputRows.push({ parameter: 'Proporzione gruppo 1', value: fmtEst(options.p1 ?? NaN, 4) });
    inputRows.push({ parameter: 'Proporzione gruppo 2', value: fmtEst(options.p2 ?? NaN, 4) });
  }
  if (options.design === 'correlation') {
    inputRows.push({ parameter: 'r da rilevare', value: fmtEst(options.r ?? NaN, 4) });
  }
  if (options.design === 'anova') {
    inputRows.push({ parameter: 'Numero di gruppi', value: showInt(options.groups ?? NaN) });
    inputRows.push({ parameter: "Cohen's f", value: fmtEst(options.f ?? NaN, 4) });
  }

  const tables: TableSpec[] = [];

  tables.push({
    id: 'ss-input',
    title: 'Parametri del piano',
    columns: [
      { key: 'parameter', label: 'Parametro', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: inputRows,
  });

  tables.push({
    id: 'ss-result',
    title: 'Numerosità richiesta',
    subtitle: result.method,
    columns: [
      { key: 'metric', label: 'Voce', format: 'text' },
      { key: 'value', label: 'Valore', format: 'text' },
    ],
    rows: [
      { metric: 'n per gruppo', value: showInt(result.nPerGroup) },
      { metric: 'N totale', value: showInt(result.total) },
      { metric: 'Effect size', value: fmtEst(result.effectSize, 4) },
      { metric: 'Potenza raggiunta', value: `${fmtEst(result.achievedPower * 100, 1)}%` },
      ...(Number.isFinite(precision)
        ? [{ metric: 'n per un margine di errore richiesto', value: showInt(precision) }]
        : []),
    ],
    notes: [
      'Il calcolo è iterativo: la numerosità viene aumentata finché la potenza raggiunge quella richiesta.',
      'La potenza riportata è quella approssimata del disegno, non il target: arrotondando a n intero può superarlo di poco.',
    ],
  });

  tables.push({
    id: 'ss-curve',
    title: 'Potenza al variare di n',
    subtitle: 'per gruppo',
    columns: [
      { key: 'n', label: 'n', format: 'int' },
      { key: 'power', label: 'Potenza', format: 'pct' },
    ],
    rows: curve.map(point => ({ n: point.n, power: Number((point.power * 100).toFixed(1)) })),
    notes: ['La curva si appiattisce: oltre il punto calcolato ogni osservazione in più compra sempre meno potenza.'],
  });

  return { tables, result };
};
