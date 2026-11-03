import { copy } from '../reportCopy';
import type { TableSpec } from '../types';
import type { RegressionStats } from '../kernels/regression';
import type { StepwiseResult, SubsetModel } from '../kernels/selection';

const actionLabel = (action: string): string => {
  if (action === 'add') return copy('Aggiunta');
  if (action === 'remove') return copy('Rimozione');
  if (action === 'start') return copy('Partenza');
  return copy('Stop');
};

export const selectionTables = (
  models: SubsetModel[],
  stepwise: StepwiseResult,
  names: string[],
  final: RegressionStats | null,
  level: number
): TableSpec[] => {
  const variableName = (index: number): string => names[index] ?? `X${index + 1}`;
  const tables: TableSpec[] = [
    {
      id: 'selection-subsets',
      title: copy('Migliori sottoinsiemi'),
      subtitle: copy('Un modello per dimensione · criterio: {s1}', {
        s1: stepwise.criterion.toUpperCase(),
      }),
      columns: [
        { key: 'size', label: copy('Variabili'), format: 'int' },
        { key: 'variables', label: copy('Predittori'), format: 'text' },
        { key: 'r2', label: 'R²', format: 'dec4' },
        { key: 'adjR2', label: 'R² adattato', format: 'dec4' },
        { key: 'aic', label: 'AIC', format: 'dec2' },
        { key: 'bic', label: 'BIC', format: 'dec2' },
        { key: 'cp', label: 'Cp', format: 'dec3' },
      ],
      rows: models.map(model => ({
        size: model.k,
        variables: model.variables.map(variableName).join(', '),
        r2: model.r2,
        adjR2: model.adjR2,
        aic: model.aic,
        bic: model.bic,
        cp: model.cp,
      })),
      notes: [
        copy('La ricerca esaustiva valuta tutti i sottoinsiemi fino a un massimo di 8 predittori; oltre quella soglia il costo cresce rapidamente.'),
        copy('Cp confronta ogni modello con il modello completo: valori vicini al numero di parametri indicano un buon compromesso.'),
      ],
    },
    {
      id: 'selection-steps',
      title: copy('Percorso stepwise'),
      subtitle: copy('Direzione: {s1}', { s1: stepwise.direction }),
      columns: [
        { key: 'step', label: '#', format: 'int' },
        { key: 'action', label: copy('Azione'), format: 'text' },
        { key: 'variable', label: copy('Variabile'), format: 'text' },
        { key: 'r2', label: 'R²', format: 'dec4' },
        { key: 'adjR2', label: 'R² adattato', format: 'dec4' },
        { key: 'aic', label: 'AIC', format: 'dec2' },
        { key: 'bic', label: 'BIC', format: 'dec2' },
      ],
      rows: stepwise.steps.map(step => ({
        step: step.step,
        action: actionLabel(step.action),
        variable: step.variable === null ? '—' : variableName(step.variable),
        r2: step.r2,
        adjR2: step.adjR2,
        aic: step.aic,
        bic: step.bic,
      })),
    },
  ];

  if (final) {
    tables.push({
      id: 'selection-model',
      title: copy('Modello selezionato'),
      subtitle: copy('CI {s1}%', { s1: level }),
      columns: [
        { key: 'predictor', label: copy('Predittore'), format: 'text' },
        { key: 'b', label: copy('B'), format: 'dec4' },
        { key: 'se', label: copy('SE'), format: 'dec4' },
        { key: 't', label: copy('t'), format: 'dec3' },
        { key: 'p', label: copy('p'), format: 'p' },
        { key: 'ciLo', label: copy('CI low'), format: 'dec4' },
        { key: 'ciHi', label: copy('CI high'), format: 'dec4' },
      ],
      rows: [
        {
          predictor: '(Intercept)',
          b: final.intercept.b,
          se: final.intercept.se,
          t: final.intercept.t,
          p: final.intercept.p,
          ciLo: final.intercept.ciLo,
          ciHi: final.intercept.ciHi,
        },
        ...final.coefficients.map((coefficient, index) => ({
          predictor: variableName(stepwise.selected[index]),
          b: coefficient.b,
          se: coefficient.se,
          t: coefficient.t,
          p: coefficient.p,
          ciLo: coefficient.ciLo,
          ciHi: coefficient.ciHi,
        })),
      ],
      notes: [
        copy('R² = {s1}; R² adattato = {s2}; F = {s3}; p = {s4}.', {
          s1: final.r2.toFixed(4),
          s2: final.adjR2.toFixed(4),
          s3: final.f.toFixed(3),
          s4: final.pF.toPrecision(3),
        }),
      ],
    });
  }

  return tables;
};
