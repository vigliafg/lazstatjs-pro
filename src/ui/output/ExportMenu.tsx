import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';

export interface ExportMenuItem {
  label: string;
  ariaLabel: string;
  onSelect: () => void;
}

interface ExportMenuProps {
  /** Accessible name of the trigger, e.g. "Export run report". */
  ariaLabel: string;
  /** Visible trigger text; hidden on very narrow panes. */
  label: string;
  title?: string;
  items: ExportMenuItem[];
  compact?: boolean;
}

/**
 * Small export dropdown shared by the session header and every run-report card.
 * It closes on selection, on `Escape` and on any pointer outside the menu.
 */
export const ExportMenu = ({ ariaLabel, label, title, items, compact }: ExportMenuProps) => {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (item: ExportMenuItem) => {
    setOpen(false);
    item.onSelect();
  };

  return (
    <div ref={root} className="relative" data-no-print>
      <button
        type="button"
        className={`tb-btn flex items-center gap-1 ${
          compact ? 'h-5 px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'
        }`}
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
      >
        <Download className="h-3 w-3" />
        {!compact && <span className="hidden 2xl:inline">{label}</span>}
        <ChevronDown className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={ariaLabel}
          className="absolute right-0 top-full z-40 mt-1 min-w-[170px] rounded border border-border2 bg-surface p-1 shadow-lg"
        >
          {items.map(item => (
            <button
              key={item.ariaLabel}
              type="button"
              role="menuitem"
              aria-label={item.ariaLabel}
              className="block w-full rounded px-2 py-1 text-left text-[10px] text-text2 hover:bg-surface3 hover:text-text"
              onClick={() => select(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
