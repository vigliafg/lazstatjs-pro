import { expect, test, type Page } from '@playwright/test';

const panel = (page: Page) => page.locator('[data-assistant-panel]');

const openPanel = async (page: Page) => {
  if ((await panel(page).getAttribute('data-open')) === 'true') return;
  const launcher = page.locator('[data-assistant-launcher]');
  if (await launcher.isVisible()) {
    await launcher.click();
    return;
  }
  await page.getByRole('button', { name: 'Expand Assistant' }).click();
};

const goToAnalysis = async (page: Page) => {
  await page.getByRole('button', { name: 'Analysis', exact: true }).click();
  await expect(panel(page)).toHaveAttribute('data-domain', 'analysis');
};

test.describe('Assistant panel', () => {
  test.skip(({ isMobile }) => isMobile, 'the Assistant column is a desktop layout');

  test('sits left of the data workspace and spans its full height', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await expect(panel(page)).toHaveAttribute('data-open', 'true');

    const main = await page.locator('main').boundingBox();
    const aside = await panel(page).boundingBox();
    const toolbar = await page.locator('[role="toolbar"][aria-label]').first().boundingBox();
    expect(main && aside && toolbar).toBeTruthy();
    expect(Math.abs(aside!.height - main!.height)).toBeLessThanOrEqual(2);
    expect(aside!.x + aside!.width).toBeLessThanOrEqual(toolbar!.x + 1);
  });

  test('resizes with the keyboard and remembers the width after a reload', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await expect(panel(page)).toHaveAttribute('data-width', '320');

    await page.locator('[data-assistant-resize]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(panel(page)).toHaveAttribute('data-width', '336');

    await page.reload();
    await expect(panel(page)).toHaveAttribute('data-width', '336');
  });

  test('collapses to a 44px rail and stays collapsed after a reload', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await page.getByRole('button', { name: 'Collapse Assistant' }).click();
    await expect(panel(page)).toHaveAttribute('data-open', 'false');

    const rail = await panel(page).boundingBox();
    expect(rail!.width).toBeLessThanOrEqual(45);

    await page.reload();
    await expect(panel(page)).toHaveAttribute('data-open', 'false');
    await page.getByRole('button', { name: 'Expand Assistant' }).click();
    await expect(panel(page)).toHaveAttribute('data-open', 'true');
  });

  test('opens a leaf on a 900px viewport as an overlay drawer', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/');
    await openPanel(page);
    await page.getByRole('button', { name: 'Collapse Assistant' }).click();

    await page.locator('[data-assistant-launcher]').click();
    await expect(panel(page)).toHaveAttribute('data-open', 'true');
    const box = await panel(page).boundingBox();
    expect(box!.width).toBeLessThanOrEqual(520);
  });

  test('switches domain with the main tabs', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await expect(panel(page)).toHaveAttribute('data-domain', 'data');

    await goToAnalysis(page);
    await page.getByRole('button', { name: 'Data', exact: true }).click();
    await expect(panel(page)).toHaveAttribute('data-domain', 'data');
  });

  test('collapses by default on analysis below 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await goToAnalysis(page);
    await expect(panel(page)).toHaveAttribute('data-open', 'false');

    await page.getByRole('button', { name: 'Expand Assistant' }).click();
    await expect(panel(page)).toHaveAttribute('data-open', 'true');

    await page.reload();
    if ((await panel(page).getAttribute('data-domain')) !== 'analysis') await goToAnalysis(page);
    await expect(panel(page)).toHaveAttribute('data-open', 'true');
  });

  test('applies a leaf to the form', async ({ page }) => {
    await page.goto('/');
    await goToAnalysis(page);
    await openPanel(page);
    await page.locator('[data-assistant-panel] [data-assistant-option="compare"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="means"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="independent"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="wide"]').click();

    await expect(page.locator('[data-assistant-panel] [data-assistant-leaf="ttest-ind"]')).toBeVisible();
    await page.locator('[data-assistant-panel] [data-assistant-apply]').click();
    await expect(page.getByRole('heading', { name: 'T-Test', exact: true })).toBeVisible();
  });

  test('runs from the panel and stores the Report Card in the run-report', async ({ page }) => {
    await page.goto('/');
    await goToAnalysis(page);
    await openPanel(page);
    await page.locator('[data-assistant-panel] [data-assistant-option="compare"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="means"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="independent"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-option="wide"]').click();
    await page.locator('[data-assistant-panel] [data-assistant-run]').click();

    await expect(page.locator('article.output-card')).toHaveCount(1);
    await expect(page.locator('article.output-card [data-report="assistant-card"]')).toBeVisible();
  });
});

