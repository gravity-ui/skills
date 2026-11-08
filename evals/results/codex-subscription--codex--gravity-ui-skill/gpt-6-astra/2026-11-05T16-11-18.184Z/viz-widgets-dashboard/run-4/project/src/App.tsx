import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Button, Icon, Text, Select, DropdownMenu, Modal, TextInput, TextArea, Table, configure} from '@gravity-ui/uikit';
import {AsideHeader} from '@gravity-ui/navigation';
import {DashKit, type PluginWidgetProps} from '@gravity-ui/dashkit';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {LayoutCells, ChartColumn, ChartLine, ChartPie, Persons, Database, Gear, CircleQuestion, Plus, Sliders, Calendar, ArrowDownToLine, ArrowUpRight, ArrowDownRight, ArrowChevronRight, ArrowChevronDown, Bell, Magnifier, Ellipsis, Grip, Check, Xmark, Copy, TrashBin, ShoppingBag, Wallet, Target, FileText, ArrowRotateLeft, ArrowRight, CircleInfo} from '@gravity-ui/icons';
import {initialConfig, readConfig, moveWidget, readPreference, STORAGE_KEY, widgetCatalog, PERIODS, formatNumber, formatMoney, orders, type DashboardConfig, type WidgetKind} from './dashboard';
import './styles.css';

configure({lang: 'ru'});
DashKit.setSettings({gridLayout: {cols: 12, rowHeight: 8, margin: [16, 16], containerPadding: [0, 0], compactType: 'vertical'}, isMobile: false});

const widgetIcons = {revenue: Wallet, orders: ShoppingBag, customers: Persons, conversion: ChartLine, trend: ChartLine, traffic: ChartPie, transactions: ShoppingBag, goal: Target, note: FileText};
const purple = 'var(--g-color-base-brand)';
const palette = [purple, 'var(--g-color-infographics-lavender)', 'var(--g-color-infographics-blue)', 'var(--g-color-infographics-soft)'];
const activity = [26, 34, 30, 42, 35, 29, 32, 38, 52, 61, 47, 44, 49, 37, 42, 59, 71, 76, 61, 55, 64, 75, 66, 74, 91, 86, 79, 88, 82, 97, 94];
const previous = [19, 22, 27, 24, 30, 28, 21, 30, 33, 41, 35, 32, 39, 31, 37, 43, 47, 54, 48, 43, 53, 57, 51, 53, 64, 58, 54, 65, 58, 70, 67];

type DashboardContextValue = {
  period: string; tab: string; edit: boolean; remove: (id: string) => void; duplicate: (id: string) => void;
  move: (id: string, direction: -1 | 1) => void; openOrders: () => void; updateNote: (id: string, text: string) => void;
};
const DashboardContext = createContext<DashboardContextValue>({period: 'month', tab: 'overview', edit: false, remove: () => {}, duplicate: () => {}, move: () => {}, openOrders: () => {}, updateNote: () => {}});

