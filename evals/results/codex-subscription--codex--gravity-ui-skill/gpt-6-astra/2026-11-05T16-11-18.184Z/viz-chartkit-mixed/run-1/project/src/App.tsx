import {useEffect, useMemo, useState} from 'react';
import {AsideHeader} from '@gravity-ui/navigation';
import {Button, Icon, Modal, SegmentedRadioGroup, Select, Switch, Text, ThemeProvider, configure} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, ArrowsExpand, ArrowsRotateRight, Bell, Bookmark, BookmarkFill, Calendar, ChartColumn, ChartLine, ChevronRight, CircleCheck, CircleInfo, CircleQuestion, Database, Gear, LayoutCells, Moon, Pulse, Sliders, Sun, Xmark} from '@gravity-ui/icons';
import {VisualizationWidget} from './VisualizationWidget';
import {date, END, exportCsv, monitoringData, number, salesData, sum} from './data';
import type {Metric, Mode} from './data';
import './styles.css';

configure({lang: 'ru'});
function BrandMark() {
  return <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="10" fill="currentColor"/><path d="M8 19V13M13.3 23V9M18.7 20V12M24 17V15" stroke="var(--g-color-text-brand-contrast)" strokeWidth="3" strokeLinecap="round"/></svg>;
}
type Panel = 'settings' | 'help' | 'source' | 'notifications' | null;

