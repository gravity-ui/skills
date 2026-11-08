import {useEffect, useMemo, useRef, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import './styles.css';

type IconName = 'grid' | 'users' | 'folder' | 'calendar' | 'chart' | 'settings' | 'help' | 'chevron' | 'search' | 'plus' | 'download' | 'filter' | 'arrow' | 'more' | 'close' | 'bell' | 'check' | 'briefcase' | 'external' | 'trash';
function Icon({name, size = 20, className = ''}: {name: IconName; size?: number; className?: string}) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.7"/><rect x="14" y="3" width="7" height="7" rx="1.7"/><rect x="3" y="14" width="7" height="7" rx="1.7"/><rect x="14" y="14" width="7" height="7" rx="1.7"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/></>,
    folder: <path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18m-13 4h1m3 0h1m3 0h1"/></>,
    chart: <path d="M4 3v18h17M9 16v-5m5 5V7m5 9V4"/>,
    settings: <><path d="m9 3-.6 2.3-2 .9-2.2-.7-2 3.5 1.6 1.6v2.8L2.2 15l2 3.5 2.2-.7 2 .9L9 21h4l.6-2.3 2-.9 2.2.7 2-3.5-1.6-1.6v-2.8L19.8 9l-2-3.5-2.2.7-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .6-1.7 1.2-1.7 2.7m0 3h.01"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    search: <><circle cx="10.8" cy="10.8" r="7.3"/><path d="m16 16 4.5 4.5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>,
    filter: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="2" fill="currentColor" stroke="none"/></>,
    arrow: <path d="M12 4v16m-5-5 5 5 5-5"/>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-11 12a2 2 0 0 0 4 0"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12c6 4 12 4 18 0m-9 1v4"/></>,
    external: <path d="M14 3h7v7m0-7L10 14m0-10H4v16h16v-6"/>,
    trash: <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>,
  };
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

