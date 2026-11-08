import { Text, type ThemeType } from '@gravity-ui/uikit';

import { ThemeSwitch } from './ThemeSwitch';

export interface AppProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <ThemeSwitch theme={theme} onThemeChange={onThemeChange} />
      <Text variant="body-2" color="secondary">
        Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
      </Text>
    </div>
  );
}
