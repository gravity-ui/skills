import { Card, Flex, Label, Text } from '@gravity-ui/uikit';
import type { LabelProps } from '@gravity-ui/uikit';

import { PageHeader } from './PageHeader';

type Project = {
  id: string;
  name: string;
  description: string;
  status: { text: string; theme: LabelProps['theme'] };
};

const PROJECTS: Project[] = [
  {
    id: 'web',
    name: 'Веб-портал',
    description: 'Новый личный кабинет клиента',
    status: { text: 'В работе', theme: 'info' },
  },
  {
    id: 'mobile',
    name: 'Мобильное приложение',
    description: 'Версия 2.0 для iOS и Android',
    status: { text: 'Тестирование', theme: 'warning' },
  },
  {
    id: 'billing',
    name: 'Биллинг',
    description: 'Переход на новую платёжную систему',
    status: { text: 'Готово', theme: 'success' },
  },
  {
    id: 'analytics',
    name: 'Аналитика',
    description: 'Сбор метрик и отчётность',
    status: { text: 'Блокер', theme: 'danger' },
  },
];

export function ProjectsPage() {
  return (
    <Flex direction="column" gap={6}>
      <PageHeader title="Проекты" description={`Всего проектов: ${PROJECTS.length}`} />

      <Flex direction="column" gap={3}>
        {PROJECTS.map((project) => (
          <Card key={project.id} view="outlined" spacing={{ p: 4 }}>
            <Flex gap={3} alignItems="center">
              <Flex direction="column" gap={0.5} className="app-flexible">
                <Text variant="subheader-2" ellipsis>
                  {project.name}
                </Text>
                <Text color="secondary" ellipsis>
                  {project.description}
                </Text>
              </Flex>
              <Label theme={project.status.theme} className="app-shrink-0">
                {project.status.text}
              </Label>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
