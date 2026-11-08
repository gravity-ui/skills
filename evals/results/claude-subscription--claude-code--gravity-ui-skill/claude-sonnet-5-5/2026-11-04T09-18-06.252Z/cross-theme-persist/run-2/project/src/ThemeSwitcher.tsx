import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useThemeChoice } from './theme';
import type { ThemeChoice } from './theme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeChoice();

  return (
    <SegmentedRadioGroup<ThemeChoice>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={setTheme}
    >
      <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
