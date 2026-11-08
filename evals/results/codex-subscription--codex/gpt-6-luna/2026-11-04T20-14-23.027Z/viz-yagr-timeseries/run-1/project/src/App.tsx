import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import './app.css';

type Point = {time: number; value: number};
type Range = {from: number; to: number};

const DAY = 24 * 60 * 60 * 1000;
const POINTS = 30_000;
const BLUE = '#4b83f4';

function seededValue(index: number) {
  const wave = 27 + 9 * Math.sin(index / 820) + 5 * Math.sin(index / 93);
  const noise = Math.sin(index * 12.9898) * 4.7 + Math.sin(index * 0.71) * 2.4;
  const peak = index % 3700 > 3250 && index % 3700 < 3320 ? 21 : 0;
  return Math.max(4, Math.min(96, wave + noise + peak));
}

function makeInitialData(now: number): Point[] {
  return Array.from({length: POINTS}, (_, index) => ({
    time: now - DAY + (index * DAY) / (POINTS - 1),
    value: seededValue(index),
  }));
}

function formatTime(time: number, withDate = false) {
  return new Intl.DateTimeFormat('ru-RU', withDate
    ? {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}
    : {hour: '2-digit', minute: '2-digit'}).format(time);
}

function formatDuration(ms: number) {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
}

