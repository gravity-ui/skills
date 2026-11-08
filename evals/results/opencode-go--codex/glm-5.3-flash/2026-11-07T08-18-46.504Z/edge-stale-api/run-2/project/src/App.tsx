import { useState } from 'react';
import { Provider, type Theme } from '@gravity-ui/uikit';

import { ThemeToggle } from './ThemeToggle';

export function App() {
  const [theme, setTheme] = useState<Theme>('system');

  return (
    <Provider theme={theme}>
      <main style={{ display: 'grid', gap: 24, padding: 24 }}>
        <ThemeToggle setTheme={setTheme} />
      </main>
    </Provider>
  );
}
