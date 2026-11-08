import { Button, Flex, Text } from '@gravity-ui/uikit';
import { hrefFor } from '../router';

export function NotFoundPage() {
  return (
    <Flex direction="column" gap={4} alignItems="flex-start">
      <Text variant="display-2" as="h1">
        Страница не найдена
      </Text>
      <Text color="secondary">Такого адреса в приложении нет.</Text>
      <Button view="action" size="l" href={hrefFor('/')}>
        На главную
      </Button>
    </Flex>
  );
}
