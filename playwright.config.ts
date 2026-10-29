import { defineConfig, devices } from '@playwright/test';

/**
 * UI smoke tests.
 *
 * The unit suite covers the engine; these tests protect the grid flows that
 * only exist in the browser (editing, undo, inspector, role assignment and the
 * reselect banner). CI downloads Chromium; locally the installed Chrome is
 * reused so no browser download is required.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'list' : 'line',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 7'],
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