test.describe('Assistant data domain', () => {
  test.skip(({ isMobile }) => isMobile, 'the Assistant column is a desktop layout');

  test('opens the export dialog from a data leaf', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await page.locator('[data-assistant-option="file"]').click();
    await page.locator('[data-assistant-option="export"]').click();

    await expect(page.locator('[data-assistant-data-leaf="data-export"]')).toBeVisible();
    await page.locator('[data-assistant-action]').click();
    await expect(page.locator('[data-export="format"]')).toBeVisible();
  });

  test('declares a missing code and shows it in the inspector', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await page.locator('[data-assistant-option="transform"]').click();
    await page.locator('[data-assistant-option="missing-codes"]').click();
    await page.locator('[data-assistant-codes]').fill('-9');
    await page.locator('[data-assistant-action]').click();

    await page.getByRole('button', { name: 'Start over' }).click();
    await page.locator('[data-assistant-option="quality"]').click();
    await page.locator('[data-assistant-option="missing"]').click();
    await page.locator('[data-assistant-action]').click();

    await expect(page.getByText('-9', { exact: true })).toBeVisible();
  });

  test('finds a wrong type and clears it after the fix', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await page.locator('[data-assistant-option="transform"]').click();
    await page.locator('[data-assistant-option="type"]').click();
    await page.locator('[data-assistant-column]').selectOption('0');
    await page.locator('[data-assistant-type]').selectOption('dat');
    await page.locator('[data-assistant-action]').click();

    await page.getByRole('button', { name: 'Start over' }).click();
    await page.locator('[data-assistant-option="quality"]').click();
    await page.locator('[data-assistant-option="types"]').click();
    await page.locator('[data-assistant-action]').click();
    await expect(page.getByText(/\d+ INVALID/)).toBeVisible();

    await page.getByRole('button', { name: 'Start over' }).click();
    await page.locator('[data-assistant-option="transform"]').click();
    await page.locator('[data-assistant-option="type"]').click();
    await page.locator('[data-assistant-column]').selectOption('0');
    await page.locator('[data-assistant-type]').selectOption('num');
    await page.locator('[data-assistant-action]').click();
    await expect(page.getByText(/\d+ INVALID/)).toHaveCount(0);
  });

  test('sorts the rows from the structure leaves', async ({ page }) => {
    await page.goto('/');
    await openPanel(page);
    await page.locator('[data-assistant-option="structure"]').click();
    await page.locator('[data-assistant-option="rows"]').click();
    await page.locator('[data-assistant-option="sort"]').click();
    await page.locator('[data-assistant-column]').selectOption('3');
    await page.locator('[data-assistant-direction]').selectOption('desc');
    await page.locator('[data-assistant-action]').click();

    await expect(page.locator('[data-cell="0-3"]')).toHaveValue('22');
  });

  test('blocks every data action but import on an empty grid', async ({ page }) => {
    page.on('dialog', dialog => void dialog.accept());
    await page.goto('/');
    await page.locator('[role="toolbar"]').getByRole('button', { name: 'New dataset', exact: true }).click();
    await openPanel(page);

    await expect(page.locator('[data-assistant-quality]')).toBeVisible();
    await page.locator('[data-assistant-option="file"]').click();
    await page.locator('[data-assistant-option="export"]').click();
    await expect(page.locator('[data-assistant-blocked]')).toContainText('empty');
    await expect(page.locator('[data-assistant-action]')).toBeDisabled();

    await page.getByLabel('Back', { exact: true }).click();
    await page.locator('[data-assistant-option="back"]').click();
    await page.locator('[data-assistant-option="handoff"]').click();
    await page.locator('[data-assistant-option="handoff"]').click();
    await expect(page.locator('[data-assistant-blocked]')).toContainText('Import');
    await expect(page.locator('[data-assistant-action]')).toBeDisabled();
  });
});

