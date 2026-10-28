import { fmtEst, fmtP, interpretEta } from '../format';
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
    term: termNames[index] ?? `Termine ${index + 1}`,
    b: value,
    se: result.coefSe[index],
    t: result.coefT[index],
    p: result.coefP[index],
    ciLo: value - crit * result.coefSe[index],
    ciHi: value + crit * result.coefSe[index],
  }));

  const posthocRows = result.posthoc.map((pair) => ({
    contrast: `${pair.a} − ${pair.b}`,
    difference: pair.difference,
    se: pair.se,
    t: pair.t,
    p: pair.p,
    pHolm: pair.pHolm,
  }));

  return [
    {
      id: 'ancova-model',
      title: 'ANCOVA — effetti (SS tipo III)',
      subtitle: `${responseName} ~ ${factorName} + ${covariateNames.join(' + ')} · N = ${result.n}`,
      columns: [
        { key: 'source', label: 'Sorgente', format: 'text' },
        { key: 'ss', label: 'SS', format: 'dec3' },
        { key: 'df', label: 'df', format: 'dec1' },
        { key: 'ms', label: 'MS', format: 'dec3' },
        { key: 'f', label: 'F', format: 'dec3' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'etaP', label: 'η²p', format: 'dec3' },
      ],
      rows: modelRows,
      notes: [
        'SS tipo III: ogni termine è testato togliendolo dal modello completo (fattore e covariate insieme).',
        `Modello: F(${result.modelDf}, ${result.dfError}) = ${fmtEst(result.modelF, 3)}, p = ${fmtP(result.modelP)} · R² = ${fmtEst(result.r2, 3)}, R²adj = ${fmtEst(result.adjR2, 3)}, RMSE = ${fmtEst(result.rmse, 3)}.`,
      ],
    },
    {
      id: 'ancova-means',
      title: 'Medie aggiustate per gruppo',
      subtitle: `valutate alla media delle covariate · CI ${level}%`,
      columns: [
        { key: 'group', label: 'Gruppo', format: 'text' },
        { key: 'n', label: 'N', format: 'int' },
        { key: 'rawMean', label: 'Media grezza', format: 'dec3' },
        { key: 'adjusted', label: 'Media aggiustata', format: 'dec3' },
        { key: 'se', label: 'SE', format: 'dec3' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
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
        'Media aggiustata = valore atteso del gruppo con tutte le covariate al loro valore medio.',
        'La differenza tra media grezza e aggiustata mostra quanto pesa lo sbilanciamento delle covariate tra i gruppi.',
      ],
    },
    {
      id: 'ancova-coefficients',
      title: 'Coefficienti del modello',
      subtitle: `codifica treatment · riferimento: ${result.groups[0]}`,
      columns: [
        { key: 'term', label: 'Termine', format: 'text' },
        { key: 'b', label: 'B', format: 'dec3' },
        { key: 'se', label: 'SE', format: 'dec3' },
        { key: 't', label: 't', format: 'dec3' },
        { key: 'p', label: 'p', format: 'p' },
        { key: 'ciLo', label: 'CI low', format: 'dec3' },
        { key: 'ciHi', label: 'CI high', format: 'dec3' },
      ],
      rows: coefficientRows,
      notes: [
        `L’intercetta è la media aggiustata del gruppo di riferimento (${result.groups[0]}).`,
        'I coefficienti dei gruppi sono differenze aggiustate rispetto al riferimento; quelli delle covariate sono pendenze comuni.',
      ],
    },
    {
      id: 'ancova-slopes',
      title: 'Omogeneità delle pendenze',
      columns: [
        { key: 'metric', label: 'Metrica', format: 'text' },
        { key: 'value', label: 'Valore', format: 'dec4' },
        { key: 'detail', label: 'Dettaglio', format: 'text' },
      ],
      rows: [
        { metric: 'F interazione', value: result.slopesF, detail: `${factorName} × covariate` },
        { metric: 'df numeratore', value: result.slopesDf1, detail: '(k−1) × numero di covariate' },
        { metric: 'df denominatore', value: result.slopesDf2, detail: 'residui del modello con interazioni' },
        { metric: 'p interazione', value: result.slopesP, detail: 'p > α: pendenze compatibili' },
      ],
      notes: [
        'Se l’interazione è significativa le pendenze differiscono tra i gruppi: l’ANCOVA classica non è appropriata.',
        'Il test confronta il modello completo con e senza tutti i prodotti gruppo × covariata.',
      ],
    },
    ...(posthocRows.length > 0
      ? [
          {
            id: 'ancova-posthoc',
            title: 'Confronti a coppie (medie aggiustate)',
            subtitle: 'correzione Holm',
            columns: [
              { key: 'contrast', label: 'Confronto', format: 'text' as const },
              { key: 'difference', label: 'Differenza', format: 'dec3' as const },
              { key: 'se', label: 'SE', format: 'dec3' as const },
              { key: 't', label: 't', format: 'dec3' as const },
              { key: 'p', label: 'p', format: 'p' as const },
              { key: 'pHolm', label: 'p Holm', format: 'p' as const },
            ],
            rows: posthocRows,
            notes: [
              'Differenza = media aggiustata del primo gruppo − media aggiustata del secondo.',
              `p non corretti da t con df = ${result.dfError}; la colonna Holm controlla il numero di confronti.`,
            ],
          },
        ]
      : []),
  ];
};
