import {useMemo, useState, type FormEvent} from 'react';
import {Button, Checkbox, DropdownMenu, Icon, Modal, Pagination, Select, Table, Text, TextInput, ThemeProvider, withTableSelection, withTableSorting, type TableColumnConfig, type TableSortState} from '@gravity-ui/uikit';
import {ArrowDownToLine, ChartLine, CircleCheck, CircleQuestion, LayoutCells, Magnifier, Moon, PersonPlus, Persons, Plus, Sliders, Sun, Xmark} from '@gravity-ui/icons';
import {findCustomers, initialCustomers, statuses, toCsv, type Customer, type Status} from './data';
import './styles.css';

const CustomerTable = withTableSorting(withTableSelection<Customer>(Table));
const currency = (value: number) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0}).format(value) + ' ₽';
const dateLabel = (value: string) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(value + 'T12:00:00')).replace(' г.', '');
const initials = (name: string) => name.split(' ').slice(0, 2).map(s => s[0]).join('');
const allFields = ['name', 'company', 'status', 'revenue', 'date'];

export function App() {
 const [theme, setTheme] = useState<'light' | 'dark'>('light');
 const [customers, setCustomers] = useState(initialCustomers);
 const [query, setQuery] = useState('');
 const [status, setStatus] = useState('');
 const [company, setCompany] = useState('');
 const [sortState, setSortState] = useState<TableSortState>([]);
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(8);
 const [selectedIds, setSelectedIds] = useState<string[]>([]);
 const [visibleFields, setVisibleFields] = useState(allFields);
 const [modal, setModal] = useState<'add' | 'columns' | 'help' | null>(null);
 const [filtersOpen, setFiltersOpen] = useState(false);
 const [notice, setNotice] = useState('');
 const [form, setForm] = useState({name: '', email: '', company: '', status: 'new'});
 const [submitted, setSubmitted] = useState(false);
 const filtered = useMemo(() => findCustomers(customers, query, status, company, sortState), [customers, query, status, company, sortState]);
 const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
 const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
 const activeCount = customers.filter(c => c.status === 'active').length;
 const newCount = customers.filter(c => c.status === 'new').length;
 const revenue = customers.reduce((sum, c) => sum + c.revenue, 0);
 const updateStatus = (value: string) => {setStatus(value); setPage(1);};
 const exportRows = (rows: Customer[]) => {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], {type: 'text/csv;charset=utf-8;'}));
  const link = document.createElement('a'); link.href = url; link.download = 'Клиенты.csv'; link.click(); URL.revokeObjectURL(url);
  setNotice(`Экспортировано записей: ${rows.length}`);
 };
 const allColumns: TableColumnConfig<Customer>[] = [
  {id: 'name', name: 'Клиент', width: '28%', className: 'customer-cell', meta: {sort: true}, template: c => <div className="customer-info"><span className={`avatar avatar-${c.tone}`}>{initials(c.name)}</span><div className="customer-text"><span className="customer-name">{c.name}</span><span className="customer-email">{c.email}</span></div></div>},
  {id: 'company', name: 'Компания', width: '18%', className: 'data-cell', meta: {sort: true}},
  {id: 'status', name: 'Статус', width: '17%', className: 'data-cell', meta: {sort: true}, template: c => <span className={`status status-${c.status}`}><span className="status-dot" />{statuses[c.status]}</span>},
  {id: 'revenue', name: 'Выручка', width: '16%', className: 'data-cell numeric-cell', align: 'end', meta: {sort: true}, template: c => currency(c.revenue)},
  {id: 'date', name: 'Дата добавления', width: '18%', className: 'data-cell date-cell', meta: {sort: true}, template: c => dateLabel(c.date)},
  {id: 'actions', name: '', className: 'action-cell', template: c => <DropdownMenu defaultSwitcherProps={{view: 'flat', 'aria-label': `Действия: ${c.name}`}} items={[
   {text: 'Экспортировать клиента', action: () => exportRows([c])},
   {text: c.status === 'inactive' ? 'Сделать активным' : 'Сделать неактивным', action: () => {setCustomers(prev => prev.map(p => p.id === c.id ? {...p, status: c.status === 'inactive' ? 'active' : 'inactive'} : p)); setNotice('Статус клиента обновлён');}},
  ]} />},
 ];
 const columns = allColumns.filter(c => c.id === 'actions' || visibleFields.includes(c.id));
 const addCustomer = (event: FormEvent) => {
  event.preventDefault(); setSubmitted(true);
  if (!form.name.trim() || !form.company.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return;
  setCustomers(prev => [{id: crypto.randomUUID(), name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), status: form.status as Status, revenue: 0, date: new Date().toISOString().slice(0, 10), tone: 'utility'}, ...prev]);
  setQuery(''); setCompany(''); setStatus(''); setSortState([]); setPage(1); setModal(null); setForm({name: '', email: '', company: '', status: 'new'}); setSubmitted(false); setNotice('Клиент добавлен в базу');
 };
 const clearFilters = () => {setQuery(''); setCompany(''); updateStatus('');};

 return <ThemeProvider theme={theme}>
  <div className="app">
   <header className="topbar"><div className="topbar-inner">
    <div className="brand"><span className="brand-symbol"><span /><span /><span /></span><span>orbit<span className="brand-period">.</span></span></div>
    <span className="header-divider" /><div className="workspace"><span className="workspace-symbol">S</span><span>Studio workspace</span><span className="workspace-plan">PRO</span></div>
    <div className="header-actions"><Button view="flat" size="l" title="Помощь" aria-label="Помощь" onClick={() => setModal('help')}><Icon data={CircleQuestion} size={19} /></Button><Button view="flat" size="l" title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'} aria-label="Переключить тему" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}><Icon data={theme === 'light' ? Moon : Sun} size={18} /></Button><span className="header-divider" /><span className="profile-avatar">АС</span><div className="profile-text"><strong>Алексей Соколов</strong><span>Администратор</span></div></div>
   </div></header>
   <main className="main">
    <div className="breadcrumb">Рабочее пространство <span>/</span> <span className="breadcrumb-current">Клиенты</span></div>
    <div className="page-heading"><div><div className="heading-line"><Text variant="display-1" as="h1">Клиенты</Text><span className="heading-count">{customers.length}</span></div><Text variant="body-2" color="secondary">Вся клиентская база в одном месте. Управляйте контактами и развивайте отношения.</Text></div><div className="page-actions"><Button view="outlined" size="l" onClick={() => exportRows(selectedIds.length ? customers.filter(c => selectedIds.includes(c.id)) : filtered)}><Icon data={ArrowDownToLine} size={16} />Экспорт</Button><Button view="action" size="l" onClick={() => {setModal('add'); setSubmitted(false);}}><Icon data={Plus} size={16} />Добавить клиента</Button></div></div>
    <section className="stats" aria-label="Статистика клиентской базы">
     <div className="stat"><div className="stat-top"><span>Всего клиентов</span><span className="stat-icon"><Icon data={Persons} size={18} /></span></div><div className="stat-bottom"><strong>{customers.length}</strong><span className="stat-context">в клиентской базе</span></div></div>
     <div className="stat"><div className="stat-top"><span>Активные клиенты</span><span className="stat-icon green"><Icon data={CircleCheck} size={18} /></span></div><div className="stat-bottom"><strong>{activeCount}</strong><span className="stat-trend">{Math.round(activeCount / customers.length * 100)}% <span>от всех клиентов</span></span></div></div>
     <div className="stat"><div className="stat-top"><span>Новые клиенты</span><span className="stat-icon blue"><Icon data={PersonPlus} size={18} /></span></div><div className="stat-bottom"><strong>{newCount}</strong><span className="stat-context">знакомимся поближе</span></div></div>
     <div className="stat"><div className="stat-top"><span>Общая выручка</span><span className="stat-icon orange"><Icon data={ChartLine} size={18} /></span></div><div className="stat-bottom"><strong>{new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2}).format(revenue / 1e6)} <small>млн ₽</small></strong><span className="stat-context">за всё время</span></div></div>
    </section>
    <section className="table-panel" aria-label="Реестр клиентов">
     <div className="table-tabs"><div className="tab-list" role="tablist" aria-label="Статус клиентов">{[{id: '', label: 'Все клиенты', count: customers.length}, {id: 'active', label: 'Активные', count: activeCount}, {id: 'new', label: 'Новые', count: newCount}, {id: 'inactive', label: 'Неактивные', count: customers.filter(c => c.status === 'inactive').length}].map(tab => <Button key={tab.id} role="tab" aria-selected={status === tab.id} view="flat" className={`tab ${status === tab.id ? 'tab-active' : ''}`} onClick={() => updateStatus(tab.id)}>{tab.label}<span className="tab-count">{tab.count}</span></Button>)}</div><span className="live-label"><span />Данные актуальны</span></div>
     <div className="table-toolbar"><TextInput className="search-input" size="l" placeholder="Поиск по имени, email или компании…" value={query} onUpdate={value => {setQuery(value); setPage(1);}} hasClear startContent={<Icon data={Magnifier} size={17} />} controlProps={{'aria-label': 'Поиск клиентов'}} /><div className="filter-controls"><Select size="l" value={[status]} onUpdate={values => updateStatus(values[0] || '')} options={[{value: '', content: 'Все статусы'}, ...Object.entries(statuses).map(([value, content]) => ({value, content}))]} aria-label="Фильтр по статусу" /><Button view={filtersOpen || company ? 'outlined-utility' : 'outlined'} size="l" onClick={() => setFiltersOpen(!filtersOpen)}><Icon data={Sliders} size={16} />Фильтры{company && <span className="filter-badge">1</span>}</Button><span className="toolbar-divider" /><Button view="outlined" size="l" onClick={() => setModal('columns')}><Icon data={LayoutCells} size={16} /><span className="columns-button-text">Столбцы</span></Button></div></div>
     {filtersOpen && <div className="extra-filters"><span>Компания</span><Select size="m" placeholder="Все компании" value={company ? [company] : []} hasClear filterable onUpdate={values => {setCompany(values[0] || ''); setPage(1);}} options={[...new Set(customers.map(c => c.company))].sort().map(c => ({value: c, content: c}))} aria-label="Фильтр по компании" /><Button view="flat" onClick={clearFilters}>Сбросить фильтры</Button></div>}
     {selectedIds.length > 0 && <div className="selection-bar"><span><strong>Выбрано: {selectedIds.length}</strong><span className="selection-hint">Выбор сохраняется на всех страницах</span></span><div><Button view="flat-utility" onClick={() => exportRows(customers.filter(c => selectedIds.includes(c.id)))}><Icon data={ArrowDownToLine} size={14} />Экспортировать</Button><Button view="flat" aria-label="Снять выделение" onClick={() => setSelectedIds([])}><Icon data={Xmark} size={16} /></Button></div></div>}
     <CustomerTable className="customers-table" data={pageData} columns={columns} width="max" verticalAlign="middle" getRowDescriptor={c => ({id: c.id, interactive: true})} selectedIds={selectedIds} onSelectionChange={setSelectedIds} sortState={sortState} onSortStateChange={sort => {setSortState(sort); setPage(1);}} disableDataSorting emptyMessage="Клиенты не найдены. Попробуйте изменить условия поиска." aria-label="Таблица клиентов" />
     {filtered.length === 0 && <div className="empty-reset"><Button view="outlined" onClick={clearFilters}>Сбросить поиск и фильтры</Button></div>}
     <div className="table-footer"><span className="results-text">Показано <strong>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</strong> из <strong>{filtered.length}</strong> клиентов</span><div className="pagination-controls"><div className="page-size"><span>На странице</span><Select size="m" value={[String(pageSize)]} onUpdate={v => {setPageSize(Number(v[0])); setPage(1);}} options={[8, 16, 24, 48].map(n => ({value: String(n), content: String(n)}))} aria-label="Количество строк на странице" /></div><Pagination page={currentPage} pageSize={pageSize} total={filtered.length} onUpdate={(p, size) => {setPage(p); setPageSize(size);}} size="m" view="clear" compact /></div></div>
    </section>
    <footer className="page-footer"><span><Icon data={CircleQuestion} size={14} />Нажмите на заголовок столбца, чтобы изменить порядок сортировки</span><span>Сделано для людей. Создано для роста.</span></footer>
   </main>
   {notice && <div className="notice" role="status"><Icon data={CircleCheck} size={18} />{notice}<Button view="flat" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={14} /></Button></div>}
   <Modal open={modal !== null} onClose={() => setModal(null)} aria-label={modal === 'add' ? 'Добавить клиента' : modal === 'columns' ? 'Настроить столбцы' : 'Помощь'}><div className="modal-content"><div className="modal-heading"><Text variant="header-1">{modal === 'add' ? 'Новый клиент' : modal === 'columns' ? 'Настроить столбцы' : 'Всё под рукой'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setModal(null)}><Icon data={Xmark} size={20} /></Button></div>
    {modal === 'add' && <form onSubmit={addCustomer} className="customer-form"><Text color="secondary">Добавьте контакт, чтобы начать работу с клиентом.</Text><label htmlFor="client-name">Имя и фамилия<TextInput id="client-name" size="l" value={form.name} onUpdate={name => setForm({...form, name})} placeholder="Например, Анна Смирнова" validationState={submitted && !form.name.trim() ? 'invalid' : undefined} errorMessage={submitted && !form.name.trim() ? 'Укажите имя клиента' : undefined} /></label><label htmlFor="client-email">Email<TextInput id="client-email" type="email" size="l" value={form.email} onUpdate={email => setForm({...form, email})} placeholder="name@company.ru" validationState={submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'invalid' : undefined} errorMessage={submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Укажите корректный email' : undefined} /></label><label htmlFor="client-company">Компания<TextInput id="client-company" size="l" value={form.company} onUpdate={company => setForm({...form, company})} placeholder="Название компании" validationState={submitted && !form.company.trim() ? 'invalid' : undefined} errorMessage={submitted && !form.company.trim() ? 'Укажите компанию' : undefined} /></label><label htmlFor="client-status">Статус<Select id="client-status" size="l" width="max" value={[form.status]} onUpdate={s => setForm({...form, status: s[0]})} options={Object.entries(statuses).map(([value, content]) => ({value, content}))} /></label><div className="modal-actions"><Button size="l" view="outlined" onClick={() => setModal(null)}>Отмена</Button><Button size="l" view="action" type="submit">Добавить клиента</Button></div></form>}
    {modal === 'columns' && <div className="columns-options"><Text color="secondary">Выберите, какие данные показывать в таблице.</Text>{allFields.map((field, i) => <Checkbox key={field} size="l" checked={visibleFields.includes(field)} disabled={field === 'name'} onUpdate={checked => setVisibleFields(prev => checked ? [...prev, field] : prev.filter(v => v !== field))}>{['Клиент', 'Компания', 'Статус', 'Выручка', 'Дата добавления'][i]}</Checkbox>)}<Button size="l" view="action" onClick={() => setModal(null)}>Готово</Button></div>}
    {modal === 'help' && <div className="help-content"><p>Нажмите на заголовок столбца для сортировки по возрастанию или убыванию. Удерживайте Shift, чтобы сортировать по нескольким столбцам.</p><p>Выделяйте клиентов чекбоксами. Чекбокс в заголовке выбирает всю текущую страницу, а выбор сохраняется при переходах между страницами.</p><p>Поиск и фильтры применяются ко всей базе. Кнопка «Экспорт» сохраняет выбранных клиентов или результаты поиска в CSV.</p><p className="help-note">Это демонстрационная база. Изменения сохраняются до перезагрузки страницы.</p><Button size="l" view="action" onClick={() => setModal(null)}>Понятно</Button></div>}
   </div></Modal>
  </div>
 </ThemeProvider>;
}
