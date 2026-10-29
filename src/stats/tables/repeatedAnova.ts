import { fmtEst, fmtP } from '../format';
import { copy } from '../reportCopy';
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
      title: copy('ANOVA a misure ripetute'),
      subtitle: copy('{s1} soggetti · {s2} condizioni · CI {s3}%', { s1: result.n, s2: result.k, s3: level }),
      columns: [
        { key: 'source', label: copy('Sorgente'), format: 'text' },
        { key: 'ss', label: copy('SS'), format: 'dec4' },
        { key: 'df', label: copy('df'), format: 'dec2' },
        { key: 'ms', label: copy('MS'), format: 'dec4' },
        { key: 'f', label: copy('F'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'etaP', label: copy('η²p'), format: 'dec3' },
      ],
      rows: [
        {
          source: copy('Condizioni (within)'),
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
          source: copy('Errore (Condizioni × Soggetti)'),
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
        copy('F = MS_condizioni / MS_errore, con df = (k−1) e (n−1)(k−1).'),
        copy('η²p = {s1} · η²G = {s2}.', { s1: fmtEst(result.partialEta2, 3), s2: fmtEst(result.generalizedEta2, 3) }),
      ],
    },
    {
      id: 'rm-sphericity',
      title: copy('Sfericità e correzioni'),
      subtitle: sphericityMet ? copy('sfericità non rifiutata') : copy('sfericità violata: usare la correzione'),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'dec4' },
        { key: 'detail', label: copy('Dettaglio'), format: 'text' },
      ],
      rows: [
        { metric: copy('Mauchly W'), value: result.mauchlyW, detail: copy('1 = sfericità perfetta') },
        { metric: copy('Mauchly χ²'), value: result.mauchlyChi2, detail: copy('df = {s1}', { s1: result.mauchlyDf }) },
        { metric: copy('Mauchly p'), value: result.mauchlyP, detail: sphericityMet ? copy('nessuna violazione') : 'violazione' },
        { metric: copy('ε Greenhouse–Geisser'), value: result.ggEpsilon, detail: copy('limite inferiore = 1/(k−1)') },
        { metric: copy('ε Huynh–Feldt'), value: result.hfEpsilon, detail: copy('più liberale di GG') },
        { metric: copy('F (df non corretti)'), value: result.f, detail: copy('{s1}, {s2}', { s1: result.dfConditions, s2: result.dfError }) },
        { metric: copy('p non corretto'), value: result.p, detail: copy('valido solo con sfericità') },
        { metric: copy('p GG'), value: result.pGG, detail: copy('df = {s1}, {s2}', { s1: fmtEst(correctedDf1, 2), s2: fmtEst(correctedDf2, 2) }) },
        { metric: copy('p HF'), value: result.pHF, detail: copy('df corretti con ε HF') },
        { metric: copy('η² generalizzato'), value: result.generalizedEta2, detail: copy('SS condizioni / SS totale') },
      ],
      notes: [
        copy('Mauchly richiede normalità multivariata; con n piccolo il test ha potenza bassa.'),
        copy('Se Mauchly è significativo, riportare il p corretto GG (conservativo) o HF.'),
      ],
    },
    {
      id: 'rm-descriptives',
      title: copy('Descrittive per condizione'),
      columns: [
        { key: 'condition', label: copy('Condizione'), format: 'text' },
        { key: 'n', label: copy('N'), format: 'int' },
        { key: 'mean', label: copy('Media'), format: 'dec3' },
        { key: 'sd', label: copy('SD'), format: 'dec3' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
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
      notes: [copy('CI = media ± t({s1}%, df = {s2})·SE.', { s1: level, s2: result.n - 1 })],
    },
  ];
};
