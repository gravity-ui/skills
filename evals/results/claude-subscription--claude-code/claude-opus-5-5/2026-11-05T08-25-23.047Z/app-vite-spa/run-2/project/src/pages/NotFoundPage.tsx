import { Flex, Link, Text } from '@gravity-ui/uikit';

export function NotFoundPage() {
  return (
    <Flex direction="column" gap={3}>
      <Text as="h1" variant="display-1">
        Страница не найдена
      </Text>
      <Text color="secondary">Такого адреса в приложении нет.</Text>
      <Link href="#/">Вернуться на главную</Link>
    </Flex>
  );
}
