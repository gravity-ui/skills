import { Switch, useThemeType } from '@gravity-ui/uikit';

import { useThemeMode } from './useThemeMode';

export function App() {
  const themeType = useThemeType();
  const [themeMode, setThemeMode] = useThemeMode();

  return (
    <main style={{ background: 'var(--g-color-base-background)', color: 'var(--g-color-text-primary)', padding: 24 }}>
      <Switch
        checked={themeMode === 'dark'}
        title="Переключить тему"
        onUpdate={(checked) => setThemeMode(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <p>Активная тема: {themeType}</p>
    </main>
  );
}
