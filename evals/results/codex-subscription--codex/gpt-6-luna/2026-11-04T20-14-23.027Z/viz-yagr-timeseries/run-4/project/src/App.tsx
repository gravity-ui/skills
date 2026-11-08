import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent} from 'react';
import './app.css';

type Point = {time: number; value: number};
type Theme = 'light' | 'dark';

const DAY = 24 * 60 * 60 * 1000;
const POINT_COUNT = 30_000;
const SAMPLE_STEP = DAY / POINT_COUNT;

function makeHistory(): Point[] {
  const now = Date.now();
  const result: Point[] = [];
  for (let i = POINT_COUNT - 1; i >= 0; i--) {
    const baseline = 38 + Math.sin(i / 1950) * 8 + Math.sin(i / 420) * 2.5;
    const spike = Math.sin(i / 5300) > 0.985 ? 12 : 0;
    result.push({time: now - i * SAMPLE_STEP, value: Math.max(0, Math.min(100, baseline + (Math.random() - 0.5) * 2.4 + spike))});
  }
  return result;
}

function formatClock(time: number) {
  return new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit'}).format(time);
}

function CpuChart({points, theme, onRangeChange}: {points: Point[]; theme: Theme; onRangeChange: (hours: number) => void}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({width: 0, height: 0});
  const [pointerX, setPointerX] = useState<number | null>(null);
  const [zoom, setZoom] = useState(24);
  const [pan, setPan] = useState(0);
  const pointerFrame = useRef<number | null>(null);

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({width: entry.contentRect.width, height: entry.contentRect.height});
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visible = useMemo(() => {
    const now = points[points.length - 1]?.time ?? Date.now();
    const span = zoom * 60 * 60 * 1000;
    const end = now - pan * 60 * 60 * 1000;
    const start = end - span;
    let lo = 0;
    let hi = points.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (points[mid].time < start) lo = mid + 1;
      else hi = mid;
    }
    const from = Math.max(0, lo - 1);
    let endIndex = from;
    while (endIndex < points.length && points[endIndex].time <= end) endIndex++;
    return {from, to: Math.max(from + 1, endIndex), start, end};
  }, [points, zoom, pan]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height || !points.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.width * dpr);
    canvas.height = Math.round(size.height * dpr);
    ctx.scale(dpr, dpr);
    const w = size.width;
    const h = size.height;
    const left = 43;
    const right = 12;
    const top = 14;
    const bottom = 27;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const colors = theme === 'dark'
      ? {grid: '#2b3442', text: '#788597', line: '#7b9cff', fill: 'rgba(94, 129, 255, .17)', cursor: '#c3d1ff'}
      : {grid: '#e7ebf1', text: '#8b95a5', line: '#5478ed', fill: 'rgba(84, 120, 237, .12)', cursor: '#284fce'};

    ctx.clearRect(0, 0, w, h);
    ctx.font = '11px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.lineWidth = 1;
    for (let value = 0; value <= 100; value += 25) {
      const y = top + plotH * (1 - value / 100);
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${value}%`, left - 9, y);
    }

    const {from, to, start, end} = visible;
    const span = end - start || 1;
    // Collapse each horizontal pixel into a min/max pair: dense histories stay legible and cheap to paint.
    const buckets = Math.max(1, Math.floor(plotW));
    const mins = new Float32Array(buckets).fill(101);
    const maxs = new Float32Array(buckets).fill(-1);
    const minAt = new Int32Array(buckets);
    const maxAt = new Int32Array(buckets);
    for (let i = from; i < to; i++) {
      const point = points[i];
      const bucket = Math.max(0, Math.min(buckets - 1, Math.floor(((point.time - start) / span) * (buckets - 1))));
      if (point.value < mins[bucket]) { mins[bucket] = point.value; minAt[bucket] = i; }
      if (point.value > maxs[bucket]) { maxs[bucket] = point.value; maxAt[bucket] = i; }
    }
    const yFor = (value: number) => top + plotH * (1 - value / 100);
    const xFor = (index: number) => left + ((points[index].time - start) / span) * plotW;
    ctx.beginPath();
    let started = false;
    for (let b = 0; b < buckets; b++) {
      if (maxs[b] < 0) continue;
      const first = Math.min(minAt[b], maxAt[b]);
      const second = Math.max(minAt[b], maxAt[b]);
      for (const index of first === second ? [first] : [first, second]) {
        const x = xFor(index);
        const y = yFor(points[index].value);
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
    }
    if (started) {
      ctx.lineTo(xFor(to - 1), top + plotH);
      ctx.lineTo(xFor(from), top + plotH);
      ctx.closePath();
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.beginPath();
      let strokeStarted = false;
      for (let b = 0; b < buckets; b++) {
        if (maxs[b] < 0) continue;
        const first = Math.min(minAt[b], maxAt[b]);
        const second = Math.max(minAt[b], maxAt[b]);
        for (const index of first === second ? [first] : [first, second]) {
          if (!strokeStarted) { ctx.moveTo(xFor(index), yFor(points[index].value)); strokeStarted = true; }
          else ctx.lineTo(xFor(index), yFor(points[index].value));
        }
      }
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.7;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    for (let i = 0; i <= 4; i++) {
      const time = start + span * i / 4;
      const x = left + plotW * i / 4;
      ctx.fillStyle = colors.text;
      ctx.textAlign = i === 0 ? 'left' : i === 4 ? 'right' : 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(formatClock(time), x, h - bottom + 8);
    }

    if (pointerX !== null && pointerX >= left && pointerX <= w - right) {
      const targetTime = start + ((pointerX - left) / plotW) * span;
      let l = from;
      let r = to - 1;
      while (l < r) {
        const mid = (l + r) >>> 1;
        if (points[mid].time < targetTime) l = mid + 1;
        else r = mid;
      }
      const before = Math.max(from, l - 1);
      const index = Math.abs(points[before].time - targetTime) < Math.abs(points[l].time - targetTime) ? before : l;
      const x = xFor(index);
      const y = yFor(points[index].value);
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = colors.cursor;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = colors.line; ctx.fill();
      ctx.strokeStyle = theme === 'dark' ? '#18202b' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
  }, [points, size, theme, visible, pointerX]);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => setPointerX(x));
  }, []);
  useEffect(() => () => { if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current); }, []);

  const nearest = useMemo(() => {
    if (pointerX === null || !size.width) return null;
    const left = 43;
    const plotW = size.width - left - 12;
    if (pointerX < left || pointerX > size.width - 12) return null;
    const time = visible.start + ((pointerX - left) / plotW) * (visible.end - visible.start);
    let low = visible.from;
    let high = visible.to - 1;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (points[mid].time < time) low = mid + 1;
      else high = mid;
    }
    const idx = Math.max(visible.from, low - 1);
    const pick = Math.abs(points[idx].time - time) <= Math.abs(points[low].time - time) ? idx : low;
    return {point: points[pick], x: Math.min(size.width - 120, Math.max(8, pointerX + 12))};
  }, [pointerX, points, size.width, visible]);

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    if (!event.ctrlKey && Math.abs(event.deltaY) < 25) return;
    event.preventDefault();
    setZoom((current) => Math.max(1, Math.min(24, current * (event.deltaY > 0 ? 1.25 : 0.8))));
  }

  return <div className="chart-wrap" ref={wrapRef} onPointerMove={onPointerMove} onPointerLeave={() => setPointerX(null)} onWheel={onWheel}>
    <canvas ref={canvasRef} aria-label="Интерактивный график загрузки CPU за последние сутки" role="img" />
    {nearest && <div className="chart-tooltip" style={{left: nearest.x, top: 12}}>
      <div className="tooltip-time">{new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(nearest.point.time)}</div>
      <div><span className="tooltip-dot" /> CPU <b>{nearest.point.value.toFixed(1)}%</b></div>
    </div>}
    <div className="chart-controls" aria-label="Масштаб графика">
      {[1, 6, 12, 24].map((hours) => <button key={hours} className={zoom === hours ? 'selected' : ''} onClick={() => {setZoom(hours); setPan(0); onRangeChange(hours);}}>{hours === 24 ? '24 ч' : `${hours} ч`}</button>)}
    </div>
  </div>;
}

function Icon({name}: {name: 'grid' | 'server' | 'chart' | 'settings' | 'sun' | 'moon' | 'bell' | 'chevron' | 'cpu' | 'memory' | 'network' | 'disk' | 'dots'}) {
  const common = {width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const paths: Record<typeof name, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
    server: <><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h7M11 17h7"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-5 3 2 5-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V20h-2.4v-.22a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.54 15a1.7 1.7 0 0 0-1.55-1H6.8v-2.4h.19a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.87.34 1.7 1.7 0 0 0 1-1.55V5.6h2.4v.22a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10.6a1.7 1.7 0 0 0 1.55 1h.25V14h-.25a1.7 1.7 0 0 0-1.55 1Z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></>,
    moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    cpu: <><rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/></>,
    memory: <><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 10h2v4H7zm8 0h2v4h-2zM7 3v3m5-3v3m5-3v3M7 18v3m5-3v3m5-3v3"/></>,
    network: <><circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m10.7 6.6-4.4 9.8m7-9.8 4.4 9.8M7 18h10"/></>,
    disk: <><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [active, setActive] = useState('Мониторинг');
  const [points, setPoints] = useState<Point[]>(makeHistory);
  const [now, setNow] = useState(Date.now());
  const [hours, setHours] = useState(24);
  const dataRef = useRef(points);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const prev = dataRef.current;
      const last = prev[prev.length - 1];
      const value = Math.max(12, Math.min(88, last.value + (Math.random() - .48) * 2.4));
      const next = [...prev.slice(1), {time: Date.now(), value}];
      dataRef.current = next;
      setPoints(next);
      setNow(Date.now());
    }, 2500);
    return () => window.clearInterval(timer);
  }, []);

  const current = points[points.length - 1]?.value ?? 0;
  const stats = useMemo(() => {
    const last = points.slice(-120);
    return {average: last.reduce((sum, point) => sum + point.value, 0) / last.length, peak: Math.max(...last.map((point) => point.value))};
  }, [points]);

  const nav = [
    {name: 'Обзор', icon: 'grid' as const},
    {name: 'Мониторинг', icon: 'chart' as const},
    {name: 'Серверы', icon: 'server' as const},
  ];

  return <div className={`app-shell ${theme}`}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span /></div><span>pulse<span className="brand-light">.cloud</span></span></div>
      <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <button className="workspace-switch"><div className="workspace-avatar">A</div><span><b>Acme Inc.</b><small>План Pro</small></span><span className="switch-arrows">⌃<br/>⌄</span></button>
      <div className="nav-label">МЕНЮ</div>
      <nav>{nav.map(({name, icon}) => <button key={name} className={`nav-item ${active === name ? 'active' : ''}`} onClick={() => setActive(name)}><Icon name={icon}/><span>{name}</span>{name === 'Серверы' && <span className="nav-count">8</span>}</button>)}</nav>
      <div className="nav-label tools-label">УПРАВЛЕНИЕ</div>
      <button className="nav-item" onClick={() => setActive('Настройки')}><Icon name="settings"/><span>Настройки</span></button>
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-title">Использование ресурсов <Icon name="dots"/></div><div className="usage-main">68% <span>из 100%</span></div><div className="usage-track"><i /></div><div className="usage-foot"><span>68 из 100 единиц</span><a>Обновить</a></div></div><div className="user-profile"><div className="user-avatar">JD</div><div className="user-meta"><b>Jane Doe</b><small>jane@acme.io</small></div><Icon name="dots"/></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><Icon name="chevron"/><b>Мониторинг</b></div><div className="top-actions"><span className="status-live"><i/> Все системы работают</span><button className="icon-button" aria-label="Уведомления"><Icon name="bell"/><i className="notification-dot"/></button><span className="top-divider"/><button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}><Icon name={theme === 'light' ? 'moon' : 'sun'}/></button><div className="top-avatar">JD</div></div></header>

      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">ИНФРАСТРУКТУРА <span>·</span> ОБЗОР</div><h1>Мониторинг</h1><p>Следите за состоянием ваших серверов в реальном времени.</p></div><button className="range-button"><span className="calendar-icon">▦</span> Последние 24 часа <span className="down-caret">⌄</span></button></div>
        <div className="section-title-row"><div><h2>Обзор ресурсов</h2><p>Метрики производительности инфраструктуры</p></div><div className="updated-label"><span className="pulse-dot"/> Обновлено {new Intl.DateTimeFormat('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(now)}</div></div>

        <div className="metric-grid">
          <MetricCard icon="cpu" label="Использование CPU" value={`${current.toFixed(1)}%`} delta="2.4%" positive={false} detail="по сравнению с прошлым часом" color="blue" spark={[28,35,30,45,38,50,44,55,49,62,58,68,53,65,72,61,76,66,71,57,69,62,74, current]} />
          <MetricCard icon="memory" label="Использование памяти" value="64.8%" delta="1.2%" positive detail="по сравнению с прошлым часом" color="purple" spark={[55,49,54,48,55,51,60,54,61,56,65,58,63,58,67,60,66,62,70,64,68,60,67,64]} />
          <MetricCard icon="network" label="Сетевой трафик" value="842.5" unit="МБ/с" delta="8.1%" positive detail="по сравнению с прошлым часом" color="green" spark={[42,48,45,57,51,49,62,56,68,62,59,71,65,74,68,62,77,70,80,72,68,76,70,83]} />
          <MetricCard icon="disk" label="Использование диска" value="72.3%" delta="0.8%" positive={false} detail="по сравнению с прошлым часом" color="orange" spark={[62,65,63,67,65,68,66,69,67,70,68,71,69,73,70,72,70,74,71,73,72,75,73,72]} />
        </div>

        <section className="chart-card"><div className="chart-header"><div><div className="chart-title-line"><h2>Использование CPU</h2><span className="live-badge"><i/> LIVE</span></div><p>Загрузка процессора за последние 24 часа</p></div><button className="more-button" aria-label="Дополнительные действия"><Icon name="dots"/></button></div>
          <div className="chart-stats"><div><span className="legend-line"/> <span className="legend-title">CPU</span></div><div className="chart-stat"><span>Текущее</span><b>{current.toFixed(1)}<small>%</small></b></div><div className="chart-stat"><span>Среднее</span><b>{stats.average.toFixed(1)}<small>%</small></b></div><div className="chart-stat"><span>Пик</span><b>{stats.peak.toFixed(1)}<small>%</small></b></div></div>
          <CpuChart points={points} theme={theme} onRangeChange={setHours}/>
          <div className="chart-footnote"><span><i/> Данные обновляются автоматически</span><span>Интервал: 2.9 сек <span className="foot-separator">·</span> Период: {hours === 24 ? '24 часа' : `${hours} ${hours === 1 ? 'час' : 'часов'}`}</span></div>
        </section>
        <section className="server-card"><div className="server-heading"><div><h2>Состояние серверов</h2><p>Обзор всех серверов в вашем пространстве</p></div><button className="view-all">Все серверы <Icon name="chevron"/></button></div><div className="server-list"><ServerRow name="api-production-01" region="Frankfurt, DE · 4 vCPU · 8 GB RAM" cpu={current} memory="64.8%"/><ServerRow name="api-production-02" region="Amsterdam, NL · 4 vCPU · 8 GB RAM" cpu={Math.max(12, current - 7.3)} memory="58.2%"/><ServerRow name="worker-processing-01" region="London, UK · 8 vCPU · 16 GB RAM" cpu={42.1} memory="71.6%"/></div></section>
        <footer>© 2024 Pulse Cloud <span>·</span> Статус систем <span className="footer-ok">Все системы работают</span></footer>
      </div>
    </main>
  </div>;
}

function MetricCard({icon, label, value, unit, delta, positive, detail, color, spark}: {icon: 'cpu' | 'memory' | 'network' | 'disk'; label: string; value: string; unit?: string; delta: string; positive: boolean; detail: string; color: string; spark: number[]}) {
  const points = spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${32 - (v - Math.min(...spark)) / (Math.max(...spark) - Math.min(...spark) || 1) * 27}`).join(' ');
  return <div className="metric-card"><div className="metric-top"><div className={`metric-icon ${color}`}><Icon name={icon}/></div><span className={`delta ${positive ? 'up' : 'down'}`}>{positive ? '↗' : '↘'} {delta}</span></div><div className="metric-label">{label}</div><div className="metric-value">{value} {unit && <small>{unit}</small>}</div><div className="metric-bottom"><span>{detail}</span><svg className={`sparkline ${color}`} viewBox="0 0 100 36" preserveAspectRatio="none"><polyline points={points}/></svg></div></div>;
}

function ServerRow({name, region, cpu, memory}: {name: string; region: string; cpu: number; memory: string}) {
  return <div className="server-row"><div className="server-identity"><span className="server-status"><i/></span><div><b>{name}</b><small>{region}</small></div></div><div className="server-resource"><span>CPU</span><div className="mini-track"><i style={{width: `${cpu}%`}}/></div><b>{cpu.toFixed(1)}%</b></div><div className="server-resource memory-resource"><span>Память</span><div className="mini-track"><i style={{width: memory}}/></div><b>{memory}</b></div><span className="online-status">Онлайн</span><button className="row-more" aria-label={`Действия для ${name}`}><Icon name="dots"/></button></div>;
}
