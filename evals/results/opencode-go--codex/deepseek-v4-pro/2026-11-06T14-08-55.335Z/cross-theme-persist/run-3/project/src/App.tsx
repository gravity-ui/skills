import { Switch } from '@gravity-ui/uikit';
import { useThemeSwitch } from './main';

export function App() {
  const { theme, setTheme } = useThemeSwitch();

  function handleUpdate(checked: boolean) {
    setTheme(checked ? 'dark' : 'light');
  }

  return (
    <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
      <Switch
        checked={theme === 'dark' || theme === 'dark-hc'}
        onUpdate={handleUpdate}
        content="Dark theme"
      />
    </div>
  );
}
