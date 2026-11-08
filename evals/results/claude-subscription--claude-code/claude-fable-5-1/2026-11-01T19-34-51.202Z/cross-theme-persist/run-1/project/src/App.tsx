import { SegmentedRadioGroup, Text, ThemeProvider, useThemeValue } from '@gravity-ui/uikit';

import { type AppTheme, usePersistedTheme } from './theme';

const THEME_OPTIONS: { value: AppTheme; content: string }[] = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Системная' },
];

interface ThemeSwitcherProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  // Реально применённая тема: для `system` это `light` или `dark` в зависимости от ОС.
  const resolvedTheme = useThemeValue();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SegmentedRadioGroup<AppTheme>
        aria-label="Тема оформления"
        qa="theme-switcher"
        value={theme}
        onUpdate={onThemeChange}
        options={THEME_OPTIONS}
      />
      <Text variant="body-1" color="secondary" qa="theme-current">
        Текущая тема: {resolvedTheme}
      </Text>
    </div>
  );
}

export function App() {
  // Выбор сохраняется в localStorage и восстанавливается после перезагрузки страницы.
  const [theme, setTheme] = usePersistedTheme();

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24, minHeight: '100vh', boxSizing: 'border-box' }}>
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      </div>
    </ThemeProvider>
  );
}