export function App() {
  const [mode, setMode] = useState<Mode>('sales');
  const [days, setDays] = useState('30');
  const [hours, setHours] = useState('6');
  const [metric, setMetric] = useState<Metric>('revenue');
  const [granularity, setGranularity] = useState('day');
  const [compare, setCompare] = useState(true);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 10000) * 10000);
  const [updated, setUpdated] = useState(() => new Date());
  const [panel, setPanel] = useState<Panel>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [dark, setDark] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const isSales = mode === 'sales';
  const unit = isSales ? metric === 'orders' ? 'шт.' : '₽' : 'мс';

  useEffect(() => {
    if (mode !== 'monitoring' || !live) return;
    const timer = setInterval(() => {setNow(Math.floor(Date.now() / 10000) * 10000); setUpdated(new Date());}, 5000);
    return () => clearInterval(timer);
  }, [mode, live]);
  useEffect(() => {if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer);}, [notice]);
  useEffect(() => {if (!refreshing) return; const timer = setTimeout(() => setRefreshing(false), 550); return () => clearTimeout(timer);}, [refreshing]);

  const allSeries = useMemo(() => isSales ? salesData(Number(days), metric, granularity === 'week') : monitoringData(Number(hours), now), [isSales, days, metric, granularity, hours, now]);
  const series = useMemo(() => compare ? allSeries : allSeries.slice(0, 1), [allSeries, compare]);
  const sales = useMemo(() => salesData(Number(days), 'revenue'), [days]);
  const orderData = useMemo(() => salesData(Number(days), 'orders'), [days]);
  const total = sum(sales[0].points);
  const orders = sum(orderData[0].points);
  const growth = (total / sum(sales[1].points) - 1) * 100;
  const monitoringPoints = allSeries[0].points;
  const mean = sum(monitoringPoints) / monitoringPoints.length;
  const p95 = [...monitoringPoints].sort((a, b) => a.value - b.value)[Math.floor(monitoringPoints.length * 0.95)].value;
  const peak = Math.max(...monitoringPoints.map(p => p.value));
  const best = sales[0].points.reduce((a, b) => a.value > b.value ? a : b);
  const period = isSales ? `${date(END - (Number(days) - 1) * 86400000)} – ${date(END)} 2026` : `Последние ${hours} ${hours === '1' ? 'час' : hours === '24' ? 'часа' : 'часов'}`;
  const averageChange = (total / orders / (sum(sales[1].points) / sum(orderData[1].points)) - 1) * 100;
  const stats = isSales ? [
    {label: 'Общая выручка', value: `${number(total)} ₽`, change: `+${number(growth, 1)}%`, note: 'к прошлому периоду'},
    {label: 'Заказы', value: number(orders), change: `+${number((orders / sum(orderData[1].points) - 1) * 100, 1)}%`, note: 'к прошлому периоду'},
    {label: 'Средний чек', value: `${number(total / orders)} ₽`, change: `${averageChange >= 0 ? '+' : ''}${number(averageChange, 1)}%`, note: 'к прошлому периоду'},
    {label: 'В среднем за день', value: `${number(total / Number(days))} ₽`, change: `+${number(growth, 1)}%`, note: 'к прошлому периоду'},
  ] : [
    {label: 'Среднее время ответа', value: `${number(mean)} мс`, change: 'В норме', note: 'порог — 300 мс'},
    {label: '95-й перцентиль', value: `${number(p95)} мс`, change: p95 < 300 ? 'В норме' : 'Выше порога', note: '95% запросов быстрее'},
    {label: 'Пиковое значение', value: `${number(peak)} мс`, change: 'За период', note: 'максимальное значение'},
    {label: 'Точки данных', value: number(monitoringPoints.length), change: '10 сек', note: 'интервал измерения'},
  ];
  const refresh = () => {setNow(Math.floor(Date.now() / 10000) * 10000); setUpdated(new Date()); setRefreshing(true); setNotice('Демонстрационные данные обновлены');};
  const changeMode = (value: string) => {setMode(value as Mode);};
  const download = () => {exportCsv(series, mode, unit); setNotice('CSV-файл подготовлен');};

  const chartCard = <section className={`chart-card ${fullscreen ? 'chart-card-expanded' : ''}`} aria-label="Виджет аналитики">
    <div className="widget-tabs-row">
      <SegmentedRadioGroup size="l" value={mode} onUpdate={changeMode} className="mode-switch" aria-label="Режим визуализации">
        <SegmentedRadioGroup.Option value="sales"><span className="icon-label"><Icon data={ChartLine} size={17}/>Продажи</span></SegmentedRadioGroup.Option>
        <SegmentedRadioGroup.Option value="monitoring"><span className="icon-label"><Icon data={Pulse} size={17}/>Мониторинг</span></SegmentedRadioGroup.Option>
      </SegmentedRadioGroup>
      <div className="data-status"><span className="status-dot"/>Данные актуальны<span className="status-divider"/><Button view="flat" size="s" title={fullscreen ? 'Свернуть' : 'Развернуть график'} aria-label={fullscreen ? 'Свернуть график' : 'Развернуть график'} onClick={() => setFullscreen(!fullscreen)}><Icon data={fullscreen ? Xmark : ArrowsExpand} size={16}/></Button></div>
    </div>
    <div className="widget-body">
      <div className="chart-heading-row"><div><Text variant="subheader-3" as="h2">{isSales ? 'Динамика продаж' : 'Мониторинг производительности'}</Text><p className="subtle chart-subtitle">{isSales ? 'Каждая точка — шаг к пониманию вашего бизнеса' : 'Время ответа API и состояние сервиса в реальном времени'}</p></div><div className="chart-heading-actions"><span className="demo-badge">Демо</span><Button view="flat" size="m" title="Настройки виджета" aria-label="Настройки виджета" onClick={() => setPanel('settings')}><Icon data={Sliders} size={18}/></Button></div></div>
      <div className="metrics">{stats.map((s, i) => <div className={`metric ${i === 0 ? 'metric-primary' : ''}`} key={s.label}><div className="metric-label">{s.label}<Icon data={CircleInfo} size={13}/></div><Text variant="display-1" className="metric-value">{s.value}</Text><div className="metric-bottom"><span className={`metric-change ${s.change.startsWith('-') ? 'metric-change-negative' : ''}`}>{isSales && !s.change.startsWith('-') && <Icon data={ArrowUpRight} size={12}/>} {s.change}</span><span className="metric-note">{s.note}</span></div></div>)}</div>
      <div className="chart-toolbar"><div className="toolbar-start"><Select size="m" aria-label="Показатель" value={[isSales ? metric : 'latency']} onUpdate={v => setMetric(v[0] as Metric)} options={isSales ? [{value:'revenue',content:'Выручка'}, {value:'orders',content:'Заказы'}, {value:'average',content:'Средний чек'}] : [{value:'latency',content:'Время ответа'}]}/><span className="toolbar-separator"/>{isSales ? <Select size="m" aria-label="Группировка" value={[granularity]} onUpdate={v => setGranularity(v[0])} options={[{value:'day',content:'По дням'},{value:'week',content:'По неделям'}]}/> : <span className="subtle">Шаг: 10 секунд</span>}</div><div className="toolbar-end"><SegmentedRadioGroup value={isSales ? days : hours} onUpdate={isSales ? setDays : setHours} size="m" aria-label="Период" options={isSales ? [{value:'7',content:'7 дней'},{value:'30',content:'30 дней'},{value:'90',content:'90 дней'}] : [{value:'1',content:'1 час'},{value:'6',content:'6 часов'},{value:'24',content:'24 часа'}]}/><div className="date-range"><Icon data={Calendar} size={15}/>{period}</div></div></div>
      <div className="chart-unit">{isSales ? metric === 'orders' ? 'Заказы, шт.' : metric === 'average' ? 'Средний чек, ₽' : 'Выручка, ₽' : 'Время ответа, мс'}</div>
      <div className="plot-area"><VisualizationWidget mode={mode} series={series} unit={unit} loading={refreshing}/></div>
      <div className="chart-legend"><span className="legend-item"><span className="legend-line"/>{allSeries[0].name}</span>{compare && <span className="legend-item"><span className="legend-line legend-previous"/>{allSeries[1].name}</span>}</div>
    </div>
    <div className="widget-footer"><div className="icon-label"><Icon data={CircleInfo} size={15}/><span>{isSales ? `${number(allSeries[0].points.length)} точек · ${granularity === 'week' ? 'Недельная' : 'Дневная'} детализация` : `${number(monitoringPoints.length)} точек · Выделите область для увеличения`}</span></div><Switch size="m" checked={compare} onUpdate={setCompare}>{isSales ? 'Сравнить с прошлым периодом' : 'Показать базовый уровень'}</Switch></div>
  </section>;

  return <ThemeProvider theme={dark ? 'dark' : 'light'}><div className="app-shell"><AsideHeader compact hideCollapseButton headerDecoration={false} className="navigation" logo={{text:'pulse', icon:BrandMark, iconSize:34, iconClassName:'brand-mark', 'aria-label':'Pulse — аналитика', onClick:() => changeMode('sales')}} menuItems={[
    {id:'overview',title:'Обзор аналитики',icon:LayoutCells,current:true,onItemClick:() => changeMode('sales'),className:'nav-overview'},
    {id:'sales',title:'Продажи',icon:ChartColumn,onItemClick:() => changeMode('sales')},
    {id:'monitoring',title:'Мониторинг',icon:Pulse,onItemClick:() => changeMode('monitoring')},
    {id:'sources',title:'Источники данных',icon:Database,onItemClick:() => setPanel('source')},
  ]} renderFooter={() => <div className="nav-footer"><Button view="flat" title="Справка" aria-label="Справка" onClick={() => setPanel('help')}><Icon data={CircleQuestion} size={20}/></Button><Button view="flat" title="Настройки" aria-label="Настройки" onClick={() => setPanel('settings')}><Icon data={Gear} size={20}/></Button><div className="nav-avatar" title="Рабочее пространство Аналитика">А</div></div>} renderContent={() => <div className="workspace">
    <header className="topbar"><div className="topbar-left"><span className="wordmark">pulse<span>.</span></span><span className="topbar-divider"/><span className="workspace-name">Рабочее пространство</span><Icon data={ChevronRight} size={13}/><span className="breadcrumb-current">Аналитика</span></div><div className="topbar-right"><span className="environment"><span className="status-dot"/>Все системы работают</span><Button view="flat" aria-label="Уведомления" title="Уведомления" onClick={() => setPanel('notifications')}><Icon data={Bell} size={18}/></Button><div className="profile-avatar">АК</div></div></header>
    <main className="main-content"><div className="page-heading"><div><div className="eyebrow">ВАШ БИЗНЕС В ЦИФРАХ</div><Text as="h1" variant="display-2">Обзор аналитики</Text><p className="page-description">Вся картина в одном месте. От продаж до состояния систем.</p></div><div className="page-actions"><Button size="l" view="outlined" title={saved ? 'Удалить из избранного' : 'Сохранить виджет'} aria-label={saved ? 'Удалить из избранного' : 'Сохранить виджет'} selected={saved} onClick={() => {setSaved(!saved); setNotice(saved ? 'Виджет удалён из избранного' : 'Виджет добавлен в избранное');}}><Icon data={saved ? BookmarkFill : Bookmark} size={17}/></Button><Button size="l" view="action" onClick={download}><Icon data={ArrowDownToLine} size={16}/>Экспорт данных</Button></div></div>
    <div className="overview-bar"><div className="overview-label"><Icon data={LayoutCells} size={15}/><span>Обзор</span><span className="count-badge">1 виджет</span></div><div className="refresh-controls"><span className="update-time">Обновлено в {updated.toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit',timeZone:'UTC'})}</span>{!isSales && <Switch checked={live} onUpdate={setLive} size="s">Авто</Switch>}<Button view="flat" size="s" title="Обновить данные" aria-label="Обновить данные" loading={refreshing} onClick={refresh}><Icon data={ArrowsRotateRight} size={15}/></Button></div></div>
    {!fullscreen && chartCard}
    <div className="bottom-panels"><section className="insight-panel"><div className="insight-icon"><Icon data={isSales ? ChartLine : Pulse} size={21}/></div><div className="insight-copy"><div className="insight-heading">{isSales ? 'Хороший темп. Продолжайте в том же духе.' : 'Сервис работает стабильно.'}<span className="insight-tag">{isSales ? 'Рост продаж' : 'Состояние системы'}</span></div><p>{isSales ? <>Выручка выросла на <strong>{number(growth, 1)}%</strong> относительно прошлого периода.<br/>Лучший день — <strong>{date(best.timestamp)}</strong>: {number(best.value)} ₽.</> : <>Среднее время ответа — <strong>{number(mean)} мс</strong>, при целевом пороге 300 мс.<br/>За выбранный период собрано {number(monitoringPoints.length)} измерений.</>}</p></div><span className="insight-decoration" aria-hidden="true">↗</span></section><section className="source-panel"><div className="source-panel-top"><span className="source-icon"><Icon data={Database} size={17}/></span><span>Источник данных</span><span className="connected"><span className="status-dot"/>Подключён</span></div><div className="source-panel-bottom"><div><strong>{isSales ? 'Магазин · Основной' : 'API · Production'}</strong><span>Демонстрационный набор данных</span></div><Button view="flat" size="s" aria-label="Открыть источник данных" title="Открыть источник данных" onClick={() => setPanel('source')}><Icon data={ChevronRight} size={17}/></Button></div></section></div>
    <footer className="page-footer"><span>Меньше шума. Больше ясности.</span><span><span className="footer-pulse">pulse</span> analytics <span className="footer-dot">·</span> Время в UTC</span></footer>
    </main></div>}/></div>
    <Modal open={fullscreen} onClose={() => setFullscreen(false)} contentClassName="expanded-modal" aria-label="График на весь экран">{fullscreen && chartCard}</Modal>
    <Modal open={panel !== null} onClose={() => setPanel(null)} aria-label="Информация о виджете"><div className="info-modal"><div className="modal-heading"><Text variant="header-1">{panel === 'settings' ? 'Настройки виджета' : panel === 'source' ? 'Источник данных' : panel === 'notifications' ? 'Уведомления' : 'Как пользоваться виджетом'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setPanel(null)}><Icon data={Xmark}/></Button></div>
      {panel === 'settings' ? <><div className="settings-row"><span className="icon-label"><Icon data={dark ? Moon : Sun}/>Тёмная тема</span><Switch checked={dark} onUpdate={setDark}/></div><div className="settings-row"><div>Автообновление мониторинга<p className="subtle">Проверять данные каждые 5 секунд</p></div><Switch checked={live} onUpdate={setLive}/></div><div className="settings-row"><span>Сравнение периодов</span><Switch checked={compare} onUpdate={setCompare}/></div></> : panel === 'source' ? <><div className="modal-status"><Icon data={CircleCheck} size={20}/>Демонстрационный источник активен</div><p>Виджет использует локальные демонстрационные данные. Продажи доступны за 7, 30 и 90 дней. Мониторинг генерирует измерения с шагом 10 секунд и обновляет окно каждые 5 секунд.</p><dl className="source-details"><dt>Источник</dt><dd>{isSales ? 'Магазин · Основной' : 'API · Production'}</dd><dt>Часовой пояс</dt><dd>UTC</dd><dt>Точек в текущем ряду</dt><dd>{number(allSeries[0].points.length)}</dd></dl><Button view="action" onClick={download}><Icon data={ArrowDownToLine}/>Скачать текущие данные</Button></> : panel === 'notifications' ? <div className="notification-content"><Icon data={CircleCheck} size={32}/><Text variant="subheader-2">Всё под контролем</Text><p className="subtle">Новых уведомлений нет. Демонстрационные данные доступны в обоих режимах.</p></div> : <><p>Переключайтесь между продажами и мониторингом в верхней части виджета.</p><ul className="help-list"><li>Выберите период и показатель для анализа.</li><li>Наведите курсор на график, чтобы увидеть точные значения.</li><li>Включите сравнение с предыдущим периодом.</li><li>В мониторинге выделите участок графика для увеличения. Двойной щелчок сбрасывает масштаб.</li><li>Кнопка «Экспорт данных» сохраняет серии в CSV.</li></ul></>}
    </div></Modal>
    {notice && <div className="toast" role="status"><Icon data={CircleCheck} size={18}/>{notice}<Button view="flat" size="s" onClick={() => setNotice('')} aria-label="Закрыть уведомление"><Icon data={Xmark} size={14}/></Button></div>}
  </ThemeProvider>;
}
