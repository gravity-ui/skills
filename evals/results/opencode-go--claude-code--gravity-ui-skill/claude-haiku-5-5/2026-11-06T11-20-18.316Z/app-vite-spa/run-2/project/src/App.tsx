import { useState } from 'react';
import { AsideHeader, FooterItem, type AsideHeaderItem } from '@gravity-ui/navigation';
import { Gear, House, ListCheck, Moon, Sun } from '@gravity-ui/icons';
import { Box, ThemeProvider } from '@gravity-ui/uikit';

import { useRoute, useThemeMode } from './hooks';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import type { PageId, Task } from './types';

const navigateTo = (page: PageId) => {
  window.location.hash = page === 'home' ? '#/' : `#/${page}`;
};

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Изучить Gravity UI', done: true },
  { id: 2, title: 'Добавить страницу с задачами', done: false },
  { id: 3, title: 'Переключить тему', done: false },
];

export function App() {
  const page = useRoute();
  const [theme, setTheme] = useThemeMode();
  const [compact, setCompact] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = (title: string) =>
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);

  const toggleTask = (id: number) =>
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const menuItems: AsideHeaderItem[] = [
    { id: 'home', title: 'Главная', icon: House, href: '#/', current: page === 'home' },
    { id: 'tasks', title: 'Задачи', icon: ListCheck, href: '#/tasks', current: page === 'tasks' },
    { id: 'settings', title: 'Настройки', icon: Gear, href: '#/settings', current: page === 'settings' },
  ];

  const renderPage = () => {
    switch (page) {
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
          />
        );
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={setTheme} />;
      case 'home':
      default:
        return <HomePage tasks={tasks} onOpenTasks={() => navigateTo('tasks')} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AsideHeader
        logo={{ text: 'Gravity Demo', href: '#/' }}
        menuItems={menuItems}
        compact={compact}
        onChangeCompact={setCompact}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme"
            title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            icon={theme === 'light' ? Moon : Sun}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => (
          <Box spacing={{ p: 6 }} maxWidth={960}>
            {renderPage()}
          </Box>
        )}
      />
    </ThemeProvider>
  );
}
