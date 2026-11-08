import {Card, Switch, Text} from '@gravity-ui/uikit';

import type {Theme} from './theme';

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({theme, onThemeChange}: AppProps) {
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        boxSizing: 'border-box',
        background: 'var(--g-color-base-background)',
      }}
    >
      <Card style={{padding: 24, minWidth: 320}}>
        <Text variant="header-1">Переключатель темы</Text>

        <div style={{marginTop: 16}}>
          <Switch
            size="l"
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
          >
            Тёмная тема
          </Switch>
        </div>

        <div style={{marginTop: 12}}>
          <Text variant="body-1" color="secondary">
            Текущая тема: {isDark ? 'тёмная' : 'светлая'}. Выбор сохраняется в localStorage и
            восстанавливается после перезагрузки страницы.
          </Text>
        </div>
      </Card>
    </div>
  );
}
