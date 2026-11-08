import { Icon, SegmentedRadioGroup, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

import { useAppTheme } from './AppThemeProvider';

export interface ThemeSwitcherProps {
  size?: 's' | 'm' | 'l' | 'xl';
  className?: string;
}

/**
 * Переключатель светлой/тёмной темы.
 * Текущее значение берётся из `useThemeType()` — это уже «разрешённая» тема
 * (для `theme="system"` вернётся light или dark по настройкам ОС).
 */
export function ThemeSwitcher({ size = 'm', className }: ThemeSwitcherProps) {
  const themeType = useThemeType();
  const { setTheme } = useAppTheme();

  return (
    <SegmentedRadioGroup<ThemeType>
      className={className}
      size={size}
      value={themeType}
      onUpdate={setTheme}
      aria-label="Тема оформления"
      qa="theme-switcher"
    >
      <SegmentedRadioGroup.Option value="light" title="Светлая тема">
        <Icon data={Sun} size={16} /> Светлая
      </SegmentedRadioGroup.Option>
      <SegmentedRadioGroup.Option value="dark" title="Тёмная тема">
        <Icon data={Moon} size={16} /> Тёмная
      </SegmentedRadioGroup.Option>
    </SegmentedRadioGroup>
  );
}
