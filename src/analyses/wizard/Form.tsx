import { columnLabel } from '../../grid/types';
import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { ArrowRight, Compass } from 'lucide-react';
import { analysisRows, groupColumnIndexes, type CategoryLevel, type GridData } from '../../grid/types';
import { LevelsEditor, LEVELS_BUTTON_CLASS } from '../../grid/LevelsEditor';
import type { WizardParams } from '../../io/project';
import {
  WIZARD_GOALS,
  profileColumns,
  runWizard,
  type WizardGoal,
} from '../../stats/wizard';
import { wizardGrid } from './defaults';

export interface WizardFormProps {
  grid: GridData;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
  onOpenAnalysis: (analysisId: string) => void;
  ciLevel: number;
  wizardParams: WizardParams;
  setWizardParams: Dispatch<SetStateAction<WizardParams>>;
}

const inputClass =
  'bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[150px]';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';

export const WizardForm = ({
  grid,
  onLevels,
  onRecode,
  onOpenAnalysis,
  ciLevel,
  wizardParams,
  setWizardParams,
}: WizardFormProps) => {
  const { goal, outcome, group, second, paired } = wizardParams;

  // Group columns are profiled on their labels: the recommendation text and
  // every table then speak the user's language ("Controllo"), not the codes.
  const analysisGrid = useMemo(() => wizardGrid(grid), [grid]);
  const profiles = useMemo(
    () => profileColumns(analysisGrid.cols, analysisGrid.rows),
    [analysisGrid]
  );
  const recommendation = useMemo(
    () =>
      runWizard({
        columns: analysisGrid.cols,
        rows: analysisGrid.rows,
        selection: { goal, outcome, group, second, paired },
        level: ciLevel,
      }).recommendation,
    [analysisGrid, goal, outcome, group, second, paired, ciLevel]
  );

  const needsOutcome = goal !== 'describe' && goal !== 'plan' && goal !== 'forecast';
  const needsGroup = goal === 'compare' || goal === 'survive';
  const needsSecond = goal === 'associate' || goal === 'predict';
  const setGoal = (next: WizardGoal) => setWizardParams(prev => ({ ...prev, goal: next }));

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-2">
        <span className={labelClass}>1 · Che domanda vuoi rispondere?</span>
        <div className="flex flex-wrap gap-2">
          {WIZARD_GOALS.map(option => (
            <button
              key={option.id}
              onClick={() => setGoal(option.id)}
              className={`px-3 py-2 rounded border text-left transition-colors ${
                goal === option.id
                  ? 'border-accent2 bg-accent2/10 text-text'
                  : 'border-border2 bg-surface3 text-text2 hover:text-text'
              }`}
              title={option.hint}
            >
              <span className="block text-[11px] font-semibold">{option.label}</span>
              <span className="block text-[9px] font-mono text-text3">{option.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        {needsOutcome && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>2 · Variabile di esito</label>
            <select
              className={inputClass}
              value={outcome}
              onChange={e => setWizardParams(prev => ({ ...prev, outcome: parseInt(e.target.value, 10) }))}
            >
              <option value={-1}>— seleziona —</option>
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>
                  {columnLabel(column)} ({profiles[index]?.kind ?? 'vuota'})
                </option>
              ))}
            </select>
          </div>
        )}

        {needsGroup && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Gruppi {goal === 'survive' ? '(opzionale)' : ''}
            </label>
            <div className="flex items-center gap-1">
              <select
                className={inputClass}
                value={group}
                onChange={e => setWizardParams(prev => ({ ...prev, group: parseInt(e.target.value, 10) }))}
              >
                <option value={-1}>— nessun gruppo —</option>
                {groupColumnIndexes(grid).map(index => (
                  <option key={index} value={index}>
                    {columnLabel(grid.cols[index])} ({profiles[index]?.unique ?? 0} livelli)
                  </option>
                ))}
              </select>
              <LevelsEditor
                grid={grid}
                column={group}
                onLevels={onLevels}
                onRecode={onRecode}
                label="Modifica livelli"
                className={LEVELS_BUTTON_CLASS}
              />
            </div>
          </div>
        )}

        {needsSecond && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>
              Seconda variabile {goal === 'predict' ? '(predittore)' : ''}
            </label>
            <select
              className={inputClass}
              value={second}
              onChange={e => setWizardParams(prev => ({ ...prev, second: parseInt(e.target.value, 10) }))}
            >
              <option value={-1}>— nessuna —</option>
              {grid.cols.map((column, index) => (
                <option key={index} value={index}>
                  {columnLabel(column)} ({profiles[index]?.kind ?? 'vuota'})
                </option>
              ))}
            </select>
          </div>
        )}

        {goal === 'compare' && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Disegno</label>
            <select
              className={inputClass}
              value={paired ? 'paired' : 'independent'}
              onChange={e => setWizardParams(prev => ({ ...prev, paired: e.target.value === 'paired' }))}
            >
              <option value="independent">Gruppi indipendenti</option>
              <option value="paired">Misure appaiate</option>
            </select>
          </div>
        )}
      </div>

      <section className="border border-accent2/30 bg-accent2/5 rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Compass className="w-3.5 h-3.5 text-accent2" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-text3">
            Raccomandazione
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent2/40 bg-accent2/10 text-accent2">
            {recommendation.tabLabel}
          </span>
        </div>
        <h3 className="text-[12px] text-text font-semibold mb-1">{recommendation.title}</h3>
        <p className="text-[11px] text-text2 leading-relaxed mb-2">{recommendation.headline}</p>
        {recommendation.checks.length > 0 && (
          <ul className="list-disc pl-4 space-y-1 mb-2">
            {recommendation.checks.slice(0, 3).map((check, index) => (
              <li key={index} className="text-[10px] text-text3 leading-relaxed">
                {check}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="tb-btn flex items-center gap-1"
            onClick={() => onOpenAnalysis(recommendation.analysis)}
          >
            Apri {recommendation.tabLabel} <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-[10px] text-text3 font-mono">
            Poi premi Run Analysis per eseguire l’analisi sulla scheda.
          </span>
        </div>
      </section>
    </div>
  );
};
