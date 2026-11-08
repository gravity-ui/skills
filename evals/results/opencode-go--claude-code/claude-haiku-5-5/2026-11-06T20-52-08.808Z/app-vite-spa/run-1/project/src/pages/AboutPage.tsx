import { Card, Flex, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        О приложении
      </Text>
      <Card type="container" view="outlined" size="l">
        <Flex direction="column" gap={3}>
          <Text variant="body-2">
            Стек: React, TypeScript, Vite и Gravity UI.
          </Text>
          <Text variant="body-2">
            Навигация работает по hash-адресам (#/tasks, #/about), поэтому кнопка «Назад» в браузере тоже работает.
          </Text>
          <Text variant="body-2">
            Тема сохраняется в localStorage. Если выбора ещё не было, используется тема системы.
          </Text>
          <Text variant="body-2">Задачи тоже хранятся в localStorage и не теряются при переходе между страницами.</Text>
        </Flex>
      </Card>
    </Flex>
  );
}
