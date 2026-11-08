import { Flex, Switch, Text } from '@gravity-ui/uikit';

interface AppProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={3} spacing={{ p: 6 }}>
      <Text variant="header-1">Theme switcher</Text>
      <Flex alignItems="center" gap={3}>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        >
          Dark theme
        </Switch>
        <Text variant="body-1">Current theme: {theme}</Text>
      </Flex>
    </Flex>
  );
}
