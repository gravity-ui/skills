import { Switch, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useThemeType();

  return (
    <main style={{ padding: 'var(--g-spacing-6)' }}>
      <Switch
        size="l"
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <p role="status">Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.</p>
    </main>
  );
}
