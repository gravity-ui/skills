import {useEffect, useMemo, useState} from 'react';
import {
  Button, Checkbox, DropdownMenu, Icon, Modal, Pagination, Select,
  Table, Text, TextInput, withTableSelection, withTableSorting,
  type TableColumnConfig, type TableSortState,
} from '@gravity-ui/uikit';
import {
  Archive, ArrowDownToLine, ArrowUpRight, ChevronDown, ChevronRight,
  CircleCheck, CircleInfo, CircleQuestion, LayoutColumns3, Magnifier,
  PersonPlus, Persons, Plus, Sliders, Xmark,
} from '@gravity-ui/icons';
import {createClients, filterAndSortClients, statusLabels, type Client, type Status} from './clients';
import './styles.css';

const ClientTable = withTableSorting(withTableSelection<Client>(Table));
const storageKey = 'orbit-clients-v1';
const defaultColumns = ['name', 'company', 'status', 'email', 'createdAt'];
const columnLabels: Record<string, string> = {
  name: 'Клиент', company: 'Компания', status: 'Статус', email: 'Email', createdAt: 'Дата добавления',
};
const emptyForm = {name: '', role: '', company: '', email: '', status: 'active' as Status};
const statusOptions = Object.entries(statusLabels).map(([value, content]) => ({value, content}));

function loadClients(): Client[] {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(stored) && stored.every((c) => c &&
      typeof c.id === 'string' && typeof c.name === 'string' && typeof c.role === 'string' &&
      typeof c.company === 'string' && typeof c.email === 'string' &&
      typeof c.createdAt === 'string' && c.status in statusLabels)) return stored;
  } catch { /* A fresh dataset is used if browser storage is unavailable. */ }
  return createClients();
}

function StatusBadge({status}: {status: Status}) {
  return <span className={`status-badge status-badge--${status}`}><span />{statusLabels[status]}</span>;
}

