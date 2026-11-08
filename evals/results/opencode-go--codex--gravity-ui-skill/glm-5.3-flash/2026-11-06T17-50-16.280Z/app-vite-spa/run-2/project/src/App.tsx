// Implement the requested feature here (and may add sibling files).
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Icon,
  Switch,
  Tab,
  TabList,
  TabProvider,
  Text,
  useThemeType,
} from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

const pages = [
  { id: 'home', title: 'Обзор' },
  { id: 'projects', title: 'Проекты' },
  { id: 'settings', title: 'Настройки' },
] as const;

type PageId = (typeof pages)[number]['id'];
type Theme = 'light' | 'dark';

const projects = [
  { name: 'Портал поддержки', stage: 'В работе', progress: 72 },
  { name: 'Мобильное приложение', stage: 'Дизайн', progress: 38 },
  { name: 'Аналитический дашборд', stage: 'Готово', progress: 100 },
];

const metrics = [
  { label: 'Активные задачи', value: '18' },
  { label: 'Завершено за неделю', value: '24' },
  { label: 'Участников', value: '7' },
];

function HomePage() {
  return (
    <section className="page" aria-labelledby="home-title">
      <div className="page-header">
        <Text as="h1" variant="header-2" id="home-title">
          Обзор
        </Text>
        <Text variant="body-1" color="secondary">
          Короткая сводка по текущей работе команды.
        </Text>
      </div>

      <Flex gap="4" wrap>
        {metrics.map((metric) => (
          <Card key={metric.label} type="container" view="outlined" className="metric-card">
            <Text variant="caption-1" color="secondary">
              {metric.label}
            </Text>
            <Text as="span" variant="display-2" className="metric-value">
              {metric.value}
            </Text>
          </Card>
        ))}
      </Flex>
    </section>
  );
}

function ProjectsPage() {
  return (
    <section className="page" aria-labelledby="projects-title">
      <div className="page-header">
        <Text as="h1" variant="header-2" id="projects-title">
          Проекты
        </Text>
        <Text variant="body-1" color="secondary">
          Текущие направления и их статус.
        </Text>
      </div>

      <div className="page-grid">
        {projects.map((project) => (
          <Card key={project.name} type="container" view="outlined" className="content-card">
            <Text as="h2" variant="subheader-2">
              {project.name}
            </Text>
            <Text variant="body-1" color="secondary">
              Статус: {project.stage}
            </Text>
            <Text variant="body-2">{project.progress}% готовности</Text>
          </Card>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  return (
    <section className="page" aria-labelledby="settings-title">
      <div className="page-header">
        <Text as="h1" variant="header-2" id="settings-title">
          Настройки
        </Text>
        <Text variant="body-1" color="secondary">
          Управление оформлением приложения.
        </Text>
      </div>

      <Card type="container" view="outlined" className="content-card">
        <Flex alignItems="center" justifyContent="space-between" gap="4">
          <div>
            <Text as="h2" variant="subheader-2">
              Тёмная тема
            </Text>
            <Text variant="body-1" color="secondary">
              {theme === 'dark' ? 'Сейчас включена' : 'Сейчас выключена'}
            </Text>
          </div>
          <Switch checked={theme === 'dark'} onUpdate={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} />
        </Flex>
      </Card>

      <Card type="container" view="outlined" className="content-card accent-card" style={{ marginTop: 16 }}>
        <Text as="h2" variant="subheader-2">
          Акцентный блок
        </Text>
        <Text variant="body-1">Элементы на брендированном фоне остаются читаемыми в обеих темах.</Text>
      </Card>
    </section>
  );
}

export function App() {
  const [pageId, setPageId] = useState<PageId>('home');
  const theme = useThemeType() as Theme;

  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    window.dispatchEvent(new CustomEvent('app-theme-change', { detail: nextTheme }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <Flex className="app-brand" alignItems="center" gap="3">
          <div className="app-logo" aria-hidden="true">
            <Icon data={theme === 'dark' ? Moon : Sun} size={20} />
          </div>
          <Text variant="subheader-1">Gravity Demo</Text>
        </Flex>

        <div className="app-navigation">
          <TabProvider value={pageId} onUpdate={(value) => setPageId(value as PageId)}>
            <TabList size="m" contentOverflow="wrap">
              {pages.map((page) => (
                <Tab key={page.id} value={page.id}>
                  {page.title}
                </Tab>
              ))}
            </TabList>
          </TabProvider>
        </div>

        <Button
          view="outlined"
          size="m"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          <Button.Icon side="left">
            <Icon data={theme === 'dark' ? Sun : Moon} size={16} />
          </Button.Icon>
          {theme === 'dark' ? 'Светлая' : 'Тёмная'}
        </Button>
      </header>

      {pageId === 'home' && <HomePage />}
      {pageId === 'projects' && <ProjectsPage />}
      {pageId === 'settings' && <SettingsPage theme={theme} onThemeChange={setTheme} />}
    </div>
  );
}
