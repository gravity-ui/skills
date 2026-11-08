import { Flex, Icon, Switch, useThemeType } from '@gravity-ui/uikit';
import type { SwitchProps } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

import { useAppTheme } from './AppThemeProvider';

export interface ThemeSwitcherProps {
  size?: SwitchProps['size'];
  /** Показывать подпись рядом с иконкой. */
  showLabel?: boolean;
  className?: string;
}

/**
 * Переключатель светлой/тёмной темы.
 *
 * Текущее значение читается через `useThemeType()` из uikit — он возвращает
 * 'light' | 'dark' для любой реальной темы (в т.ч. контрастных `*-hc`).
 * Запись идёт через наш контекст, потому что `ThemeProvider` контролируемый.
 */
export function ThemeSwitcher({ size = 'm', showLabel = true, className }: ThemeSwitcherProps) {
  const themeType = useThemeType();
  const { setTheme } = useAppTheme();
  const isDark = themeType === 'dark';
  const label = isDark ? 'Тёмная тема' : 'Светлая тема';

  return (
    <Switch
      className={className}
      size={size}
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      title={label}
      controlProps={{ 'aria-label': showLabel ? undefined : label }}
      qa="theme-switcher"
    >
      <Flex alignItems="center" gap={1}>
        <Icon data={isDark ? Moon : Sun} size={16} />
        {showLabel ? label : null}
      </Flex>
    </Switch>
  );
}
