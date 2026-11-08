import { Switch } from '@gravity-ui/uikit';

interface AppProps {
  theme: 'light' | 'dark';
  onThemeChange: (checked: boolean) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 24,
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
      }}
    >
      <Switch checked={theme === 'dark'} onUpdate={onThemeChange}>
        Тёмная тема
      </Switch>
    </main>
  );
}
