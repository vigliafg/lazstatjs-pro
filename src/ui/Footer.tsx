import { useDeferredValue, useMemo } from 'react';
import { Info } from 'lucide-react';
import { countInvalidCells, nonEmptyRowCount, type GridData } from '../grid/types';
import { t } from '../i18n';

export interface FooterProps {
  grid: GridData;
}

/** Barra di stato: conteggi derivati dalla griglia, nessuno stato proprio. */
export const Footer = ({ grid }: FooterProps) => {
  // The footer must not block typing on a 50k-row grid: validate the deferred
  // snapshot once, instead of scanning every cell twice in the current render.
  const deferredGrid = useDeferredValue(grid);
  const populated = useMemo(() => nonEmptyRowCount(deferredGrid.rows), [deferredGrid]);
  const invalid = useMemo(() => countInvalidCells(deferredGrid), [deferredGrid]);

  return (
    <footer className="flex min-h-8 shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-border bg-surface px-2 py-1 font-mono text-[10px] text-text3 sm:gap-x-6 sm:px-4">
      <div>{t('footer.rows')}: <span className="text-text2">{populated}/{deferredGrid.rows.length}</span></div>
      <div className="hidden h-3 w-px bg-border sm:block" />
      <div>{t('footer.cols')}: <span className="text-text2">{deferredGrid.cols.length}</span></div>
      <div className="hidden h-3 w-px bg-border sm:block" />
      <div>{t('footer.invalid')}: <span className={invalid > 0 ? 'text-yellow' : 'text-green'}>{invalid}</span></div>
      <div className="hidden h-3 w-px bg-border sm:block" />
      <div>{t('footer.status')}: <span className="text-green">{t('footer.ready')}</span></div>
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        <Info className="w-3 h-3" />
        <span className="hidden md:inline">LazStats JS v3.0.0</span>
      </div>
    </footer>
  );
};
