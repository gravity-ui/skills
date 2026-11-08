import { useState } from 'react';
import { AsideHeader, FooterItem } from '@gravity-ui/navigation';
import type { AsideHeaderItem } from '@gravity-ui/navigation';
import { Check, CircleInfo, House, Moon, Sun } from '@gravity-ui/icons';
import { ThemeProvider } from '@gravity-ui/uikit';

import { AboutPage } from './pages/AboutPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { type PageId, pageHref, useCurrentPage } from './router';
import { useTasks } from './tasks';
import { useThemeMode } from './theme';

const PAGES: { id: PageId; title: string; icon: AsideHeaderItem['icon'] }[] = [
  { id: 'home', title: 'Главная', icon: House },
  { id: 'tasks', title: 'Задачи', icon: Check },
  { id: 'about', title: 'О приложении', icon: CircleInfo },
];

export function App() {
  const { theme, toggleTheme } = useThemeMode();
  const page = useCurrentPage();
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [compact, setCompact] = useState(false);

  const menuItems: AsideHeaderItem[] = PAGES.map((p) => ({
    id: p.id,
    title: p.title,
    icon: p.icon,
    href: pageHref(p.id),
    current: p.id === page,
  }));

  const isDark = theme === 'dark';

  const renderPage = () => {
    switch (page) {
      case 'tasks':
        return (
          <TasksPage
            tasks={tasks}
            onAdd={addTask}
            onToggle={toggleTask}
            onRemove={removeTask}
          />
        );
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider theme={theme} lang="ru">
      <AsideHeader
        logo={{ text: 'Gravity Demo', href: '#/' }}
        menuItems={menuItems}
        compact={compact}
        onChangeCompact={setCompact}
        renderFooter={({ compact: isCompact }) => (
          <FooterItem
            id="theme-toggle"
            title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            icon={isDark ? Sun : Moon}
            compact={isCompact}
            onItemClick={toggleTheme}
          />
        )}
        renderContent={() => renderPage()}
      />
    </ThemeProvider>
  );
}
