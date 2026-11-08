import { Icon, Switch, useThemeType } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

import { useAppTheme } from './theme/AppThemeProvider';

/**
 * Переключатель светлой/тёмной темы.
 * `useThemeType()` — хук uikit, который отдаёт фактический тип темы
 * ('light' | 'dark') с учётом hc-вариантов и системной темы.
 */
export function ThemeSwitcher() {
  const { toggleTheme } = useAppTheme();
  const isDark = useThemeType() === 'dark';

  return (
    <Switch
      size="l"
      checked={isDark}
      onUpdate={toggleTheme}
      qa="theme-switcher"
      title={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      content={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon data={isDark ? Moon : Sun} size={16} />
          {isDark ? 'Тёмная тема' : 'Светлая тема'}
        </span>
      }
    />
  );
}
