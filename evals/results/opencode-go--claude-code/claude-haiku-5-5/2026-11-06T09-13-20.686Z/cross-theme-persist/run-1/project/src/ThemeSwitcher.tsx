import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { type ThemeMode, useThemeMode } from './themeMode';

const OPTIONS: { value: ThemeMode; content: string }[] = [
  { value: 'light', content: 'Light' },
  { value: 'dark', content: 'Dark' },
  { value: 'system', content: 'System' },
];

export function ThemeSwitcher() {
  const { mode, setMode } = useThemeMode();

  return (
    <SegmentedRadioGroup
      name="theme"
      aria-label="Theme"
      value={mode}
      onUpdate={setMode}
      options={OPTIONS}
    />
  );
}
