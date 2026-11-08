import { Switch } from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

interface AppProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  const isDark = theme === 'dark';

  return (
    <main style={{ padding: 24 }}>
      <Switch
        checked={isDark}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        content="Тёмная тема"
      />
    </main>
  );
}
