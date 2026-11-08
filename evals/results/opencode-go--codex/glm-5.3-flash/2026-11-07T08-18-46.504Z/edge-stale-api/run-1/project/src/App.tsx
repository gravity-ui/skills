import { useTheme, Switch } from '@gravity-ui/uikit';

interface AppProps {
  onThemeChange: (checked: boolean) => void;
}

export function App({ onThemeChange }: AppProps) {
  const theme = useTheme();

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={theme === 'dark'}
        onUpdate={onThemeChange}
      >
        Dark theme
      </Switch>
    </div>
  );
}
