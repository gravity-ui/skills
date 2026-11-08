import { SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { type AppTheme, useThemeControl } from './theme';

const THEME_OPTIONS: { value: AppTheme; content: string }[] = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
  { value: 'system', content: 'Системная' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeControl();

  return (
    <SegmentedRadioGroup<AppTheme>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={setTheme}
      options={THEME_OPTIONS}
    />
  );
}

export function App() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Text variant="subheader-2">Тема</Text>
      <ThemeSwitcher />
    </div>
  );
}
