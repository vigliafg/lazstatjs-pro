import { fmtEst, fmtP, interpretEta } from '../format';
import { copy } from '../reportCopy';
import { tCrit } from '../distributions';
import type { TableSpec } from '../types';
import type { AncovaOptions } from '../ancova/types';
import { build } from '../kernels/ancova';

export const ancovaTables = (options: AncovaOptions): TableSpec[] => {
  const result = build(options);
  const { level, factorName, covariateNames, responseName } = options;
  if (!result) return [];

  const crit = tCrit(level, result.dfError);
  const modelRows = [
    {
      source: factorName,
      ss: result.factorSS,
      df: result.factorDf,
      ms: result.factorSS / result.factorDf,
      f: result.factorF,
      p: result.factorP,
      etaP: result.factorSS / (result.factorSS + result.sse),
    },
    ...result.covariateSS.map((ss, index) => ({
      source: covariateNames[index],
      ss,
      df: 1,
      ms: ss,
      f: result.covariateF[index],
      p: result.covariateP[index],
      etaP: ss / (ss + result.sse),
    })),
    {
      source: 'Residuo',
      ss: result.sse,
      df: result.dfError,
      ms: result.mse,
      f: NaN,
      p: NaN,
      etaP: NaN,
    },
    {
      source: 'Totale',
      ss: result.sst,
      df: result.n - 1,
      ms: NaN,
      f: NaN,
      p: NaN,
      etaP: NaN,
    },
  ];

  const termNames = ['Intercetta', ...result.groups.slice(1), ...covariateNames];
  const coefficientRows = result.coef.map((value, index) => ({
    term: termNames[index] ?? copy('Termine {s1}', { s1: index + 1 }),
    b: value,
    se: result.coefSe[index],
    t: result.coefT[index],
    p: result.coefP[index],
    ciLo: value - crit * result.coefSe[index],
    ciHi: value + crit * result.coefSe[index],
  }));

  const posthocRows = result.posthoc.map((pair) => ({
    contrast: copy('{s1} − {s2}', { s1: pair.a, s2: pair.b }),
    difference: pair.difference,
    se: pair.se,
    t: pair.t,
    p: pair.p,
    pHolm: pair.pHolm,
  }));

  return [
    {
      id: 'ancova-model',
      title: copy('ANCOVA — effetti (SS tipo III)'),
      subtitle: copy('{s1} ~ {s2} + {s3} · N = {s4}', { s1: responseName, s2: factorName, s3: covariateNames.join(' + '), s4: result.n }),
      columns: [
        { key: 'source', label: copy('Sorgente'), format: 'text' },
        { key: 'ss', label: copy('SS'), format: 'dec3' },
        { key: 'df', label: copy('df'), format: 'dec1' },
        { key: 'ms', label: copy('MS'), format: 'dec3' },
        { key: 'f', label: copy('F'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'etaP', label: copy('η²p'), format: 'dec3' },
      ],
      rows: modelRows,
      notes: [
        copy('SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).'),
        copy('Modello: F({s1}, {s2}) = {s3}, p = {s4} · R² = {s5}, R²adj = {s6}, RMSE = {s7}.', { s1: result.modelDf, s2: result.dfError, s3: fmtEst(result.modelF, 3), s4: fmtP(result.modelP), s5: fmtEst(result.r2, 3), s6: fmtEst(result.adjR2, 3), s7: fmtEst(result.rmse, 3) }),
      ],
    },
    {
      id: 'ancova-means',
      title: copy('Medie aggiustate per gruppo'),
      subtitle: copy('valutate alla media delle covariate · CI {s1}%', { s1: level }),
      columns: [
        { key: 'group', label: copy('Gruppo'), format: 'text' },
        { key: 'n', label: copy('N'), format: 'int' },
        { key: 'rawMean', label: copy('Media grezza'), format: 'dec3' },
        { key: 'adjusted', label: copy('Media aggiustata'), format: 'dec3' },
        { key: 'se', label: copy('SE'), format: 'dec3' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
      ],
      rows: result.groups.map((group, index) => ({
        group,
        n: result.groupNs[index],
        rawMean: result.rawMeans[index],
        adjusted: result.adjustedMeans[index],
        se: result.adjustedSe[index],
        ciLo: result.adjustedMeans[index] - crit * result.adjustedSe[index],
        ciHi: result.adjustedMeans[index] + crit * result.adjustedSe[index],
      })),
      notes: [
        copy('Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.'),
        copy('La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.'),
      ],
    },
    {
      id: 'ancova-coefficients',
      title: copy('Coefficienti del modello'),
      subtitle: copy('codifica treatment · riferimento: {s1}', { s1: result.groups[0] }),
      columns: [
        { key: 'term', label: copy('Termine'), format: 'text' },
        { key: 'b', label: copy('B'), format: 'dec3' },
        { key: 'se', label: copy('SE'), format: 'dec3' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec3' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec3' },
      ],
      rows: coefficientRows,
      notes: [
        copy('L’intercetta è la media aggiustata del gruppo di riferimento ({s1}).', { s1: result.groups[0] }),
        copy('I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.'),
      ],
    },
    {
      id: 'ancova-slopes',
      title: copy('Omogeneità delle pendenze'),
      columns: [
        { key: 'metric', label: copy('Metrica'), format: 'text' },
        { key: 'value', label: copy('Valore'), format: 'dec4' },
        { key: 'detail', label: copy('Dettaglio'), format: 'text' },
      ],
      rows: [
        { metric: copy('F interazione'), value: result.slopesF, detail: copy('{s1} × covariate', { s1: factorName }) },
        { metric: copy('df numeratore'), value: result.slopesDf1, detail: copy('(k−1) × numero di covariate') },
        { metric: copy('df denominatore'), value: result.slopesDf2, detail: copy('residui del modello con interazioni') },
        { metric: copy('p interazione'), value: result.slopesP, detail: copy('p > α: pendenze compatibili') },
      ],
      notes: [
        copy('Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.'),
        copy('Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.'),
      ],
    },
    ...(posthocRows.length > 0
      ? [
          {
            id: 'ancova-posthoc',
            title: copy('Confronti a coppie (medie aggiustate)'),
            subtitle: copy('correzione Holm'),
            columns: [
              { key: 'contrast', label: copy('Confronto'), format: 'text' as const },
              { key: 'difference', label: copy('Differenza'), format: 'dec3' as const },
              { key: 'se', label: copy('SE'), format: 'dec3' as const },
              { key: 't', label: copy('t'), format: 'dec3' as const },
              { key: 'p', label: copy('p'), format: 'p' as const },
              { key: 'pHolm', label: copy('p Holm'), format: 'p' as const },
            ],
            rows: posthocRows,
            notes: [
              copy('Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.'),
              copy('p non corretti da t con df = {s1}; la colonna Holm controlla il numero di confronti.', { s1: result.dfError }),
            ],
          },
        ]
      : []),
  ];
};
