import { Flex, Text } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Переключатель темы</Text>
      <ThemeSwitcher />
    </Flex>
  );
}
