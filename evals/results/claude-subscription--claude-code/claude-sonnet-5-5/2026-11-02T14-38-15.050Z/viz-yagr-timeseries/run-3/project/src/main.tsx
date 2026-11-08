import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

function Root() {
  const [dark, setDark] = React.useState(false);

  return (
    <ThemeProvider theme={dark ? 'dark' : 'light'}>
      <App dark={dark} onDarkChange={setDark} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
