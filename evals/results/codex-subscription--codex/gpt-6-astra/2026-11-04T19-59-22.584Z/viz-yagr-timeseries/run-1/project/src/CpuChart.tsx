import {useEffect, useRef, useState} from 'react';
import {Button, useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {DAY_MS, type CpuSource} from './cpuData';

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const timeFormat = new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'});
const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function CpuChart({source}: {source: CpuSource}) {
  const theme = useThemeType();
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<Yagr | null>(null);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const followLive = useRef(true);
  const reset = useRef<() => void>(() => {});
  const [zoomed, setZoomed] = useState(false);
  const [summary, setSummary] = useState({current: 0, average: 0, max: 0, count: 0, time: 0});

  useEffect(() => {
    if (!host.current) return;
    let disposed = false;
    let frame = 0;
    let dataDirty = false;
    let sizeDirty = false;
    followLive.current = true;
    setZoomed(false);
    let snapshot = source.getSnapshot();
    const report = () => {
      let sum = 0;
      let max = 0;
      for (const value of snapshot.values) { sum += value; max = Math.max(max, value); }
      const count = snapshot.values.length;
      setSummary({
        current: snapshot.values[count - 1] ?? 0,
        average: count ? sum / count : 0, max, count,
        time: snapshot.timeline[count - 1] ?? 0,
      });
    };
    const end = snapshot.timeline.at(-1) ?? Date.now();
    const chart = new Yagr(host.current, {
      timeline: snapshot.timeline.length ? snapshot.timeline : [end - DAY_MS, end],
      series: [{id: 'cpu', name: 'Загрузка CPU', data: snapshot.values.length ? snapshot.values : [null, null],
        color: '#6c79ed', type: 'line'}],
      chart: {
        series: {type: 'line', width: 1.5},
        // Own observer lets cleanup cancel queued resize work as well.
        size: {adaptive: false},
        timeMultiplier: 1,
        appearance: {theme: themeRef.current, locale: 'ru'},
        select: {zoom: true, minWidth: 8},
      },
      scales: {x: {min: end - DAY_MS, max: end}, y: {min: 0, max: 100}},
      axes: {
        x: {space: 100, values: (_u, ticks) => ticks.map((value) => timeFormat.format(value))},
        y: {size: 56, values: (_u, ticks) => ticks.map((value) => `${value}%`)},
      },
      legend: {show: false},
      markers: {show: false},
      cursor: {x: {visible: true}, y: {visible: false}, markersSize: 6},
      tooltip: {
        className: 'yagr-tooltip_default cpu-tooltip',
        show: true, strategy: 'none', title: ({x}) => dateFormat.format(x),
        value: (value) => value === null ? 'Нет данных' : `${numberFormat.format(Number(value))}%`,
      },
      hooks: {onSelect: [() => { followLive.current = false; setZoomed(true); }]},
    });
    instance.current = chart;
    report();

    const updateRange = () => {
      const latest = snapshot.timeline.at(-1) ?? Date.now();
      chart.uplot.setScale('x', {min: latest - DAY_MS, max: latest});
    };
    reset.current = () => {
      followLive.current = true;
      setZoomed(false);
      updateRange();
    };
    const schedule = () => {
      if (disposed || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (disposed) return;
        if (dataDirty) {
          dataDirty = false;
          snapshot = source.getSnapshot();
          const {min, max} = chart.uplot.scales.x;
          chart.uplot.batch(() => {
            // Updating the existing series by ID avoids Yagr's full-chart rebuild.
            const latest = snapshot.timeline.at(-1) ?? Date.now();
            chart.config.timeline = snapshot.timeline.length ? snapshot.timeline : [latest - DAY_MS, latest];
            chart.setSeries('cpu', {data: snapshot.values.length ? snapshot.values : [null, null]});
            if (followLive.current) updateRange();
            else if (min != null && max != null) chart.uplot.setScale('x', {min, max});
          });
          report();
        }
        if (sizeDirty) {
          sizeDirty = false;
          chart.plugins.tooltip?.reset();
          chart.reflow();
        }
      });
    };
    const unsubscribe = source.subscribe(() => { dataDirty = true; schedule(); });
    const observer = new ResizeObserver(() => { sizeDirty = true; schedule(); });
    observer.observe(host.current);

    return () => {
      disposed = true;
      unsubscribe();
      observer.disconnect();
      cancelAnimationFrame(frame);
      reset.current = () => {};
      instance.current = null;
      chart.dispose();
    };
  }, [source]);

  useEffect(() => { instance.current?.setTheme(theme); }, [theme]);

  return (
    <section className="cpu-panel" aria-labelledby="cpu-title">
      <div className="panel-heading">
        <div><div className="eyebrow">ПРОЦЕССОР</div><h2 id="cpu-title">Загрузка CPU</h2></div>
        <div className="chart-actions">
          <span className="live-status"><span />Обновляется</span>
          <Button onClick={() => reset.current()} view={zoomed ? 'action' : 'outlined'}>
            {zoomed ? 'Вернуться к 24 часам' : 'Последние 24 часа'}
          </Button>
        </div>
      </div>
      <div className="metrics">
        <div><span>Сейчас</span><strong>{summary.count ? numberFormat.format(summary.current) : '—'}<small>%</small></strong></div>
        <div><span>Среднее за сутки</span><strong>{summary.count ? numberFormat.format(summary.average) : '—'}<small>%</small></strong></div>
        <div><span>Максимум за сутки</span><strong>{summary.count ? numberFormat.format(summary.max) : '—'}<small>%</small></strong></div>
      </div>
      <div className="chart-host" ref={host} role="img"
        aria-label={summary.count ? `Загрузка CPU за сутки. Сейчас ${numberFormat.format(summary.current)}%, максимум ${numberFormat.format(summary.max)}%.` : 'Загрузка CPU: нет данных.'}
        aria-describedby="chart-help" />
      <div className="chart-footer">
        <span className="series-key"><i />Загрузка CPU</span>
        <span>{numberFormat.format(summary.count)} точек · {summary.time ? `Обновлено ${timeFormat.format(summary.time)}` : 'Нет данных'}</span>
      </div>
      <p id="chart-help" className="chart-help">Наведите курсор, чтобы увидеть значение. Выделите участок для увеличения. Кнопка «Вернуться к 24 часам» сбрасывает масштаб. Время местное.</p>
    </section>
  );
}
