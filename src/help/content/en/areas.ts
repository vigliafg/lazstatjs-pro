import type { HelpTopic } from '../types';

/** Chapters that explain the application itself, before the procedures. */
export const areaTopics: HelpTopic[] = [
  {
    id: 'start-tour',
    area: 'start',
    title: 'First steps: data, analysis, results',
    summary: 'The whole loop in three moves, so you know where everything lives.',
    tutorial: {
      goal: 'Run a first analysis end to end without knowing anything about the program.',
      dataset: 'score-groups.csv',
      steps: [
        'Open DATA: it is a spreadsheet with a header row and one column per variable.',
        'Press Import and pick score-groups.csv: delimiter and decimals are detected automatically.',
        'Check the type under each header: num for numbers, cat for groups.',
        'Switch to ANALYSIS, search for “T-Test”, fill the Setup panel and press Run analysis.',
        'Read the reading report that closes every run and download the HTML report from the output bar.',
      ],
      expected: 'Tables, any charts and a plain-language comment appear in the output; running again never overwrites the previous card.',
    },
    advanced: {
      whenToUse: [
        'When you want one flow for data, computation and reporting without moving files between programs.',
        'When you need a reproducible result: data and parameters stay inside the .lzs project.',
      ],
      reading: [
        'Output cards are snapshots: they stay as produced even if the data change later.',
        'The “stale” badge means the grid changed after that result was produced.',
      ],
      pitfalls: [
        'Never edit numbers in the report: fix the data and run again.',
        'Save the project before long experiments: autosave lives in the browser.',
      ],
      glossary: [
        { term: 'Procedure', definition: 'A single statistical analysis, for example the t-test.' },
        { term: 'Result card', definition: 'The block holding tables, charts and the report of one run.' },
      ],
    },
    seeAlso: ['data-import', 'analysis-workflow', 'output-console'],
  },
  {
    id: 'data-import',
    area: 'data',
    title: 'Importing CSV, TSV, Excel, SPSS and Stata files',
    summary: 'Bring data in without breaking numbers and categories.',
    tutorial: {
      goal: 'Import a file with comma decimals and text groups.',
      dataset: 'score-groups.csv',
      steps: [
        'From DATA press Import and choose the file: CSV, TSV, TXT, JSON, Excel (.xlsx) and SPSS/Stata (.sav/.dta); the preview shows the first rows.',
        'Check the detected delimiter (comma, semicolon, tab) and the decimal separator.',
        'Say whether the first row is the header and choose Apply as = Overwrite grid.',
        'Press Import and read how many rows and columns entered.',
      ],
      expected: 'The grid shows one column per variable and one row per observation, with sensible column types.',
    },
    advanced: {
      assumptions: [
        'Each row is one complete observation; variables are columns.',
        'Missing codes must be declared after import (e.g. -9, NA).',
      ],
      whenToUse: [
        'Files exported from Excel, R, SPSS or an online survey.',
        'Several files with the same columns to stack vertically (Append rows).',
      ],
      whenNotToUse: ['Data not organised as one row per case: reshape them first.'],
      reading: [
        '“rows and columns imported” confirms the size; “duplicate headers renamed” flags repeated names.',
        '“BOM stripped” is normal in files saved by Excel.',
      ],
      pitfalls: [
        'A wrong decimal separator turns numbers into text: check the type after importing.',
        'Empty cells are always missing; no special code is needed.',
      ],
      glossary: [
        { term: 'Delimiter', definition: 'The character separating columns in a text file.' },
        { term: 'Missing code', definition: 'A conventional value such as -9 that must be read as absent.' },
      ],
    },
    seeAlso: ['data-editor', 'data-clean', 'projects'],
  },
  {
    id: 'data-editor',
    area: 'data',
    title: 'Editing data in the grid',
    summary: 'Column types, validation, undo and quick filling.',
    tutorial: {
      goal: 'Fix a value and turn a text column into numbers.',
      dataset: 'score-groups.csv',
      steps: [
        'Double-click a cell and type the new value; Enter confirms and moves down.',
        'Change the type in the dropdown under the header (num, int, cat, str).',
        'Press Validate to list invalid cells; Auto-fix tries the conversion.',
        'Use Ctrl+Z to undo, Ctrl+Y to redo; select a range and press Ctrl+D to fill down.',
      ],
      expected: 'The cell shows the new value, the status bar updates the invalid count and undo restores the previous state.',
    },
    advanced: {
      whenToUse: [
        'Small or systematic fixes before an analysis.',
        'Adding computed columns with a formula (e.g. Score_Post - Score_Pre).',
      ],
      reading: [
        'The column type drives validation, Auto-fix and the Excel export; analyses still infer numbers from the values.',
        'The variable inspector shows missing values, distinct values and roles.',
      ],
      pitfalls: [
        'Renaming a column updates formulas, but analysis parameters using it must be reselected.',
        'Sorting the grid changes row order: paired analyses depend on that order.',
      ],
      glossary: [
        { term: 'Validation', definition: 'Checking that every cell is compatible with the declared type.' },
        { term: 'Computed column', definition: 'A column whose value is a formula, recalculated on every edit.' },
      ],
    },
    seeAlso: ['data-import', 'data-clean', 'levels'],
  },
  {
    id: 'data-clean',
    area: 'data',
    title: 'Cleaning and transforming data',
    summary: 'Find and replace, missing values, empty rows and duplicates.',
    tutorial: {
      goal: 'Unify a label written in several ways and fill empty cells with the mean.',
      dataset: 'score-groups.csv',
      steps: [
        'Press Clean and open Find / Replace; pick one column or All columns.',
        'Type the text to find and the replacement, then Apply.',
        'In the Missing section choose Mean and press Fill for the numeric column.',
        'In Tidy remove empty rows and duplicates one at a time, reading the outcome message.',
      ],
      expected: 'A message reports how many replacements or cells changed; every operation can be undone with Ctrl+Z.',
    },
    advanced: {
      whenToUse: [
        'Before any analysis, to avoid duplicated categories (Yes/yes, SI/si).',
        'To drop rows that are exact copies and inflate counts.',
      ],
      whenNotToUse: ['Do not mean-impute when many values are missing or not at random: consider multiple imputation.'],
      reading: [
        '“No matches” means the text does not exist, not that the operation failed.',
        '“cells filled with” reports the value used for imputation.',
      ],
      pitfalls: [
        'Regex replacement is powerful: test it on one column first.',
        'Mean imputation shrinks variability and underestimates standard errors.',
      ],
      glossary: [
        { term: 'Simple imputation', definition: 'Replacing a missing value with mean, median, mode or a constant.' },
        { term: 'Duplicate', definition: 'A row identical to another in every column.' },
      ],
    },
    seeAlso: ['data-editor', 'levels', 'mi'],
  },
  {
    id: 'levels',
    area: 'data',
    title: 'Group levels and labels',
    summary: 'Give codes readable names, choose the order and the reference level.',
    tutorial: {
      goal: 'Show “Treatment” and “Control” instead of 1 and 0 in tables.',
      dataset: 'score-groups.csv',
      steps: [
        'Open the menu of the group column and choose Edit levels.',
        'Type a label next to each code and order them with the arrows.',
        'Mark the group you want as the model reference.',
        'Press Apply levels and run the analysis again.',
      ],
      expected: 'Tables, charts and reports use the labels; model-based analyses compare against the reference.',
    },
    advanced: {
      whenToUse: [
        'Whenever a group has cryptic numeric codes.',
        'In models with an intercept: the reference decides how coefficients read.',
      ],
      reading: [
        'The code stays in the cells; the label is presentation only.',
        'Cells holding values outside the list appear as “not in list” and stay in the data.',
      ],
      pitfalls: [
        'Removing a level never deletes observations: it only changes how they are shown.',
        'Changing the reference changes the coefficients, not the model quality.',
      ],
      glossary: [
        { term: 'Reference level', definition: 'The category the other groups are compared with in the model.' },
        { term: 'Treatment coding', definition: 'A scheme where every group is compared with the reference.' },
      ],
    },
    seeAlso: ['data-editor', 'anova', 'regression'],
  },
  {
    id: 'analysis-workflow',
    area: 'analysis',
    title: 'Choosing and running an analysis',
    summary: 'Library, search, setup panel, confidence level and re-runs.',
    tutorial: {
      goal: 'Find the right procedure and get a complete result.',
      dataset: 'score-groups.csv',
      steps: [
        'Open ANALYSIS: the library lists procedures by family.',
        'Type the test name or the problem in the search box (e.g. “compare two groups”).',
        'Select the procedure: the Setup panel shows only the parameters it needs.',
        'Choose variables, set the confidence level and press Run analysis (Ctrl/⌘+Enter).',
        'Use Live to re-run automatically when data or parameters change.',
      ],
      expected: 'A new card is appended to the output; the previous one stays for comparison.',
    },
    advanced: {
      whenToUse: [
        'Always: it is the only path to tables, charts and the written report.',
        'Live is handy while exploring but should be off for heavy procedures.',
      ],
      reading: [
        'The “heavy” badge marks procedures to run explicitly.',
        'If a column changed, the procedure asks you to reselect the affected variables.',
      ],
      pitfalls: [
        'Changing the confidence level does not change the data, but changes every estimate.',
        'Re-running without changes creates duplicate cards: use Apply to reuse parameters.',
      ],
      glossary: [
        { term: 'Confidence level', definition: 'The coverage of the intervals: 95% is the usual choice.' },
        { term: 'Snapshot', definition: 'A static copy of a result, independent of later data.' },
      ],
    },
    seeAlso: ['choosing-test', 'output-console', 'start-tour'],
  },
  {
    id: 'choosing-test',
    area: 'analysis',
    title: 'Which test should I use?',
    summary: 'A quick map from the question to the procedure, plus the guided wizard.',
    tutorial: {
      goal: 'Pick a procedure from the type of question and data.',
      dataset: 'score-groups.csv',
      steps: [
        'Open the guided procedure (Guided family).',
        'Choose the question: describe, compare groups or predict an outcome.',
        'Set the outcome, the groups and whether measures are independent or paired.',
        'Read the recommendation and press Open to load the procedure with parameters ready.',
      ],
      expected: 'The suggested procedure opens in the panel with variables already selected; you only run it.',
    },
    advanced: {
      whenToUse: ['At the beginning, when you do not want to pick the wrong family.'],
      reading: [
        'Numeric outcome + 2 independent groups → t-test or Mann-Whitney; more groups → ANOVA or Kruskal-Wallis.',
        'Numeric outcome + paired measures → paired t-test or Wilcoxon.',
        'Binary outcome → logistic or chi-square; time to an event → survival.',
      ],
      pitfalls: [
        'The recommendation never checks assumptions: verify normality, independence and sample size.',
        'With few cases non-parametric tests are often the better fit.',
      ],
      glossary: [
        { term: 'Paired', definition: 'Repeated measures on the same unit (before/after).' },
        { term: 'Non-parametric', definition: 'A test that does not assume a specific distribution shape.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'ttest', 'nonparamrm'],
  },
  {
    id: 'output-console',
    area: 'output',
    title: 'Reading and exporting results',
    summary: 'Cards, outline, annotations, chart presets, PNG charts, HTML/Word reports and Excel workbooks.',
    tutorial: {
      goal: 'Take results out in a format you can use.',
      dataset: 'score-groups.csv',
      steps: [
        'Run an analysis and look at the card: tables, then the reading report, then the editable charts.',
        'Click a chart to open the editor: change theme, colours, preset and procedure-specific options, then press Done.',
        'Press Annotations to add text, lines, arrows or rectangles on the plot; drag to move, use the handles to resize and undo with Ctrl/⌘+Z.',
        'Open the Outline to jump to a card or collapse it with the chevron.',
        'Press Report to download a printable HTML file, or Word for an editable one.',
        'Use XLSX to get data and tables in a workbook; Charts downloads the PNG files.',
      ],
      expected: 'Downloaded files contain the same numbers and annotations shown on screen, with consistent titles and headers.',
    },
    advanced: {
      whenToUse: [
        'To share a result with someone who does not use the program.',
        'To archive a frozen version of one analysis.',
      ],
      reading: [
        '“stale” means data changed after the run: re-run before exporting.',
        'Charts stay editable after reload; cards saved with the old engine remain static: re-run them to get an editable chart.',
        'Settings → Charts sets the default style of future charts; existing cards are not changed.',
        'Annotations use plot-relative coordinates (0–1 inside the plot area), so they follow resizing and export inside the same Vega SVG.',
        'Each annotation gesture is one undo step; on mobile the chart editor splits into Chart, Properties and Annotations tabs.',
        'Named presets are project-scoped and appear in the Preset selector of every chart editor in that project.',
      ],
      pitfalls: [
        'Exporting a stale card produces a formally correct but outdated report.',
        'The “view only” row filter does not change the numbers used by analyses.',
        'Annotations belong to one card: a preset never copies them to another chart.',
      ],
      glossary: [
        { term: 'Reading report', definition: 'The plain-language comment closing every analysis.' },
        { term: 'Workbook', definition: 'The .xlsx file with several sheets, one per table.' },
        { term: 'Annotation', definition: 'A text, line, arrow or rectangle drawn on top of a chart and saved with it.' },
      ],
    },
    seeAlso: ['analysis-workflow', 'projects'],
  },
  {
    id: 'projects',
    area: 'output',
    title: 'Saving and reopening a project',
    summary: 'New project, .lzs files, Save as, autosave and how to restore a backup.',
    tutorial: {
      goal: 'Keep data, settings and parameters to resume tomorrow.',
      dataset: 'score-groups.csv',
      steps: [
        'From DATA press New project to start clean: dataset, parameters and output are cleared, while settings and preferences stay.',
        'Press Save project to write the .lzs file; Save as… asks for a new name and leaves the current file unchanged.',
        'Press Open project and pick a file to replace the current session.',
        'Reload the page: autosave restores the session from the browser.',
        'From Settings you can restore an IndexedDB backup if autosave failed.',
      ],
      expected: 'After opening you find the grid, levels, parameters, output cards, custom themes and chart presets again.',
    },
    advanced: {
      whenToUse: [
        'Before changing dataset or trying risky experiments.',
        'To share a case with a colleague, together with data and parameters.',
      ],
      reading: [
        'The project also holds output snapshots: readable but not recalculable.',
        'Custom themes and chart presets are stored inside the project and travel in the .lzs file.',
        'Fields added in newer versions are optional: old files open with defaults.',
      ],
      pitfalls: [
        'Autosave lives in the browser: clearing site data deletes it.',
        'A .lzs file is not a backup of the original data: keep the source CSV too.',
        'New project clears the output cards: export or save them first if you still need them.',
        'Save as… creates a copy; later saves keep using the name you chose in the prompt.',
      ],
      glossary: [
        { term: '.lzs', definition: 'The project format: JSON with data, settings and parameters.' },
        { term: 'IndexedDB backup', definition: 'A local safety copy used by autosave.' },
        { term: 'Save as', definition: 'A command that writes a copy of the project under a new .lzs name.' },
      ],
    },
    seeAlso: ['data-import', 'output-console', 'appearance'],
  },
  {
    id: 'appearance',
    area: 'output',
    title: 'Themes, chart presets and the theme creator',
    summary: 'Ten built-in themes, project custom themes with a live preview, and named chart presets.',
    tutorial: {
      goal: 'Create a project theme and a chart preset, then reuse them.',
      dataset: 'score-groups.csv',
      steps: [
        'Open SETTINGS → Appearance and pick one of the five dark or five light built-in themes; the header selector applies it immediately.',
        'Press Create theme: name it, choose the base and the mode, edit the colours and follow the live preview.',
        'Check the WCAG contrast panel, then press Save theme: it joins Custom themes, is selected and stays inside the project.',
        'Run an analysis, open a chart and use the Preset selector: choose Default, Minimal, Print light or one of your presets.',
        'Press Save preset to store the current shared style, then rename or delete presets from SETTINGS → Charts.',
      ],
      expected: 'The new theme applies to the whole interface and the preset appears in every chart editor of the project.',
    },
    advanced: {
      whenToUse: [
        'When you need a readable palette for a specific output, such as a journal, a projector or print.',
        'When several charts should share one style without repeating the same choices.',
      ],
      whenNotToUse: [
        'Do not use a preset to copy annotations or data: it only holds shared style options.',
        'Do not expect custom themes to change fonts, spacing or the report print stylesheet: the creator edits colours only.',
      ],
      reading: [
        'Custom themes are project-scoped, capped at 20 and listed in a dedicated group of the header selector.',
        'The theme creator preview is scoped to its panel: the rest of the application keeps the current theme until you save.',
        'Contrast checks cover 11 pairs, including text on surfaces, accents, chart text and the worst palette colour against the chart background.',
        'Chart presets store the 20 shared style options and never the per-card annotations or procedure-specific settings.',
      ],
      pitfalls: [
        'Saving a theme below the recommended contrast asks for confirmation: read the AA/AAA badges before using it in a report.',
        'Deleting the active custom theme falls back to the default theme; charts keep their own options.',
        'Applying a preset replaces the shared style of that chart; annotations and procedure options stay as they are.',
        'Renaming or deleting a preset in Settings updates the project but does not rewrite cards that already used it.',
      ],
      glossary: [
        { term: 'Custom theme', definition: 'A project-scoped interface palette created from a built-in theme.' },
        { term: 'Chart preset', definition: 'A named set of shared chart style options, reusable across cards.' },
        { term: 'WCAG contrast', definition: 'The ratio between text and background colours, used to check readability.' },
      ],
    },
    seeAlso: ['projects', 'output-console'],
  },
];
