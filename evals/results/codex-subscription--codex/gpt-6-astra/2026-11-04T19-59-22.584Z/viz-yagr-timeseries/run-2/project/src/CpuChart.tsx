import {useEffect, useRef, useState} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import './monitoring.css';
import {CpuWindow, DAY_MS, type CpuDataSource, type CpuSample} from './cpuData';

const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const numberFormat = new Intl.NumberFormat('ru-RU');

export function CpuChart({source}: {source: CpuDataSource}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  const resetRef = useRef<() => void>(() => {});
  const theme = useThemeType();
  const themeRef = useRef(theme);
  const [zoomed, setZoomed] = useState(false);
  const [summary, setSummary] = useState<{count: number; latest: CpuSample | null}>({count: 0, latest: null});

  useEffect(() => {
    const container = containerRef.current!;
    const windowData = new CpuWindow();
    windowData.append(source.getHistory(), Date.now());
    let range: [number, number] | null = null;
    let disposed = false;
    let frame: number | null = null;
    let resizePending = false;
    const getRange = (): [number, number] => {
      const now = Date.now();
      return range ?? [now - DAY_MS, now];
    };
    const initial = windowData.snapshot(Date.now());
    // Null endpoints keep an empty chart initialized and able to receive live data.
    const chart = new Yagr(container, {
      timeline: initial.count ? initial.timeline : getRange(),
      series: [{
        id: 'cpu', name: 'CPU', data: initial.count ? initial.values : [null, null],
        type: 'line', color: '#5089f5',
      }],
      chart: {
        series: {type: 'line', width: 1.5, spanGaps: false},
        timeMultiplier: 1,
        size: {adaptive: false},
        appearance: {theme: themeRef.current, locale: 'ru'},
        select: {zoom: false, minWidth: 8},
      },
      scales: {y: {min: 0, max: 100}},
      axes: {y: {values: (_plot, ticks) => ticks.map((value) => `${value}%`)}},
      legend: {show: false},
      markers: {show: false},
      tooltip: {
        className: `yagr-tooltip_default cpu-tooltip cpu-tooltip--${themeRef.current}`,
        show: true, strategy: 'none', title: ({x}) => timeFormat.format(x),
        value: (value) => value === null ? 'Нет данных' : `${Number(value).toFixed(1)} %`,
      },
      cursor: {x: {visible: true, style: '1px dashed #8a8a8a'}, y: {visible: false}},
      editUplotOptions: (options) => {
        options.scales!.x = {...options.scales!.x, range: () => getRange()};
        return options;
      },
      hooks: {
        onSelect: [({from, to}) => {
          if (to <= from) return;
          range = [from, to];
          setZoomed(true);
          chart.uplot.setScale('x', {min: from, max: to});
        }],
      },
    });
    chartRef.current = chart;
    setZoomed(false);
    setSummary({count: initial.count, latest: initial.latest});

    function flush() {
      frame = null;
      if (disposed) return;
      const snapshot = windowData.snapshot(Date.now());
      // Updating one existing series avoids Yagr's full setConfig/setSeries rebuild.
      // Keep its timeline aligned before Yagr processes the new values.
      chart.config.timeline = snapshot.count ? snapshot.timeline : getRange();
      chart.setSeries('cpu', {data: snapshot.count ? snapshot.values : [null, null]});
      if (resizePending) {
        resizePending = false;
        if (container.clientWidth > 0 && container.clientHeight > 0) chart.reflow();
      }
      setSummary({count: snapshot.count, latest: snapshot.latest});
    }

    function schedule() {
      if (!disposed && frame === null) frame = requestAnimationFrame(flush);
    }

    resetRef.current = () => {
      range = null;
      setZoomed(false);
      const [min, max] = getRange();
      chart.uplot.setScale('x', {min, max});
    };

    // Own the observer and animation frame so both can be cancelled on unmount.
    const observer = new ResizeObserver(() => {
      resizePending = true;
      schedule();
    });
    observer.observe(container);
    const unsubscribe = source.subscribe((samples) => {
      if (disposed) return;
      windowData.append(samples, Date.now());
      schedule();
    });
    // Advance the 24-hour window even when no measurements arrive.
    const timer = window.setInterval(schedule, 1000);

    return () => {
      disposed = true;
      unsubscribe();
      window.clearInterval(timer);
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      resetRef.current = () => {};
      chartRef.current = null;
      chart.dispose();
      container.replaceChildren();
    };
  }, [source]);

  useEffect(() => {
    themeRef.current = theme;
    chartRef.current?.setTheme(theme);
    chartRef.current?.plugins.tooltip?.updateOptions({
      className: `yagr-tooltip_default cpu-tooltip cpu-tooltip--${theme}`,
    });
  }, [theme]);

  return (
    <section className="cpu-card" aria-labelledby="cpu-title">
      <div className="cpu-toolbar">
        <div>
          <h2 id="cpu-title">Загрузка CPU</h2>
          <p className="muted">{zoomed ? 'Выбранный интервал' : 'Последние 24 часа'} · время браузера</p>
        </div>
        <div className="cpu-actions">
          <span className="live-badge"><span /> Обновляется</span>
          <button type="button" onClick={() => resetRef.current()} disabled={!zoomed}>Сбросить масштаб</button>
        </div>
      </div>
      <div className="cpu-summary">
        <div><span className="muted">Последнее измерение</span><strong>{summary.latest?.value == null ? '—' : `${summary.latest.value.toFixed(1)} %`}</strong></div>
        <div><span className="muted">Точек за сутки</span><strong>{numberFormat.format(summary.count)}</strong></div>
        <div><span className="muted">Обновлено</span><strong className="cpu-timestamp">{summary.latest ? timeFormat.format(summary.latest.timestamp) : 'Нет данных'}</strong></div>
      </div>
      <div className="cpu-plot-wrap">
        <div ref={containerRef} className="cpu-plot" role="img"
          aria-label="Интерактивный график загрузки CPU от 0 до 100 процентов за последние сутки"
          onDoubleClick={() => resetRef.current()} />
        {summary.count === 0 && <p className="cpu-empty">Ожидание данных CPU…</p>}
      </div>
      <footer className="cpu-footer">
        <span><i className="cpu-legend" /> CPU, %</span>
        <span>Наведите курсор для деталей · Выделите участок для увеличения</span>
      </footer>
    </section>
  );
}
