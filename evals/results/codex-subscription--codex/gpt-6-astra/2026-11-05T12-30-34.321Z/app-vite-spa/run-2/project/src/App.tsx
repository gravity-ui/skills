import { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import './styles.css';

type Page = 'overview' | 'tasks' | 'notes';
type Task = { id: number; text: string; tag: string; done: boolean };
type Note = { id: number; title: string; text: string; color: string; date: string };
const initialTasks: Task[] = [
  { id: 1, text: 'Собрать идеи для нового проекта', tag: 'Работа', done: false },
  { id: 2, text: 'Прочитать 20 страниц книги', tag: 'Личное', done: false },
  { id: 3, text: 'Выйти на небольшую прогулку', tag: 'Здоровье', done: false },
  { id: 4, text: 'Спланировать неделю', tag: 'Личное', done: true },
];
const initialNotes: Note[] = [
  { id: 1, title: 'Мысли на ходу', text: 'Хорошие идеи приходят, когда оставляешь для них немного свободного места.', color: 'yellow', date: 'Сегодня' },
  { id: 2, title: 'Маленькие радости', text: 'Кофе без спешки, любимый плейлист и солнечный свет на рабочем столе.', color: 'purple', date: 'Вчера' },
  { id: 3, title: 'Идеи для выходных', text: 'Заглянуть в новый книжный. Пройтись по незнакомым улицам. Взять с собой камеру.', color: 'green', date: '3 ноября' },
];
function readStorage<T,>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
function Icon({ name, size = 20, ...props }: { name: string; size?: number; className?: string }) {
 const paths: Record<string, React.ReactNode> = {
 grid: <><rect x="3" y="3" width="7" height="7" rx="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.8"/></>,
 tasks: <><rect x="4" y="4" width="16" height="16" rx="4"/><path d="m8 12 3 3 5-6"/></>,
 notes: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></>,
 plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
 sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
 moon: <path d="M20.7 13A9 9 0 0 1 11 3.3 9 9 0 1 0 20.7 13Z"/>,
 chevron: <path d="m9 5 7 7-7 7"/>, check: <path d="m5 12 4 4L19 6"/>,
 clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 leaf: <><path d="M20 4C8 1 1 9 6 16s17 1 14-12Z"/><path d="M4 21 15 10M9 16v-5m0 5h5"/></>,
 search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
 close: <path d="m6 6 12 12M18 6 6 18"/>, trash: <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/></>,
 play: <path d="m9 5 10 7-10 7Z"/>, pause: <path d="M9 5v14M15 5v14"/>, reset: <><path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/></>,
 sparkle: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name] || paths.grid}</svg>;
}
function getPage(): Page { const hash = location.hash.slice(1); return hash === 'tasks' || hash === 'notes' ? hash : 'overview'; }
export function App() {
 const [page, setPage] = useState<Page>(getPage);
 const [theme, setTheme] = useState<'light' | 'dark'>(() => readStorage('tiho-theme', 'light'));
 const [tasks, setTasks] = useState<Task[]>(() => readStorage('tiho-tasks', initialTasks));
 const [notes, setNotes] = useState<Note[]>(() => readStorage('tiho-notes', initialNotes));
 const [filter, setFilter] = useState('Все задачи');
 const [search, setSearch] = useState('');
 const [modal, setModal] = useState<'task' | 'note' | null>(null);
 const [editing, setEditing] = useState<number | null>(null);
 const [title, setTitle] = useState('');
 const [body, setBody] = useState('');
 const [tag, setTag] = useState('Личное');
 const [color, setColor] = useState('yellow');
 const [seconds, setSeconds] = useState(25 * 60);
 const [running, setRunning] = useState(false);
 const dialogRef = useRef<HTMLDialogElement>(null);
 const triggerRef = useRef<HTMLElement | null>(null);
 useEffect(() => { const sync = () => setPage(getPage()); window.addEventListener('hashchange', sync); return () => window.removeEventListener('hashchange', sync); }, []);
 useEffect(() => { localStorage.setItem('tiho-theme', JSON.stringify(theme)); document.documentElement.dataset.theme = theme; }, [theme]);
 useEffect(() => { localStorage.setItem('tiho-tasks', JSON.stringify(tasks)); }, [tasks]);
 useEffect(() => { localStorage.setItem('tiho-notes', JSON.stringify(notes)); }, [notes]);
 useEffect(() => { if (modal) dialogRef.current?.showModal(); else { dialogRef.current?.close(); triggerRef.current?.focus(); } }, [modal]);
 useEffect(() => { if (!running) return; const interval = window.setInterval(() => setSeconds(s => { if (s <= 1) { setRunning(false); return 0; } return s - 1; }), 1000); return () => clearInterval(interval); }, [running]);
 function openModal(kind: 'task' | 'note', note?: Note) { triggerRef.current = document.activeElement as HTMLElement; setEditing(note?.id ?? null); setTitle(note?.title ?? ''); setBody(note?.text ?? ''); setColor(note?.color ?? 'yellow'); setTag('Личное'); setModal(kind); }
 function save(e: React.FormEvent) { e.preventDefault(); if (!title.trim()) return; if (modal === 'task') setTasks([...tasks, { id: Date.now(), text: title.trim(), tag, done: false }]); else { const note = { id: editing ?? Date.now(), title: title.trim(), text: body.trim(), color, date: 'Сегодня' }; setNotes(editing ? notes.map(n => n.id === editing ? note : n) : [note, ...notes]); } setModal(null); }
 function toggleTask(id: number) { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }
 const done = tasks.filter(t => t.done).length;
 const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
 const date = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }).format(new Date());
 const visibleTasks = tasks.filter(t => filter === 'Все задачи' || (filter === 'В работе' ? !t.done : t.done));
 const visibleNotes = notes.filter(n => `${n.title} ${n.text}`.toLowerCase().includes(search.toLowerCase()));
 const taskRows = (items: Task[], full = false) => items.map(task => <div className={`task-row ${task.done ? 'is-done' : ''}`} key={task.id}><button className="checkbox" aria-label={`${task.done ? 'Возобновить' : 'Завершить'}: ${task.text}`} aria-pressed={task.done} onClick={() => toggleTask(task.id)}>{task.done && <Icon name="check" size={13}/>}</button><span className="task-text">{task.text}</span><span className={`tag tag-${task.tag === 'Работа' ? 'work' : task.tag === 'Здоровье' ? 'health' : 'personal'}`}>{task.tag}</span>{full && <button className="icon-button delete-task" aria-label={`Удалить: ${task.text}`} onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}><Icon name="trash" size={16}/></button>}</div>);
 return <ThemeProvider theme={theme}><div className="app-shell">
  <aside className="sidebar">
   <a className="brand" href="#overview" aria-label="Тихо — главная"><span className="brand-mark"><span/><span/><span/></span>тихо<span className="brand-dot">.</span></a>
   <div className="workspace-label">ВАШЕ ПРОСТРАНСТВО</div>
   <nav aria-label="Основная навигация">{([{ id: 'overview', title: 'Обзор', icon: 'grid' }, { id: 'tasks', title: 'Задачи', icon: 'tasks' }, { id: 'notes', title: 'Заметки', icon: 'notes' }] as const).map(item => <a key={item.id} href={`#${item.id}`} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined}><Icon name={item.icon}/><span>{item.title}</span>{item.id === 'tasks' && <span className="nav-count">{tasks.filter(t => !t.done).length}</span>}</a>)}</nav>
   <div className="sidebar-bottom"><div className="sidebar-message"><Icon name="leaf" size={23}/><p>В своём ритме.<br/><span>С вниманием к главному.</span></p></div><div className="theme-label">Оформление</div><div className="theme-switch" aria-label="Выбор темы"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')} aria-pressed={theme === 'light'}><Icon name="sun" size={16}/>Светлая</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'}><Icon name="moon" size={16}/>Тёмная</button></div><div className="profile"><div className="avatar">А</div><div><strong>Александр</strong><span>Личное пространство</span></div><span className="online-dot" title="Локальное пространство"/></div></div>
  </aside>
  <div className="main-shell"><header className="topbar"><div className="breadcrumb">Моё пространство <Icon name="chevron" size={13}/><span>{page === 'overview' ? 'Обзор' : page === 'tasks' ? 'Задачи' : 'Заметки'}</span></div><div className="topbar-right"><span className="local-indicator"/>Всё под рукой<span className="small-avatar">А</span></div></header>
  <main>
   <div className="page-heading"><div><div className="eyebrow">{page === 'overview' ? date : page === 'tasks' ? 'ШАГ ЗА ШАГОМ' : 'МЕСТО ДЛЯ МЫСЛЕЙ'}</div><h1>{page === 'overview' ? 'Хороший день, чтобы начать' : page === 'tasks' ? 'Мои задачи' : 'Мои заметки'}{page === 'overview' && <span className="greeting-sun">✳</span>}</h1><p>{page === 'overview' ? 'Немного ясности, немного фокуса — и всё получится.' : page === 'tasks' ? 'Освободите мысли. Пусть у каждого дела будет своё место.' : 'Сохраняйте идеи, наблюдения и то, что хочется запомнить.'}</p></div><button className="button primary" onClick={() => openModal(page === 'notes' ? 'note' : 'task')}><Icon name="plus" size={18}/>{page === 'notes' ? 'Новая заметка' : 'Новая задача'}</button></div>
   {page === 'overview' && <>
    <section className="hero"><div className="hero-copy"><div className="hero-kicker"><span/>ПРОСТРАНСТВО ДЛЯ ВАЖНОГО</div><h2>Меньше шума.<br/>Больше главного.</h2><p>Соберите задачи и мысли в одном месте.<br/>И двигайтесь вперёд в своём ритме.</p><a className="hero-link" href="#tasks">Перейти к задачам <Icon name="arrow" size={18}/></a></div><div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-orbit orbit-three"/><div className="art-ball"/><div className="art-arch"><div/><div/><div/><div/><div/><div/></div><span className="art-star">✳</span><div className="art-caption"><span/>МАЛЕНЬКИЕ ШАГИ. БОЛЬШИЕ ПЕРЕМЕНЫ.</div></div></section>
    <div className="stats-grid"><div className="stat-card"><div className="stat-icon sage"><Icon name="tasks"/></div><div><span className="stat-title">Задачи на сегодня</span><div className="stat-value">{tasks.filter(t => !t.done).length}<span>в вашем ритме</span></div></div><div className="stat-decoration">↗</div></div><div className="stat-card"><div className="stat-icon peach"><Icon name="check"/></div><div><span className="stat-title">Уже сделано</span><div className="stat-value">{done}<span>маленькая победа</span></div></div><span className="mini-chart"><i/><i/><i/><i/><i/></span></div><div className="stat-card"><div className="stat-icon lavender"><Icon name="notes"/></div><div><span className="stat-title">Ваши заметки</span><div className="stat-value">{notes.length}<span>идеи рядом</span></div></div><Icon name="sparkle" size={26} className="stat-sparkle"/></div></div>
    <div className="dashboard-grid"><section className="panel tasks-panel"><div className="section-heading"><h2>В фокусе сегодня <span className="count">{tasks.length}</span></h2><a href="#tasks">Все задачи <Icon name="arrow" size={16}/></a></div><div className="task-list">{tasks.length ? taskRows(tasks.slice(0, 4)) : <p className="empty-inline">Свободный день. Добавьте первое дело.</p>}</div><button className="add-task" onClick={() => openModal('task')}><Icon name="plus" size={17}/>Добавить задачу</button><div className="progress-section"><div><span>Каждый шаг имеет значение</span><strong>{done} из {tasks.length} выполнено</strong></div><div className="progress-track"><div style={{ width: `${percent}%` }}/></div></div></section>
    <section className="notes-preview"><div className="section-heading"><h2>Свежие мысли</h2><a href="#notes">Все заметки <Icon name="arrow" size={16}/></a></div>{notes.slice(0, 2).map(note => <button className={`note-preview note-${note.color}`} key={note.id} onClick={() => openModal('note', note)}><div><Icon name="notes" size={16}/><span>{note.date}</span></div><h3>{note.title}</h3><p>{note.text}</p><Icon name="arrow" className="note-arrow" size={17}/></button>)}{!notes.length && <button className="empty-note" onClick={() => openModal('note')}>Сохраните первую мысль <Icon name="plus"/></button>}</section></div>
    <section className="slow-banner"><div className="slow-icon"><Icon name="sun" size={25}/></div><div><h3>Не всё нужно успеть сегодня.</h3><p>Иногда самое продуктивное — сделать паузу и выдохнуть.</p></div><span className="handwritten">Вы всё успеете <span>↗</span></span></section>
   </>}
   {page === 'tasks' && <div className="tasks-page-grid"><section className="panel all-tasks"><div className="filter-tabs">{['Все задачи', 'В работе', 'Выполнено'].map(f => <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'active' : ''}>{f}<span>{f === 'Все задачи' ? tasks.length : f === 'В работе' ? tasks.length - done : done}</span></button>)}</div><div className="task-list">{visibleTasks.length ? taskRows(visibleTasks, true) : <div className="empty-state"><Icon name="leaf" size={36}/><h3>{filter === 'Выполнено' ? 'Всё ещё впереди' : 'Здесь пока спокойно'}</h3><p>{filter === 'Выполнено' ? 'Завершённые задачи появятся здесь.' : 'Добавьте задачу или загляните в другую вкладку.'}</p></div>}</div><button className="add-task" onClick={() => openModal('task')}><Icon name="plus" size={17}/>Добавить задачу</button></section><aside className="focus-card"><div className="focus-label"><Icon name="clock" size={17}/>Время для фокуса</div><h2>Одно дело за раз.</h2><p>{seconds === 0 ? 'Отличная работа! Пора немного отдохнуть.' : '25 минут внимания к тому, что важно.'}</p><div className="timer" role="timer" aria-label="Оставшееся время">{String(Math.floor(seconds / 60)).padStart(2, '0')}<span>:</span>{String(seconds % 60).padStart(2, '0')}</div><div className="timer-actions"><button className="button primary" onClick={() => { if (seconds === 0) setSeconds(1500); setRunning(!running); }}><Icon name={running ? 'pause' : 'play'} size={16}/>{running ? 'Пауза' : seconds === 1500 ? 'Начать' : seconds === 0 ? 'Ещё раз' : 'Продолжить'}</button><button className="icon-button reset-timer" aria-label="Сбросить таймер" onClick={() => { setRunning(false); setSeconds(1500); }}><Icon name="reset" size={19}/></button></div><span className="focus-footer"><Icon name="leaf" size={15}/>У вас всё получится</span></aside></div>}
   {page === 'notes' && <><div className="notes-toolbar"><span>{notes.length} {notes.length === 1 ? 'заметка' : notes.length > 1 && notes.length < 5 ? 'заметки' : 'заметок'} · всё важное рядом</span><label className="search-field"><Icon name="search" size={18}/><input placeholder="Найти мысль…" aria-label="Поиск заметок" value={search} onChange={e => setSearch(e.target.value)}/>{search && <button aria-label="Очистить поиск" onClick={() => setSearch('')}><Icon name="close" size={15}/></button>}</label></div><div className="notes-grid">{visibleNotes.map(note => <button key={note.id} className={`note-card note-${note.color}`} onClick={() => openModal('note', note)}><Icon name="notes" size={22}/><h2>{note.title}</h2><p>{note.text}</p><div><span>{note.date}</span><Icon name="arrow" size={18}/></div></button>)}{!search && <button className="new-note-card" onClick={() => openModal('note')}><span><Icon name="plus" size={25}/></span><h3>Поймать мысль</h3><p>Большие идеи начинаются<br/>с маленькой заметки</p></button>}</div>{search && !visibleNotes.length && <div className="empty-state"><Icon name="search" size={32}/><h3>Ничего не нашлось</h3><p>Попробуйте другое слово.</p></div>}</>}
   <footer><span className="footer-brand">тихо.</span><span>Меньше суеты. Больше жизни.</span><span className="footer-right">Ваш маленький уголок порядка <Icon name="leaf" size={13}/></span></footer>
  </main></div>
  <dialog ref={dialogRef} onCancel={() => setModal(null)} onClick={e => { if (e.target === e.currentTarget) setModal(null); }}><form onSubmit={save}><div className="modal-heading"><h2>{modal === 'task' ? 'Новая задача' : editing ? 'Ваша заметка' : 'Новая заметка'}</h2><button type="button" className="icon-button" aria-label="Закрыть" onClick={() => setModal(null)}><Icon name="close"/></button></div><p className="modal-description">{modal === 'task' ? 'Большие перемены начинаются с маленького шага.' : 'Здесь можно просто быть собой и думать вслух.'}</p><label className="form-field">{modal === 'task' ? 'Что хочется сделать?' : 'Название'}<input autoFocus required maxLength={120} placeholder={modal === 'task' ? 'Например, прочитать главу книги' : 'Дайте мысли название'} value={title} onChange={e => setTitle(e.target.value)}/></label>{modal === 'task' ? <label className="form-field">Категория<select value={tag} onChange={e => setTag(e.target.value)}><option>Личное</option><option>Работа</option><option>Здоровье</option></select></label> : <><label className="form-field">Ваши мысли<textarea rows={6} value={body} placeholder="Запишите то, что важно…" onChange={e => setBody(e.target.value)}/></label><div className="color-options"><span>Цвет заметки</span>{['yellow', 'purple', 'green'].map(c => <button type="button" key={c} className={`color-option note-${c} ${color === c ? 'chosen' : ''}`} aria-label={c === 'yellow' ? 'Жёлтый' : c === 'purple' ? 'Сиреневый' : 'Зелёный'} aria-pressed={color === c} onClick={() => setColor(c)}>{color === c && <Icon name="check" size={15}/>}</button>)}</div></>}<div className="modal-actions">{editing && <button type="button" className="delete-note" onClick={() => { setNotes(notes.filter(n => n.id !== editing)); setModal(null); }}><Icon name="trash" size={17}/>Удалить</button>}<button type="button" className="button secondary" onClick={() => setModal(null)}>Отмена</button><button type="submit" className="button primary" disabled={!title.trim()}>{editing ? 'Сохранить' : 'Добавить'}<Icon name="arrow" size={16}/></button></div></form></dialog>
 </div></ThemeProvider>;
}
