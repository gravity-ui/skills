import {Switch, useThemeValue} from '@gravity-ui/uikit';

import {useAppTheme} from './theme';

/**
 * Light/dark toggle. `useThemeValue()` returns the resolved theme
 * (`system` already mapped to `light`/`dark`), so the switch reflects
 * the real current appearance.
 */
export function ThemeSwitcher() {
  const themeValue = useThemeValue();
  const {setTheme} = useAppTheme();
  const isDark = themeValue === 'dark' || themeValue === 'dark-hc';

  return (
    <Switch
      size="m"
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content="Тёмная тема"
      controlProps={{'aria-label': 'Переключить светлую/тёмную тему'}}
    />
  );
}
