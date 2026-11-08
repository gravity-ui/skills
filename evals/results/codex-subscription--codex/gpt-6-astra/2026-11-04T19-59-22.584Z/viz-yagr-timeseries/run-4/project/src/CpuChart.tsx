import {useEffect, useId, useRef, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import './monitoring.css';
import {DAY_MS, dayWindow, type CpuData} from './cpuData';

interface ChartController {
  update: (data: CpuData) => void;
  showWindow: (duration: number) => void;
}

const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
});

export function CpuChart({data}: {data: CpuData}) {
  const helpId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const controllerRef = useRef<ChartController | null>(null);
  const theme = useThemeType();
  const initialTheme = useRef(theme);
  const [range, setRange] = useState<number | null>(DAY_MS);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const host = hostRef.current!;
    let disposed = false;
    let frame: number | null = null;
    let pending: CpuData | null = null;
    let resize = false;
    let followDuration: number | null = DAY_MS;
    const now = Date.now();
    const chart = new Yagr(host, {
      // Null endpoints keep the time axis usable before the first measurement.
      timeline: [now - DAY_MS, now],
      series: [{id: 'cpu', name: 'CPU', data: [null, null], color: '#4c8dff', type: 'line'}],
      chart: {
        series: {type: 'line', width: 1.5, spanGaps: false},
        appearance: {theme: initialTheme.current, locale: 'ru'},
        timeMultiplier: 1,
        size: {adaptive: false},
        select: {zoom: true},
      },
      scales: {y: {min: 0, max: 100}},
      axes: {y: {values: (_u, ticks) => ticks.map((value) => `${value}%`)}},
      legend: {show: false},
      markers: {show: false},
      cursor: {x: {visible: true}, y: {visible: false}},
      tooltip: {
        show: true,
        className: 'yagr-tooltip_default cpu-tooltip',
        strategy: 'none',
        title: ({x}) => timeFormatter.format(x),
        value: (value) => value === null ? 'Нет данных' : `${Number(value).toFixed(1)} %`,
      },
      hooks: {
        onSelect: [({from, to}) => {
          if (to > from) { followDuration = null; setRange(null); }
        }],
      },
    });
    chartRef.current = chart;

    function schedule() {
      if (disposed || frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        if (disposed) return;
        const currentTime = Date.now();
        const previousScale = chart.uplot.scales.x;
        const fixedRange = {min: previousScale.min!, max: previousScale.max!};
        chart.uplot.batch(() => {
          if (pending) {
            const window = dayWindow(pending, currentTime);
            pending = null;
            setEmpty(!window.values.some((value) => value !== null));
            // Yagr 5's timeline overload rebuilds uPlot for full snapshots.
            // Replace the public timeline, then update the existing series by ID
            // to preserve the canvas, plugins, and event handlers.
            chart.config.timeline = window.timeline.length ? window.timeline : [currentTime - DAY_MS, currentTime];
            chart.setSeries('cpu', {data: window.values.length ? window.values : [null, null]});
          }
          if (resize && host.clientWidth > 0 && host.clientHeight > 0) {
            resize = false;
            chart.plugins.tooltip?.reset();
            chart.reflow();
          }
          chart.uplot.setScale('x', followDuration === null
            ? fixedRange : {min: currentTime - followDuration, max: currentTime});
        });
      });
    }

    const observer = new ResizeObserver(() => { resize = true; schedule(); });
    observer.observe(host);
    controllerRef.current = {
      update: (next) => { pending = next; schedule(); },
      showWindow: (duration) => { followDuration = duration; schedule(); },
    };
    // Resume the rolling window on double-click, overriding the native reset.
    const reset = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      followDuration = DAY_MS;
      setRange(DAY_MS);
      schedule();
    };
    host.addEventListener('dblclick', reset, true);

    return () => {
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      observer.disconnect();
      host.removeEventListener('dblclick', reset, true);
      pending = null;
      controllerRef.current = null;
      chartRef.current = null;
      chart.dispose();
    };
  }, []);

  useEffect(() => { controllerRef.current?.update(data); }, [data]);
  useEffect(() => { chartRef.current?.setTheme(theme); }, [theme]);

  return (
    <div className="cpu-chart">
      <div className="chart-toolbar" role="group" aria-label="Период графика">
        {[1, 6, 24].map((hours) => (
          <Button key={hours} view={range === hours * 3_600_000 ? 'action' : 'outlined'}
            selected={range === hours * 3_600_000}
            onClick={() => {
              const duration = hours * 3_600_000;
              setRange(duration);
              controllerRef.current?.showWindow(duration);
            }}>
            {hours === 24 ? '24 часа · сейчас' : `${hours} ч`}
          </Button>
        ))}
        <span className="muted">{range === null ? 'Выбранный участок · обновление данных продолжается' : 'Следить за новыми данными'}</span>
      </div>
      <div className="chart-frame">
        <div ref={hostRef} className="chart-host" role="img"
          aria-label="График загрузки CPU от 0 до 100 процентов за последние сутки"
          aria-describedby={helpId} />
        {empty && <div className="chart-empty" role="status">Нет данных за последние сутки</div>}
      </div>
      <p id={helpId} className="chart-help muted">
        Наведите курсор, чтобы увидеть значение. Выделите участок для увеличения.
        Двойной щелчок или «24 часа · сейчас» возвращает последние сутки.
      </p>
    </div>
  );
}
