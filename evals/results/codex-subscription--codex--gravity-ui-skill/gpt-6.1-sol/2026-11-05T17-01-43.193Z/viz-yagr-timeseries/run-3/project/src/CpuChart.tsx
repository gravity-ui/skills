import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import type {CpuSnapshot} from './cpu-data';

interface Props {
  snapshot: CpuSnapshot;
  hours: number;
  resetKey: number;
  onZoom: (zoomed: boolean) => void;
}

export function CpuChart({snapshot, hours, resetKey, onZoom}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<Yagr | null>(null);
  const latest = useRef({snapshot, hours, onZoom});
  latest.current = {snapshot, hours, onZoom};
  const zoomed = useRef(false);
  const theme = useThemeType();
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const root = container.current!;
    let chart: Yagr | null = null;
    let frame: number | undefined;
    let disposed = false;
    const initial = latest.current;
    const end = initial.snapshot.timeline.at(-1)!;
    setFailed(false);
    try {
      chart = new Yagr(root, {
        timeline: initial.snapshot.timeline,
        series: [{id: 'cpu', name: 'Загрузка CPU', data: initial.snapshot.values,
          type: 'area', color: 'var(--g-color-base-positive-light)', legendColorKey: 'lineColor',
          formatter: (value) => value === null ? '—' : `${Number(value).toFixed(1)} %`}],
        chart: {
          series: {type: 'area', lineColor: 'var(--g-color-line-positive)', lineWidth: 1.7},
          // Own the observer so pending callbacks can be cancelled completely on unmount.
          size: {adaptive: false},
          appearance: {theme, locale: 'ru'},
          timeMultiplier: 1,
          select: {zoom: true},
        },
        scales: {x: {min: end - initial.hours * 3_600_000, max: end}, y: {min: 0, max: 100}},
        axes: {
          x: {splitsCount: 6, grid: {show: false}},
          y: {splitsCount: 5, values: (_u, values) => values.map((value) => `${value}%`),
            grid: {stroke: () => getComputedStyle(root).getPropertyValue('--g-color-line-generic').trim(), width: 1, dash: [3, 4]}},
        },
        legend: {show: false},
        markers: {show: false},
        tooltip: {show: true, strategy: 'none', tracking: 'sticky',
          title: ({x}) => new Date(x).toLocaleString('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'})},
        hooks: {onSelect: [() => {zoomed.current = true; latest.current.onZoom(true);}]},
      });
      instance.current = chart;
    } catch {
      setFailed(true);
    }

    const observer = new ResizeObserver(() => {
      if (disposed || frame !== undefined || !chart) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        if (!disposed && root.clientWidth > 0 && root.clientHeight > 0) chart?.reflow();
      });
    });
    observer.observe(root);
    return () => {
      disposed = true;
      observer.disconnect();
      if (frame !== undefined) cancelAnimationFrame(frame);
      instance.current = null;
      chart?.dispose();
      // Also remove any partial initialization left behind after a renderer error.
      root.replaceChildren();
    };
  // Data, theme and range have separate imperative updates; the renderer stays mounted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]);

  useEffect(() => {
    const chart = instance.current;
    if (!chart) return;
    chart.setTheme(theme);
    chart.setSeries('cpu', {color: 'var(--g-color-base-positive-light)'});
    chart.redraw(true, true);
  }, [theme]);

  useEffect(() => {
    const chart = instance.current;
    if (!chart || !snapshot.timeline.length) return;
    const previous = chart.getScales('x').x;
    // In Yagr 5 a full timeline replacement through setSeries recreates uPlot.
    // Updating the timeline + existing series by id keeps Canvas and event handlers alive.
    chart.config.timeline = snapshot.timeline;
    chart.uplot.batch(() => {
      chart.setSeries('cpu', {data: snapshot.values});
      const end = snapshot.timeline.at(-1)!;
      // Yagr 5 setScales({x: ...}) rebuilds uPlot. Its public uplot instance
      // supports an inexpensive scale update and preserves user interaction.
      chart.uplot.setScale('x', zoomed.current ? previous : {min: end - hours * 3_600_000, max: end});
    });
  }, [snapshot, hours]);

  useEffect(() => {
    zoomed.current = false;
    onZoom(false);
    const end = latest.current.snapshot.timeline.at(-1);
    if (end !== undefined) instance.current?.uplot.setScale('x', {min: end - hours * 3_600_000, max: end});
  }, [hours, resetKey, onZoom]);

  return <div className="chart-stage">
    <div ref={container} className="cpu-chart" role="img" aria-label="Интерактивный график загрузки CPU. Выделите участок мышью для увеличения. Для выбора периода используйте кнопки над графиком." />
    {failed && <div className="chart-overlay" role="alert">
      <Text variant="subheader-2">Не удалось отобразить график</Text>
      <Button onClick={() => setRetry((value) => value + 1)}>Повторить</Button>
    </div>}
  </div>;
}
