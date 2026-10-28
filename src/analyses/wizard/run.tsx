import { Compass } from 'lucide-react';
import { ResultTables } from '../../components/ResultTable';
import { goalLabel, runWizard } from '../../stats/wizard';
import type { GridData } from '../../grid/types';
import type { WizardParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { wizardGrid } from './defaults';

export interface WizardInput {
  grid: GridData;
  params: WizardParams;
  ciLevel: number;
}

/** Raccomandazione + tabelle del percorso scelto nel wizard. */
export const buildWizardOutput = ({ grid, params, ciLevel }: WizardInput): AnalysisRunResult => {
  const analysisGrid = wizardGrid(grid);
  const analysis = runWizard({
    columns: analysisGrid.cols,
    rows: analysisGrid.rows,
    selection: {
      goal: params.goal,
      outcome: params.outcome,
      group: params.group,
      second: params.second,
      paired: params.paired,
    },
    level: ciLevel,
  });
  const { recommendation } = analysis;

  return {
    ok: true,
    tables: analysis.tables,
    report: analysis.report,
    node: (
      <div className="mb-6">
        <p className="text-[10px] text-text3 font-mono mb-3">
          {`Domanda: ${goalLabel(params.goal)} · raccomandazione: ${recommendation.tabLabel} · ${recommendation.title}`}
        </p>
        <section className="mb-6 border border-border2 rounded-lg p-4 bg-surface3/30">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-3.5 h-3.5 text-accent2" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-text3">
              Raccomandazione
            </span>
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent2/30 bg-accent2/10 text-accent2">
              {recommendation.tabLabel}
            </span>
          </div>
          <h3 className="text-[13px] text-text font-semibold mb-1">{recommendation.title}</h3>
          <p className="text-[11px] text-text2 leading-relaxed">{recommendation.headline}</p>
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {recommendation.why.map((reason, index) => (
              <li key={index} className="text-[11px] text-text2 leading-relaxed">
                {reason}
              </li>
            ))}
          </ul>
        </section>
        <ResultTables specs={analysis.tables} />
      </div>
    ),
  };
};
