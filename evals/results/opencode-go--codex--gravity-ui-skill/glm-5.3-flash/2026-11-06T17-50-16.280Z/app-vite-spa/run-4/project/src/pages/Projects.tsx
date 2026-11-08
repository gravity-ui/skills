import { Card, Flex, Label, Text } from '@gravity-ui/uikit';

const projects = [
  {
    name: 'Дизайн-система',
    description: 'Единые компоненты и правила интерфейса.',
    status: 'В работе',
    theme: 'info' as const,
  },
  {
    name: 'Клиентский портал',
    description: 'Личный кабинет, заказы и история обращений.',
    status: 'Планирование',
    theme: 'warning' as const,
  },
  {
    name: 'Отчёты',
    description: 'Автоматическая выгрузка ключевых метрик.',
    status: 'Готово',
    theme: 'success' as const,
  },
];

export function Projects() {
  return (
    <section className="page" aria-labelledby="projects-title">
      <Text variant="header-1" as="h1" id="projects-title">
        Проекты
      </Text>
      <Text color="secondary">Три направления команды с текущим статусом.</Text>

      <div className="project-grid">
        {projects.map((project) => (
          <Card key={project.name} type="container" view="outlined" spacing={{ p: 6 }}>
            <Flex direction="column" gap="4">
              <Flex justifyContent="space-between" alignItems="center">
                <Text variant="header-2" as="h2">
                  {project.name}
                </Text>
                <Label theme={project.theme}>{project.status}</Label>
              </Flex>
              <Text color="secondary">{project.description}</Text>
            </Flex>
          </Card>
        ))}
      </div>
    </section>
  );
}
