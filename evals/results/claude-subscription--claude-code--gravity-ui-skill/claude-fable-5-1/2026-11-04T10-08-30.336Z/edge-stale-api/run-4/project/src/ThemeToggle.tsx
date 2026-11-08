import { Flex, Icon, Switch, useThemeType } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

import { useThemeSwitcher } from './AppThemeProvider';

/**
 * Light / dark theme switch.
 * `useThemeType()` returns the resolved `'light' | 'dark'` even when the
 * provider theme is `system`, so the control always reflects what is on screen.
 */
export function ThemeToggle() {
  const themeType = useThemeType();
  const { setTheme } = useThemeSwitcher();
  const isDark = themeType === 'dark';

  return (
    <Switch
      size="l"
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      content={
        <Flex alignItems="center" gap={1}>
          <Icon data={isDark ? Moon : Sun} size={16} />
          {isDark ? 'Тёмная тема' : 'Светлая тема'}
        </Flex>
      }
    />
  );
}
