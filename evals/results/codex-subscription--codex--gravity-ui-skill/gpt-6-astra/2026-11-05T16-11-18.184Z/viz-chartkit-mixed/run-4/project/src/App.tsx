import {useEffect, useMemo, useState} from 'react';
import {Button, Icon, Modal, SegmentedRadioGroup, Select, Switch, Text, ThemeProvider, configure} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, ArrowsRotateRight, Calendar, ChartLine, CircleInfo, CircleQuestion, Gear, Pulse, Sliders, Xmark} from '@gravity-ui/icons';
import {VisualizationWidget} from './components/VisualizationWidget';
import {createDemoData, number, toCsv, type VisualizationMode} from './data';
import './styles.css';
configure({lang: 'ru'});

export function App() {
  const [mode, setMode] = useState<VisualizationMode>('sales');
  const [salesRange, setSalesRange] = useState('30');
  const [monitorRange, setMonitorRange] = useState('24');
  const [comparison, setComparison] = useState(true);
  const [grid, setGrid] = useState(true);
  const [live, setLive] = useState(false);
  const [dark, setDark] = useState(false);
  const [dialog, setDialog] = useState<'settings' | 'help' | null>(null);
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [updated, setUpdated] = useState('Только что');
  const [exported, setExported] = useState(false);
  const range = mode === 'sales' ? salesRange : monitorRange;
  const setRange = mode === 'sales' ? setSalesRange : setMonitorRange;
  const data = useMemo(() => createDemoData(mode, Number(range), tick), [mode, range, tick]);
  useEffect(() => {
    if (!live || mode !== 'monitoring') return;
    const timer = window.setInterval(() => {setTick(t => t + 1); setUpdated(new Date().toLocaleTimeString('ru-RU'));}, 5000);
    return () => window.clearInterval(timer);
  }, [live, mode]);
  useEffect(() => {
    if (!refreshing) return;
    const timer = window.setTimeout(() => {setTick(t => t + 1); setRefreshing(false); setUpdated(new Date().toLocaleTimeString('ru-RU'));}, 600);
    return () => window.clearTimeout(timer);
  }, [refreshing]);
  useEffect(() => {if (exported) {const timer = window.setTimeout(() => setExported(false), 3000); return () => window.clearTimeout(timer);}}, [exported]);
  const values = data.series[0].points.map(p => p.y ?? 0);
  const sum = values.reduce((a, b) => a + b, 0);
  const previous = data.series[1].points.reduce((a, p) => a + (p.y ?? 0), 0);
  const growth = (sum / previous - 1) * 100;
  const isSales = mode === 'sales';
  const exportData = () => {
    const blob = new Blob([toCsv({...data, series: comparison ? data.series : data.series.slice(0, 1)})], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${mode}-${range}.csv`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setExported(true);
  };
  return <ThemeProvider theme={dark ? 'dark' : 'light'}>
    <div className="app">
      <header className="topbar">
        <a className="brand" href="./" aria-label="Пульс — главная"><span className="brand-mark"><Icon data={Pulse} size={24} /></span>пульс<span className="brand-dot">.</span></a>
        <span className="header-divider" />
        <span className="workspace-name">Рабочее пространство</span>
        <span className="workspace-tag">Аналитика</span>
        <div className="header-actions"><Button view="flat" title="Справка" aria-label="Справка" onClick={() => setDialog('help')}><Icon data={CircleQuestion} size={19} /></Button><span className="header-divider" /><span className="avatar">АК</span></div>
      </header>
      <main>
        <div className="breadcrumb">Рабочее пространство <span>/</span> <span className="breadcrumb-current">Обзор показателей</span></div>
        <div className="page-heading"><div><div className="eyebrow">ВАШ БИЗНЕС В ДЕТАЛЯХ</div><Text variant="display-1" as="h1">Обзор показателей</Text><p>Все важные данные. Один понятный график.</p></div><Button size="l" view="outlined" onClick={() => setDialog('settings')}><Icon data={Sliders} size={16} /> Настроить виджет</Button></div>
        <section className="visualization" aria-label="Виджет аналитики">
          <div className="widget-top"><SegmentedRadioGroup value={mode} onUpdate={v => setMode(v as VisualizationMode)} size="l" className="mode-switch" aria-label="Режим визуализации"><SegmentedRadioGroup.Option value="sales"><span className="mode-option"><Icon data={ChartLine} size={17} /> Продажи</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="monitoring"><span className="mode-option"><Icon data={Pulse} size={17} /> Мониторинг</span></SegmentedRadioGroup.Option></SegmentedRadioGroup><span className="demo-badge"><span /> Демо-данные</span></div>
          <div className="widget-body">
            <div className="chart-heading"><div><Text variant="header-1" as="h2">{isSales ? 'Динамика продаж' : 'Мониторинг ресурсов'}</Text><p>{isSales ? 'Выручка и её изменение за выбранный период' : 'Загрузка процессора основного и резервного серверов'}</p></div><div className="chart-actions"><Button view="outlined" size="m" onClick={exportData}><Icon data={ArrowDownToLine} size={16} /><span>{exported ? 'CSV скачан' : 'Экспорт'}</span></Button><Button view="flat" aria-label="Настройки графика" onClick={() => setDialog('settings')}><Icon data={Gear} size={18} /></Button></div></div>
            <div className="filter-row"><div className="period-control"><Icon data={Calendar} size={16} /><Select aria-label="Период" value={[range]} onUpdate={v => setRange(v[0])} view="clear" options={(isSales ? [{value: '7', content: '24 окт — 30 окт, 2026'}, {value: '30', content: '1 окт — 30 окт, 2026'}, {value: '90', content: '2 авг — 30 окт, 2026'}] : [{value: '1', content: 'Последний час'}, {value: '6', content: 'Последние 6 часов'}, {value: '24', content: 'Последние 24 часа'}])} /></div><div className="range-buttons">{(isSales ? ['7', '30', '90'] : ['1', '6', '24']).map(v => <Button key={v} className={range === v ? "range-selected" : undefined} view="flat" selected={range === v} onClick={() => setRange(v)} size="s">{v}{isSales ? ' дней' : ' ч'}</Button>)}</div><div className="compare-control"><Switch checked={comparison} onUpdate={setComparison} size="m">{isSales ? 'Сравнить с прошлым периодом' : 'Показать резервный сервер'}</Switch></div></div>
            <div className="metric-grid">
              <Metric label={isSales ? 'Общая выручка' : 'Средняя загрузка CPU'} value={isSales ? `${number(sum)} ₽` : `${number(sum / values.length, 1)} %`} badge={isSales ? `+${number(growth, 1)}%` : 'В норме'} detail={isSales ? 'к предыдущему периоду' : 'в пределах нормы'} primary />
              <Metric label={isSales ? 'В среднем за день' : 'Пиковая загрузка'} value={isSales ? `${number(sum / values.length)} ₽` : `${number(Math.max(...values))} %`} badge={isSales ? `+${number(growth, 1)}%` : undefined} detail={isSales ? 'к предыдущему периоду' : 'за выбранный период'} />
              <Metric label={isSales ? 'Лучший день' : 'Точек в каждом ряду'} value={isSales ? `${number(Math.max(...values))} ₽` : number(values.length)} detail={isSales ? `${new Date(data.series[0].points[values.indexOf(Math.max(...values))].x).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', timeZone: 'UTC'})} · максимальная выручка` : 'высокая детализация данных'} />
            </div>
            <div className="chart-meta"><span>{isSales ? 'Выручка, ₽' : 'Загрузка CPU, %'}</span><div className="legend"><span><i className="legend-current" />{data.series[0].name}</span>{comparison && <span><i className="legend-previous" />{data.series[1].name}</span>}</div></div>
            <VisualizationWidget mode={mode} data={data} comparison={comparison} grid={grid} loading={refreshing} />
            <div className="chart-hint"><Icon data={CircleInfo} size={14} /><span>{isSales ? 'Наведите на график, чтобы посмотреть значения за день' : 'Выделите область для увеличения. Двойной щелчок сбрасывает масштаб.'}</span><span className="chart-timezone">UTC</span></div>
          </div>
          <div className="widget-footer"><span className="update-status"><span className="status-dot" />Данные актуальны <span className="footer-separator">·</span><span className="update-time">Обновлено: {updated.toLowerCase()}</span></span><div className="footer-actions">{!isSales && <Switch checked={live} onUpdate={setLive} size="s">Автообновление</Switch>}<Button view="flat" size="s" onClick={() => setRefreshing(true)} loading={refreshing}><Icon data={ArrowsRotateRight} size={14} />Обновить</Button></div></div>
        </section>
        <div className="below-grid"><section className="insight-card"><span className="insight-icon"><Icon data={isSales ? ChartLine : Pulse} size={21} /></span><div><div className="insight-title">{isSales ? 'Продажи набирают темп' : 'Система работает стабильно'}<span className="insight-tag">Наблюдение</span></div><p>{isSales ? <>Выручка выросла на <strong>{number(growth, 1)}%</strong> по сравнению с предыдущим периодом.<br />Хорошая динамика — продолжайте в том же духе.</> : <>Средняя загрузка составляет <strong>{number(sum / values.length, 1)}%</strong>. Запас мощности достаточен.<br />Следите за пиковыми значениями на графике.</>}</p></div></section><section className="source-card"><div className="source-title"><span>Источник данных</span><span className="source-status">Подключён</span></div><strong>{isSales ? 'Продажи интернет-магазина' : 'Инфраструктура · production'}</strong><span className="source-caption">{isSales ? 'Дневная агрегация' : 'Плотный временной ряд'}<span>·</span>Демо-набор</span></section></div>
        <footer className="page-footer"><span>Чёткие данные. Взвешенные решения.</span><Button view="flat" size="s" onClick={() => setDialog('help')}><Icon data={CircleQuestion} size={14} /> Как читать график</Button></footer>
      </main>
      <Modal open={dialog !== null} onClose={() => setDialog(null)} aria-label={dialog === 'settings' ? 'Настройки виджета' : 'Как читать график'}><div className="modal-content"><div className="modal-heading"><Text variant="header-1">{dialog === 'settings' ? 'Настройки виджета' : 'Данные, которые понятны'}</Text><Button view="flat" aria-label="Закрыть" onClick={() => setDialog(null)}><Icon data={Xmark} /></Button></div>{dialog === 'settings' ? <><p>Изменения сразу применяются к обоим режимам.</p><div className="setting"><span>Сетка графика</span><Switch checked={grid} onUpdate={setGrid} aria-label="Сетка графика" /></div><div className="setting"><span>Тёмная тема</span><Switch checked={dark} onUpdate={setDark} aria-label="Тёмная тема" /></div><div className="setting"><span>Сравнение данных</span><Switch checked={comparison} onUpdate={setComparison} aria-label="Сравнение данных" /></div></> : <><p><strong>Продажи.</strong> Сплошная зелёная линия — выручка за выбранный период. Пунктирная — предыдущий период, совмещённый по дням.</p><p><strong>Мониторинг.</strong> Плотный временной ряд показывает загрузку CPU. Выделите участок для увеличения. Включите автообновление, чтобы получать новые демо-значения каждые 5 секунд.</p><p><strong>Экспорт.</strong> Скачайте видимые ряды в формате CSV для дальнейшего анализа.</p><div className="help-note"><Icon data={CircleInfo} size={17} /> Здесь используются демонстрационные данные за октябрь 2026 года.</div></>}<Button view="action" width="max" size="l" onClick={() => setDialog(null)}>Готово</Button></div></Modal>
      <div className="sr-only" role="status" aria-live="polite">{exported ? 'Файл CSV скачан' : ''}</div>
    </div>
  </ThemeProvider>;
}
function Metric({label, value, badge, detail, primary}: {label: string; value: string; badge?: string; detail: string; primary?: boolean}) {
  return <div className={`metric ${primary ? 'metric-primary' : ''}`}><span className="metric-label">{label}<Icon data={CircleInfo} size={13} /></span><Text variant="display-1" className="metric-value">{value}</Text><div className="metric-detail">{badge && <span className="growth">{badge !== 'В норме' && <Icon data={ArrowUpRight} size={12} />}{badge}</span>}<span>{detail}</span></div></div>;
}
