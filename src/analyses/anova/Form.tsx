import type { Dispatch, SetStateAction } from 'react';
import { groupColumnIndexes, isGroupColumn } from '../../grid/types';
import type { CategoryLevel, GridData } from '../../grid/types';
import { LevelsEditor } from '../../grid/LevelsEditor';
import type { AnovaParams } from '../../io/project';
import { Advanced, CheckboxField, Field, VariableSelect, variableOptions } from '../../components/FormFields';

export interface AnovaFormProps {
  grid: GridData;
  anovaParams: AnovaParams;
  setAnovaParams: Dispatch<SetStateAction<AnovaParams>>;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
}

export const AnovaForm = ({ grid, anovaParams, setAnovaParams, onLevels, onRecode }: AnovaFormProps) => {
  const groups = groupColumnIndexes(grid);
  const groupOptions = groups.map(index => ({
    value: index,
    label: grid.cols[index].label?.trim() || grid.cols[index].name,
  }));
  if (!isGroupColumn(grid, anovaParams.grp) && grid.cols[anovaParams.grp]) {
    groupOptions.push({
      value: anovaParams.grp,
      label: `${grid.cols[anovaParams.grp].name} (numeric)`,
    });
  }

  return (
    <>
      <VariableSelect
        label="Dependent Var"
        ariaLabel="ANOVA dependent variable"
        value={anovaParams.dep}
        options={variableOptions(grid.cols)}
        onChange={value => setAnovaParams(previous => ({ ...previous, dep: value }))}
      />
      <VariableSelect
        label="Group Var"
        ariaLabel="ANOVA group variable"
        value={anovaParams.grp}
        options={groupOptions}
        onChange={value => setAnovaParams(previous => ({ ...previous, grp: value }))}
        trailing={
          <LevelsEditor
            grid={grid}
            column={anovaParams.grp}
            onLevels={onLevels}
            onRecode={onRecode}
            label="Modifica livelli"
            className="tb-btn flex h-[29px] items-center gap-1 whitespace-nowrap px-2 text-[10px]"
          />
        }
      />
      <Field label="Post-Hoc">
        <select
          aria-label="ANOVA post-hoc"
          className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={anovaParams.posthoc}
          onChange={event =>
            setAnovaParams(previous => ({ ...previous, posthoc: event.target.value }))
          }
        >
          <option value="none">None</option>
          <option value="tukey">Tukey–Kramer (approx.)</option>
          <option value="bonferroni">Bonferroni</option>
          <option value="holm">Holm</option>
          <option value="gameshowell">Games–Howell</option>
        </select>
      </Field>
      <Advanced>
        <CheckboxField
          label="Kruskal-Wallis H"
          checked={anovaParams.useNonParam}
          onChange={checked => setAnovaParams(previous => ({ ...previous, useNonParam: checked }))}
          hint="Non-parametric alternative to the one-way ANOVA."
        />
        {anovaParams.useNonParam && (
          <Field label="K-W Post-Hoc">
            <select
              aria-label="Kruskal-Wallis post-hoc"
              className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={anovaParams.kwPosthoc}
              onChange={event =>
                setAnovaParams(previous => ({
                  ...previous,
                  kwPosthoc: event.target.value as AnovaParams['kwPosthoc'],
                }))
              }
            >
              <option value="none">None</option>
              <option value="bonferroni">Bonferroni</option>
              <option value="holm">Holm</option>
              <option value="fdr">FDR (BH)</option>
            </select>
          </Field>
        )}
      </Advanced>
    </>
  );
};
