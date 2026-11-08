import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { hrefFor } from '../router';

export function HomePage() {
  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        Главная
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        Небольшое демо‑приложение на React и Gravity UI: несколько страниц,
        навигация между ними по ссылкам и переключатель светлой/тёмной темы в шапке.
      </Text>

      <Flex gap={4} wrap>
        <Card view="filled" style={{ padding: 16, flex: '1 1 240px' }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Навигация</Text>
            <Text variant="body-1" color="secondary">
              Маршруты хранятся в hash части адреса, поэтому страницу можно
              обновить или открыть по прямой ссылке.
            </Text>
            <Button view="outlined" href={hrefFor('/about')}>
              Подробнее
            </Button>
          </Flex>
        </Card>

        <Card view="filled" style={{ padding: 16, flex: '1 1 240px' }}>
          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Тема</Text>
            <Text variant="body-1" color="secondary">
              Выбор темы сохраняется в localStorage, а при первом открытии
              берётся из системных настроек.
            </Text>
            <Button view="action" href={hrefFor('/notes')}>
              К заметкам
            </Button>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
}
