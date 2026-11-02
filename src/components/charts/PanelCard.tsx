import type { AnalysisChart, ChartOptions, PanelChart } from '../../stats/charts';
import { ResultTables } from '../ResultTable';
import { ChartCard } from './ChartCard';

interface PanelCardProps {
  key?: string;
  panel: PanelChart;
  analysisName?: string;
  onOptionsChange?: (chartId: string, options: ChartOptions) => void;
  /** Chart editor: append a copy of a panel child to the run-report. */
  onChartInsert?: (chart: AnalysisChart) => void;
  className?: string;
}

/**
 * L3 composite card: a JMP-style report made of existing charts and tables.
 *
 * The panel owns no data kernel of its own. Each child is a complete chart
 * model, so it keeps its editor, annotations and PNG surface; the panel only
 * chooses the arrangement. Children are depth 1 by construction and are laid
 * out as a grid (two columns on wide screens) or a single stacked column.
 */
export const PanelCard = ({
  panel,
  analysisName,
  onOptionsChange,
  onChartInsert,
  className = '',
}: PanelCardProps) => {
  const children = panel.children;
  const grid = panel.layout === 'grid' && children.length > 1;
  return (
    <section
      className={`output-panel mb-8 min-w-0 rounded-lg border border-border2/60 bg-surface2/20 p-3 ${className}`}
      aria-label={panel.title}
      data-panel-id={panel.id}
      data-panel-layout={panel.layout}
    >
      <div className="mb-3 border-b border-border2/50 pb-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-accent2">
          {panel.title}
        </h3>
        {panel.subtitle && (
          <p className="mt-0.5 font-mono text-[10px] text-text3">{panel.subtitle}</p>
        )}
      </div>
      {panel.tables && panel.tables.length > 0 && (
        <div className="mb-2" data-panel-tables>
          <ResultTables specs={panel.tables} />
        </div>
      )}
      <div
        className={
          grid
            ? 'grid grid-cols-1 gap-x-4 gap-y-2 xl:grid-cols-2'
            : 'flex flex-col gap-2'
        }
        data-panel-children
      >
        {children.map(child => (
          <div
            key={child.id}
            className={grid ? 'min-w-0' : 'w-full'}
            data-panel-child={child.id}
          >
            <ChartCard
              chart={child}
              analysisName={analysisName}
              onOptionsChange={onOptionsChange}
              onChartInsert={onChartInsert}
              domIdPrefix={panel.id}
            />
          </div>
        ))}
      </div>
      {panel.note && (
        <p className="mt-1 border-t border-border2/40 pt-2 text-[10px] leading-snug text-text3">
          {panel.note}
        </p>
      )}
    </section>
  );
};
