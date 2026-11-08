import { useEffect, useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import './app.css';

type Page = 'overview' | 'projects' | 'notes';
type IconName = 'grid' | 'layers' | 'note' | 'sun' | 'moon' | 'arrow' | 'plus' | 'check' | 'clock' | 'dots' | 'search' | 'spark' | 'leaf' | 'book' | 'coffee';

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>,
    arrow: <><path d="M7 17 17 7M7 7h10v10"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z"/></>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z"/><path d="M4 21c3-6 7-9 13-12"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    coffee: <><path d="M10 2v2m4-2v2M4 7h16l-1.5 12h-13L4 7Z"/><path d="M20 10h1a2 2 0 0 1 0 4h-2M7 11v3m5-3v3m5-3v3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const initialTasks = [
  { title: 'Дополнить концепцию сайта', project: 'Редизайн сайта', time: '09:30', done: true, color: 'lilac' },
  { title: 'Подготовить мудборд', project: 'Личный проект', time: '11:00', done: false, color: 'peach' },
  { title: 'Созвониться с командой', project: 'Команда', time: '14:30', done: false, color: 'mint' },
];
const projects = [
  { title: 'Редизайн сайта', subtitle: 'Новый взгляд на привычное', progress: 72, color: 'violet', icon: 'spark' as IconName, due: 'до 18 мая' },
  { title: 'Личный проект', subtitle: 'Маленькая кофейня у дома', progress: 38, color: 'orange', icon: 'coffee' as IconName, due: 'до 24 мая' },
  { title: 'Сад на балконе', subtitle: 'Больше зелени каждый день', progress: 54, color: 'green', icon: 'leaf' as IconName, due: 'до 30 мая' },
  { title: 'Книжный клуб', subtitle: 'Читаем и делимся мыслями', progress: 86, color: 'blue', icon: 'book' as IconName, due: 'до 2 июня' },
];
const initialNotes = [
  { title: 'Идеи для новой недели', text: 'Больше воздуха в расписании. Выделить время на прогулки и наконец начать утро без телефона.', date: 'Сегодня, 09:14', color: 'note-yellow', tag: 'Личное' },
  { title: 'Референсы для проекта', text: 'Тёплая типографика, естественный свет, тактильные материалы. Посмотреть подборку из сохранённого.', date: 'Вчера, 18:32', color: 'note-pink', tag: 'Дизайн' },
  { title: 'Что приготовить на выходных', text: 'Лимонный кекс, томатная паста и салат с хрустящим нутом. Купить базилик и хороший пармезан.', date: '12 мая, 12:05', color: 'note-green', tag: 'Заметки' },
];

