import { fmtEst } from '../format';
import { copy } from '../reportCopy';
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
  sampleSizeTost,
  sampleSizeSurvival,
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
    case 'tost':
      result = sampleSizeTost(
        options.delta ?? 0,
        options.sd ?? 0,
        options.margin ?? 0,
        options.alpha,
        options.power,
        options.tails
      );
      break;
    case 'survival':
      result = sampleSizeSurvival(
        options.hazardRatio ?? 1,
        options.eventRate ?? 0.5,
        options.alpha,
        options.power,
        options.tails
      );
      break;
    default:
      result = sampleSizeTwoMeans(0, 0);
  }

  if (!Number.isFinite(result.nPerGroup)) return { tables: [], result };

  const precision = options.design !== 'tost' && options.design !== 'survival' && options.margin && options.margin > 0 && options.sd
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
    twoMeans: copy('Due medie indipendenti'),
    oneMean: copy('Una media'),
    paired: copy('Due medie appaiate'),
    twoProportions: copy('Due proporzioni'),
    correlation: 'Correlazione',
    anova: copy('ANOVA a una via'),
    tost: copy('TOST (equivalenza)'),
    survival: copy('Sopravvivenza (log-rank)'),
  };

  const inputRows = [
    { parameter: 'Disegno', value: designLabel[options.design] },
    { parameter: 'α', value: options.alpha.toFixed(3) },
    { parameter: copy('Potenza target'), value: copy('{s1}%', { s1: fmtEst(options.power * 100, 1) }) },
    { parameter: 'Code', value: options.tails === 2 ? 'due' : 'una' },
  ];
  if (options.design === 'tost') {
    inputRows.push({ parameter: copy('Differenza attesa'), value: fmtEst(options.delta ?? NaN, 4) });
    inputRows.push({ parameter: 'SD', value: fmtEst(options.sd ?? NaN, 4) });
    inputRows.push({ parameter: copy('Margine di equivalenza'), value: fmtEst(options.margin ?? NaN, 4) });
  } else if (options.design === 'survival') {
    inputRows.push({ parameter: copy('Hazard ratio'), value: fmtEst(options.hazardRatio ?? NaN, 4) });
    inputRows.push({ parameter: copy('Tasso di eventi'), value: fmtEst(options.eventRate ?? NaN, 3) });
  } else if (options.design === 'twoMeans' || options.design === 'oneMean' || options.design === 'paired') {
    inputRows.push({ parameter: copy('Differenza da rilevare'), value: fmtEst(options.delta ?? NaN, 4) });
    inputRows.push({ parameter: copy('SD (dei differenziali se appaiato)'), value: fmtEst(options.sd ?? NaN, 4) });
  }
  if (options.design === 'twoProportions') {
    inputRows.push({ parameter: copy('Proporzione gruppo 1'), value: fmtEst(options.p1 ?? NaN, 4) });
    inputRows.push({ parameter: copy('Proporzione gruppo 2'), value: fmtEst(options.p2 ?? NaN, 4) });
  }
  if (options.design === 'correlation') {
    inputRows.push({ parameter: copy('r da rilevare'), value: fmtEst(options.r ?? NaN, 4) });
  }
  if (options.design === 'anova') {
    inputRows.push({ parameter: copy('Numero di gruppi'), value: showInt(options.groups ?? NaN) });
    inputRows.push({ parameter: copy("Cohen's f"), value: fmtEst(options.f ?? NaN, 4) });
  }

  const tables: TableSpec[] = [];

  tables.push({
    id: 'ss-input',
    title: copy('Parametri del piano'),
    columns: [
      { key: 'parameter', label: copy('Parametro'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: inputRows,
  });

  tables.push({
    id: 'ss-result',
    title: copy('Numerosità richiesta'),
    subtitle: result.method,
    columns: [
      { key: 'metric', label: copy('Voce'), format: 'text' },
      { key: 'value', label: copy('Valore'), format: 'text' },
    ],
    rows: [
      { metric: copy('n per gruppo'), value: showInt(result.nPerGroup) },
      { metric: copy('N totale'), value: showInt(result.total) },
      { metric: copy('Effect size'), value: fmtEst(result.effectSize, 4) },
      { metric: copy('Potenza raggiunta'), value: copy('{s1}%', { s1: fmtEst(result.achievedPower * 100, 1) }) },
      ...(Number.isFinite(precision)
        ? [{ metric: copy('n per un margine di errore richiesto'), value: showInt(precision) }]
        : []),
    ],
    notes: [
      copy('Il calcolo è iterativo: la numerosità viene aumentata finché la potenza raggiunge quella richiesta.'),
      copy('La potenza riportata è quella approssimata del disegno, non il target: arrotondando a n intero può superarlo di poco.'),
    ],
  });

  tables.push({
    id: 'ss-curve',
    title: copy('Potenza al variare di n'),
    subtitle: copy('per gruppo'),
    columns: [
      { key: 'n', label: copy('n'), format: 'int' },
      { key: 'power', label: copy('Potenza'), format: 'pct' },
    ],
    rows: curve.map(point => ({ n: point.n, power: Number((point.power * 100).toFixed(1)) })),
    notes: [copy('La curva si appiattisce: oltre il punto calcolato ogni osservazione in più compra sempre meno potenza.')],
  });

  return { tables, result };
};
