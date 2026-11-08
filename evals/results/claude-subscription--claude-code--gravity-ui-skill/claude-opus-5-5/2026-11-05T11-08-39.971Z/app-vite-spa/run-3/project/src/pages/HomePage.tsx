import { Briefcase, Gear } from '@gravity-ui/icons';
import { Card, Flex, Icon, Text } from '@gravity-ui/uikit';

import type { RouteId } from '../routes';
import { PageHeader } from './PageHeader';

const STATS = [
  { label: 'Активных проектов', value: '4' },
  { label: 'Открытых задач', value: '27' },
  { label: 'Участников', value: '9' },
];

const SHORTCUTS: Array<{ id: RouteId; title: string; text: string; icon: typeof Gear }> = [
  { id: 'projects', title: 'Проекты', text: 'Список проектов и их статусы', icon: Briefcase },
  { id: 'settings', title: 'Настройки', text: 'Тема оформления и вид меню', icon: Gear },
];

export function HomePage({ onNavigate }: { onNavigate: (id: RouteId) => void }) {
  return (
    <Flex direction="column" gap={6}>
      <PageHeader
        title="Добро пожаловать"
        description="Небольшое демо-приложение на Gravity UI с навигацией и переключателем темы."
      />

      <div className="app-grid">
        {STATS.map((stat) => (
          <Card key={stat.label} view="outlined" spacing={{ p: 4 }}>
            <Flex direction="column" gap={1}>
              <Text variant="display-1">{stat.value}</Text>
              <Text color="secondary">{stat.label}</Text>
            </Flex>
          </Card>
        ))}
      </div>

      <Flex direction="column" gap={3}>
        <Text variant="subheader-3" as="h2" className="app-heading">
          Быстрые переходы
        </Text>
        <div className="app-grid">
          {SHORTCUTS.map((item) => (
            <Card key={item.id} type="action" spacing={{ p: 4 }} onClick={() => onNavigate(item.id)}>
              <Flex gap={3} alignItems="center">
                <Icon data={item.icon} size={20} className="app-shrink-0" />
                <Flex direction="column" gap={0.5} className="app-flexible">
                  <Text variant="subheader-2">{item.title}</Text>
                  <Text color="secondary">{item.text}</Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </div>
      </Flex>
    </Flex>
  );
}
