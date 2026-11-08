import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import { useThemeSetting, type ThemeSetting } from './theme';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSetting();

  return (
    <SegmentedRadioGroup
      aria-label="Тема оформления"
      value={theme}
      onUpdate={(value) => setTheme(value as ThemeSetting)}
    >
      <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
