import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ReliabilityParams } from '../../io/project';
import { t } from '../../i18n';
import { Field, VariableSelect, variableOptions } from '../../components/FormFields';

export interface ReliabilityFormProps {
  grid: GridData;
  reliabilityParams: ReliabilityParams;
  setReliabilityParams: Dispatch<SetStateAction<ReliabilityParams>>;
}

const inputClass =
  'w-16 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text';
const buttonClass =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';

export const ReliabilityForm = ({
  grid,
  reliabilityParams,
  setReliabilityParams,
}: ReliabilityFormProps) => {
  const { mode, time, failures, stages } = reliabilityParams;
  const options = variableOptions(grid.cols);

  const updateStage = (stageIndex: number, componentIndex: number, value: string) =>
    setReliabilityParams(prev => ({
      ...prev,
      stages: prev.stages.map((stage, index) =>
        index === stageIndex
          ? stage.map((cell, position) => (position === componentIndex ? value : cell))
          : stage
      ),
    }));

  return (
    <div className="flex flex-col gap-3">
      <Field label={t('form.reliabilityMode')}>
        <select
          aria-label={t('form.reliabilityMode')}
          className="min-w-[240px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text"
          value={mode}
          onChange={input =>
            setReliabilityParams(prev => ({
              ...prev,
              mode: input.target.value as ReliabilityParams['mode'],
            }))
          }
        >
          <option value="growth">{t('form.reliabilityGrowth')}</option>
          <option value="rbd">{t('form.reliabilityRbd')}</option>
        </select>
      </Field>
      {mode === 'growth' ? (
        <>
          <VariableSelect
            label={t('form.time')}
            value={time}
            options={options}
            disabledValues={[failures]}
            onChange={value => setReliabilityParams(prev => ({ ...prev, time: value }))}
          />
          <VariableSelect
            label={t('form.failures')}
            value={failures}
            options={options}
            disabledValues={[time]}
            onChange={value => setReliabilityParams(prev => ({ ...prev, failures: value }))}
          />
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-text2">
            {t('form.stageReliabilities')}
          </span>
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex} className="flex items-center gap-2">
              <span className="w-16 font-mono text-[10px] text-text3">
                {t('form.stage')} {stageIndex + 1}
              </span>
              {stage.map((value, componentIndex) => (
                <input
                  key={componentIndex}
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  aria-label={`${t('form.component')} ${componentIndex + 1}`}
                  className={inputClass}
                  value={value}
                  onChange={input => updateStage(stageIndex, componentIndex, input.target.value)}
                />
              ))}
              <button
                type="button"
                className={buttonClass}
                onClick={() =>
                  setReliabilityParams(prev => ({
                    ...prev,
                    stages: prev.stages.map((item, index) =>
                      index === stageIndex ? [...item, '0.9'] : item
                    ),
                  }))
                }
              >
                + {t('form.component')}
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() =>
                  setReliabilityParams(prev => ({
                    ...prev,
                    stages: prev.stages.map((item, index) =>
                      index === stageIndex && item.length > 1 ? item.slice(0, -1) : item
                    ),
                  }))
                }
              >
                − {t('form.component')}
              </button>
              {stages.length > 1 && (
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() =>
                    setReliabilityParams(prev => ({
                      ...prev,
                      stages: prev.stages.filter((_, index) => index !== stageIndex),
                    }))
                  }
                >
                  {t('form.removeStage')}
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              className={buttonClass}
              onClick={() =>
                setReliabilityParams(prev => ({ ...prev, stages: [...prev.stages, ['0.9']] }))
              }
            >
              + {t('form.addStage')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
