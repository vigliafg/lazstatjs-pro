import type { ReactNode } from 'react';
import type { ReportSpec } from '../stats/report';
import type { TableSpec } from '../stats/types';
import type { AnalysisChart } from '../stats/charts';

/**
 * Contratto unico di esecuzione di un'analisi.
 *
 * I builder restituiscono o l'output pronto per la console, oppure il motivo
 * del rifiuto (dati insufficienti, parametri non validi). Non conoscono né la
 * console né i toast: l'App decide come mostrare l'errore. `tables`, `report`
 * e `charts` sono serializzabili: lo stesso risultato può attraversare un Web
 * Worker, mentre `node` resta il percorso sincrono già collaudato.
 */
export type AnalysisRunResult =
  | {
      ok: true;
      node?: ReactNode;
      tables: TableSpec[];
      report: ReportSpec | null;
      charts?: AnalysisChart[];
      header?: string;
    }
  | { ok: false; reason: string };
