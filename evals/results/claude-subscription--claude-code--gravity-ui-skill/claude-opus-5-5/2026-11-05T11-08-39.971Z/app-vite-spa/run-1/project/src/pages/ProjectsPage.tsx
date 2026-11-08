import { Card, Flex, Label, type LabelProps, Text } from '@gravity-ui/uikit';

type Status = 'active' | 'paused' | 'done';

const STATUS: Record<Status, { text: string; theme: LabelProps['theme'] }> = {
  active: { text: 'В работе', theme: 'info' },
  paused: { text: 'На паузе', theme: 'warning' },
  done: { text: 'Завершён', theme: 'success' },
};

const PROJECTS: { name: string; description: string; status: Status }[] = [
  { name: 'Мобильное приложение', description: 'Новый онбординг и экран профиля', status: 'active' },
  { name: 'Личный кабинет', description: 'Переход на новую дизайн-систему', status: 'active' },
  { name: 'Аналитика', description: 'Сбор метрик и дашборды для команды', status: 'paused' },
  { name: 'Лендинг', description: 'Промо-страница весеннего релиза', status: 'done' },
  { name: 'Документация API', description: 'Справочник и примеры запросов', status: 'active' },
];

export function ProjectsPage() {
  return (
    <Flex className="app-page" direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1">Проекты</Text>
        <Text variant="body-2" color="secondary">
          Всего проектов: {PROJECTS.length}
        </Text>
      </Flex>

      <Flex direction="column" gap={3}>
        {PROJECTS.map((project) => (
          <Card key={project.name} view="outlined">
            <Flex alignItems="center" gap={4} spacing={{ py: 4, px: 5 }}>
              <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text variant="subheader-2" ellipsis>
                  {project.name}
                </Text>
                <Text variant="body-1" color="secondary" ellipsis>
                  {project.description}
                </Text>
              </Flex>
              <Flex shrink={0}>
                <Label theme={STATUS[project.status].theme}>{STATUS[project.status].text}</Label>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
