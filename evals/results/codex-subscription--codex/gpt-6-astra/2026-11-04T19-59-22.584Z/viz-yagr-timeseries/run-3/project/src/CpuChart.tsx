import {useEffect, useRef, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {CpuBuffer, DAY_MS, type CpuSource} from './cpu-data';

const percent = (value: number | null) => value === null ? '—' : `${value.toFixed(1)} %`;
const timeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'});

type Summary = {current: number | null; average: number | null; peak: number | null; count: number};
const emptySummary: Summary = {current: null, average: null, peak: null, count: 0};

export function CpuChart({source}: {source: CpuSource}) {
  const theme = useThemeType();
  const initialTheme = useRef(theme);
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [zoomed, setZoomed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let frame = 0, resizeFrame = 0;
    let pending: number | undefined;
    let follow = true;
    let lastPaint = 0;
    let unsubscribe = () => {};
    const buffer = new CpuBuffer();
    setError(false);
    setZoomed(false);
    try {
      buffer.append(source.getHistory());
    } catch {
      setError(true);
    }
    const data = buffer.snapshot();
    const now = Date.now();
    const chart = new Yagr(host, {
      timeline: data.timeline.length ? data.timeline : [now],
      series: [{id: 'cpu', name: 'CPU', data: data.values.length ? data.values : [null],
        color: '#7c6cf2', formatter: value => value === null ? 'Нет данных' : `${Number(value).toFixed(1)} %`}],
      chart: {
        series: {type: 'line', width: 1.5, fill: 'rgba(124, 108, 242, 0.10)', spanGaps: false},
        appearance: {theme: initialTheme.current, locale: 'ru'},
        timeMultiplier: 1,
        size: {adaptive: false},
        select: {zoom: true, minWidth: 8},
      },
      scales: {x: {min: now - DAY_MS, max: now}, y: {min: 0, max: 100}},
      axes: {
        x: {
          space: 90,
          values: (plot, ticks) => {
            // Keep labels readable even while resizing a zoomed chart.
            let previous = -Infinity;
            return ticks.map(timestamp => {
              if (timestamp == null) return '';
              const position = plot.valToPos(timestamp, 'x');
              if (position - previous < 64) return '';
              previous = position;
              return timeFormat.format(timestamp);
            });
          },
        },
        y: {values: (_u, ticks) => ticks.map(v => `${v}%`), size: 54},
      },
      legend: {show: false},
      markers: {show: false},
      tooltip: {show: true, strategy: 'pin', title: ({x}) => dateFormat.format(x)},
      cursor: {x: {visible: true}, y: {visible: false}},
      hooks: {onSelect: [() => { follow = false; setZoomed(true); }]},
    });
    chartRef.current = chart;

    const updateSummary = (snapshot: ReturnType<CpuBuffer['snapshot']>) => {
      setSummary({current: snapshot.current, average: snapshot.average,
        peak: snapshot.peak, count: snapshot.timeline.length});
    };
    updateSummary(data);

    const paint = () => {
      frame = 0;
      if (disposed) return;
      lastPaint = performance.now();
      const now = Date.now();
      buffer.prune(now);
      const snapshot = buffer.snapshot();
      const {min, max} = chart.uplot.scales.x;
      // Update the existing series by ID. Replacing the full Yagr config would
      // rebuild uPlot. Wrap data + range changes in one canvas redraw.
      chart.uplot.batch(() => {
        // A null placeholder keeps the series initialized before the first
        // sample; it is never included in displayed statistics.
        chart.config.timeline = snapshot.timeline.length ? snapshot.timeline : [now];
        chart.setSeries('cpu', {data: snapshot.values.length ? snapshot.values : [null]});
        chart.uplot.setScale('x', follow || min == null || max == null
          ? {min: now - DAY_MS, max: now} : {min, max});
      });
      updateSummary(snapshot);
    };
    // Coalesce bursty streams, at most ten paints/second. Hidden tabs retain
    // only a bounded buffer and a single pending animation frame.
    const schedule = () => {
      if (disposed || pending !== undefined || frame) return;
      pending = window.setTimeout(() => {
        pending = undefined;
        frame = requestAnimationFrame(paint);
      }, Math.max(0, 100 - (performance.now() - lastPaint)));
    };
    resetRef.current = () => { follow = true; setZoomed(false); schedule(); };
    try {
      unsubscribe = source.subscribe(samples => {
        if (disposed) return;
        buffer.append(samples);
        schedule();
      });
    } catch {
      setError(true);
    }
    // Prune stale samples even if the stream stops delivering new data.
    const expiryTimer = window.setInterval(schedule, 1000);
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        if (!disposed && host.clientWidth > 0 && host.clientHeight > 0) chart.reflow();
      });
    });
    observer.observe(host);

    return () => {
      disposed = true;
      unsubscribe();
      clearInterval(expiryTimer);
      clearTimeout(pending);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      resetRef.current = () => {};
      chartRef.current = null;
      chart.dispose();
      host.replaceChildren();
    };
  }, [source]);

  useEffect(() => {
    initialTheme.current = theme;
    chartRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <section className="cpu-panel" aria-labelledby="cpu-title">
      <div className="panel-heading">
        <div><div className="eyebrow">ПРОИЗВОДИТЕЛЬНОСТЬ</div><h2 id="cpu-title">Загрузка CPU</h2></div>
        <span className="period">Последние 24 часа</span>
      </div>
      <div className="metrics">
        <div><span>Текущая загрузка</span><strong className="metric-current">{percent(summary.current)}</strong></div>
        <div><span>Средняя за сутки</span><strong>{percent(summary.average)}</strong></div>
        <div><span>Пиковая за сутки</span><strong>{percent(summary.peak)}</strong></div>
      </div>
      <div className="chart-toolbar">
        <span className="series-label"><i /> CPU <span className="muted">· загрузка, %</span></span>
        <Button size="s" view="outlined" onClick={() => resetRef.current()} disabled={!zoomed}>Сбросить масштаб</Button>
      </div>
      <div className="chart-wrap">
        <div ref={hostRef} className="cpu-chart" role="img" aria-label={`Загрузка CPU за сутки. Текущая: ${percent(summary.current)}. Средняя: ${percent(summary.average)}. Пиковая: ${percent(summary.peak)}.`} />
        {summary.count === 0 && <div className="chart-empty" role="status">Ожидание данных CPU…</div>}
      </div>
      {error && <p role="alert">Не удалось подключиться к потоку метрик.</p>}
      <div className="chart-footer"><span>Наведите курсор для просмотра · Выделите участок для увеличения</span><span>{summary.count.toLocaleString('ru-RU')} точек · {Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
    </section>
  );
}
