import {useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Button, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import './App.css';

type Page = 'overview' | 'projects' | 'about';

const pageCopy: Record<Page, {eyebrow: string; title: string; description: string}> = {
  overview: {
    eyebrow: 'РАБОЧЕЕ ПРОСТРАНСТВО',
    title: 'Хороший день для больших планов',
    description: 'Соберите задачи в одном месте и двигайтесь к важному в комфортном темпе.',
  },
  projects: {
    eyebrow: 'ВАШИ ПРОЕКТЫ',
    title: 'От идеи к результату',
    description: 'Три направления, которые сейчас задают ритм вашей работе.',
  },
  about: {
    eyebrow: 'О ПРОСТРАНСТВЕ',
    title: 'Меньше шума. Больше смысла.',
    description: 'Небольшой пример приложения на Gravity UI: навигация, страницы и тема под вашим контролем.',
  },
};

const projects = [
  {name: 'Новый сайт', tag: 'ДИЗАЙН', progress: 72, note: 'Финальные правки главной страницы'},
  {name: 'Осенний запуск', tag: 'МАРКЕТИНГ', progress: 46, note: 'Подготовить план публикаций'},
  {name: 'Клиентский портал', tag: 'РАЗРАБОТКА', progress: 28, note: 'Согласовать структуру кабинета'},
];

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [page, setPage] = useState<Page>('overview');
  const [compact, setCompact] = useState(false);
  const copy = pageCopy[page];

  const changePage = (next: Page) => {
    setPage(next);
    window.history.replaceState(null, '', `#${next}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-shell">
        <AsideHeader
          logo={{text: 'ТИХО', href: '#overview'}}
          compact={compact}
          onChangeCompact={setCompact}
          menuItems={[
            {id: 'overview', title: 'Обзор', current: page === 'overview', onItemClick: () => changePage('overview')},
            {id: 'projects', title: 'Проекты', current: page === 'projects', onItemClick: () => changePage('projects')},
            {id: 'about', title: 'О проекте', current: page === 'about', onItemClick: () => changePage('about')},
          ]}
          renderFooter={() => (
            <div className="theme-control">
              <span className="theme-label">Тёмная тема</span>
              <Switch size="m" checked={theme === 'dark'} onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')} />
            </div>
          )}
          renderContent={() => (
            <main className="page-content">
              <header className="topbar">
                <span className="topbar-label">ЛИЧНЫЙ ПЛАНЕР</span>
                <span className="date-label">СРЕДА · 5 НОЯБРЯ</span>
              </header>
              <section className="hero">
                <div className="hero-copy">
                  <Text variant="caption-2" className="eyebrow">{copy.eyebrow}</Text>
                  <Text variant="header-1" className="hero-title">{copy.title}</Text>
                  <Text variant="body-2" color="secondary" className="hero-description">{copy.description}</Text>
                  <Button view="action" size="l" onClick={() => changePage(page === 'projects' ? 'overview' : 'projects')}>
                    {page === 'projects' ? 'Вернуться к обзору' : 'Посмотреть проекты'}
                  </Button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="sun-disc" />
                  <div className="art-line art-line-one" />
                  <div className="art-line art-line-two" />
                  <span className="art-caption">FOCUS<br/>ON WHAT<br/>MATTERS</span>
                </div>
              </section>
              {page === 'about' ? (
                <section className="about-panel">
                  <Text variant="subheader-1">Пространство для ясных мыслей</Text>
                  <Text variant="body-2" color="secondary">Переходите между разделами через меню слева, а переключатель темы всегда остаётся под рукой. Ваш выбор темы применяется ко всему интерфейсу.</Text>
                  <div className="about-stats"><div><strong>03</strong><span>страницы</span></div><div><strong>02</strong><span>темы</span></div><div><strong>01</strong><span>пространство</span></div></div>
                </section>
              ) : (
                <section className="projects-section">
                  <div className="section-heading">
                    <div><Text variant="subheader-1">{page === 'projects' ? 'Все проекты' : 'В фокусе'}</Text><Text variant="caption-2" color="secondary">Текущий прогресс и ближайший шаг</Text></div>
                    <Button view="flat-secondary" onClick={() => changePage('projects')}>Все проекты ↗</Button>
                  </div>
                  <div className="project-grid">
                    {projects.map((project, index) => (
                      <article className={`project-card project-card-${index + 1}`} key={project.name}>
                        <div className="card-top"><span className="project-tag">{project.tag}</span><span className="project-index">0{index + 1}</span></div>
                        <Text variant="subheader-2">{project.name}</Text>
                        <Text variant="body-2" color="secondary" className="project-note">{project.note}</Text>
                        <div className="progress-row"><div className="progress-track"><span style={{width: `${project.progress}%`}} /></div><span>{project.progress}%</span></div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
              <footer className="page-footer"><span>ТИШЕ — ЗНАЧИТ ЯСНЕЕ</span><span>СДЕЛАНО ДЛЯ ФОКУСА</span></footer>
            </main>
          )}
        />
      </div>
    </ThemeProvider>
  );
}