function Glyph({data, size = 18}: {data: typeof Plus; size?: number}) { return <Icon data={data} size={size}/>; }
function IconButton({icon, label, onClick, className = ''}: {icon: typeof Plus; label: string; onClick?: () => void; className?: string}) {
  return <Button view="flat" size="m" aria-label={label} title={label} onClick={onClick} className={className}><Glyph data={icon}/></Button>;
}
function Sparkline({index, negative = false}: {index: number; negative?: boolean}) {
  const data = useMemo<ChartData>(() => ({
    chart: {margin: {top: 4, bottom: 2, left: 0, right: 0}}, legend: {enabled: false},
    xAxis: {visible: false}, yAxis: [{visible: false}], tooltip: {enabled: false},
    series: {data: [{type: 'area', name: 'Динамика', data: activity.filter((_, i) => i % 2 === 0).map((y, x) => ({x, y: negative ? 110 - y + (x % 3) * 12 : y + Math.sin(x + index) * 15})), color: negative ? 'var(--g-color-text-warning)' : 'var(--g-color-text-positive)', opacity: 0.07, lineWidth: 1.7}]},
  }), [index, negative]);
  return <div className="sparkline" aria-hidden="true"><Chart data={data}/></div>;
}
function Widget({id, data}: PluginWidgetProps) {
  const ctx = useContext(DashboardContext);
  const kind = data.kind as WidgetKind;
  const meta = widgetCatalog.find((w) => w.kind === kind)!;
  const factor = PERIODS.find((p) => p.value === ctx.period)!.factor;
  const isMetric = ['revenue', 'orders', 'customers', 'conversion'].includes(kind);
  const [granularity, setGranularity] = useState('days');
  const chartData = useMemo<ChartData>(() => {
    const audience = ctx.tab === 'audience';
    const values = ctx.period === 'week' ? activity.slice(-7) : activity;
    const oldValues = ctx.period === 'week' ? previous.slice(-7) : previous;
    const summarize = (arr: number[]) => granularity === 'weeks' ? Array.from({length: Math.ceil(arr.length / 7)}, (_, i) => arr.slice(i * 7, i * 7 + 7).reduce((s, n) => s + n, 0)) : arr;
    const seriesPoints = (arr: number[]) => summarize(arr).map((y, x) => ({x, y: Math.round(y * (audience ? 4.8 : ctx.tab === 'sales' ? 0.8 : 1) * (ctx.period === 'quarter' ? 2.84 : 1))}));
    const length = summarize(values).length;
    return {
      chart: {margin: {top: 12, right: 8, bottom: 0, left: 0}}, legend: {enabled: false},
      xAxis: {type: 'category', categories: Array.from({length}, (_, i) => granularity === 'weeks' ? `Нед. ${i + 1}` : ctx.period === 'quarter' ? new Date(2026, 7, 1 + i * 3).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}) : `${i + (ctx.period === 'week' ? 25 : 1)} окт.`), grid: {enabled: false}, ticks: {pixelInterval: 85}, labels: {style: {fontSize: '11px', fontColor: 'var(--g-color-text-secondary)'}}},
      yAxis: [{min: 0, max: granularity === 'weeks' ? undefined : audience ? 500 : ctx.period === 'quarter' ? 300 : 100, grid: {enabled: true}, ticks: {pixelInterval: 48}, labels: {style: {fontSize: '11px', fontColor: 'var(--g-color-text-secondary)'}}, title: {text: ''}}],
      series: {data: [
        {type: 'area', name: 'Текущий период', data: seriesPoints(values), color: purple, opacity: 0.055, lineWidth: 2.5},
        {type: 'line', name: 'Предыдущий период', data: seriesPoints(oldValues), color: 'var(--g-color-infographics-lavender)', dashStyle: 'Dash', lineWidth: 2, interpolation: {type: 'monotone'}},
      ]},
    };
  }, [ctx.period, ctx.tab, granularity]);
  const pieData = useMemo<ChartData>(() => ({
    chart: {margin: {top: 0, bottom: 0, left: 0, right: 0}}, legend: {enabled: false},
    series: {data: [{type: 'pie', name: 'Источники', innerRadius: '78%', borderWidth: 3, borderColor: 'var(--g-color-base-background)', dataLabels: {enabled: false}, data: ['Прямые переходы', 'Поиск', 'Социальные сети', 'Другое'].map((name, i) => ({name, value: [42, 28, 18, 12][i], color: palette[i]}))}]},
  }), []);
  const menu = <DropdownMenu size="s" defaultSwitcherProps={{view: 'flat', 'aria-label': `Действия: ${meta.title}`}} items={[
    {text: 'Дублировать', iconStart: <Glyph data={Copy} size={15}/>, action: () => ctx.duplicate(id)},
    ...(ctx.edit ? [{text: 'Переместить раньше', action: () => ctx.move(id, -1)}, {text: 'Переместить позже', action: () => ctx.move(id, 1)}] : []),
    {text: 'Удалить виджет', theme: 'danger' as const, iconStart: <Glyph data={TrashBin} size={15}/>, action: () => ctx.remove(id)},
  ]}/>;
  const title = kind === 'trend' && ctx.tab === 'audience' ? 'Динамика посетителей' : kind === 'trend' && ctx.tab === 'sales' ? 'Динамика заказов' : meta.title;
  const metricValues: Record<string, string> = {revenue: formatMoney(1284500 * factor), orders: formatNumber(Math.round(1482 * factor)), customers: formatNumber(Math.round(864 * factor)), conversion: ctx.period === 'week' ? '3,48%' : ctx.period === 'quarter' ? '3,12%' : '3,24%'};
  return <section className={`widget widget-${kind} ${ctx.edit ? 'widget-editable' : ''}`} aria-label={meta.title}>
    <div className="widget-header">
      <div className="widget-drag-handle" title={ctx.edit ? 'Перетащите виджет' : undefined}>
        {isMetric && <span className="metric-icon"><Glyph data={widgetIcons[kind]} size={17}/></span>}
        <Text variant={isMetric ? 'body-2' : 'subheader-2'}>{title}</Text>
      </div>
      <div className="widget-header-actions">{ctx.edit && <span className="widget-drag-handle grip"><Glyph data={Grip} size={16}/></span>}{menu}</div>
    </div>
    {isMetric && <div className="metric-body">
      <Text variant="display-1" className="metric-value">{metricValues[kind]}</Text>
      <div className="metric-bottom"><span className={`change ${kind === 'conversion' ? 'negative' : ''}`}><Glyph data={kind === 'conversion' ? ArrowDownRight : ArrowUpRight} size={13}/>{({revenue: '12,8%', orders: '8,2%', customers: '16,4%', conversion: '0,6%'} as Record<string, string>)[kind]}</span><span className="comparison">к прошлому периоду</span></div>
      <Sparkline index={['revenue', 'orders', 'customers', 'conversion'].indexOf(kind)} negative={kind === 'conversion'}/>
    </div>}
    {kind === 'trend' && <>
      <div className="trend-summary"><div><Text variant="header-2">{ctx.tab === 'audience' ? formatNumber(Math.round(45740 * factor)) : ctx.tab === 'sales' ? formatNumber(Math.round(1482 * factor)) : formatMoney(1284500 * factor)}</Text><span className="trend-growth"><Glyph data={ArrowUpRight} size={13}/>12,8%</span><div className="muted small">{ctx.tab === 'audience' ? 'посетителей за выбранный период' : ctx.tab === 'sales' ? 'заказов за выбранный период' : 'Общая выручка за период'}</div></div><Select size="s" value={[granularity]} onUpdate={([v]) => setGranularity(v)} options={[{value: 'days', content: 'По дням'}, {value: 'weeks', content: 'По неделям'}]} aria-label="Группировка графика"/></div>
      <div className="chart-unit">{ctx.tab === 'audience' ? 'посетители' : ctx.tab === 'sales' ? 'заказы' : 'тыс. ₽'}</div>
      <div className="revenue-chart"><Chart data={chartData}/></div>
      <div className="chart-legend"><span><i className="legend-line"/>Текущий период</span><span><i className="legend-line previous"/>Предыдущий период</span></div>
    </>}
    {kind === 'traffic' && <>
      <div className="donut-container"><Chart data={pieData}/><div className="donut-center"><Text variant="header-1">{formatNumber(Math.round(45740 * factor))}</Text><span className="muted small">посетителей</span></div></div>
      <div className="traffic-legend">{['Прямые переходы', 'Поиск', 'Социальные сети', 'Другое'].map((s, i) => <div key={s}><span><i style={{background: palette[i]}}/>{s}</span><strong>{[42, 28, 18, 12][i]}<span className="muted">%</span></strong></div>)}</div>
    </>}
    {kind === 'transactions' && <>
      <div className="table-description muted small">Последние поступления в вашем магазине</div>
      <div className="orders-table-wrap"><OrdersTable compact/></div>
      <div className="widget-table-footer"><span className="muted small">Показано 4 из {formatNumber(Math.round(1482 * factor))} заказов</span><Button view="flat" size="s" onClick={ctx.openOrders} className="text-brand">Все заказы <Glyph data={ArrowRight} size={14}/></Button></div>
    </>}
    {kind === 'goal' && <div className="goal-content"><div className="goal-label"><span className="goal-icon"><Glyph data={Target} size={23}/></span><div><Text variant="subheader-1">План по выручке</Text><div className="muted small">Октябрь 2026</div></div><span className="goal-percentage">86<span>%</span></span></div><div className="goal-value"><Text variant="header-1">1 284 500 ₽</Text><span className="muted">из 1 500 000 ₽</span></div><div className="progress-track" role="progressbar" aria-label="План по выручке" aria-valuenow={86} aria-valuemin={0} aria-valuemax={100}><div style={{width: '85.63%'}}/></div><div className="goal-ticks"><span>0 ₽</span><span>1 500 000 ₽</span></div><div className="goal-insight"><span>✦</span><div><strong>Отличный темп!</strong><p>До цели осталось 215 500 ₽.<br/>Вы на 12% опережаете прошлый месяц.</p></div></div></div>}
    {kind === 'note' && <div className="note-content"><TextArea value={typeof data.text === 'string' ? data.text : ''} onUpdate={(text) => ctx.updateNote(id, text)} placeholder="Запишите важное для команды…" minRows={4}/><span className="muted small">Заметка сохраняется автоматически</span></div>}
  </section>;
}
const widgetPlugin = {type: 'pulse-widget', defaultLayout: {w: 4, h: 12, minW: 3, minH: 6}, renderer: (props: PluginWidgetProps) => <Widget {...props}/>};
if (import.meta.hot?.data.pulseRegistered) DashKit.reloadPlugins(widgetPlugin);
else DashKit.registerPlugins(widgetPlugin);
if (import.meta.hot) import.meta.hot.dispose((data) => { data.pulseRegistered = true; });

