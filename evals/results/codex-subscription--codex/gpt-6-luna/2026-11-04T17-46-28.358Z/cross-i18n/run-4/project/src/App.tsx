import { useEffect, useState } from 'react';
import './app.css';

type Language = 'en' | 'ru';

const copy = {
  en: {
    workspace: 'Workspace', workspaceSection: 'WORKSPACE', preferences: 'PREFERENCES', overview: 'Overview', translations: 'Translations', projects: 'Projects',
    activity: 'Activity', settings: 'Settings', help: 'Help center', search: 'Search anything...',
    greeting: 'Good morning, Alex', subtitle: 'Here’s what’s happening with your translations today.',
    newProject: '＋ New project', projectsLabel: 'Active projects', translated: 'Words translated',
    completion: 'Average completion', needsReview: 'Needs review', fromLastWeek: 'vs. last week',
    yourProjects: 'Your projects', viewAll: 'View all', updated: 'Last updated', progress: 'Progress',
    contributors: 'Contributors', status: 'Status', open: 'Open', inProgress: 'In progress',
    review: 'In review', completed: 'Completed', daysAgo: '2 hours ago', yesterday: 'Yesterday',
    activityTitle: 'Recent activity', seeActivity: 'See all activity',
    activityOne: 'Mia Chen completed the Spanish translation', projectOne: 'Mobile app · Spanish',
    activityTwo: 'You added 24 new strings to', projectTwo: 'Website redesign',
    activityThree: 'Noah Williams requested a review', projectThree: 'Mobile app · German',
    activityFour: 'Olivia Martin published a new version', projectFour: 'Help center · French',
    language: 'Interface language', english: 'English', russian: 'Русский',
    projectsData: [
      { name: 'Mobile app', detail: 'iOS & Android', locale: '8 languages', percent: 82, people: ['MC', 'JL', 'NW'], color: 'violet' },
      { name: 'Website redesign', detail: 'Marketing site', locale: '5 languages', percent: 64, people: ['AM', 'MC'], color: 'blue' },
      { name: 'Help center', detail: 'Support content', locale: '12 languages', percent: 96, people: ['OM', 'JL', 'AM'], color: 'green' },
      { name: 'Product emails', detail: 'Lifecycle messaging', locale: '4 languages', percent: 38, people: ['NW', 'OM'], color: 'orange' },
    ],
  },
  ru: {
    workspace: 'Рабочее пространство', workspaceSection: 'РАБОЧЕЕ ПРОСТРАНСТВО', preferences: 'НАСТРОЙКИ', overview: 'Обзор', translations: 'Переводы', projects: 'Проекты',
    activity: 'Активность', settings: 'Настройки', help: 'Центр помощи', search: 'Поиск...',
    greeting: 'Доброе утро, Алекс', subtitle: 'Вот что происходит с вашими переводами сегодня.',
    newProject: '＋ Новый проект', projectsLabel: 'Активные проекты', translated: 'Переведено слов',
    completion: 'Готовность проектов', needsReview: 'На проверке', fromLastWeek: 'к прошлой неделе',
    yourProjects: 'Ваши проекты', viewAll: 'Все проекты', updated: 'Обновлено', progress: 'Готовность',
    contributors: 'Участники', status: 'Статус', open: 'Открыть', inProgress: 'В работе',
    review: 'На проверке', completed: 'Завершён', daysAgo: '2 часа назад', yesterday: 'Вчера',
    activityTitle: 'Последние события', seeActivity: 'Вся активность',
    activityOne: 'Миа Чен завершила перевод на испанский', projectOne: 'Мобильное приложение · Испанский',
    activityTwo: 'Вы добавили 24 новые строки в проект', projectTwo: 'Обновление сайта',
    activityThree: 'Ноа Уильямс запросил проверку', projectThree: 'Мобильное приложение · Немецкий',
    activityFour: 'Оливия Мартин опубликовала новую версию', projectFour: 'Центр помощи · Французский',
    language: 'Язык интерфейса', english: 'English', russian: 'Русский',
    projectsData: [
      { name: 'Мобильное приложение', detail: 'iOS и Android', locale: '8 языков', percent: 82, people: ['MC', 'JL', 'NW'], color: 'violet' },
      { name: 'Обновление сайта', detail: 'Сайт компании', locale: '5 языков', percent: 64, people: ['AM', 'MC'], color: 'blue' },
      { name: 'Центр помощи', detail: 'Материалы поддержки', locale: '12 языков', percent: 96, people: ['OM', 'JL', 'AM'], color: 'green' },
      { name: 'Письма клиентам', detail: 'Письма и уведомления', locale: '4 языка', percent: 38, people: ['NW', 'OM'], color: 'orange' },
    ],
  },
} as const;

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('interface-language');
    if (saved === 'en' || saved === 'ru') return saved;
  } catch { /* Storage may be unavailable in private browsing. */ }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const icons: Record<string, string> = {
  overview: '◫', translations: '文', projects: '▦', activity: '◷', settings: '⚙', help: '?',
};

