import * as React from 'react';
import { SegmentedRadioGroup, Text, ThemeProvider, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): ThemeType {
  const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : 'light';
}

interface ThemeSwitcherProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <SegmentedRadioGroup<ThemeType>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={onThemeChange}
      options={[
        { value: 'light', content: 'Светлая' },
        { value: 'dark', content: 'Тёмная' },
      ]}
    />
  );
}

function Content({ theme, onThemeChange }: ThemeSwitcherProps) {
  // Тип темы берём из контекста ThemeProvider, чтобы показать фактически применённую тему.
  const themeType = useThemeType();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="header-1">Тема оформления</Text>
      <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
      <Text color="secondary">
        Текущая тема: {themeType === 'dark' ? 'тёмная' : 'светлая'}
      </Text>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = React.useState<ThemeType>(getInitialTheme);

  const handleThemeChange = React.useCallback((next: ThemeType) => {
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Content theme={theme} onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}
