import { Card, Switch, Text } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

export interface AppProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
      <Switch
        size="l"
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>

      <Card view="outlined" size="l" style={{ padding: 24 }}>
        <Text variant="header-1">Пример карточки</Text>
        <Text color="secondary">
          Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
        </Text>
      </Card>
    </div>
  );
}
