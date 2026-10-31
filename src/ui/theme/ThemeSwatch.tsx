import type { ThemeDefinition } from '../../theme';

/** Small theme preview used by the Settings cards and the theme library. */
export const ThemeSwatch = ({
  theme,
  className = '',
}: {
  theme: ThemeDefinition;
  className?: string;
}) => (
  <span
    aria-hidden="true"
    className={`flex h-11 w-16 shrink-0 overflow-hidden rounded border border-border2 ${className}`}
    style={{ background: theme.tokens.bg }}
  >
    <span
      className="m-1 flex flex-1 flex-col justify-between rounded-sm p-1"
      style={{ background: theme.tokens.surface }}
    >
      <span className="flex gap-0.5">
        {theme.chart.palette.slice(0, 4).map((colour, index) => (
          <span
            key={`${colour}-${index}`}
            className="h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: colour }}
          />
        ))}
      </span>
      <span
        className="font-mono text-[8px] font-semibold leading-none"
        style={{ color: theme.tokens.text }}
      >
        Aa
      </span>
    </span>
  </span>
);