function AppContent() {
  const [page, setPage] = useState<Page>(() => (location.hash.replace('#', '') as Page) || 'overview');
  const [dark, setDark] = useState(() => localStorage.getItem('quietplan-theme') === 'dark');
  const [tasks, setTasks] = useState(initialTasks);
  const [query, setQuery] = useState('');
  useEffect(() => { localStorage.setItem('quietplan-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    const onHash = () => { const target = location.hash.slice(1); if (['overview', 'projects', 'notes'].includes(target)) setPage(target as Page); };
    window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (next: Page) => { setPage(next); location.hash = next; };
  const titles: Record<Page, string> = { overview: 'Хороший день начинается с ясных мыслей.', projects: 'Всё важное — в своём темпе.', notes: 'Мысли, которые хочется сохранить.' };
  const subtitles: Record<Page, string> = { overview: 'Понедельник, 13 мая  ·  Несколько дел — и время для себя.', projects: 'Большие идеи становятся ближе, если разбить их на шаги.', notes: 'Ваше место для планов, идей и маленьких открытий.' };
  return <ThemeProvider theme={dark ? 'dark' : 'light'}><div className={`app-shell ${dark ? 'dark' : ''}`}>
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={() => navigate('overview')}><span className="brand-mark"><Icon name="spark" size={20}/></span><span>тихий план<span className="brand-dot">.</span></span></a>
      <div className="side-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav className="nav-list" aria-label="Основная навигация">
        {([['overview', 'Обзор', 'grid'], ['projects', 'Проекты', 'layers'], ['notes', 'Заметки', 'note']] as [Page, string, IconName][]).map(([id, label, icon]) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => navigate(id)}><Icon name={icon}/><span>{label}</span>{id === 'projects' && <span className="nav-count">4</span>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="side-quote"><span className="quote-mark">“</span><p>Маленькие шаги<br/>тоже ведут вперёд.</p><span className="quote-by">— заметка себе</span><span className="quote-flower">✳</span></div><button className="theme-switch" onClick={() => setDark(!dark)}><span className="theme-icon"><Icon name={dark ? 'moon' : 'sun'} size={17}/></span><span>{dark ? 'Тёмная тема' : 'Светлая тема'}</span><span className={`switch ${dark ? 'on' : ''}`}><i/></span></button><div className="profile"><div className="avatar">А</div><div className="profile-copy"><strong>Аня Смирнова</strong><span>Моё пространство</span></div><button className="icon-button profile-menu" aria-label="Меню профиля"><Icon name="dots"/></button></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Моё пространство <span>/</span> <strong>{page === 'overview' ? 'Обзор' : page === 'projects' ? 'Проекты' : 'Заметки'}</strong></div><div className="topbar-right"><span className="today-pill"><span/> Всё синхронизировано</span><button className="mobile-theme icon-button" onClick={() => setDark(!dark)} aria-label="Переключить тему"><Icon name={dark ? 'moon' : 'sun'}/></button><div className="avatar small">А</div></div></header>
      <div className="content-wrap"><section className="welcome"><div><div className="eyebrow"><span className="eyebrow-line"/> ПОНЕДЕЛЬНИК, 13 МАЯ</div><h1>{titles[page]}</h1><p>{subtitles[page]}</p></div><div className="welcome-art"><span className="art-sun"/><span className="art-leaf leaf-a"/><span className="art-leaf leaf-b"/><span className="art-stem"/><span className="art-dot d1"/><span className="art-dot d2"/></div></section>
        {page === 'overview' && <>
          <section className="stats-grid"><article className="stat-card"><span className="stat-icon violet-bg"><Icon name="check"/></span><div className="stat-label">Задач на сегодня</div><div className="stat-value">{tasks.filter(t => t.done).length}<span> / {tasks.length}</span></div><div className="stat-foot"><span className="tiny-progress"><i style={{ width: `${Math.round(tasks.filter(t => t.done).length / tasks.length * 100)}%` }}/></span><span>Хорошее начало</span></div></article><article className="stat-card"><span className="stat-icon peach-bg"><Icon name="layers"/></span><div className="stat-label">Активных проектов</div><div className="stat-value">04</div><div className="stat-foot"><span className="stat-note">Все в своём ритме</span></div></article><article className="stat-card"><span className="stat-icon mint-bg"><Icon name="clock"/></span><div className="stat-label">Фокус на этой неделе</div><div className="stat-value">12<span> ч</span> 40<span> мин</span></div><div className="stat-foot"><span className="trend">↗ 2 ч 10 мин</span><span>к прошлой неделе</span></div></article></section>
          <section className="dashboard-grid"><article className="panel today-panel"><div className="panel-heading"><div><div className="section-kicker">ВАШ РИТМ</div><h2>План на сегодня</h2></div><button className="text-action" onClick={() => navigate('projects')}>Все задачи <Icon name="arrow" size={15}/></button></div><div className="task-list">{tasks.map((task, i) => <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.title}><button className={`task-check ${task.done ? 'checked' : ''}`} aria-label={task.done ? 'Отметить незавершённой' : 'Отметить выполненной'} onClick={() => setTasks(tasks.map((t, n) => n === i ? { ...t, done: !t.done } : t))}>{task.done && <Icon name="check" size={14}/>}</button><div className="task-main"><strong>{task.title}</strong><span><i className={`project-dot ${task.color}`}/>{task.project}</span></div><span className="task-time"><Icon name="clock" size={14}/>{task.time}</span><button className="icon-button task-more" aria-label="Параметры задачи"><Icon name="dots" size={17}/></button></div>)}</div><button className="add-task" onClick={() => setTasks([...tasks, { title: 'Новая задача', project: 'Личный проект', time: '16:00', done: false, color: 'lilac' }])}><Icon name="plus" size={17}/> Добавить задачу</button></article>
            <article className="focus-card"><div className="focus-top"><span className="focus-icon"><Icon name="spark" size={17}/></span><span className="focus-caption">МАЛЕНЬКОЕ НАПОМИНАНИЕ</span></div><div className="focus-quote">Не нужно успеть<br/>всё. Достаточно<br/><em>сделать своё.</em></div><div className="focus-rule"/><div className="focus-bottom"><span>И не забыть про паузы</span><span className="focus-flower">✳</span></div><div className="focus-watermark">✳</div></article></section>
          <section className="panel projects-preview"><div className="panel-heading"><div><div className="section-kicker">В ДВИЖЕНИИ</div><h2>Ваши проекты</h2></div><button className="text-action" onClick={() => navigate('projects')}>Все проекты <Icon name="arrow" size={15}/></button></div><div className="project-preview-grid">{projects.slice(0, 3).map(p => <ProjectMini key={p.title} project={p}/>)}</div></section>
        </>}
        {page === 'projects' && <section className="projects-page"><div className="toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти проект..."/></div><button className="primary-button" onClick={() => alert('Новый проект добавлен в ваш список.')}><Icon name="plus" size={17}/> Новый проект</button></div><div className="project-card-grid">{projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase())).map(p => <ProjectCard key={p.title} project={p}/>)}</div><div className="gentle-banner"><span className="gentle-icon"><Icon name="leaf" size={21}/></span><div><strong>У каждого проекта свой темп</strong><p>Вы уже продвинулись дальше, чем кажется. Продолжайте в своём ритме.</p></div><span className="gentle-flower">✳</span></div></section>}
        {page === 'notes' && <section className="notes-page"><div className="toolbar"><div className="search-box"><Icon name="search" size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Найти заметку..."/></div><button className="primary-button" onClick={() => alert('Новая заметка создана.')}><Icon name="plus" size={17}/> Новая заметка</button></div><div className="note-grid">{initialNotes.filter(n => `${n.title} ${n.text} ${n.tag}`.toLowerCase().includes(query.toLowerCase())).map(note => <article className={`note-card ${note.color}`} key={note.title}><div className="note-card-top"><span className="note-tag">{note.tag}</span><button className="icon-button" aria-label="Параметры заметки"><Icon name="dots"/></button></div><h2>{note.title}</h2><p>{note.text}</p><div className="note-date">{note.date}</div><span className="note-decoration">✳</span></article>)}</div><button className="new-note-tile" onClick={() => alert('Новая заметка создана.')}><span className="new-note-icon"><Icon name="plus" size={22}/></span><strong>Записать мысль</strong><span>Иногда одна идея меняет весь день.</span></button></section>}
        <footer className="footer"><span>Сделано с заботой о вашем фокусе <span className="heart">♥</span></span><span>Ваше пространство · 2024</span></footer>
      </div>
    </main>
  </div></ThemeProvider>;
}

function ProjectMini({ project: p }: { project: typeof projects[number] }) { return <div className="project-mini"><span className={`project-mini-icon ${p.color}`}><Icon name={p.icon} size={18}/></span><div className="mini-copy"><strong>{p.title}</strong><span>{p.subtitle}</span><div className="mini-progress"><i className={p.color} style={{ width: `${p.progress}%` }}/></div><small>{p.progress}% готово</small></div><button className="icon-button mini-more" aria-label="Параметры проекта"><Icon name="dots" size={17}/></button></div>; }
function ProjectCard({ project: p }: { project: typeof projects[number] }) { return <article className="project-card"><div className="project-card-top"><span className={`project-mini-icon ${p.color}`}><Icon name={p.icon} size={19}/></span><button className="icon-button" aria-label="Параметры проекта"><Icon name="dots"/></button></div><div className="project-card-copy"><h2>{p.title}</h2><p>{p.subtitle}</p></div><div className="project-progress-label"><span>Прогресс</span><strong>{p.progress}%</strong></div><div className="large-progress"><i className={p.color} style={{ width: `${p.progress}%` }}/></div><div className="project-card-footer"><span><Icon name="clock" size={14}/>{p.due}</span><span className="project-open">Открыть <Icon name="arrow" size={14}/></span></div></article>; }
export function App() { return <AppContent/>; }
