import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {CpuBuffer, DAY_MS, type CpuSource} from './cpu-source';

export function CpuChart({source}: {source: CpuSource}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const followRef = useRef(true);
  const theme = useThemeType();
  const themeRef = useRef(theme);
  const [status, setStatus] = useState('Загрузка метрик…');
  const [latest, setLatest] = useState<number | null>(null);
  const [count, setCount] = useState(0);
  const [following, setFollowing] = useState(true);

  useEffect(() => {
    themeRef.current = theme;
    const chart = chartRef.current;
    if (chart) {
      chart.setTheme(theme);
      chart.setSeries('cpu', {color: 'var(--g-color-text-info)'});
    }
  }, [theme]);

  useEffect(() => {
    const host = hostRef.current!;
    const buffer = new CpuBuffer();
    let disposed = false;
    let received = false;
    let failed = false;
    let frame = 0;
    let timer = 0;
    let unsubscribe = () => {};
    followRef.current = true;
    setFollowing(true);
    setStatus('Загрузка метрик…');
    setLatest(null);
    setCount(0);

    const render = () => {
      frame = 0;
      if (disposed) return;
      const now = Date.now();
      const [timeline, values] = buffer.snapshot(now);
      setCount(timeline.length);
      setLatest(values.at(-1) ?? null);
      if (!failed) setStatus(!received ? 'Загрузка метрик…' : !timeline.length ? 'За последние сутки нет данных' : '');
      if (!timeline.length) {
        chartRef.current?.dispose();
        chartRef.current = null;
        return;
      }
      // Retry a hidden container when ResizeObserver reports it becoming visible.
      if (host.clientWidth === 0 || host.clientHeight === 0) return;
      let chart = chartRef.current;
      if (!chart) {
        chart = new Yagr(host, {
          timeline,
          series: [{id: 'cpu', name: 'CPU', type: 'line', data: values, color: 'var(--g-color-text-info)'}],
          chart: {
            series: {type: 'line', width: 1.5, spanGaps: false},
            timeMultiplier: 1,
            size: {adaptive: false},
            appearance: {theme: themeRef.current, locale: 'ru'},
            select: {zoom: true},
          },
          scales: {y: {min: 0, max: 100}},
          axes: {y: {values: (_u, ticks) => ticks.map(value => `${value}%`)}},
          legend: {show: false},
          tooltip: {show: true, value: value => value === null ? 'Нет данных' : `${value}%`},
          hooks: {onSelect: [({from, to}) => {
            if (to > from) {
              followRef.current = false;
              setFollowing(false);
            }
          }]},
        });
        chartRef.current = chart;
      } else {
        const currentChart = chart;
        const range = currentChart.getScales('x').x;
        // Updating by ID preserves the canvas. The full dataset overload in
        // YAGR 5.3 recreates uPlot, so replace the timeline before updating by ID.
        currentChart.config.timeline = timeline;
        currentChart.uplot.batch(() => {
          currentChart.setSeries('cpu', {data: values});
          if (!followRef.current) currentChart.uplot.setScale('x', range);
        });
      }
      if (followRef.current) chart.uplot.setScale('x', {min: now - DAY_MS, max: now});
    };

    // Coalesce bursts: at most 4 data redraws/s, aligned with a browser frame.
    const schedule = () => {
      if (disposed || timer || frame) return;
      timer = window.setTimeout(() => {
        timer = 0;
        frame = requestAnimationFrame(render);
      }, 250);
    };
    // Own the observer to cancel every pending callback on unmount. YAGR's
    // built-in adaptive mode uses a debounced callback without cancellation.
    const observer = new ResizeObserver(() => {
      if (disposed) return;
      chartRef.current?.reflow();
      schedule();
    });
    observer.observe(host);
    const expireTimer = window.setInterval(schedule, 1000);
    const onError = () => {
      if (disposed) return;
      failed = true;
      setStatus('Не удалось получить метрики. Ожидаем восстановления потока.');
    };
    try {
      unsubscribe = source.subscribe(samples => {
        if (disposed) return;
        received = true;
        failed = false;
        buffer.append(samples, Date.now());
        schedule();
      }, onError);
    } catch {
      onError();
    }
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.clearInterval(expireTimer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      try { unsubscribe(); } finally {
        chartRef.current?.dispose();
        chartRef.current = null;
      }
    };
  }, [source]);

  const resetZoom = () => {
    followRef.current = true;
    setFollowing(true);
    const now = Date.now();
    chartRef.current?.uplot.setScale('x', {min: now - DAY_MS, max: now});
  };

  return (
    <section className="cpu-panel" aria-labelledby="cpu-title">
      <div className="cpu-toolbar">
        <div className="cpu-heading">
          <Text as="h2" id="cpu-title" variant="header-2">Загрузка CPU</Text>
          <Text color="secondary">Последние 24 часа · время браузера</Text>
        </div>
        <Button view="outlined" onClick={resetZoom}>Показать сутки</Button>
      </div>
      <div className="cpu-summary">
        <Text variant="display-1">{latest === null ? '—' : `${latest.toFixed(1)}%`}</Text>
        <Text color="secondary">Последнее измерение · {count.toLocaleString('ru-RU')} точек</Text>
      </div>
      <div className="cpu-plot-wrapper">
        <div ref={hostRef} className="cpu-plot" role="img" aria-label="Интерактивный график загрузки CPU за последние сутки, от 0 до 100 процентов" />
        {status && <div className="cpu-status" role="status"><Text>{status}</Text></div>}
      </div>
      <Text as="p" color="secondary" variant="body-1">
        Наведите курсор для просмотра значения. Выделите участок мышью, чтобы увеличить его.
        {' '}{following ? 'Окно следует за текущим временем.' : 'Масштаб сохранён; новые метрики продолжают поступать.'}
      </Text>
    </section>
  );
}
