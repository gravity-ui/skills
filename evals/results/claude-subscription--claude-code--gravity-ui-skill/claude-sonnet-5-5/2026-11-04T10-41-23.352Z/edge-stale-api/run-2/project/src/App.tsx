import {Flex, Text} from '@gravity-ui/uikit';
import {ThemeToggle} from './ThemeToggle';

export function App() {
  return (
    <Flex direction="column" gap={4} style={{padding: 24}}>
      <ThemeToggle />
      <Text variant="body-2">Переключатель светлой и тёмной темы</Text>
    </Flex>
  );
}
