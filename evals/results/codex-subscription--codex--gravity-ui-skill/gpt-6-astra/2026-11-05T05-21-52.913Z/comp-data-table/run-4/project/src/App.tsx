import {useEffect, useMemo, useState} from 'react';
import {Button, Checkbox, DropdownMenu, Icon, Modal, Pagination, Select, Table, Text, TextInput, withTableSelection, withTableSorting} from '@gravity-ui/uikit';
import type {TableColumnConfig, TableSortState} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, Check, ChevronDown, CircleCheck, CircleQuestion, Clock, Layers, LayoutColumns3, Magnifier, Moon, Persons, Plus, Sun, Xmark} from '@gravity-ui/icons';
import {Client, csvForClients, initialClients, money, prepareClients} from './data';
import './styles.css';

const ClientTable = withTableSelection(withTableSorting<Client>(Table));
const statusOptions = ['Активен', 'Приглашён', 'Неактивен'];
const planOptions = ['Базовый', 'Про', 'Бизнес'];
const columnNames: Record<string, string> = {company: 'Компания', status: 'Статус', plan: 'Тариф', date: 'Дата добавления', revenue: 'Выручка'};
const blankForm = {name: '', email: '', company: '', status: 'Активен' as Client['status'], plan: 'Базовый' as Client['plan']};
const initials = (name: string) => name.split(' ').slice(0, 2).map(n => n[0]).join('');

