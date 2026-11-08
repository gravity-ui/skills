import { Switch, type Theme } from '@gravity-ui/uikit';

type AppProps = {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
};

export function App({ theme, onThemeChange }: AppProps) {
  const darkThemeSelected = theme === 'dark';

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={darkThemeSelected}
        onChange={(event) => onThemeChange(event.target.checked ? 'dark' : 'light')}
      >Dark theme</Switch>
    </div>
  );
}
