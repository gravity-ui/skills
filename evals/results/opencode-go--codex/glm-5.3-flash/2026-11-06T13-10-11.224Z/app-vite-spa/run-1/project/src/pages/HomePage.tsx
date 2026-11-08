import { Button, Flex, Text } from '@gravity-ui/uikit';

export function HomePage({ onNavigate }: { onNavigate?: (page: 'features') => void }) {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h2">Добро пожаловать</Text>
      <Text variant="body-1">
        Это небольшое React-приложение с тремя страницами и переключением темы.
      </Text>
      {onNavigate && <Button onClick={() => onNavigate('features')}>Посмотреть возможности</Button>}
    </Flex>
  );
}
