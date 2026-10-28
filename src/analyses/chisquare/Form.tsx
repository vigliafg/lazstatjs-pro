import type { Dispatch, SetStateAction } from 'react';
import type { GridData } from '../../grid/types';
import type { ChiSqParams } from '../../io/project';

export interface ChiSquareFormProps {
  grid: GridData;
  chisqParams: ChiSqParams;
  setChisqParams: Dispatch<SetStateAction<ChiSqParams>>;
}

export const ChiSquareForm = ({ grid, chisqParams, setChisqParams }: ChiSquareFormProps) => (
  <>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-text3 font-mono uppercase tracking-widest">
          Contingency Table (2x2)
        </label>
        <div className="bg-surface3 border border-border2 rounded p-3">
          <table className="text-[11px] text-text2">
            <thead>
              <tr>
                <th className="p-1"></th>
                <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                  Col 1 (Label)
                </th>
                <th className="p-1 text-center font-mono text-[9px] uppercase tracking-wider text-text3">
                  Col 2 (Label)
                </th>
              </tr>
              <tr>
                <th className="p-1"></th>
                <th className="p-1">
                  <input
                    type="text"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28 font-semibold"
                    value={chisqParams.col1Label}
                    onChange={(e) => setChisqParams(p => ({ ...p, col1Label: e.target.value }))}
                  />
                </th>
                <th className="p-1">
                  <input
                    type="text"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28 font-semibold"
                    value={chisqParams.col2Label}
                    onChange={(e) => setChisqParams(p => ({ ...p, col2Label: e.target.value }))}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">
                  <input
                    type="text"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded font-semibold w-28"
                    value={chisqParams.row1Label}
                    onChange={(e) => setChisqParams(p => ({ ...p, row1Label: e.target.value }))}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min="0"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                    value={chisqParams.row1col1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setChisqParams(p => ({ ...p, row1col1: isNaN(val) ? 0 : val }));
                    }}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min="0"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                    value={chisqParams.row1col2}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setChisqParams(p => ({ ...p, row1col2: isNaN(val) ? 0 : val }));
                    }}
                  />
                </td>
              </tr>
              <tr>
                <td className="p-1">
                  <input
                    type="text"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded font-semibold w-28"
                    value={chisqParams.row2Label}
                    onChange={(e) => setChisqParams(p => ({ ...p, row2Label: e.target.value }))}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min="0"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                    value={chisqParams.row2col1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setChisqParams(p => ({ ...p, row2col1: isNaN(val) ? 0 : val }));
                    }}
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    min="0"
                    className="bg-surface border border-border2 text-text text-[11px] p-1 rounded text-center w-28"
                    value={chisqParams.row2col2}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setChisqParams(p => ({ ...p, row2col2: isNaN(val) ? 0 : val }));
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-between gap-1.5 mt-3">
            <label className="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text cursor-pointer">
              <input 
                type="checkbox" 
                className="accent-accent" 
                checked={chisqParams.runFisherExact}
                onChange={(e) => setChisqParams(p => ({ ...p, runFisherExact: e.target.checked }))}
              />
              Run Fisher's Exact Test
            </label>
            <div className="flex gap-1.5">
              <button 
                className="text-[10px] bg-surface hover:bg-border px-2 py-0.5 rounded font-mono text-text3 hover:text-text border border-border cursor-pointer"
                onClick={() => setChisqParams(p => ({
                  ...p,
                  row1col1: 30,
                  row1col2: 20,
                  row2col1: 15,
                  row2col2: 35,
                  row1Label: 'Treatment Group',
                  row2Label: 'Control Group',
                  col1Label: 'Improved',
                  col2Label: 'No Change'
                }))}
              >
                Preset 1: Trial
              </button>
              <button 
                className="text-[10px] bg-surface hover:bg-border px-2 py-0.5 rounded font-mono text-text3 hover:text-text border border-border cursor-pointer"
                onClick={() => setChisqParams(p => ({
                  ...p,
                  row1col1: 120,
                  row1col2: 880,
                  row2col1: 90,
                  row2col2: 910,
                  row1Label: 'Variant A',
                  row2Label: 'Variant B',
                  col1Label: 'Converted',
                  col2Label: 'Bounced'
                }))}
              >
                Preset 2: A/B Test
              </button>
            </div>
          </div>
        </div>
      </div>
  </>
);
