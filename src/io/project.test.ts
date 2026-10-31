import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PARAMS,
  DEFAULT_SETTINGS,
  MAX_AUTOSAVE_CHARS,
  PROJECT_STORAGE_KEY,
  clearAutosaveProject,
  createProjectSnapshot,
  loadAutosaveProject,
  parseGrid,
  normalizeProjectFileName,
  parseProject,
  saveAutosaveProject,
  serializeProject,
} from './project';
import { DEFAULT_PREFS } from './prefs';
import { DEFAULT_CHART_DEFAULTS } from '../charts/defaults';
import { createChartPreset } from '../charts/presets';
import type { GridData } from '../grid/types';

const grid: GridData = {
  cols: [
    { name: 'Score', type: 'num' },
    { name: 'Group', type: 'int' },
    { name: 'Age', type: 'int' },
  ],
  rows: [
    ['12.5', '1', '30'],
    ['8', '2', '41'],
  ],
};

const withoutIds = (value: GridData): GridData => ({
  cols: value.cols.map(({ id: _id, ...col }) => col),
  rows: value.rows,
});

const makeSnapshot = () =>
  createProjectSnapshot(
    {
      grid,
      prefs: DEFAULT_PREFS,
      settings: {
        ciLevel: 99,
        activeAnalysis: 'ttest',
        activeTab: 'analysis',
        uiMode: 'guided',
        theme: 'dracula',
        uiLocale: 'it',
        reportLocale: 'it',
        helpLocale: 'auto',
        chartDefaults: DEFAULT_SETTINGS.chartDefaults,
        outputAppearance: DEFAULT_SETTINGS.outputAppearance,
      },
      params: DEFAULT_PARAMS,
    },
    '2026-10-19T10:00:00.000Z'
  );

describe('project file names', () => {
  it('appends the .lzs extension and keeps a valid name', () => {
    assert.equal(normalizeProjectFileName('studio 2026'), 'studio 2026.lzs');
    assert.equal(normalizeProjectFileName('report.lzs'), 'report.lzs');
    assert.equal(normalizeProjectFileName('REPORT.LZS'), 'REPORT.LZS');
    assert.equal(normalizeProjectFileName('a/b:c'), 'a-b-c.lzs');
    assert.equal(normalizeProjectFileName('   '), 'lazstats-project.lzs');
  });
});

describe('project snapshot roundtrip', () => {
  it('migrates a version 1 project to the current schema', () => {
    const raw = JSON.parse(serializeProject(makeSnapshot()));
    raw.version = 1;
    delete raw.datasetId;
    delete raw.dataRevision;
    const migrated = parseProject(JSON.stringify(raw));
    assert.equal(migrated.version, 3);
    assert.equal(migrated.grid.cols.length, 3);
  });

  it('serialises and restores grid, settings and params', () => {
    const restored = parseProject(serializeProject(makeSnapshot()));
    assert.deepEqual(withoutIds(restored.grid), grid);
    assert.equal(restored.savedAt, '2026-10-19T10:00:00.000Z');
    assert.equal(restored.settings.ciLevel, 99);
    assert.equal(restored.settings.activeAnalysis, 'ttest');
    assert.equal(restored.settings.activeTab, 'analysis');
    assert.equal(restored.settings.theme, 'dracula');
    assert.deepEqual(restored.settings.outputAppearance, DEFAULT_SETTINGS.outputAppearance);
    assert.deepEqual(restored.params, DEFAULT_PARAMS);
    assert.deepEqual(restored.settings.chartDefaults, DEFAULT_SETTINGS.chartDefaults);
  });

  it('round-trips named chart presets and defaults old projects to an empty library', () => {
    const base = makeSnapshot();
    const preset = createChartPreset('Paper', { ...DEFAULT_CHART_DEFAULTS, theme: 'light' });
    const withPresets = {
      ...base,
      settings: { ...base.settings, chartPresets: [preset] },
    };
    const restored = parseProject(serializeProject(withPresets));
    assert.equal(restored.settings.chartPresets?.length, 1);
    assert.equal(restored.settings.chartPresets?.[0].name, 'Paper');
    assert.equal(restored.settings.chartPresets?.[0].options.theme, 'light');
    assert.deepEqual(parseProject(serializeProject(base)).settings.chartPresets, []);
  });

  it('drops malformed presets without losing the project', () => {
    const base = makeSnapshot();
    const preset = createChartPreset('Valid', DEFAULT_CHART_DEFAULTS);
    const parsed = parseProject(
      JSON.stringify({
        ...base,
        settings: {
          ...base.settings,
          chartPresets: [{ name: 'No options' }, null, preset],
        },
      })
    );
    assert.equal(parsed.settings.chartPresets?.length, 1);
    assert.equal(parsed.settings.chartPresets?.[0].name, 'Valid');
  });

  it('rejects non-project payloads', () => {
    assert.throws(() => parseProject('not json'), /invalid JSON/);
    assert.throws(() => parseProject('[]'), /not a valid/i);
    assert.throws(() => parseProject('{"app":"other"}'), /lazstats/i);
    assert.throws(
      () => parseProject('{"app":"lazstats","version":9}'),
      /Unsupported project version 9/
    );
    assert.throws(() => parseProject('{"app":"lazstats"}'), /no version/);
  });

  it('requires a usable grid', () => {
    const base = makeSnapshot();
    assert.throws(() => parseProject(JSON.stringify({ ...base, grid: { cols: [], rows: [] } })), /no columns/);
    assert.throws(() => parseProject(JSON.stringify({ ...base, grid: { cols: grid.cols, rows: 'x' } })), /no rows/);
  });
});

