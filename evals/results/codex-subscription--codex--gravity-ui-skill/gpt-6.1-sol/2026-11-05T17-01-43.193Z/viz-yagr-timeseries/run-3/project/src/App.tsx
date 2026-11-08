import {useCallback, useState} from 'react';
import {Button, Switch, Text, useThemeType} from '@gravity-ui/uikit';
import {CpuChart} from './CpuChart';
import {demoCpuSource, type CpuDataSource, type CpuSnapshot} from './cpu-data';
import {useCpuFeed} from './use-cpu-feed';
import './styles.css';

const number = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1, minimumFractionDigits: 1});
const integer = new Intl.NumberFormat('ru-RU');
const dateTime = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});

function exportCsv(snapshot: CpuSnapshot) {
  const rows = ['timestamp,cpu_percent', ...snapshot.timeline.map((timestamp, i) => `${new Date(timestamp).toISOString()},${snapshot.values[i]}`)];
  const url = URL.createObjectURL(new Blob([rows.join('\n')], {type: 'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `cpu-${new Date(snapshot.timeline.at(-1)!).toISOString().slice(0, 10)}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

interface AppProps {
  source?: CpuDataSource;
  onToggleTheme?: () => void;
}

export function App({source = demoCpuSource, onToggleTheme}: AppProps) {
  const [live, setLive] = useState(true);
  const [hours, setHours] = useState(24);
  const [zoomed, setZoomed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const onZoom = useCallback((value: boolean) => setZoomed(value), []);
  const {snapshot, status, retry} = useCpuFeed(source, live);
  const theme = useThemeType();
  const hasData = snapshot.timeline.length > 0;
  const ready = status === 'ready' && hasData;
  const isDemo = source === demoCpuSource;
  const end = snapshot.timeline.at(-1);
  const metrics = [
    {label: 'Текущая загрузка', value: snapshot.current, detail: 'Последнее измерение', kind: 'current'},
    {label: 'Средняя загрузка', value: snapshot.average, detail: 'За последние 24 часа', kind: 'average'},
    {label: 'Пиковая загрузка', value: snapshot.maximum, detail: 'Максимум за 24 часа', kind: 'maximum'},
    {label: '95-й перцентиль', value: snapshot.p95, detail: '95% измерений ниже', kind: 'percentile'},
  ];

  return <div className="app">
    <header className="topbar">
      <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>pulse<span className="brand-period">.</span></span><span className="brand-divider" /><Text variant="body-2" color="secondary">Infrastructure</Text></div>
      <div className="topbar-actions">
        <span className="environment"><span className="status-dot" />{isDemo ? 'Демо-стенд' : 'Мониторинг CPU'}</span>
        {onToggleTheme && <Button view="outlined" size="m" onClick={onToggleTheme} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</Button>}
        <span className="avatar" aria-label="Рабочее пространство">P</span>
      </div>
    </header>
    <main className="workspace">
      <div className="breadcrumbs"><span>Рабочее пространство</span><span aria-hidden="true">/</span><span>Инфраструктура</span><span aria-hidden="true">/</span><span className="breadcrumb-current">Мониторинг</span></div>
      <div className="page-heading">
        <div><div className="eyebrow">СОСТОЯНИЕ СИСТЕМЫ</div><Text as="h1" variant="display-1" className="page-title">Мониторинг</Text><Text as="p" variant="body-2" color="secondary" className="page-description">Всё о нагрузке на процессор — в реальном времени.</Text></div>
        <div className="page-heading-meta"><span className="outline-chip"><span className="status-dot" />{isDemo ? 'Демонстрационные данные' : 'Данные мониторинга'}</span><Text variant="caption-2" color="secondary">Хранение истории · 24 часа</Text></div>
      </div>
      <section className="metrics" aria-label="Показатели CPU за последние сутки">
        {metrics.map((metric) => <div className={`metric-card metric-${metric.kind}`} key={metric.kind}>
          <div className="metric-label"><Text variant="body-2" color="secondary">{metric.label}</Text><span className="metric-symbol" aria-hidden="true">{metric.kind === 'current' ? '◉' : metric.kind === 'average' ? '∅' : metric.kind === 'maximum' ? '↗' : 'P95'}</span></div>
          <div className="metric-number"><Text variant="display-2">{hasData ? number.format(metric.value) : '—'}</Text><Text variant="header-1" color="secondary">%</Text></div>
          <div className="metric-detail">{metric.kind === 'current' && ready && live && <span className="status-dot" />}<Text variant="caption-2" color="secondary">{metric.detail}</Text></div>
        </div>)}
      </section>
      <section className="chart-panel" aria-labelledby="cpu-heading">
        <div className="panel-header">
          <div className="panel-title-group"><div className="panel-title"><Text as="h2" variant="header-1" id="cpu-heading">Загрузка CPU</Text><span className="subtle-chip">CPU</span></div><Text variant="body-1" color="secondary">Использование процессорного времени</Text></div>
          <div className="panel-actions"><span className={`live-badge ${!live || status !== 'ready' ? 'is-paused' : ''}`}><span className="status-dot" />{status === 'error' ? 'Нет соединения' : status === 'loading' ? 'Подключение' : live ? 'В реальном времени' : 'На паузе'}</span><Button view="outlined" size="m" disabled={!hasData} onClick={() => exportCsv(snapshot)}>Экспорт CSV <span aria-hidden="true">↗</span></Button></div>
        </div>
        <div className="chart-toolbar">
          <div className="range-control" role="group" aria-label="Период графика">{[1, 6, 12, 24].map((value) => <Button key={value} size="m" view={hours === value ? 'raised' : 'flat'} selected={hours === value} aria-pressed={hours === value} onClick={() => setHours(value)}>{value} ч</Button>)}</div>
          <div className="chart-toolbar-right"><Text variant="caption-2" color="secondary" className="date-range">{end ? `${dateTime.format(end - hours * 3_600_000)} — ${dateTime.format(end)}` : 'Последние 24 часа'}</Text><span className="toolbar-divider" /><Switch checked={live} onUpdate={setLive} size="m" disabled={status !== 'ready'}>Автообновление</Switch></div>
        </div>
        <div className="chart-content">
          <div className="axis-caption"><Text variant="caption-2" color="secondary">Загрузка, %</Text>{zoomed && <Button size="xs" view="outlined" onClick={() => setResetKey((value) => value + 1)}>Сбросить масштаб</Button>}</div>
          {status === 'loading' ? <div className="chart-placeholder" role="status"><span className="loading-indicator" /><Text variant="body-2" color="secondary">Загружаем историю CPU…</Text></div>
            : status === 'error' ? <div className="chart-placeholder" role="alert"><Text variant="subheader-2">Не удалось получить данные</Text><Text variant="body-2" color="secondary">Проверьте соединение и попробуйте ещё раз.</Text><Button view="outlined" onClick={retry}>Повторить загрузку</Button></div>
              : !hasData ? <div className="chart-placeholder"><Text variant="subheader-2">Пока нет измерений</Text><Text variant="body-2" color="secondary">График появится, когда поступят данные CPU.</Text></div>
                : <CpuChart snapshot={snapshot} hours={hours} resetKey={resetKey} onZoom={onZoom} />}
          <div className="chart-legend"><span className="legend-line" /><Text variant="body-1">Загрузка CPU</Text><Text variant="body-1" color="secondary">{hasData ? `${number.format(snapshot.current)}%` : '—'}</Text></div>
        </div>
        <div className="chart-footer"><span className="interaction-tip"><span className="selection-symbol" aria-hidden="true">⊞</span>Выделите участок графика, чтобы приблизить</span><span>{integer.format(snapshot.timeline.length)} точек <span className="text-divider">·</span> {isDemo ? 'Шаг 2 секунды' : 'Последние 24 часа'}</span></div>
      </section>
      <section className="details-row" aria-label="Информация о метрике">
        <div className="detail-intro"><span className="info-mark" aria-hidden="true">i</span><div><Text as="h2" variant="subheader-2">О метрике</Text><Text as="p" variant="body-1" color="secondary">Доля времени, в течение которого процессор выполняет задачи.</Text></div></div>
        <div className="detail-property"><Text variant="caption-2" color="secondary">Единица измерения</Text><Text variant="body-2">Проценты, 0–100%</Text></div>
        <div className="detail-property"><Text variant="caption-2" color="secondary">Часовой пояс</Text><Text variant="body-2">{Intl.DateTimeFormat().resolvedOptions().timeZone}</Text></div>
        <div className="detail-property"><Text variant="caption-2" color="secondary">Источник данных</Text><Text variant="body-2">{isDemo ? 'Демонстрационный поток' : 'Сервис мониторинга'}</Text></div>
      </section>
      <footer className="page-footer"><Text variant="caption-2" color="secondary">pulse. / infrastructure monitoring</Text><Text variant="caption-2" color="secondary">{end ? `Последнее измерение ${new Date(end).toLocaleTimeString('ru-RU')}` : 'Ожидание данных'}</Text></footer>
    </main>
  </div>;
}
