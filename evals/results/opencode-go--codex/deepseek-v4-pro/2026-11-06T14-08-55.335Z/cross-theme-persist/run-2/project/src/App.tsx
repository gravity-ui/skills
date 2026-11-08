import { Switch, Text } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

export interface AppProps {
  theme: AppTheme;
  onToggleTheme: (checked: boolean) => void;
}

export function App({ theme, onToggleTheme }: AppProps) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Text variant="body-2">🌙 Dark theme</Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={onToggleTheme}
        />
      </div>
      <Text variant="header-1">Hello, world!</Text>
    </div>
  );
}