describe('project sanitisation', () => {
  it('normalises columns, cells and empty grids', () => {
    const parsed = parseGrid({
      cols: [
        { name: 'A', type: 'num' },
        { name: 'a', type: 'bogus' },
        { type: 'int' },
      ],
      rows: [['1', 2, true, 'extra'], [], 'junk'],
    });
    assert.deepEqual(parsed.cols.map((c) => c.name), ['A', 'a_2', 'Var3']);
    assert.deepEqual(parsed.cols.map((c) => c.type), ['num', 'str', 'int']);
    assert.deepEqual(parsed.rows, [
      ['1', '2', '1'],
      ['', '', ''],
      ['', '', ''],
    ]);

    const empty = parseGrid({ cols: [{ name: 'Only', type: 'str' }], rows: [] });
    assert.deepEqual(empty.rows, [['']]);
  });

  it('preserves optional variable metadata', () => {
    const parsed = parseGrid({
      cols: [{ name: 'Score', type: 'num', label: 'Punteggio', description: 'Prima del trattamento' }],
      rows: [['1']],
    });
    assert.equal(parsed.cols[0].label, 'Punteggio');
    assert.equal(parsed.cols[0].description, 'Prima del trattamento');
  });

  it('preserves the extended column types in a project file', () => {
    const parsed = parseGrid({
      cols: [
        { name: 'Quando', type: 'dtm' },
        { name: 'Ora', type: 'tim' },
        { name: 'Gruppo', type: 'cat' },
        { name: 'Codice', type: 'id' },
      ],
      rows: [['2026-10-19 10:00', '09:30', 'A', 'ABC-1']],
    });
    assert.deepEqual(parsed.cols.map((c) => c.type), ['dtm', 'tim', 'cat', 'id']);
  });

  it('round-trips categorical levels and the reference level', () => {
    const withLevels = createProjectSnapshot({
      grid: {
        cols: [
          {
            name: 'Gruppo',
            type: 'cat',
            levels: [
              { value: '1', label: 'Controllo' },
              { value: '2', label: 'Trattamento' },
            ],
            reference: '1',
          },
          { name: 'Score', type: 'num' },
        ],
        rows: [['1', '10'], ['2', '12']],
      },
      prefs: DEFAULT_PREFS,
      settings: DEFAULT_SETTINGS,
      params: DEFAULT_PARAMS,
    });
    const restored = parseProject(serializeProject(withLevels));
    assert.deepEqual(restored.grid.cols[0].levels, [
      { value: '1', label: 'Controllo' },
      { value: '2', label: 'Trattamento' },
    ]);
    assert.equal(restored.grid.cols[0].reference, '1');
  });

  it('sanitises invalid levels and drops a reference outside the list', () => {
    const parsed = parseGrid({
      cols: [
        {
          name: 'G',
          type: 'cat',
          levels: [
            { value: ' 1 ', label: 'A' },
            { value: '1', label: 'B' },
            { value: '', label: 'C' },
            { value: '2', label: 'a' },
          ],
          reference: '9',
        },
      ],
      rows: [['1']],
    });
    assert.deepEqual(parsed.cols[0].levels, [
      { value: '1', label: 'A' },
      { value: '2', label: 'a 2' },
    ]);
    assert.equal(parsed.cols[0].reference, undefined);
  });

  it('round-trips missing codes and sanitises them', () => {
    const withMissing = createProjectSnapshot({
      grid: {
        cols: [{ name: 'Score', type: 'num', missing: ['-9', 'NA'] }],
        rows: [['-9'], ['NA'], ['12']],
      },
      prefs: DEFAULT_PREFS,
      settings: DEFAULT_SETTINGS,
      params: DEFAULT_PARAMS,
    });
    const restored = parseProject(serializeProject(withMissing));
    assert.deepEqual(restored.grid.cols[0].missing, ['-9', 'NA']);

    const parsed = parseGrid({
      cols: [{ name: 'S', type: 'num', missing: [' -9 ', '-9', '', 7, 'NA'] }],
      rows: [['-9']],
    });
    assert.deepEqual(parsed.cols[0].missing, ['-9', 'NA']);
  });

  it('round-trips a persistent formula and trims it', () => {
    const parsed = parseGrid({
      cols: [{ name: 'Diff', type: 'num', formula: '  Post - Pre  ' }],
      rows: [['1']],
    });
    assert.equal(parsed.cols[0].formula, 'Post - Pre');

    const blank = parseGrid({ cols: [{ name: 'Plain', type: 'num', formula: '   ' }], rows: [['1']] });
    assert.equal(blank.cols[0].formula, undefined);
  });

  it('falls back on invalid settings and params without losing valid ones', () => {
    const base = makeSnapshot();
    const parsed = parseProject(
      JSON.stringify({
        ...base,
        settings: { ciLevel: 42, activeAnalysis: 7, activeTab: 'nope' },
        params: {
          ...DEFAULT_PARAMS,
          descVars: [1, -2, 'x', 1.9],
          corr: { ...DEFAULT_PARAMS.corr, vars: [] },
          anova: { ...DEFAULT_PARAMS.anova, kwPosthoc: 'nope' },
          ttest: { ...DEFAULT_PARAMS.ttest, type: 'bogus', mu: 'x' },
        },
      })
    );
    assert.deepEqual(parsed.settings, DEFAULT_SETTINGS);
    assert.deepEqual(parsed.params.descVars, [1]);
    assert.deepEqual(parsed.params.corr.vars, []);
    assert.equal(parsed.params.anova.kwPosthoc, 'bonferroni');
    assert.equal(parsed.params.ttest.type, 'ind');
    assert.equal(parsed.params.ttest.mu, 0);
  });

  it('keeps valid hidden chart groups and drops invalid ones', () => {
    const base = makeSnapshot();
    const parsed = parseProject(
      JSON.stringify({
        ...base,
        settings: {
          ...base.settings,
          hiddenChartGroups: {
            regression: ['diagnostic', 'bogus', 'diagnostic'],
            descriptive: [],
          },
        },
      })
    );
    assert.deepEqual(parsed.settings.hiddenChartGroups, { regression: ['diagnostic'] });
    assert.deepEqual(parseProject(JSON.stringify(base)).settings.hiddenChartGroups, {});
  });

  it('keeps a valid UI theme and rejects an unknown one', () => {
    const base = makeSnapshot();
    assert.equal(parseProject(serializeProject(base)).settings.theme, 'dracula');
    const invalid = parseProject(
      JSON.stringify({ ...base, settings: { ...base.settings, theme: 'neon-rainbow' } })
    );
    assert.equal(invalid.settings.theme, DEFAULT_SETTINGS.theme);
  });

  it('restores and sanitises sample-size parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          samplesize: { ...DEFAULT_PARAMS.samplesize, design: 'anova', groups: 4, f: 0.4 },
        },
      })
    );
    assert.deepEqual(restored.params.samplesize, {
      ...DEFAULT_PARAMS.samplesize,
      design: 'anova',
      groups: 4,
      f: 0.4,
    });

    const junk = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          samplesize: { design: 'bogus', alpha: 'x', groups: 2.7 },
        },
      })
    );
    assert.equal(junk.params.samplesize.design, 'twoMeans');
    assert.equal(junk.params.samplesize.alpha, 0.05);
    assert.equal(junk.params.samplesize.groups, 2);
  });

  it('restores and sanitises distribution-fit parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          distfit: { variable: 99, selected: ['normal', 'bogus', 'normal'] },
        },
      })
    );
    // The base grid has three columns: the index is clamped to the last one.
    assert.equal(restored.params.distfit.variable, 2);
    assert.deepEqual(restored.params.distfit.selected, ['normal']);
  });

  it('restores and sanitises logistic parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          logistic: { outcome: 99, predictors: [0, 1, 0, 2], cutoff: 'x' },
        },
      })
    );
    assert.equal(restored.params.logistic.outcome, 2);
    assert.deepEqual(restored.params.logistic.predictors, [0, 1]);
    assert.equal(restored.params.logistic.cutoff, 0.5);
  });

  it('restores and sanitises Cox parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          cox: { timeVariable: 99, eventVariable: 0, covariates: [0, 1, 2, 2] },
        },
      })
    );
    assert.equal(restored.params.cox.timeVariable, 2);
    assert.equal(restored.params.cox.eventVariable, 0);
    assert.deepEqual(restored.params.cox.covariates, [1]);
  });

  it('restores survival parameters, preserving the "no group" sentinel', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          survival: { timeVariable: 99, eventVariable: 0, groupVariable: -1 },
        },
      })
    );
    assert.equal(restored.params.survival.timeVariable, 2);
    assert.equal(restored.params.survival.eventVariable, 0);
    assert.equal(restored.params.survival.groupVariable, -1);

    const grouped = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          survival: { timeVariable: 0, eventVariable: 1, groupVariable: 1 },
        },
      })
    );
    assert.equal(grouped.params.survival.groupVariable, 1);
  });

  it('restores and sanitises time-series parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          timeseries: {
            variable: 99,
            period: 2,
            horizon: 6,
            differenceMode: 'bogus',
            seasonalDifferenceMode: '2',
          },
        },
      })
    );
    assert.equal(restored.params.timeseries.variable, 2);
    assert.equal(restored.params.timeseries.period, 2);
    assert.equal(restored.params.timeseries.horizon, 6);
    assert.equal(restored.params.timeseries.differenceMode, 'auto');
    assert.equal(restored.params.timeseries.seasonalDifferenceMode, 'auto');
  });

  it('normalises the contingency matrix shape and keeps cell text for the builder', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          contingency: {
            rows: ['A', 'B'],
            cols: ['X', 'Y', 'Z'],
            values: [['1', 2, 'junk'], ['3'], 'oops'],
            exact: false,
            monteCarlo: 'yes',
          },
        },
      })
    );
    assert.deepEqual(restored.params.contingency.rows, ['A', 'B']);
    assert.deepEqual(restored.params.contingency.cols, ['X', 'Y', 'Z']);
    assert.deepEqual(restored.params.contingency.values, [
      ['1', '2', 'junk'],
      ['3', '0', '0'],
    ]);
    assert.equal(restored.params.contingency.exact, false);
    assert.equal(restored.params.contingency.monteCarlo, true);
  });

  it('restores and sanitises ANCOVA parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          ancova: { response: 99, factor: 1, covariates: [0, 1, 2, 2] },
        },
      })
    );
    assert.equal(restored.params.ancova.response, 2);
    assert.equal(restored.params.ancova.factor, 1);
    // Response and factor are removed from the covariate list.
    assert.deepEqual(restored.params.ancova.covariates, [0]);
  });

  it('restores and sanitises factorial parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          factorial: { response: 99, factorA: -3, factorB: 1, interaction: 'yes' },
        },
      })
    );
    assert.equal(restored.params.factorial.response, 2);
    assert.equal(restored.params.factorial.factorA, 0);
    assert.equal(restored.params.factorial.factorB, 1);
    assert.equal(restored.params.factorial.interaction, false);
  });

  it('restores and sanitises repeated-measures parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          repeatedanova: { selected: [0, 1, 2, 99, -1, 1] },
        },
      })
    );
    assert.deepEqual(restored.params.repeatedanova.selected, [0, 1, 2]);
  });

  it('restores and sanitises multivariate parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          multivariate: { mode: 'bogus', standardize: false, selected: [0, 9, 1, 1] },
        },
      })
    );
    assert.equal(restored.params.multivariate.mode, 'pca');
    assert.equal(restored.params.multivariate.standardize, false);
    assert.deepEqual(restored.params.multivariate.selected, [0, 1]);
  });

  it('restores and sanitises non-parametric parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          nonparamrm: {
            mode: 'jonckheere',
            selected: [0, 9, 1],
            left: 99,
            right: -2,
            outcome: 1,
            group: 0,
          },
        },
      })
    );
    assert.equal(restored.params.nonparamrm.mode, 'jonckheere');
    assert.deepEqual(restored.params.nonparamrm.selected, [0, 1]);
    assert.equal(restored.params.nonparamrm.left, 2);
    assert.equal(restored.params.nonparamrm.right, 0);
    assert.equal(restored.params.nonparamrm.outcome, 1);
    assert.equal(restored.params.nonparamrm.group, 0);
  });

  it('restores and sanitises wizard parameters', () => {
    const base = makeSnapshot();
    const restored = parseProject(
      JSON.stringify({
        ...base,
        params: {
          ...DEFAULT_PARAMS,
          wizard: { goal: 'predict', outcome: 99, group: -1, second: 0, paired: true },
        },
      })
    );
    assert.equal(restored.params.wizard.goal, 'predict');
    assert.equal(restored.params.wizard.outcome, 2);
    assert.equal(restored.params.wizard.group, -1);
    assert.equal(restored.params.wizard.second, 0);
    assert.equal(restored.params.wizard.paired, true);
  });

  it('clamps parameter indexes to the restored grid width', () => {
    const narrow = createProjectSnapshot(
      {
        grid: { cols: [{ name: 'Only', type: 'num' }], rows: [['1']] },
        prefs: DEFAULT_PREFS,
        settings: DEFAULT_SETTINGS,
        params: DEFAULT_PARAMS,
      },
      '2026-10-19T10:00:00.000Z'
    );
    assert.deepEqual(narrow.params.descVars, [0]);
    assert.equal(narrow.params.ttest.var2, 0);
    assert.deepEqual(narrow.params.reg.indeps, [0]);
    assert.deepEqual(narrow.params.corr.vars, [0]);
  });

  it('rejects grids above the import limits', () => {
    const tooMany = Array.from({ length: 501 }, (_, i) => ({ name: `C${i}`, type: 'num' }));
    assert.throws(() => parseGrid({ cols: tooMany, rows: [] }), /Too many columns/);
  });
});

