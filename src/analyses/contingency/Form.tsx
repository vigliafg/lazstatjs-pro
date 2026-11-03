import type { Dispatch, SetStateAction } from 'react';
import type { ContingencyParams } from '../../io/project';
import { t } from '../../i18n';
import { CheckboxField, Field } from '../../components/FormFields';

export interface ContingencyFormProps {
  contingencyParams: ContingencyParams;
  setContingencyParams: Dispatch<SetStateAction<ContingencyParams>>;
}

const PRESETS = {
  trial: {
    rows: ['Treatment', 'Control'],
    cols: ['Improved', 'Unchanged', 'Worse'],
    values: [
      ['42', '18', '6'],
      ['21', '34', '11'],
    ],
  },
  survey: {
    rows: ['North', 'Centre', 'South'],
    cols: ['Yes', 'No', 'Undecided'],
    values: [
      ['64', '41', '12'],
      ['52', '58', '15'],
      ['38', '47', '21'],
    ],
  },
};

const cellInput =
  'w-14 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text';
const labelInput =
  'w-20 rounded border border-border2 bg-surface p-1 text-[10px] font-semibold text-text';
const smallButton =
  'rounded border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-text3 hover:bg-border hover:text-text';
const selectClass =
  'min-w-[160px] rounded border border-border2 bg-surface3 p-1.5 text-[11px] text-text';

