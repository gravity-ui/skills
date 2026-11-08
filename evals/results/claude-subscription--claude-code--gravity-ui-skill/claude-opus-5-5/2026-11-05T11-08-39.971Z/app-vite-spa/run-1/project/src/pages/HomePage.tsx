import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import type { PageId } from '../router';

const STATS = [
  { title: 'Активные проекты', value: '3', hint: 'из 5 всего' },
  { title: 'Открытые задачи', value: '24', hint: '+4 за неделю' },
  { title: 'Участники', value: '8', hint: 'в двух командах' },
];

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <Flex className="app-page" direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1">Добро пожаловать</Text>
        <Text variant="body-2" color="secondary">
          Небольшое демо на Gravity UI: боковая навигация между страницами и переключатель светлой и
          тёмной темы (внизу меню или на странице «Настройки»).
        </Text>
      </Flex>

      <Flex className="app-card-grid" gap={4} wrap>
        {STATS.map((stat) => (
          <Card key={stat.title} view="outlined" size="l">
            <Flex direction="column" gap={1} spacing={{ p: 5 }}>
              <Text variant="body-1" color="secondary">
                {stat.title}
              </Text>
              <Text variant="display-1">{stat.value}</Text>
              <Text variant="caption-2" color="hint">
                {stat.hint}
              </Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Flex gap={3} wrap>
        <Button view="action" size="l" onClick={() => onNavigate('projects')}>
          Перейти к проектам
        </Button>
        <Button view="outlined" size="l" onClick={() => onNavigate('settings')}>
          Настройки
        </Button>
      </Flex>
    </Flex>
  );
}
