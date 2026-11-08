import { Button, Flex, Text } from '@gravity-ui/uikit';

import { href } from '../router';

export function NotFoundPage() {
  return (
    <Flex direction="column" gap={3} alignItems="flex-start">
      <Text variant="header-2">Страница не найдена</Text>
      <Text color="secondary">Такого адреса нет в приложении.</Text>
      <Button view="action" href={href('/')}>
        На главную
      </Button>
    </Flex>
  );
}
