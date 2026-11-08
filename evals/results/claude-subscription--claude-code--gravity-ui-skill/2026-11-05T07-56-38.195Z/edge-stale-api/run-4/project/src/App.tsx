import { Flex, Text, type ThemeType } from '@gravity-ui/uikit';

import { ThemeToggle } from './ThemeToggle';

export interface AppProps {
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Настройки</Text>
      <ThemeToggle onThemeChange={onThemeChange} />
    </Flex>
  );
}
