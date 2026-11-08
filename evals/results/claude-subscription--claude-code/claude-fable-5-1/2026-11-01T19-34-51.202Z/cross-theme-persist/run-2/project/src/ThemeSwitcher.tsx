import { SegmentedRadioGroup } from '@gravity-ui/uikit';

import type { AppTheme } from './themeStorage';

interface ThemeSwitcherProps {
  value: AppTheme;
  onChange: (theme: AppTheme) => void;
}

export function ThemeSwitcher({ value, onChange }: ThemeSwitcherProps) {
  return (
    <SegmentedRadioGroup<AppTheme>
      name="theme"
      aria-label="Theme"
      value={value}
      onUpdate={onChange}
      qa="theme-switcher"
    >
      <SegmentedRadioGroup.Option value="light">
        Light
      </SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark">
        Dark
      </SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