function CpuChart({data, dark}: {data: Point[]; dark: boolean}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{x: number; range: Range} | null>(null);
  const [size, setSize] = useState({width: 0, height: 0});
  const [range, setRange] = useState<Range>(() => ({from: Date.now() - DAY, to: Date.now()}));
  const [hover, setHover] = useState<{x: number; y: number; point: Point} | null>(null);
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    const latest = data[data.length - 1]?.time;
    if (!latest) return;
    setRange((current) => {
      const span = current.to - current.from;
      // Keep the default 24-hour view pinned to the live edge; zoomed or panned views stay put.
      if (span > DAY * .95 && Math.abs(latest - current.to) < 10_000) {
        return {from: latest - span, to: latest};
      }
      return current;
    });
  }, [data]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({width: entry.contentRect.width, height: entry.contentRect.height});
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const requestDraw = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const canvas = canvasRef.current;
      if (!canvas || size.width === 0 || size.height === 0) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const {width, height} = size;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const colors = dark
        ? {grid: '#283548', label: '#7f8da3', line: BLUE, fill: 'rgba(75, 131, 244, .16)'}
        : {grid: '#e7edf5', label: '#8290a3', line: BLUE, fill: 'rgba(75, 131, 244, .12)'};
      const left = 48;
      const right = 12;
      const top = 12;
      const bottom = 28;
      const plotW = Math.max(1, width - left - right);
      const plotH = Math.max(1, height - top - bottom);
      const currentRange = rangeRef.current;
      const span = currentRange.to - currentRange.from;
      const visible = data.filter((point) => point.time >= currentRange.from && point.time <= currentRange.to);
      ctx.clearRect(0, 0, width, height);
      ctx.font = '11px Inter, system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = colors.grid;
      ctx.fillStyle = colors.label;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = top + (plotH * i) / 4;
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - right, y); ctx.stroke();
        ctx.textAlign = 'right'; ctx.fillText(`${100 - i * 25}%`, left - 9, y);
      }
      const ticks = 6;
      for (let i = 0; i <= ticks; i++) {
        const x = left + (plotW * i) / ticks;
        const time = currentRange.from + (span * i) / ticks;
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotH); ctx.stroke();
        ctx.textAlign = i === 0 ? 'left' : i === ticks ? 'right' : 'center';
        ctx.fillText(formatTime(time), x, height - 11);
      }
      if (!visible.length) return;

      // Keep at most the low and high sample from each horizontal pixel column.
      const columns = Math.max(1, Math.floor(plotW));
      const buckets: Array<{min: Point; max: Point}> = new Array(columns);
      for (const point of visible) {
        const column = Math.max(0, Math.min(columns - 1, Math.floor(((point.time - currentRange.from) / span) * columns)));
        const bucket = buckets[column];
        if (!bucket) buckets[column] = {min: point, max: point};
        else {
          if (point.value < bucket.min.value) bucket.min = point;
          if (point.value > bucket.max.value) bucket.max = point;
        }
      }
      const px = (p: Point) => left + ((p.time - currentRange.from) / span) * plotW;
      const py = (p: Point) => top + ((100 - p.value) / 100) * plotH;
      ctx.beginPath();
      let started = false;
      for (const bucket of buckets) {
        if (!bucket) continue;
        const pair = bucket.min.time < bucket.max.time ? [bucket.min, bucket.max] : [bucket.max, bucket.min];
        for (const point of pair) {
          const x = px(point); const y = py(point);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      if (started) {
        ctx.lineTo(left + plotW, top + plotH);
        ctx.lineTo(left, top + plotH);
        ctx.closePath();
        ctx.fillStyle = colors.fill;
        ctx.fill();
      }
      ctx.beginPath(); started = false;
      for (const bucket of buckets) {
        if (!bucket) continue;
        const pair = bucket.min.time < bucket.max.time ? [bucket.min, bucket.max] : [bucket.max, bucket.min];
        for (const point of pair) {
          const x = px(point); const y = py(point);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
      if (hover) {
        const hx = left + ((hover.point.time - currentRange.from) / span) * plotW;
        const hy = top + ((100 - hover.point.value) / 100) * plotH;
        ctx.setLineDash([4, 4]); ctx.strokeStyle = dark ? '#52627a' : '#a7b7ce'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hx, top); ctx.lineTo(hx, top + plotH); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(hx, hy, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = colors.line; ctx.stroke();
      }
    });
  }, [data, dark, hover, size]);

  useEffect(() => {
    requestDraw();
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); };
  }, [requestDraw]);

  const locatePoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const left = 48;
    const plotW = Math.max(1, rect.width - left - 12);
    const t = range.from + Math.max(0, Math.min(1, (event.clientX - rect.left - left) / plotW)) * (range.to - range.from);
    let low = 0; let high = data.length - 1;
    while (low < high) { const mid = (low + high) >>> 1; if (data[mid].time < t) low = mid + 1; else high = mid; }
    const before = data[Math.max(0, low - 1)]; const after = data[low];
    const point = Math.abs(before.time - t) < Math.abs(after.time - t) ? before : after;
    setHover({x: event.clientX - rect.left, y: event.clientY - rect.top, point});
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? 0.8 : 1.25;
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = (event.clientX - rect.left - 48) / Math.max(1, rect.width - 60);
    setRange((current) => {
      const span = Math.min(DAY, Math.max(15 * 60_000, (current.to - current.from) * factor));
      const point = current.from + Math.max(0, Math.min(1, anchor)) * (current.to - current.from);
      const from = point - anchor * span;
      return {from, to: from + span};
    });
  };

  const resetRange = () => setRange({from: data[data.length - 1].time - DAY, to: data[data.length - 1].time});
  const latest = data[data.length - 1];
  const startDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {x: event.clientX, range};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const movePointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current && event.buttons === 1) {
      const rect = event.currentTarget.getBoundingClientRect();
      const delta = ((event.clientX - dragRef.current.x) / Math.max(1, rect.width - 60)) * (dragRef.current.range.to - dragRef.current.range.from);
      setRange({from: dragRef.current.range.from - delta, to: dragRef.current.range.to - delta});
      return;
    }
    locatePoint(event);
  };

  return <div className="chart-area" ref={hostRef}>
    <canvas ref={canvasRef} className="cpu-canvas" onPointerDown={startDrag} onPointerMove={movePointer} onPointerUp={() => {dragRef.current = null;}} onPointerLeave={() => setHover(null)} onWheel={handleWheel} aria-label="Интерактивный график загрузки CPU за последние сутки" />
    {hover && <div className="chart-tooltip" style={{left: Math.min(hover.x + 16, size.width - 150), top: Math.max(8, hover.y - 52)}}>
      <span>{formatTime(hover.point.time, true)}</span><strong>{hover.point.value.toFixed(1)}% <i /></strong>
    </div>}
    <div className="chart-controls">
      <span>Период: <b>{formatDuration(range.to - range.from)}</b></span>
      <button className="text-button" onClick={resetRange}>Сбросить масштаб</button>
    </div>
    <span className="sr-only">Текущее значение: {latest.value.toFixed(1)} процентов</span>
  </div>;
}

