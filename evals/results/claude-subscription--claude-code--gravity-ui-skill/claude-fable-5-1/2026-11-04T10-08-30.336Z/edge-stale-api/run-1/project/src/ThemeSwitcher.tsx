import {Moon, Sun} from '@gravity-ui/icons';
import {Flex, Icon, Switch, Text, useThemeType} from '@gravity-ui/uikit';
import type {RealTheme} from '@gravity-ui/uikit';

export interface ThemeSwitcherProps {
  /** Called with the theme the user picked ("light" or "dark"). */
  onThemeChange: (theme: RealTheme) => void;
}

/**
 * Light/dark toggle. Reads the resolved theme type from the nearest
 * ThemeProvider (so "system" / "*-hc" themes are handled), and asks the
 * owner of ThemeProvider to switch the `theme` prop.
 */
export function ThemeSwitcher({onThemeChange}: ThemeSwitcherProps) {
  const themeType = useThemeType();
  const isDark = themeType === 'dark';

  return (
    <Flex alignItems="center" gap={2}>
      <Icon data={Sun} size={16} color={isDark ? 'secondary' : 'primary'} />
      <Switch
        size="m"
        checked={isDark}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        controlProps={{'aria-label': 'Toggle dark theme'}}
      />
      <Icon data={Moon} size={16} color={isDark ? 'primary' : 'secondary'} />
      <Text variant="body-1" color="secondary">
        {isDark ? 'Dark' : 'Light'}
      </Text>
    </Flex>
  );
}
