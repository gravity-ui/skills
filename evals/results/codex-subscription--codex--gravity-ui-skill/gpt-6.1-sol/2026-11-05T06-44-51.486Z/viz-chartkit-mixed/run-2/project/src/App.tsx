import {useEffect, useMemo, useState} from 'react';
import {Button, Checkbox, Icon, Modal, SegmentedRadioGroup, Select, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowRight, ArrowRotateRight, ArrowUpRight, ArrowsExpand, ChartLine, Check, CircleQuestion, Clock, Database, DisplayPulse, Gear, Moon, Pulse, Sun, Xmark} from '@gravity-ui/icons';
import {VisualizationWidget, type VisualizationMode} from './components/VisualizationWidget';
import {getSeries, money, number, sum} from './data';
import './styles.css';

type Dialog = 'help' | 'sources' | 'settings' | null;
export function App() {
  const [mode, setMode] = useState<VisualizationMode>('sales');
  const [period, setPeriod] = useState('30');
  const [compare, setCompare] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);
  const [dark, setDark] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [exported, setExported] = useState(false);
  const [visible, setVisible] = useState<string[]>(['server-0', 'server-1']);
  useEffect(() => {
    if (mode !== 'monitoring' || !autoRefresh) return;
    const timer = window.setInterval(() => setTick(t => t + 1), 5000);
    return () => window.clearInterval(timer);
  }, [mode, autoRefresh]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {if (e.key === 'Escape') setExpanded(false);};
    document.addEventListener('keydown', onKey);
    return () => {document.body.style.overflow = previous; document.removeEventListener('keydown', onKey);};
  }, [expanded]);
  useEffect(() => {if (exported) {const t = setTimeout(() => setExported(false), 3000); return () => clearTimeout(t);}}, [exported]);
  const allSeries = useMemo(() => getSeries(mode, Number(period), tick), [mode, period, tick]);
  const series = mode === 'sales' ? allSeries.filter(s => !s.comparison || compare) : allSeries.filter(s => visible.includes(s.id));
  const total = sum(allSeries[0].points);
  const previous = sum(allSeries[1].points);
  const growth = ((total / previous - 1) * 100).toFixed(1).replace('.', ',');
  const orders = Math.round(total / 3120);
  const peak = Math.max(...allSeries[0].points.map(p => p.value));
  const average = total / allSeries[0].points.length;
  const sales = mode === 'sales';
  const dateRange = `${31 - Number(period)} — 30 октября 2026`;
  const monitoringStart = new Date(allSeries[0].points[0].timestamp).toISOString().slice(11, 19);
  const monitoringEnd = new Date(allSeries[0].points.at(-1)!.timestamp).toISOString().slice(11, 19);
  const exportCsv = () => {
    const csv = '\uFEFFВремя;' + series.map(s => s.name).join(';') + '\n' + (series[0]?.points ?? []).map((p, i) => [new Date(p.timestamp).toISOString(), ...series.map(s => s.points[i]?.value ?? '')].join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = `pulse-${mode}-${period}.csv`; link.click(); URL.revokeObjectURL(url); setExported(true);
  };
  return <ThemeProvider theme={dark ? 'dark' : 'light'}>
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Пульс — главная"><span className="brand-mark"><Icon data={Pulse} size={23}/></span>пульс<span className="brand-divider"/><span className="brand-subtitle">аналитика</span></a>
        <div className="topbar-right"><span className="workspace-label">Рабочее пространство</span><span className="topbar-divider"/>
          <Button view="flat" size="m" title="Переключить тему" aria-label="Переключить тему" onClick={() => setDark(!dark)}><Icon data={dark ? Sun : Moon} size={18}/></Button>
          <Button view="flat" size="m" title="Помощь" aria-label="Помощь" onClick={() => setDialog('help')}><Icon data={CircleQuestion} size={19}/></Button>
          <span className="avatar" title="Демонстрационное пространство">АК</span>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb"><span>Рабочее пространство</span><span className="crumb-slash">/</span><span>Аналитика</span></div>
        <div className="page-heading"><div><div className="eyebrow">ВАША КАРТИНА В ЦИФРАХ</div><Text variant="display-2" as="h1">Аналитика</Text><p>От результатов бизнеса до состояния системы — всё в одном месте.</p></div><div className="demo-badge"><span className="status-dot"/>Демо-пространство</div></div>
        <section className={`widget ${expanded ? 'widget-expanded' : ''}`} aria-label="Виджет аналитики">
          <div className="widget-heading"><div className="widget-title"><span className="widget-icon"><Icon data={ChartLine} size={21}/></span><div><Text variant="subheader-3" as="h2">Обзор показателей</Text><span className="widget-subtitle">Данные, которые помогают принимать решения</span></div></div><div className="widget-actions">
            <Button view="flat" size="m" title="Настройки виджета" aria-label="Настройки виджета" onClick={() => setDialog('settings')}><Icon data={Gear} size={18}/></Button>
            <Button view="flat" size="m" title={expanded ? 'Свернуть' : 'Развернуть'} aria-label={expanded ? 'Свернуть' : 'Развернуть'} onClick={() => setExpanded(!expanded)}><Icon data={expanded ? Xmark : ArrowsExpand} size={18}/></Button>
            <span className="action-divider"/><Button view="outlined" size="m" onClick={exportCsv} disabled={!series.length}><Icon data={exported ? Check : ArrowDownToLine} size={15}/><span className="export-label">{exported ? 'Скачано' : 'Экспорт'}</span></Button>
          </div></div>
          <div className="mode-toolbar"><SegmentedRadioGroup value={mode} onUpdate={v => setMode(v as VisualizationMode)} size="l" className="mode-switch" aria-label="Режим графика">
            <SegmentedRadioGroup.Option value="sales"><span className="mode-option"><Icon data={ChartLine} size={17}/>Продажи</span></SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="monitoring"><span className="mode-option"><Icon data={DisplayPulse} size={17}/>Мониторинг</span></SegmentedRadioGroup.Option>
          </SegmentedRadioGroup><span className="mode-caption">{sales ? 'Бизнес в динамике' : 'Система под контролем'}</span><span className="mode-note"><span className="status-dot"/>{sales ? 'Данные актуальны' : autoRefresh ? 'Обновление каждые 5 сек' : 'Обновление на паузе'}</span></div>
          <div className="filter-toolbar"><div className="period-controls"><span className="filter-label">Период</span><SegmentedRadioGroup value={period} onUpdate={setPeriod} size="m" aria-label="Период">
            {['7', '14', '30'].map(p => <SegmentedRadioGroup.Option key={p} value={p}>{p} {sales ? 'дней' : 'мин'}</SegmentedRadioGroup.Option>)}
          </SegmentedRadioGroup><span className="date-caption">{sales ? dateRange : `30 октября, ${monitoringStart} — ${monitoringEnd} UTC`}</span></div><div className="comparison-control">{sales ? <Checkbox checked={compare} onUpdate={setCompare}>Сравнить с прошлым периодом</Checkbox> : <Switch checked={autoRefresh} onUpdate={setAutoRefresh} size="m">Автообновление</Switch>}</div></div>
          <div className="metrics">
            <div className="metric metric-primary"><span className="metric-label">{sales ? 'Общая выручка' : 'Средняя нагрузка CPU'}<span className="metric-info" title={sales ? 'Сумма выручки за выбранный период' : 'Средняя загрузка API-сервера за выбранный период'}><Icon data={CircleQuestion} size={14}/></span></span><div className="metric-value"><Text variant="display-2">{sales ? money(total) : `${average.toFixed(1).replace('.', ',')} %`}</Text><span className="change"><Icon data={sales ? ArrowUpRight : Check} size={13}/>{sales ? `${growth} %` : 'В норме'}</span></div><span className="metric-description">{sales ? 'относительно прошлого периода' : 'за выбранный период'}</span></div>
            <div className="metric"><span className="metric-label">{sales ? 'Количество заказов' : 'Пиковая нагрузка'}</span><Text variant="display-1">{sales ? number(orders) : `${peak} %`}</Text><span className="metric-description">{sales ? <><span className="positive">↗ {growth} %</span> к прошлому периоду</> : 'максимум за выбранный период'}</span></div>
            <div className="metric"><span className="metric-label">{sales ? 'Средний чек' : 'Точек на графике'}</span><Text variant="display-1">{sales ? money(total / orders) : number(allSeries[0].points.length * series.length)}</Text><span className="metric-description">{sales ? 'на один заказ' : 'интервал измерений — 500 мс'}</span></div>
          </div>
          <div className="chart-section"><div className="chart-heading"><div><Text variant="subheader-2" as="h3">{sales ? 'Динамика продаж' : 'Нагрузка на систему'}</Text><span className="chart-unit">{sales ? 'Выручка, ₽' : 'Использование CPU, %'}</span></div><div className="legend">{(sales ? series : allSeries).map(s => <span key={s.id} className="legend-item">{sales ? <><i className={`legend-line ${s.comparison ? 'dashed' : ''}`} style={{color: s.color}}/>{s.name}</> : <Checkbox checked={visible.includes(s.id)} onUpdate={checked => setVisible(v => checked ? [...v, s.id] : v.filter(id => id !== s.id))}><i className="legend-dot" style={{background: s.color}}/>{s.name}</Checkbox>}</span>)}</div></div>
            <VisualizationWidget mode={mode} series={series}/>
          </div>
          <div className="insight"><span className="insight-icon"><Icon data={sales ? ChartLine : Check} size={19}/></span><p>{sales ? <>Хорошая динамика! <strong>Выручка выросла на {growth} %</strong> по сравнению с прошлым периодом.</> : <><strong>Система работает стабильно.</strong> Пиковая нагрузка {peak} % — в пределах допустимых значений.</>}</p><span className="insight-tag">{sales ? 'Рост продаж' : 'Все системы в норме'}</span></div>
          <div className="widget-footer"><div className="source-info"><Icon data={Database} size={14}/><span>{sales ? 'Демо · Интернет-магазин' : 'Демо · Инфраструктура'}</span><span className="footer-dot">·</span><span>{sales ? `${period} точек` : `${number(allSeries[0].points.length)} точек на ряд`}</span></div><div className="updated-info"><Icon data={Clock} size={13}/><span>{sales ? 'Обновлено 30 октября, 15:30' : tick ? `Обновлено ${new Date(Date.UTC(2026, 9, 30, 15, 30) + tick * 5000).toISOString().slice(11, 19)} UTC` : 'Обновлено 15:30:00 UTC'}</span>{!sales && <Button size="xs" view="flat" aria-label="Обновить данные" title="Обновить данные" onClick={() => setTick(t => t + 1)}><Icon data={ArrowRotateRight} size={13}/></Button>}</div></div>
        </section>
        <div className="below-widget"><div className="below-caption"><span className="small-icon"><Icon data={Pulse} size={16}/></span><span>Один виджет. Два взгляда на ваши данные.</span></div><Button view="flat" size="s" onClick={() => setDialog('sources')}>Об источниках данных<Icon data={ArrowRight} size={14}/></Button></div>
        <footer className="page-footer"><span>Пульс · Важное становится заметным</span><span>Демонстрационные данные</span></footer>
      </main>
      <Modal open={dialog !== null} onClose={() => setDialog(null)} aria-label={dialog === 'settings' ? 'Настройки виджета' : dialog === 'sources' ? 'Источники данных' : 'Справка'}><div className="dialog"><div className="dialog-heading"><Text variant="header-1">{dialog === 'settings' ? 'Настройки виджета' : dialog === 'sources' ? 'Источники данных' : 'Всё под рукой'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setDialog(null)}><Icon data={Xmark} size={18}/></Button></div>
        {dialog === 'settings' ? <div className="settings-content"><label>Период по умолчанию<Select value={[period]} onUpdate={v => setPeriod(v[0])} options={[{value: '7', content: '7 дней / минут'}, {value: '14', content: '14 дней / минут'}, {value: '30', content: '30 дней / минут'}]} width="max"/></label><Checkbox checked={compare} onUpdate={setCompare}>Сравнивать продажи с прошлым периодом</Checkbox><Switch checked={autoRefresh} onUpdate={setAutoRefresh}>Автообновление мониторинга каждые 5 секунд</Switch><Button view="action" size="l" onClick={() => setDialog(null)}>Готово</Button></div> : dialog === 'sources' ? <div className="dialog-copy"><p>В этом пространстве используются демонстрационные данные.</p><div className="source-card"><Icon data={ChartLine} size={22}/><div><strong>Интернет-магазин</strong><p>Ежедневная выручка за октябрь 2026 года. Заказы рассчитаны из среднего чека 3 120 ₽.</p></div></div><div className="source-card"><Icon data={DisplayPulse} size={22}/><div><strong>Инфраструктура</strong><p>Синтетические метрики двух сервисов с шагом 500 мс. При автообновлении окно сдвигается каждые 5 секунд.</p></div></div><p>CSV содержит все точки отображаемых рядов. Время указано в UTC.</p></div> : <div className="dialog-copy"><p>Переключайтесь между продажами и мониторингом, чтобы видеть бизнес и систему в динамике.</p><p>Выберите период, наведите курсор на график для просмотра значений или скачайте данные кнопкой «Экспорт».</p><p>В мониторинге можно скрывать отдельные ряды и ставить автообновление на паузу. Разверните виджет для подробного просмотра; Escape вернёт обычный размер.</p></div>}
      </div></Modal>
    </div>
  </ThemeProvider>;
}