export function App() {
  const [clients, setClients] = useState(loadClients);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [company, setCompany] = useState<string[]>([]);
  const [status, setStatus] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortState, setSortState] = useState<TableSortState>([{column: 'createdAt', order: 'desc'}]);
  const [visibleColumns, setVisibleColumns] = useState(defaultColumns);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(clients)); } catch { /* Work in memory if storage is unavailable. */ }
  }, [clients]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(() => ({
    all: clients.length,
    active: clients.filter((c) => c.status === 'active').length,
    inactive: clients.filter((c) => c.status === 'inactive').length,
    archived: clients.filter((c) => c.status === 'archived').length,
    recent: clients.filter((c) => c.createdAt >= '2026-11-01').length,
  }), [clients]);
  const filtered = useMemo(() => filterAndSortClients(clients, {
    query, status: status[0] || tab, company: company[0], sortState,
  }), [clients, query, tab, status, company, sortState]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const pageData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const companies = useMemo(() => [...new Set(clients.map((c) => c.company))].sort((a, b) => a.localeCompare(b, 'ru'))
    .map((value) => ({value, content: value})), [clients]);
  const hasFilters = Boolean(query || status.length || company.length || tab !== 'all');

  function openForm(client?: Client) {
    setEditingId(client?.id ?? null);
    setForm(client ? {name: client.name, role: client.role, company: client.company, email: client.email, status: client.status} : emptyForm);
    setFormError('');
    setFormOpen(true);
  }

  function archiveClients(ids: string[]) {
    setClients((items) => items.map((c) => ids.includes(c.id) ? {...c, status: 'archived'} : c));
    setSelectedIds((selected) => selected.filter((id) => !ids.includes(id)));
    setNotice(ids.length === 1 ? 'Клиент перемещён в архив' : `Перемещено в архив: ${ids.length}`);
  }

  function exportClients() {
    const rows = selectedIds.length ? clients.filter((c) => selectedIds.includes(c.id)) : filtered;
    if (!rows.length) return;
    const escape = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const csv = [['Клиент', 'Должность', 'Компания', 'Статус', 'Email', 'Дата добавления'],
      ...rows.map((c) => [c.name, c.role, c.company, statusLabels[c.status], c.email, c.createdAt])]
      .map((row) => row.map(escape).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Клиенты.csv';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Экспортировано клиентов: ${rows.length}`);
  }

  function resetFilters() {
    setQuery(''); setCompany([]); setStatus([]); setTab('all'); setPage(1);
  }

  const allColumns: TableColumnConfig<Client>[] = [
    {
      id: 'name', name: 'Клиент', width: '26%', className: 'client-name-column', meta: {sort: true},
      template: (c) => <div className="client-identity">
        <span className={`client-avatar avatar-tone-${Number(c.id.replace(/\D/g, '').slice(-2)) % 6}`} aria-hidden="true">
          {c.name.split(' ').slice(0, 2).map((part) => part[0]).join('')}
        </span>
        <div className="client-text"><Button className="client-name" view="flat" onClick={() => openForm(c)}>{c.name}</Button><span className="client-role">{c.role || 'Контактное лицо'}</span></div>
      </div>,
    },
    {id: 'company', name: 'Компания', width: '18%', meta: {sort: true}, template: (c) => <span className="company-name">{c.company}</span>},
    {id: 'status', name: 'Статус', width: '15%', meta: {sort: true}, template: (c) => <StatusBadge status={c.status} />},
    {id: 'email', name: 'Email', width: '23%', meta: {sort: true}, template: (c) => <a className="email-link" href={`mailto:${c.email}`}>{c.email}</a>},
    {id: 'createdAt', name: 'Дата добавления', width: '16%', meta: {sort: true, defaultSortOrder: 'desc'}, template: (c) => <span className="date-value">{new Intl.DateTimeFormat('ru', {day: 'numeric', month: 'short', year: 'numeric'}).format(new Date(c.createdAt)).replace(' г.', '')}</span>},
    {
      id: 'actions', name: '', width: 40, align: 'center',
      template: (c) => <DropdownMenu defaultSwitcherProps={{'aria-label': `Действия: ${c.name}`, view: 'flat', size: 'm'}} items={[
        {text: 'Редактировать', action: () => openForm(c)},
        c.status === 'archived'
          ? {text: 'Восстановить', action: () => {setClients((items) => items.map((item) => item.id === c.id ? {...item, status: 'active'} : item)); setNotice('Клиент восстановлен');}}
          : {text: 'В архив', action: () => archiveClients([c.id])},
      ]} />,
    },
  ];
  const columns = allColumns.filter((c) => c.id === 'actions' || visibleColumns.includes(c.id));

  return <div className="app">
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span>orbit<span className="brand-period">.</span></span></div>
        <span className="topbar-divider" />
        <div className="workspace-crumb"><span className="workspace-avatar">S</span><span>Studio workspace</span><span className="workspace-plan">PRO</span></div>
        <div className="topbar-right"><span className="saved-indicator"><span />Все изменения сохранены</span>
          <Button view="flat" size="l" aria-label="Помощь" onClick={() => setHelpOpen(true)}><Icon data={CircleQuestion} size={20} /></Button>
          <DropdownMenu renderSwitcher={(props) => <Button {...props} view="flat" className="profile-button" aria-label="Меню профиля"><span className="profile-avatar">АК</span></Button>} items={[
            {text: 'Александр Козлов · Администратор', action: () => setNotice('Вы работаете в пространстве Studio с правами администратора')},
            {text: 'О рабочем пространстве', action: () => setHelpOpen(true)},
          ]} />
        </div>
      </div>
    </div>

    <main className="main-content">
      <div className="breadcrumbs"><span>Рабочее пространство</span><Icon data={ChevronRight} size={12} /><span>Клиенты</span></div>
      <div className="page-heading">
        <div><div className="title-line"><Text as="h1" variant="display-1">Клиенты</Text><span className="title-count">{counts.all}</span></div><Text as="p" variant="body-2" color="secondary" className="page-description">Все ваши контакты и компании — в одном месте.</Text></div>
        <div className="heading-actions"><Button view="outlined" size="l" onClick={exportClients} disabled={!filtered.length && !selectedIds.length}><Icon data={ArrowDownToLine} size={16} />Экспорт</Button><Button view="action" size="l" onClick={() => openForm()}><Icon data={Plus} size={16} />Добавить клиента</Button></div>
      </div>

      <section className="metrics" aria-label="Статистика клиентов">
        <div className="metric"><div className="metric-label">Всего клиентов<Icon data={Persons} size={17} /></div><div className="metric-value"><Text variant="display-1">{counts.all}</Text><span className="metric-note">в вашей базе</span></div></div>
        <div className="metric"><div className="metric-label">Активные<Icon data={CircleCheck} size={17} /></div><div className="metric-value"><Text variant="display-1">{counts.active}</Text><span className="metric-change"><span />{counts.all ? Math.round(counts.active / counts.all * 100) : 0}% от всех</span></div></div>
        <div className="metric"><div className="metric-label">Новые за месяц<Icon data={PersonPlus} size={17} /></div><div className="metric-value"><Text variant="display-1">{counts.recent}</Text><span className="metric-change"><Icon data={ArrowUpRight} size={14} />ноябрь 2026</span></div></div>
        <div className="metric"><div className="metric-label">В архиве<Icon data={Archive} size={17} /></div><div className="metric-value"><Text variant="display-1">{counts.archived}</Text><span className="metric-note">сохранены в истории</span></div></div>
      </section>

      <section className="table-card" aria-label="База клиентов">
        <div className="table-tabs" role="tablist" aria-label="Статус клиентов">
          {([{id: 'all', label: 'Все клиенты'}, {id: 'active', label: 'Активные'}, {id: 'inactive', label: 'Неактивные'}, {id: 'archived', label: 'Архив'}] as const).map((item) =>
            <Button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="clients-panel" view="flat" className={`table-tab ${tab === item.id ? 'table-tab--active' : ''}`} onClick={() => {setTab(item.id); setStatus([]); setPage(1);}}>{item.label}<span className="tab-count">{counts[item.id]}</span></Button>,
          )}
        </div>
        <div id="clients-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <div className="table-toolbar">
            <TextInput className="search-input" size="l" placeholder="Поиск по имени, компании или email" value={query} hasClear onUpdate={(v) => {setQuery(v); setPage(1);}} startContent={<span className="search-icon"><Icon data={Magnifier} size={17} /></span>} controlProps={{'aria-label': 'Поиск клиентов'}} />
            <div className="table-filters">
              <Select value={status} size="l" placeholder="Статус" hasClear options={statusOptions} onUpdate={(v) => {setStatus(v); setTab('all'); setPage(1);}} aria-label="Фильтр по статусу" renderControl={({triggerProps, ref}) => <Button {...triggerProps} ref={ref as React.Ref<HTMLButtonElement>} size="l" view="outlined" selected={Boolean(status.length)}><Icon data={Sliders} size={16} />{status.length ? statusLabels[status[0] as Status] : 'Статус'}<Icon data={ChevronDown} size={12} /></Button>} />
              <Select className="company-filter" size="l" placeholder="Компания" value={company} options={companies} hasClear filterable onUpdate={(v) => {setCompany(v); setPage(1);}} aria-label="Фильтр по компании" />
            </div>
            <div className="column-control"><DropdownMenu renderSwitcher={(props) => <Button {...props} view="outlined" size="l"><Icon data={LayoutColumns3} size={16} /><span className="columns-label">Колонки</span></Button>}>
              <div className="column-picker"><Text variant="subheader-1">Показать колонки</Text>{defaultColumns.map((id) => <Checkbox key={id} content={columnLabels[id]} checked={visibleColumns.includes(id)} disabled={id === 'name'} onUpdate={(checked) => setVisibleColumns((prev) => checked ? [...prev, id] : prev.filter((v) => v !== id))} />)}</div>
            </DropdownMenu></div>
          </div>
          {hasFilters && <div className="filter-summary"><span>Найдено клиентов: <strong>{filtered.length}</strong></span><Button view="flat" size="s" onClick={resetFilters}>Сбросить фильтры<Icon data={Xmark} size={12} /></Button></div>}
          {selectedIds.length > 0 && <div className="selection-toolbar"><span>Выбрано: <strong>{selectedIds.length}</strong></span><Button view="flat-info" size="s" disabled={!filtered.length} onClick={() => setSelectedIds((prev) => [...new Set([...prev, ...filtered.map((c) => c.id)])])}>Выбрать все {filtered.length}</Button><div className="selection-actions"><Button size="s" view="outlined" onClick={exportClients}><Icon data={ArrowDownToLine} size={14} />Экспорт</Button><Button size="s" view="outlined" onClick={() => archiveClients(selectedIds)}><Icon data={Archive} size={14} />В архив</Button><Button view="flat" size="s" aria-label="Снять выделение" onClick={() => setSelectedIds([])}><Icon data={Xmark} size={14} /></Button></div></div>}
          <div className="table-scroll">
            <ClientTable className="client-table" columns={columns} data={pageData} width="max" verticalAlign="middle" selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowDescriptor={(c) => ({id: c.id, interactive: true})} sortState={sortState} onSortStateChange={(v) => {setSortState(v); setPage(1);}} disableDataSorting emptyMessage="Клиенты не найдены" aria-label="Клиенты: сортировка и выбор строк" />
          </div>
          {!filtered.length && <div className="empty-state"><span className="empty-icon"><Icon data={Magnifier} size={28} /></span><Text variant="subheader-2">Пока ничего не нашлось</Text><Text color="secondary">Попробуйте другой запрос или измените фильтры.</Text><Button view="outlined" onClick={resetFilters}>Сбросить фильтры</Button></div>}
          <div className="table-footer"><div className="page-size"><span>Строк на странице</span><Select size="m" value={[String(pageSize)]} options={[10, 20, 50].map((n) => ({value: String(n), content: String(n)}))} onUpdate={(v) => {setPageSize(Number(v[0])); setPage(1);}} aria-label="Строк на странице" /><span className="range-info">{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} из {filtered.length}</span></div><Pagination page={currentPage} pageSize={pageSize} total={filtered.length} size="m" view="clear" onUpdate={(next) => setPage(next)} /></div>
        </div>
      </section>
      <div className="table-hint"><span><Icon data={CircleInfo} size={14} />Нажмите на название колонки, чтобы изменить сортировку</span><span>Создано для хороших отношений<span className="footer-orbit">orbit.</span></span></div>
    </main>

    <Modal open={formOpen} onOpenChange={setFormOpen} aria-labelledby="client-form-title" contentClassName="modal-content">
      <form className="client-form" onSubmit={(event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.company.trim() || !form.email.trim()) {setFormError('Заполните имя, компанию и email.'); return;}
        const values = {...form, name: form.name.trim(), company: form.company.trim(), email: form.email.trim(), role: form.role.trim()};
        if (editingId) setClients((prev) => prev.map((c) => c.id === editingId ? {...c, ...values} : c));
        else {
          setClients((prev) => [{...values, id: `client-${Date.now()}`, createdAt: new Date().toISOString()}, ...prev]);
          resetFilters(); setSortState([{column: 'createdAt', order: 'desc'}]);
        }
        setFormOpen(false); setNotice(editingId ? 'Изменения сохранены' : 'Клиент добавлен в вашу базу');
      }}>
        <div className="modal-heading"><div><Text as="h2" variant="header-1" id="client-form-title">{editingId ? 'Редактировать клиента' : 'Новый клиент'}</Text><Text as="p" color="secondary">Начните хорошие отношения с первого контакта.</Text></div><Button view="flat" aria-label="Закрыть" onClick={() => setFormOpen(false)}><Icon data={Xmark} size={18} /></Button></div>
        {([{id: 'name', label: 'Имя и фамилия', placeholder: 'Александр Иванов'}, {id: 'role', label: 'Должность', placeholder: 'Менеджер проектов'}, {id: 'company', label: 'Компания', placeholder: 'Название компании'}, {id: 'email', label: 'Email', placeholder: 'name@company.ru'}] as const).map((field) => <label className="form-field" key={field.id}><Text variant="body-2">{field.label}{field.id !== 'role' && <span className="required-mark"> *</span>}</Text><TextInput size="l" type={field.id === 'email' ? 'email' : 'text'} placeholder={field.placeholder} value={form[field.id]} onUpdate={(v) => setForm((prev) => ({...prev, [field.id]: v}))} controlProps={{required: field.id !== 'role', maxLength: 160}} /></label>)}
        <label className="form-field"><Text variant="body-2">Статус</Text><Select width="max" size="l" value={[form.status]} options={statusOptions} onUpdate={(v) => setForm((prev) => ({...prev, status: v[0] as Status}))} aria-label="Статус клиента" /></label>
        {formError && <Text color="danger" role="alert">{formError}</Text>}
        <div className="modal-actions"><Button size="l" view="outlined" onClick={() => setFormOpen(false)}>Отмена</Button><Button type="submit" view="action" size="l">{editingId ? 'Сохранить изменения' : 'Добавить клиента'}</Button></div>
      </form>
    </Modal>
    <Modal open={helpOpen} onOpenChange={setHelpOpen} contentClassName="modal-content" aria-labelledby="help-title"><div className="help-content"><div className="modal-heading"><Text as="h2" variant="header-1" id="help-title">Всё о вашей базе клиентов</Text><Button view="flat" aria-label="Закрыть помощь" onClick={() => setHelpOpen(false)}><Icon data={Xmark} size={18} /></Button></div><Text as="p" variant="body-2">Нажмите на заголовок колонки, чтобы отсортировать всю базу. Повторное нажатие меняет направление; Shift позволяет сортировать по нескольким колонкам.</Text><Text as="p" variant="body-2">Выделяйте клиентов чекбоксами для экспорта и архивации. Выбор сохраняется при переходе между страницами. Чекбокс в заголовке выбирает текущую страницу.</Text><Text as="p" variant="body-2">Данные сохраняются в этом браузере. Для резервной копии используйте экспорт в CSV.</Text><Button view="action" size="l" onClick={() => setHelpOpen(false)}>Всё понятно</Button></div></Modal>
    {notice && <div className="notification" role="status"><span className="notification-icon"><Icon data={CircleCheck} size={19} /></span>{notice}<Button view="flat" size="s" aria-label="Закрыть уведомление" onClick={() => setNotice('')}><Icon data={Xmark} size={14} /></Button></div>}
  </div>;
}
