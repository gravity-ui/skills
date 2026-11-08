import { Switch, useThemeValue } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useThemeValue();

  return (
    <main style={{ padding: 24 }}>
      <Switch
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
    </main>
  );
}
