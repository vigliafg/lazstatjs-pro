import { copy } from '../reportCopy';
import type { LrEffect } from '../kernels/effects';
import type { TableSpec } from '../types';

/** Tabella degli effetti con test LR, condivisa dalle procedure non lineari. */
export const lrEffectsTable = (id: string, effects: LrEffect[]): TableSpec => ({
  id,
  title: copy('Effetti (test LR)'),
  columns: [
    { key: 'term', label: copy('Termine'), format: 'text' },
    { key: 'df', label: copy('df'), format: 'int', align: 'right' },
    { key: 'lr', label: copy('LR ChiSquare'), format: 'dec3', align: 'right' },
    { key: 'p', label: copy('p'), format: 'p', align: 'right' },
  ],
  rows: effects.map(effect => ({
    term: effect.term,
    df: effect.df,
    lr: effect.lr,
    p: effect.p,
  })),
  notes: [
    copy('2·(log-verosimiglianza completa − senza il termine); df = differenza di parametri.'),
  ],
});
