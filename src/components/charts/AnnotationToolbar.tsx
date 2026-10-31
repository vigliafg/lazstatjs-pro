import { ArrowUpRight, Minus, MousePointer2, Square, Type } from 'lucide-react';
import { ToolbarButton } from '../ToolbarButton';
import { t } from '../../i18n';

export type AnnotationTool = 'select' | 'text' | 'line' | 'arrow' | 'rect';

export const ANNOTATION_TOOLS: readonly AnnotationTool[] = ['select', 'text', 'line', 'arrow', 'rect'];

const ICONS = {
  select: MousePointer2,
  text: Type,
  line: Minus,
  arrow: ArrowUpRight,
  rect: Square,
} as const;

const LABEL = {
  select: 'chart.annotation.tool.select',
  text: 'chart.annotation.tool.text',
  line: 'chart.annotation.tool.line',
  arrow: 'chart.annotation.tool.arrow',
  rect: 'chart.annotation.tool.rect',
} as const;

interface AnnotationToolbarProps {
  tool: AnnotationTool;
  onChange: (tool: AnnotationTool) => void;
}

/** Minimal toolbar of the second editor: select or create one primitive. */
export const AnnotationToolbar = ({ tool, onChange }: AnnotationToolbarProps) => (
  <div
    className="mb-2 flex flex-wrap items-center gap-1 rounded border border-border2 bg-surface2/60 p-1.5"
    role="toolbar"
    aria-label={t('chart.annotation.editorTitle')}
    data-annotation-toolbar
  >
    <span className="mr-1 font-mono text-[9px] uppercase tracking-widest text-text3">
      {t('chart.annotation.toolLabel')}
    </span>
    {ANNOTATION_TOOLS.map(value => {
      const Icon = ICONS[value];
      const active = tool === value;
      return (
        <ToolbarButton
          key={value}
          icon={Icon}
          label={t(LABEL[value])}
          size="sm"
          labelVisibility="always"
          className={`px-1.5 py-0.5 text-[9px] ${
            active ? 'border-accent bg-accent/10 text-text' : ''
          }`}
          aria-pressed={active}
          onClick={() => onChange(value)}
          title={t(LABEL[value])}
          data-annotation-tool={value}
        />
      );
    })}
    <span className="ml-auto hidden font-mono text-[8px] text-text3 sm:inline">
      {t('chart.annotation.hint')}
    </span>
  </div>
);
