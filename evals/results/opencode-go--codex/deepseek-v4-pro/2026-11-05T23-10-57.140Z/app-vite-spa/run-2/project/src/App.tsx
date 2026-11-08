import { useEffect, useState } from 'react';
import {
  Card,
  Checkbox,
  Container,
  Flex,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabProvider,
  Text,
  ThemeProvider,
} from '@gravity-ui/uikit';

type Page = 'home' | 'tasks' | 'about';
type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

const tasks = [
  'Изучить навигацию между страницами',
  'Переключить светлую и тёмную тему',
  'Сохранить выбранную тему в localStorage',
];

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);
  const [page, setPage] = useState<Page>('home');

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="l">
        <Flex
          as="header"
          alignItems="center"
          justifyContent="space-between"
          spacing={{ py: 4 }}
        >
          <Text variant="header-1">Мини-приложение</Text>
          <Switch
            checked={theme === 'dark'}
            content="Тёмная тема"
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          />
        </Flex>

        <TabProvider value={page} onUpdate={(value) => setPage(value as Page)}>
          <TabList>
            <Tab value="home">Главная</Tab>
            <Tab value="tasks">Задачи</Tab>
            <Tab value="about">О проекте</Tab>
          </TabList>

          <TabPanel value="home">
            <Card spacing={{ p: 5 }}>
              <Flex direction="column" gap={2}>
                <Text variant="subheader-2">Добро пожаловать</Text>
                <Text as="p" variant="body-1">
                  Это небольшое SPA с тремя страницами. Используйте вкладки выше, чтобы
                  перемещаться между разделами, и переключатель в шапке — чтобы сменить тему.
                </Text>
              </Flex>
            </Card>
          </TabPanel>

          <TabPanel value="tasks">
            <Card spacing={{ p: 5 }}>
              <Flex direction="column" gap={3}>
                <Text variant="subheader-2">Чек-лист</Text>
                <Flex direction="column" gap={2}>
                  {tasks.map((task, index) => (
                    <Checkbox key={task} defaultChecked={index === 0} content={task} />
                  ))}
                </Flex>
              </Flex>
            </Card>
          </TabPanel>

          <TabPanel value="about">
            <Card spacing={{ p: 5 }}>
              <Flex direction="column" gap={2}>
                <Text variant="subheader-2">О проекте</Text>
                <Text as="p" variant="body-1">
                  Приложение собрано на React, Vite и Gravity UI. Тема запоминается в
                  localStorage и применяется через ThemeProvider.
                </Text>
              </Flex>
            </Card>
          </TabPanel>
        </TabProvider>
      </Container>
    </ThemeProvider>
  );
}
