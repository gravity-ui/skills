import { useEffect, useMemo, useState } from 'react';
import './App.css';

type Page = 'overview' | 'tasks' | 'notes';
type Task = { id: number; title: string; project: string; time: string; done: boolean; color: string };

const initialTasks: Task[] = [
  { id: 1, title: 'Подготовить структуру проекта', project: 'Личный сайт', time: '09:30', done: true, color: 'violet' },
  { id: 2, title: 'Собрать идеи для главной страницы', project: 'Личный сайт', time: '11:00', done: false, color: 'violet' },
  { id: 3, title: 'Ответить на письмо от команды', project: 'Работа', time: '13:15', done: false, color: 'orange' },
  { id: 4, title: 'Прогуляться и проветрить голову', project: 'Для себя', time: '16:00', done: false, color: 'green' },
];

const icons: Record<Page | 'sun' | 'moon' | 'plus' | 'arrow' | 'check' | 'search' | 'dots' | 'spark', string> = {
  overview: 'M3 3h8v8H3z M14 3h7v5h-7z M14 11h7v10h-7z M3 14h8v7H3z',
  tasks: 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01',
  notes: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8',
  sun: 'M12 3v2 M12 19v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M3 12h2 M19 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13z',
  plus: 'M12 5v14 M5 12h14', arrow: 'M5 12h14 M13 6l6 6-6 6', check: 'M20 6 9 17l-5-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
  dots: 'M5 12h.01 M12 12h.01 M19 12h.01', spark: 'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z',
};

function Icon({ name, size = 20 }: { name: keyof typeof icons; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[name]} /></svg>;
}

const pages: { id: Page; label: string }[] = [
  { id: 'overview', label: 'Обзор' }, { id: 'tasks', label: 'Задачи' }, { id: 'notes', label: 'Заметки' },
];