test.describe('Assistant workspace', () => {
  test.skip(({ isMobile }) => isMobile, 'the full-page workspace is a desktop layout');

  const workspace = (page: Page) => page.locator('[data-assistant-workspace]');

  const openWorkspace = async (page: Page) => {
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await expect(workspace(page)).toBeVisible();
    await page.locator('[data-assistant-mode="questions"]').click();
  };

  test('opens from the analysis library', async ({ page }) => {
    await page.goto('/');
    await openWorkspace(page);
    await expect(workspace(page).locator('[data-assistant-question="a1"]')).toBeVisible();
  });

  test('applies a leaf from the full page', async ({ page }) => {
    await page.goto('/');
    await openWorkspace(page);
    const root = workspace(page);
    await root.locator('[data-assistant-option="compare"]').click();
    await root.locator('[data-assistant-option="means"]').click();
    await root.locator('[data-assistant-option="independent"]').click();
    await root.locator('[data-assistant-option="wide"]').click();
    await expect(root.locator('[data-assistant-leaf="ttest-ind"]')).toBeVisible();

    await root.locator('[data-assistant-apply]').click();
    // The setup header carries the help button, so it is matched by prefix.
    await expect(
      page.locator('#analysis-pane-options').getByRole('heading', { name: /T-Test/ })
    ).toBeVisible();
  });

  test('runs from the full page and stores the Report Card', async ({ page }) => {
    await page.goto('/');
    await openWorkspace(page);
    const root = workspace(page);
    await root.locator('[data-assistant-option="compare"]').click();
    await root.locator('[data-assistant-option="means"]').click();
    await root.locator('[data-assistant-option="independent"]').click();
    await root.locator('[data-assistant-option="wide"]').click();
    await root.locator('[data-assistant-run]').click();

    await expect(page.locator('article.output-card')).toHaveCount(1);
    await expect(page.locator('article.output-card [data-report="assistant-card"]')).toBeVisible();
  });

  test('opens the Assistant for a project saved with the old wizard', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => localStorage.getItem('lazstats.project.v1') !== null);
    // The IndexedDB backup would win over the rewritten autosave; drop it so
    // the boot reads the migrated settings under test.
    await page.evaluate(
      () =>
        new Promise<void>(resolve => {
          const request = indexedDB.deleteDatabase('lazstats-backups');
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
        })
    );
    // Rewrite the active analysis at document start, before the app reads it,
    // so no pending autosave can undo the migration under test.
    await page.addInitScript(() => {
      const key = 'lazstats.project.v1';
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      localStorage.setItem(
        key,
        JSON.stringify({
          ...data,
          settings: { ...data.settings, activeAnalysis: 'wizard', activeTab: 'analysis' },
        })
      );
    });
    await page.reload();
    await expect(workspace(page)).toBeVisible();
  });
});

test.describe('Assistant flowchart and help', () => {
  test.skip(({ isMobile }) => isMobile, 'the flowchart lives in the full-page workspace');

  const ws = (page: Page) => page.locator('[data-assistant-workspace]');
  const flow = (page: Page, selector: string) =>
    page.locator(`[data-assistant-flow-node]${selector}`);

  const openWs = async (page: Page) => {
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await expect(ws(page)).toBeVisible();
  };

  test('marks the current question and the next options', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await expect(page.locator('[data-assistant-flow]')).toBeVisible();
    await expect(flow(page, '[data-state="current"]')).toHaveAttribute('data-node', 'a1');
    await expect(flow(page, '[data-state="available"]').first()).toBeVisible();
    const diagram = page.locator('[data-assistant-flow] svg').first();
    await expect(diagram).toHaveAttribute('viewBox', /^0 0 /);
    await expect(diagram.locator('g[aria-hidden="true"]')).toHaveCount(1);
  });

  test('follows an option node and truncates on an answered node', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await flow(page, '[data-option="compare"]').click();
    await expect(flow(page, '[data-state="current"]')).toHaveAttribute('data-node', 'compare');

    await flow(page, '[data-option="means"]').click();
    await flow(page, '[data-option="independent"]').click();
    await flow(page, '[data-option="wide"]').click();
    await expect(page.locator('[data-assistant-workspace] [data-assistant-leaf="ttest-ind"]')).toBeVisible();

    await flow(page, '[data-node="compare"][data-state="answered"]').click();
    await expect(flow(page, '[data-state="current"]')).toHaveAttribute('data-node', 'compare');
    await expect(page.locator('[data-assistant-leaf]')).toHaveCount(0);
  });

  test('opens the contextual help and closes it with Escape', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    const trigger = page.locator('[data-assistant-help-trigger]');
    await trigger.click();
    const panel = page.locator('[data-assistant-help]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Definition');
    await expect(panel).toContainText('Compare groups or measurements');
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('offers help on a leaf without hiding its actions', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await flow(page, '[data-option="compare"]').click();
    await flow(page, '[data-option="means"]').click();
    await flow(page, '[data-option="independent"]').click();
    await flow(page, '[data-option="wide"]').click();
    await expect(page.locator('[data-assistant-workspace] [data-assistant-apply]')).toBeVisible();
    await expect(page.locator('[data-assistant-workspace] [data-assistant-run]')).toBeVisible();

    await page.locator('[data-assistant-help-trigger]').click();
    await expect(page.locator('[data-assistant-help]')).toContainText('What to check');
  });
});

