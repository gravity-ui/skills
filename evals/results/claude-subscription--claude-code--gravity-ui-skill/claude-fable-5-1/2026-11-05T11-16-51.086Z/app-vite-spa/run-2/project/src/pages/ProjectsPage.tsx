import React from 'react';
import {Card, Flex, Label, Text} from '@gravity-ui/uikit';

import {PageShell} from './PageShell';

type ProjectStatus = 'active' | 'paused' | 'done';

interface Project {
  id: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  progress: number;
}

const STATUS_LABEL: Record<ProjectStatus, {text: string; theme: 'success' | 'warning' | 'normal'}> = {
  active: {text: 'В работе', theme: 'success'},
  paused: {text: 'На паузе', theme: 'warning'},
  done: {text: 'Завершён', theme: 'normal'},
};

const PROJECTS: Project[] = [
  {id: 'p1', name: 'Редизайн личного кабинета', owner: 'Команда UX', status: 'active', progress: 64},
  {id: 'p2', name: 'Миграция на новый биллинг', owner: 'Платформа', status: 'paused', progress: 35},
  {id: 'p3', name: 'Мобильное приложение', owner: 'Mobile', status: 'active', progress: 82},
  {id: 'p4', name: 'Единый дизайн-кит', owner: 'Дизайн-система', status: 'done', progress: 100},
];

export function ProjectsPage() {
  return (
    <PageShell title="Проекты" description="Список проектов команды и их текущее состояние.">
      <Flex direction="column" gap={3}>
        {PROJECTS.map((project) => {
          const status = STATUS_LABEL[project.status];
          return (
            <Card key={project.id} type="container" view="outlined" spacing={{p: 4}}>
              <Flex alignItems="center" gap={4}>
                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                  <Text variant="subheader-1" ellipsis>
                    {project.name}
                  </Text>
                  <Text variant="body-1" color="secondary" ellipsis>
                    {project.owner}
                  </Text>
                </Flex>
                <Text variant="body-1" color="hint" style={{flexShrink: 0}}>
                  {project.progress}%
                </Text>
                <span style={{flexShrink: 0}}>
                  <Label theme={status.theme} size="s">
                    {status.text}
                  </Label>
                </span>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </PageShell>
  );
}
