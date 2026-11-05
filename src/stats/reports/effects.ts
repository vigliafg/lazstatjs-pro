import { copy } from '../reportCopy';
import { fmtEst, fmtP } from '../format';
import type { ReportSection } from './shared';
import type { TableSpec } from '../types';

/** Sezione di prosa che racconta gli effetti LR di una tabella. */
export const lrEffectsSection = (
  tables: TableSpec[],
  id: string,
  level: number
): ReportSection | null => {
  const rows = tables.find(table => table.id === id)?.rows ?? [];
  if (rows.length === 0) return null;
  const bullets = rows.map(row =>
    copy('{s1}: LR χ² = {s2} con {s3} df ({s4}).', {
      s1: String(row.term),
      s2: fmtEst(Number(row.lr), 3),
      s3: Number(row.df),
      s4: fmtP(Number(row.p)),
    })
  );
  bullets.push(
    copy('Il test LR confronta il modello completo con quello senza il termine: 2·(log-verosimiglianza completa − ridotta) con p dalla χ². È più affidabile del Wald quando gli effetti sono forti o il campione è piccolo.')
  );
  return { heading: copy('Effetti (test LR)'), bullets };
};