test.describe('Assistant chain', () => {
  test.skip(({ isMobile }) => isMobile, 'the chain lives in the full-page workspace');

  const ws = (page: Page) => page.locator('[data-assistant-workspace]');
  const flow = (page: Page, selector: string) =>
    page.locator(`[data-assistant-flow-node]${selector}`);

  const openWs = async (page: Page) => {
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await expect(ws(page)).toBeVisible();
  };

  const addTtest = async (page: Page) => {
    await flow(page, '[data-option="compare"]').click();
    await flow(page, '[data-option="means"]').click();
    await flow(page, '[data-option="independent"]').click();
    await flow(page, '[data-option="wide"]').click();
    await ws(page).locator('[data-assistant-chain-add]').click();
  };

  const addDescriptive = async (page: Page) => {
    await ws(page).getByRole('button', { name: 'Start over' }).click();
    await flow(page, '[data-option="describe"]').click();
    await flow(page, '[data-option="summary"]').click();
    await ws(page).locator('[data-assistant-chain-add]').click();
  };

  test('adds leaves, shows the order and lets the user reorder them', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await addTtest(page);
    await expect(page.locator('[data-chain-step]')).toHaveCount(1);
    await expect(page.locator('[data-chain-badge="1"]')).toBeVisible();

    await addDescriptive(page);
    await expect(page.locator('[data-chain-step]')).toHaveCount(2);
    await expect(page.locator('[data-chain-badge="2"]')).toBeVisible();

    await page.locator('[data-chain-step="0"] [data-chain-down]').click();
    await expect(page.locator('[data-chain-step="0"]')).toHaveAttribute(
      'data-chain-leaf',
      'descriptive'
    );

    await page.locator('[data-chain-step="0"] [data-chain-remove]').click();
    await expect(page.locator('[data-chain-step]')).toHaveCount(1);
    await page.locator('[data-chain-clear]').click();
    await expect(page.locator('[data-assistant-chain]')).toHaveCount(0);
  });

  test('runs every step and stores one run-report per leaf', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await addTtest(page);
    await addDescriptive(page);
    await ws(page).getByRole('button', { name: 'Start over' }).click();

    await page.locator('[data-chain-run]').click();
    await expect(page.locator('article.output-card')).toHaveCount(2, { timeout: 30_000 });
    await expect(page.locator('article.output-card [data-report="assistant-card"]')).toHaveCount(2);
  });
});

test.describe('Assistant readiness and exits', () => {
  test.skip(({ isMobile }) => isMobile, 'readiness lives in the desktop Assistant');

  const ws = (page: Page) => page.locator('[data-assistant-workspace]');
  const flow = (page: Page, selector: string) =>
    page.locator(`[data-assistant-flow-node]${selector}`);

  const openWs = async (page: Page) => {
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await expect(ws(page)).toBeVisible();
  };

  test('sends a long-format comparison to ANOVA', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await flow(page, '[data-option="compare"]').click();
    await flow(page, '[data-option="means"]').click();
    await flow(page, '[data-option="independent"]').click();
    await flow(page, '[data-option="long"]').click();

    await expect(ws(page).locator('[data-assistant-leaf="anova"]')).toBeVisible();
  });

  test('blocks a leaf whose data break a rule and opens the editor', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await flow(page, '[data-option="compare"]').click();
    await flow(page, '[data-option="shares"]').click();

    await expect(ws(page).locator('[data-assistant-leaf="proportions"]')).toBeVisible();
    await expect(ws(page).locator('[data-assistant-readiness="rules"]')).toBeVisible();
    await expect(ws(page).locator('[data-assistant-apply]')).toBeDisabled();
    await expect(ws(page).locator('[data-assistant-chain-add]')).toBeDisabled();
    await ws(page).locator('[data-assistant-repair]').click();
    await expect(page.locator('[data-assistant-panel]')).toHaveAttribute('data-domain', 'data');
  });

  test('keeps the data to analysis handoff in the panel footer', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('[data-assistant-panel]');
    if ((await panel.getAttribute('data-open')) !== 'true') {
      const launcher = page.locator('[data-assistant-launcher]');
      if (await launcher.isVisible()) await launcher.click();
      else await page.getByRole('button', { name: 'Expand Assistant' }).click();
    }
    await page.locator('[data-assistant-footer-handoff]').click();
    await expect(panel).toHaveAttribute('data-domain', 'analysis');
  });
});


