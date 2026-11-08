import {useEffect, useRef, useState} from 'react';
import Yagr, {type YagrTheme} from '@gravity-ui/yagr';
import {Button, Switch, Text, useThemeType, useThemeValue} from '@gravity-ui/uikit';
import {CpuWindow, DAY_MS, type CpuDataSource, type CpuStats} from './cpu-data';

const number = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});
const time = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const dateTime = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'});
const emptyStats: CpuStats = {current: null, average: null, max: null, points: 0, updatedAt: null};
const percent = (value: number | null) => value === null ? '—' : `${number.format(value)} %`;

export function CpuChart({source}: {source: CpuDataSource}) {
  const themeValue = useThemeValue();
  const themeType = useThemeType();
  const theme = themeValue === 'light-hc' ? 'light-hc' : themeValue === 'dark-hc' ? 'dark-hc' : themeType;
  const themeRef = useRef<YagrTheme>(theme);
  themeRef.current = theme;
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<Yagr | null>(null);
  const renderRef = useRef<(() => void) | null>(null);
  const followRef = useRef(true);
  const periodRef = useRef(DAY_MS);
  const [following, setFollowing] = useState(true);
  const [period, setPeriod] = useState(DAY_MS);
  const [stats, setStats] = useState(emptyStats);
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const element = host.current;
    const controller = new AbortController();
    const windowData = new CpuWindow();
    const pending = new CpuWindow();
    let loaded = false;
    let stopped = false;
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let frame: number | undefined;
    let lastRender = -Infinity;
    let instance: Yagr | null = null;
    setState('loading');
    setError(null);
    setStats(emptyStats);

    function fail() {
      if (stopped) return;
      setError('Не удалось получить данные CPU. Проверьте подключение и повторите попытку.');
      setState('error');
    }

    function render() {
      if (stopped || !loaded || !host.current) return;
      lastRender = performance.now();
      const now = Date.now();
      const snapshot = windowData.snapshot(now);
      setStats(snapshot.stats);
      if (!snapshot.timeline.length) {
        setState('empty');
        return;
      }
      const end = Math.max(now, snapshot.timeline.at(-1)!);
      if (!instance) {
        instance = new Yagr(host.current, {
          timeline: snapshot.timeline,
          series: [{id: 'cpu', name: 'Загрузка CPU', data: snapshot.values,
            color: 'var(--g-color-text-info)'}],
          chart: {
            series: {type: 'line', width: 1.5, spanGaps: false,
              fill: () => getComputedStyle(element!).getPropertyValue('--g-color-base-info-light').trim()},
            size: {adaptive: true, resizeDebounceMs: 60},
            appearance: {theme: themeRef.current, locale: 'ru'},
            timeMultiplier: 1,
            select: {zoom: true, minWidth: 12},
          },
          scales: {x: {time: true}, y: {min: 0, max: 100}},
          axes: {
            x: {space: 100, values: (_u, ticks) => ticks.map((tick) => time.format(tick))},
            y: {values: (_u, ticks) => ticks.map((tick) => `${tick} %`), splitsCount: 5},
          },
          legend: {show: false},
          tooltip: {show: true, strategy: 'none', value: (value) => value === null ? 'Нет данных' : `${number.format(Number(value))} %`,
            title: ({x}) => dateTime.format(x)},
          cursor: {x: {visible: true}, y: {visible: false}, markersSize: 5},
          hooks: {
            onSelect: [() => {
              followRef.current = false;
              setFollowing(false);
            }],
            error: [fail],
          },
        });
        instance.uplot.setScale('x', {min: end - periodRef.current, max: end});
        chart.current = instance;
      } else {
        const range = instance.uplot.scales.x;
        const min = followRef.current ? end - periodRef.current : range.min ?? end - periodRef.current;
        const max = followRef.current ? end : range.max ?? end;
        // Yagr 5's full timeline overload rebuilds uPlot. Replace the public
        // timeline and update the existing series by ID to retain the instance.
        instance.config.timeline = snapshot.timeline;
        instance.batch((update) => {
          instance!.setSeries('cpu', {data: snapshot.values});
          // Yagr's setScales for x also rebuilds uPlot. Queue the native scale
          // update in the same render transaction as its data update instead.
          update.fns.push(() => instance!.uplot.setScale('x', {min, max}));
        });
      }
      setState('ready');
    }

    function schedule() {
      if (stopped || timer !== undefined || frame !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        frame = requestAnimationFrame(() => {
          frame = undefined;
          try { render(); } catch { fail(); }
        });
      }, Math.max(0, 250 - (performance.now() - lastRender)));
    }

    renderRef.current = schedule;
    // Subscribe before fetching history so samples arriving during the fetch
    // are retained. The pending ring also bounds memory for a slow request.
    try {
      unsubscribe = source.subscribe((samples) => {
        if (stopped) return;
        (loaded ? windowData : pending).append(samples);
        if (loaded) {
          setError(null);
          schedule();
        }
      }, fail);
      void source.loadHistory(controller.signal).then((samples) => {
        if (stopped) return;
        windowData.append(samples);
        const buffered = pending.snapshot(Date.now());
        windowData.append(buffered.timeline.map((timestamp, i) => ({timestamp, value: buffered.values[i]})));
        loaded = true;
        schedule();
      }).catch(() => { if (!controller.signal.aborted) fail(); });
    } catch { fail(); }

    // Expire old points even when the upstream connection stops sending data.
    const expiryTimer = setInterval(() => { if (loaded) schedule(); }, 10_000);
    return () => {
      stopped = true;
      controller.abort();
      clearInterval(expiryTimer);
      if (timer !== undefined) clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      renderRef.current = null;
      chart.current = null;
      try { unsubscribe?.(); } finally {
        instance?.resizeOb?.disconnect();
        instance?.dispose();
        element?.replaceChildren();
      }
    };
  }, [source, retry]);

  useEffect(() => {
    const instance = chart.current;
    if (!instance) return;
    instance.setTheme(theme);
    // Re-resolve the semantic series colors when the provider theme changes.
    instance.setSeries('cpu', {color: 'var(--g-color-text-info)'});
  }, [theme]);

  function changePeriod(next: number) {
    periodRef.current = next;
    setPeriod(next);
    followRef.current = true;
    setFollowing(true);
    renderRef.current?.();
  }

  return (
    <section className="cpu-section" aria-label="Мониторинг загрузки CPU">
      <div className="metrics">
        <Metric label="Текущая загрузка" value={percent(stats.current)} detail="Последнее измерение" primary />
        <Metric label="Средняя за сутки" value={percent(stats.average)} detail="За последние 24 часа" />
        <Metric label="Пиковая за сутки" value={percent(stats.max)} detail="Максимальная загрузка" />
      </div>
      <div className="chart-card">
        <div className="chart-heading">
          <div className="chart-title">
            <Text as="h2" variant="subheader-3">Загрузка CPU</Text>
            <Text variant="body-1" color="secondary">Использование процессора за последние сутки</Text>
          </div>
          <div className="periods" role="group" aria-label="Видимый период">
            {[[3_600_000, '1 час'], [21_600_000, '6 часов'], [DAY_MS, '24 часа']].map(([value, label]) => (
              <Button key={value} view={period === value ? 'normal' : 'flat'} selected={period === value}
                aria-pressed={period === value} size="m" onClick={() => changePeriod(Number(value))}>{label}</Button>
            ))}
          </div>
        </div>
        <div className="chart-toolbar">
          <span className="series-label"><span className="series-swatch" />CPU, %</span>
          <Switch checked={following} onUpdate={(value) => {
            followRef.current = value;
            setFollowing(value);
            if (value) renderRef.current?.();
          }}>Автослежение</Switch>
        </div>
        {error && <div className="chart-error" role="alert">
          <Text>{error}</Text>
          <Button size="s" onClick={() => setRetry((value) => value + 1)}>Повторить</Button>
        </div>}
        <div className="chart-stage" aria-busy={state === 'loading'}>
          <div ref={host} className="cpu-chart" role="img"
            aria-label={`Загрузка CPU за сутки. Сейчас: ${percent(stats.current)}. Средняя: ${percent(stats.average)}. Пик: ${percent(stats.max)}.`} />
          {(state === 'loading' || state === 'empty' || (state === 'error' && !stats.points)) && (
            <div className="chart-placeholder" role="status">
              <Text variant="body-2" color="secondary">{state === 'loading' ? 'Загружаем историю CPU…' : state === 'empty' ? 'За последние сутки пока нет измерений' : 'Данные недоступны'}</Text>
            </div>
          )}
        </div>
        <div className="chart-footer">
          <Text color="secondary" variant="caption-2">Выделите участок, чтобы приблизить. <Button size="xs" view="flat" onClick={() => changePeriod(DAY_MS)}>Сбросить масштаб</Button></Text>
          <Text color="secondary" variant="caption-2">Время: {Intl.DateTimeFormat().resolvedOptions().timeZone}</Text>
        </div>
      </div>
      <div className="data-footer">
        <Text color="secondary" variant="caption-2">{number.format(stats.points)} измерений за сутки</Text>
        <Text color="secondary" variant="caption-2">{stats.updatedAt ? `Последнее измерение: ${dateTime.format(stats.updatedAt)}` : 'Ожидание данных'}</Text>
      </div>
    </section>
  );
}

function Metric({label, value, detail, primary = false}: {label: string; value: string; detail: string; primary?: boolean}) {
  return <div className={`metric${primary ? ' metric-primary' : ''}`}>
    <Text variant="body-2" color="secondary">{label}</Text>
    <Text variant="display-1" className="metric-value">{value}</Text>
    <Text variant="caption-2" color="secondary">{detail}</Text>
  </div>;
}
