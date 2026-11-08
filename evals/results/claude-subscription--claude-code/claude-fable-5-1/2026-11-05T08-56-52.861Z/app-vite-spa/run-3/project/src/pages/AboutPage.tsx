import { DefinitionList, Flex, Link, Text } from '@gravity-ui/uikit';

import { hrefFor } from '../router';

export function AboutPage() {
  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        О приложении
      </Text>
      <Text as="p" variant="body-2" color="secondary">
        Учебный пример: минимальный SPA без сторонних роутеров, собранный на Vite.
      </Text>

      <DefinitionList>
        <DefinitionList.Item name="Интерфейс">Gravity UI (@gravity-ui/uikit)</DefinitionList.Item>
        <DefinitionList.Item name="Маршрутизация">
          Собственный hook на событии hashchange
        </DefinitionList.Item>
        <DefinitionList.Item name="Тема">
          ThemeProvider из Gravity UI, выбор сохраняется в localStorage
        </DefinitionList.Item>
        <DefinitionList.Item name="Сборка">Vite + TypeScript</DefinitionList.Item>
      </DefinitionList>

      <Text variant="body-1">
        Вернуться на <Link href={hrefFor('/')}>главную</Link> или перейти к{' '}
        <Link href={hrefFor('/notes')}>заметкам</Link>.
      </Text>
    </Flex>
  );
}
