import {useEffect, useId, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {CpuBuffer, DAY_MS, type CpuSource} from './cpuData';

const LINE_COLOR = 'var(--g-color-text-info)';
const percent = (value: number | null) => value === null ? '—' : `${value.toFixed(1)} %`;
type Summary = Omit<ReturnType<CpuBuffer['snapshot']>, 'timeline' | 'values'> & {points: number};

export function CpuLoadChart({source}: {source: CpuSource}) {
  const theme = useThemeType();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const titleId = useId();
  const hintId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const controller = new AbortController();
    let buffer = new CpuBuffer();
    let initialized = false;
    let disposed = false;
    let failed = false;
    let dirty = true;
    let timer: number | undefined;
    let frame: number | undefined;
    let resizeFrame: number | undefined;
    let expiryTimer: number | undefined;
    let chart: Yagr | null = null;
    let zoom: {min: number; max: number} | null = null;
    let unsubscribe: (() => void) | undefined;
    setStatus('loading');
    setSummary(null);

    function fail() {
      if (disposed || failed) return;
      failed = true;
      controller.abort();
      unsubscribe?.();
      unsubscribe = undefined;
      window.clearTimeout(timer);
      window.clearInterval(expiryTimer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
      setStatus('error');
    }

    function range() {
      const now = Date.now();
      return zoom ?? {min: now - DAY_MS, max: now};
    }

    function flush() {
      frame = undefined;
      if (disposed || failed || !initialized || !dirty) return;
      dirty = false;
      buffer.prune(Date.now());
      const data = buffer.snapshot();
      try {
        if (!data.timeline.length && chart) {
          chart.dispose();
          chart = null;
          chartRef.current = null;
          host.replaceChildren();
        } else if (!chart && data.timeline.length) {
          chart = new Yagr(host, {
            timeline: data.timeline,
            series: [{id: 'cpu', name: 'Загрузка CPU', data: data.values,
              color: LINE_COLOR, type: 'line'}],
            chart: {
              // Own observer below has cancellable animation frames, unlike the internal debounce.
              size: {adaptive: false},
              appearance: {theme: themeRef.current, locale: 'ru'},
              timeMultiplier: 1,
              series: {type: 'line', width: 1, spanGaps: false},
              select: {zoom: true},
            },
            scales: {x: {time: true}, y: {min: 0, max: 100}},
            axes: {y: {values: (_, ticks) => ticks.map((value) => `${value} %`)}},
            legend: {show: false},
            tooltip: {show: true, strategy: 'none',
              value: (value) => value === null ? 'Нет данных' : `${Number(value).toFixed(1)} %`},
            hooks: {
              onSelect: [({from, to}) => { zoom = {min: from, max: to}; }],
              error: [fail],
            },
          });
          chartRef.current = chart;
          chart.uplot.setScale('x', range());
        } else if (chart) {
          chart.batch((batch) => {
            // YAGR 5's full timeline setSeries overload rebuilds uPlot. Updating its public
            // timeline followed by the series-id overload recalculates data in place instead.
            chart!.config.timeline = data.timeline;
            chart!.setSeries('cpu', {data: data.values});
            // Keep data replacement and the final viewport within one uPlot paint.
            batch.fns.push(() => chart!.uplot.setScale('x', range()));
          });
        }
        if (!failed) {
          setSummary({count: data.count, current: data.current, average: data.average,
            max: data.max, points: data.timeline.length});
          setStatus('ready');
        }
      } catch {
        fail();
      }
    }

    function schedule() {
      if (disposed || failed || !initialized || timer !== undefined || frame !== undefined) return;
      // At most ten paints per second, regardless of the stream's arrival rate.
      timer = window.setTimeout(() => {
        timer = undefined;
        frame = requestAnimationFrame(flush);
      }, 100);
    }

    resetRef.current = () => {
      zoom = null;
      chart?.uplot.setScale('x', range());
    };
    const resetZoom = () => resetRef.current();
    host.addEventListener('dblclick', resetZoom);

    let previousWidth = 0;
    let previousHeight = 0;
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      if (width <= 0 || height <= 0 || (width === previousWidth && height === previousHeight)) return;
      previousWidth = width;
      previousHeight = height;
      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = undefined;
        if (!disposed && !failed) chart?.reflow();
      });
    });
    observer.observe(host);

    // Subscribe before loading history so samples arriving during the request are retained.
    try {
      unsubscribe = source.subscribe((samples) => {
        if (disposed || failed) return;
        buffer.append(samples, Date.now());
        dirty = true;
        schedule();
      }, fail);
      if (failed) {
        unsubscribe();
        unsubscribe = undefined;
      }
      else {
        const now = Date.now();
        source.loadHistory(now - DAY_MS, now, controller.signal).then((history) => {
          if (disposed || failed) return;
          const pending = buffer.snapshot();
          const merged = [...history, ...pending.timeline.map((timestamp, i) =>
            ({timestamp, value: pending.values[i]}))].sort((a, b) => a.timestamp - b.timestamp);
          buffer = new CpuBuffer();
          buffer.append(merged, Date.now());
          initialized = true;
          dirty = true;
          schedule();
        }).catch(fail);
      }
    } catch {
      fail();
    }

    // Expire old samples even if the live stream goes silent.
    if (!failed) expiryTimer = window.setInterval(() => {
      if (disposed || failed) return;
      if (buffer.prune(Date.now()) || (initialized && !zoom && chart)) {
        dirty = true;
        schedule();
      }
    }, 1_000);

    return () => {
      disposed = true;
      controller.abort();
      unsubscribe?.();
      window.clearInterval(expiryTimer);
      window.clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      host.removeEventListener('dblclick', resetZoom);
      resetRef.current = () => {};
      chartRef.current = null;
      chart?.dispose();
      host.replaceChildren();
    };
  }, [source, attempt]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setTheme(theme);
    // Resolve the semantic series color again after the provider changes CSS tokens.
    chart.setSeries('cpu', {color: LINE_COLOR});
    chart.redraw(true, true);
  }, [theme]);

  return (
    <section className="cpu-panel" aria-labelledby={titleId}>
      <div className="cpu-panel__header">
        <div className="cpu-panel__title">
          <span className="cpu-panel__swatch" aria-hidden="true" />
          <Text as="h2" variant="subheader-3" id={titleId}>Загрузка CPU</Text>
          <Text variant="caption-2" color="secondary">24 часа</Text>
        </div>
        <Button onClick={() => resetRef.current()} disabled={!summary?.points || status === 'error'}>
          Последние 24 ч
        </Button>
      </div>

      <div className="cpu-panel__stats">
        {([
          ['Сейчас', summary?.current ?? null],
          ['Среднее за сутки', summary?.average ?? null],
          ['Максимум за сутки', summary?.max ?? null],
        ] satisfies [string, number | null][]).map(([label, value]) => (
          <div className="cpu-panel__stat" key={label}>
            <Text color="secondary" variant="caption-2">{label}</Text>
            <Text variant="header-2">{percent(value)}</Text>
          </div>
        ))}
      </div>

      <div className="cpu-panel__plot">
        <div ref={hostRef} className="cpu-panel__canvas" role="img"
          aria-label={`Загрузка CPU за последние сутки. Сейчас: ${percent(summary?.current ?? null)}.`}
          aria-describedby={hintId} aria-busy={status === 'loading'} />
        {(status !== 'ready' || !summary?.count) && (
          <div className="cpu-panel__state" role="status">
            <Text color={status === 'error' ? 'danger' : 'secondary'}>
              {status === 'loading' ? 'Загружаем историю CPU…' :
                status === 'error' ? 'Не удалось получить или отобразить метрики CPU.' :
                  'За последние сутки нет измерений CPU.'}
            </Text>
            {status === 'error' && <Button onClick={() => setAttempt((value) => value + 1)}>Повторить</Button>}
          </div>
        )}
      </div>

      <footer className="cpu-panel__footer">
        <Text id={hintId} color="secondary" variant="caption-2">
          Наведите курсор для просмотра · выделите диапазон для увеличения · двойной щелчок для сброса
        </Text>
        <Text color="secondary" variant="caption-2">
          {summary ? `${summary.points.toLocaleString('ru-RU')} точек` : 'Загрузка…'} · время местное
        </Text>
      </footer>
    </section>
  );
}
