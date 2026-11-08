import { useState, type CSSProperties } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Text,
  ThemeProvider,
  type ThemeType,
} from '@gravity-ui/uikit';

type PageId = 'home' | 'tasks' | 'about';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const THEME_STORAGE_KEY = 'mini-app-theme';

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Собрать каркас приложения', done: true },
  { id: 2, title: 'Добавить навигацию между страницами', done: true },
  { id: 3, title: 'Подключить переключатель темы', done: false },
  { id: 4, title: 'Сделать задачи интерактивными', done: false },
];

const pageStyles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh',
    padding: '32px 24px',
    boxSizing: 'border-box',
    background: 'var(--g-color-base-background)',
    color: 'var(--g-color-text-primary)',
  },
  container: {
    maxWidth: 880,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  tabList: {
    marginBottom: 24,
  },
  page: {
    display: 'grid',
    gap: 16,
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  metricCard: {
    padding: 20,
    display: 'grid',
    gap: 4,
  },
  taskList: {
    display: 'grid',
    gap: 10,
  },
  taskCard: {
    padding: '12px 16px',
  },
  aboutCard: {
    padding: 24,
    display: 'grid',
    gap: 8,
  },
};

function readInitialTheme(): ThemeType {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <Card type="container" view="raised" style={pageStyles.metricCard}>
      <Text variant="display-1">{value}</Text>
      <Text variant="body-2" color="secondary">
        {label}
      </Text>
    </Card>
  );
}

function HomePage({ onOpenTasks }: { onOpenTasks: () => void }) {
  return (
    <div style={pageStyles.page}>
      <Text variant="header-1">Главная</Text>
      <Text variant="body-1" color="secondary">
        Небольшое демо-приложение на React и Gravity UI: три страницы, навигация вкладками и
        светлая/тёмная тема.
      </Text>

      <div style={pageStyles.metrics}>
        <MetricCard value="3" label="Страницы" />
        <MetricCard value="2" label="Темы оформления" />
        <MetricCard value="1" label="Кнопка навигации" />
      </div>

      <div>
        <Button view="action" size="l" onClick={onOpenTasks}>
          Открыть задачи
        </Button>
      </div>
    </div>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const completedCount = tasks.filter((task) => task.done).length;

  function toggleTask(id: number, done: boolean) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === id ? { ...task, done } : task)),
    );
  }

  return (
    <div style={pageStyles.page}>
      <Text variant="header-1">Задачи</Text>
      <Text variant="body-1" color="secondary">
        Выполнено {completedCount} из {tasks.length}
      </Text>

      <div style={pageStyles.taskList}>
        {tasks.map((task) => (
          <Card key={task.id} type="container" view="outlined" style={pageStyles.taskCard}>
            <Checkbox
              size="l"
              checked={task.done}
              onUpdate={(done) => toggleTask(task.id, done)}
              content={
                <Text
                  variant="body-1"
                  style={
                    task.done
                      ? {
                          textDecoration: 'line-through',
                          color: 'var(--g-color-text-hint)',
                        }
                      : undefined
                  }
                >
                  {task.title}
                </Text>
              }
            />
          </Card>
        ))}
      </div>
    </div>
  );
}

function AboutPage({ theme }: { theme: ThemeType }) {
  return (
    <div style={pageStyles.page}>
      <Text variant="header-1">О проекте</Text>

      <Card type="container" view="raised" style={pageStyles.aboutCard}>
        <Text variant="subheader-2">Стек</Text>
        <Text variant="body-1" color="secondary">
          Vite, React, TypeScript и Gravity UI.
        </Text>
        <Text variant="subheader-2">Тема</Text>
        <Text variant="body-1" color="secondary">
          Сейчас активна {theme === 'dark' ? 'тёмная' : 'светлая'} тема. Переключить её можно в
          шапке приложения.
        </Text>
      </Card>
    </div>
  );
}

function Shell({ theme, onThemeChange }: { theme: ThemeType; onThemeChange: (theme: ThemeType) => void }) {
  const [page, setPage] = useState<PageId>('home');

  function handlePageChange(nextPage: string) {
    if (nextPage === 'home' || nextPage === 'tasks' || nextPage === 'about') {
      setPage(nextPage);
    }
  }

  return (
    <div style={pageStyles.root}>
      <div style={pageStyles.container}>
        <header style={pageStyles.header}>
          <Text variant="header-1">Mini App</Text>
          <Switch
            size="m"
            title="Переключить тему"
            checked={theme === 'dark'}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            content={theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
          />
        </header>

        <TabList value={page} onUpdate={handlePageChange} size="l" style={pageStyles.tabList}>
          <Tab value="home">Главная</Tab>
          <Tab value="tasks">Задачи</Tab>
          <Tab value="about">О проекте</Tab>
        </TabList>

        <TabPanel value="home">
          <HomePage onOpenTasks={() => setPage('tasks')} />
        </TabPanel>
        <TabPanel value="tasks">
          <TasksPage />
        </TabPanel>
        <TabPanel value="about">
          <AboutPage theme={theme} />
        </TabPanel>
      </div>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<ThemeType>(readInitialTheme);

  function handleThemeChange(nextTheme: ThemeType) {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Локальное хранилище может быть недоступно — на работу приложения это не влияет.
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Shell theme={theme} onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}
