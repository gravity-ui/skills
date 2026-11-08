import { Button, Icon, Flex, Text } from '@gravity-ui/uikit';
import { Sun, Moon } from '@gravity-ui/icons';

interface AppProps {
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function App({ currentTheme, toggleTheme }: AppProps) {
  return (
    <Flex gap={4} alignItems="center" style={{ padding: 24 }}>
      <Text variant="header-1">Theme toggle demo</Text>
      <Button view="outlined" onClick={toggleTheme}>
        <Icon data={currentTheme === 'light' ? Sun : Moon} size={16} />
        {currentTheme === 'light' ? 'Light' : 'Dark'}
      </Button>
    </Flex>
  );
}
