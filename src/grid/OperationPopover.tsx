import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import type { LucideIcon } from 'lucide-react';
import { t } from '../i18n';

/**
 * Trigger + anchored panel shared by every data operation.
 *
 * The panel is not a modal: it closes on Escape, on a pointer outside the
 * trigger/panel root and on Cancel. Opening one trigger closes the previous
 * one because that pointer is outside the previous root.
 */

/**
 * One open operation at a time. Pointer clicks are already covered by the
 * outside-pointerdown listener, but keyboard activation (Enter/Space) does not
 * fire a pointer event: this registry closes the previous panel in that case.
 */
let activeClose: (() => void) | null = null;

interface OperationTriggerProps {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  open: boolean;
  onToggle: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  tooltipAlign?: 'start' | 'end';
}

export const OperationTrigger = ({
  id,
  label,
  hint,
  icon: Icon,
  open,
  onToggle,
  triggerRef,
  tooltipAlign = 'start',
}: OperationTriggerProps) => {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const descriptionId = useId();
  const showTooltip = (hovered || focused) && !open;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        data-transform={`${id}-open`}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={hint ? descriptionId : undefined}
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`group tb-btn flex h-7 items-center gap-1.5 px-2 ${
          open
            ? 'border-accent bg-accent text-on-accent'
            : 'border-border2 bg-bg text-text hover:border-accent hover:bg-accent hover:text-on-accent'
        }`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${
            open ? 'text-on-accent' : 'text-accent group-hover:text-on-accent'
          }`}
          aria-hidden="true"
        />
        <span
          className={`hidden xl:inline ${
            open ? 'text-on-accent' : 'text-text group-hover:text-on-accent'
          }`}
        >
          {label}
        </span>
      </button>
      {hint && (
        <span id={descriptionId} className="sr-only">
          {hint}
        </span>
      )}
      <span
        role="tooltip"
        aria-hidden="true"
        data-tooltip={id}
        className={`pointer-events-none absolute top-full z-[9999] mt-2 w-max max-w-[16rem] rounded bg-accent px-2 py-1 text-left text-[10px] font-semibold leading-snug text-on-accent shadow-lg ${
          tooltipAlign === 'end' ? 'right-0' : 'left-0'
        } ${showTooltip ? 'block' : 'sr-only'}`}
      >
        {hint ?? label}
      </span>
    </div>
  );
};

interface OperationPanelProps {
  label: string;
  hint?: string;
  anchorRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  /** Returns true when the operation applied and the panel should close. */
  onRun: () => boolean;
  runDisabled?: boolean;
  children: ReactNode;
}

/** Dropdown body: fixed position clamped to the viewport, header, footer. */
const OperationPanel = ({
  label,
  hint,
  anchorRef,
  onClose,
  onRun,
  runDisabled,
  children,
}: OperationPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const measure = () => {
      const rect = anchor.getBoundingClientRect();
      // On mobile the visual viewport can be narrower than `innerWidth`
      // (layout viewport); clamp to what the user can actually see.
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const width = Math.min(320, viewportWidth - 16);
      setPosition({
        left: Math.max(8, Math.min(rect.left, viewportWidth - width - 8)),
        top: rect.bottom + 6,
        width,
        maxHeight: Math.max(160, viewportHeight - rect.bottom - 14),
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [anchorRef]);

  useEffect(() => {
    const first = panelRef.current?.querySelector<HTMLElement>('input, select, textarea');
    (first ?? panelRef.current)?.focus();
  }, []);

  if (!position) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      data-operation-panel={label}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        maxHeight: position.maxHeight,
      }}
      className="fixed z-[9999] flex flex-col rounded border border-border2 bg-surface shadow-2xl outline-none"
    >
      <header className="border-b border-border px-3 py-2">
        <h3 className="text-[11px] font-semibold text-text">{label}</h3>
        {hint && <p className="mt-0.5 text-[9px] leading-snug text-text2">{hint}</p>}
      </header>
      <div className="flex-1 overflow-y-auto px-3 py-2">{children}</div>
      <footer className="flex justify-end gap-2 border-t border-border px-3 py-2">
        <button type="button" className="tb-btn" onClick={onClose}>
          {t('data.operationsCancel')}
        </button>
        <button
          type="button"
          className="tb-btn border-accent bg-accent font-semibold text-on-accent"
          onClick={() => {
            if (onRun()) onClose();
          }}
          disabled={runDisabled}
        >
          {t('data.operationsRun')}
        </button>
      </footer>
    </div>
  );
};

interface OperationProps {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Returns true when the operation applied and the panel should close. */
  onRun: () => boolean;
  runDisabled?: boolean;
  tooltipAlign?: 'start' | 'end';
  children: ReactNode;
}

/** One operation: its own trigger, its own panel, its own draft state. */
export const Operation = ({
  id,
  label,
  hint,
  icon,
  open,
  onOpenChange,
  onRun,
  runDisabled,
  tooltipAlign,
  children,
}: OperationProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => onOpenChange(false);
    const previous = activeClose;
    activeClose = close;
    if (previous && previous !== close) previous();
    return () => {
      if (activeClose === close) activeClose = null;
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      onOpenChange(false);
      anchorRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative">
      <OperationTrigger
        id={id}
        label={label}
        hint={hint}
        icon={icon}
        open={open}
        onToggle={() => onOpenChange(!open)}
        triggerRef={anchorRef}
        tooltipAlign={tooltipAlign}
      />
      {open && (
        <OperationPanel
          label={label}
          hint={hint}
          anchorRef={anchorRef}
          onClose={() => {
            onOpenChange(false);
            anchorRef.current?.focus();
          }}
          onRun={onRun}
          runDisabled={runDisabled}
        >
          {children}
        </OperationPanel>
      )}
    </div>
  );
};