export function App({dark, toggleTheme}: {dark: boolean; toggleTheme: () => void}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');
  const [tab, setTab] = useState('all');
  const [sort, setSort] = useState<TableSortState>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [modal, setModal] = useState<'client' | 'help' | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(blankForm);
  const [notice, setNotice] = useState('');
  useEffect(() => {if (!notice) return; const timer = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(timer);}, [notice]);
  const filtered = useMemo(() => prepareClients(clients, query, status, plan, tab, sort), [clients, query, status, plan, tab, sort]);
  const safePage = Math.max(1, Math.min(page, Math.ceil(filtered.length / pageSize)));
  const pageData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const current = clients.filter(c => !c.archived);
  const activeCount = current.filter(c => c.status === 'Активен').length;
  const invitedCount = current.filter(c => c.status === 'Приглашён').length;
  function resetFilters() {setQuery(''); setStatus(''); setPlan(''); setPage(1);}
  function openClient(client?: Client) {setEditing(client?.id ?? null); setForm(client ? {...client} : {...blankForm}); setModal('client');}
  function archive(ids: string[], archived: boolean) {
    setClients(prev => prev.map(c => ids.includes(c.id) ? {...c, archived} : c));
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    setNotice(archived ? `Перенесено в архив: ${ids.length}` : `Восстановлено клиентов: ${ids.length}`);
  }
  function exportData() {
    const rows = selectedIds.length ? clients.filter(c => selectedIds.includes(c.id)) : filtered;
    const url = URL.createObjectURL(new Blob([csvForClients(rows)], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = 'clients.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice(`Экспортировано записей: ${rows.length}`);
  }
  const allColumns: TableColumnConfig<Client>[] = [
    {id: 'name', name: 'Клиент', meta: {sort: true}, width: '27%', template: c => <div className="client-cell"><span className={`client-avatar avatar-${Number(c.id) % 6}`}>{initials(c.name)}</span><div className="client-copy"><Button view="flat" className="client-name" onClick={() => openClient(c)}>{c.name}</Button><span className="client-email">{c.email}</span></div></div>},
    {id: 'company', name: 'Компания', meta: {sort: true}, width: '14%', template: c => <span className="company">{c.company}</span>},
    {id: 'status', name: 'Статус', meta: {sort: true}, width: '14%', template: c => <span className={`status status-${statusOptions.indexOf(c.status)}`}><span />{c.status}</span>},
    {id: 'plan', name: 'Тариф', meta: {sort: true}, width: '11%', template: c => <span className={`plan plan-${planOptions.indexOf(c.plan)}`}>{c.plan}</span>},
    {id: 'date', name: 'Дата добавления', meta: {sort: true}, width: '16%', template: c => <span className="date">{new Date(c.date).toLocaleDateString('ru-RU', {day: '2-digit', month: 'short', year: 'numeric'}).replace(' г.', '')}</span>},
    {id: 'revenue', name: 'Выручка', meta: {sort: true}, align: 'end', width: '13%', template: c => <span className="revenue">{money(c.revenue)}</span>},
    {id: 'actions', name: '', template: c => <DropdownMenu defaultSwitcherProps={{'aria-label': `Действия: ${c.name}`, view: 'flat'}} items={[{text: 'Редактировать', action: () => openClient(c)}, {text: 'Экспортировать', action: () => {const url = URL.createObjectURL(new Blob([csvForClients([c])], {type: 'text/csv;charset=utf-8;'})); const a = document.createElement('a'); a.href = url; a.download = 'client.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);}}, {text: c.archived ? 'Восстановить' : 'В архив', action: () => archive([c.id], !c.archived)}]} />},
  ];
  const columns = allColumns.filter(c => !hiddenColumns.includes(c.id));
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark"><Icon data={Layers} size={21} /></span><Text variant="subheader-3">folio<span className="brand-dot">.</span></Text></div>
      <span className="header-divider" />
      <div className="breadcrumb"><span>Рабочее пространство</span><span className="crumb-slash">/</span><span className="crumb-current">Клиенты</span></div>
      <div className="header-actions"><span className="workspace-dot"/><span className="workspace-name">Команда Folio</span><Button view="flat-secondary" aria-label="Справка" onClick={() => setModal('help')}><Icon data={CircleQuestion} size={19}/></Button><Button view="flat-secondary" aria-label={dark ? 'Светлая тема' : 'Тёмная тема'} onClick={toggleTheme}><Icon data={dark ? Sun : Moon} size={18}/></Button><span className="profile-avatar" title="Алексей Смирнов">АС</span></div>
    </header>
    <main className="workspace">
      <div className="page-heading"><div><div className="eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div><div className="title-row"><Text as="h1" variant="display-1">Клиенты</Text><span className="title-count">{clients.length}</span></div><Text color="secondary" variant="body-2">Все ваши клиенты, контакты и возможности — в одном месте.</Text></div><div className="page-actions"><Button size="l" view="outlined" onClick={exportData}><Icon data={ArrowDownToLine} size={16}/>Экспорт</Button><Button size="l" view="action" onClick={() => openClient()}><Icon data={Plus} size={16}/>Добавить клиента</Button></div></div>
      <section className="stats" aria-label="Статистика клиентов">
        <div className="stat"><div className="stat-top"><span>Всего клиентов</span><Icon data={Persons} size={18}/></div><div className="stat-value"><Text variant="display-1">{current.length}</Text><span className="stat-tag"><Icon data={ArrowUpRight} size={12}/>В работе</span></div><span className="stat-caption">Единая база вашей команды</span></div>
        <div className="stat"><div className="stat-top"><span>Активные клиенты</span><Icon data={CircleCheck} size={18}/></div><div className="stat-value"><Text variant="display-1">{activeCount}</Text><span className="mini-trend">{Math.round(activeCount / (current.length || 1) * 100)}% от всех</span></div><span className="stat-caption"><span className="tiny-dot positive"/>Продолжают работать с вами</span></div>
        <div className="stat"><div className="stat-top"><span>Ожидают приглашения</span><Icon data={Clock} size={18}/></div><div className="stat-value"><Text variant="display-1">{invitedCount}</Text><span className="mini-trend">На старте</span></div><span className="stat-caption"><span className="tiny-dot warning"/>Ещё не активировали аккаунт</span></div>
        <div className="stat"><div className="stat-top"><span>Общая выручка</span><span className="ruble-icon">₽</span></div><div className="stat-value"><Text variant="display-1">{money(current.reduce((sum, c) => sum + c.revenue, 0))}</Text></div><span className="stat-caption">За всё время работы с клиентами</span></div>
      </section>
      <section className="data-panel" aria-label="Реестр клиентов">
        <div className="tabbar"><div className="tabs" role="tablist" aria-label="Группы клиентов">{[{id: 'all', label: 'Все клиенты', count: current.length}, {id: 'active', label: 'Активные', count: activeCount}, {id: 'archive', label: 'Архив', count: clients.length - current.length}].map(t => <Button key={t.id} role="tab" aria-selected={tab === t.id} view="flat" className={`tab ${tab === t.id ? 'tab-active' : ''}`} onClick={() => {setTab(t.id); resetFilters();}}>{t.label}<span className="tab-count">{t.count}</span></Button>)}</div><span className="table-label"><span className="tiny-dot positive"/>Данные актуальны</span></div>
        <div className="toolbar"><TextInput className="search" size="l" placeholder="Поиск по имени, email или компании" value={query} onUpdate={v => {setQuery(v); setPage(1);}} hasClear startContent={<Icon data={Magnifier} size={17}/>} controlProps={{'aria-label': 'Поиск клиентов'}}/><div className="filters"><Select size="l" aria-label="Фильтр по статусу" placeholder="Все статусы" value={status ? [status] : []} onUpdate={v => {setStatus(v[0] || ''); setPage(1);}} options={statusOptions.map(value => ({value, content: value}))} hasClear/><Select size="l" aria-label="Фильтр по тарифу" placeholder="Все тарифы" value={plan ? [plan] : []} onUpdate={v => {setPlan(v[0] || ''); setPage(1);}} options={planOptions.map(value => ({value, content: value}))} hasClear/>{(query || status || plan) && <Button view="flat-secondary" onClick={resetFilters} aria-label="Сбросить фильтры"><Icon data={Xmark}/></Button>}</div><div className="column-control"><DropdownMenu open={columnsOpen} onOpenToggle={setColumnsOpen} renderSwitcher={p => <Button {...p} size="l" view="outlined"><Icon data={LayoutColumns3} size={16}/><span className="column-label">Колонки</span></Button>}><div className="column-menu"><Text variant="subheader-1">Видимые колонки</Text>{Object.entries(columnNames).map(([id, title]) => <Checkbox key={id} checked={!hiddenColumns.includes(id)} onUpdate={checked => setHiddenColumns(prev => checked ? prev.filter(v => v !== id) : [...prev, id])}>{title}</Checkbox>)}</div></DropdownMenu></div></div>
        {selectedIds.length > 0 && <div className="selection-bar"><span><strong>Выбрано: {selectedIds.length}</strong><span className="selection-note"> · на всех страницах</span></span><div><Button size="s" view="flat" onClick={exportData}>Экспортировать</Button><Button size="s" view="flat" onClick={() => archive(selectedIds, tab !== 'archive')}>{tab === 'archive' ? 'Восстановить' : 'В архив'}</Button><Button size="s" view="flat" aria-label="Снять выделение" onClick={() => setSelectedIds([])}><Icon data={Xmark} size={14}/></Button></div></div>}
        <div className="table-wrap"><ClientTable className="clients-table" data={pageData} columns={columns} width="max" edgePadding verticalAlign="middle" getRowDescriptor={c => ({id: c.id, interactive: true})} selectedIds={selectedIds} onSelectionChange={setSelectedIds} sortState={sort} disableDataSorting onSortStateChange={next => {setSort(next); setPage(1);}} emptyMessage="Клиенты не найдены. Попробуйте изменить условия поиска." aria-label="Таблица клиентов"/></div>
        {filtered.length === 0 && <div className="empty-actions"><Button view="outlined" onClick={resetFilters}>Сбросить фильтры</Button></div>}
        <div className="pagination-row"><span className="results-count">Показано <strong>{filtered.length ? (safePage - 1) * pageSize + 1 : 0}–{Math.min(safePage * pageSize, filtered.length)}</strong> из <strong>{filtered.length}</strong> клиентов</span><div className="pagination-controls"><span className="page-size-label">Строк на странице</span><Select size="m" aria-label="Строк на странице" value={[String(pageSize)]} onUpdate={v => {setPageSize(Number(v[0])); setPage(1);}} options={[10, 20, 50].map(n => ({value: String(n), content: String(n)}))}/><span className="pagination-divider"/><Pagination page={safePage} pageSize={pageSize} total={filtered.length} onUpdate={setPage} size="m" compact view="clear"/></div></div>
      </section>
      <div className="table-hint"><Icon data={CircleQuestion} size={14}/><span>Нажмите на заголовок колонки, чтобы отсортировать данные. Используйте чекбоксы для массовых действий.</span><span className="demo-note">Демонстрационные данные</span></div>
      <footer className="footer"><span className="footer-brand">folio<span>.</span></span><span>Порядок в данных. Фокус на главном.</span><Button view="flat-secondary" size="s" onClick={() => setModal('help')}>Помощь и поддержка<Icon data={ArrowUpRight} size={13}/></Button></footer>
    </main>
    {notice && <div role="status" className="notice"><Icon data={CircleCheck} size={18}/>{notice}<Button view="flat" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={14}/></Button></div>}
    <Modal open={modal !== null} onClose={() => setModal(null)} aria-labelledby="modal-title"><div className="modal-content"><div className="modal-heading"><Text as="h2" variant="header-1" id="modal-title">{modal === 'help' ? 'Работа с клиентами' : editing ? 'Редактировать клиента' : 'Новый клиент'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setModal(null)}><Icon data={Xmark} size={18}/></Button></div>{modal === 'help' ? <div className="help-content"><p>Нажмите на заголовок колонки для сортировки по возрастанию, убыванию и возврата к исходному порядку. Shift + нажатие добавляет сортировку по следующей колонке.</p><p>Чекбокс в заголовке выделяет текущую страницу. Выбор сохраняется между страницами и при фильтрации.</p><p>Экспорт скачивает выбранных клиентов или все найденные записи в CSV. В меню строки можно редактировать клиента или перенести его в архив.</p><p className="muted">Это демонстрационный реестр. Изменения хранятся в текущей сессии и сбрасываются при обновлении страницы.</p><Button view="action" size="l" onClick={() => setModal(null)}>Понятно</Button></div> : <form onSubmit={e => {e.preventDefault(); const values = {...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim()}; if (!values.name || !values.company) return; setClients(prev => editing ? prev.map(c => c.id === editing ? {...c, ...values} : c) : [{...values, id: String(Date.now()), date: new Date().toISOString().slice(0, 10), revenue: 0, archived: false}, ...prev]); setModal(null); setNotice(editing ? 'Изменения сохранены' : 'Клиент добавлен'); if (!editing) {setTab('all'); resetFilters(); setSort([]);}}}><label>Имя и фамилия<TextInput size="l" value={form.name} onUpdate={name => setForm({...form, name})} controlProps={{required: true, maxLength: 80}} autoFocus placeholder="Например, Анна Иванова"/></label><label>Email<TextInput size="l" type="email" value={form.email} onUpdate={email => setForm({...form, email})} controlProps={{required: true}} placeholder="anna@company.ru"/></label><label>Компания<TextInput size="l" value={form.company} onUpdate={company => setForm({...form, company})} controlProps={{required: true, maxLength: 80}} placeholder="Название компании"/></label><div className="form-grid"><label>Статус<Select width="max" size="l" value={[form.status]} onUpdate={v => setForm({...form, status: v[0] as Client['status']})} options={statusOptions.map(value => ({value, content: value}))}/></label><label>Тариф<Select width="max" size="l" value={[form.plan]} onUpdate={v => setForm({...form, plan: v[0] as Client['plan']})} options={planOptions.map(value => ({value, content: value}))}/></label></div><div className="form-actions"><Button view="outlined" size="l" onClick={() => setModal(null)}>Отмена</Button><Button type="submit" view="action" size="l">{editing ? 'Сохранить изменения' : 'Добавить клиента'}</Button></div></form>}</div></Modal>
  </div>;
}
