import { ArrowRight, CircleCheck, Clock, ListCheck } from '@gravity-ui/icons';
import { Button, Card, Flex, Icon, Text } from '@gravity-ui/uikit';
import type { IconData } from '@gravity-ui/uikit';

import type { Task } from '../tasks';
import type { PageId } from '../useHashRoute';

interface HomePageProps {
  tasks: Task[];
  onNavigate: (page: PageId) => void;
}

interface Stat {
  title: string;
  value: number;
  icon: IconData;
}

export function HomePage({ tasks, onNavigate }: HomePageProps) {
  const done = tasks.filter((task) => task.done).length;

  const stats: Stat[] = [
    { title: 'Всего задач', value: tasks.length, icon: ListCheck },
    { title: 'Выполнено', value: done, icon: CircleCheck },
    { title: 'В работе', value: tasks.length - done, icon: Clock },
  ];

  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1" as="h1">
          Главная
        </Text>
        <Text color="secondary">
          Небольшое приложение на Gravity UI: навигация слева, переключатель темы — внизу боковой
          панели и на странице настроек.
        </Text>
      </Flex>

      <div className="app-stats">
        {stats.map((stat) => (
          <Card key={stat.title} view="outlined" className="app-stat">
            <Flex alignItems="center" gap={3}>
              <span className="app-stat__icon">
                <Icon data={stat.icon} size={20} />
              </span>
              <Flex direction="column" style={{ minWidth: 0 }}>
                <Text variant="display-1">{stat.value}</Text>
                <Text color="secondary" ellipsis>
                  {stat.title}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </div>

      <Card view="filled" className="app-panel">
        <Flex direction="column" gap={3} alignItems="flex-start">
          <Text variant="subheader-2">Что дальше?</Text>
          <Text>Откройте список задач, чтобы отметить выполненные или добавить новые.</Text>
          <Flex gap={2} wrap>
            <Button view="action" onClick={() => onNavigate('tasks')}>
              К задачам
              <Icon data={ArrowRight} size={16} />
            </Button>
            <Button view="outlined" onClick={() => onNavigate('settings')}>
              Настройки темы
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
