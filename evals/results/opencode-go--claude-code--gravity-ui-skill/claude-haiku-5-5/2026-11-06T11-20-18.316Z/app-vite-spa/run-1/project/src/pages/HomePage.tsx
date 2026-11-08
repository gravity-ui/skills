import { Box, Flex, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4}>
        <Text variant="display-1">Добро пожаловать</Text>
        <Text variant="body-2" color="secondary">
          Небольшое демо на Gravity UI: навигация между страницами в боковом меню и переключение
          светлой и тёмной темы внизу меню.
        </Text>
      </Flex>
    </Box>
  );
}
