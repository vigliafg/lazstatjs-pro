import { columnLabel } from '../../grid/types';
import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, isGroupColumn } from '../../grid/types';
import type { CategoryLevel, GridData } from '../../grid/types';
import { LevelsEditor } from '../../grid/LevelsEditor';
import type { AnovaParams } from '../../io/project';

export interface AnovaFormProps {
  grid: GridData;
  anovaParams: AnovaParams;
  setAnovaParams: Dispatch<SetStateAction<AnovaParams>>;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
}

export const AnovaForm = ({ grid, anovaParams, setAnovaParams, onLevels, onRecode }: AnovaFormProps) => (
  <>
      <>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Dependent Var</label>
          <select 
            aria-label="ANOVA dependent variable"
            className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
            value={anovaParams.dep}
            onChange={(e) => setAnovaParams(p => ({ ...p, dep: parseInt(e.target.value) }))}
          >
            {grid.cols.map((c, i) => <option key={i} value={i}>{columnLabel(c)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Group Var</label>
          <div className="flex items-center gap-1">
            <select 
              aria-label="ANOVA group variable"
              className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
              value={anovaParams.grp}
              onChange={(e) => setAnovaParams(p => ({ ...p, grp: parseInt(e.target.value) }))}
            >
              {groupColumnIndexes(grid).map((i) => (
                <option key={i} value={i}>{columnLabel(grid.cols[i])}</option>
              ))}
              {!isGroupColumn(grid, anovaParams.grp) && grid.cols[anovaParams.grp] && (
                <option value={anovaParams.grp}>{columnLabel(grid.cols[anovaParams.grp])} (numeric)</option>
              )}
            </select>
            <LevelsEditor
              grid={grid}
              column={anovaParams.grp}
              onLevels={onLevels}
              onRecode={onRecode}
              label="Modifica livelli"
              className="tb-btn flex items-center gap-1 h-[29px] px-2 text-[10px] whitespace-nowrap"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Post-Hoc</label>
          <select 
            className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
            value={anovaParams.posthoc}
            onChange={(e) => setAnovaParams(p => ({ ...p, posthoc: e.target.value as any }))}
          >
            <option value="none">None</option>
            <option value="tukey">Tukey–Kramer (approx.)</option>
            <option value="bonferroni">Bonferroni</option>
            <option value="holm">Holm</option>
            <option value="gameshowell">Games–Howell</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">Non-Parametric</label>
          <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer h-full pt-1">
            <input 
              type="checkbox" 
              className="accent-accent" 
              checked={anovaParams.useNonParam}
              onChange={(e) => setAnovaParams(p => ({ ...p, useNonParam: e.target.checked }))}
            />
            Kruskal-Wallis H
          </label>
        </div>
        {anovaParams.useNonParam && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">K-W Post-Hoc</label>
            <select 
              className="bg-surface3 border border-border2 text-text text-[11px] p-1.5 rounded min-w-[120px]"
              value={anovaParams.kwPosthoc}
              onChange={(e) => setAnovaParams(p => ({ ...p, kwPosthoc: e.target.value as any }))}
            >
              <option value="none">None</option>
              <option value="bonferroni">Bonferroni</option>
              <option value="holm">Holm</option>
            </select>
          </div>
        )}
      </>
  </>
);
