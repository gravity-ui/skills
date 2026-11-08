import {useMemo, useState} from 'react';
import {Chart, type ChartData, type LineSeries} from '@gravity-ui/charts';
import {Button, Checkbox, Icon, SegmentedRadioGroup, Select, Text, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, Calendar, ChartLine, Check, ChevronRight, CircleInfo, Clock, Display, Moon, Persons, Sun} from '@gravity-ui/icons';
import './App.css';

type ThemeMode = 'system' | 'light' | 'dark';
type Period = '7' | '30' | '90';
const DAY = 86_400_000;
const END = Date.UTC(2026, 9, 30);
const number = new Intl.NumberFormat('ru-RU');
const shortDate = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'});
const longDate = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
const october = [568, 640, 610, 735, 698, 523, 490, 672, 786, 740, 814, 765, 603, 578, 795, 884, 842, 960, 903, 718, 665, 907, 1024, 967, 1118, 1055, 861, 803, 1093, 1217];
const allPoints = Array.from({length: 180}, (_, i) => ({
  x: END - (179 - i) * DAY,
  y: i >= 150 ? october[i - 150] : Math.round(430 + i * 2.1 + Math.sin(i * 0.9) * 95 + Math.cos(i * 0.29) * 70),
}));

function initialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('pulse-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch { /* System preference remains available when storage is disabled. */ }
  return 'system';
}

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  function changeTheme(next: ThemeMode) {
    setTheme(next);
    try { localStorage.setItem('pulse-theme', next); } catch { /* Optional preference persistence. */ }
  }
  return <ThemeProvider theme={theme}><Analytics theme={theme} changeTheme={changeTheme} /></ThemeProvider>;
}

