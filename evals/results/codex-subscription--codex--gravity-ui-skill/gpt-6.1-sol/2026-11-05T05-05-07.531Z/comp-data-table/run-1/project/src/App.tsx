import {useMemo, useState} from 'react';
import {
  Avatar, Button, DropdownMenu, Icon, Label, Modal, Pagination, Select,
  Table, Tab, TabList, Text, TextInput, withTableSelection, withTableSorting,
  type TableColumnConfig, type TableSortState,
} from '@gravity-ui/uikit';
import {
  ArrowDownToLine, ArrowUpRight, Bell, Check, ChevronDown, ChevronRight,
  CircleCheck, CircleInfo, CircleQuestion, Ellipsis, Magnifier, Moon,
  PersonPlus, Persons, Plus, Sliders, Xmark,
} from '@gravity-ui/icons';
import {initialClients, filterAndSort, type Client, type ClientStatus, statusLabels} from './clients';
import './App.css';

const ClientTable = withTableSorting(withTableSelection<Client>(Table));
const money = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
const statusThemes = {active: 'success', new: 'info', archived: 'normal'} as const;
const avatarColors = ['utility', 'info', 'warning', 'positive', 'misc'] as const;

function ClientAvatar({client}: {client: Client}) {
  const color = avatarColors[Number(client.id.replace(/\D/g, '')) % avatarColors.length];
  return <Avatar size="s" text={client.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
    backgroundColor={`var(--g-color-base-${color}-light)`} color={`var(--g-color-text-${color})`} />;
}

export function App({theme, onToggleTheme}: {theme: 'light' | 'dark'; onToggleTheme: () => void}) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [month, setMonth] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<TableSortState>([{column: 'created', order: 'desc'}]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [dialog, setDialog] = useState<'add' | 'help' | null>(null);
  const [detail, setDetail] = useState<Client | null>(null);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({name: '', email: '', company: '', city: 'Москва', status: 'new'});
  const [formError, setFormError] = useState('');

  const counts = useMemo(() => ({all: clients.length, active: clients.filter(c => c.status === 'active').length,
    new: clients.filter(c => c.status === 'new').length, archived: clients.filter(c => c.status === 'archived').length}), [clients]);
  const filtered = useMemo(() => filterAndSort(clients, {query, status, city, month}, sort), [clients, query, status, city, month, sort]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / pageSize)));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const extraFilterCount = Number(city !== 'all') + Number(month !== 'all');

  function resetFilters() {setQuery(''); setStatus('all'); setCity('all'); setMonth('all'); setPage(1);}
  function changeStatus(value: string) {setStatus(value); setPage(1);}
  function exportCsv(ids?: string[]) {
    const rows = ids ? clients.filter(c => ids.includes(c.id)) : selected.length ? clients.filter(c => selected.includes(c.id)) : filtered;
    const safeCell = (value: unknown) => {
      const text = String(value);
      return `"${(/^[=+@\-]/.test(text) ? "'" : '') + text.replaceAll('"', '""')}"`;
    };
    const csv = [['Имя', 'Email', 'Компания', 'Статус', 'Город', 'Дата добавления', 'Выручка'],
      ...rows.map(c => [c.name, c.email, c.company, statusLabels[c.status], c.city, c.created, c.revenue])]
      .map(row => row.map(safeCell).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], {type: 'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href = url; a.download = 'orbit-clients.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`CSV-файл готов: ${rows.length} записей`);
  }
  function openAdd() {setForm({name: '', email: '', company: '', city: 'Москва', status: 'new'}); setFormError(''); setDialog('add');}
  function addClient(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.company.trim() || !form.city.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Укажите имя, компанию, город и корректный email.'); return;
    }
    if (clients.some(c => c.email.toLowerCase() === form.email.trim().toLowerCase())) {setFormError('Клиент с таким email уже существует.'); return;}
    setClients(previous => [{...form, name: form.name.trim(), email: form.email.trim(), company: form.company.trim(), city: form.city.trim(),
      status: form.status as ClientStatus, id: `client-${Date.now()}`, created: new Date().toISOString().slice(0, 10), revenue: 0}, ...previous]);
    resetFilters(); setSort([{column: 'created', order: 'desc'}]); setDialog(null); setNotice('Клиент добавлен в вашу базу');
  }
  function toggleColumn(id: string) {setHiddenColumns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);}

  const columns: TableColumnConfig<Client>[] = [
    {id: 'name', name: 'Клиент', width: '25%', className: 'client-cell name-column', meta: {sort: true},
      template: client => <div className="client-person"><ClientAvatar client={client}/><div className="person-copy"><span className="person-name">{client.name}</span><span className="person-email">{client.email}</span></div></div>},
    {id: 'company', name: 'Компания', width: '19%', className: 'client-cell', meta: {sort: true}, template: client => <span className="company-name">{client.company}</span>},
    {id: 'status', name: 'Статус', width: '15%', className: 'client-cell', meta: {sort: true},
      template: client => <Label size="s" theme={statusThemes[client.status]} icon={<span className="status-dot"/>}>{statusLabels[client.status]}</Label>},
    {id: 'city', name: 'Город', width: '14%', className: 'client-cell city-column', meta: {sort: true}},
    {id: 'created', name: 'Дата добавления', width: '17%', className: 'client-cell date-column', meta: {sort: true}, template: client => dateFormat.format(new Date(client.created))},
    {id: 'revenue', name: 'Выручка', align: 'end', width: '12%', className: 'client-cell revenue-column', meta: {sort: true}, template: client => <span className="money">{money.format(client.revenue)} <span className="ruble">₽</span></span>},
    {id: 'actions', name: '', className: 'client-cell action-column', template: client => <DropdownMenu
      icon={<Icon data={Ellipsis} size={18}/>} defaultSwitcherProps={{'aria-label': `Действия: ${client.name}`, view: 'flat', size: 's'}}
      items={[
        {text: 'Карточка клиента', action: () => setDetail(client)},
        {text: 'Экспортировать клиента', action: () => exportCsv([client.id])},
        {text: client.status === 'archived' ? 'Восстановить из архива' : 'Переместить в архив', action: () => {
          setClients(prev => prev.map(c => c.id === client.id ? {...c, status: c.status === 'archived' ? 'active' : 'archived'} : c));
          setNotice(client.status === 'archived' ? 'Клиент восстановлен' : 'Клиент перемещён в архив');
        }},
      ]}/>},
  ];

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-symbol" aria-hidden="true"><i/><i/><i/><i/></span><span>orbit<span className="brand-period">.</span></span></div>
      <span className="topbar-divider"/>
      <DropdownMenu renderSwitcher={props => <Button {...props} view="flat" size="l" className="workspace-button"><span className="workspace-letter">S</span> Studio workspace <Icon data={ChevronDown} size={12}/></Button>}
        items={[{text: 'Studio workspace · текущее пространство', action: () => setNotice('Вы находитесь в пространстве Studio workspace')}]}/>
      <Label size="xs" theme="normal" className="plan-label">PRO</Label>
      <div className="topbar-right">
        <Button view="flat" size="l" onClick={() => setDialog('help')} aria-label="Помощь"><Icon data={CircleQuestion} size={19}/></Button>
        <DropdownMenu icon={<span className="notification-icon"><Icon data={Bell} size={19}/><i/></span>}
          defaultSwitcherProps={{view: 'flat', size: 'l', 'aria-label': 'Уведомления'}}
          items={[{text: 'Все изменения сохранены в текущей сессии', action: () => setNotice('Новых уведомлений нет')}]}/>
        <span className="topbar-divider"/>
        <DropdownMenu renderSwitcher={props => <Button {...props} view="flat" size="l" aria-label="Меню профиля"><Avatar size="s" text="АК" backgroundColor="var(--g-color-base-warning-light)" color="var(--g-color-text-warning-heavy)"/><Icon data={ChevronDown} size={12}/></Button>}
          items={[{text: 'Александра Ким · Администратор', action: () => setNotice('Вы вошли как Александра Ким')},
            {text: theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему', iconStart: <Icon data={Moon} size={16}/>, action: onToggleTheme}]}/>
      </div>
    </header>

    <main className="main">
      <div className="breadcrumbs"><Icon data={Persons} size={14}/><span>Рабочее пространство</span><Icon data={ChevronRight} size={12}/><span className="breadcrumb-current">Клиенты</span></div>
      <div className="page-heading">
        <div><div className="heading-line"><Text as="h1" variant="display-2">Клиенты</Text><span className="total-badge">{counts.all}</span></div><Text as="p" variant="body-2" color="secondary">Вся информация о ваших клиентах в одном месте.</Text></div>
        <div className="page-actions"><Button view="outlined" size="l" onClick={() => exportCsv()} disabled={!filtered.length && !selected.length}><Icon data={ArrowDownToLine} size={16}/> Экспорт</Button><Button view="action" size="l" onClick={openAdd}><Icon data={Plus} size={16}/> Добавить клиента</Button></div>
      </div>

      <section className="stats" aria-label="Статистика клиентов">
        <div className="stat-card"><div className="stat-content"><span className="stat-label">Всего клиентов</span><div className="stat-number"><Text variant="display-2">{counts.all}</Text><span className="stat-change"><Icon data={ArrowUpRight} size={13}/> +8</span></div><span className="stat-caption">по сравнению с прошлым месяцем</span></div><span className="stat-icon stat-icon-neutral"><Icon data={Persons} size={21}/></span></div>
        <div className="stat-card"><div className="stat-content"><span className="stat-label">Активные клиенты</span><div className="stat-number"><Text variant="display-2">{counts.active}</Text><span className="stat-percent">{Math.round(counts.active / Math.max(counts.all, 1) * 100)}% от всех</span></div><span className="stat-caption">Поддерживаем связь и растём вместе</span></div><span className="stat-icon stat-icon-green"><Icon data={CircleCheck} size={21}/></span></div>
        <div className="stat-card"><div className="stat-content"><span className="stat-label">Новые клиенты</span><div className="stat-number"><Text variant="display-2">{counts.new}</Text><span className="new-badge">Знакомимся</span></div><span className="stat-caption">В начале большого сотрудничества</span></div><span className="stat-icon stat-icon-orange"><Icon data={PersonPlus} size={21}/></span></div>
      </section>

      <section className="table-panel" aria-label="База клиентов">
        <div className="table-tabs"><TabList size="l" value={status} onUpdate={changeStatus} contentOverflow="scroll" aria-label="Статус клиента" className="client-tabs">
          <Tab value="all">Все клиенты <span className="tab-count">{counts.all}</span></Tab>
          <Tab value="active">Активные <span className="tab-count">{counts.active}</span></Tab>
          <Tab value="new">Новые <span className="tab-count">{counts.new}</span></Tab>
          <Tab value="archived">Архив <span className="tab-count">{counts.archived}</span></Tab>
        </TabList><span className="table-live"><i/> Обновлено только что</span></div>

        <div className="table-toolbar"><TextInput className="search" size="l" hasClear value={query} onUpdate={value => {setQuery(value); setPage(1);}} placeholder="Поиск по имени, email или компании" startContent={<Icon data={Magnifier} size={17}/>} controlProps={{'aria-label': 'Поиск клиентов'}}/>
          <div className="toolbar-actions"><Button size="l" view="outlined" selected={filtersOpen || extraFilterCount > 0} onClick={() => setFiltersOpen(!filtersOpen)}><Icon data={Sliders} size={16}/> Фильтры {extraFilterCount > 0 && <span className="filter-count">{extraFilterCount}</span>}</Button>
          <DropdownMenu renderSwitcher={props => <Button {...props} size="l" view="outlined"><span className="columns-icon" aria-hidden="true">▥</span> Столбцы <Icon data={ChevronDown} size={12}/></Button>}
            items={columns.filter(c => !['name', 'actions'].includes(c.id)).map(c => ({text: c.name as string, iconStart: !hiddenColumns.includes(c.id) ? <Icon data={Check} size={14}/> : <span style={{width: 14}}/>, action: () => toggleColumn(c.id)}))}/></div>
        </div>

        {filtersOpen && <div className="expanded-filters"><Select size="m" aria-label="Фильтр по городу" label="Город:" value={[city]} onUpdate={value => {setCity(value[0]); setPage(1);}} options={[{value: 'all', content: 'Любой'}, ...Array.from(new Set(clients.map(c => c.city))).sort().map(value => ({value, content: value}))]}/><Select size="m" aria-label="Фильтр по дате добавления" label="Добавлены:" value={[month]} onUpdate={value => {setMonth(value[0]); setPage(1);}} options={[{value: 'all', content: 'За всё время'}, {value: '2026-11', content: 'Ноябрь 2026'}, {value: '2026-10', content: 'Октябрь 2026'}, {value: '2026-09', content: 'Сентябрь 2026'}]}/><Button view="flat-secondary" size="m" onClick={resetFilters}>Сбросить фильтры</Button></div>}

        {selected.length > 0 && <div className="selection-bar"><span><strong>Выбрано всего: {selected.length}</strong><span className="selection-divider">·</span>В списке: {filtered.length}</span><div><Button size="s" view="flat" onClick={() => setSelected(prev => Array.from(new Set([...prev, ...filtered.map(c => c.id)])))}>Выбрать все найденные</Button><Button size="s" view="outlined" onClick={() => exportCsv()}><Icon data={ArrowDownToLine} size={14}/> Экспорт</Button><Button size="s" view="flat" onClick={() => setSelected([])} aria-label="Снять выделение"><Icon data={Xmark} size={16}/></Button></div></div>}

        <div className="table-scroll"><ClientTable className="client-table" width="max" verticalAlign="middle" data={visible} columns={columns.filter(c => !hiddenColumns.includes(c.id))} getRowDescriptor={client => ({id: client.id, interactive: true})}
          onRowClick={(client, _index, event) => {if (!(event.target as Element).closest('button, a, input, [role="menu"]')) setDetail(client);}}
          selectedIds={selected} onSelectionChange={setSelected} sortState={sort} disableDataSorting onSortStateChange={value => {setSort(value); setPage(1);}} emptyMessage="Клиенты не найдены. Попробуйте изменить запрос или фильтры."/></div>
        {filtered.length === 0 && <div className="empty-actions"><Button view="outlined" onClick={resetFilters}>Сбросить поиск и фильтры</Button></div>}

        <div className="table-footer"><span className="results-count">Показано <strong>{filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)}</strong> из <strong>{filtered.length}</strong></span><div className="pagination-area"><div className="page-size"><span>На странице</span><Select aria-label="Количество строк на странице" size="m" value={[String(pageSize)]} onUpdate={value => {setPageSize(Number(value[0])); setPage(1);}} options={[10, 20, 50].map(value => ({value: String(value), content: String(value)}))}/></div><Pagination page={currentPage} pageSize={pageSize} total={filtered.length} size="m" compact view="clear" onUpdate={(next, size) => {setPage(next); setPageSize(size);}}/></div></div>
      </section>

      <div className="page-footnote"><span><Icon data={CircleInfo} size={14}/> Нажмите на заголовок столбца, чтобы изменить сортировку.</span><span>Демонстрационные данные</span></div>
      <footer className="footer"><span className="footer-brand">orbit.</span><span>Больше порядка. Ближе к клиентам.</span><span className="footer-end">Сделано для вашей команды</span></footer>
    </main>

    {notice && <div className="notice" role="status"><Icon data={CircleCheck} size={18}/><span>{notice}</span><Button size="s" view="flat" onClick={() => setNotice('')} aria-label="Закрыть уведомление"><Icon data={Xmark} size={14}/></Button></div>}

    <Modal open={dialog !== null} onClose={() => setDialog(null)} aria-label={dialog === 'add' ? 'Добавить клиента' : 'Помощь'}>
      <div className="dialog"><div className="dialog-heading"><Text variant="header-2">{dialog === 'add' ? 'Новый клиент' : 'Всё под рукой'}</Text><Button view="flat" onClick={() => setDialog(null)} aria-label="Закрыть окно"><Icon data={Xmark} size={18}/></Button></div>
        {dialog === 'add' ? <form onSubmit={addClient}><Text as="p" color="secondary" variant="body-2">Начните знакомство — добавьте клиента в вашу базу.</Text>
          <label className="form-field">Имя и фамилия<TextInput size="l" autoFocus value={form.name} onUpdate={name => setForm({...form, name})} placeholder="Например, Анна Смирнова" controlProps={{required: true}}/></label>
          <label className="form-field">Email<TextInput size="l" type="email" value={form.email} onUpdate={email => setForm({...form, email})} placeholder="anna@company.ru" controlProps={{required: true}}/></label>
          <label className="form-field">Компания<TextInput size="l" value={form.company} onUpdate={company => setForm({...form, company})} placeholder="Название компании" controlProps={{required: true}}/></label>
          <div className="form-columns"><label className="form-field">Город<TextInput size="l" value={form.city} onUpdate={cityValue => setForm({...form, city: cityValue})} controlProps={{required: true}}/></label><div className="form-field"><span id="status-field-label">Статус</span><Select size="l" width="max" aria-labelledby="status-field-label" value={[form.status]} onUpdate={value => setForm({...form, status: value[0]})} options={Object.entries(statusLabels).map(([value, content]) => ({value, content}))}/></div></div>
          {formError && <Text as="p" color="danger" role="alert">{formError}</Text>}<div className="dialog-actions"><Button size="l" view="outlined" onClick={() => setDialog(null)}>Отмена</Button><Button size="l" view="action" type="submit"><Icon data={Plus} size={16}/> Добавить клиента</Button></div>
        </form> : <div className="help-content"><Text as="p" variant="body-2">Управляйте клиентской базой в одном пространстве.</Text><p>Нажмите на заголовок столбца для сортировки. Повторное нажатие меняет направление. Удерживайте Shift для сортировки по нескольким столбцам.</p><p>Чекбокс в заголовке выделяет текущую страницу. Выбранные строки сохраняются при переходах между страницами. Кнопка «Выбрать все найденные» выделяет весь результат поиска.</p><p>Экспорт сохраняет выбранных клиентов, а если выделения нет — весь отфильтрованный список. Данные демонстрационные; изменения действуют до перезагрузки страницы.</p><Button view="action" size="l" onClick={() => setDialog(null)}>Всё понятно</Button></div>}
      </div>
    </Modal>
    <Modal open={detail !== null} onClose={() => setDetail(null)} aria-label="Карточка клиента"><div className="dialog">{detail && <><div className="dialog-heading"><Text variant="header-2">Карточка клиента</Text><Button view="flat" onClick={() => setDetail(null)} aria-label="Закрыть карточку"><Icon data={Xmark} size={18}/></Button></div><div className="detail-name"><ClientAvatar client={detail}/><Text variant="header-1">{detail.name}</Text></div><dl className="detail-list"><dt>Email</dt><dd>{detail.email}</dd><dt>Компания</dt><dd>{detail.company}</dd><dt>Город</dt><dd>{detail.city}</dd><dt>Статус</dt><dd><Label theme={statusThemes[detail.status]}>{statusLabels[detail.status]}</Label></dd><dt>Дата добавления</dt><dd>{dateFormat.format(new Date(detail.created))}</dd><dt>Выручка</dt><dd>{money.format(detail.revenue)} ₽</dd></dl><Button view="outlined" size="l" onClick={() => exportCsv([detail.id])}><Icon data={ArrowDownToLine} size={16}/> Экспортировать клиента</Button></>}</div></Modal>
  </div>;
}
