import {useMemo, useState} from 'react';
import {Button, DropdownMenu, Icon, Modal, Pagination, Select, Table, Text, TextInput, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, ChevronRight, CircleCheck, CircleDashed, CircleQuestion, Ellipsis, Magnifier, Persons, Plus, Sliders, Xmark, ChartColumn} from '@gravity-ui/icons';
import {filterAndSort, initialClients, money, statusLabels, toCsv} from './data';
import type {Client, Plan, Status} from './data';
import './styles.css';

const ClientsTable = withTableSorting(withTableSelection<Client>(Table));
const initials = (name: string) => name.split(' ').map(part => part[0]).slice(0, 2).join('');
const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {day: '2-digit', month: 'short', year: 'numeric'}).replace(' г.', '');
const blankForm = {name: '', email: '', company: '', plan: 'Про' as Plan};

export function App() {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [sort, setSort] = useState<TableSortState>([{column: 'date', order: 'desc'}]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [formOpen, setFormOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [detail, setDetail] = useState<Client | null>(null);
  const activeStatus = tab === 'all' ? status : tab;
  const filtered = useMemo(() => filterAndSort(clients, query, activeStatus, plan, sort), [clients, query, activeStatus, plan, sort]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const counts = {all: clients.length, active: clients.filter(c => c.status === 'active').length, trial: clients.filter(c => c.status === 'trial').length, archived: clients.filter(c => c.status === 'archived').length};
  const changeTab = (value: string) => {setTab(value); setStatus(''); setPage(1);};
  const resetFilters = () => {setQuery(''); setStatus(''); setPlan(''); setTab('all'); setPage(1);};
  const exportClients = (list: Client[]) => {
    const url = URL.createObjectURL(new Blob([toCsv(list)], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = 'folio-clients.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Экспортировано записей: ${list.length}`);
  };
  const updateStatus = (id: string, nextStatus: Status) => {
    setClients(previous => previous.map(c => c.id === id ? {...c, status: nextStatus} : c));
    setNotice(nextStatus === 'archived' ? 'Клиент перемещён в архив' : 'Клиент восстановлен');
  };
  const columns: TableColumnConfig<Client>[] = [
    {id: 'name', name: 'Клиент', meta: {sort: true}, width: '26%', template: c => <div className="client-cell"><span className={`avatar avatar-${c.color}`}>{initials(c.name)}</span><div className="client-info"><span className="client-name">{c.name}</span><span className="client-email">{c.email}</span></div></div>},
    {id: 'company', name: 'Компания', meta: {sort: true}, width: '16%', template: c => <span className="company-cell">{c.company}</span>},
    {id: 'status', name: 'Статус', meta: {sort: true}, width: '14%', template: c => <span className={`status status-${c.status}`}><span className="status-dot" />{statusLabels[c.status]}</span>},
    {id: 'plan', name: 'Тариф', meta: {sort: true}, width: '11%', template: c => <span className={`plan plan-${c.plan === 'Бизнес' ? 'business' : c.plan === 'Про' ? 'pro' : 'basic'}`}>{c.plan}</span>},
    {id: 'date', name: 'Дата регистрации', meta: {sort: true}, width: '17%', template: c => <span className="date-cell">{formatDate(c.date)}</span>},
    {id: 'revenue', name: 'Выручка', meta: {sort: true}, align: 'end', width: '12%', template: c => <span className={c.revenue ? 'revenue-cell' : 'revenue-cell muted'}>{money(c.revenue)}</span>},
    {id: 'actions', name: '', template: c => <DropdownMenu icon={<Icon data={Ellipsis} size={18}/>} defaultSwitcherProps={{'aria-label': `Действия: ${c.name}`, view: 'flat', size: 's'}} items={[
      {text: 'Открыть карточку', action: () => setDetail(c)},
      {text: 'Экспортировать в CSV', action: () => exportClients([c])},
      {text: c.status === 'archived' ? 'Восстановить клиента' : 'Переместить в архив', action: () => updateStatus(c.id, c.status === 'archived' ? 'active' : 'archived')},
    ]}/>},
  ];
  const submitClient = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {setFormError('Укажите имя, компанию и корректный email.'); return;}
    if (clients.some(c => c.email.toLowerCase() === form.email.trim().toLowerCase())) {setFormError('Клиент с таким email уже существует.'); return;}
    setClients(previous => [{...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), id: crypto.randomUUID(), status: 'trial', date: new Date().toISOString().slice(0, 10), revenue: 0, color: previous.length % 6}, ...previous]);
    setFormOpen(false); setForm(blankForm); resetFilters(); setSort([{column: 'date', order: 'desc'}]); setNotice('Новый клиент добавлен');
  };

  return <div className="app">
    <header className="page-header"><div className="header-inner">
      <div className="brand"><span className="brand-mark"><span/><span/><span/></span>folio<span className="brand-dot">.</span></div>
      <span className="header-divider"/>
      <div className="breadcrumb"><span>Рабочее пространство</span><Icon data={ChevronRight} size={12}/><span className="breadcrumb-current">Клиенты</span></div>
      <div className="header-right"><Button view="flat-secondary" size="m" onClick={() => setHelpOpen(true)} aria-label="Помощь"><Icon data={CircleQuestion} size={19}/></Button><span className="header-divider"/><span className="profile-avatar" title="Александр · Администратор">АК</span></div>
    </div></header>
    <main className="workspace">
      <div className="page-title-row"><div><div className="title-with-label"><Text variant="display-1">Клиенты</Text><span className="workspace-label">Рабочее пространство</span></div><p className="page-description">Все ваши клиенты и их данные — в одном месте.</p></div>
        <div className="page-actions"><Button size="l" view="outlined" onClick={() => exportClients(selected.length ? clients.filter(c => selected.includes(c.id)) : filtered)} disabled={!filtered.length && !selected.length}><Icon data={ArrowDownToLine} size={16}/>Экспорт</Button><Button size="l" view="action" onClick={() => {setFormOpen(true); setFormError('');}}><Icon data={Plus} size={17}/>Добавить клиента</Button></div>
      </div>
      <section className="stats-grid" aria-label="Статистика клиентов">
        <div className="stat-card"><div className="stat-top"><span>Всего клиентов</span><Icon data={Persons} size={18}/></div><div className="stat-bottom"><Text variant="display-1">{counts.all}</Text><span className="stat-caption">в вашей базе</span></div></div>
        <div className="stat-card"><div className="stat-top"><span>Активные клиенты</span><Icon data={CircleCheck} size={18}/></div><div className="stat-bottom"><Text variant="display-1">{counts.active}</Text><span className="stat-trend"><span className="status-dot"/>{Math.round(counts.active / counts.all * 100)}% от всех</span></div></div>
        <div className="stat-card"><div className="stat-top"><span>Пробный период</span><Icon data={CircleDashed} size={18}/></div><div className="stat-bottom"><Text variant="display-1">{counts.trial}</Text><span className="stat-caption">знакомятся с продуктом</span></div></div>
        <div className="stat-card"><div className="stat-top"><span>Общая выручка</span><Icon data={ChartColumn} size={18}/></div><div className="stat-bottom"><Text variant="display-1">{money(clients.reduce((sum, c) => sum + c.revenue, 0))}</Text><span className="revenue-icon"><Icon data={ArrowUpRight} size={17}/></span></div></div>
      </section>
      <section className="table-card" aria-label="Реестр клиентов">
        <div className="table-tabs" role="tablist" aria-label="Группы клиентов">{([{id: 'all', label: 'Все клиенты'}, {id: 'active', label: 'Активные'}, {id: 'trial', label: 'Пробный период'}, {id: 'archived', label: 'Архив'}] as const).map(item => <Button key={item.id} role="tab" aria-selected={tab === item.id} view="flat" className={`table-tab ${tab === item.id ? 'table-tab-active' : ''}`} onClick={() => changeTab(item.id)}>{item.label}<span className="tab-count">{counts[item.id]}</span></Button>)}<span className="table-live"><span className="status-dot"/>Данные актуальны</span></div>
        <div className="table-toolbar"><TextInput className="search-input" size="l" placeholder="Поиск по имени, email или компании" startContent={<Icon data={Magnifier} size={17}/>} value={query} onUpdate={value => {setQuery(value); setPage(1);}} hasClear controlProps={{'aria-label': 'Поиск клиентов'}}/>
          <div className="filter-controls"><Select size="l" value={activeStatus ? [activeStatus] : ['']} onUpdate={value => {setStatus(value[0]); setTab('all'); setPage(1);}} options={[{value: '', content: 'Все статусы'}, ...Object.entries(statusLabels).map(([value, content]) => ({value, content}))]} aria-label="Фильтр по статусу"/><Select size="l" value={[plan]} onUpdate={value => {setPlan(value[0]); setPage(1);}} options={[{value: '', content: 'Все тарифы'}, ...['Базовый', 'Про', 'Бизнес'].map(value => ({value, content: value}))]} aria-label="Фильтр по тарифу"/>
            {(query || activeStatus || plan) ? <Button size="l" view="flat-secondary" onClick={resetFilters} title="Сбросить фильтры"><Icon data={Xmark} size={16}/></Button> : <span className="filter-icon" title="Используйте поиск и фильтры"><Icon data={Sliders} size={17}/></span>}
          </div>
        </div>
        {selected.length > 0 && <div className="selection-bar"><span>Выбрано клиентов: <strong>{selected.length}</strong></span><Button size="s" view="flat" onClick={() => exportClients(clients.filter(c => selected.includes(c.id)))}><Icon data={ArrowDownToLine} size={14}/>Экспортировать</Button><Button size="s" view="flat" onClick={() => setSelected([])}>Снять выделение</Button></div>}
        <div className="table-container"><ClientsTable className="clients-table" data={rows} columns={columns} getRowDescriptor={c => ({id: c.id, interactive: true})} width="max" verticalAlign="middle" selectedIds={selected} onSelectionChange={setSelected} sortState={sort} onSortStateChange={value => {setSort(value); setPage(1);}} disableDataSorting emptyMessage="Клиенты не найдены. Попробуйте изменить запрос или фильтры." aria-label="Таблица клиентов с сортировкой и выбором строк"/></div>
        {!filtered.length && <div className="empty-actions"><Button view="outlined" onClick={resetFilters}>Сбросить фильтры</Button></div>}
        <div className="table-footer"><div className="page-size"><span>Строк на странице</span><Select value={[String(pageSize)]} onUpdate={value => {setPageSize(Number(value[0])); setPage(1);}} options={[8, 16, 32].map(value => ({value: String(value), content: String(value)}))} aria-label="Строк на странице" size="m"/><span className="rows-summary">{filtered.length ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)}` : '0'} из {filtered.length}</span></div><Pagination page={currentPage} pageSize={pageSize} total={filtered.length} onUpdate={setPage} size="m" compact/></div>
      </section>
      <footer className="workspace-footer"><span><Icon data={CircleQuestion} size={14}/>Нажмите на заголовок колонки, чтобы изменить сортировку</span><span>Folio · Управляйте отношениями, а не таблицами</span></footer>
    </main>
    {notice && <div className="notice" role="status"><Icon data={CircleCheck} size={18}/>{notice}<Button view="flat" size="s" onClick={() => setNotice('')} aria-label="Закрыть уведомление"><Icon data={Xmark} size={14}/></Button></div>}
    <Modal open={formOpen} onOpenChange={setFormOpen} aria-label="Добавить клиента"><form className="dialog" onSubmit={submitClient}><div className="dialog-header"><Text variant="header-1">Новый клиент</Text><Button view="flat" onClick={() => setFormOpen(false)} aria-label="Закрыть"><Icon data={Xmark}/></Button></div><p className="muted">Добавьте клиента в ваше рабочее пространство.</p>{([{key: 'name', label: 'Имя и фамилия', placeholder: 'Анна Смирнова'}, {key: 'email', label: 'Электронная почта', placeholder: 'anna@company.ru'}, {key: 'company', label: 'Компания', placeholder: 'Название компании'}] as const).map(field => <label className="form-field" key={field.key}><span>{field.label}</span><TextInput size="l" value={form[field.key]} onUpdate={value => setForm(previous => ({...previous, [field.key]: value}))} placeholder={field.placeholder} type={field.key === 'email' ? 'email' : 'text'} controlProps={{required: true}}/></label>)}<label className="form-field"><span>Тариф</span><Select size="l" value={[form.plan]} onUpdate={value => setForm(previous => ({...previous, plan: value[0] as Plan}))} options={['Базовый', 'Про', 'Бизнес'].map(value => ({value, content: value}))}/></label><p className="muted">Новый клиент начнёт с пробного периода.</p>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="dialog-actions"><Button view="outlined" size="l" onClick={() => setFormOpen(false)}>Отмена</Button><Button view="action" size="l" type="submit">Добавить клиента</Button></div></form></Modal>
    <Modal open={helpOpen} onOpenChange={setHelpOpen} aria-label="Как работать с клиентами"><div className="dialog"><div className="dialog-header"><Text variant="header-1">Всё о ваших клиентах</Text><Button view="flat" onClick={() => setHelpOpen(false)} aria-label="Закрыть"><Icon data={Xmark}/></Button></div><div className="help-content"><p>Нажмите на заголовок колонки для сортировки по возрастанию или убыванию. Удерживайте Shift, чтобы сортировать по нескольким колонкам.</p><p>Выберите клиентов чекбоксами для экспорта. Чекбокс в заголовке выделяет текущую страницу. Выбор сохраняется при смене страниц и фильтров.</p><p>Поиск работает по имени, электронной почте и компании. Статус и тариф помогут уточнить результаты.</p><p className="muted">Это демонстрационное рабочее пространство. Изменения хранятся в текущем сеансе и сбрасываются после перезагрузки.</p></div><Button view="action" size="l" onClick={() => setHelpOpen(false)}>Понятно</Button></div></Modal>
    <Modal open={Boolean(detail)} onOpenChange={open => {if (!open) setDetail(null);}} aria-label="Карточка клиента">{detail && <div className="dialog"><div className="dialog-header"><Text variant="header-1">Карточка клиента</Text><Button view="flat" onClick={() => setDetail(null)} aria-label="Закрыть"><Icon data={Xmark}/></Button></div><div className="detail-identity"><span className={`avatar avatar-${detail.color}`}>{initials(detail.name)}</span><Text variant="subheader-3">{detail.name}</Text></div><dl className="detail-list"><dt>Email</dt><dd><a href={`mailto:${detail.email}`}>{detail.email}</a></dd><dt>Компания</dt><dd>{detail.company}</dd><dt>Статус</dt><dd>{statusLabels[clients.find(c => c.id === detail.id)?.status ?? detail.status]}</dd><dt>Тариф</dt><dd>{detail.plan}</dd><dt>Дата регистрации</dt><dd>{formatDate(detail.date)}</dd><dt>Выручка</dt><dd>{money(detail.revenue)}</dd></dl><Button view="outlined" onClick={() => exportClients([detail])}><Icon data={ArrowDownToLine}/>Экспортировать</Button></div>}</Modal>
  </div>;
}
