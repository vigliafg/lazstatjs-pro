import { useMemo, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { analysisLabel } from '../../analyses/registry';
import { t } from '../../i18n';
import { buildFlow, type FlowNode, type FlowNodeState } from './flow';
import type { AssistantDomain } from './tree';

const COLUMN = 210;
const ROW = 68;
const NODE_WIDTH = 186;
const NODE_HEIGHT = 54;
const TOP = 10;
const LEFT = 8;

const stateClass: Record<FlowNodeState, string> = {
  answered: 'border-border2 bg-surface2 text-text2',
  current: 'border-accent2 bg-accent2/10 text-text shadow-sm',
  available: 'border-border bg-surface2/40 text-text2 hover:border-accent2 hover:text-text',
};

interface Props {
  domain: AssistantDomain;
  answers: readonly string[];
  /** Leaf ids in chain order; the badge on a node shows its position. */
  chain?: readonly string[];
  onAnswer: (optionId: string) => void;
  onGoTo: (index: number) => void;
  /** Explanation shown in the band at the bottom of the viewport. */
  caption?: ReactNode;
  /** Smaller viewport for the docked panel. */
  compact?: boolean;
  /** Fills the parent instead of using a fixed viewport height. */
  fill?: boolean;
}

/**
 * Progressive flow of the Assistant tree.
 *
 * The diagram is one SVG with a `viewBox` covering the whole layout: the
 * browser scales and centres it inside the viewport, so the entire path is
 * visible at once and the container never needs scrollbars. Nodes are buttons
 * inside `foreignObject`, which keeps them interactive while the SVG scales.
 *
 * A dedicated layout library (Mermaid) was considered and rejected: it renders
 * static text labels, so it would lose the interactive nodes and add a heavy
 * dependency for a graph whose layout is already computed in `flow.ts`.
 */
export const AssistantFlow = ({
  domain,
  answers,
  chain,
  onAnswer,
  onGoTo,
  caption,
  compact = false,
  fill = false,
}: Props) => {
  const layout = useMemo(() => buildFlow(domain, answers), [domain, answers]);
  const chainOrder = useMemo(() => {
    const order = new Map<string, number>();
    (chain ?? []).forEach((leafId, index) => {
      if (!order.has(leafId)) order.set(leafId, index + 1);
    });
    return order;
  }, [chain]);
  const byKey = useMemo(
    () => new Map(layout.nodes.map(node => [node.key, node])),
    [layout.nodes]
  );
  const width = LEFT * 2 + layout.columns * COLUMN;
  const height = TOP * 2 + layout.rows * ROW;

  const activate = (node: FlowNode) => {
    if (node.state === 'available' && node.optionId) onAnswer(node.optionId);
    else if (node.state === 'answered') onGoTo(node.depth);
  };

  return (
    <div
      data-assistant-flow
      className={`flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface3/30 ${
        fill
          ? 'h-full min-h-0'
          : compact
            ? 'h-[clamp(240px,48vh,420px)]'
            : 'h-[clamp(280px,46vh,720px)] sm:h-[clamp(360px,68vh,720px)]'
      }`}
    >
      <div className="relative min-h-0 flex-1 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label={t('assistant.mode.flow')}
          className="absolute inset-0 h-full w-full"
        >
          <g aria-hidden="true" focusable="false">
            {layout.edges.map(edge => {
              const from = byKey.get(edge.from);
              const to = byKey.get(edge.to);
              if (!from || !to) return null;
              const x1 = LEFT + from.depth * COLUMN + NODE_WIDTH;
              const y1 = TOP + from.row * ROW + NODE_HEIGHT / 2;
              const x2 = LEFT + to.depth * COLUMN;
              const y2 = TOP + to.row * ROW + NODE_HEIGHT / 2;
              const mid = Math.max(24, (x2 - x1) / 2);
              return (
                <path
                  key={`${edge.from}->${edge.to}`}
                  d={`M ${x1} ${y1} C ${x1 + mid} ${y1}, ${x2 - mid} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={edge.state === 'available' ? '4 3' : undefined}
                  className={edge.state === 'path' ? 'stroke-accent2' : 'stroke-border2'}
                />
              );
            })}
          </g>

          {layout.nodes.map(node => {
            const badge = node.kind === 'leaf' ? chainOrder.get(node.id) : undefined;
            const label =
              node.optionLabel !== undefined
                ? t(node.optionLabel)
                : node.kind === 'leaf'
                  ? analysisLabel(node.analysisId ?? '')
                  : node.prompt
                    ? t(node.prompt)
                    : '';
            return (
              <foreignObject
                key={node.key}
                x={LEFT + node.depth * COLUMN}
                y={TOP + node.row * ROW}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                style={{ overflow: 'visible' }}
              >
                <div className="h-full w-full p-[2px]">
                  <button
                    type="button"
                    data-assistant-flow-node
                    data-node={node.id}
                    data-state={node.state}
                    data-depth={node.depth}
                    data-option={node.optionId}
                    aria-current={node.state === 'current' ? 'step' : undefined}
                    title={label}
                    onClick={() => activate(node)}
                    className={`relative flex h-full w-full items-center gap-1.5 rounded border px-2 py-1.5 text-left text-[11px] leading-snug transition-colors ${stateClass[node.state]}`}
                  >
                    {badge !== undefined && (
                      <span
                        data-chain-badge={badge}
                        title={t('assistant.chain')}
                        className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-semibold text-on-accent"
                      >
                        {badge}
                      </span>
                    )}
                    {node.state === 'answered' && (
                      <Check className="h-3 w-3 shrink-0 text-accent2" aria-hidden="true" />
                    )}
                    <span className="line-clamp-2 min-w-0">{label}</span>
                  </button>
                </div>
              </foreignObject>
            );
          })}
        </svg>
      </div>

      {caption !== undefined && (
        <div className="shrink-0 border-t border-border bg-surface/80 px-3 py-2">{caption}</div>
      )}
    </div>
  );
};