function Analytics({theme, changeTheme}: {theme: ThemeMode; changeTheme: (theme: ThemeMode) => void}) {
  const resolvedTheme = useThemeValue();
  const [period, setPeriod] = useState<Period>('30');
  const [compare, setCompare] = useState(true);
  const [grouping, setGrouping] = useState('day');
  const [exported, setExported] = useState(false);
  const count = Number(period);
  const points = useMemo(() => allPoints.slice(-count), [count]);
  const previous = useMemo(() => allPoints.slice(-count * 2, -count), [count]);
  const total = points.reduce((sum, point) => sum + point.y, 0);
  const previousTotal = previous.reduce((sum, point) => sum + point.y, 0);
  const growth = (total / previousTotal - 1) * 100;
  const average = Math.round(total / count);
  const peak = points.reduce((best, point) => point.y > best.y ? point : best);
  const range = `${shortDate.format(points[0].x)} — ${shortDate.format(END)} 2026`;

  const data = useMemo<ChartData>(() => {
    function grouped(values: typeof points) {
      if (grouping === 'day') return values;
      return Array.from({length: Math.ceil(values.length / 7)}, (_, i) => ({
        x: values[i * 7].x,
        y: values.slice(i * 7, i * 7 + 7).reduce((sum, point) => sum + point.y, 0),
      }));
    }
    const series: LineSeries[] = [{
      type: 'line', name: 'Текущий период', data: grouped(points),
      color: 'var(--g-color-text-utility)', lineWidth: 3,
      interpolation: {type: 'monotone'}, marker: {enabled: grouping === 'week', radius: 4},
    }];
    if (compare) series.push({
      type: 'line', name: 'Предыдущий период',
      data: grouped(previous.map((point, i) => ({x: points[i].x, y: point.y}))),
      color: 'var(--g-color-line-utility)', opacity: 0.55,
      lineWidth: 2, dashStyle: 'Dash', interpolation: {type: 'monotone'}, marker: {enabled: grouping === 'week', radius: 3},
    });
    return {
      chart: {margin: {top: 20, right: 12, bottom: 12, left: 4}},
      series: {data: series}, legend: {enabled: false},
      xAxis: {
        type: 'datetime', min: points[0].x, max: END, startOnTick: false, endOnTick: false,
        grid: {enabled: false}, lineVisible: false,
        ticks: {interval: 130}, labels: {dateFormat: 'D MMM', margin: 20},
        crosshair: {enabled: true, color: 'var(--g-color-line-generic)', dashStyle: 'Dash'},
      },
      yAxis: [{type: 'linear', min: 0, grid: {enabled: true}, lineVisible: false, ticks: {interval: 75}, labels: {margin: 18}}],
      tooltip: {
        headerFormat: {type: 'custom', formatter: ({value}) => `${longDate.format(Number(value))}${grouping === 'week' ? ' · неделя' : ''}`},
        valueFormat: {type: 'custom', formatter: ({value}) => `${number.format(Number(value))} чел.`},
      },
    };
  }, [points, previous, compare, grouping]);

  function exportCsv() {
    const rows = [
      ['Дата', 'Посетители', ...(compare ? ['Дата предыдущего периода', 'Посетители предыдущего периода'] : [])],
      ...points.map((point, i) => [
        new Date(point.x).toISOString().slice(0, 10), point.y,
        ...(compare ? [new Date(previous[i].x).toISOString().slice(0, 10), previous[i].y] : []),
      ]),
    ];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map(row => row.join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-visitors-${period}-days.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <a className="wordmark" href="./" aria-label="Pulse — главная">
            <span className="brand-symbol"><Icon data={ChartLine} size={21} /></span>
            <Text variant="header-2">pulse<span className="brand-period">.</span></Text>
          </a>
          <div className="header-divider" />
          <Text variant="body-2" className="header-section">Аналитика</Text>
          <span className="demo-badge"><span /> Демо-проект</span>
          <div className="header-actions">
            <div className="theme-switch" role="group" aria-label="Тема приложения">
              {([
                ['light', Sun, 'Светлая тема'], ['dark', Moon, 'Тёмная тема'], ['system', Display, 'Системная тема'],
              ] as const).map(([value, icon, label]) => (
                <Button key={value} view={theme === value ? 'raised' : 'flat'} size="m"
                  selected={theme === value} onClick={() => changeTheme(value)} title={label}
                  aria-label={label} aria-pressed={theme === value}>
                  <Icon data={icon} size={16} />
                </Button>
              ))}
            </div>
            <span className="profile-avatar" title="Личное пространство" aria-label="Личное пространство">А</span>
          </div>
        </div>
      </header>
      <main className="main-content">
        <div className="breadcrumbs"><Text variant="body-1">Рабочее пространство</Text><Icon data={ChevronRight} size={12} /><Text variant="body-1" color="primary">Обзор</Text></div>
        <div className="page-heading">
          <div>
            <div className="heading-line"><Text as="h1" variant="display-2">Обзор посещаемости</Text><span className="live-label"><span /> Всё под контролем</span></div>
            <Text as="p" variant="body-2" color="secondary">Ваши данные — в ясной картине. Следите за тем, как растёт аудитория.</Text>
          </div>
          <Button view="outlined" size="l" onClick={exportCsv} className="export-button">
            <Icon data={exported ? Check : ArrowDownToLine} size={16} />{exported ? 'Скачано' : 'Экспорт'}
          </Button>
        </div>
        <div className="page-toolbar">
          <SegmentedRadioGroup value={period} onUpdate={setPeriod} size="l" aria-label="Период статистики"
            options={[{value: '7', content: '7 дней'}, {value: '30', content: '30 дней'}, {value: '90', content: '90 дней'}]} />
          <div className="date-range"><Icon data={Calendar} size={16} /><Text variant="body-1" color="primary">{range}</Text></div>
          <span className="toolbar-note"><span className="status-dot" /> Демо-данные</span>
        </div>
        <section className="metric-grid" aria-label="Ключевые показатели">
          <Metric title="Посетители" value={number.format(total)} change={growth} icon={Persons} accent />
          <Metric title="В среднем за день" value={number.format(average)} change={growth} icon={ChartLine} />
          <Metric title="Максимум за день" value={number.format(peak.y)} detail={shortDate.format(peak.x)} icon={Clock} />
        </section>
        <section className="chart-card" aria-labelledby="chart-title">
          <div className="chart-heading">
            <div><Text as="h2" id="chart-title" variant="subheader-3">Динамика посещаемости</Text><Text as="p" variant="body-1" color="secondary">Количество посетителей {grouping === 'day' ? 'по дням' : 'по неделям'}</Text></div>
            <Select className="grouping-select" aria-label="Группировка данных" value={[grouping]} onUpdate={values => { if (values[0]) setGrouping(values[0]); }} size="m"
              options={[{value: 'day', content: 'По дням'}, {value: 'week', content: 'По неделям'}]} />
          </div>
          <div className="chart-legend">
            <span className="legend-item"><span className="line-key" /><Text variant="body-1" className="legend-label">Текущий период</Text></span>
            {compare && <span className="legend-item"><span className="line-key line-key-previous" /><Text variant="body-1" className="legend-label" color="secondary">Предыдущий период</Text></span>}
            <Text variant="caption-2" color="secondary" className="chart-unit">Посетители, чел.</Text>
          </div>
          <div className="chart-container" role="img" aria-label={`Линейный график посещаемости за ${count} дней. Всего ${number.format(total)} посетителей. Максимум ${number.format(peak.y)} — ${shortDate.format(peak.x)}.`}>
            <Chart data={data} lang="ru" />
          </div>
          <div className="chart-footer">
            <Checkbox checked={compare} onUpdate={setCompare}>Сравнить с предыдущим периодом</Checkbox>
            <span className="hover-hint"><Icon data={CircleInfo} size={14} /><Text variant="body-1" color="secondary">Наведите на график, чтобы увидеть детали</Text></span>
          </div>
        </section>
        <div className="insight-card">
          <span className="insight-icon"><Icon data={ArrowUpRight} size={20} /></span>
          <div><Text as="p" variant="subheader-2">{growth >= 0 ? 'Аудитория растёт' : 'Аудитория стала меньше'}</Text><Text as="p" variant="body-1" color="secondary">За выбранный период посетителей на <strong>{Math.abs(growth).toFixed(1).replace('.', ',')}%</strong> {growth >= 0 ? 'больше' : 'меньше'}, чем за предыдущие {count} дней. Пик посещаемости — {shortDate.format(peak.x)}.</Text></div>
          <span className="insight-period">{count} дней</span>
        </div>
        <footer className="page-footer"><Text variant="body-1" color="secondary" className="footer-copy">Меньше шума. Больше понимания.</Text><span className="theme-status"><span className="status-dot" />{resolvedTheme.startsWith('dark') ? 'Тёмная' : 'Светлая'} тема{theme === 'system' ? ' · системная' : ''}</span></footer>
      </main>
    </div>
  );
}

function Metric({title, value, change, detail, icon, accent}: {
  title: string; value: string; change?: number; detail?: string;
  icon: typeof Persons; accent?: boolean;
}) {
  return <article className={`metric-card${accent ? ' metric-card-accent' : ''}`}>
    <div className="metric-top"><Text variant="body-2" color="secondary" className="metric-label">{title}</Text><span className="metric-icon"><Icon data={icon} size={18} /></span></div>
    <Text as="p" variant="display-2" className="metric-value">{value}</Text>
    <div className="metric-bottom">{change !== undefined ? <><span className={`growth-badge${change < 0 ? ' growth-negative' : ''}`}><Icon data={ArrowUpRight} size={13} />{change >= 0 ? '+' : ''}{change.toFixed(1).replace('.', ',')}%</span><Text variant="body-1" color="secondary" className="metric-comparison">к предыдущему периоду</Text></> : <><span className="peak-date">{detail}</span><Text variant="body-1" color="secondary" className="metric-comparison">самый активный день</Text></>}</div>
  </article>;
}
