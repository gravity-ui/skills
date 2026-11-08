import { Switch, useThemeType } from '@gravity-ui/uikit';

interface AppProps {
  onToggleTheme: () => void;
}

export function App({ onToggleTheme }: AppProps) {
  const themeType = useThemeType();

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={themeType === 'dark'}
        onUpdate={onToggleTheme}
        content={themeType === 'dark' ? 'Dark' : 'Light'}
      />
    </div>
  );
}
