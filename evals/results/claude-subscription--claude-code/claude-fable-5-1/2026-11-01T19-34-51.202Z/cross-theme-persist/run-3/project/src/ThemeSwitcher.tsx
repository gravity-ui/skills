import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useThemeSwitch } from './ThemeRoot';
import type { AppTheme } from './themeStorage';

const LABELS: Record<AppTheme, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Системная',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSwitch();

  return (
    <SegmentedRadioGroup<AppTheme>
      value={theme}
      onUpdate={setTheme}
      size="m"
      aria-label="Тема оформления"
      qa="theme-switcher"
    >
      <SegmentedRadioGroup.Option value="light">{LABELS.light}</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark">{LABELS.dark}</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="system">{LABELS.system}</SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
