import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ChiSqParams } from '../../io/project';
import { t } from '../../i18n';
import { CheckboxField } from '../../components/FormFields';

export interface ChiSquareFormProps {
  grid: GridData;
  chisqParams: ChiSqParams;
  setChisqParams: Dispatch<SetStateAction<ChiSqParams>>;
}

const cellClass =
  'w-20 rounded border border-border2 bg-surface text-center text-[11px] font-mono text-text p-1';
const smallButton =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';

const count = (value: string): number => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const ChiSquareForm = ({ chisqParams, setChisqParams }: ChiSquareFormProps) => {
  const update = (patch: Partial<ChiSqParams>) =>
    setChisqParams(prev => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-text3">{t('chisq.title')}</span>
      <div className="rounded border border-border2 bg-surface3 p-3">
        <table className="text-[11px] text-text2">
          <thead>
            <tr>
              <th className="p-1" />
              <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                {t('chisq.col1')}
              </th>
              <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                {t('chisq.col2')}
              </th>
            </tr>
            <tr>
              <th className="p-1" />
              <th className="p-1">
                <input
                  aria-label={t('chisq.col1')}
                  type="text"
                  className={`${cellClass} font-semibold`}
                  value={chisqParams.col1Label}
                  onChange={e => update({ col1Label: e.target.value })}
                />
              </th>
              <th className="p-1">
                <input
                  aria-label={t('chisq.col2')}
                  type="text"
                  className={`${cellClass} font-semibold`}
                  value={chisqParams.col2Label}
                  onChange={e => update({ col2Label: e.target.value })}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: chisqParams.row1Label,
                onLabel: (value: string) => update({ row1Label: value }),
                a: chisqParams.row1col1,
                b: chisqParams.row1col2,
                onA: (value: number) => update({ row1col1: value }),
                onB: (value: number) => update({ row1col2: value }),
              },
              {
                label: chisqParams.row2Label,
                onLabel: (value: string) => update({ row2Label: value }),
                a: chisqParams.row2col1,
                b: chisqParams.row2col2,
                onA: (value: number) => update({ row2col1: value }),
                onB: (value: number) => update({ row2col2: value }),
              },
            ].map((row, index) => (
              <tr key={index}>
                <td className="p-1">
                  <input
                    aria-label={`Row ${index + 1} label`}
                    type="text"
                    className={`${cellClass} text-left font-semibold`}
                    value={row.label}
                    onChange={e => row.onLabel(e.target.value)}
                  />
                </td>
                <td className="p-1">
                  <input
                    aria-label={`Row ${index + 1} column 1 count`}
                    type="number"
                    min="0"
                    className={cellClass}
                    value={row.a}
                    onChange={e => row.onA(count(e.target.value))}
                  />
                </td>
                <td className="p-1">
                  <input
                    aria-label={`Row ${index + 1} column 2 count`}
                    type="number"
                    min="0"
                    className={cellClass}
                    value={row.b}
                    onChange={e => row.onB(count(e.target.value))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center justify-between gap-1.5">
          <CheckboxField
            label={t('chisq.fisher')}
            checked={chisqParams.runFisherExact}
            onChange={checked => update({ runFisherExact: checked })}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              className={smallButton}
              onClick={() =>
                update({
                  row1col1: 30,
                  row1col2: 20,
                  row2col1: 15,
                  row2col2: 35,
                  row1Label: 'Treatment Group',
                  row2Label: 'Control Group',
                  col1Label: 'Improved',
                  col2Label: 'No Change',
                })
              }
            >
              {t('chisq.presetTrial')}
            </button>
            <button
              type="button"
              className={smallButton}
              onClick={() =>
                update({
                  row1col1: 120,
                  row1col2: 880,
                  row2col1: 90,
                  row2col2: 910,
                  row1Label: 'Variant A',
                  row2Label: 'Variant B',
                  col1Label: 'Converted',
                  col2Label: 'Bounced',
                })
              }
            >
              {t('chisq.presetAb')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
