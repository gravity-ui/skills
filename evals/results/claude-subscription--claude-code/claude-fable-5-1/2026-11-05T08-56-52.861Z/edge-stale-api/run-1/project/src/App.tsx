import * as React from 'react';
import { Button, Card, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';
import { AppThemeContext, AppThemeProvider } from './theme/AppThemeProvider';

function AppContent() {
  const themeValue = useThemeValue();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="header-1">Gravity UI</Text>
        <ThemeSwitcher />
      </header>

      <Card view="filled" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Text variant="subheader-2">
          Текущая тема: <Text variant="code-2">{themeValue}</Text>
        </Text>
        <Text color="secondary">
          Выбор сохраняется в localStorage и восстанавливается при следующем открытии.
        </Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button view="action">Action</Button>
          <Button view="normal">Normal</Button>
          <Button view="outlined">Outlined</Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * Если приложение уже обёрнуто в `AppThemeProvider` (см. main.tsx) — рендерим
 * содержимое как есть; иначе оборачиваем сами, чтобы переключатель работал
 * и при встраивании `<App />` в чужое дерево.
 */
export function App() {
  const hasAppTheme = React.useContext(AppThemeContext) !== undefined;

  if (hasAppTheme) {
    return <AppContent />;
  }

  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
