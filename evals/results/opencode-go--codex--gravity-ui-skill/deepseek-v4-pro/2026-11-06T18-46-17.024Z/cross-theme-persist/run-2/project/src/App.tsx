import { Switch, useTheme } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useTheme();

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Dark theme
      </Switch>
    </div>
  );
}
