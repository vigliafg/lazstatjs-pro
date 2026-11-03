/** Merged chart copy for this locale; the entries live in the parts. */
import { extraChartCopy as first } from './charts-extra-a';
import { extraChartCopy as second } from './charts-extra-b';
import { extraNotesChartCopy as notes } from './charts-extra-notes';

export const extraChartCopy: Record<string, string> = { ...first, ...second, ...notes };
