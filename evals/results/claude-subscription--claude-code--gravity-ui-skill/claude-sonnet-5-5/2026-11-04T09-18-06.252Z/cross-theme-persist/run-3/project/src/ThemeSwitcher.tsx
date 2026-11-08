import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useThemeSwitcher, type AppTheme } from './theme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSwitcher();

  return (
    <SegmentedRadioGroup<AppTheme>
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
