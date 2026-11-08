import {Switch} from '@gravity-ui/uikit';
import {useThemeSwitch} from './theme';

export function ThemeToggle() {
  const {theme, setTheme} = useThemeSwitch();
  const isDark = theme === 'dark';

  return (
    <Switch
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content={isDark ? 'Тёмная тема' : 'Светлая тема'}
      controlProps={{'aria-label': 'Переключить тёмную тему'}}
    />
  );
}
