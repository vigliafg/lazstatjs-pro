import { t } from '../../i18n';
import { variableOptionsFrom } from '../../components/FormFields';
import { continuousColumnIndexes } from '../shared/columns';
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
        label={t('form.dependentVar')}
        ariaLabel="ANOVA dependent variable"
        value={anovaParams.dep}
        options={variableOptionsFrom(grid.cols, continuousColumnIndexes(grid))}
        onChange={value => setAnovaParams(previous => ({ ...previous, dep: value }))}
      />
      <VariableSelect
        label={t('form.groupVar')}
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
            label={t('action.levels')}
            className="tb-btn flex h-[29px] items-center gap-1 whitespace-nowrap px-2 text-[10px]"
          />
        }
      />
      <Field label={t('form.postHoc')}>
        <select
          aria-label={t('form.postHoc')}
          className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={anovaParams.posthoc}
          onChange={event =>
            setAnovaParams(previous => ({ ...previous, posthoc: event.target.value }))
          }
        >
          <option value="none">{t('posthoc.none')}</option>
          <option value="tukey">{t('posthoc.tukey')}</option>
          <option value="bonferroni">{t('posthoc.bonferroni')}</option>
          <option value="holm">{t('posthoc.holm')}</option>
          <option value="gameshowell">{t('posthoc.gameshowell')}</option>
        </select>
      </Field>
      <Advanced>
        <CheckboxField
          label={t('form.kruskalWallis')}
          checked={anovaParams.useNonParam}
          onChange={checked => setAnovaParams(previous => ({ ...previous, useNonParam: checked }))}
          hint={t('hint.anova')}
        />
        {anovaParams.useNonParam && (
          <Field label={t('form.kwPostHoc')}>
            <select
              aria-label={t('form.kwPostHoc')}
              className="min-w-[120px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
              value={anovaParams.kwPosthoc}
              onChange={event =>
                setAnovaParams(previous => ({
                  ...previous,
                  kwPosthoc: event.target.value as AnovaParams['kwPosthoc'],
                }))
              }
            >
              <option value="none">{t('posthoc.none')}</option>
              <option value="bonferroni">{t('posthoc.bonferroni')}</option>
              <option value="holm">{t('posthoc.holm')}</option>
              <option value="fdr">{t('posthoc.fdr')}</option>
            </select>
          </Field>
        )}
      </Advanced>
    </>
  );
};
