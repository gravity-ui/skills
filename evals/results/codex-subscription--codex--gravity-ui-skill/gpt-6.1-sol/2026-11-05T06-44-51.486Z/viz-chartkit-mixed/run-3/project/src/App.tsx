import {useEffect, useMemo, useState} from 'react';
import {Button, Dialog, DropdownMenu, Icon, SegmentedRadioGroup, Select, Switch, Text, ThemeProvider, Tooltip} from '@gravity-ui/uikit';
import {ArrowDownRight, ArrowDownToLine, ArrowRight, ArrowUpRight, Calendar, ChartLine, Check, ChevronDown, ChevronRight, CircleInfo, Clock, Ellipsis, Layers, Moon, Pulse, Sliders, Sun} from '@gravity-ui/icons';
import {VisualizationWidget} from './components/VisualizationWidget';
import {createDataset, formatNumber, getSummary, type ChartMode} from './data';
import './styles.css';

export function App() {
  const [mode, setMode] = useState<ChartMode>('sales');
  const [salesPeriod, setSalesPeriod] = useState('30');
  const [monitorPeriod, setMonitorPeriod] = useState('6');
  const [compare, setCompare] = useState(true);
  const [live, setLive] = useState(false);
  const [tick, setTick] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [markers, setMarkers] = useState(false);
  const [dark, setDark] = useState(false);
  const [exported, setExported] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState('Только что');
  const period = mode === 'sales' ? salesPeriod : monitorPeriod;
  const dataset = useMemo(() => createDataset(mode, Number(period), tick), [mode, period, tick]);
  const summary = useMemo(() => getSummary(dataset), [dataset]);
  const isSales = mode === 'sales';
  const orders = Math.round(summary.total / 3480);
  const previousOrders = Math.round(summary.previousTotal / 3350);
  const orderChange = (orders / previousOrders - 1) * 100;
  const averageCheckChange = ((summary.total / orders) / (summary.previousTotal / previousOrders) - 1) * 100;
  const money = (value: number) => `${formatNumber(value)} ₽`;
  const dateLabel = isSales
    ? `${new Date(dataset.timeline[0]).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'})} — 30 сен 2026`
    : `Последние ${period === '1' ? '60 минут' : `${period} часов`}`;

  useEffect(() => {
    if (!live || mode !== 'monitoring') return;
    const timer = window.setInterval(() => {setTick(value => value + 1); setRefreshedAt(new Date().toLocaleTimeString('ru-RU'));}, 6000);
    return () => window.clearInterval(timer);
  }, [live, mode]);

  const exportData = () => {
    const rows = [['Время', isSales ? 'Выручка, ₽' : 'Время ответа, мс', ...(compare ? ['Предыдущий период'] : [])],
      ...dataset.timeline.map((time, index) => [new Date(time).toISOString(), dataset.current[index], ...(compare ? [dataset.previous[index]] : [])])];
    const blob = new Blob(['\uFEFF' + rows.map(row => row.join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `pulse-${mode}-${period}.csv`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true); window.setTimeout(() => setExported(false), 2500);
  };

  return <ThemeProvider theme={dark ? 'dark' : 'light'}>
    <div className="app-shell">
      <header className="app-header">
        <a className="wordmark" href="./" aria-label="Пульс — главная"><span className="brand-mark"><Icon data={Pulse} size={23}/></span>пульс<span className="wordmark-dot">.</span></a>
        <span className="header-divider"/>
        <DropdownMenu items={[{text: 'Основное пространство', action: () => setHelpOpen(true)}, {text: 'О демонстрационных данных', action: () => setHelpOpen(true)}]} renderSwitcher={props => <Button {...props} view="flat" className="workspace-button"><span className="workspace-avatar">П</span> Моё пространство <Icon data={ChevronDown} size={14}/></Button>}/>
        <div className="header-right"><span className="environment"><span className="status-dot"/> Демо-пространство</span><Tooltip content={dark ? 'Светлая тема' : 'Тёмная тема'}><Button view="flat" aria-label="Переключить тему" onClick={() => setDark(!dark)}><Icon data={dark ? Sun : Moon} size={18}/></Button></Tooltip><span className="header-divider"/><DropdownMenu items={[{text: 'Александр · Личное пространство', action: () => setHelpOpen(true)}, {text: 'Настройки визуализации', action: () => setSettingsOpen(true)}]} renderSwitcher={props => <Button {...props} view="flat" className="profile-button" aria-label="Профиль Александра"><span className="profile-avatar">АК</span><Icon data={ChevronDown} size={13}/></Button>}/></div>
      </header>

      <main className="workspace">
        <div className="breadcrumbs"><span>Рабочее пространство</span><Icon data={ChevronRight} size={12}/><span className="breadcrumb-current">Аналитика</span></div>
        <div className="page-heading"><div><div className="eyebrow">ВАШИ ДАННЫЕ, ЯСНАЯ КАРТИНА</div><Text as="h1" variant="display-1" className="page-title">Обзор показателей</Text><Text as="p" variant="body-2" color="secondary" className="page-description">От бизнес-результатов до каждой миллисекунды. Всё в одном месте.</Text></div><Button size="l" view="outlined" className="export-button" onClick={exportData}><Icon data={exported ? Check : ArrowDownToLine} size={16}/>{exported ? 'Файл скачан' : 'Экспорт данных'}</Button></div>
        <div className="view-toolbar"><SegmentedRadioGroup size="l" value={mode} onUpdate={value => setMode(value as ChartMode)} aria-label="Режим визуализации" className="mode-switch"><SegmentedRadioGroup.Option value="sales"><span className="mode-option"><Icon data={ChartLine} size={17}/>Продажи</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="monitoring"><span className="mode-option"><Icon data={Pulse} size={17}/>Мониторинг</span></SegmentedRadioGroup.Option></SegmentedRadioGroup><span className="toolbar-note"><Icon data={Layers} size={14}/> Два взгляда на ваши данные</span></div>

        <section className="visualization-card" aria-label={isSales ? 'Виджет продаж' : 'Виджет мониторинга'}>
          <div className="card-heading"><div className="card-title-group"><span className="card-icon"><Icon data={isSales ? ChartLine : Pulse} size={20}/></span><div><Text as="h2" variant="subheader-3">{isSales ? 'Динамика продаж' : 'Мониторинг сервиса'}</Text><span className="card-subtitle">{isSales ? 'Результаты, которые двигают бизнес вперёд' : 'Каждая точка — состояние вашего сервиса'}</span></div></div><div className="card-heading-actions"><span className="freshness"><span className="status-dot"/>{live && !isSales ? 'Обновление каждые 6 с' : 'Данные актуальны'}</span><DropdownMenu defaultSwitcherProps={{view: 'flat', 'aria-label': 'Действия с виджетом'}} icon={<Icon data={Ellipsis} size={20}/>} items={[{text: 'Настройки графика', action: () => setSettingsOpen(true)}, {text: 'Скачать CSV', action: exportData}, {text: 'Обновить данные', action: () => {setTick(value => value + 1); setRefreshedAt(new Date().toLocaleTimeString('ru-RU'));}}]}/></div></div>
          <div className="metrics-row">
            <div className="metric metric-primary"><span className="metric-label">{isSales ? 'Общая выручка' : 'Среднее время ответа'}<Tooltip content={isSales ? 'Сумма выручки за выбранный период. Данные демонстрационные.' : 'Среднее по всем точкам за выбранный период. Данные демонстрационные.'}><span tabIndex={0}><Icon data={CircleInfo} size={14}/></span></Tooltip></span><div className="metric-value">{isSales ? money(summary.total) : <>{formatNumber(summary.average)} <span className="metric-unit">мс</span></>}</div><div className="metric-caption"><span className="growth"><Icon data={summary.change < 0 ? ArrowDownRight : ArrowUpRight} size={13}/>{summary.change > 0 ? '+' : '−'}{formatNumber(Math.abs(summary.change), 1)}%</span><span>к предыдущему периоду</span></div></div>
            <div className="metric"><span className="metric-label">{isSales ? 'Количество заказов' : 'Точек наблюдения'}</span><div className="metric-value">{formatNumber(isSales ? Math.round(summary.total / 3480) : dataset.timeline.length)}</div><div className="metric-caption"><span className="growth"><Icon data={isSales ? ArrowUpRight : Check} size={13}/>{isSales ? `+${formatNumber(orderChange, 1)}%` : 'Без пропусков'}</span><span>{isSales ? 'к предыдущему периоду' : 'данные непрерывны'}</span></div></div>
            <div className="metric"><span className="metric-label">{isSales ? 'Средний чек' : 'Пиковое время ответа'}</span><div className="metric-value">{isSales ? money(Math.round(summary.total / Math.round(summary.total / 3480))) : <>{formatNumber(summary.max)} <span className="metric-unit">мс</span></>}</div><div className="metric-caption"><span className="growth"><Icon data={isSales ? ArrowUpRight : Clock} size={13}/>{isSales ? `+${formatNumber(averageCheckChange, 1)}%` : 'За весь период'}</span><span>{isSales ? 'к предыдущему периоду' : 'включая краткие всплески'}</span></div></div>
          </div>
          <div className="chart-toolbar"><div className="chart-title"><Text variant="subheader-1">{isSales ? 'Выручка' : 'Время ответа'}</Text><span className="unit-label">{isSales ? '₽' : 'мс'}</span></div><div className="chart-controls"><SegmentedRadioGroup size="s" value={period} onUpdate={isSales ? setSalesPeriod : setMonitorPeriod} aria-label="Период графика" options={isSales ? [{value: '7', content: '7 дней'}, {value: '30', content: '30 дней'}, {value: '90', content: '90 дней'}] : [{value: '1', content: '1 час'}, {value: '6', content: '6 часов'}, {value: '24', content: '24 часа'}]}/><span className="control-divider"/><Tooltip content="Настройки графика"><Button view="flat" size="s" aria-label="Настройки графика" onClick={() => setSettingsOpen(true)}><Icon data={Sliders} size={16}/></Button></Tooltip></div></div>
          <div className="chart-container"><VisualizationWidget mode={mode} data={dataset} compare={compare} markers={markers}/></div>
          <div className="chart-bottom"><div className="custom-legend"><span><i className="legend-line current"/>{isSales ? 'Текущий период' : 'Время ответа'}</span>{compare && <span><i className="legend-line previous"/>Предыдущий период</span>}</div><Switch size="s" checked={compare} onUpdate={setCompare}>Сравнить периоды</Switch></div>
          <div className="widget-footer"><span><Icon data={Calendar} size={14}/>{dateLabel}</span><span>{formatNumber(dataset.timeline.length)} точек<span className="footer-dot">·</span>{isSales ? 'По дням' : 'Шаг 6 секунд'}<span className="footer-dot">·</span>UTC</span><span className="update-note"><Icon data={Clock} size={13}/>Обновлено: {refreshedAt.toLowerCase()}</span></div>
        </section>
        <div className="below-grid"><section className="insight-card"><span className="insight-icon"><Icon data={isSales ? ArrowUpRight : Check} size={21}/></span><div><div className="insight-eyebrow">{isSales ? 'ХОРОШИЙ ТЕМП' : 'СЕРВИС ПОД КОНТРОЛЕМ'}</div><Text as="h3" variant="subheader-2">{isSales ? `Выручка выросла на ${formatNumber(summary.change, 1)}%` : 'Ни одного пропущенного наблюдения'}</Text><Text as="p" variant="body-1" color="secondary">{isSales ? `На ${money(summary.total - summary.previousTotal)} больше, чем за предыдущие ${period} дней. Продолжайте в том же духе.` : 'Плотный временной ряд помогает заметить даже короткие всплески нагрузки.'}</Text></div><span className="insight-decoration" aria-hidden="true">↗</span></section><section className="data-card"><div className="data-card-header"><span className="data-title"><Icon data={Layers} size={17}/><Text variant="subheader-1">О данных</Text></span><span className="demo-badge">Демо</span></div><Text as="p" variant="body-1" color="secondary">Исследуйте возможности виджета на демонстрационном наборе данных.</Text><Button view="flat" size="s" className="learn-button" onClick={() => setHelpOpen(true)}>Подробнее о визуализации<Icon data={ArrowRight} size={14}/></Button></section></div>
        <footer className="page-footer"><span><span className="footer-brand">пульс.</span> Больше ясности в каждом решении.</span><Button view="flat" size="s" onClick={() => setHelpOpen(true)}><Icon data={CircleInfo} size={14}/>Как читать график</Button></footer>
      </main>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} hasCloseButton size="s"><Dialog.Header caption="Настройки визуализации"/><Dialog.Body><div className="settings-fields"><div><Text as="p" variant="body-2">Отображение</Text><Switch checked={compare} onUpdate={setCompare}>Сравнивать с предыдущим периодом</Switch></div>{isSales ? <Switch checked={markers} onUpdate={setMarkers}>Показывать точки на линии</Switch> : <div><Switch checked={live} onUpdate={setLive}>Обновлять каждые 6 секунд</Switch><Text as="p" variant="caption-2" color="secondary">Симуляция поступления новых наблюдений.</Text></div>}<Select label="Тема" value={[dark ? 'dark' : 'light']} onUpdate={value => setDark(value[0] === 'dark')} options={[{value: 'light', content: 'Светлая'}, {value: 'dark', content: 'Тёмная'}]}/></div></Dialog.Body><Dialog.Footer textButtonApply="Готово" onClickButtonApply={() => setSettingsOpen(false)}/></Dialog>
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} hasCloseButton size="m"><Dialog.Header caption="Два взгляда на ваши данные"/><Dialog.Body><div className="help-content"><Text as="p" variant="body-2"><b>Продажи.</b> Линия показывает дневную выручку. Выберите 7, 30 или 90 дней, чтобы увидеть нужный масштаб.</Text><Text as="p" variant="body-2"><b>Мониторинг.</b> Плотный ряд показывает время ответа сервиса с шагом 6 секунд. Выделите участок мышью для приближения; двойной щелчок сбросит масштаб.</Text><Text as="p" variant="body-2"><b>Сравнение.</b> Серая линия — значения предыдущего периода, совмещённые по времени с текущим. Наведите курсор, чтобы увидеть точные значения.</Text><Text as="p" variant="body-2" color="secondary">Все данные в этом пространстве сгенерированы для демонстрации. Экспорт CSV содержит точки выбранного периода. Автообновление мониторинга можно включить в настройках.</Text></div></Dialog.Body><Dialog.Footer textButtonApply="Понятно" onClickButtonApply={() => setHelpOpen(false)}/></Dialog>
    </div>
  </ThemeProvider>;
}
