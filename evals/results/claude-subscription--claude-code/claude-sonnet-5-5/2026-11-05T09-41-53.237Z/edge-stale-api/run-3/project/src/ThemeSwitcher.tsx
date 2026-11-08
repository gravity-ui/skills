import { SegmentedRadioGroup, useTheme, type Theme } from '@gravity-ui/uikit';

import { useSetTheme } from './theme';

export function ThemeSwitcher() {
  // useTheme() возвращает выбранную настройку ('light' | 'dark' | 'system' | ...),
  // а не вычисленную тему — поэтому «Системная» корректно подсвечивается.
  const theme = useTheme();
  const setTheme = useSetTheme();

  return (
    <SegmentedRadioGroup<Theme>
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