export function App() {
  const [page, setPage] = useState<Page>('overview');
  const [dark, setDark] = useState(() => localStorage.getItem('quiet-theme') === 'dark');
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'Все' | 'Активные' | 'Готово'>('Все');
  const [note, setNote] = useState('');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('quiet-theme', dark ? 'dark' : 'light');
  }, [dark]);
  const done = tasks.filter((task) => task.done).length;
  const visibleTasks = useMemo(() => tasks.filter((task) => filter === 'Все' || (filter === 'Активные' ? !task.done : task.done)), [tasks, filter]);
  const toggleTask = (id: number) => setTasks((items) => items.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const addTask = () => {
    const title = window.prompt('Новая задача');
    if (title?.trim()) setTasks((items) => [...items, { id: Date.now(), title: title.trim(), project: 'Для себя', time: 'Без времени', done: false, color: 'green' }]);
  };
  const heading = pages.find((item) => item.id === page)?.label;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#overview" onClick={(event) => { event.preventDefault(); setPage('overview'); }}><span className="brand-mark"><Icon name="spark" size={21} /></span><span>тихо<span className="brand-dot">.</span></span></a>
      <div className="workspace-label">ПРОСТРАНСТВО</div>
      <nav className="main-nav" aria-label="Основная навигация">{pages.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}><Icon name={item.id} /><span>{item.label}</span>{item.id === 'tasks' && <span className="nav-count">{tasks.filter((task) => !task.done).length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><div className="note-orb"><Icon name="spark" size={17} /></div><p>Небольшими шагами — к большим переменам.</p><span>Ты справляешься ✨</span></div><button className="profile"><span className="avatar">А</span><span className="profile-copy"><b>Александра</b><small>Моё пространство</small></span><Icon name="dots" size={18} /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Моё пространство</span><span className="crumb-slash">/</span><b>{heading}</b></div><div className="top-actions"><div className="date-label">СРЕДА, 4 НОЯБРЯ</div><button className="theme-toggle" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title={dark ? 'Светлая тема' : 'Тёмная тема'}><Icon name={dark ? 'sun' : 'moon'} size={18} /></button><button className="avatar top-avatar" aria-label="Профиль Александры">А</button></div></header>
      {page === 'overview' && <section className="content overview-page">
        <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> СРЕДА, 4 НОЯБРЯ 2026</div><h1>Хороший день,<br /><span>Александра.</span></h1><p className="welcome-subtitle">Не спеши. У тебя всё получится.</p></div><div className="sun-illustration" aria-hidden="true"><div className="sun-core" /><i /><i /><i /><i /></div></div>
        <div className="overview-grid"><article className="card focus-card"><div className="card-head"><div><span className="card-kicker">ТВОЙ ФОКУС</span><h2>На сегодня</h2></div><button className="icon-button" onClick={() => setPage('tasks')} aria-label="Открыть задачи"><Icon name="arrow" /></button></div><div className="progress-line"><div className="progress-track"><span style={{ width: `${tasks.length ? done / tasks.length * 100 : 0}%` }} /></div><span>{done} из {tasks.length}</span></div><div className="task-preview">{tasks.slice(0, 3).map((task) => <button className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id} onClick={() => toggleTask(task.id)}><span className={`task-check ${task.done ? 'checked' : ''}`}>{task.done && <Icon name="check" size={14} />}</span><span className="task-title">{task.title}</span><span className={`project-dot ${task.color}`} /><span className="task-time">{task.time}</span></button>)}</div><button className="text-link" onClick={() => setPage('tasks')}>Все задачи <Icon name="arrow" size={15} /></button></article>
        <article className="card quote-card"><div className="quote-spark"><Icon name="spark" size={20} /></div><span className="card-kicker">МЫСЛЬ ДНЯ</span><blockquote>«Почти всё хорошее приходит через маленькие шаги».</blockquote><div className="quote-author"><span /> Джеймс Клир</div><div className="quote-decoration">“</div></article>
        <article className="card week-card"><div className="card-head"><div><span className="card-kicker">ТВОЯ НЕДЕЛЯ</span><h2>Всё складывается</h2></div><span className="week-percent">68%</span></div><p className="muted">Ты уже прошла больше половины пути.</p><div className="week-bars">{[['ПН', 58], ['ВТ', 83], ['СР', 68], ['ЧТ', 0], ['ПТ', 0], ['СБ', 0], ['ВС', 0]].map(([label, value], index) => <div className="week-day" key={label}><div className="bar-track"><span className={`${index === 2 ? 'today-bar' : ''} ${Number(value) ? '' : 'empty-bar'}`} style={{ height: `${value}%` }} /></div><small className={index === 2 ? 'today-label' : ''}>{label}</small></div>)}</div></article>
        <article className="card note-card"><div className="card-head"><div><span className="card-kicker">БЫСТРАЯ ЗАМЕТКА</span><h2>Что на уме?</h2></div><span className="note-emoji">✳</span></div><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Запиши мысль, пока она рядом…" aria-label="Быстрая заметка" /><div className="note-footer"><span>{note ? 'Сохранено автоматически' : 'Только для тебя'}</span><button className="icon-button small" onClick={() => setPage('notes')} aria-label="Перейти к заметкам"><Icon name="arrow" size={17} /></button></div></article></div>
      </section>}
      {page === 'tasks' && <section className="content subpage"><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> МАЛЕНЬКИЕ ШАГИ</div><h1>Задачи<span className="title-period">.</span></h1><p className="welcome-subtitle">Один шаг за раз — этого достаточно.</p></div><button className="primary-button" onClick={addTask}><Icon name="plus" size={18} /> Новая задача</button></div><article className="card tasks-card"><div className="filter-row">{(['Все', 'Активные', 'Готово'] as const).map((item) => <button key={item} className={`filter-chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)}>{item}{item === 'Все' && <span>{tasks.length}</span>}</button>)}</div><div className="full-task-list">{visibleTasks.map((task) => <button className={`full-task-row ${task.done ? 'is-done' : ''}`} key={task.id} onClick={() => toggleTask(task.id)}><span className={`task-check ${task.done ? 'checked' : ''}`}>{task.done && <Icon name="check" size={14} />}</span><span className="full-task-copy"><b>{task.title}</b><small><span className={`project-dot ${task.color}`} />{task.project}</small></span><span className="task-time">{task.time}</span><Icon name="dots" size={18} /></button>)}{visibleTasks.length === 0 && <div className="empty-state">Пока здесь пусто. Всё идёт по плану ✨</div>}</div></article></section>}
      {page === 'notes' && <section className="content subpage"><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> МЕСТО ДЛЯ МЫСЛЕЙ</div><h1>Заметки<span className="title-period">.</span></h1><p className="welcome-subtitle">Идеи не обязаны быть идеальными.</p></div><button className="primary-button" onClick={() => document.querySelector<HTMLTextAreaElement>('.new-note textarea')?.focus()}><Icon name="plus" size={18} /> Новая заметка</button></div><div className="notes-grid"><article className="card note-tile note-tile-lilac"><span className="note-date">СЕГОДНЯ · 09:42</span><div className="note-tile-icon">✳</div><h2>Идеи для проекта</h2><p>Сделать пространство, где можно выдохнуть. Меньше шума, больше ясности и доброты к себе.</p><span className="note-tag">Вдохновение</span></article><article className="card note-tile note-tile-peach"><span className="note-date">ВЧЕРА · 18:20</span><div className="note-tile-icon">☼</div><h2>Не забыть</h2><p>Купить цветы по дороге домой. Позвонить маме. Оставить вечер без планов.</p><span className="note-tag">Личное</span></article><article className="card new-note"><span className="card-kicker">НОВАЯ МЫСЛЬ</span><textarea placeholder="Начни писать здесь…" aria-label="Новая заметка" /></article></div></section>}
    </main>
  </div>;
}
