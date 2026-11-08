import {useEffect, useRef, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {DAY, type CpuData} from './cpuData';

const timeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const tooltipFormat = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'short', timeStyle: 'medium'});

// Null endpoints keep the chart initialized even while waiting for the first sample.
function chartData(data: CpuData): CpuData {
  if (data.timeline.length) return data;
  const now = Date.now();
  return {timeline: [now - DAY, now], values: [null, null]};
}

/** Accepts immutable, aligned snapshots; timestamps are Unix milliseconds. */
export function CpuChart({data}: {data: CpuData}) {
  const theme = useThemeType();
  const root = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const latest = useRef({data, theme});
  const schedule = useRef<(() => void) | null>(null);
  const following = useRef(true);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const element = root.current!;
    const initial = chartData(latest.current.data);
    let appliedData = latest.current.data;
    let appliedTheme = latest.current.theme;
    let frame: number | null = null;
    let needsResize = false;
    let disposed = false;
    const chart = new Yagr(element, {
      timeline: initial.timeline.slice(),
      series: [{id: 'cpu', name: 'CPU', data: initial.values.slice(), color: '#5282ff', type: 'line'}],
      chart: {
        series: {type: 'line', width: 1.5},
        // Our observer combines resize and stream updates in a cancellable frame.
        size: {adaptive: false},
        timeMultiplier: 1,
        appearance: {theme: appliedTheme, locale: 'ru'},
        select: {zoom: true, minWidth: 8},
      },
      scales: {y: {min: 0, max: 100}},
      axes: {
        x: {space: 90, values: (_chart, ticks) => ticks.map((tick) => timeFormat.format(tick))},
        y: {size: 55, values: (_chart, ticks) => ticks.map((tick) => `${tick}%`)},
      },
      legend: {show: false},
      markers: {show: false},
      cursor: {x: {visible: true}, y: {visible: false}, markersSize: 6},
      tooltip: {
        show: true, strategy: 'none', className: 'cpu-tooltip',
        title: ({x}) => tooltipFormat.format(x),
        value: (value) => typeof value === 'number' ? `${value.toLocaleString('ru-RU', {maximumFractionDigits: 1})} %` : 'Нет данных',
      },
      hooks: {
        onSelect: [() => {following.current = false; setZoomed(true);} ],
      },
    });
    chartRef.current = chart;
    const initialEnd = initial.timeline[initial.timeline.length - 1];
    chart.uplot.setScale('x', {min: initialEnd - DAY, max: initialEnd});

    const flush = () => {
      frame = null;
      if (disposed) return;
      const next = latest.current;
      const current = chartData(next.data);
      const previousRange = chart.getScales('x').x;
      chart.batch((batch) => {
        if (appliedTheme !== next.theme) {
          chart.setTheme(next.theme);
          appliedTheme = next.theme;
        }
        if (appliedData !== next.data) {
          // A stable series id avoids the full reinitialization of setConfig.
          chart.config.timeline = current.timeline;
          chart.setSeries('cpu', {data: current.values});
          appliedData = next.data;
          const end = current.timeline[current.timeline.length - 1];
          // Run after Yagr's queued setData, within the same uPlot redraw.
          batch.fns.push(() => chart.uplot.setScale('x', following.current ? {min: end - DAY, max: end} : previousRange));
        }
        if (needsResize && element.clientWidth > 0 && element.clientHeight > 0) {
          batch.fns.push(() => {
            chart.reflow(false);
            // setSize recalculates tick spacing; an extra redraw would cancel it in a batch.
            chart.uplot.setSize({width: chart.options.width, height: chart.options.height});
          });
          needsResize = false;
        }
      });
    };
    schedule.current = () => {
      if (!disposed && frame === null) frame = requestAnimationFrame(flush);
    };
    const observer = new ResizeObserver(() => {
      needsResize = true;
      schedule.current?.();
    });
    observer.observe(element);

    return () => {
      disposed = true;
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      schedule.current = null;
      chartRef.current = null;
      chart.dispose();
    };
  }, []);

  useEffect(() => {
    latest.current = {data, theme};
    schedule.current?.();
  }, [data, theme]);

  function setRange(duration: number) {
    const current = chartData(latest.current.data);
    const end = current.timeline[current.timeline.length - 1];
    following.current = duration === DAY;
    setZoomed(!following.current);
    chartRef.current?.uplot.setScale('x', {min: end - duration, max: end});
  }

  return (
    <div className="cpu-chart">
      <div className="chart-toolbar">
        <span className="series-label"><i />CPU, %</span>
        <div className="range-buttons" role="group" aria-label="Период графика">
          <Button view="flat" onClick={() => setRange(60 * 60 * 1000)}>Последний час</Button>
          <Button view={zoomed ? 'outlined' : 'flat-secondary'} onClick={() => setRange(DAY)}>Все 24 часа</Button>
        </div>
      </div>
      <div ref={root} className="cpu-chart-canvas" onDoubleClick={() => setRange(DAY)} role="img" aria-label="Интерактивный график загрузки CPU за последние сутки, от 0 до 100 процентов" />
      {data.timeline.length === 0 && <p className="muted">Ожидание данных CPU…</p>}
      <p className="chart-hint muted">Наведите курсор, чтобы увидеть значение. Выделите участок мышью для увеличения.{zoomed && ' Для возврата к текущим данным нажмите «Все 24 часа».'}</p>
    </div>
  );
}
