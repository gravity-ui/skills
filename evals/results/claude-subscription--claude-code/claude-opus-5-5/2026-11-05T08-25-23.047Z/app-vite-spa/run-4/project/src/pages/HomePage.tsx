import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { href } from '../router';

const features = [
  { title: 'Навигация', text: 'Три страницы, переход по вкладкам в шапке. Работают кнопки «назад/вперёд» браузера.' },
  { title: 'Тёмная тема', text: 'Переключатель справа в шапке. Выбор запоминается между перезагрузками.' },
  { title: 'Gravity UI', text: 'Все элементы интерфейса — компоненты @gravity-ui/uikit.' },
];

export function HomePage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="display-1">Добро пожаловать</Text>
        <Text variant="body-2" color="secondary">
          Небольшое демо-приложение с несколькими страницами и переключением темы.
        </Text>
      </Flex>

      <div className="features">
        {features.map((f) => (
          <Card key={f.title} view="outlined" className="feature-card">
            <Flex direction="column" gap={2}>
              <Text variant="subheader-2">{f.title}</Text>
              <Text color="secondary">{f.text}</Text>
            </Flex>
          </Card>
        ))}
      </div>

      <Flex gap={2}>
        <Button view="action" size="l" href={href('/tasks')}>
          Перейти к задачам
        </Button>
        <Button view="outlined" size="l" href={href('/about')}>
          О приложении
        </Button>
      </Flex>
    </Flex>
  );
}
