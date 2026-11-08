import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Label,
  Progress,
  Switch,
  Tab,
  TabList,
  ThemeProvider,
} from '@gravity-ui/uikit';

type ThemeType = 'light' | 'dark';

const pages = ['overview', 'tasks', 'settings'] as const;
type Page = (typeof pages)[number];

const pageTitles: Record<Page, string> = {
  overview: 'Обзор',
  tasks: 'Задачи',
  settings: 'Настройки',
};

const tasks = [
  { id: 1, title: 'Подготовить черновик интерфейса' },
  { id: 2, title: 'Собрать обратную связь от команды' },
  { id: 3, title: 'Написать заметки по релизу' },
];

export function App() {
  const [theme, setTheme] = useState<ThemeType>('light');
  const [activePage, setActivePage] = useState<Page>('overview');
  const [completedTaskIds, setCompletedTaskIds] = useState<number[]>([1]);

  const progress = useMemo(
    () => Math.round((completedTaskIds.length / tasks.length) * 100),
    [completedTaskIds.length],
  );

  const toggleTask = (taskId: number) => {
    setCompletedTaskIds((currentIds) =>
      currentIds.includes(taskId)
        ? currentIds.filter((id) => id !== taskId)
        : [...currentIds, taskId],
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" minHeight="100vh" style={{ padding: '24px 16px' }}>
        <Flex justifyContent="space-between" alignItems="center" wrap="wrap" gap="3">
          <h1 style={{ margin: 0, fontSize: 24 }}>Мини-приложение</h1>
          <Switch
            checked={theme === 'dark'}
            onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
            content="Тёмная тема"
          />
        </Flex>

        <div style={{ margin: '16px 0 24px' }}>
          <TabList size="l" value={activePage} onUpdate={(value) => setActivePage(value as Page)}>
            {pages.map((page) => (
              <Tab key={page} value={page}>
                {pageTitles[page]}
              </Tab>
            ))}
          </TabList>
        </div>

        {activePage === 'overview' && (
          <Flex direction="column" gap="4">
            <Card type="container" view="filled" size="l">
              <Flex direction="column" gap={8} style={{ padding: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Сводка</h2>
                <p style={{ margin: 0 }}>Простая статистика проекта за текущую неделю.</p>
                <Progress value={progress} theme="info" text={`${progress}%`} />
                <Label theme="normal">{`${completedTaskIds.length} из ${tasks.length} задач`}</Label>
              </Flex>
            </Card>

            <Flex gap="4" wrap="wrap">
              <Card type="container" view="outlined" size="l" style={{ flex: '1 1 240px' }}>
                <Flex direction="column" gap={6} style={{ padding: 20 }}>
                  <strong>Активность</strong>
                  <span>4 обновления сегодня</span>
                </Flex>
              </Card>
              <Card type="container" view="outlined" size="l" style={{ flex: '1 1 240px' }}>
                <Flex direction="column" gap={6} style={{ padding: 20 }}>
                  <strong>Команда</strong>
                  <span>3 участника онлайн</span>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        )}

        {activePage === 'tasks' && (
          <Card type="container" view="filled" size="l">
            <Flex direction="column" gap="3" style={{ padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Задачи</h2>
              {tasks.map((task) => {
                const isDone = completedTaskIds.includes(task.id);

                return (
                  <Flex
                    key={task.id}
                    justifyContent="space-between"
                    alignItems="center"
                    gap="3"
                  >
                    <span>{task.title}</span>
                    <Button
                      size="m"
                      view={isDone ? 'outlined' : 'action'}
                      onClick={() => toggleTask(task.id)}
                    >
                      {isDone ? 'Готово' : 'Отметить'}
                    </Button>
                  </Flex>
                );
              })}
            </Flex>
          </Card>
        )}

        {activePage === 'settings' && (
          <Card type="container" view="filled" size="l">
            <Flex direction="column" gap="4" style={{ padding: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>Настройки</h2>
              <Switch
                checked={theme === 'dark'}
                onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
                content="Использовать тёмную тему"
              />
              <Flex gap={8}>
                <Button view="normal">Сбросить</Button>
                <Button view="action">Сохранить</Button>
              </Flex>
            </Flex>
          </Card>
        )}
      </Flex>
    </ThemeProvider>
  );
}
