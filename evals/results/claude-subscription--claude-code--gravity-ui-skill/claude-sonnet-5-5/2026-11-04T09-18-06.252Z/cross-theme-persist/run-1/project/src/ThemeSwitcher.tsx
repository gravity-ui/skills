import { SegmentedRadioGroup } from '@gravity-ui/uikit';
import { THEME_OPTIONS, useThemeControl } from './theme';
import type { AppTheme } from './theme';

const LABELS: Record<AppTheme, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Системная',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeControl();

  return (
    <SegmentedRadioGroup<AppTheme>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={setTheme}
      options={THEME_OPTIONS.map((value) => ({ value, content: LABELS[value] }))}
    />
  );
}
