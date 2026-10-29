import test from 'node:test';
import assert from 'node:assert/strict';
import { factoryOptions } from '../defaults';
import { DEFAULT_THEME_ID, applyTheme } from '../../theme';
import { chartSurfaceBackground, themeFor } from './theme';

const options = (theme: 'dark' | 'light', palette: 'default' | 'mono' = 'default') => ({
  ...factoryOptions('scatter'),
  theme,
  palette,
});

test('the default theme keeps the historical chart palette', () => {
  applyTheme(DEFAULT_THEME_ID);
  const theme = themeFor(options('dark'));
  assert.equal(theme.background, '#0d0f14');
  assert.equal(theme.palette[0], '#4f9cf9');
  assert.equal(themeFor(options('light')).background, '#ffffff');
});

test('a dark interface theme supplies the chart surface and series colours', () => {
  applyTheme('one-dark-pro');
  const theme = themeFor(options('dark'));
  assert.equal(theme.background, '#282c34');
  assert.equal(theme.text, '#d7dae0');
  assert.equal(theme.palette[0], '#61afef');
  // A card explicitly set to light keeps the neutral light palette.
  const light = themeFor(options('light'));
  assert.equal(light.background, '#ffffff');
  assert.equal(light.palette[0], '#4f9cf9');
});

test('a light interface theme colours light charts and keeps explicit palettes', () => {
  applyTheme('light-modern');
  const theme = themeFor(options('light'));
  assert.equal(theme.background, '#ffffff');
  assert.equal(theme.text, '#1f1f1f');
  assert.equal(theme.palette[0], '#005fb8');
  assert.equal(chartSurfaceBackground(options('light') as never), '#ffffff');

  const mono = themeFor(options('light', 'mono'));
  assert.equal(mono.palette[0], '#cbd5e1');
  assert.equal(mono.mono, true);

  applyTheme(DEFAULT_THEME_ID);
});
