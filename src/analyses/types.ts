import type { ReportSpec } from '../stats/report';
import type { TableSpec } from '../stats/types';
import type { AnalysisChart } from '../stats/charts';

/**
 * Contratto unico di esecuzione di un'analisi.
 *
 * I builder restituiscono o l'output pronto per la console, oppure il motivo
 * del rifiuto (dati insufficienti, parametri non validi). Non conoscono né la
 * console né i toast: l'App decide come mostrare l'errore. `title`, `tables`,
 * `report` e `charts` sono serializzabili e attraversano un Web Worker.
 *
 */
export type AnalysisRunResult =
  | {
      ok: true;
      title?: string;
      tables: TableSpec[];
      report: ReportSpec | null;
      charts?: AnalysisChart[];
      header?: string;
      /** Non-blocking data-quality notes shown above the tables. */
      warnings?: string[];
      /** Structured recommendation (wizard) rendered above the tables. */
      callout?: {
        title: string;
        badge?: string;
        headline: string;
        bullets?: string[];
      };
    }
  | { ok: false; reason: string };
