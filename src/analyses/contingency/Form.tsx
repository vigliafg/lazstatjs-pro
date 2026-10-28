import type { Dispatch, SetStateAction } from 'react';
import type { ContingencyParams } from '../../io/project';

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
  'bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-14 font-mono';
const labelClass = 'text-[10px] text-text3 font-mono uppercase tracking-widest';
const smallButton =
  'text-[10px] bg-surface hover:bg-border px-2 py-0.5 rounded font-mono text-text3 hover:text-text border border-border cursor-pointer';

export const ContingencyForm = ({
  contingencyParams,
  setContingencyParams,
}: ContingencyFormProps) => {
  const { rows, cols, values, exact, monteCarlo } = contingencyParams;

  const setCell = (i: number, j: number, value: string) => {
    setContingencyParams(prev => ({
      ...prev,
      values: prev.values.map((row, ri) =>
        ri === i ? row.map((cell, ci) => (ci === j ? value : cell)) : row
      ),
    }));
  };

  const addRow = () => {
    setContingencyParams(prev => ({
      ...prev,
      rows: [...prev.rows, `Row ${prev.rows.length + 1}`],
      values: [...prev.values, prev.cols.map(() => '0')],
    }));
  };

  const removeRow = () => {
    setContingencyParams(prev =>
      prev.rows.length <= 2
        ? prev
        : { ...prev, rows: prev.rows.slice(0, -1), values: prev.values.slice(0, -1) }
    );
  };

  const addCol = () => {
    setContingencyParams(prev => ({
      ...prev,
      cols: [...prev.cols, `Col ${prev.cols.length + 1}`],
      values: prev.values.map(row => [...row, '0']),
    }));
  };

  const removeCol = () => {
    setContingencyParams(prev =>
      prev.cols.length <= 2
        ? prev
        : {
            ...prev,
            cols: prev.cols.slice(0, -1),
            values: prev.values.map(row => row.slice(0, -1)),
          }
    );
  };

  const applyPreset = (preset: keyof typeof PRESETS) => {
    const next = PRESETS[preset];
    setContingencyParams(prev => ({
      ...prev,
      rows: [...next.rows],
      cols: [...next.cols],
      values: next.values.map(row => [...row]),
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label className={labelClass}>Contingency Table (R x C)</label>
        <div className="flex gap-1.5">
          <button className={smallButton} onClick={() => applyPreset('trial')}>
            Preset: trial
          </button>
          <button className={smallButton} onClick={() => applyPreset('survey')}>
            Preset: survey
          </button>
        </div>
      </div>

      <div className="bg-surface3 border border-border2 rounded p-2 overflow-x-auto scrollbar">
        <table className="text-[10px] text-text2">
          <thead>
            <tr>
              <th />
              {cols.map((col, j) => (
                <th key={j} className="p-1">
                  <input
                    className="bg-surface border border-border2 text-text text-[9px] p-1 rounded text-center w-14 font-semibold"
                    value={col}
                    onChange={e =>
                      setContingencyParams(prev => ({
                        ...prev,
                        cols: prev.cols.map((label, index) => (index === j ? e.target.value : label)),
                      }))
                    }
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i}>
                <td className="p-1">
                  <input
                    className="bg-surface border border-border2 text-text text-[10px] p-1 rounded font-semibold w-16"
                    value={rows[i] ?? ''}
                    onChange={e =>
                      setContingencyParams(prev => ({
                        ...prev,
                        rows: prev.rows.map((label, index) => (index === i ? e.target.value : label)),
                      }))
                    }
                  />
                </td>
                {row.map((cell, j) => (
                  <td key={j} className="p-1">
                    <input
                      type="number"
                      min="0"
                      className={cellInput}
                      value={cell}
                      onChange={e => setCell(i, j, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex gap-1">
          <button className={smallButton} onClick={addRow}>
            + Row
          </button>
          <button className={smallButton} onClick={removeRow}>
            − Row
          </button>
          <button className={smallButton} onClick={addCol}>
            + Col
          </button>
          <button className={smallButton} onClick={removeCol}>
            − Col
          </button>
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
          <input
            type="checkbox"
            className="accent-accent"
            checked={exact}
            onChange={e => setContingencyParams(prev => ({ ...prev, exact: e.target.checked }))}
          />
          Fisher (2x2)
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
          <input
            type="checkbox"
            className="accent-accent"
            checked={monteCarlo}
            onChange={e => setContingencyParams(prev => ({ ...prev, monteCarlo: e.target.checked }))}
          />
          Monte Carlo if E &lt; 5
        </label>
      </div>
    </div>
  );
};
