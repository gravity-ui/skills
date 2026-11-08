import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { navigate } from '../router';

const SECTIONS = [
  {
    id: 'profile' as const,
    title: 'Профиль',
    description: 'Данные пользователя, роль и статус учётной записи.',
  },
  {
    id: 'settings' as const,
    title: 'Настройки',
    description: 'Переключение светлой и тёмной темы приложения.',
  },
];

export function HomePage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1" as="h1">
          Главная
        </Text>
        <Text variant="body-2" color="secondary">
          Небольшое приложение на Gravity UI: боковая навигация, три страницы и переключатель темы.
          Выберите раздел в меню слева или воспользуйтесь карточками ниже.
        </Text>
      </Flex>

      <Flex gap={4} wrap>
        {SECTIONS.map((section) => (
          <Card
            key={section.id}
            type="container"
            view="outlined"
            size="l"
            style={{ flex: '1 1 280px', minWidth: 0 }}
          >
            <Flex direction="column" gap={3} alignItems="flex-start">
              <Text variant="subheader-3">{section.title}</Text>
              <Text variant="body-1" color="secondary">
                {section.description}
              </Text>
              <Button view="action" onClick={() => navigate(section.id)}>
                Перейти
              </Button>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
