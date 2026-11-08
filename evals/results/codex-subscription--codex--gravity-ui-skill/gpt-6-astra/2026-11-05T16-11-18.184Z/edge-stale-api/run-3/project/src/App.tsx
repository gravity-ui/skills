import { Switch, Text, useThemeValue, type ThemeType } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useThemeValue();
  const isDark = theme === 'dark';

  return (
    <main
      style={{
        display: 'grid',
        gap: 'var(--g-spacing-4)',
        padding: 'var(--g-spacing-6)',
        color: 'var(--g-color-text-primary)',
        backgroundColor: 'var(--g-color-base-background)',
      }}
    >
      <Text as="h1" variant="header-1" style={{ margin: 0 }}>
        Тема интерфейса
      </Text>
      <Switch
        checked={isDark}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <Text color="secondary" aria-live="polite">
        Сейчас включена {isDark ? 'тёмная' : 'светлая'} тема.
      </Text>
    </main>
  );
}
