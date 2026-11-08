import './App.css';

import { useEffect, useState } from 'react';
import { Button, Card, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

type PageId = 'home' | 'tasks' | 'about';

const PAGE_IDS: PageId[] = ['home', 'tasks', 'about'];
const THEME_STORAGE_KEY = 'mini-app-theme';

const PAGES: Record<PageId, { label: string; title: string; description: string }> = {
  home: {
    label: 'Главная',
    title: 'Мини-приложение',
    description: 'Небольшой пример SPA с навигацией и переключением темы.',
  },
  tasks: {
    label: 'Задачи',
    title: 'Список задач',
    description: 'Здесь можно посмотреть текущие дела и их статус.',
  },
  about: {
    label: 'О приложении',
    title: 'О приложении',
    description: 'Коротко о технологиях и возможностях этой страницы.',
  },
};

function getPageFromHash(): PageId {
  const value = window.location.hash.replace(/^#\/?/, '');
  return (PAGE_IDS as readonly string[]).includes(value) ? (value as PageId) : 'home';
}

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

const TASKS = [
  { title: 'Настроить навигацию', done: true },
  { title: 'Добавить тёмную тему', done: true },
  { title: 'Проверить сборку', done: false },
];

export function App() {
  const [page, setPage] = useState<PageId>(getPageFromHash);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const navigate = (nextPage: PageId) => {
    if (nextPage !== page) {
      window.location.hash = `/${nextPage}`;
    }
  };

  const currentPage = PAGES[page];
  const isDark = theme === 'dark';

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <header className="app__header">
          <div className="app__brand">
            <span className="app__logo" aria-hidden="true">✦</span>
            <Text variant="subheader-2">Mini App</Text>
          </div>

          <nav className="app__nav" aria-label="Основная навигация">
            {PAGE_IDS.map((pageId) => (
              <Button
                key={pageId}
                view={page === pageId ? 'action' : 'normal'}
                size="m"
                onClick={() => navigate(pageId)}
              >
                {PAGES[pageId].label}
              </Button>
            ))}
          </nav>

          <Switch
            className="app__theme-switch"
            size="m"
            checked={isDark}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
            content="Тёмная тема"
          />
        </header>

        <main className="app__main">
          <div className="app__intro">
            <Text as="h1" variant="header-1">{currentPage.title}</Text>
            <Text as="p" variant="body-2" color="secondary">{currentPage.description}</Text>
          </div>

          {page === 'home' && (
            <section className="app__cards">
              <Card className="app__card" view="outlined">
                <Text variant="subheader-2">Навигация</Text>
                <Text variant="body-2" color="secondary">
                  Три страницы переключаются через hash-роутер, поэтому работают кнопки «назад» и «вперёд» браузера.
                </Text>
              </Card>
              <Card className="app__card" view="outlined">
                <Text variant="subheader-2">Темы</Text>
                <Text variant="body-2" color="secondary">
                  Переключатель в шапке меняет светлую и тёмную тему, а выбор сохраняется между визитами.
                </Text>
              </Card>
            </section>
          )}

          {page === 'tasks' && (
            <Card className="app__tasks" view="outlined">
              <ul className="app__task-list">
                {TASKS.map((task) => (
                  <li key={task.title} className="app__task">
                    <span className={task.done ? 'app__task-status app__task-status_done' : 'app__task-status'} aria-hidden="true">
                      {task.done ? '✓' : '○'}
                    </span>
                    <Text variant="body-2" color={task.done ? 'secondary' : 'primary'}>
                      {task.title}
                    </Text>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {page === 'about' && (
            <Card className="app__about" view="outlined">
              <Text variant="body-2">
                Приложение собрано на React, TypeScript и Vite. Интерфейс использует компоненты Gravity UI, а цвета берутся из CSS-переменных темы, поэтому переключение темы обновляет весь интерфейс автоматически.
              </Text>
            </Card>
          )}
        </main>
      </div>
    </ThemeProvider>
  );
}
