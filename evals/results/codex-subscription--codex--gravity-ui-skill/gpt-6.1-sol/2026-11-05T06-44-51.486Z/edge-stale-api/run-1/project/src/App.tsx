import {Switch, Text, useTheme} from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({onThemeChange}: AppProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <main
      style={{
        display: 'grid',
        justifyItems: 'start',
        gap: 'var(--g-spacing-4)',
        padding: 'var(--g-spacing-6)',
      }}
    >
      <Text as="h1" variant="header-1" style={{margin: 0}}>
        Тема интерфейса
      </Text>
      <Switch
        size="l"
        checked={isDark}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <Text as="p" variant="body-1" color="secondary" aria-live="polite" style={{margin: 0}}>
        Сейчас включена {isDark ? 'тёмная' : 'светлая'} тема.
      </Text>
    </main>
  );
}
