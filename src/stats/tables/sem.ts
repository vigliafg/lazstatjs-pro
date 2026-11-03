import { copy } from '../reportCopy';
import { fmtEst } from '../format';
import type { SemResult } from '../sem/types';
import type { TableSpec } from '../types';

export const semTables = (result: SemResult): TableSpec[] => {
  const fit: TableSpec = {
    id: 'sem-fit',
    title: copy('Indici di adattamento'),
    subtitle: copy('Stima ML su {s1} osservazioni', { s1: result.fit.n }),
    columns: [
      { key: 'measure', label: copy('Misura'), align: 'left' },
      { key: 'value', label: copy('Valore'), align: 'right' },
    ],
    rows: [
      { measure: copy('χ²'), value: fmtEst(result.fit.chi2, 3) },
      { measure: copy('Gradi di libertà'), value: String(result.fit.df) },
      { measure: copy('p'), value: fmtEst(result.fit.p, 3) },
      { measure: 'CFI', value: fmtEst(result.fit.cfi, 3) },
      { measure: 'TLI', value: fmtEst(result.fit.tli, 3) },
      { measure: 'RMSEA', value: fmtEst(result.fit.rmsea, 3) },
      { measure: 'SRMR', value: fmtEst(result.fit.srmr, 3) },
      { measure: 'AIC', value: fmtEst(result.fit.aic, 2) },
      { measure: 'BIC', value: fmtEst(result.fit.bic, 2) },
      { measure: copy('Iterazioni'), value: String(result.fit.iterations) },
    ],
  };
  const loadings: TableSpec = {
    id: 'sem-loadings',
    title: copy('Carichi fattoriali'),
    subtitle: copy('Soluzione standardizzata'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'factor', label: copy('Fattore'), align: 'left' },
      { key: 'loading', label: copy('Carico'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
      { key: 'z', label: copy('z'), format: 'dec2', align: 'right' },
      { key: 'p', label: copy('p'), format: 'p', align: 'right' },
      { key: 'standardized', label: copy('Standardizzato'), format: 'dec3', align: 'right' },
      { key: 'r2', label: 'R²', format: 'dec3', align: 'right' },
    ],
    rows: result.loadings.map(item => ({ ...item })),
  };
  const uniqueness: TableSpec = {
    id: 'sem-uniqueness',
    title: copy('Varianze residue'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      { key: 'uniqueness', label: copy('Unicità'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
    ],
    rows: result.uniqueness.map(item => ({ ...item })),
  };
  const factors: TableSpec = {
    id: 'sem-factors',
    title: copy('Relazioni tra fattori'),
    columns: [
      { key: 'factor', label: copy('Fattore'), align: 'left' },
      { key: 'other', label: copy('Con'), align: 'left' },
      { key: 'correlation', label: result.structural ? copy('Coefficiente') : copy('Correlazione'), format: 'dec3', align: 'right' },
      { key: 'se', label: copy('SE'), format: 'dec3', align: 'right' },
    ],
    rows: result.factors.flatMap(factor =>
      factor.correlations.map(item => ({
        factor: factor.name,
        other: item.factor,
        correlation: item.correlation,
        se: item.se,
      }))
    ),
  };
  const residualTable: TableSpec = {
    id: 'sem-residuals',
    title: copy('Residui di covarianza'),
    columns: [
      { key: 'variable', label: copy('Variabile'), align: 'left' },
      ...result.variables.map((name, index) => ({
        key: `v${index}`,
        label: name,
        format: 'dec3' as const,
        align: 'right' as const,
      })),
    ],
    rows: result.residuals.map((row, index) => ({
      variable: result.variables[index] ?? `V${index + 1}`,
      ...Object.fromEntries(row.map((value, column) => [`v${column}`, value])),
    })),
  };
  return [fit, loadings, uniqueness, factors, residualTable];
};
