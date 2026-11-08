import {useMemo, useState} from 'react';
import {Button, Checkbox, Icon, Modal, Pagination, Select, Table, Text, TextInput, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, ChevronDown, CircleCheck, CircleQuestion, Clock, Ellipsis, Magnifier, Persons, Plus, Sliders, Xmark} from '@gravity-ui/icons';
import {Client, getFilteredClients, initialClients, Status, statusLabels, toCsv} from './data';
import './styles.css';

const ClientTable = withTableSelection(withTableSorting<Client>(Table));
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
const columnNames = {company: 'Компания', status: 'Статус', role: 'Роль', created: 'Дата добавления'};
const emptyForm = {name: '', email: '', company: '', role: 'Участник'};
const initials = (name: string) => name.split(' ').slice(0, 2).map(part => part[0]).join('');

export function App() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [company, setCompany] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<TableSortState>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [modal, setModal] = useState<'add' | 'columns' | 'help' | null>(null);
  const [detail, setDetail] = useState<Client | null>(null);
  const [visible, setVisible] = useState<string[]>(Object.keys(columnNames));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const filtered = useMemo(() => getFilteredClients(clients, query, status, company, sorting), [clients, query, status, company, sorting]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const pageClients = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const count = (value: string) => clients.filter(c => !value || c.status === value).length;
  const setTab = (value: string) => {setStatus(value); setPage(1);};
  const resetFilters = () => {setQuery(''); setCompany(''); setStatus(''); setPage(1);};
  const exportCsv = () => {
    const rows = selected.length ? clients.filter(c => selected.includes(c.id)) : filtered;
    const url = URL.createObjectURL(new Blob([toCsv(rows)], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = 'clients.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Экспортировано записей: ${rows.length}`);
  };
  const columns: TableColumnConfig<Client>[] = [
    {id: 'name', name: 'Клиент', width: '27%', meta: {sort: true}, template: (c: Client) => <div className="client-cell"><span className={`avatar avatar-${Number(c.id.replace('client-', '')) % 6}`} aria-hidden="true">{initials(c.name)}</span><div className="client-identity"><span className="client-name">{c.name}</span><span className="client-email">{c.email}</span></div></div>},
    {id: 'company', name: 'Компания', width: '17%', meta: {sort: true}, template: (c: Client) => <span className="company-cell"><span className={`company-symbol company-${['Яндекс','Точка','Авито','Ozon','Сбер','Т-Банк'].indexOf(c.company)}`} aria-hidden="true">{c.company === 'Яндекс' ? 'Я' : c.company === 'Авито' ? '●' : c.company === 'Сбер' ? '↗' : c.company[0]}</span>{c.company}</span>},
    {id: 'status', name: 'Статус', width: '16%', meta: {sort: true}, template: (c: Client) => <span className={`status status-${c.status}`}><span className="status-dot" />{statusLabels[c.status]}</span>},
    {id: 'role', name: 'Роль', width: '17%', meta: {sort: true}},
    {id: 'created', name: 'Дата добавления', width: '18%', meta: {sort: true}, template: (c: Client) => <span className="date-cell">{dateFormat.format(new Date(c.created)).replace(' г.', '')}</span>},
    {id: 'actions', name: '', template: (c: Client) => <Button view="flat" size="s" aria-label={`Открыть клиента ${c.name}`} onClick={() => setDetail(c)}><Icon data={Ellipsis} size={18} /></Button>},
  ].filter(c => ['name', 'actions'].includes(c.id) || visible.includes(c.id));
  return <div className="app">
    <header className="topbar"><div className="topbar-inner"><div className="brand"><span className="brand-mark"><i /><i /><i /></span><span>forma<span className="brand-period">.</span></span></div><span className="topbar-divider" /><div className="workspace-label">Рабочее пространство <span className="workspace-slash">/</span> <span className="workspace-current">Клиенты</span></div><div className="topbar-right"><span className="workspace-status"><span className="status-dot" /> Все изменения сохранены</span><Button view="flat" size="m" aria-label="Помощь" onClick={() => setModal('help')}><Icon data={CircleQuestion} size={19} /></Button><span className="topbar-divider" /><span className="profile-avatar" title="Алексей Ким">АК</span></div></div></header>
    <main className="main">
      <div className="breadcrumb"><Icon data={Persons} size={15} /><span>Рабочее пространство</span><span>/</span><span>Клиенты</span></div>
      <section className="page-heading"><div><div className="title-line"><Text as="h1" variant="display-1">Клиенты</Text><span className="title-count">{clients.length}</span></div><Text as="p" variant="body-2" color="secondary">Все ваши контакты. Один удобный список.</Text></div><div className="heading-actions"><Button view="outlined" size="l" onClick={exportCsv}><Icon data={ArrowDownToLine} size={16} />Экспорт</Button><Button view="action" size="l" onClick={() => {setForm(emptyForm); setModal('add');}}><Icon data={Plus} size={17} />Добавить клиента</Button></div></section>
      <section className="stats" aria-label="Статистика клиентов">
        {[{label: 'Всего клиентов', value: clients.length, icon: Persons, tone: 'neutral', sub: 'В вашем рабочем пространстве', trend: '+12 за месяц'}, {label: 'Активные', value: count('active'), icon: CircleCheck, tone: 'positive', sub: 'Работают вместе с вами', trend: `${Math.round(count('active') / Math.max(1, clients.length) * 100)}% от всех клиентов`}, {label: 'Ожидают приглашения', value: count('invited'), icon: Clock, tone: 'warning', sub: 'Ещё не присоединились', trend: 'Приглашения отправлены'}].map(stat => <div className="stat-card" key={stat.label}><div className="stat-top"><span>{stat.label}</span><span className={`stat-icon stat-icon-${stat.tone}`}><Icon data={stat.icon} size={18} /></span></div><div className="stat-value"><Text variant="display-2">{stat.value}</Text><span className={`stat-trend stat-trend-${stat.tone}`}>{stat.tone === 'neutral' && <Icon data={ArrowUpRight} size={13} />}{stat.trend}</span></div><span className="stat-description">{stat.sub}</span></div>)}
      </section>
      <section className="table-panel" aria-label="Список клиентов">
        <div className="table-tabs" role="tablist" aria-label="Статус клиентов">{[{value:'', label:'Все клиенты'}, {value:'active', label:'Активные'}, {value:'invited', label:'Приглашённые'}, {value:'archived', label:'Архив'}].map(tab => <Button key={tab.value} className={`tab ${status === tab.value ? 'tab-active' : ''}`} view="flat" size="l" role="tab" aria-selected={status === tab.value} onClick={() => setTab(tab.value)}>{tab.label}<span className="tab-count">{count(tab.value)}</span></Button>)}</div>
        <div className="table-toolbar"><TextInput className="search" size="l" value={query} onUpdate={value => {setQuery(value); setPage(1);}} placeholder="Поиск по имени, email или компании" startContent={<Icon data={Magnifier} size={17} />} hasClear controlProps={{'aria-label': 'Поиск клиентов'}} /><div className="toolbar-actions"><Button size="l" view="outlined" selected={filtersOpen || !!company} onClick={() => setFiltersOpen(!filtersOpen)}><Icon data={Sliders} size={16} />Фильтры{company && <span className="filter-count">1</span>}</Button><Button size="l" view="outlined" onClick={() => setModal('columns')}><span className="columns-icon" aria-hidden="true">▥</span>Столбцы<Icon data={ChevronDown} size={12} /></Button></div></div>
        {filtersOpen && <div className="filter-panel"><Select size="m" label="Компания:" value={[company]} options={[{value: '', content: 'Все компании'}, ...Array.from(new Set(clients.map(c => c.company))).map(c => ({value: c, content: c}))]} onUpdate={value => {setCompany(value[0] || ''); setPage(1);}} aria-label="Фильтр по компании" /><Button view="flat-secondary" onClick={resetFilters}>Сбросить фильтры</Button></div>}
        {selected.length > 0 && <div className="selection-bar"><span>Выбрано: <strong>{selected.length}</strong></span><Button view="flat" size="s" onClick={() => setSelected(Array.from(new Set([...selected, ...filtered.map(c => c.id)])))}>Выбрать все ({filtered.length})</Button><div className="selection-actions"><Button view="outlined" size="s" onClick={exportCsv}><Icon data={ArrowDownToLine} size={14} />Экспорт выбранных</Button><Button view="flat" size="s" onClick={() => setSelected([])} aria-label="Снять выделение"><Icon data={Xmark} size={14} /></Button></div></div>}
        <div className="table-scroll"><ClientTable className="clients-table" data={pageClients} columns={columns} width="max" verticalAlign="middle" getRowDescriptor={c => ({id: c.id, interactive: true})} sortState={sorting} disableDataSorting onSortStateChange={value => {setSorting(value); setPage(1);}} selectedIds={selected} onSelectionChange={setSelected} emptyMessage="Клиенты не найдены. Попробуйте изменить поиск или фильтры." aria-label="Таблица клиентов" /></div>
        {filtered.length === 0 && <div className="empty-action"><Button view="outlined" onClick={resetFilters}>Сбросить поиск и фильтры</Button></div>}
        <div className="table-footer"><span className="results-count">Показано <strong>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</strong> из <strong>{filtered.length}</strong></span><div className="pagination-wrap"><div className="page-size"><span>Строк на странице</span><Select size="m" value={[String(pageSize)]} options={[10,20,50].map(n => ({value: String(n), content: String(n)}))} onUpdate={value => {setPageSize(Number(value[0])); setPage(1);}} aria-label="Количество строк на странице" /></div><Pagination page={currentPage} pageSize={pageSize} total={filtered.length} size="m" compact onUpdate={setPage} /></div></div>
      </section>
      <div className="table-tip"><Icon data={CircleQuestion} size={14} /><span>Нажмите на заголовок столбца для сортировки. Удерживайте <kbd>Shift</kbd>, чтобы выбрать несколько строк.</span></div>
      <footer className="page-footer"><span>Порядок в данных — пространство для роста.</span><span className="footer-brand">forma<span>.</span></span></footer>
    </main>
    {notice && <div className="notice" role="status"><Icon data={CircleCheck} size={17} />{notice}<Button view="flat" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={14} /></Button></div>}
    <Modal open={modal !== null} onOpenChange={open => !open && setModal(null)} aria-label={modal === 'add' ? 'Добавить клиента' : modal === 'columns' ? 'Настроить столбцы' : 'Помощь'}><div className="modal-content"><div className="modal-heading"><Text variant="header-1">{modal === 'add' ? 'Новый клиент' : modal === 'columns' ? 'Столбцы таблицы' : 'Работа с клиентами'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setModal(null)}><Icon data={Xmark} size={18} /></Button></div>
      {modal === 'add' && <form onSubmit={event => {event.preventDefault(); const client: Client = {...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), id: crypto.randomUUID(), status: 'invited', created: new Date().toISOString()}; setClients(prev => [client, ...prev]); resetFilters(); setSorting([]); setModal(null); setNotice('Клиент добавлен в список');}}><p className="muted">Добавьте контакт в ваше рабочее пространство.</p>{([{key:'name',label:'Имя и фамилия',placeholder:'Например, Анна Смирнова'}, {key:'email',label:'Email',placeholder:'anna@company.ru'}, {key:'company',label:'Компания',placeholder:'Название компании'}] as const).map(field => <label className="form-field" key={field.key}>{field.label}<TextInput size="l" value={form[field.key]} type={field.key === 'email' ? 'email' : 'text'} onUpdate={value => setForm({...form, [field.key]: value})} placeholder={field.placeholder} controlProps={{required: true, pattern: field.key === 'email' ? undefined : '.*\\S.*', 'aria-label': field.label}} /></label>)}<label className="form-field">Роль<Select size="l" width="max" value={[form.role]} onUpdate={value => setForm({...form, role: value[0]})} options={['Участник','Администратор','Наблюдатель'].map(role => ({value: role, content: role}))} /></label><div className="modal-actions"><Button size="l" view="outlined" onClick={() => setModal(null)}>Отмена</Button><Button type="submit" size="l" view="action">Добавить клиента</Button></div></form>}
      {modal === 'columns' && <div className="column-options"><p className="muted">Выберите, какие данные показывать в таблице.</p><Checkbox checked disabled>Клиент</Checkbox>{Object.entries(columnNames).map(([id, label]) => <Checkbox key={id} checked={visible.includes(id)} onUpdate={checked => setVisible(checked ? [...visible, id] : visible.filter(v => v !== id))}>{label}</Checkbox>)}<Button view="action" size="l" onClick={() => setModal(null)}>Готово</Button></div>}
      {modal === 'help' && <div className="help-content"><p>Нажмите на название столбца, чтобы менять направление сортировки. Shift + нажатие добавляет ещё один столбец к сортировке.</p><p>Чекбокс в заголовке выделяет текущую страницу. Выбранные клиенты сохраняются при смене страницы и фильтров.</p><p>Экспорт сохраняет выбранные строки, а если выбор пуст — весь отфильтрованный список в CSV.</p><p className="muted">Демонстрационные данные хранятся в текущей сессии и сбрасываются при обновлении страницы.</p></div>}
    </div></Modal>
    <Modal open={!!detail} onOpenChange={open => !open && setDetail(null)} aria-label="Карточка клиента">{detail && <div className="modal-content"><div className="modal-heading"><Text variant="header-1">{detail.name}</Text><Button view="flat" onClick={() => setDetail(null)} aria-label="Закрыть карточку"><Icon data={Xmark} size={18} /></Button></div><dl className="client-details"><dt>Email</dt><dd>{detail.email}</dd><dt>Компания</dt><dd>{detail.company}</dd><dt>Роль</dt><dd>{detail.role}</dd><dt>Статус</dt><dd>{statusLabels[detail.status]}</dd><dt>Дата добавления</dt><dd>{dateFormat.format(new Date(detail.created))}</dd></dl><div className="modal-actions"><Button view="outlined" onClick={() => {const nextStatus: Status = detail.status === 'archived' ? 'active' : 'archived'; setClients(prev => prev.map(c => c.id === detail.id ? {...c, status: nextStatus} : c)); setDetail(null); setNotice(nextStatus === 'archived' ? 'Клиент перемещён в архив' : 'Клиент восстановлен');}}>{detail.status === 'archived' ? 'Восстановить' : 'В архив'}</Button><Button view="action" onClick={() => setDetail(null)}>Готово</Button></div></div>}</Modal>
  </div>;
}
