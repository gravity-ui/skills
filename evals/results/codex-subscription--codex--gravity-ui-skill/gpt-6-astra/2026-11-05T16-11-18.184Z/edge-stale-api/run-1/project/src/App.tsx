import { Switch, Text, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useThemeType();

  return (
    <main
      style={{
        display: 'grid',
        gap: 'var(--g-spacing-4)',
        padding: 'var(--g-spacing-6)',
      }}
    >
      <Text as="h1" variant="header-1" style={{ margin: 0 }}>
        Оформление
      </Text>
      <Switch
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <Text variant="body-1">
        Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
      </Text>
    </main>
  );
}
