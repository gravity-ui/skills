import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import type { RouteId } from '../useHashRoute';

interface Props {
  onNavigate: (id: RouteId) => void;
}

const FEATURES = [
  { title: 'Навигация', text: 'Боковое меню AsideHeader с переходами между страницами.' },
  { title: 'Темы', text: 'Светлая и тёмная тема переключаются одним кликом и запоминаются.' },
  { title: 'Gravity UI', text: 'Все цвета и отступы берутся из токенов дизайн-системы.' },
];

export function HomePage({ onNavigate }: Props) {
  return (
    <div className="page">
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <Text variant="display-1">Добро пожаловать</Text>
          <Text variant="body-2" color="secondary">
            Небольшое приложение на Gravity UI из трёх страниц.
          </Text>
        </Flex>

        <div className="page__card-grid">
          {FEATURES.map((feature) => (
            <Card key={feature.title} type="container" view="outlined" className="page__card">
              <Flex direction="column" gap={2}>
                <Text variant="subheader-2">{feature.title}</Text>
                <Text variant="body-1" color="secondary">
                  {feature.text}
                </Text>
              </Flex>
            </Card>
          ))}
        </div>

        <Flex gap={3} wrap>
          <Button view="action" size="l" onClick={() => onNavigate('components')}>
            Смотреть компоненты
          </Button>
          <Button view="outlined" size="l" onClick={() => onNavigate('settings')}>
            Открыть настройки
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
