import { useMemo, useState } from 'react';
import './app.css';

type Page = 'home' | 'tasks' | 'notes';
type Task = { id: number; title: string; project: string; time: string; done: boolean; color: string };

const initialTasks: Task[] = [
  { id: 1, title: 'Подготовить мудборд для проекта', project: 'Ребрендинг', time: '10:00', done: false, color: 'violet' },
  { id: 2, title: 'Созвониться с командой', project: 'Команда', time: '11:30', done: false, color: 'blue' },
  { id: 3, title: 'Отправить макеты на ревью', project: 'Мобильное приложение', time: '14:00', done: false, color: 'orange' },
  { id: 4, title: 'Разобрать входящие письма', project: 'Личное', time: '16:30', done: true, color: 'green' },
];

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

export function App() {
  const [page, setPage] = useState<Page>('home');
  const [dark, setDark] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'Все' | 'Активные' | 'Готовые'>('Все');
  const [search, setSearch] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  const addNote = () => {
    if (!newTitle.trim()) return;
    setSavedNotes((current) => [newTitle.trim(), ...current]);
    setNewTitle('');
    setShowNewTask(false);
  };
  const todayLabel = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toLocaleUpperCase('ru-RU');
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return { label: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date).replace('.', ''), date: date.getDate(), today: date.toDateString() === new Date().toDateString() };
  });
  const weekRange = `${weekStart.getDate()} — ${new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6).getDate()} ${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6))}`;

  const completed = tasks.filter((task) => task.done).length;
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesFilter = filter === 'Все' || (filter === 'Активные' ? !task.done : task.done);
    return matchesFilter && task.title.toLowerCase().includes(search.toLowerCase());
  }), [tasks, filter, search]);
  const toggleTask = (id: number) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks((current) => [{ id: Date.now(), title: newTitle.trim(), project: 'Личное', time: 'Сегодня', done: false, color: 'green' }, ...current]);
    setNewTitle('');
    setShowNewTask(false);
    setPage('tasks');
  };

  const navItems: { id: Page; label: string; icon: string }[] = [
    { id: 'home', label: 'Обзор', icon: 'home' },
    { id: 'tasks', label: 'Мои задачи', icon: 'check' },
    { id: 'notes', label: 'Заметки', icon: 'note' },
  ];

  return <div className={`app-shell ${dark ? 'dark' : ''}`}>
    <aside className="sidebar">
      <a className="brand" href="#home" onClick={(e) => { e.preventDefault(); setPage('home'); }}><span className="brand-mark"><Icon name="spark" size={19} /></span><span>точка</span></a>
      <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav className="side-nav" aria-label="Основная навигация">
        {navItems.map((item) => <button className={`nav-item ${page === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setPage(item.id)}><Icon name={item.icon} /><span>{item.label}</span>{item.id === 'tasks' && <span className="nav-count">{tasks.filter((task) => !task.done).length}</span>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Icon name="spark" size={18} /></div><strong>День в фокусе</strong><p>Небольшие шаги приводят к большим результатам.</p><button onClick={() => setPage('tasks')}>К задачам <Icon name="arrow" size={15} /></button></div>
        <div className="profile"><div className="avatar">А</div><div className="profile-copy"><strong>Александра</strong><span>Личный аккаунт</span></div><button className="icon-button profile-more" aria-label="Настройки профиля"><Icon name="more" /></button></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Моё пространство <span>/</span> <strong>{page === 'home' ? 'Обзор' : page === 'tasks' ? 'Мои задачи' : 'Заметки'}</strong></div><div className="top-actions"><label className="search-box"><Icon name="search" size={18} /><input aria-label="Поиск" placeholder="Поиск" value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>⌘ K</kbd></label><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title={dark ? 'Светлая тема' : 'Тёмная тема'}><Icon name={dark ? 'sun' : 'moon'} size={18} /></button><div className="top-avatar">А</div></div></header>

      <div className="page-content">
        {page === 'home' && <>
          <section className="welcome-row"><div><div className="eyebrow">{todayLabel}</div><h1>Доброе утро, Александра <span className="wave">✳</span></h1><p className="lead">Сегодня отличный день, чтобы сделать что-то важное.</p></div><button className="primary-button" onClick={() => setShowNewTask(true)}><Icon name="plus" size={18} /> Новая задача</button></section>
          <section className="stats-grid">
            <div className="stat-card"><div className="stat-top"><span>Задачи на сегодня</span><span className="stat-icon purple"><Icon name="check" size={18} /></span></div><div className="stat-number">{tasks.filter((task) => !task.done).length}<span> задачи</span></div><div className="stat-foot"><span className="trend">↗ 2</span> больше, чем вчера</div></div>
            <div className="stat-card"><div className="stat-top"><span>Выполнено за неделю</span><span className="stat-icon peach"><Icon name="spark" size={18} /></span></div><div className="stat-number">12<span> задач</span></div><div className="stat-foot"><span className="trend">↗ 18%</span> к прошлой неделе</div></div>
            <div className="stat-card focus-stat"><div className="stat-top"><span>Фокус на сегодня</span><span className="stat-icon mint"><Icon name="calendar" size={18} /></span></div><div className="stat-number">3<span> ч 20 мин</span></div><div className="focus-bar"><span /></div><div className="stat-foot">Из запланированных 5 часов</div></div>
          </section>
          <section className="content-grid"><div className="panel task-panel"><div className="panel-heading"><div><h2>План на сегодня</h2><p>Ваш список дел на вторник</p></div><button className="text-button" onClick={() => setPage('tasks')}>Все задачи <Icon name="arrow" size={16} /></button></div><div className="task-list">{tasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} />)}</div><button className="add-row" onClick={() => setShowNewTask(true)}><span><Icon name="plus" size={16} /></span> Добавить задачу</button></div>
            <div className="panel week-panel"><div className="panel-heading"><div><h2>Эта неделя</h2><p>{weekRange}</p></div><button className="icon-button" aria-label="Открыть календарь"><Icon name="more" /></button></div><div className="week-days">{weekDays.map(({ label, date, today })=><div className={`week-day ${today?'today':''}`} key={label}><span>{label}</span><b>{date}</b><i className={today?'active-dot':''} /></div>)}</div><div className="week-divider" /><div className="upcoming-title"><span>ПРЕДСТОЯЩЕЕ</span><span>2 события</span></div><div className="event"><div className="event-time">10:00</div><div className="event-line purple-line"/><div><strong>Дизайн-синк</strong><span>Команда продукта · 30 мин</span></div></div><div className="event"><div className="event-time">14:30</div><div className="event-line orange-line"/><div><strong>Обсуждение концепции</strong><span>Студия · 1 час</span></div></div></div></section>
          <section className="quote-strip"><div className="quote-mark">“</div><div><strong>Сосредоточься на прогрессе, а не на совершенстве.</strong><span>Твой маленький шаг сегодня — это большой результат завтра.</span></div><span className="quote-spark">✳</span></section>
        </>}

        {page === 'tasks' && <><section className="welcome-row page-heading"><div><div className="eyebrow">ВАШ СПИСОК ДЕЛ</div><h1>Мои задачи</h1><p className="lead">Двигайтесь к важному в своём темпе.</p></div><button className="primary-button" onClick={() => setShowNewTask(true)}><Icon name="plus" size={18} /> Новая задача</button></section><section className="panel full-panel"><div className="panel-heading"><div><h2>Все задачи <span className="heading-count">{tasks.length}</span></h2><p>{completed} из {tasks.length} задач выполнено</p></div><div className="filter-tabs">{(['Все','Активные','Готовые'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="task-list full-task-list">{visibleTasks.length ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTask} />) : <div className="empty-state">Задач не найдено. Попробуйте изменить поиск или фильтр.</div>}</div><button className="add-row" onClick={() => setShowNewTask(true)}><span><Icon name="plus" size={16} /></span> Добавить задачу</button></section><div className="task-tip"><span className="tip-icon"><Icon name="spark" size={17} /></span><span><strong>Небольшой совет</strong> Разбейте большую задачу на несколько маленьких — так начать будет проще.</span></div></>}

        {page === 'notes' && <><section className="welcome-row page-heading"><div><div className="eyebrow">МЫСЛИ И ИДЕИ</div><h1>Заметки</h1><p className="lead">Место, где можно сохранить важное.</p></div><button className="primary-button" onClick={() => setShowNewTask(true)}><Icon name="plus" size={18} /> Новая заметка</button></section><section className="notes-grid"><article className="note-card note-lilac"><div className="note-meta"><span>ИДЕИ</span><button className="icon-button" aria-label="Дополнительно"><Icon name="more" /></button></div><h2>Идеи для летней коллекции</h2><p>Лёгкие ткани, природные оттенки и простые формы. Добавить больше воздуха и меньше визуального шума.</p><div className="note-bottom"><span>Сегодня, 09:42</span><span className="note-pin">✳</span></div></article><article className="note-card note-yellow"><div className="note-meta"><span>ЛИЧНОЕ</span><button className="icon-button" aria-label="Дополнительно"><Icon name="more" /></button></div><h2>На этой неделе</h2><p>Сходить на выставку в субботу<br/>Купить цветы домой<br/>Позвонить бабушке</p><div className="note-bottom"><span>Вчера, 18:20</span><span className="note-pin">✳</span></div></article><article className="note-card note-mint"><div className="note-meta"><span>РАБОТА</span><button className="icon-button" aria-label="Дополнительно"><Icon name="more" /></button></div><h2>Вопросы к брейншторму</h2><p>Что мы хотим, чтобы люди почувствовали?<br/>Как сделать опыт проще?<br/>Что можно убрать?</p><div className="note-bottom"><span>12 мая, 14:05</span><span className="note-pin">✳</span></div></article>{savedNotes.map((note, index) => <article className="note-card note-lilac" key={`${note}-${index}`}><div className="note-meta"><span>НОВАЯ ЗАМЕТКА</span><span className="note-pin">✳</span></div><h2>{note}</h2><div className="note-bottom"><span>Только что</span></div></article>)}<button className="new-note-card" onClick={() => setShowNewTask(true)}><span><Icon name="plus" size={20} /></span><strong>Создать заметку</strong><small>Запишите новую идею</small></button></section></>}
      </div>
    </main>
    {showNewTask && <div className="modal-backdrop" onClick={() => setShowNewTask(false)}><form className="new-task-modal" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); page === 'notes' ? addNote() : addTask(); }}><button type="button" className="modal-close" onClick={() => setShowNewTask(false)}>×</button><div className="eyebrow">{page === 'notes' ? 'НОВАЯ ЗАМЕТКА' : 'НОВАЯ ЗАДАЧА'}</div><h2>{page === 'notes' ? 'О чём хотите записать?' : 'Что нужно сделать?'}</h2><input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder={page === 'notes' ? 'Например, идея для проекта' : 'Например, подготовить презентацию'} /><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewTask(false)}>Отмена</button><button className="primary-button" type="submit">{page === 'notes' ? 'Сохранить заметку' : 'Добавить задачу'}</button></div></form></div>}
  </div>;
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: number) => void }) {
  return <div className={`task-row ${task.done ? 'is-done' : ''}`}><button className={`task-check ${task.done ? 'checked' : ''}`} onClick={() => onToggle(task.id)} aria-label={task.done ? 'Вернуть задачу в активные' : 'Отметить задачу выполненной'}>{task.done && <Icon name="check" size={14} />}</button><div className={`project-dot ${task.color}`} /><div className="task-copy"><strong>{task.title}</strong><span>{task.project}</span></div><span className="task-time">{task.time}</span><button className="icon-button task-more" aria-label="Дополнительно"><Icon name="more" size={19} /></button></div>;
}
