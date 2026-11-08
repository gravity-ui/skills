import {Switch, Text, useThemeValue} from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({onThemeChange}: AppProps) {
  const theme = useThemeValue();

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--g-spacing-4)',
        padding: 'var(--g-spacing-6)',
        color: 'var(--g-color-text-primary)',
        background: 'var(--g-color-base-background)',
      }}
    >
      <Text as="h1" variant="header-1" style={{margin: 0}}>
        Тема оформления
      </Text>
      <Switch
        size="l"
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <Text as="p" variant="body-1" color="secondary" style={{margin: 0}}>
        Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
      </Text>
    </main>
  );
}