class MemoryStorage {
  private data = new Map<string, string>();

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

const withStorage = (run: (storage: MemoryStorage) => void) => {
  const storage = new MemoryStorage();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  try {
    run(storage);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete (globalThis as { localStorage?: Storage }).localStorage;
  }
};

describe('project autosave', () => {
  it('roundtrips through localStorage', () => {
    withStorage(() => {
      assert.equal(saveAutosaveProject(makeSnapshot()), true);
      assert.deepEqual(withoutIds(loadAutosaveProject()?.grid ?? { cols: [], rows: [] }), grid);
      clearAutosaveProject();
      assert.equal(loadAutosaveProject(), null);
    });
  });

  it('ignores corrupted or unsupported autosaves', () => {
    withStorage((storage) => {
      storage.setItem(PROJECT_STORAGE_KEY, '{oops');
      assert.equal(loadAutosaveProject(), null);
      storage.setItem(PROJECT_STORAGE_KEY, JSON.stringify({ ...makeSnapshot(), version: 99 }));
      assert.equal(loadAutosaveProject(), null);
    });
  });

  it('refuses snapshots over the autosave budget instead of throwing', () => {
    withStorage(() => {
      const huge = makeSnapshot();
      huge.grid.rows = [['x'.repeat(MAX_AUTOSAVE_CHARS)]];
      assert.equal(saveAutosaveProject(huge), false);
      assert.equal(loadAutosaveProject(), null);
    });
  });
});
