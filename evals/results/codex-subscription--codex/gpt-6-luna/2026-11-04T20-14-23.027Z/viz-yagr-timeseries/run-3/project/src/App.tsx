import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import './app.css';

type Point = {time: number; value: number};
type ChartTheme = {grid: string; text: string; line: string; fill: string; crosshair: string};

const SAMPLE_STEP = 1_000;
const HISTORY = 24 * 60 * 60 * 1_000;
const INITIAL_COUNT = HISTORY / SAMPLE_STEP;
const ranges = [
  {label: '1 ч', duration: 60 * 60_000},
  {label: '6 ч', duration: 6 * 60 * 60_000},
  {label: '24 ч', duration: HISTORY},
];

function makePoint(time: number, index: number): Point {
  const wave = Math.sin(index / 160) * 8 + Math.sin(index / 29) * 3.5 + Math.sin(index / 7) * 1.3;
  const burst = Math.sin(index / 997) > 0.94 ? Math.abs(Math.sin(index / 3.7)) * 34 : 0;
  const value = Math.max(3, Math.min(98, 37 + wave + burst + (Math.random() - 0.5) * 3));
  return {time, value};
}

function formatTime(time: number, includeDate = false) {
  return new Intl.DateTimeFormat('ru-RU', includeDate
    ? {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}
    : {hour: '2-digit', minute: '2-digit'}).format(time);
}

