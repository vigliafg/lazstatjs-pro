import { fmtEst, fmtP } from '../format';
import { isDecided, show } from '../reportKit';
import { alphaOf } from '../kernels/alpha';
import { tCrit } from '../distributions';
import type { TableSpec } from '../types';
import type { RmAnovaResult } from '../repeatedAnova/types';

export const repeatedAnovaTables = (
  result: RmAnovaResult,
  names: string[],
  level: number
): TableSpec[] => {
  const sphericityMet = Number.isFinite(result.mauchlyP) && result.mauchlyP > alphaOf(level);
  const correctedDf1 = result.ggEpsilon * result.dfConditions;
  const correctedDf2 = result.ggEpsilon * result.dfError;
  const crit = tCrit(level, result.n - 1);
  return [
    {
      id: 'rm-anova',
      title: 'ANOVA a misure ripetute',
      subtitle: `${result.n} soggetti · ${result.k} condizioni · CI ${level}%`,
      columns: [
        { key: 'source', label: 'Sorgente', format: 'text' },
        { key: 'ss', label: 'SS', format: 'dec4' },
        { key: 'df', label: 'df', format: 'dec2' },
        { key: 'ms', label: 'MS', format: 'dec4' },
        { key: 'f', label: 'F', format: 'dec3' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'etaP', label: 'η²p', format: 'dec3' },
      ],
      rows: [
        {
          source: 'Condizioni (within)',
          ss: result.ssConditions,
          df: result.dfConditions,
          ms: result.msConditions,
          f: result.f,
          p: result.p,
          etaP: result.partialEta2,
        },
        {
          source: 'Soggetti',
          ss: result.ssSubjects,
          df: result.n - 1,
          ms: result.ssSubjects / (result.n - 1),
          f: NaN,
          p: NaN,
          etaP: NaN,
        },
        {
          source: 'Errore (Condizioni × Soggetti)',
          ss: result.ssError,
          df: result.dfError,
          ms: result.msError,
          f: NaN,
          p: NaN,
          etaP: NaN,
        },
        {
          source: 'Totale',
          ss: result.ssTotal,
          df: result.n * result.k - 1,
          ms: NaN,
          f: NaN,
          p: NaN,
          etaP: NaN,
        },
      ],
      notes: [
        'F = MS_condizioni / MS_errore, con df = (k−1) e (n−1)(k−1).',
        `η²p = ${fmtEst(result.partialEta2, 3)} · η²G = ${fmtEst(result.generalizedEta2, 3)}.`,
      ],
    },
    {
      id: 'rm-sphericity',
      title: 'Sfericità e correzioni',
      subtitle: sphericityMet ? 'sfericità non rifiutata' : 'sfericità violata: usare la correzione',
      columns: [
        { key: 'metric', label: 'Metrica', format: 'text' },
        { key: 'value', label: 'Valore', format: 'dec4' },
        { key: 'detail', label: 'Dettaglio', format: 'text' },
      ],
      rows: [
        { metric: 'Mauchly W', value: result.mauchlyW, detail: '1 = sfericità perfetta' },
        { metric: 'Mauchly χ²', value: result.mauchlyChi2, detail: `df = ${result.mauchlyDf}` },
        { metric: 'Mauchly p', value: result.mauchlyP, detail: sphericityMet ? 'nessuna violazione' : 'violazione' },
        { metric: 'ε Greenhouse–Geisser', value: result.ggEpsilon, detail: 'limite inferiore = 1/(k−1)' },
        { metric: 'ε Huynh–Feldt', value: result.hfEpsilon, detail: 'più liberale di GG' },
        { metric: 'F (df non corretti)', value: result.f, detail: `${result.dfConditions}, ${result.dfError}` },
        { metric: 'p non corretto', value: result.p, detail: 'valido solo con sfericità' },
        { metric: 'p GG', value: result.pGG, detail: `df = ${fmtEst(correctedDf1, 2)}, ${fmtEst(correctedDf2, 2)}` },
        { metric: 'p HF', value: result.pHF, detail: 'df corretti con ε HF' },
        { metric: 'η² generalizzato', value: result.generalizedEta2, detail: 'SS condizioni / SS totale' },
      ],
      notes: [
        'Mauchly richiede normalità multivariata; con n piccolo il test ha potenza bassa.',
        'Se Mauchly è significativo, riportare il p corretto GG (conservativo) o HF.',
      ],
    },
    {
      id: 'rm-descriptives',
      title: 'Descrittive per condizione',
      columns: [
        { key: 'condition', label: 'Condizione', format: 'text' },
        { key: 'n', label: 'N', format: 'int' },
        { key: 'mean', label: 'Media', format: 'dec3' },
        { key: 'sd', label: 'SD', format: 'dec3' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
      ],
      rows: names.map((name, index) => {
        const half = crit * (result.sds[index] / Math.sqrt(result.n));
        return {
          condition: name,
          n: result.n,
          mean: result.means[index],
          sd: result.sds[index],
          ciLo: result.means[index] - half,
          ciHi: result.means[index] + half,
        };
      }),
      notes: [`CI = media ± t(${level}%, df = ${result.n - 1})·SE.`],
    },
  ];
};