function OrdersTable({compact = false, query = ''}: {compact?: boolean; query?: string}) {
  const rows = (compact ? orders.slice(0, 4) : orders).filter((o) => `${o.id} ${o.name} ${o.status}`.toLowerCase().includes(query.toLowerCase()));
  return <Table className="orders-table" width="max" data={rows} emptyMessage="Заказы не найдены" columns={[
    {id: 'id', name: 'Заказ', template: (o) => <span className="order-id">{o.id}</span>},
    {id: 'name', name: 'Клиент', template: (o) => <div className="customer-cell"><span className={`customer-avatar ${o.color}`}>{o.initials}</span><span>{o.name}</span></div>},
    ...(!compact ? [{id: 'product', name: 'Продукт'}] : []),
    {id: 'amount', name: 'Сумма', template: (o) => <span className="order-amount">{formatMoney(o.amount)}</span>},
    {id: 'status', name: 'Статус', template: (o) => <span className={`status-pill ${o.status === 'Оплачен' ? 'paid' : o.status === 'Возврат' ? 'refund' : 'pending'}`}><i/>{o.status}</span>},
  ]}/>;
}
function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.innerWidth < 760);
  useEffect(() => {const m = window.matchMedia('(max-width: 759px)'); const change = () => setNarrow(m.matches); m.addEventListener('change', change); return () => m.removeEventListener('change', change);}, []);
  return narrow;
}

