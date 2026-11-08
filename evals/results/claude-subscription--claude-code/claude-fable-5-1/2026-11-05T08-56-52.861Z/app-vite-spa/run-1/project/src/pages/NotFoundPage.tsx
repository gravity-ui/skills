import { Button, Flex, Text } from '@gravity-ui/uikit';

import { navigate } from '../router';

export function NotFoundPage() {
  return (
    <Flex direction="column" gap={4} alignItems="flex-start">
      <Text variant="display-1" as="h1" style={{ margin: 0 }}>
        Страница не найдена
      </Text>
      <Text variant="body-2" color="secondary" as="p" style={{ margin: 0 }}>
        Такого адреса нет: <code>{window.location.hash || '#/'}</code>
      </Text>
      <Button view="action" onClick={() => navigate('home')}>
        На главную
      </Button>
    </Flex>
  );
}
