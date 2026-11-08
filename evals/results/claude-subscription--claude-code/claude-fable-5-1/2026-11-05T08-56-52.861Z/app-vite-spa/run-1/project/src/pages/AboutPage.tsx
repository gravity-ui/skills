import { Card, DefinitionList, DefinitionListItem, Flex, Label, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Flex direction="column" gap={6}>
      <div>
        <Text variant="display-1" as="h1" style={{ margin: 0 }}>
          О проекте
        </Text>
        <Text variant="body-2" color="secondary" as="p">
          Что внутри и как это устроено.
        </Text>
      </div>

      <Card view="outlined" style={{ padding: 20 }}>
        <DefinitionList>
          <DefinitionListItem name="Фреймворк">React 18 + TypeScript</DefinitionListItem>
          <DefinitionListItem name="Сборка">Vite</DefinitionListItem>
          <DefinitionListItem name="UI-кит">Gravity UI</DefinitionListItem>
          <DefinitionListItem name="Маршрутизация">
            Собственный hash-роутер без внешних зависимостей
          </DefinitionListItem>
          <DefinitionListItem name="Тема">
            Переключатель светлой/тёмной темы, значение хранится в localStorage
          </DefinitionListItem>
        </DefinitionList>
      </Card>

      <Flex gap={2} wrap>
        <Label theme="info">react</Label>
        <Label theme="success">typescript</Label>
        <Label theme="warning">vite</Label>
        <Label theme="utility">gravity-ui</Label>
      </Flex>
    </Flex>
  );
}