function ThemeShell() {
  const [dark, setDark] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [data, setData] = useState<Point[]>(() => makeInitialData(Date.now()));
  const latest = data[data.length - 1];
  const values = useMemo(() => data.slice(-120), [data]);
  const average = useMemo(() => values.reduce((sum, point) => sum + point.value, 0) / values.length, [values]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const time = Date.now();
      setNow(time);
      setData((current) => {
        const previous = current[current.length - 1];
        const drift = Math.sin(time / 14_000) * 2 + Math.sin(time / 4_000) * 1.2;
        const next = {time, value: Math.max(4, Math.min(96, previous.value + (Math.random() - .5) * 5 + (34 + drift - previous.value) * .08))};
        const nextData = current.slice();
        nextData.push(next);
        while (nextData.length > POINTS) nextData.shift();
        return nextData;
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return <main className={`app-shell ${dark ? 'theme-dark' : 'theme-light'}`}>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">◈</span><span>Northstar<span className="brand-sub">CLOUD PLATFORM</span></span></div>
      <div className="workspace-switch"><span className="workspace-icon">A</span><span><b>Acme Inc.</b><small>Production</small></span><span className="chevron">⌄</span></div>
      <span className="nav-label">ПЛАТФОРМА</span>
      <nav><a href="#overview"><span>▦</span>Обзор</a><a className="selected" href="#monitoring"><span>◉</span>Мониторинг</a><a href="#services"><span>▤</span>Сервисы</a><a href="#logs"><span>≋</span>Журналы</a><a href="#alerts"><span>♧</span>Оповещения<span className="nav-count">3</span></a></nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon">?</span><b>Нужна помощь?</b><small>Документация и поддержка</small><a href="#help">Открыть центр помощи <span>↗</span></a></div><div className="user-row"><div className="avatar">МК</div><span><b>Мария Ковалёва</b><small>Администратор</small></span><span className="chevron">···</span></div></div>
    </aside>
    <section className="main-content">
      <header className="topbar"><div className="breadcrumbs">Инфраструктура <span>/</span> Мониторинг <span>/</span> <b>Обзор</b></div><div className="top-actions"><span className="environment"><i /> Все системы работают</span><button className="icon-button" aria-label="Поиск">⌕</button><button className="icon-button notification" aria-label="Уведомления">♧<i /></button><button className="theme-button" onClick={() => setDark((value) => !value)} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}>{dark ? '☼' : '☾'}</button></div></header>
      <div className="page-wrap">
        <div className="page-heading"><div><div className="eyebrow">ИНФРАСТРУКТУРА <span>·</span> ПРОДАКШН</div><h1>Мониторинг</h1><p>Следите за состоянием ресурсов и производительностью системы.</p></div><button className="range-button">◷ <span>Последние 24 часа</span>⌄</button></div>
        <div className="summary-grid">
          <div className="summary-card"><div className="card-label">Загрузка CPU <span className="info">i</span><span className="trend positive">↘ 2,4%</span></div><div className="metric-row"><strong>{latest.value.toFixed(1)}<small>%</small></strong><svg viewBox="0 0 100 34" preserveAspectRatio="none" className="sparkline"><path d="M0 25 C8 18 9 24 16 16 S24 22 31 15 S41 20 47 9 S57 19 62 13 S70 22 78 12 S90 19 100 7" /></svg></div><div className="card-foot"><span>Среднее <b>{average.toFixed(1)}%</b></span><span>За сутки <i className="green-dot" /> стабильно</span></div></div>
          <div className="summary-card"><div className="card-label">Память <span className="info">i</span><span className="trend positive">↘ 0,8%</span></div><div className="metric-row"><strong>68.2<small>%</small></strong><svg viewBox="0 0 100 34" preserveAspectRatio="none" className="sparkline violet"><path d="M0 21 C8 24 12 12 20 17 S29 13 35 20 S44 19 50 12 S60 16 68 10 S80 19 87 13 S94 15 100 8" /></svg></div><div className="card-foot"><span>Использовано <b>21.8 ГБ</b></span><span>Всего <b>32 ГБ</b></span></div></div>
          <div className="summary-card"><div className="card-label">Сеть <span className="info">i</span><span className="trend negative">↗ 5,1%</span></div><div className="metric-row"><strong>142<small> Мбит/с</small></strong><svg viewBox="0 0 100 34" preserveAspectRatio="none" className="sparkline orange"><path d="M0 24 C8 18 12 20 18 10 S27 22 34 15 S41 24 50 12 S59 15 65 8 S75 18 81 11 S94 19 100 5" /></svg></div><div className="card-foot"><span>Входящий <b>98 Мбит/с</b></span><span>Исходящий <b>44 Мбит/с</b></span></div></div>
          <div className="summary-card"><div className="card-label">Активные инстансы <span className="info">i</span><span className="trend neutral">без изменений</span></div><div className="metric-row"><strong>24<small> / 26</small></strong><div className="instance-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div><div className="card-foot"><span>Работают <b>24</b></span><span>Остановлены <b>2</b></span></div></div>
        </div>
        <section className="panel cpu-panel" id="monitoring"><div className="panel-heading"><div><div className="panel-title">Загрузка CPU</div><div className="panel-subtitle">Использование процессора во времени</div></div><div className="panel-actions"><span className="live-label"><i/> В реальном времени</span><button className="more-button" aria-label="Дополнительные действия">···</button></div></div>
          <div className="chart-legend"><span className="legend-item"><i/> CPU, %</span><span className="legend-range">Минимум <b>12.4%</b><span className="legend-divider"/>Максимум <b>82.6%</b><span className="legend-divider"/>Среднее <b>{average.toFixed(1)}%</b></span></div>
          <CpuChart data={data} dark={dark}/>
          <div className="chart-hint">Перетаскивайте график для прокрутки <span>·</span> Используйте колесо мыши для масштабирования</div>
        </section>
        <div className="bottom-grid"><section className="panel instances-panel"><div className="panel-heading"><div><div className="panel-title">Инстансы</div><div className="panel-subtitle">Ресурсы по узлам кластера</div></div><a href="#instances" className="small-link">Все инстансы <span>→</span></a></div><div className="instance-table"><div className="table-head"><span>ИМЯ ИНСТАНСА</span><span>CPU</span><span>ПАМЯТЬ</span><span>СТАТУС</span></div><div className="table-row"><span><i className="server-icon">▣</i><span><b>api-gateway-01</b><small>eu-west-1a · m6i.large</small></span></span><b>42.8%</b><b>71.2%</b><span className="status running"><i/>Работает</span></div><div className="table-row"><span><i className="server-icon">▣</i><span><b>worker-pool-03</b><small>eu-west-1b · c6i.xlarge</small></span></span><b>28.4%</b><b>54.6%</b><span className="status running"><i/>Работает</span></div><div className="table-row"><span><i className="server-icon">▣</i><span><b>database-primary</b><small>eu-west-1a · r6i.2xlarge</small></span></span><b>36.1%</b><b>82.3%</b><span className="status running"><i/>Работает</span></div></div></section>
          <section className="panel activity-panel"><div className="panel-heading"><div><div className="panel-title">Последние события</div><div className="panel-subtitle">Изменения в инфраструктуре</div></div><a href="#events" className="small-link">Все события <span>→</span></a></div><div className="event"><span className="event-icon blue-icon">↗</span><span><b>Автомасштабирование</b><small>Добавлен инстанс <b>worker-pool-04</b></small><small>Сегодня, 14:32</small></span></div><div className="event"><span className="event-icon green-icon">✓</span><span><b>Деплой завершён</b><small>Сервис <b>api-gateway</b> обновлён до v2.8.1</small><small>Сегодня, 13:18</small></span></div><div className="event"><span className="event-icon amber-icon">⌁</span><span><b>Порог нагрузки достигнут</b><small>CPU на <b>database-primary</b> выше 70%</small><small>Сегодня, 11:46</small></span></div></section></div>
        <footer className="footer"><span>© 2024 Northstar Cloud</span><span>Обновлено {formatTime(now)} <i className="green-dot"/></span><span><a href="#status">Статус системы</a><span>·</span><a href="#docs">Документация</a></span></footer>
      </div>
    </section>
  </main>;
}

export function App() { return <ThemeShell />; }
