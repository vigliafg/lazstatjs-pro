import { Info } from 'lucide-react';
import { countInvalidCells, nonEmptyRowCount, type GridData } from '../grid/types';

export interface FooterProps {
  grid: GridData;
}

/** Barra di stato: conteggi derivati dalla griglia, nessuno stato proprio. */
export const Footer = ({ grid }: FooterProps) => (
  <footer className="h-8 bg-surface border-t border-border flex items-center px-4 text-[10px] font-mono text-text3 gap-6 shrink-0">
    <div>ROWS: <span className="text-text2">{nonEmptyRowCount(grid.rows)}/{grid.rows.length}</span></div>
    <div className="w-px h-3 bg-border" />
    <div>COLS: <span className="text-text2">{grid.cols.length}</span></div>
    <div className="w-px h-3 bg-border" />
    <div>INVALID: <span className={countInvalidCells(grid) > 0 ? 'text-yellow' : 'text-green'}>{countInvalidCells(grid)}</span></div>
    <div className="w-px h-3 bg-border" />
    <div>STATUS: <span className="text-green">READY</span></div>
    <div className="ml-auto flex items-center gap-2">
      <Info className="w-3 h-3" />
      <span>LazStats JS v3.0.0</span>
    </div>
  </footer>
);
