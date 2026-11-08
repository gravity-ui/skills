// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
// Base styles for the grid engine underneath @gravity-ui/dashkit
// (dashkit's own component styles are self-imported by its modules).
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
// Custom app styles must come AFTER the design-system styles.
import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import {Root} from './Root';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