export function App({onToggleTheme}: {onToggleTheme: () => void}) {
  const themeType = useThemeType();
  const dark = themeType === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const viewRef = useRef({duration: HISTORY, end: Date.now()});
  const pointerRef = useRef<{x: number; y: number; down: boolean; startX: number; startEnd: number} | null>(null);
  const hoverRef = useRef<{x: number; y: number; point: Point} | null>(null);
  const liveRef = useRef(true);
  const themeRef = useRef<ChartTheme | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const [selectedRange, setSelectedRange] = useState(HISTORY);
  const [hover, setHover] = useState<{x: number; y: number; point: Point} | null>(null);
  const [live, setLive] = useState(true);
  const [, setRefresh] = useState(0);

  const chartTheme: ChartTheme = dark
    ? {grid: 'rgba(215, 224, 236, .10)', text: '#8593a5', line: '#63a9ff', fill: 'rgba(66, 142, 235, .17)', crosshair: 'rgba(210, 224, 244, .42)'}
    : {grid: 'rgba(30, 54, 82, .10)', text: '#8391a3', line: '#2679d8', fill: 'rgba(38, 121, 216, .12)', crosshair: 'rgba(61, 83, 108, .38)'};
  themeRef.current = chartTheme;
  liveRef.current = live;
  hoverRef.current = hover;

  const initialData = useMemo(() => {
    const now = Date.now();
    return Array.from({length: INITIAL_COUNT}, (_, i) => makePoint(now - HISTORY + i * SAMPLE_STEP, i));
  }, []);

  const redraw = useCallback(() => {
    drawRef.current();
  }, []);

  useEffect(() => {
    pointsRef.current = initialData;
    const canvas = canvasRef.current;
    const wrapper = wrapRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const draw = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const bounds = wrapper.getBoundingClientRect();
        if (bounds.width < 1 || bounds.height < 1) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(bounds.width * dpr);
        const height = Math.round(bounds.height * dpr);
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          canvas.style.width = `${bounds.width}px`;
          canvas.style.height = `${bounds.height}px`;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const w = bounds.width;
        const h = bounds.height;
        const pad = {left: 48, right: 16, top: 16, bottom: 32};
        const plotW = w - pad.left - pad.right;
        const plotH = h - pad.top - pad.bottom;
        if (plotW <= 0 || plotH <= 0) return;
        const view = viewRef.current;
        const start = view.end - view.duration;
        const data = pointsRef.current;
        const first = Math.max(0, lowerBound(data, start) - 1);
        const last = Math.min(data.length, lowerBound(data, view.end) + 1);
        const visible = data.slice(first, last);
        const xAt = (time: number) => pad.left + ((time - start) / view.duration) * plotW;
        const yAt = (value: number) => pad.top + ((100 - value) / 100) * plotH;

        ctx.clearRect(0, 0, w, h);
        ctx.font = '11px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        const colors = themeRef.current!;
        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        for (let value = 0; value <= 100; value += 20) {
          const y = yAt(value);
          ctx.beginPath(); ctx.moveTo(pad.left, Math.round(y) + .5); ctx.lineTo(w - pad.right, Math.round(y) + .5); ctx.stroke();
          ctx.fillText(`${value}%`, pad.left - 10, y);
        }
        const tickCount = Math.max(2, Math.floor(plotW / 130));
        ctx.textAlign = 'center';
        for (let i = 0; i <= tickCount; i++) {
          const time = start + (view.duration * i) / tickCount;
          const x = xAt(time);
          ctx.beginPath(); ctx.moveTo(Math.round(x) + .5, pad.top); ctx.lineTo(Math.round(x) + .5, h - pad.bottom); ctx.stroke();
          ctx.fillText(formatTime(time), x, h - pad.bottom + 17);
        }

        // Min/max buckets keep sharp utilization spikes while limiting work to about 2 points per screen pixel.
        const buckets = new Map<number, {min: Point; max: Point}>();
        for (const point of visible) {
          const bucket = Math.floor(xAt(point.time));
          const found = buckets.get(bucket);
          if (!found) buckets.set(bucket, {min: point, max: point});
          else {
            if (point.value < found.min.value) found.min = point;
            if (point.value > found.max.value) found.max = point;
          }
        }
        const reduced = Array.from(buckets.values()).flatMap(({min, max}) => min.time <= max.time ? [min, ...(min === max ? [] : [max])] : [max, min]);
        ctx.beginPath();
          reduced.forEach((point, i) => {const x = xAt(point.time); const y = yAt(point.value); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);});
        if (reduced.length) {
          ctx.lineTo(xAt(reduced[reduced.length - 1].time), yAt(0));
          ctx.lineTo(xAt(reduced[0].time), yAt(0));
          ctx.closePath(); ctx.fillStyle = colors.fill; ctx.fill();
        }
        ctx.beginPath();
        reduced.forEach((point, i) => {const x = xAt(point.time); const y = yAt(point.value); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);});
        ctx.strokeStyle = colors.line; ctx.lineWidth = 1.8; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();

        const pointer = pointerRef.current;
        const currentHover = hoverRef.current;
        if (pointer && !pointer.down) {
          const px = pointer.x;
          ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, h - pad.bottom); ctx.strokeStyle = colors.crosshair; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
          if (currentHover) {
            const hx = xAt(currentHover.point.time), hy = yAt(currentHover.point.value);
            ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fillStyle = colors.line; ctx.fill();
            ctx.lineWidth = 2; ctx.strokeStyle = dark ? '#171e27' : '#fff'; ctx.stroke();
          }
        }
      });
    };
    drawRef.current = draw;
    draw();
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(wrapper);
    const timer = window.setInterval(() => {
      const points = pointsRef.current;
      const lastPoint = points[points.length - 1];
      const now = Math.max(Date.now(), lastPoint.time + SAMPLE_STEP);
      points.push(makePoint(now, points.length));
      const cutoff = now - HISTORY;
      let remove = 0;
      while (remove < points.length && points[remove].time < cutoff) remove++;
      if (remove) points.splice(0, remove);
      if (liveRef.current) viewRef.current.end = now;
      setRefresh((value) => value + 1);
      draw();
    }, 1_000);
    return () => {
      clearInterval(timer);
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
      drawRef.current = () => {};
    };
  }, [initialData]);

  useEffect(() => {redraw();}, [dark, redraw]);

  function lowerBound(points: Point[], time: number) {
    let low = 0, high = points.length;
    while (low < high) {const mid = (low + high) >>> 1; if (points[mid].time < time) low = mid + 1; else high = mid;}
    return low;
  }

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = pointerRef.current;
    if (pointer?.down) {
      const delta = event.clientX - pointer.startX;
      viewRef.current.end = pointer.startEnd - delta / rect.width * viewRef.current.duration;
      setLive(false);
      redraw();
      return;
    }
    const x = event.clientX - rect.left;
    const padLeft = 48, plotWidth = rect.width - 64;
    pointerRef.current = {x, y: event.clientY - rect.top, down: false, startX: event.clientX, startEnd: viewRef.current.end};
    if (x < padLeft || x > rect.width - 16) {hoverRef.current = null; setHover(null); redraw(); return;}
    const time = viewRef.current.end - viewRef.current.duration + (x - padLeft) / plotWidth * viewRef.current.duration;
    const pts = pointsRef.current;
    const index = lowerBound(pts, time);
    const point = pts[Math.min(pts.length - 1, index)] ?? pts[0];
    const nextHover = {x, y: event.clientY - rect.top, point};
    hoverRef.current = nextHover;
    setHover(nextHover);
    redraw();
  };

  const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const current = viewRef.current;
    const factor = event.deltaY < 0 ? .8 : 1.25;
    const nextDuration = Math.max(5 * 60_000, Math.min(HISTORY, current.duration * factor));
    const rect = event.currentTarget.getBoundingClientRect();
    const rel = Math.max(0, Math.min(1, (event.clientX - rect.left - 48) / (rect.width - 64)));
    const anchor = current.end - current.duration + current.duration * rel;
    current.duration = nextDuration;
    current.end = anchor + nextDuration * (1 - rel);
    setLive(false);
    setSelectedRange(nextDuration);
    redraw();
  };

  const active = pointsRef.current[pointsRef.current.length - 1]?.value ?? 0;
  const avg = pointsRef.current.length ? pointsRef.current.slice(-1200).reduce((sum, point) => sum + point.value, 0) / Math.min(1200, pointsRef.current.length) : 0;

  return <main className={`monitor-page ${dark ? 'is-dark' : 'is-light'}`}>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">◈</span><span>pulse<span className="brand-muted">watch</span></span></div>
      <div className="workspace"><span className="workspace-icon">A</span><span><b>Acme Cloud</b><small>Рабочее пространство</small></span><span className="chevron">⌄</span></div>
      <nav className="nav-list" aria-label="Основная навигация">
        <div className="nav-label">МОНИТОРИНГ</div>
        <a className="nav-item selected" href="#overview"><span>◫</span>Обзор системы</a>
        <a className="nav-item" href="#services"><span>▤</span>Сервисы <i>6</i></a>
        <a className="nav-item" href="#alerts"><span>♧</span>Оповещения <i className="alert-count">3</i></a>
        <div className="nav-label nav-spaced">УПРАВЛЕНИЕ</div>
        <a className="nav-item" href="#servers"><span>▦</span>Серверы</a>
        <a className="nav-item" href="#settings"><span>⚙</span>Настройки</a>
      </nav>
      <div className="sidebar-bottom"><div className="help-avatar">?</div><div><b>Центр помощи</b><small>Поддержка 24/7</small></div><span className="external">↗</span></div>
    </aside>
    <section className="main-area">
      <header className="topbar"><div className="breadcrumbs">Мониторинг <span>/</span> <b>Обзор системы</b></div><div className="top-actions"><div className="status-pill"><span></span>Все системы работают</div><button className="icon-button theme-button" onClick={onToggleTheme} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}>{dark ? '☼' : '☾'}</button><button className="icon-button" aria-label="Уведомления">♧<em></em></button><div className="profile">МК</div></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow">ИНФРАСТРУКТУРА <span>·</span> PROD-EU-WEST</div><h1>Обзор системы</h1><p>Состояние вашей инфраструктуры в реальном времени</p></div><button className="period-button">Последние 24 часа <span>⌄</span></button></div>
        <div className="metric-grid">
          <article className="metric-card"><div className="metric-top"><span>Загрузка CPU</span><span className="metric-icon cpu">◉</span></div><div className="metric-value">{active.toFixed(1)}<small>%</small><span className="trend up">↗ 2.4%</span></div><div className="metric-foot"><span>Среднее за 24 ч</span><b>{avg.toFixed(1)}%</b></div><div className="mini-line"><svg viewBox="0 0 160 34" preserveAspectRatio="none"><path d="M0 27 C15 25 20 8 35 14 S55 28 68 18 82 21 95 11 112 22 126 9 144 15 160 5" /></svg></div></article>
          <article className="metric-card"><div className="metric-top"><span>Использование памяти</span><span className="metric-icon memory">▥</span></div><div className="metric-value">68.2<small>%</small><span className="trend down">↘ 1.8%</span></div><div className="metric-foot"><span>13.6 ГБ из 20 ГБ</span><b>Норма</b></div><div className="progress-track"><span style={{width: '68.2%'}} /></div></article>
          <article className="metric-card"><div className="metric-top"><span>Сетевая нагрузка</span><span className="metric-icon network">⌁</span></div><div className="metric-value">1.24<small> ГБ/с</small><span className="trend up">↗ 8.1%</span></div><div className="metric-foot"><span>Входящий трафик</span><b>+12.8%</b></div><div className="network-bars">{[27,44,34,62,48,72,54,38,66,81,57,42,70,54,90,63,48,76,58,88].map((height, i) => <i key={i} style={{height: `${height}%`}} />)}</div></article>
          <article className="metric-card"><div className="metric-top"><span>Активные серверы</span><span className="metric-icon servers">▦</span></div><div className="metric-value">24<small> / 24</small><span className="healthy-mark">✓</span></div><div className="metric-foot"><span>Во всех регионах</span><b>100% uptime</b></div><div className="server-status">{Array.from({length: 24}, (_, i) => <i key={i} />)}</div></article>
        </div>
        <section className="chart-card">
          <div className="chart-header"><div><div className="chart-title-row"><h2>Загрузка CPU</h2><span className="live-label"><i />LIVE</span></div><p>Использование процессора во времени</p></div><div className="chart-tools"><div className="range-control">{ranges.map(({label, duration}) => <button key={duration} className={Math.abs(selectedRange - duration) < 60_000 ? 'active' : ''} onClick={() => {viewRef.current.duration = duration; viewRef.current.end = Date.now(); setSelectedRange(duration); setLive(true); redraw();}}>{label}</button>)}</div><button className="chart-menu" aria-label="Дополнительные параметры">···</button></div></div>
          <div className="chart-legend"><span><i />CPU usage</span><span className="legend-average"><i />Среднее</span><span className="legend-value">Текущее <b>{active.toFixed(1)}%</b></span></div>
          <div className="chart-wrap" ref={wrapRef}>
            <canvas ref={canvasRef} aria-label="Интерактивный график загрузки CPU за последние сутки" role="img" onPointerMove={onPointerMove} onPointerLeave={() => {pointerRef.current = null; hoverRef.current = null; setHover(null); redraw();}} onPointerDown={(event) => {pointerRef.current = {x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY, down: true, startX: event.clientX, startEnd: viewRef.current.end}; event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={() => {if (pointerRef.current) pointerRef.current.down = false;}} onWheel={onWheel} />
            {hover && <div className="chart-tooltip" style={{left: `${Math.min(Math.max(hover.x, 92), (wrapRef.current?.clientWidth ?? 300) - 88)}px`, top: `${Math.max(hover.y - 62, 4)}px`}}><strong>{hover.point.value.toFixed(1)}%</strong><span>{formatTime(hover.point.time, true)}</span></div>}
          </div>
          <div className="chart-footer"><span>Потяните график, чтобы переместиться во времени</span><span>Прокрутите для масштабирования <kbd>⌘</kbd> <kbd>+</kbd></span></div>
        </section>
        <section className="bottom-grid"><article className="activity-card"><div className="section-heading"><div><h2>Недавние события</h2><p>Последние изменения в системе</p></div><button>Все события <span>→</span></button></div><div className="event-row"><span className="event-icon success">✓</span><span className="event-copy"><b>Резервное копирование завершено</b><small>База данных production · 2.4 ГБ</small></span><time>2 мин назад</time></div><div className="event-row"><span className="event-icon info">↗</span><span className="event-copy"><b>Масштабирование кластера</b><small>Добавлено 2 новых инстанса · eu-west-1</small></span><time>18 мин назад</time></div></article><article className="region-card"><div className="section-heading"><div><h2>Регионы</h2><p>Здоровье инфраструктуры</p></div><button>Подробнее <span>→</span></button></div><div className="region-row"><span className="region-flag">🇩🇪</span><span className="region-copy"><b>Франкфурт</b><small>eu-central-1</small></span><span className="region-health"><i />Работает</span></div><div className="region-row"><span className="region-flag">🇮🇪</span><span className="region-copy"><b>Дублин</b><small>eu-west-1</small></span><span className="region-health"><i />Работает</span></div></article></section>
      </div>
    </section>
  </main>;
}
