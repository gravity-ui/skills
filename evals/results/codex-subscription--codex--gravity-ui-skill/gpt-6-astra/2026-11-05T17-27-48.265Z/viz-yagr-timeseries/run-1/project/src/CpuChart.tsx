import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {CpuBuffer, DAY_MS, type CpuSource} from './cpu-data';
import './monitoring.css';

export function CpuChart({source}: {source: CpuSource}) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<Yagr | null>(null);
  const theme = useThemeType();
  const currentTheme = useRef(theme);
  currentTheme.current = theme;
  const reset = useRef<() => void>(() => {});
  const [summary, setSummary] = useState({count: 0, value: null as number | null});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const host = container.current!;
    const buffer = new CpuBuffer();
    let disposed = false;
    let dirty = true;
    let resized = true;
    let frame = 0;
    let range: {min: number; max: number} | null = null;
    let lastSecond = 0;
    setStatus('loading');
    setSummary({count: 0, value: null});
    setZoomed(false);

    const render = () => {
      frame = 0;
      if (disposed || host.clientWidth === 0 || host.clientHeight === 0) return;
      const now = Date.now();
      dirty = buffer.prune(now) || dirty;
      const second = Math.floor(now / 1000);
      const xRange = range ?? {min: now - DAY_MS, max: now};
      let instance = chart.current;
      if (dirty) {
        const snapshot = buffer.snapshot();
        setSummary({count: snapshot.data.length, value: snapshot.data.at(-1) ?? null});
        // A null placeholder keeps the chart alive across empty/live transitions.
        const timeline = snapshot.timeline.length ? snapshot.timeline : [now];
        const data = snapshot.data.length ? snapshot.data : [null];
        if (!instance) {
          instance = new Yagr(host, {
            timeline,
            series: [{id: 'cpu', name: 'CPU', data, color: 'var(--g-color-text-info)', type: 'line'}],
            chart: {
              // Own observer allows us to cancel pending resize work on unmount.
              size: {adaptive: false},
              appearance: {theme: currentTheme.current, locale: 'ru'},
              timeMultiplier: 1,
              select: {zoom: false},
            },
            scales: {x: xRange, y: {min: 0, max: 100}},
            axes: {y: {values: (_u, values) => values.map((value) => `${value}%`)}},
            markers: {show: false},
            cursor: {x: {visible: true}, y: {visible: false}},
            tooltip: {show: true, value: (value) => value === null ? 'Нет данных' : `${Number(value).toFixed(1)}%`},
            hooks: {
              onSelect: [({from, to}) => {
                if (to <= from) return;
                range = {min: from, max: to};
                chart.current?.uplot.setScale('x', range);
                setZoomed(true);
              }],
            },
          });
          chart.current = instance;
          instance.uplot.setScale('x', xRange);
        } else {
          // Yagr 5's full setSeries(timeline, series, {incremental:false}) rebuilds uPlot.
          // Replace the public config timeline, then update the existing series by id;
          // this runs Yagr's data processing and setData without reinitialization.
          instance.config.timeline = timeline;
          instance.uplot.batch(() => {
            instance!.setSeries('cpu', {data});
            // Yagr.setScales({x: ...}) also rebuilds uPlot in v5; use its public instance.
            instance!.uplot.setScale('x', xRange);
          });
        }
        dirty = false;
      } else if (instance && !range && second !== lastSecond) {
        instance.uplot.setScale('x', xRange);
      }
      if (resized && instance) {
        instance.reflow();
        resized = false;
      }
      lastSecond = second;
    };

    const schedule = () => {
      if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    reset.current = () => {
      range = null;
      lastSecond = 0;
      setZoomed(false);
      schedule();
    };
    const observer = new ResizeObserver(() => {resized = true; schedule();});
    observer.observe(host);
    // Bound redraws to 4/s even if the source sends thousands of events per second.
    // Incoming samples remain outside React state and the buffer is bounded in background tabs.
    const timer = window.setInterval(schedule, 250);
    document.addEventListener('visibilitychange', schedule);
    let unsubscribe = () => {};
    try {
      unsubscribe = source.subscribe((samples) => {
        if (disposed) return;
        buffer.append(samples, Date.now());
        dirty = true;
        setStatus('ready');
      }, () => {if (!disposed) setStatus('error');});
    } catch {
      setStatus('error');
    }
    schedule();

    return () => {
      disposed = true;
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      reset.current = () => {};
      try {
        unsubscribe();
      } finally {
        chart.current?.dispose();
        chart.current = null;
        host.replaceChildren();
      }
    };
  }, [source]);

  useEffect(() => {
    const instance = chart.current;
    if (!instance) return;
    instance.batch(() => {
      instance.setTheme(theme);
      // Resolve the semantic CSS color again after the provider changes theme.
      instance.setSeries('cpu', {color: 'var(--g-color-text-info)'});
    });
  }, [theme]);

  return (
    <section className="cpu-panel" aria-labelledby="cpu-heading">
      <div className="cpu-toolbar">
        <div className="cpu-title">
          <Text as="h2" variant="header-1" id="cpu-heading">Загрузка CPU</Text>
          <Text color="secondary">Последние 24 часа · обновление в реальном времени</Text>
        </div>
        <Button view="outlined" onClick={() => reset.current()} disabled={!zoomed}>Вернуться к 24 часам</Button>
      </div>
      <div className="cpu-summary">
        <Text variant="display-1">{summary.value === null ? '—' : `${summary.value.toFixed(1)}%`}</Text>
        <Text color="secondary">Последнее значение · {summary.count.toLocaleString('ru-RU')} точек</Text>
      </div>
      <div className="cpu-plot-wrap" aria-busy={status === 'loading'}>
        <div ref={container} className="cpu-plot" role="img" aria-label="График загрузки CPU от 0 до 100 процентов за последние сутки" />
        {summary.count === 0 && status !== 'error' && (
          <div className="cpu-placeholder" role="status">
            <Text color="secondary">{status === 'loading' ? 'Загрузка метрик…' : 'Нет данных за последние сутки'}</Text>
          </div>
        )}
      </div>
      {status === 'error' && <Text as="p" color="danger" role="alert">Не удалось получить метрики. Показаны последние доступные данные.</Text>}
      <Text as="p" color="secondary" variant="body-1">
        Наведите курсор, чтобы увидеть значение. Выделите участок графика для увеличения.
        {zoomed && ' Автопрокрутка приостановлена; данные продолжают поступать.'}
      </Text>
    </section>
  );
}
