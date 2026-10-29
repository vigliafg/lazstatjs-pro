import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { applyTheme, loadStoredTheme, DEFAULT_THEME_ID } from './theme';
import './index.css';

// Apply the last theme before the first render: the autosave also carries it,
// but reading the tiny preference avoids a flash on every reload.
applyTheme(loadStoredTheme() ?? DEFAULT_THEME_ID);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
