import { t, type MessageKey } from '../../i18n';
import type { ChartKind } from '../../stats/charts';

/** Localised, human label of a chart kind ("Q-Q", "Box", "Mappa di calore"). */
export const chartKindLabel = (kind: ChartKind): string =>
  t(`chart.kind.${kind}` as MessageKey);
