import {useState} from 'react';
import type {Theme} from '@gravity-ui/uikit';
import {Box, Flex, Icon, Switch, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

function ThemeToggle({onChange}: {onChange: (theme: Theme) => void}) {
  const themeValue = useThemeValue();
  const dark = themeValue === 'dark';

  return (
    <Switch
      checked={dark}
      onUpdate={(checked) => onChange(checked ? 'dark' : 'light')}
      content={
        <Flex gap={2} alignItems="center">
          <Icon data={dark ? Moon : Sun} size={16} />
          <Text variant="body-2">{dark ? 'Тёмная тема' : 'Светлая тема'}</Text>
        </Flex>
      }
    />
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeProvider theme={theme}>
      <Box spacing={{p: 6}}>
        <Flex direction="column" gap={4}>
          <Text variant="header-1">Тема оформления</Text>
          <ThemeToggle onChange={setTheme} />
        </Flex>
      </Box>
    </ThemeProvider>
  );
}
