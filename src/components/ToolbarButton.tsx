import type { ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Toolbar button shared by the data screen and the other dense toolbars.
 *
 * It follows the operations bar: an icon plus a label that collapses to the
 * icon alone on narrow viewports. The accessible name always comes from
 * `aria-label`, so hiding the visible label never changes how the button is
 * announced or how the end-to-end tests find it.
 */

type LabelVisibility = 'always' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const LABEL_CLASS: Record<LabelVisibility, string> = {
  always: 'inline',
  sm: 'hidden sm:inline',
  md: 'hidden md:inline',
  lg: 'hidden lg:inline',
  xl: 'hidden xl:inline',
  '2xl': 'hidden 2xl:inline',
};

interface ToolbarButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  /** Visible text and, by default, the accessible name. */
  label: string;
  /** Tooltip when the visible label is hidden or too terse. */
  hint?: string;
  active?: boolean;
  /** Marks the button as a two-state control so `aria-pressed` is explicit. */
  toggle?: boolean;
  size?: 'sm' | 'md';
  tone?: 'default' | 'danger' | 'warning' | 'primary';
  /** Let the button share the row width (inspector footers). */
  grow?: boolean;
  /** Keep the text visible at every width (dialogs, footers, primary actions). */
  labelVisibility?: LabelVisibility;
  /** Test hooks and other data attributes forwarded to the button. */
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
}

export const ToolbarButton = ({
  icon: Icon,
  label,
  hint,
  active = false,
  toggle = false,
  size = 'sm',
  tone = 'default',
  grow = false,
  labelVisibility = 'xl',
  className = '',
  type = 'button',
  ...rest
}: ToolbarButtonProps) => {
  const sizing =
    size === 'sm' ? 'h-6 gap-1 px-1.5 text-[10px]' : 'h-7 gap-1.5 px-2 text-[11px]';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const toneClass =
    tone === 'danger'
      ? 'text-red/80 hover:border-red hover:bg-red hover:text-on-accent'
      : tone === 'warning'
        ? 'text-yellow'
        : tone === 'primary'
          ? 'border-accent bg-accent text-on-accent hover:border-accent2 hover:bg-accent2'
          : '';
  const activeClass = active ? 'border-accent bg-accent text-on-accent' : '';

  return (
    <button
      {...rest}
      type={type}
      aria-label={rest['aria-label'] ?? label}
      aria-pressed={toggle ? active : rest['aria-pressed']}
      title={rest.title ?? hint ?? label}
      className={`tb-btn inline-flex ${grow ? 'flex-1' : 'shrink-0'} items-center justify-center whitespace-nowrap ${sizing} ${toneClass} ${activeClass} ${className}`}
    >
      <Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span className={LABEL_CLASS[labelVisibility]}>{label}</span>
    </button>
  );
};
