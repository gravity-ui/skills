import {useState} from 'react';

import {CircleCheck, Gear, House, Layers} from '@gravity-ui/icons';
import {AsideHeader, type AsideHeaderItem} from '@gravity-ui/navigation';
import {Box, Card, Flex, Switch, Text, ThemeProvider, type Theme} from '@gravity-ui/uikit';

type PageId = 'overview' | 'tasks' | 'settings';

const pages: Record<PageId, {title: string; description: string}> = {
  overview: {
    title: 'Обзор',
    description: 'Короткая сводка о текущем состоянии приложения.',
  },
  tasks: {
    title: 'Задачи',
    description: 'Список дел, которыми можно управлять на этой странице.',
  },
  settings: {
    title: 'Настройки',
    description: 'Внешний вид и поведение приложения.',
  },
};

const tasks = [
  {id: 1, title: 'Собрать каркас приложения', done: true},
  {id: 2, title: 'Добавить навигацию между страницами', done: true},
  {id: 3, title: 'Подключить переключатель темы', done: false},
];

export function App() {
  const [page, setPage] = useState<PageId>('overview');
  const [theme, setTheme] = useState<Theme>('light');
  const [compact, setCompact] = useState(false);

  const menuItems: AsideHeaderItem[] = [
    {
      id: 'overview',
      title: 'Обзор',
      icon: House,
      current: page === 'overview',
      onItemClick: () => setPage('overview'),
    },
    {
      id: 'tasks',
      title: 'Задачи',
      icon: CircleCheck,
      current: page === 'tasks',
      onItemClick: () => setPage('tasks'),
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: Gear,
      current: page === 'settings',
      onItemClick: () => setPage('settings'),
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{
          text: 'Мини-приложение',
          icon: Layers,
          onClick: () => setPage('overview'),
        }}
        compact={compact}
        onChangeCompact={setCompact}
        menuItems={menuItems}
        renderContent={() => (
          <Box spacing={{p: 6}} maxWidth={960} width="100%">
            <Flex direction="column" gap={6}>
              <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap>
                <Flex direction="column" gap={2} style={{flex: 1, minWidth: 0}}>
                  <Text variant="header-1">{pages[page].title}</Text>
                  <Text variant="body-1" color="secondary">
                    {pages[page].description}
                  </Text>
                </Flex>
                <Switch
                  checked={theme === 'dark'}
                  onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
                  content="Тёмная тема"
                />
              </Flex>

              {page === 'overview' && (
                <Flex gap={4} wrap>
                  <Card type="container" view="raised" style={{flex: 1, minWidth: 240}}>
                    <Box spacing={{p: 5}}>
                      <Text variant="subheader-1">Страниц в приложении</Text>
                      <Text variant="display-1">3</Text>
                    </Box>
                  </Card>
                  <Card type="container" view="raised" style={{flex: 1, minWidth: 240}}>
                    <Box spacing={{p: 5}}>
                      <Text variant="subheader-1">Активная тема</Text>
                      <Text variant="display-1">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</Text>
                    </Box>
                  </Card>
                </Flex>
              )}

              {page === 'tasks' && (
                <Flex direction="column" gap={3}>
                  {tasks.map((task) => (
                    <Card key={task.id} type="container" view="raised">
                      <Box spacing={{p: 4}}>
                        <Flex gap={3} alignItems="center">
                          <CircleCheck width={20} height={20} />
                          <Text variant="body-2" color={task.done ? 'secondary' : 'primary'}>
                            {task.title}
                          </Text>
                        </Flex>
                      </Box>
                    </Card>
                  ))}
                </Flex>
              )}

              {page === 'settings' && (
                <Card type="container" view="raised">
                  <Box spacing={{p: 5}}>
                    <Flex justifyContent="space-between" alignItems="center" gap={4} wrap>
                      <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                        <Text variant="subheader-1">Тёмная тема</Text>
                        <Text variant="body-1" color="secondary">
                          Переключает оформление всего приложения.
                        </Text>
                      </Flex>
                      <Switch
                        checked={theme === 'dark'}
                        onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
                      />
                    </Flex>
                  </Box>
                </Card>
              )}
            </Flex>
          </Box>
        )}
      />
    </ThemeProvider>
  );
}
