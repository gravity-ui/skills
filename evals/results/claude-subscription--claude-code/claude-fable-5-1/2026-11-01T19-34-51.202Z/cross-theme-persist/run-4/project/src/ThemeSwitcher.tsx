import { Icon, SegmentedRadioGroup } from '@gravity-ui/uikit';
import { Display, Moon, Sun } from '@gravity-ui/icons';

import { useAppTheme } from './theme';
import type { AppTheme } from './themeStorage';

const OPTIONS: Array<{ value: AppTheme; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Тёмная', icon: Moon },
  { value: 'system', label: 'Системная', icon: Display },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme();

  return (
    <SegmentedRadioGroup<AppTheme>
      value={theme}
      onUpdate={setTheme}
      aria-label="Тема оформления"
      qa="theme-switcher"
    >
      {OPTIONS.map(({ value, label, icon }) => (
        <SegmentedRadioGroup.Option key={value} value={value}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon data={icon} size={16} />
            {label}
          </span>
        </SegmentedRadioGroup.Option>
      ))}
    </SegmentedRadioGroup>
  );
}