test.describe('Assistant recommendation', () => {
  test.skip(({ isMobile }) => isMobile, 'the recommendation lives in the full-page workspace');

  test('opens a leaf from Not sure', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await page.locator('[data-assistant-workspace] [data-assistant-not-sure]').click();
    await expect(
      page.locator('[data-assistant-workspace] [data-assistant-leaf]')
    ).toBeVisible();
  });
});


test.describe('Assistant view modes', () => {
  test.skip(({ isMobile }) => isMobile, 'the diagram lives in the full-page workspace');

  const ws = (page: Page) => page.locator('[data-assistant-workspace]');
  const openWs = async (page: Page) => {
    await page.getByRole('button', { name: 'Analysis', exact: true }).click();
    await page.getByLabel('Search analyses').fill('assistant');
    await page
      .locator('#analysis-pane-library')
      .getByRole('button', { name: /Assistant/ })
      .first()
      .click();
    await expect(ws(page)).toBeVisible();
  };

  test('switches between the cascade and the diagram', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    await expect(page.locator('[data-assistant-flow]')).toBeVisible();
    const flowToggle = page.locator('[data-assistant-mode="flow"]');
    await expect(flowToggle).toBeVisible();
    const toggleBox = await flowToggle.boundingBox();
    expect(toggleBox).not.toBeNull();
    if (toggleBox) {
      expect(toggleBox.x).toBeGreaterThanOrEqual(0);
      expect(toggleBox.x + toggleBox.width).toBeLessThanOrEqual(
        page.viewportSize()!.width + 1
      );
    }
    const panelWidth = await page
      .locator('[data-assistant-panel]')
      .evaluate(element => element.getBoundingClientRect().width);
    expect(panelWidth).toBeLessThanOrEqual(380);

    await page.locator('[data-assistant-mode="questions"]').click();
    await expect(page.locator('[data-assistant-flow]')).toHaveCount(0);
    await expect(ws(page).locator('[data-assistant-question="a1"]')).toBeVisible();

    await page.locator('[data-assistant-mode="flow"]').click();
    await expect(page.locator('[data-assistant-flow]')).toBeVisible();
  });

  test('fits the whole diagram and explains the choices', async ({ page }) => {
    await page.goto('/');
    await openWs(page);
    const node = (option: string) =>
      page.locator(`[data-assistant-flow-node][data-option="${option}"]`);
    await node('compare').click();
    await node('means').click();
    await node('independent').click();
    await node('wide').click();

    await expect(page.locator('[data-assistant-flow-caption] [data-flow-choice]')).toHaveCount(4);
    await expect(page.locator('[data-assistant-flow-explanation]')).toBeVisible();

    const fit = await page.locator('[data-assistant-flow]').evaluate(element => {
      const viewport = element.querySelector('div');
      const svg = element.querySelector('svg');
      if (!viewport || !svg) return null;
      return {
        overflowX: viewport.scrollWidth - viewport.clientWidth,
        overflowY: viewport.scrollHeight - viewport.clientHeight,
        svgWidth: svg.getBoundingClientRect().width,
        viewportWidth: viewport.getBoundingClientRect().width,
      };
    });
    expect(fit).not.toBeNull();
    if (fit) {
      expect(fit.overflowX).toBeLessThanOrEqual(1);
      expect(fit.overflowY).toBeLessThanOrEqual(1);
      expect(fit.svgWidth).toBeLessThanOrEqual(fit.viewportWidth + 1);
    }
  });
});


test.describe('Assistant panel view modes', () => {
  test.skip(({ isMobile }) => isMobile, 'the docked panel is a desktop layout');

  test('switches the docked panel between questions and diagram', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Data', exact: true }).click();
    const panel = page.locator('[data-assistant-panel]');
    if ((await panel.getAttribute('data-open')) !== 'true') {
      const launcher = page.locator('[data-assistant-launcher]');
      if (await launcher.isVisible()) await launcher.click();
      else await page.getByRole('button', { name: 'Expand Assistant' }).click();
    }
    await panel.locator('[data-assistant-mode="flow"]').click();

    const overlay = page.locator('[data-assistant-diagram-overlay]');
    await expect(overlay).toBeVisible();
    const overlayBox = await overlay.boundingBox();
    expect(overlayBox).not.toBeNull();
    if (overlayBox) {
      expect(overlayBox.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 1);
    }
    await expect(overlay.locator('[data-assistant-flow]')).toBeVisible();

    await overlay.locator('[data-assistant-mode="questions"]').click();
    await expect(overlay).toHaveCount(0);
    await expect(panel.locator('[data-assistant-question]').first()).toBeVisible();
  });
});
