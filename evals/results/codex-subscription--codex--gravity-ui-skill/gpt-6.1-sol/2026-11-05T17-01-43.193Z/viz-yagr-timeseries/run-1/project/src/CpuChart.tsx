import {useEffect, useRef, useState} from 'react';
import {Button, Text, useThemeValue} from '@gravity-ui/uikit';
import Yagr, {type YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import {CpuBuffer, DAY_MS} from './cpuData';
import type {CpuSource} from './cpuSource';

type Stats = Omit<ReturnType<CpuBuffer['snapshot']>, 'timeline' | 'data'>;
type Status = 'loading' | 'ready' | 'empty' | 'error';
const percent = (value: number | undefined) => value === undefined ? '—' : `${value.toLocaleString('ru-RU', {maximumFractionDigits: 1})} %`;
const timeFormat = new Intl.DateTimeFormat('ru-RU', {timeZone: 'UTC', hour: '2-digit', minute: '2-digit'});
const tooltipTimeFormat = new Intl.DateTimeFormat('ru-RU', {timeZone: 'UTC',
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'});

export function CpuChart({source}: {source: CpuSource}) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<Yagr | null>(null);
  const themeValue = useThemeValue();
  const theme: YagrTheme = themeValue === 'dark-hc' ? 'dark-hc' : themeValue === 'light-hc'
    ? 'light-hc' : themeValue.startsWith('dark') ? 'dark' : 'light';
  const currentTheme = useRef(theme);
  currentTheme.current = theme;
  const paused = useRef(false);
  const follow = useRef(true);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [stats, setStats] = useState<Stats>();
  const reset = useRef<() => void>(() => {});

  useEffect(() => {
    if (!container.current) return;
    const host = container.current;
    const controller = new AbortController();
    const buffer = new CpuBuffer();
    const pending = new CpuBuffer();
    let loaded = false;
    let failed = false;
    let dirty = false;
    let frame = 0;
    let stop: (() => void) | undefined;
    follow.current = true;
    setStatus('loading');
    setStats(undefined);
    setError('');

    const fail = (cause: unknown) => {
      if (controller.signal.aborted) return;
      failed = true;
      stop?.();
      setError(cause instanceof Error ? cause.message : 'Не удалось получить метрики');
      setStatus('error');
    };

    const flush = () => {
      frame = 0;
      if (controller.signal.aborted || failed || !loaded || paused.current) return;
      const now = Date.now();
      dirty = buffer.expire(now) || dirty;
      if (!dirty) return;
      dirty = false;
      const snapshot = buffer.snapshot();
      const {timeline: _timeline, data: _data, ...summary} = snapshot;
      setStats(summary);
      setStatus(snapshot.count ? 'ready' : 'empty');
      if (!snapshot.count) {
        chart.current?.dispose();
        chart.current = null;
        return;
      }

      const range = {min: now - DAY_MS, max: now};
      if (!chart.current) {
        chart.current = new Yagr(host, {
          timeline: snapshot.timeline,
          series: [{id: 'cpu', name: 'Загрузка CPU', data: snapshot.data,
            type: 'line', color: 'var(--g-color-text-info)',
            formatter: (value) => percent(typeof value === 'number' ? value : undefined)}],
          chart: {
            series: {type: 'line', width: 1.5},
            timeMultiplier: 1,
            size: {adaptive: false},
            appearance: {theme: currentTheme.current, locale: 'ru'},
            select: {zoom: true},
          },
          scales: {x: {time: true}, y: {min: 0, max: 100}},
          axes: {
            x: {values: (_u, ticks) => ticks.map((tick) => timeFormat.format(tick))},
            y: {values: (_u, ticks) => ticks.map((tick) => `${tick} %`), size: 56},
          },
          markers: {show: false},
          legend: {show: false},
          tooltip: {show: true, strategy: 'none', title: ({x}) => `${tooltipTimeFormat.format(x)} UTC`},
          hooks: {onSelect: [() => {follow.current = false;}]},
        });
        chart.current.uplot.setScale('x', range);
      } else {
        const instance = chart.current;
        const selected = instance.getScales().x;
        // In YAGR 5, setSeries(timeline, series) rebuilds uPlot. Updating the
        // public timeline and the existing series by ID keeps the engine alive.
        instance.config.timeline = snapshot.timeline;
        instance.uplot.batch(() => {
          instance.setSeries('cpu', {data: snapshot.data});
          instance.uplot.setScale('x', follow.current ? range : selected);
        });
      }
    };

    const schedule = () => {
      if (!frame && !controller.signal.aborted && !failed) {
        frame = requestAnimationFrame(() => {
          try { flush(); } catch (cause) { fail(cause); }
        });
      }
    };
    reset.current = () => {
      follow.current = true;
      const now = Date.now();
      chart.current?.uplot.setScale('x', {min: now - DAY_MS, max: now});
    };

    // Own the observer so disconnecting it also eliminates pending resize work.
    const observer = new ResizeObserver(() => {
      if (!controller.signal.aborted) chart.current?.reflow();
    });
    observer.observe(host);
    const timer = window.setInterval(schedule, 250);
    try {
      stop = source.subscribe((samples) => {
        if (controller.signal.aborted || failed) return;
        (loaded ? buffer : pending).append(samples, Date.now());
        dirty = true;
      }, fail);
      if (failed) stop();
      const to = Date.now();
      void source.loadHistory({from: to - DAY_MS, to, signal: controller.signal}).then((history) => {
        if (controller.signal.aborted || failed) return;
        const now = Date.now();
        buffer.append(history, now);
        const live = pending.snapshot();
        buffer.append(live.timeline.map((timestamp, i) => ({timestamp, value: live.data[i]})), now);
        loaded = true;
        dirty = true;
        schedule();
      }).catch(fail);
    } catch (cause) {
      fail(cause);
    }

    return () => {
      controller.abort();
      stop?.();
      window.clearInterval(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      reset.current = () => {};
      chart.current?.dispose();
      chart.current = null;
      host.replaceChildren();
    };
  }, [source, attempt]);

  useEffect(() => {
    const instance = chart.current;
    if (instance) {
      instance.setTheme(theme);
      // Re-resolve semantic CSS color after UIKit changes the theme variables.
      instance.setSeries('cpu', {color: 'var(--g-color-text-info)'});
      instance.redraw();
    }
  }, [theme]);

  return (
    <section className="cpu-panel" aria-labelledby="cpu-heading">
      <div className="panel-heading">
        <div className="panel-title">
          <Text as="h2" id="cpu-heading" variant="subheader-3">Загрузка CPU</Text>
          <span className={`stream-status ${isPaused || status !== 'ready' ? 'stream-status_idle' : ''}`}>
            <span className="status-dot" />
            {status === 'error' ? 'Нет соединения' : status === 'loading' ? 'Подключение' : isPaused ? 'Пауза отображения' : status === 'empty' ? 'Нет данных' : 'В реальном времени'}
          </span>
        </div>
        <div className="chart-controls">
          <Button view="outlined" onClick={() => reset.current()} disabled={status !== 'ready'}>Последние 24 часа</Button>
          <Button view="normal" disabled={status === 'loading' || status === 'error'} onClick={() => {
            paused.current = !paused.current;
            setIsPaused(paused.current);
          }}>{isPaused ? 'Продолжить' : 'Пауза'}</Button>
        </div>
      </div>

      <div className="cpu-stats">
        {[
          ['Сейчас', percent(stats?.current)],
          ['Средняя за сутки', percent(stats?.average)],
          ['Пик за сутки', percent(stats?.peak)],
          ['Точек за сутки', stats ? stats.count.toLocaleString('ru-RU') : '—'],
        ].map(([label, value]) => (
          <div className="cpu-stat" key={label}>
            <Text variant="body-1" color="secondary">{label}</Text>
            <Text variant="header-2">{value}</Text>
          </div>
        ))}
      </div>

      <div className="chart-stage">
        <div ref={container} className="cpu-chart" role="img"
          aria-label={`Интерактивный график загрузки CPU за последние 24 часа. Сейчас ${percent(stats?.current)}.`} />
        {status !== 'ready' && (
          <div className="chart-state" role={status === 'error' ? 'alert' : 'status'}>
            <Text variant="subheader-2">{status === 'loading' ? 'Загрузка метрик…' : status === 'error' ? 'Не удалось обновить график' : 'За последние сутки нет данных'}</Text>
            <Text variant="body-1" color="secondary">{status === 'error' ? error : status === 'empty' ? 'Новые измерения появятся здесь автоматически.' : 'Получаем историю и подключаем поток.'}</Text>
            {status === 'error' && <Button view="outlined" onClick={() => {
              paused.current = false;
              setIsPaused(false);
              setAttempt((value) => value + 1);
            }}>Повторить</Button>}
          </div>
        )}
      </div>
      <div className="chart-caption">
        <span className="series-key"><span className="series-swatch" />Загрузка CPU</span>
        <Text variant="caption-2" color="secondary">Наведите для просмотра · выделите диапазон для увеличения · кнопка «Последние 24 часа» сбрасывает масштаб</Text>
      </div>
    </section>
  );
}
