import {Card, Flex, Label, Progress, Text} from '@gravity-ui/uikit';

const projects = [
    {
        name: 'Design system',
        status: 'Активен',
        progress: 72,
        note: 'Компоненты и токены синхронизированы.',
    },
    {
        name: 'Mobile release',
        status: 'В работе',
        progress: 45,
        note: 'Осталось протестировать тёмную тему.',
    },
    {
        name: 'Analytics',
        status: 'Обзор',
        progress: 20,
        note: 'Собираем требования к дашборду.',
    },
];

export function ProjectsPage() {
    return (
        <>
            <Flex className="page-header" direction="column" gap="1">
                <Text variant="header-2">Проекты</Text>
                <Text variant="body-1" color="secondary">
                    Демонстрационная страница с карточками и статусами.
                </Text>
            </Flex>
            <div className="card-grid">
                {projects.map((project) => (
                    <Card key={project.name} type="container" view="outlined" size="l">
                        <div className="card-content">
                            <Flex alignItems="center" justifyContent="space-between" gap="3">
                                <Text variant="subheader-3">{project.name}</Text>
                                <Label theme="info">{project.status}</Label>
                            </Flex>
                            <Text variant="body-2" color="secondary">
                                {project.note}
                            </Text>
                            <Progress value={project.progress} />
                            <Text variant="caption-2" color="hint">
                                Готово: {project.progress}%
                            </Text>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}
