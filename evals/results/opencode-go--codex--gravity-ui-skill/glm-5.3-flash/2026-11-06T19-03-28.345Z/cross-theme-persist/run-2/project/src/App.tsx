import { Switch } from '@gravity-ui/uikit';

interface AppProps {
  darkThemeEnabled: boolean;
  onDarkThemeEnabledChange: (enabled: boolean) => void;
}

export function App({ darkThemeEnabled, onDarkThemeEnabledChange }: AppProps) {
  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={darkThemeEnabled}
        onChange={(event) => onDarkThemeEnabledChange(event.target.checked)}
      >
        Тёмная тема
      </Switch>
    </div>
  );
}