export function App() {
  const narrow = useNarrow();
  const [compact, setCompact] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(() => {try {return readConfig(localStorage.getItem(STORAGE_KEY));} catch {return initialConfig();}});
  const [edit, setEdit] = useState(false);
  const snapshot = useRef(config);
  const [period, setPeriod] = useState('month');
  const [tab, setTab] = useState('overview');
  const [activePage, setActivePage] = useState('dashboard');
  const [modal, setModal] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [notificationRead, setNotificationRead] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [title, setTitle] = useState(() => readPreference('title', 'Обзор бизнеса'));
  const [teamName, setTeamName] = useState(() => readPreference('teamName', 'Команда Пульс'));
  const [savedAt, setSavedAt] = useState('Все изменения сохранены');
  useEffect(() => {try {localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); localStorage.setItem('pulse-preferences-v1', JSON.stringify({title, teamName})); setStorageError(false);} catch {setStorageError(true);}}, [config, title, teamName]);
  useEffect(() => {if (!toast) return; const t = setTimeout(() => setToast(''), 3800); return () => clearTimeout(t);}, [toast]);
  useMemo(() => {DashKit.setSettings({isMobile: narrow});}, [narrow]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {e.preventDefault(); setSearch(''); setModal('search');}};
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  const openModal = (name: string) => {setSearch(''); setModal(name);};
  const addWidget = (kind: WidgetKind) => {
    const meta = widgetCatalog.find((w) => w.kind === kind)!;
    setConfig((c) => DashKit.setItem({config: c, item: {type: 'pulse-widget', namespace: 'default', data: {kind}, layout: {x: 0, y: Math.max(0, ...c.layout.map((l) => l.y + l.h)), w: meta.w, h: meta.h}}}));
    setToast(`Виджет «${meta.title}» добавлен`);
  };
  const remove = (id: string) => {setConfig((c) => DashKit.removeItem({id, config: c, itemsStateAndParams: {}}).config); setToast('Виджет удалён. Его можно вернуть из каталога.');};
  const duplicate = (id: string) => {setConfig((c) => {const item = c.items.find((i) => i.id === id)!; const l = c.layout.find((l) => l.i === id)!; return DashKit.setItem({config: c, item: {type: item.type, namespace: item.namespace, data: {...item.data}, layout: {w: l.w, h: l.h, x: 0, y: Math.max(...c.layout.map((l) => l.y + l.h))}}});}); setToast('Копия виджета добавлена в конец дашборда');};
  const move = (id: string, direction: -1 | 1) => setConfig((c) => moveWidget(c, id, direction));
  const startEdit = () => {snapshot.current = config; setEdit(true);};
  const finishEdit = () => {setEdit(false); setToast('Раскладка сохранена');};
  const resetLayout = () => {setConfig(initialConfig()); setModal(null); setToast('Исходная раскладка восстановлена');};
  const exportData = () => {
    const p = PERIODS.find((p) => p.value === period)!;
    const content = `\uFEFFПериод;Показатель;Значение\r\n${p.content};Выручка;${Math.round(1284500 * p.factor)}\r\n${p.content};Заказы;${Math.round(1482 * p.factor)}\r\n${p.content};Новые клиенты;${Math.round(864 * p.factor)}\r\n${p.content};Конверсия;${period === 'week' ? '3,48%' : period === 'quarter' ? '3,12%' : '3,24%'}`;
    const url = URL.createObjectURL(new Blob([content], {type: 'text/csv;charset=utf-8;'})); const a = document.createElement('a'); a.href = url; a.download = `pulse-report-${period}.csv`; a.click(); URL.revokeObjectURL(url); setToast('Отчёт сохранён в CSV');
  };
  const ctx: DashboardContextValue = {period, tab, edit, remove, duplicate, move, openOrders: () => openModal('orders'), updateNote: (id, text) => setConfig((c) => {const item = c.items.find((i) => i.id === id)!; return DashKit.setItem({config: c, item: {...item, data: {...item.data, text}}});})};
  const navItems = [
    {id: 'dashboard', title: 'Дашборды', icon: LayoutCells},
    {id: 'analytics', title: 'Аналитика', icon: ChartColumn},
    {id: 'reports', title: 'Отчёты', icon: FileText},
    {id: 'sources', title: 'Источники данных', icon: Database},
  ].map((item) => ({...item, current: activePage === item.id, onItemClick: () => {if (item.id === 'dashboard') {setActivePage(item.id); setTab('overview');} else if (item.id === 'analytics') {setActivePage(item.id); setTab('sales');} else {openModal(item.id);}}}));
  const modalTitles: Record<string, string> = {catalog: 'Добавить виджет', orders: 'Все заказы', settings: 'Настройки дашборда', help: 'Ваш дашборд — ваши правила', team: 'Ваша команда', reports: 'Отчёты', sources: 'Источники данных', notifications: 'Уведомления', reset: 'Восстановить раскладку?', search: 'Поиск по дашборду'};
  const catalogResults = widgetCatalog.filter((w) => `${w.title} ${w.description}`.toLowerCase().includes(search.toLowerCase()));
  return <DashboardContext.Provider value={ctx}>
    <AsideHeader className="app-shell" compact={narrow || compact} onChangeCompact={setCompact} hideCollapseButton={narrow} hideSectionDividers headerDecoration={false}
      logo={{text: () => <span className="brand-name">пульс<span className="brand-dot">.</span></span>, icon: ChartColumn, iconSize: 25, iconClassName: 'brand-icon', onClick: () => {setActivePage('dashboard'); setTab('overview');}}}
      aboveMenuContent={!compact && !narrow ? <div className="sidebar-workspace"><Button view="outlined" width="max" size="xl" onClick={() => openModal('team')} className="workspace-button"><span className="workspace-letter">П</span><span className="workspace-text">{teamName}<span>Рабочее пространство</span></span><Glyph data={ArrowChevronDown} size={12}/></Button><div className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</div></div> : null}
      menuItems={navItems}
      renderFooter={({compact: isCompact}) => <div className="sidebar-footer">{!isCompact && <div className="sidebar-tip"><span className="tip-icon"><Glyph data={LayoutCells} size={20}/></span><Text variant="subheader-1">Всё важное — под рукой</Text><p>Добавляйте виджеты и создавайте дашборд под свои задачи.</p><Button view="outlined" width="max" size="m" onClick={() => openModal('catalog')}>Настроить дашборд <Glyph data={ArrowUpRight} size={13}/></Button></div>}<Button view="flat" width="max" onClick={() => openModal('settings')} className="footer-nav"><Glyph data={Gear}/>{!isCompact && 'Настройки'}</Button><Button view="flat" width="max" onClick={() => openModal('help')} className="footer-nav"><Glyph data={CircleQuestion}/>{!isCompact && 'Помощь и поддержка'}</Button><div className="sidebar-profile"><span className="user-avatar">АК</span>{!isCompact && <><span className="profile-text"><strong>Александр Ким</strong><span>Личный аккаунт</span></span><IconButton icon={Ellipsis} label="Аккаунт" onClick={() => openModal('team')}/></>}</div></div>}
      renderContent={() => <div className="main-shell">
        <header className="topbar"><div className="breadcrumb"><Glyph data={LayoutCells} size={17}/><span>Дашборды</span><Glyph data={ArrowChevronRight} size={12}/><strong>{title}</strong></div><div className="topbar-actions"><Button view="flat" size="m" onClick={() => openModal('search')} className="search-button"><Glyph data={Magnifier} size={17}/><span>Поиск</span><kbd>⌘ K</kbd></Button><span className="topbar-divider"/><div className="notification-button"><IconButton icon={Bell} label="Уведомления" onClick={() => {openModal('notifications'); setNotificationRead(true);}}/>{!notificationRead && <i/>}</div><span className="user-avatar topbar-avatar" title="Александр Ким">АК</span></div></header>
        <main className="dashboard-main">
          <div className="page-heading"><div><div className="title-line"><Text variant="display-1" as="h1">{title}</Text><span className="personal-badge">Мой дашборд</span></div><p className="page-description">Вся картина вашего бизнеса. В одном месте.</p></div><div className="heading-actions">{edit ? <><Button view="outlined" size="l" onClick={() => {setConfig(snapshot.current); setEdit(false);}}>Отмена</Button><Button view="action" size="l" onClick={finishEdit}><Glyph data={Check} size={16}/>Готово</Button></> : <><Button view="outlined" size="l" onClick={startEdit}><Glyph data={Sliders} size={16}/>Настроить</Button><Button view="action" size="l" onClick={() => openModal('catalog')}><Glyph data={Plus} size={17}/>Добавить виджет</Button></>}</div></div>
          <div className="dashboard-toolbar"><div className="dashboard-tabs" role="tablist" aria-label="Раздел аналитики">{[{id: 'overview', text: 'Обзор'}, {id: 'sales', text: 'Продажи'}, {id: 'audience', text: 'Аудитория'}].map((t) => <Button key={t.id} view="flat" role="tab" aria-selected={tab === t.id} className={`dashboard-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.text}</Button>)}</div><div className="filter-actions"><div className="period-select"><Glyph data={Calendar} size={15}/><Select value={[period]} onUpdate={([v]) => setPeriod(v)} options={PERIODS} size="m" view="clear" aria-label="Период аналитики"/></div><Button view="outlined" size="m" onClick={exportData}><Glyph data={ArrowDownToLine} size={15}/><span className="export-label">Экспорт</span></Button></div></div>
          <div className={`dashboard-status ${edit ? 'is-editing' : ''}`}><div>{edit ? <><Glyph data={Grip} size={15}/><span>{narrow ? 'Меняйте порядок виджетов через меню ⋯' : 'Перетаскивайте виджеты за заголовок и меняйте размер за угол'}</span></> : <><span className="live-dot"/><span>Данные обновлены сегодня в 14:35</span><span className="demo-label">Демо-данные</span></>}</div><span className="save-status"><Glyph data={storageError ? CircleInfo : Check} size={13}/>{storageError ? 'Не удалось сохранить в браузере' : edit ? 'Режим настройки' : savedAt}</span></div>
          {config.items.length ? <div className={`dashboard-grid ${edit ? 'editing-grid' : ''} ${narrow ? 'mobile-grid' : ''}`}><DashKit key={narrow ? 'mobile' : 'desktop'} config={config} editMode={edit && !narrow} noOverlay draggableHandleClassName="widget-drag-handle" onChange={({config: next}) => {setConfig(next); setSavedAt('Все изменения сохранены');}}/></div> : <div className="empty-dashboard"><Glyph data={LayoutCells} size={40}/><Text variant="header-1">Здесь начинается ваш дашборд</Text><p>Добавьте первый виджет, чтобы видеть важное.</p><Button view="action" size="l" onClick={() => openModal('catalog')}><Glyph data={Plus}/>Добавить виджет</Button></div>}
          <div className="dashboard-bottom"><span><Glyph data={Grip} size={14}/>Ваш дашборд, ваши правила. Расположите виджеты так, как удобно вам.</span><Button view="flat" size="s" onClick={startEdit}>Настроить раскладку <Glyph data={ArrowRight} size={13}/></Button></div>
        </main>
      </div>}/>
    <Modal open={modal !== null} onClose={() => setModal(null)} aria-label={modal ? modalTitles[modal] : ''} contentClassName={`app-modal ${modal === 'orders' ? 'wide-modal' : ''}`}>
      <div className="modal-header"><Text variant="header-1">{modal ? modalTitles[modal] : ''}</Text><IconButton icon={Xmark} label="Закрыть" onClick={() => setModal(null)}/></div>
      {(modal === 'catalog' || modal === 'search') && <><p className="modal-description">Выберите, что хотите видеть на своём дашборде.</p><TextInput value={search} onUpdate={setSearch} placeholder="Найти виджет…" startContent={<Glyph data={Magnifier} size={17}/>} size="l" hasClear autoFocus/><div className="catalog-list">{catalogResults.length ? catalogResults.map((w) => <div className="catalog-item" key={w.kind}><span className="catalog-icon"><Glyph data={widgetIcons[w.kind]} size={21}/></span><div><Text variant="subheader-1">{w.title}</Text><p>{w.description}</p></div><Button view="outlined" size="m" aria-label={`Добавить: ${w.title}`} onClick={() => addWidget(w.kind)}><Glyph data={Plus} size={17}/></Button></div>) : <p className="empty-results">Ничего не найдено. Попробуйте другой запрос.</p>}</div><div className="modal-bottom"><span className="muted">На дашборде: {config.items.length} виджетов</span><Button view="action" onClick={() => setModal(null)}>Готово</Button></div></>}
      {modal === 'orders' && <><p className="modal-description">Последние заказы · октябрь 2026</p><TextInput placeholder="Поиск по клиенту, номеру или статусу" value={search} onUpdate={setSearch} hasClear size="l" startContent={<Glyph data={Magnifier} size={17}/>}/><div className="modal-orders"><OrdersTable query={search}/></div><Button view="outlined" onClick={exportData}><Glyph data={ArrowDownToLine} size={16}/>Экспорт сводки за период</Button></>}
      {modal === 'settings' && <div className="settings-content"><label>Название дашборда<TextInput value={title} onUpdate={setTitle} size="l" placeholder="Обзор бизнеса"/></label><p className="muted">Расположение виджетов и заметки сохраняются в этом браузере автоматически.</p><div className="setting-row"><div><strong>Исходная раскладка</strong><p className="muted">Вернуть восемь стандартных виджетов</p></div><Button view="outlined" onClick={() => setModal('reset')}><Glyph data={ArrowRotateLeft} size={16}/>Восстановить</Button></div><Button view="action" onClick={() => {if (!title.trim()) setTitle('Обзор бизнеса'); setModal(null); setToast('Настройки применены');}}>Готово</Button></div>}
      {modal === 'reset' && <><p className="modal-description">Текущая раскладка, дополнительные виджеты и заметки будут заменены стандартным набором.</p><div className="modal-bottom"><Button view="outlined" onClick={() => setModal('settings')}>Отмена</Button><Button view="action" onClick={resetLayout}>Восстановить</Button></div></>}
      {modal === 'help' && <div className="help-content"><div><span>1</span><div><Text variant="subheader-2">Выберите важное</Text><p>Откройте «Добавить виджет» и выберите показатели, графики или заметки.</p></div></div><div><span>2</span><div><Text variant="subheader-2">Расположите по-своему</Text><p>Нажмите «Настроить». Перетаскивайте виджеты за заголовок, а за нижний правый угол — изменяйте размер. Через меню ⋯ можно перемещать виджеты с клавиатуры.</p></div></div><div><span>3</span><div><Text variant="subheader-2">Возвращайтесь к своей картине</Text><p>Раскладка сохраняется в вашем браузере. Кнопка «Отмена» вернёт расположение до начала настройки.</p></div></div><Button view="action" onClick={() => {setModal(null); startEdit();}}>Настроить мой дашборд</Button></div>}
      {modal === 'team' && <div className="settings-content"><label>Рабочее пространство<TextInput size="l" value={teamName} onUpdate={setTeamName}/></label><div className="team-member"><span className="user-avatar">АК</span><div><strong>Александр Ким</strong><p className="muted">Владелец рабочего пространства</p></div><span className="personal-badge">Вы</span></div><p className="muted">Локальное рабочее пространство. Ваши настройки доступны в этом браузере.</p><Button view="action" onClick={() => {if (!teamName.trim()) setTeamName('Команда Пульс'); setModal(null);}}>Сохранить</Button></div>}
      {modal === 'reports' && <div className="settings-content"><p className="muted">Сводка ключевых показателей за выбранный период.</p><Select options={PERIODS} value={[period]} onUpdate={([v]) => setPeriod(v)} size="l" width="max"/><div className="report-preview"><Glyph data={FileText} size={30}/><div><strong>Обзор бизнеса</strong><p className="muted">Выручка, заказы, клиенты и конверсия · CSV</p></div></div><Button view="action" onClick={exportData}><Glyph data={ArrowDownToLine} size={16}/>Скачать отчёт</Button></div>}
      {modal === 'sources' && <div className="settings-content"><div className="source-card"><span className="catalog-icon"><Glyph data={Database} size={24}/></span><div><Text variant="subheader-2">Демонстрационный магазин</Text><p className="muted">Заказы, клиенты и веб-аналитика</p></div><span className="status-pill paid"><i/>Подключён</span></div><p className="muted">Дашборд использует встроенный набор демонстрационных данных. Внешние сервисы не подключены.</p><Button view="outlined" onClick={() => {setSavedAt('Демо-данные актуальны'); setToast('Демонстрационный набор обновлён'); setModal(null);}}>Обновить данные</Button></div>}
      {modal === 'notifications' && <div className="notifications"><div className="notification-item"><span className="catalog-icon"><Glyph data={Target} size={22}/></span><div><Text variant="subheader-1">Вы близки к цели!</Text><p>План по выручке за октябрь выполнен на 86%.</p><small className="muted">Сегодня, 14:35</small></div></div><div className="notification-item"><span className="catalog-icon"><Glyph data={Check} size={22}/></span><div><Text variant="subheader-1">Данные обновлены</Text><p>Сводка по заказам и клиентам готова к просмотру.</p><small className="muted">Сегодня, 14:35</small></div></div></div>}
    </Modal>
    {toast && <div className="app-toast" role="status"><span className="toast-icon"><Glyph data={Check} size={17}/></span>{toast}<IconButton icon={Xmark} label="Закрыть уведомление" onClick={() => setToast('')}/></div>}
  </DashboardContext.Provider>;
}
