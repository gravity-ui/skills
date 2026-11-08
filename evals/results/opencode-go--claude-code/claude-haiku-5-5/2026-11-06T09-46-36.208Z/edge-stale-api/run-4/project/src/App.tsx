import { useState } from 'react';
import { Card, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  const [theme, setTheme] = useState<ThemeType>('light');

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <Card view="raised" size="l" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Text variant="header-1">Тема оформления</Text>
          <Text variant="body-1">Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}</Text>
          <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
        </Card>
      </div>
    </ThemeProvider>
  );
}
