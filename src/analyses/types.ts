import type { ReactNode } from 'react';
import type { ReportSpec } from '../stats/report';
import type { TableSpec } from '../stats/types';

/**
 * Contratto unico di esecuzione di un'analisi.
 *
 * I builder restituiscono o l'output pronto per la console, oppure il motivo
 * del rifiuto (dati insufficienti, parametri non validi). Non conoscono né la
 * console né i toast: l'App decide come mostrare l'errore. Questo è il primo
 * passo verso `AnalysisSpec` (fase 2 del piano).
 */
export type AnalysisRunResult =
  | { ok: true; node: ReactNode; tables: TableSpec[]; report: ReportSpec | null }
  | { ok: false; reason: string };
