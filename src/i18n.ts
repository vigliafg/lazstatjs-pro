/**
 * Single place for the UI shell strings.
 *
 * Decision: the interface stays in English (the statistical output and the
 * in-app help are bilingual/Italian), so the shell is centralised here and new
 * text must come from this dictionary. Form field labels are module-local and
 * follow the same English wording.
 */
const MESSAGES = {
  'app.name': 'LazStats',
  'nav.data': 'Data',
  'nav.analysis': 'Analysis',
  'nav.settings': 'Settings',
  'nav.help': 'Help',
  'footer.rows': 'ROWS',
  'footer.cols': 'COLS',
  'footer.invalid': 'INVALID',
  'footer.status': 'STATUS',
  'footer.ready': 'READY',
  'settings.session': 'Session',
  'settings.io': 'Import / Export',
  'settings.newDataset': 'New dataset',
  'settings.openProject': 'Open project',
  'settings.saveProject': 'Save project',
  'settings.export': 'Export data',
  'settings.recent': 'Recent projects',
  'settings.clear': 'Clear',
  'analysis.library': 'Library',
  'analysis.setup': 'Setup',
  'analysis.output': 'Output',
  'output.title': 'Output',
  'output.data': 'Data',
  'output.peek': 'Data peek',
  'output.clear': 'Clear',
  'output.copy': 'Copy',
  'output.charts': 'Charts',
  'output.report': 'Report',
  'output.xlsx': 'XLSX',
  'output.empty': 'No analysis output yet',
} as const;

export type MessageKey = keyof typeof MESSAGES;

export const t = (key: MessageKey): string => MESSAGES[key];

export const MESSAGE_KEYS = Object.keys(MESSAGES) as MessageKey[];