type Status = 'Активен' | 'В отпуске' | 'Неактивен';
type Employee = {id: number; name: string; email: string; department: string; role: string; status: Status; date: string; color: number};
const people = [
  ['Анна Смирнова', 'anna.smirnova', 'Дизайн', 'Product Designer'],
  ['Михаил Кузнецов', 'm.kuznetsov', 'Разработка', 'Frontend Developer'],
  ['Екатерина Волкова', 'e.volkova', 'Маркетинг', 'Marketing Manager'],
  ['Александр Петров', 'a.petrov', 'Разработка', 'Backend Developer'],
  ['Мария Соколова', 'm.sokolova', 'Дизайн', 'UX/UI Designer'],
  ['Дмитрий Новиков', 'd.novikov', 'Менеджмент', 'Project Manager'],
  ['Ольга Морозова', 'o.morozova', 'HR', 'HR Manager'],
  ['Иван Лебедев', 'i.lebedev', 'Разработка', 'Fullstack Developer'],
  ['Анастасия Козлова', 'a.kozlova', 'Маркетинг', 'Content Strategist'],
  ['Сергей Орлов', 's.orlov', 'Аналитика', 'Data Analyst'],
  ['Полина Андреева', 'p.andreeva', 'Дизайн', 'Graphic Designer'],
  ['Артём Макаров', 'a.makarov', 'Разработка', 'DevOps Engineer'],
  ['Виктория Никитина', 'v.nikitina', 'HR', 'Recruiter'],
  ['Никита Захаров', 'n.zakharov', 'Аналитика', 'Product Analyst'],
  ['Елена Зайцева', 'e.zaytseva', 'Менеджмент', 'Product Manager'],
  ['Андрей Павлов', 'a.pavlov', 'Разработка', 'QA Engineer'],
  ['Дарья Семёнова', 'd.semenova', 'Маркетинг', 'SMM Manager'],
  ['Максим Голубев', 'm.golubev', 'Разработка', 'Frontend Developer'],
  ['Алиса Виноградова', 'a.vinogradova', 'Дизайн', 'Motion Designer'],
  ['Роман Богданов', 'r.bogdanov', 'Менеджмент', 'Project Manager'],
  ['Ксения Фёдорова', 'k.fedorova', 'Маркетинг', 'SEO Specialist'],
  ['Павел Михайлов', 'p.mikhailov', 'Разработка', 'Backend Developer'],
  ['София Белова', 's.belova', 'HR', 'People Partner'],
  ['Денис Тарасов', 'd.tarasov', 'Аналитика', 'Data Engineer'],
  ['Валерия Ильина', 'v.ilina', 'Дизайн', 'Product Designer'],
  ['Тимофей Громов', 't.gromov', 'Разработка', 'Mobile Developer'],
  ['Вероника Крылова', 'v.krylova', 'Маркетинг', 'Brand Manager'],
  ['Глеб Соловьёв', 'g.soloviev', 'Разработка', 'QA Engineer'],
  ['Юлия Миронова', 'y.mironova', 'Менеджмент', 'Operations Manager'],
  ['Владислав Белов', 'v.belov', 'Аналитика', 'Data Analyst'],
  ['Арина Фомина', 'a.fomina', 'Дизайн', 'UX Researcher'],
  ['Егор Власов', 'e.vlasov', 'Разработка', 'Frontend Developer'],
  ['Наталья Осипова', 'n.osipova', 'HR', 'HR Specialist'],
  ['Матвей Гусев', 'm.gusev', 'Разработка', 'Backend Developer'],
  ['Татьяна Киселёва', 't.kiseleva', 'Маркетинг', 'Copywriter'],
  ['Вадим Титов', 'v.titov', 'Менеджмент', 'Project Manager'],
  ['Светлана Егорова', 's.egorova', 'Дизайн', 'UI Designer'],
  ['Кирилл Сидоров', 'k.sidorov', 'Разработка', 'DevOps Engineer'],
  ['Алёна Романова', 'a.romanova', 'Аналитика', 'Business Analyst'],
  ['Олег Васильев', 'o.vasiliev', 'Разработка', 'Fullstack Developer'],
  ['Ульяна Алексеева', 'u.alekseeva', 'HR', 'Recruiter'],
  ['Виталий Степанов', 'v.stepanov', 'Маркетинг', 'Marketing Analyst'],
  ['Диана Захарова', 'd.zakharova', 'Дизайн', 'Graphic Designer'],
  ['Руслан Медведев', 'r.medvedev', 'Разработка', 'Mobile Developer'],
  ['Евгения Борисова', 'e.borisova', 'Менеджмент', 'Account Manager'],
  ['Леонид Комаров', 'l.komarov', 'Аналитика', 'Data Analyst'],
  ['Вера Суханова', 'v.sukhanova', 'Маркетинг', 'Content Manager'],
  ['Фёдор Сафонов', 'f.safonov', 'Разработка', 'QA Engineer'],
];
const initialEmployees: Employee[] = people.map((p, i) => ({id: i + 1, name: p[0], email: `${p[1]}@acme.studio`, department: p[2], role: p[3], status: [2, 8, 13, 21, 33, 42].includes(i) ? 'В отпуске' : [6, 18, 30, 40].includes(i) ? 'Неактивен' : 'Активен', date: i < 10 ? ['2024-01-15', '2023-11-03', '2024-02-22', '2023-08-10', '2024-03-01', '2023-09-18', '2024-01-10', '2023-12-05', '2024-02-14', '2023-10-20'][i] : `2024-${String((i % 9) + 1).padStart(2, '0')}-${String((i % 25) + 1).padStart(2, '0')}`, color: i % 8}));
const departments = ['Дизайн', 'Разработка', 'Маркетинг', 'Менеджмент', 'HR', 'Аналитика'];
function readEmployees(): Employee[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('orbit-employees-v1') ?? 'null');
    if (Array.isArray(stored) && stored.every(e => e && typeof e.id === 'number' && typeof e.name === 'string' && typeof e.email === 'string' && typeof e.role === 'string' && typeof e.color === 'number' && departments.includes(e.department) && ['Активен', 'В отпуске', 'Неактивен'].includes(e.status) && /^\d{4}-\d{2}-\d{2}$/.test(e.date))) return stored;
  } catch { /* Use the sample team if storage is unavailable. */ }
  return initialEmployees;
}
const statusClass = (status: Status) => status === 'Активен' ? 'active' : status === 'В отпуске' ? 'away' : 'inactive';
  const initials = (name: string) => name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('');
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('ru-RU');

function Checkbox({checked, mixed, onChange, label}: {checked: boolean; mixed?: boolean; onChange: () => void; label: string}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {if (ref.current) ref.current.indeterminate = !!mixed;}, [mixed]);
  return <input ref={ref} className="checkbox" type="checkbox" checked={checked} onChange={onChange} aria-label={label}/>;
}

