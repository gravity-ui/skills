import { Box, Flex, Switch, Text } from '@gravity-ui/uikit';

interface AppProps {
  theme: 'light' | 'dark';
  onThemeChange: (isDark: boolean) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Box spacing={{ p: 4 }}>
      <Flex alignItems="center" gap={3}>
        <Text variant="body-1">Тема</Text>
        <Switch
          checked={theme === 'dark'}
          onChange={(event) => onThemeChange(event.target.checked)}
        >
          Тёмная
        </Switch>
      </Flex>
    </Box>
  );
}
