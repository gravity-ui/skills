import { useCallback, useState } from 'react';
import { Gear, House, ListCheck, Moon, Rocket, Sun } from '@gravity-ui/icons';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { ThemeProvider, useThemeType } from '@gravity-ui/uikit';

import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { TasksPage } from './pages/TasksPage';
import { INITIAL_TASKS } from './tasks';
import type { Task } from './tasks';
import { useAppTheme } from './useAppTheme';
import type { AppTheme } from './useAppTheme';
import { useHashRoute } from './useHashRoute';
import type { PageId } from './useHashRoute';

export function App() {
  const { theme, setTheme } = useAppTheme();

  // The outermost ThemeProvider applies the theme class to <body>, so the whole page switches.
  return (
    <ThemeProvider theme={theme}>
      <Shell theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}

interface ShellProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

const NAV: { id: PageId; title: string; icon: AsideHeaderItem['icon'] }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'tasks', title: 'Задачи', icon: ListCheck },
  { id: 'settings', title: 'Настройки', icon: Gear },
];

function Shell({ theme, onThemeChange }: ShellProps) {
  const { page, navigate } = useHashRoute();
  // Resolved theme ('system' → light/dark), needed for the toggle icon.
  const themeType = useThemeType();
  const isDark = themeType === 'dark';

  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 768px)').matches);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = useCallback((title: string) => {
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
  }, []);
  const toggleTask = useCallback((id: number, done: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done } : task)));
  }, []);
  const removeTask = useCallback((id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const menuItems: AsideHeaderItem[] = NAV.map((item) => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    current: page === item.id,
    onItemClick: () => navigate(item.id),
  }));

  const renderPage = () => {
    switch (page) {
      case 'tasks':
        return (
          <TasksPage tasks={tasks} onAdd={addTask} onToggle={toggleTask} onRemove={removeTask} />
        );
      case 'settings':
        return <SettingsPage theme={theme} onThemeChange={onThemeChange} />;
      case 'home':
      default:
        return <HomePage tasks={tasks} onNavigate={navigate} />;
    }
  };

  return (
    <AsideHeader
      logo={{
        text: 'Мини-приложение',
        icon: Rocket,
        onClick: () => navigate('home'),
        'aria-label': 'На главную',
      }}
      compact={compact}
      onChangeCompact={setCompact}
      menuItems={menuItems}
      renderFooter={({ compact: isCompact }) => (
        <FooterItem
          id="theme-toggle"
          title={isDark ? 'Светлая тема' : 'Тёмная тема'}
          icon={isDark ? Sun : Moon}
          compact={isCompact}
          onItemClick={() => onThemeChange(isDark ? 'light' : 'dark')}
        />
      )}
      renderContent={() => <main className="app-content">{renderPage()}</main>}
    />
  );
}
