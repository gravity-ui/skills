import React from 'react';
import {Card, SegmentedRadioGroup, Text, ThemeProvider} from '@gravity-ui/uikit';

import {applyThemeToBody, getInitialTheme, saveTheme, type Theme} from './theme';

export function App() {
  // Lazy initializer: the saved theme is restored from localStorage on first render.
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    saveTheme(theme);
    applyThemeToBody(theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 24, maxWidth: 480, margin: '0 auto'}}>
        <Card style={{padding: 24}}>
          <Text variant="header-1" as="h1">
            Переключатель темы
          </Text>
          <div style={{marginTop: 16, marginBottom: 8}}>
            <Text variant="body-1" color="secondary">
              Выбранная тема сохраняется в localStorage и восстанавливается после перезагрузки
              страницы.
            </Text>
          </div>
          <SegmentedRadioGroup
            name="theme"
            value={theme}
            onUpdate={(value) => setTheme(value as Theme)}
            options={[
              {value: 'light', content: 'Светлая'},
              {value: 'dark', content: 'Тёмная'},
            ]}
          />
          <div style={{marginTop: 16}}>
            <Text variant="body-2" color="secondary">
              Текущая тема: {theme === 'light' ? 'светлая' : 'тёмная'}
            </Text>
          </div>
        </Card>
      </div>
    </ThemeProvider>
  );
}
