import type { Dispatch, SetStateAction } from 'react';
import type { CategoryLevel, GridData } from '../../grid/types';
import type { GlmmParams } from '../../io/project';
import { Field, GroupSelect, VariableList, VariableSelect, variableOptionsFrom } from '../../components/FormFields';
import { t } from '../../i18n';
import { continuousColumnIndexes } from '../shared/columns';

export interface GlmmFormProps {
  grid: GridData;
  glmmParams: GlmmParams;
  setGlmmParams: Dispatch<SetStateAction<GlmmParams>>;
  onLevels: (column: number, levels: CategoryLevel[], reference?: string) => void;
  onRecode: (column: number, mapping: Record<string, string>) => void;
}

const familyLink = (family: GlmmParams['family']): GlmmParams['link'] =>
  family === 'binomial' ? 'logit' : family === 'poisson' ? 'log' : 'identity';

export const GlmmForm = ({
  grid,
  glmmParams,
  setGlmmParams,
  onLevels,
  onRecode,
}: GlmmFormProps) => {
  const { dep, indeps, group, family, slope } = glmmParams;
  const numericColumns = continuousColumnIndexes(grid);
  return (
    <div className="flex flex-col gap-3">
      <VariableSelect
        label={t('form.outcomeY')}
        value={dep}
        options={variableOptionsFrom(grid.cols, numericColumns)}
        onChange={value =>
          setGlmmParams(previous => ({
            ...previous,
            dep: value,
            indeps: previous.indeps.filter(index => index !== value),
          }))
        }
      />
      <VariableList
        label={t('form.fixedPredictors')}
        cols={grid.cols}
        only={numericColumns}
        emptyText={t('form.noNumericColumns')}
        selected={indeps}
        disabled={[dep, group]}
        showType
        onToggle={(column, checked) =>
          setGlmmParams(previous => ({
            ...previous,
            indeps: checked
              ? [...previous.indeps, column]
              : previous.indeps.filter(index => index !== column),
          }))
        }
      />
      <GroupSelect
        label={t('form.groupRandomIntercept')}
        grid={grid}
        value={group}
        onChange={value =>
          setGlmmParams(previous => ({
            ...previous,
            group: value,
            slope: previous.slope === value ? -1 : previous.slope,
          }))
        }
        onLevels={onLevels}
        onRecode={onRecode}
      />
      <Field label={t('form.family')}>
        <select
          aria-label={t('form.family')}
          className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={family}
          onChange={event => {
            const next = event.target.value as GlmmParams['family'];
            setGlmmParams(previous => ({ ...previous, family: next, link: familyLink(next) }));
          }}
        >
          <option value="gaussian">{t('form.gaussian')}</option>
          <option value="binomial">{t('form.binomial')}</option>
          <option value="poisson">{t('form.poisson')}</option>
        </select>
      </Field>
      <Field label={t('form.randomSlope')}>
        <select
          aria-label={t('form.randomSlope')}
          className="min-w-[170px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={slope >= 0 ? slope : -1}
          onChange={event =>
            setGlmmParams(previous => ({ ...previous, slope: Number(event.target.value) }))
          }
        >
          <option value={-1}>{t('form.randomInterceptOnly')}</option>
          {numericColumns
            .filter(column => column !== dep && column !== group)
            .map(column => (
              <option key={column} value={column}>
                {grid.cols[column]?.name ?? `X${column + 1}`}
              </option>
            ))}
        </select>
      </Field>
    </div>
  );
};