export const ContingencyForm = ({
  contingencyParams,
  setContingencyParams,
}: ContingencyFormProps) => {
  const { mode, rows, cols, values, exact, monteCarlo, strata, scores } = contingencyParams;

  const setCell = (row: number, column: number, value: string) => {
    setContingencyParams(prev => ({
      ...prev,
      values: prev.values.map((cells, ri) =>
        ri === row ? cells.map((cell, ci) => (ci === column ? value : cell)) : cells
      ),
    }));
  };

  const setColumnLabel = (column: number, value: string) =>
    setContingencyParams(prev => ({
      ...prev,
      cols: prev.cols.map((label, index) => (index === column ? value : label)),
    }));

  const setRowLabel = (row: number, value: string) =>
    setContingencyParams(prev => ({
      ...prev,
      rows: prev.rows.map((label, index) => (index === row ? value : label)),
    }));

  const addRow = () =>
    setContingencyParams(prev => ({
      ...prev,
      rows: [...prev.rows, `${t('contingency.row')} ${prev.rows.length + 1}`],
      values: [...prev.values, prev.cols.map(() => '0')],
      scores: [...prev.scores, String(prev.rows.length + 1)],
    }));

  const removeRow = () =>
    setContingencyParams(prev =>
      prev.rows.length <= 2
        ? prev
        : {
            ...prev,
            rows: prev.rows.slice(0, -1),
            values: prev.values.slice(0, -1),
            scores: prev.scores.slice(0, -1),
          }
    );

  const addCol = () =>
    setContingencyParams(prev => ({
      ...prev,
      cols: [...prev.cols, `${t('contingency.col')} ${prev.cols.length + 1}`],
      values: prev.values.map(row => [...row, '0']),
    }));

  const removeCol = () =>
    setContingencyParams(prev =>
      prev.cols.length <= 2
        ? prev
        : {
            ...prev,
            cols: prev.cols.slice(0, -1),
            values: prev.values.map(row => row.slice(0, -1)),
          }
    );

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const next = PRESETS[preset];
    setContingencyParams(prev => ({
      ...prev,
      rows: [...next.rows],
      cols: [...next.cols],
      values: next.values.map(row => [...row]),
      scores: next.rows.map((_, index) => String(index + 1)),
    }));
  };

  const setMode = (next: ContingencyParams['mode']) =>
    setContingencyParams(prev => ({
      ...prev,
      mode: next,
      scores:
        prev.scores.length === prev.rows.length
          ? prev.scores
          : prev.rows.map((_, index) => String(index + 1)),
    }));

  const setScore = (row: number, value: string) =>
    setContingencyParams(prev => ({
      ...prev,
      scores: prev.rows.map((_, index) =>
        index === row ? value : prev.scores[index] ?? String(index + 1)
      ),
    }));

  const addStratum = () =>
    setContingencyParams(prev => ({
      ...prev,
      strata: [
        ...prev.strata,
        {
          label: `${t('contingency.stratum')} ${prev.strata.length + 1}`,
          values: [
            ['0', '0'],
            ['0', '0'],
          ],
        },
      ],
    }));

  const removeStratum = () =>
    setContingencyParams(prev =>
      prev.strata.length <= 1 ? prev : { ...prev, strata: prev.strata.slice(0, -1) }
    );

  const setStratumLabel = (index: number, value: string) =>
    setContingencyParams(prev => ({
      ...prev,
      strata: prev.strata.map((stratum, position) =>
        position === index ? { ...stratum, label: value } : stratum
      ),
    }));

  const setStratumCell = (index: number, row: number, column: number, value: string) =>
    setContingencyParams(prev => ({
      ...prev,
      strata: prev.strata.map((stratum, position) =>
        position === index
          ? {
              ...stratum,
              values: [0, 1].map(ri =>
                [0, 1].map(ci =>
                  ri === row && ci === column
                    ? value
                    : stratum.values[ri]?.[ci] ?? '0'
                )
              ),
            }
          : stratum
      ),
    }));

  const trendValues = values.map(row => [row[0] ?? '0', row[1] ?? '0']);
  const trendCols = [cols[0] ?? '', cols[1] ?? ''];

  const tableEditor = (trend: boolean) => (
    <div className="overflow-x-auto rounded border border-border2 bg-surface3 p-2 scrollbar">
      <table className="text-[10px] text-text2">
        <thead>
          <tr>
            <th />
            {(trend ? trendCols : cols).map((col, column) => (
              <th key={column} className="p-1">
                <input
                  aria-label={`${t('contingency.col')} ${column + 1}`}
                  className="w-14 rounded border border-border2 bg-surface p-1 text-center text-[9px] font-semibold text-text"
                  value={col}
                  onChange={event => setColumnLabel(column, event.target.value)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((label, rowIndex) => (
            <tr key={rowIndex}>
              <td className="p-1">
                <input
                  aria-label={`${t('contingency.row')} ${rowIndex + 1}`}
                  className="w-16 rounded border border-border2 bg-surface p-1 text-[10px] font-semibold text-text"
                  value={label}
                  onChange={event => setRowLabel(rowIndex, event.target.value)}
                />
              </td>
              {(trend ? trendValues[rowIndex] : values[rowIndex] ?? []).map((cell, column) => (
                <td key={column} className="p-1">
                  <input
                    aria-label={`${t('contingency.row')} ${rowIndex + 1} ${t('contingency.col')} ${column + 1}`}
                    type="number"
                    min="0"
                    className={cellInput}
                    value={cell}
                    onChange={event => setCell(rowIndex, column, event.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-text3">{t('contingency.title')}</span>
      <div className="flex flex-col gap-2">
        <Field label={t('contingency.mode')}>
          <select
            aria-label={t('contingency.mode')}
            className={selectClass}
            value={mode}
            onChange={event => setMode(event.target.value as ContingencyParams['mode'])}
          >
            <option value="chi2">{t('contingency.modeChi2')}</option>
            <option value="mantelHaenszel">{t('contingency.modeMantel')}</option>
            <option value="trend">{t('contingency.modeTrend')}</option>
            <option value="exact">{t('contingency.modeExact')}</option>
          </select>
        </Field>

        {mode !== 'mantelHaenszel' && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <button type="button" className={smallButton} onClick={() => applyPreset('trial')}>
                {t('contingency.presetTrial')}
              </button>
              <button type="button" className={smallButton} onClick={() => applyPreset('survey')}>
                {t('contingency.presetSurvey')}
              </button>
            </div>
          </div>
        )}

        {mode === 'mantelHaenszel' ? (
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text3">
              {t('contingency.strata')}
            </span>
            {strata.map((stratum, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-2 rounded border border-border2 bg-surface3 p-2"
              >
                <input
                  aria-label={`${t('contingency.stratum')} ${index + 1}`}
                  className={labelInput}
                  value={stratum.label}
                  onChange={event => setStratumLabel(index, event.target.value)}
                />
                <table className="text-[10px] text-text2">
                  <tbody>
                    {[0, 1].map(row => (
                      <tr key={row}>
                        {[0, 1].map(column => (
                          <td key={column} className="p-0.5">
                            <input
                              aria-label={`${t('contingency.stratum')} ${index + 1} ${t('contingency.row')} ${row + 1} ${t('contingency.col')} ${column + 1}`}
                              type="number"
                              min="0"
                              className={cellInput}
                              value={stratum.values[row]?.[column] ?? '0'}
                              onChange={event =>
                                setStratumCell(index, row, column, event.target.value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="flex gap-1">
              <button type="button" className={smallButton} onClick={addStratum}>
                {t('contingency.addStratum')}
              </button>
              <button type="button" className={smallButton} onClick={removeStratum}>
                {t('contingency.removeStratum')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {tableEditor(mode === 'trend')}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex gap-1">
                <button type="button" className={smallButton} onClick={addRow}>
                  {t('contingency.addRow')}
                </button>
                <button type="button" className={smallButton} onClick={removeRow}>
                  {t('contingency.removeRow')}
                </button>
                {mode !== 'trend' && (
                  <>
                    <button type="button" className={smallButton} onClick={addCol}>
                      {t('contingency.addCol')}
                    </button>
                    <button type="button" className={smallButton} onClick={removeCol}>
                      {t('contingency.removeCol')}
                    </button>
                  </>
                )}
              </div>
              {(mode === 'chi2' || mode === 'exact') && (
                <>
                  <CheckboxField
                    label={t('contingency.fisher')}
                    checked={exact}
                    onChange={checked => setContingencyParams(prev => ({ ...prev, exact: checked }))}
                  />
                  <CheckboxField
                    label={t('contingency.monteCarlo')}
                    checked={monteCarlo}
                    onChange={checked => setContingencyParams(prev => ({ ...prev, monteCarlo: checked }))}
                  />
                </>
              )}
            </div>

            {mode === 'trend' && (
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-text3">
                  {t('contingency.scores')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {rows.map((label, index) => (
                    <label key={index} className="flex items-center gap-1 text-[10px] text-text2">
                      <span className="max-w-20 truncate">{label}</span>
                      <input
                        aria-label={`${t('contingency.scores')} ${index + 1}`}
                        type="number"
                        step="any"
                        className="w-14 rounded border border-border2 bg-surface p-1 text-center font-mono text-[11px] text-text"
                        value={scores[index] ?? String(index + 1)}
                        onChange={event => setScore(index, event.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
