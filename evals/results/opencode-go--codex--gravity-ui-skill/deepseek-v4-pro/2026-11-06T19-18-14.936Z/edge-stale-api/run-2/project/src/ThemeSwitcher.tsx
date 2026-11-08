import React from 'react';
import { Switch, Icon, Flex } from '@gravity-ui/uikit';
import { Sun, Moon } from '@gravity-ui/icons';

import { useThemeContext } from './ThemeContext';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();
  const isDark = theme === 'dark';

  return (
    <Switch
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content={
        <Flex gap={1} alignItems="center">
          <Icon data={isDark ? Moon : Sun} size={16} />
        </Flex>
      }
    />
  );
}