export function App() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = copy[language];
  const today = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'ru-RU', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  }).format(new Date()).toLocaleUpperCase(language === 'en' ? 'en-US' : 'ru-RU');

  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('interface-language', language); } catch { /* Keep the selection for this session. */ }
  }, [language]);

  const navItems = [
    ['overview', t.overview], ['translations', t.translations], ['projects', t.projects], ['activity', t.activity],
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Lingua home"><span className="brand-mark">L</span><span>lingua<span className="brand-dot">.</span></span></a>
        <div className="workspace-label">{t.workspace}</div>
        <button className="workspace-switch"><span className="workspace-avatar">S</span><span className="workspace-name">Studio North</span><span className="chevron">⌄</span></button>
        <nav aria-label={t.workspace}>
          <div className="nav-label">{t.workspaceSection}</div>
          {navItems.map(([key, label], index) => <a key={key} href={`#${key}`} className={`nav-item ${index === 0 ? 'selected' : ''}`}><span className="nav-icon">{icons[key]}</span>{label}{key === 'translations' && <span className="nav-count">3</span>}</a>)}
          <div className="nav-label nav-label-lower">{t.preferences}</div>
          <a href="#settings" className="nav-item"><span className="nav-icon">{icons.settings}</span>{t.settings}</a>
        </nav>
        <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">✳</span><strong>{t.help}</strong><span>{language === 'en' ? 'Tips and guides to help you get started.' : 'Советы и инструкции для начала работы.'}</span><a href="#help">{language === 'en' ? 'Explore resources' : 'Все материалы'} <span>↗</span></a></div><div className="profile"><div className="profile-avatar">AM</div><div className="profile-info"><strong>Alex Morgan</strong><span>alex@studionorth.co</span></div><span className="more">···</span></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs">Studio North <span>/</span> <strong>{t.overview}</strong></div><div className="top-actions"><label className="search-box"><span>⌕</span><input aria-label={t.search} placeholder={t.search} /><kbd>⌘ K</kbd></label><button className="icon-button notification" aria-label={language === 'en' ? 'Notifications' : 'Уведомления'}>♧<i /></button><div className="language-control" aria-label={t.language}><span className="globe">◎</span><button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button><span className="language-divider">/</span><button className={language === 'ru' ? 'active' : ''} onClick={() => setLanguage('ru')} aria-pressed={language === 'ru'}>RU</button></div></div></header>
        <div className="content">
          <div className="page-heading"><div><div className="eyebrow">{today}<span className="eyebrow-line" /></div><h1>{t.greeting} <span className="wave">✳</span></h1><p>{t.subtitle}</p></div><button className="primary-button">{t.newProject}</button></div>

          <section className="stats-grid" aria-label={language === 'en' ? 'Workspace summary' : 'Сводка рабочего пространства'}>
            <article className="stat-card"><div className="stat-heading">{t.projectsLabel}<span className="stat-icon purple">▦</span></div><div className="stat-value">12 <span className="stat-change positive">↗ 2</span></div><div className="stat-foot">{language === 'en' ? 'across your workspace' : 'в рабочем пространстве'}</div><div className="sparkline purple-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-heading">{t.translated}<span className="stat-icon blue">文</span></div><div className="stat-value">24,680 <span className="stat-change positive">↗ 12.8%</span></div><div className="stat-foot">{t.fromLastWeek}</div><div className="sparkline blue-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-heading">{t.completion}<span className="stat-icon green">◉</span></div><div className="stat-value">76<span className="percent">%</span> <span className="stat-change positive">↗ 4.2%</span></div><div className="stat-foot">{t.fromLastWeek}</div><div className="sparkline green-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
            <article className="stat-card"><div className="stat-heading">{t.needsReview}<span className="stat-icon amber">◷</span></div><div className="stat-value">18 <span className="stat-change neutral">— 0</span></div><div className="stat-foot">{language === 'en' ? 'strings across 4 projects' : 'строк в 4 проектах'}</div><div className="review-dots"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
          </section>

          <div className="lower-grid"><section className="projects-panel"><div className="section-heading"><div><h2>{t.yourProjects}</h2><span>{language === 'en' ? 'Keep track of your localization progress' : 'Следите за ходом локализации'}</span></div><a href="#projects">{t.viewAll} <b>→</b></a></div><div className="table-wrap"><table><thead><tr><th>{t.projects}</th><th>{t.progress}</th><th>{t.contributors}</th><th>{t.status}</th><th /></tr></thead><tbody>{t.projectsData.map((project) => <tr key={project.name}><td><div className="project-cell"><span className={`project-icon ${project.color}`}>{project.color === 'violet' ? '✳' : project.color === 'blue' ? '◈' : project.color === 'green' ? '▤' : '✉'}</span><span><strong>{project.name}</strong><small>{project.detail}</small></span></div></td><td><div className="progress-cell"><div className="progress-meta"><strong>{project.percent}%</strong><span>{project.locale}</span></div><div className="progress-track"><i className={project.color} style={{ width: `${project.percent}%` }} /></div></div></td><td><div className="avatar-stack">{project.people.map((person, i) => <span key={person} className={`tiny-avatar avatar-${i}`}>{person}</span>)}</div></td><td><span className={`status-pill ${project.percent === 96 ? 'done' : project.percent < 50 ? 'reviewing' : ''}`}><i />{project.percent === 96 ? t.completed : project.percent < 50 ? t.review : t.inProgress}</span></td><td><button className="row-menu" aria-label={t.open}>···</button></td></tr>)}</tbody></table></div></section>
          <section className="activity-panel"><div className="section-heading"><div><h2>{t.activityTitle}</h2><span>{language === 'en' ? 'What your team has been up to' : 'Чем занималась ваша команда'}</span></div><a href="#activity" aria-label={t.seeActivity}>···</a></div><div className="activity-list"><article className="activity-item"><div className="activity-avatar mint">MC</div><div><p>{t.activityOne}</p><span>{t.projectOne}</span><small>{t.daysAgo}</small></div></article><article className="activity-item"><div className="activity-avatar lilac">AM</div><div><p>{t.activityTwo} <strong>{t.projectTwo}</strong></p><span>{language === 'en' ? '24 new source strings' : '24 новые исходные строки'}</span><small>{t.yesterday} · 4:32 PM</small></div></article><article className="activity-item"><div className="activity-avatar peach">NW</div><div><p>{t.activityThree}</p><span>{t.projectThree}</span><small>{t.yesterday} · 2:18 PM</small></div></article><article className="activity-item"><div className="activity-avatar sky">OM</div><div><p>{t.activityFour}</p><span>{t.projectFour}</span><small>{language === 'en' ? 'Monday · 11:06 AM' : 'Понедельник · 11:06'}</small></div></article></div><a href="#activity" className="activity-link">{t.seeActivity} <b>→</b></a></section></div>
          <footer><span>© 2024 Lingua Inc.</span><span>{t.language}: <button onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}>{language === 'en' ? t.english : t.russian}⌄</button></span></footer>
        </div>
      </main>
    </div>
  );
}
