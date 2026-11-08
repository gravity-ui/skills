import { Switch, Text } from '@gravity-ui/uikit';

import { useAppTheme } from './theme';

export function App() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Переключатель темы</Text>
      <Switch checked={theme === 'dark'} onUpdate={toggleTheme} size="l">
        Тёмная тема
      </Switch>
    </div>
  );
}
