import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {useThemeSetting} from './theme-storage';
import type {AppTheme} from './theme-storage';

const LABELS: Record<AppTheme, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Системная',
};

export function ThemeSwitcher() {
  const {theme, setTheme} = useThemeSetting();

  return (
    <SegmentedRadioGroup<AppTheme>
      aria-label="Тема оформления"
      value={theme}
      onUpdate={setTheme}
    >
      <SegmentedRadioGroup.Option value="light">{LABELS.light}</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark">{LABELS.dark}</SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="system">{LABELS.system}</SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
