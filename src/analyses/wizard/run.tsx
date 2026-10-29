import { goalLabel, runWizard } from '../../stats/wizard';
import { copy } from '../../stats/reportCopy';
import type { Dataset } from '../../grid/types';
import type { WizardParams } from '../../io/project';
import type { AnalysisRunResult } from '../types';
import { wizardGrid } from './defaults';

export interface WizardInput {
  grid: Dataset;
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
    title: copy('Guidami nella scelta'),
    header: `${copy('Domanda')}: ${goalLabel(params.goal)} · ${copy('raccomandazione')}: ${recommendation.tabLabel} · ${recommendation.title}`,
    tables: analysis.tables,
    report: analysis.report,
    callout: {
      title: copy('Raccomandazione'),
      badge: recommendation.tabLabel,
      headline: recommendation.title,
      bullets: recommendation.why,
    },
  };
};