export function App() {
  const [employees, setEmployees] = useState<Employee[]>(readEmployees);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<{key: keyof Employee; dir: 'asc' | 'desc'} | null>(null);
  const [rowMenu, setRowMenu] = useState<number | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formError, setFormError] = useState('');
  const activeCount = employees.filter(e => e.status === 'Активен').length;
  const awayCount = employees.filter(e => e.status === 'В отпуске').length;
  const inactiveCount = employees.filter(e => e.status === 'Неактивен').length;

  useEffect(() => {
    try { localStorage.setItem('orbit-employees-v1', JSON.stringify(employees)); }
    catch { /* The table remains usable when storage is unavailable. */ }
  }, [employees]);

  useEffect(() => {setPage(1);}, [query, tab, department, statusFilter, pageSize]);
  useEffect(() => {if (!toast) return; const id = setTimeout(() => setToast(''), 3500); return () => clearTimeout(id);}, [toast]);
  useEffect(() => {if (dialog) dialogRef.current?.showModal(); else dialogRef.current?.close(); setFormError('');}, [dialog]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {event.preventDefault(); searchRef.current?.focus();}
      if (event.key === 'Escape') {setFiltersOpen(false); setRowMenu(null); setNotifications(false);}
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(() => {
    const result = employees.filter(e => (!query || `${e.name} ${e.email} ${e.role} ${e.department}`.toLowerCase().includes(query.toLowerCase().trim())) && (tab === 'all' || statusClass(e.status) === tab) && (!department || e.department === department) && (!statusFilter || e.status === statusFilter));
    if (sort) result.sort((a, b) => String(a[sort.key]).localeCompare(String(b[sort.key]), 'ru') * (sort.dir === 'asc' ? 1 : -1));
    return result;
  }, [employees, query, tab, department, statusFilter, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedOnPage = visible.filter(e => selected.has(e.id)).length;
  const toggleRow = (id: number) => setSelected(previous => {const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next;});
  const togglePage = () => setSelected(previous => {const next = new Set(previous); visible.forEach(e => selectedOnPage === visible.length ? next.delete(e.id) : next.add(e.id)); return next;});
  const changeSort = (key: keyof Employee) => {setSort(previous => ({key, dir: previous?.key === key && previous.dir === 'asc' ? 'desc' : 'asc'})); setPage(1);};
  const exportCSV = (onlySelected = false) => {
    const rows = onlySelected ? employees.filter(e => selected.has(e.id)) : filtered;
    const csv = [['Имя', 'Email', 'Отдел', 'Должность', 'Статус', 'Дата добавления'], ...rows.map(e => [e.name, e.email, e.department, e.role, e.status, formatDate(e.date)])].map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'}));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Команда_Acme.csv'; anchor.click(); URL.revokeObjectURL(url);
    setToast(`Экспортировано сотрудников: ${rows.length}`);
  };
  const openAdd = () => {setEditing(null); setDialog('employee');};
  const saveEmployee = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    const name = String(data.get('name')).trim(); const email = String(data.get('email')).trim();
    if (name.split(/\s+/).length < 2) {setFormError('Укажите имя и фамилию сотрудника.'); return;}
    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase() && e.id !== editing?.id)) {setFormError('Сотрудник с такой почтой уже существует.'); return;}
    const employee: Employee = {id: editing?.id ?? Math.max(0, ...employees.map(e => e.id)) + 1, name, email, department: String(data.get('department')), role: String(data.get('role')).trim(), status: String(data.get('status')) as Status, date: editing?.date ?? new Date().toISOString().slice(0, 10), color: editing?.color ?? employees.length % 8};
    setEmployees(previous => editing ? previous.map(e => e.id === editing.id ? employee : e) : [employee, ...previous]);
    if (!editing) {setQuery(''); setDepartment(''); setStatusFilter(''); setTab('all'); setSort(null); setPage(1);}
    setDialog(null); setToast(editing ? 'Данные сотрудника обновлены' : 'Сотрудник добавлен в команду');
  };
  const sortHeading = (label: string, key: keyof Employee) => <th aria-sort={sort?.key === key ? sort.dir === 'asc' ? 'ascending' : 'descending' : 'none'}><button className={`sort-heading ${sort?.key === key ? 'sorted' : ''}`} onClick={() => changeSort(key)}>{label}<Icon name="arrow" size={13} className={sort?.key === key && sort.dir === 'desc' ? 'rotate' : ''}/></button></th>;

  return <div className="app-shell">
    <aside className="sidebar">
      <a href="#" className="brand" aria-label="Orbit — главная" onClick={e => {e.preventDefault(); setDialog('Обзор');}}><span className="brand-mark">✳</span><span>orbit<span className="brand-dot">.</span></span></a>
      <button className="workspace-switch" onClick={() => setDialog('workspace')}><span className="workspace-logo">a<span>c</span></span><span className="workspace-text"><strong>Acme Studio</strong><small>Рабочее пространство</small></span><span className="double-chevron">⌃<br/>⌄</span></button>
      <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav className="main-nav" aria-label="Основная навигация">
        {([['grid', 'Обзор'], ['users', 'Команда'], ['folder', 'Проекты'], ['calendar', 'Календарь'], ['chart', 'Отчёты']] as [IconName, string][]).map(([icon, label]) => <button key={label} title={label} className={`nav-item ${label === 'Команда' ? 'nav-active' : ''}`} onClick={() => label === 'Команда' ? (setTab('all'), setQuery(''), setDepartment(''), setStatusFilter('')) : setDialog(label)}><Icon name={icon} size={19}/><span>{label}</span>{label === 'Команда' && <span className="nav-count">{employees.length}</span>}</button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="invite-card"><div className="invite-icon"><Icon name="users" size={18}/><span className="tiny-spark">✦</span></div><strong>Вместе — больше</strong><p>Пригласите коллег и работайте<br/>над идеями вместе.</p><button onClick={openAdd}>Пригласить коллег <Icon name="plus" size={15}/></button></div>
        <nav className="bottom-nav"><button className="nav-item" onClick={() => setDialog('settings')}><Icon name="settings" size={19}/>Настройки</button><button className="nav-item" onClick={() => setDialog('help')}><Icon name="help" size={19}/>Помощь и поддержка<Icon name="external" size={13}/></button></nav>
        <button className="profile" onClick={() => setDialog('profile')}><span className="avatar profile-avatar">АК<span className="online-dot"/></span><span><strong>Алексей Ковалёв</strong><small>Администратор</small></span><Icon name="more" size={19}/></button>
      </div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><Icon name="chevron" size={13}/><strong>Команда</strong></div><div className="topbar-right"><span className="live-label"><i/>Все изменения сохранены</span><span className="topbar-divider"/><div className="notification-wrap"><button className="icon-button notification-button" aria-label="Уведомления" onClick={() => setNotifications(!notifications)}><Icon name="bell" size={20}/><i/></button>{notifications && <div className="notification-panel"><strong>Уведомления</strong><span className="notification-item"><span className="notification-symbol"><Icon name="check" size={17}/></span><span><b>Всё актуально</b><small>Список команды обновлён. Новых уведомлений нет.</small></span></span></div>}</div><button className="top-avatar" onClick={() => setDialog('profile')} aria-label="Мой профиль">АК</button></div></header>
      <main>
        <div className="page-heading"><div><div className="heading-line"><h1>Команда</h1><span className="heading-count">{employees.length} сотрудников</span></div><p>Люди, с которыми большие идеи становятся реальностью.</p></div><div className="heading-actions"><Button size="l" view="outlined" onClick={() => exportCSV()}><Icon name="download" size={17}/>Экспорт</Button><Button size="l" view="action" className="primary-button" onClick={openAdd}><Icon name="plus" size={18}/>Добавить сотрудника</Button></div></div>
        <section className="stats-grid" aria-label="Статистика команды">
          <div className="stat-card"><div className="stat-top"><span>Всего сотрудников</span><span className="stat-icon purple"><Icon name="users" size={19}/></span></div><div className="stat-bottom"><strong>{employees.length}</strong><span className="stat-note"><span className="growth">↗ 12%</span> за этот месяц</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Активные</span><span className="stat-icon green"><Icon name="briefcase" size={18}/></span></div><div className="stat-bottom"><strong>{activeCount}</strong><span className="stat-note"><i className="status-dot green-dot"/>В рабочем ритме</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>В отпуске</span><span className="stat-icon amber"><Icon name="calendar" size={18}/></span></div><div className="stat-bottom"><strong>{awayCount}</strong><span className="stat-note">Время перезарядиться</span></div></div>
          <div className="stat-card"><div className="stat-top"><span>Отделы</span><span className="stat-icon blue"><Icon name="grid" size={18}/></span></div><div className="stat-bottom"><strong>{new Set(employees.map(e => e.department)).size}</strong><span className="stat-note">Одна большая команда</span></div></div>
        </section>
        <section className="table-card" aria-label="Сотрудники">
          <div className="table-tabs" role="tablist" aria-label="Статус сотрудников">{[['all', 'Все сотрудники', employees.length], ['active', 'Активные', activeCount], ['away', 'В отпуске', awayCount], ['inactive', 'Неактивные', inactiveCount]].map(([value, label, count]) => <button role="tab" aria-selected={tab === value} className={`table-tab ${tab === value ? 'selected-tab' : ''}`} key={value} onClick={() => setTab(String(value))}>{label}<span>{count}</span></button>)}</div>
          <div className="table-toolbar"><div className="search-field"><Icon name="search" size={18}/><input ref={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти сотрудника..." aria-label="Поиск сотрудников"/>{query ? <button className="clear-search" onClick={() => setQuery('')} aria-label="Очистить поиск"><Icon name="close" size={15}/></button> : <kbd>⌘ K</kbd>}</div><div className="toolbar-actions"><div className="filter-wrap"><button className={`filter-button ${department || statusFilter ? 'filters-applied' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><Icon name="filter" size={17}/>Фильтры{(department || statusFilter) && <span>{Number(!!department) + Number(!!statusFilter)}</span>}</button>{filtersOpen && <><div className="popover-dismiss" onClick={() => setFiltersOpen(false)}/><div className="filters-popover"><div className="popover-heading"><strong>Фильтры</strong><button className="icon-button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтры"><Icon name="close" size={17}/></button></div><label>Отдел<select value={department} onChange={e => setDepartment(e.target.value)}><option value="">Все отделы</option>{departments.map(d => <option key={d}>{d}</option>)}</select></label><label>Статус<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">Все статусы</option><option>Активен</option><option>В отпуске</option><option>Неактивен</option></select></label><div className="filter-footer"><button onClick={() => {setDepartment(''); setStatusFilter('');}}>Сбросить</button><Button view="action" className="primary-button" onClick={() => setFiltersOpen(false)}>Применить</Button></div></div></>}</div><span className="results-count">{filtered.length} сотрудников</span></div></div>
          {(department || statusFilter) && <div className="filter-chips">{[department, statusFilter].filter(Boolean).map(value => <button key={value} onClick={() => value === department ? setDepartment('') : setStatusFilter('')}>{value}<Icon name="close" size={12}/></button>)}<button className="reset-filters" onClick={() => {setDepartment(''); setStatusFilter('');}}>Сбросить всё</button></div>}
          {selected.size > 0 && <div className="selection-bar"><span><Icon name="check" size={16}/>Выбрано: <b>{selected.size}</b></span><button onClick={() => exportCSV(true)}><Icon name="download" size={15}/>Экспорт</button><button className="delete-selected" onClick={() => setDialog('delete')}><Icon name="trash" size={15}/>Удалить</button><button className="clear-selection" onClick={() => setSelected(new Set())}>Снять выбор<Icon name="close" size={14}/></button></div>}
          <div className="table-scroll"><table><thead><tr><th className="check-cell"><Checkbox checked={visible.length > 0 && selectedOnPage === visible.length} mixed={selectedOnPage > 0 && selectedOnPage < visible.length} onChange={togglePage} label="Выбрать всех на странице"/></th>{sortHeading('Сотрудник', 'name')}{sortHeading('Отдел', 'department')}{sortHeading('Должность', 'role')}{sortHeading('Статус', 'status')}{sortHeading('Дата добавления', 'date')}<th className="actions-cell" aria-label="Действия"/></tr></thead><tbody>{visible.map(employee => <tr key={employee.id} className={selected.has(employee.id) ? 'selected-row' : ''}><td className="check-cell"><Checkbox checked={selected.has(employee.id)} onChange={() => toggleRow(employee.id)} label={`Выбрать: ${employee.name}`}/></td><td><button className="employee-cell" onClick={() => {setEditing(employee); setDialog('employee');}}><span className={`avatar avatar-${employee.color}`}>{initials(employee.name)}</span><span className="employee-info"><strong>{employee.name}</strong><small>{employee.email}</small></span></button></td><td><span className={`department department-${departments.indexOf(employee.department)}`}>{employee.department}</span></td><td className="role-cell">{employee.role}</td><td><span className={`status ${statusClass(employee.status)}`}><i/>{employee.status}</span></td><td className="date-cell">{formatDate(employee.date)}</td><td className="actions-cell"><div className="row-action-wrap"><button className={`icon-button row-more ${rowMenu === employee.id ? 'menu-active' : ''}`} onClick={() => setRowMenu(rowMenu === employee.id ? null : employee.id)} aria-label={`Действия: ${employee.name}`} aria-expanded={rowMenu === employee.id}><Icon name="more" size={19}/></button>{rowMenu === employee.id && <><div className="popover-dismiss" onClick={() => setRowMenu(null)}/><div className="row-menu"><button onClick={() => {setEditing(employee); setDialog('employee'); setRowMenu(null);}}>Редактировать</button><button onClick={() => {setEmployees(prev => prev.map(e => e.id === employee.id ? {...e, status: e.status === 'Активен' ? 'Неактивен' : 'Активен'} : e)); setRowMenu(null); setToast('Статус сотрудника обновлён');}}>{employee.status === 'Активен' ? 'Деактивировать' : 'Активировать'}</button><button className="danger-text" onClick={() => {setSelected(new Set([employee.id])); setDialog('delete'); setRowMenu(null);}}>Удалить</button></div></>}</div></td></tr>)}</tbody></table>{visible.length === 0 && <div className="empty-state"><span><Icon name="search" size={30}/></span><h3>Сотрудники не найдены</h3><p>Попробуйте изменить запрос или сбросить фильтры.</p><Button view="outlined" onClick={() => {setQuery(''); setDepartment(''); setStatusFilter(''); setTab('all');}}>Сбросить поиск и фильтры</Button></div>}</div>
          <footer className="table-footer"><div className="pagination-summary">Показано <strong>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</strong> из <strong>{filtered.length}</strong><span className="pagination-divider"/><label>На странице<select aria-label="Сотрудников на странице" value={pageSize} onChange={event => setPageSize(Number(event.target.value))}><option value="10">10</option><option value="20">20</option><option value="50">50</option></select></label></div><nav className="pagination" aria-label="Страницы таблицы"><button aria-label="Предыдущая страница" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><Icon name="chevron" size={15} className="rotate"/></button>{Array.from({length: totalPages}, (_, index) => index + 1).map(number => <button aria-label={`Страница ${number}`} aria-current={currentPage === number ? 'page' : undefined} className={currentPage === number ? 'current-page' : ''} key={number} onClick={() => setPage(number)}>{number}</button>)}<button aria-label="Следующая страница" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}><Icon name="chevron" size={15}/></button></nav></footer>
        </section>
        <div className="page-footnote"><Icon name="help" size={14}/><span>Управляйте командой легко. Выберите сотрудников для массовых действий.</span><span className="footnote-right">Создано для совместной работы <span>✳</span></span></div>
      </main>
    </div>
    <dialog ref={dialogRef} className="modal" onCancel={() => setDialog(null)} onClick={event => {if (event.target === event.currentTarget) setDialog(null);}}><div className="modal-heading"><div><span className="modal-eyebrow">ACME STUDIO</span><h2>{dialog === 'employee' ? editing ? 'Редактировать сотрудника' : 'Новый сотрудник' : dialog === 'delete' ? 'Удалить сотрудников?' : dialog === 'help' ? 'Помощь и поддержка' : dialog === 'settings' ? 'Настройки пространства' : dialog === 'profile' ? 'Мой профиль' : dialog === 'workspace' ? 'Рабочее пространство' : dialog}</h2></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Закрыть окно"><Icon name="close" size={21}/></button></div>
      {dialog === 'employee' ? <form onSubmit={saveEmployee} key={editing?.id ?? 'new'}><p className="modal-description">{editing ? 'Обновите информацию о коллеге.' : 'Добавьте нового коллегу в вашу команду.'}</p><label>Имя и фамилия<input name="name" placeholder="Например, Анна Смирнова" defaultValue={editing?.name} required autoFocus maxLength={70}/></label><label>Рабочая почта<input name="email" type="email" placeholder="name@acme.studio" defaultValue={editing?.email} required maxLength={100}/></label><div className="form-row"><label>Отдел<select name="department" defaultValue={editing?.department ?? 'Дизайн'}>{departments.map(d => <option key={d}>{d}</option>)}</select></label><label>Статус<select name="status" defaultValue={editing?.status ?? 'Активен'}><option>Активен</option><option>В отпуске</option><option>Неактивен</option></select></label></div><label>Должность<input name="role" placeholder="Например, Product Designer" defaultValue={editing?.role} required maxLength={70}/></label>{formError && <p role="alert" className="form-error">{formError}</p>}<div className="modal-actions"><Button size="l" view="outlined" onClick={() => setDialog(null)}>Отмена</Button><Button size="l" type="submit" view="action" className="primary-button">{editing ? 'Сохранить изменения' : 'Добавить сотрудника'}</Button></div></form> : dialog === 'delete' ? <><p className="modal-description">Вы собираетесь удалить сотрудников: {selected.size}. Их данные будут удалены из списка команды.</p><div className="modal-actions"><Button size="l" view="outlined" onClick={() => setDialog(null)}>Отмена</Button><Button size="l" view="action" className="danger-button" onClick={() => {setEmployees(prev => prev.filter(e => !selected.has(e.id))); setSelected(new Set()); setDialog(null); setToast('Сотрудники удалены из команды');}}>Удалить</Button></div></> : dialog === 'help' ? <div className="info-content"><p>Нажмите на название колонки, чтобы отсортировать таблицу. Повторное нажатие изменит направление сортировки.</p><p>Выбор сотрудников сохраняется при переходе между страницами. Чекбокс в шапке выбирает сотрудников на текущей странице.</p><p>Используйте поиск и фильтры для поиска коллег. Сочетание <kbd>Ctrl / ⌘ + K</kbd> перемещает курсор в поиск.</p><p>Экспорт сохраняет текущую выборку в CSV. Для экспорта выбранных сотрудников используйте панель массовых действий.</p></div> : dialog === 'profile' ? <div className="profile-details"><span className="avatar profile-avatar">АК</span><h3>Алексей Ковалёв</h3><p>alexey.kovalev@acme.studio</p><span className="department department-0">Администратор</span><p className="modal-description">Полный доступ к управлению командой и рабочим пространством Acme Studio.</p></div> : dialog === 'workspace' || dialog === 'settings' ? <div className="info-content"><div className="workspace-detail"><span className="workspace-logo">a<span>c</span></span><div><h3>Acme Studio</h3><p>Рабочее пространство команды</p></div></div><div className="detail-line"><span>Сотрудники</span><strong>{employees.length}</strong></div><div className="detail-line"><span>Отделы</span><strong>{new Set(employees.map(e => e.department)).size}</strong></div><div className="detail-line"><span>Ваша роль</span><strong>Администратор</strong></div><Button size="l" view="action" className="primary-button" onClick={openAdd}>Добавить коллегу</Button></div> : dialog === 'Обзор' ? <div className="info-content"><p>В Acme Studio {employees.length} сотрудников в {new Set(employees.map(e => e.department)).size} отделах.</p>{departments.map(d => <div className="detail-line" key={d}><span>{d}</span><strong>{employees.filter(e => e.department === d).length}</strong></div>)}<Button size="l" view="outlined" onClick={() => setDialog(null)}>Перейти к команде</Button></div> : dialog === 'Календарь' ? <div className="info-content"><p>Сейчас в отпуске: {awayCount} сотрудников</p>{employees.filter(e => e.status === 'В отпуске').map(e => <div className="detail-line" key={e.id}><span>{e.name}</span><span className="status away"><i/>В отпуске</span></div>)}</div> : dialog === 'Отчёты' ? <div className="info-content"><p>Скачайте актуальный отчёт по сотрудникам с учётом выбранных фильтров.</p><div className="detail-line"><span>Сотрудников в отчёте</span><strong>{filtered.length}</strong></div><Button size="l" view="action" className="primary-button" onClick={() => exportCSV()}><Icon name="download" size={17}/>Скачать CSV</Button></div> : <div className="info-content"><span className="empty-project-icon"><Icon name="folder" size={36}/></span><h3>Проекты вашей команды</h3><p>Список проектов пока пуст. Добавьте сотрудников, чтобы собрать команду для новых идей.</p><Button size="l" view="action" className="primary-button" onClick={openAdd}>Добавить сотрудника</Button></div>}
    </dialog>
    {toast && <div className="toast" role="status"><span><Icon name="check" size={16}/></span>{toast}<button className="icon-button" onClick={() => setToast('')} aria-label="Закрыть уведомление"><Icon name="close" size={16}/></button></div>}
  </div>;
}
