import React from 'react';
import { Card, Flex, Text } from '@gravity-ui/uikit';

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <Card type="container" view="outlined" size="l" spacing={{ p: 5 }} style={{ flex: '1 1 240px' }}>
      <Flex direction="column" gap={2}>
        <Text variant="subheader-2">{title}</Text>
        <Text variant="body-2">{text}</Text>
      </Flex>
    </Card>
  );
}

export function HomePage() {
  return (
    <Flex direction="column" gap={5}>
      <Text variant="body-1">
        Небольшое демо на компонентах Gravity UI: навигация между страницами и переключение светлой и тёмной темы.
      </Text>
      <Flex gap={4} wrap>
        <FeatureCard title="Навигация" text="Боковое меню переключает страницы и отражается в адресе (#/tasks, #/settings)." />
        <FeatureCard title="Тема" text="Переключатель в шапке меняет тему. Выбор сохраняется в браузере." />
        <FeatureCard title="Задачи" text="Список дел хранится в localStorage и не пропадает при переходах." />
      </Flex>
    </Flex>
  );
}
