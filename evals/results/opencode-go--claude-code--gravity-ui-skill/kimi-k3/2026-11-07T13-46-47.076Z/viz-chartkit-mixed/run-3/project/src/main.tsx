import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

// ChartKit keeps a global plugin registry that must be populated at app entry,
// before any <ChartKit> renders. Plugin renderers are React.lazy, so each
// engine's bundle is fetched only when a chart of that type first appears.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin]});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
