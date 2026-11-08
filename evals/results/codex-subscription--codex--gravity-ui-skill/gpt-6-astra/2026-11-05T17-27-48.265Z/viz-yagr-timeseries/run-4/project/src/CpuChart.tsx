import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {CpuBuffer, DAY_MS, type CpuSnapshot, type CpuSource} from './cpu-data';

type State = 'loading' | 'ready' | 'empty' | 'error';
const ranges = [{hours: 1, label: '1 час'}, {hours: 6, label: '6 часов'}, {hours: 24, label: '24 часа'}];
const percent = (value: number | null) => value === null ? '—' : `${value.toLocaleString('ru-RU', {maximumFractionDigits: 1})} %`;
const time = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'});

export function CpuChart({source}: {source: CpuSource}) {
  const theme = useThemeType();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<Yagr | null>(null);
  const redraw = useRef<() => void>(() => {});
  const view = useRef({hours: 24, paused: false, zoom: null as {min: number; max: number} | null});
  const [hours, setHours] = useState(24);
  const [paused, setPaused] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [state, setState] = useState<State>('loading');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<CpuSnapshot | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = host.current!;
    const abort = new AbortController();
    const buffer = new CpuBuffer();
    const pending = new CpuBuffer();
    let disposed = false;
    let loaded = false;
    let dirty = true;
    let failed = false;
    let frame = 0;
    let resizeFrame = 0;
    let instance: Yagr | null = null;
    let unsubscribe = () => {};
    view.current.paused = false;
    setPaused(false);
    setState('loading');
    setError('');
    setStats(null);

    const fail = (reason: unknown) => {
      if (disposed) return;
      failed = true;
      setError(reason instanceof Error ? reason.message : 'Не удалось получить метрики CPU.');
      setState('error');
    };
    const scale = (now: number) => view.current.zoom ?? {min: now - view.current.hours * 3600_000, max: now};

    const render = () => {
      if (disposed || !loaded || view.current.paused || document.hidden) return;
      const now = Date.now();
      if (buffer.prune(now)) dirty = true;
      if (!dirty) return;
      dirty = false;
      const snapshot = buffer.snapshot();
      // Keep empty charts valid and leave gaps visible (null is not zero).
      const timeline = snapshot.count ? snapshot.timeline : [now - DAY_MS, now];
      const values = snapshot.count ? snapshot.values : [null, null];
      try {
        if (!instance) {
          instance = new Yagr(element, {
            timeline,
            series: [{id: 'cpu', name: 'Загрузка CPU', type: 'line', data: values,
              color: 'var(--g-color-text-info)',
              formatter: value => typeof value === 'number' ? percent(value) : 'Нет данных'}],
            chart: {
              // Own observer lets cleanup cancel pending resize frames as well.
              size: {adaptive: false}, timeMultiplier: 1,
              series: {type: 'line', width: 1.5, spanGaps: false},
              appearance: {theme: themeRef.current, locale: 'ru'},
              select: {zoom: true},
            },
            scales: {x: {time: true}, y: {min: 0, max: 100, range: () => [0, 100]}},
            axes: {y: {values: (_u, ticks) => ticks.map(value => `${value} %`)}},
            legend: {show: false},
            tooltip: {show: true, strategy: 'none'},
            hooks: {onSelect: [({from, to}) => {
              if (to <= from) return;
              view.current.zoom = {min: from, max: to};
              setZoomed(true);
            }]},
          });
          chart.current = instance;
        } else {
          // This single, aligned, untransformed series can use uPlot's setData
          // without Yagr setSeries(timeline, ..., {incremental:false}), which
          // recreates uPlot in Yagr 5.3. Keep tooltip/config data in sync.
          instance.config.timeline = timeline;
          instance.config.series[0].data = values;
          instance.series = [timeline, values];
          instance.uplot.setData(instance.series, false);
        }
        instance.uplot.setScale('x', {...scale(now)});
        instance.uplot.redraw();
        setStats(snapshot);
        if (!failed) setState(snapshot.values.some(value => value !== null) ? 'ready' : 'empty');
      } catch (reason) { fail(reason); }
    };
    const schedule = () => {
      if (disposed || frame) return;
      frame = requestAnimationFrame(() => { frame = 0; render(); });
    };
    redraw.current = () => { dirty = true; schedule(); };

    const observer = new ResizeObserver(() => {
      if (disposed || resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        if (!disposed && element.clientWidth && element.clientHeight) instance?.reflow();
      });
    });
    observer.observe(element);
    // Bound drawing to 4 Hz; incoming samples never trigger React renders.
    const timer = window.setInterval(schedule, 250);
    const onVisible = () => { if (!document.hidden) { dirty = true; schedule(); } };
    document.addEventListener('visibilitychange', onVisible);

    try {
      // Subscribe before history loads so samples during the request are retained.
      unsubscribe = source.subscribe(samples => {
        if (disposed) return;
        (loaded ? buffer : pending).append(samples);
        dirty = true;
      }, fail);
      void source.loadHistory(abort.signal).then(history => {
        if (disposed) return;
        buffer.append(history);
        const queued = pending.snapshot();
        buffer.append(queued.timeline.map((timestamp, i) => ({timestamp, value: queued.values[i]})));
        loaded = true;
        schedule();
      }).catch(fail);
    } catch (reason) { fail(reason); }

    return () => {
      disposed = true;
      abort.abort();
      unsubscribe();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      redraw.current = () => {};
      chart.current = null;
      instance?.dispose();
    };
  }, [source, attempt]);

  useEffect(() => {
    const instance = chart.current;
    if (!instance) return;
    instance.setTheme(theme);
    instance.setSeries('cpu', {color: 'var(--g-color-text-info)'});
    instance.redraw(true, true);
  }, [theme]);

  function selectRange(next: number) {
    view.current.hours = next;
    view.current.zoom = null;
    setHours(next);
    setZoomed(false);
    if (view.current.paused && chart.current) {
      const end = chart.current.config.timeline.at(-1) ?? Date.now();
      chart.current.uplot.setScale('x', {min: end - next * 3600_000, max: end});
    } else redraw.current();
  }

  function togglePaused() {
    view.current.paused = !view.current.paused;
    setPaused(view.current.paused);
    if (!view.current.paused) redraw.current();
  }

  return <section className="cpu-panel" aria-labelledby="cpu-title">
    <div className="panel-header">
      <div>
        <div className="title-line"><Text as="h2" variant="subheader-3" id="cpu-title">Загрузка CPU</Text>
          <span className={`live-status ${paused || state === 'error' ? 'live-status-muted' : ''}`}>
            <span className="status-dot" />{state === 'error' ? 'Ошибка потока' : state === 'loading' ? 'Подключение' : paused ? 'Пауза' : 'В реальном времени'}
          </span>
        </div>
        <Text color="secondary" variant="body-1">Использование процессора за последние сутки</Text>
      </div>
      <div className="range-controls" aria-label="Период графика">
        {ranges.map(range => <Button key={range.hours} view="outlined" selected={hours === range.hours && !zoomed}
          onClick={() => selectRange(range.hours)} aria-pressed={hours === range.hours && !zoomed}>{range.label}</Button>)}
      </div>
    </div>

    <div className="metrics">
      {[
        ['Текущая загрузка', stats?.current ?? null],
        ['Средняя за 24 часа', stats?.average ?? null],
        ['Пиковая за 24 часа', stats?.peak ?? null],
      ].map(([label, value]) => <div className="metric" key={label as string}>
        <Text color="secondary" variant="body-1">{label}</Text>
        <Text variant="display-1" className="metric-value">{percent(value as number | null)}</Text>
      </div>)}
    </div>

    <div className="chart-toolbar">
      <span className="series-label"><span className="series-swatch" /><Text variant="body-1">CPU</Text></span>
      <div className="chart-actions">
        <Button view="flat" onClick={() => selectRange(24)} disabled={!zoomed && hours === 24}>Сбросить масштаб</Button>
        <Button view="outlined" onClick={togglePaused} disabled={state === 'loading'} aria-pressed={paused}>
          {paused ? 'Продолжить' : 'Приостановить'}
        </Button>
      </div>
    </div>
    <div className="chart-wrap">
      <div ref={host} className="cpu-chart" role="img" aria-label={`График загрузки CPU, ${zoomed ? 'выбранная область' : `период ${hours} ч.`} Текущая загрузка ${percent(stats?.current ?? null)}.`} />
      {(state === 'loading' || state === 'empty') && <div className="chart-message" role="status">
        <Text variant="subheader-2">{state === 'loading' ? 'Загрузка метрик…' : 'Нет данных за последние сутки'}</Text>
        <Text color="secondary">{state === 'loading' ? 'Подготавливаем историю загрузки CPU' : 'График появится после получения измерений'}</Text>
      </div>}
    </div>
    {state === 'error' && <div className="error-message" role="alert">
      <Text>Ошибка получения метрик: {error}</Text>
      <Button onClick={() => { view.current.paused = false; setPaused(false); setAttempt(value => value + 1); }}>Повторить</Button>
    </div>}
    <div className="chart-footer">
      <Text color="secondary" variant="caption-2">Выделите область для увеличения · Время на устройстве</Text>
      <Text color="secondary" variant="caption-2">{stats ? `${stats.count.toLocaleString('ru-RU')} точек · Обновлено ${stats.lastTimestamp ? time.format(stats.lastTimestamp) : '—'}` : 'Ожидание данных'}</Text>
    </div>
  </section>;
}
