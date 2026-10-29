import { fmtEst } from '../format';
import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { DistributionFit, DistributionName } from '../distfit/types';
import { DISTRIBUTION_LABEL } from '../distfit/types';
import { distributionQuantile, fitDistributions } from '../kernels/distfit';

// ---------------------------------------------------------------------------
// Tables and report
// ---------------------------------------------------------------------------

const paramText = (fit: DistributionFit): string =>
  Object.entries(fit.params)
    .map(([key, value]) => copy('{s1} = {s2}', { s1: key, s2: fmtEst(value, 4) }))
    .join(' · ');

export const distributionFitTables = (
  values: number[],
  selected: DistributionName[],
  level: number
): TableSpec[] => {
  const fits = fitDistributions(values, selected);
  if (fits.length === 0) return [];

  const tables: TableSpec[] = [];

  tables.push({
    id: 'fit-parameters',
    title: copy('Distribuzioni stimate'),
    subtitle: copy('ordinamento per AIC · N = {s1}', { s1: fits[0].n }),
    columns: [
      { key: 'distribution', label: copy('Distribuzione'), format: 'text' },
      { key: 'parameters', label: copy('Parametri (MLE)'), format: 'text' },
      { key: 'logLik', label: copy('Log-verosimiglianza'), format: 'dec3' },
      { key: 'k', label: copy('Parametri'), format: 'int' },
      { key: 'aic', label: copy('AIC'), format: 'dec2' },
      { key: 'bic', label: copy('BIC'), format: 'dec2' },
    ],
    rows: fits.map(fit => ({
      distribution: DISTRIBUTION_LABEL[fit.name],
      parameters: paramText(fit),
      logLik: fit.logLik,
      k: fit.k,
      aic: fit.aic,
      bic: fit.bic,
    })),
    notes: [
      copy('Le stime sono di massima verosimiglianza (MLE): scelgono i parametri che rendono i dati osservati più probabili.'),
      copy('AIC = 2k − 2·logL: più basso è, meglio la distribuzione spiega i dati tenendo conto del numero di parametri.'),
      copy('Confronta solo le righe con la stessa AIC (stesso dataset): le differenze sotto 2 sono trascurabili, sopra 10 sono nette.'),
    ],
  });

  tables.push({
    id: 'fit-gof',
    title: copy('Bontà di adattamento'),
    subtitle: copy('KS = Kolmogorov–Smirnov · AD = Anderson–Darling'),
    columns: [
      { key: 'distribution', label: copy('Distribuzione'), format: 'text' },
      { key: 'ks', label: copy('KS D'), format: 'dec4' },
      { key: 'ksP', label: copy('p KS (indicativo)'), format: 'p' },
      { key: 'ad', label: copy('AD A²'), format: 'dec3' },
    ],
    rows: fits.map(fit => ({
      distribution: DISTRIBUTION_LABEL[fit.name],
      ks: fit.ks,
      ksP: fit.ksP,
      ad: fit.ad,
    })),
    notes: [
      copy('Il p del KS è asintotico e non corretto per i parametri stimati: tende a essere ottimistico, usalo come indicazione.'),
      copy('KS misura la distanza massima tra la cumulata empirica e quella teorica; AD dà più peso alle code.'),
    ],
  });

  const best = fits[0];
  const percentiles = [0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99];
  tables.push({
    id: 'fit-percentiles',
    title: copy('Percentili della distribuzione migliore ({s1})', { s1: DISTRIBUTION_LABEL[best.name] }),
    subtitle: copy('CI {s1}% non applicabile ai percentili stimati', { s1: level }),
    columns: [
      { key: 'p', label: copy('Percentile'), format: 'text' },
      { key: 'value', label: copy('Valore stimato'), format: 'dec4' },
    ],
    rows: percentiles.map(p => ({
      p: copy('P{s1}', { s1: Math.round(p * 100) }),
      value: distributionQuantile(best, p),
    })),
    notes: [
      copy('I percentili sono quelli della distribuzione stimata, non i percentili osservati.'),
      copy('Con N piccolo le code sono le più incerte: evita di leggere P1 o P99 come limiti affidabili.'),
    ],
  });

  return tables;
};
