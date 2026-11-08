import {useEffect, useMemo, useRef, useState} from 'react';
import {useTheme} from '@gravity-ui/uikit';
import './app.css';

type Point = {time: number; value: number};
const DAY = 24 * 60 * 60 * 1000;
const INITIAL_COUNT = 30_000;
const STEP = DAY / INITIAL_COUNT;

function makeHistory(): Point[] {
  const now = Date.now();
  return Array.from({length: INITIAL_COUNT}, (_, i) => {
    const wave = 31 + Math.sin(i / 490) * 12 + Math.sin(i / 76) * 5 + Math.cos(i / 1700) * 8;
    const burst = Math.sin(i / 19) > 0.97 ? Math.random() * 18 : 0;
    return {time: now - DAY + i * STEP, value: Math.max(8, Math.min(96, wave + (Math.random() - 0.5) * 8 + burst))};
  });
}

function CpuChart() {
  const theme = useTheme();
  const dark = theme.startsWith('dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const viewRef = useRef({span: DAY, end: Date.now()});
  const hoverRef = useRef<number | null>(null);
  const dragRef = useRef<{x: number; end: number} | null>(null);
  const [hover, setHover] = useState<{x: number; y: number; point: Point} | null>(null);
  const [live, setLive] = useState(0);

  useEffect(() => {
    pointsRef.current = makeHistory();
    viewRef.current.end = Date.now();
    let frame = 0;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const {width, height} = wrap.getBoundingClientRect();
        if (!width || !height) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        const pad = {left: 48, right: 16, top: 18, bottom: 30};
        const plotW = width - pad.left - pad.right;
        const plotH = height - pad.top - pad.bottom;
        if (plotW <= 0 || plotH <= 0) return;
        const colors = dark
          ? {grid: 'rgba(255,255,255,.09)', text: '#9196a1', line: '#8f73ff', fill: 'rgba(143,115,255,.16)'}
          : {grid: 'rgba(32,35,41,.09)', text: '#858b98', line: '#7357f6', fill: 'rgba(115,87,246,.13)'};
        const left = pad.left;
        ctx.font = '11px Inter, sans-serif';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
          const y = pad.top + (plotH * i) / 4;
          const value = 100 - i * 25;
          ctx.strokeStyle = colors.grid;
          ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(width - pad.right, y); ctx.stroke();
          ctx.fillStyle = colors.text; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
          ctx.fillText(`${value}%`, left - 10, y);
        }
        const {span, end} = viewRef.current;
        const start = end - span;
        const points = pointsRef.current;
        let lo = 0, hi = points.length;
        while (lo < hi) { const mid = (lo + hi) >>> 1; if (points[mid].time < start) lo = mid + 1; else hi = mid; }
        const from = Math.max(0, lo - 1);
        let a = from, b = points.length;
        while (a < b) { const mid = (a + b) >>> 1; if (points[mid].time <= end) a = mid + 1; else b = mid; }
        const to = a;
        const xFor = (t: number) => left + ((t - start) / span) * plotW;
        const yFor = (v: number) => pad.top + ((100 - v) / 100) * plotH;
        const buckets = Math.max(1, Math.floor(plotW));
        ctx.beginPath();
        let hasLine = false;
        for (let bucket = 0; bucket < buckets; bucket++) {
          const minT = start + (bucket / buckets) * span;
          const maxT = start + ((bucket + 1) / buckets) * span;
          let min = Infinity, max = -Infinity, minP: Point | null = null, maxP: Point | null = null;
          while (lo < to && points[lo].time < minT) lo++;
          let cursor = lo;
          while (cursor < to && points[cursor].time <= maxT) {
            const point = points[cursor++];
            if (point.value < min) {min = point.value; minP = point;}
            if (point.value > max) {max = point.value; maxP = point;}
          }
          lo = cursor;
          if (!minP || !maxP) continue;
          const first = minP.time <= maxP.time ? minP : maxP;
          const second = minP.time <= maxP.time ? maxP : minP;
          if (!hasLine) {ctx.moveTo(xFor(first.time), yFor(first.value)); hasLine = true;}
          else ctx.lineTo(xFor(first.time), yFor(first.value));
          ctx.lineTo(xFor(second.time), yFor(second.value));
        }
        if (hasLine) {
          ctx.lineTo(xFor(points[to - 1]?.time ?? end), yFor(points[to - 1]?.value ?? 0));
          ctx.strokeStyle = colors.line; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
          ctx.lineTo(width - pad.right, pad.top + plotH); ctx.lineTo(left, pad.top + plotH); ctx.closePath();
          ctx.fillStyle = colors.fill; ctx.fill();
        }
        const labels = 6;
        ctx.fillStyle = colors.text; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let i = 0; i <= labels; i++) {
          const x = left + (plotW * i) / labels;
          const date = new Date(start + (span * i) / labels);
          ctx.fillText(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`, x, height - 21);
        }
        if (hoverRef.current !== null && hoverRef.current >= start && hoverRef.current <= end) {
          const px = xFor(hoverRef.current);
          const idx = Math.min(points.length - 1, Math.max(0, Math.round((hoverRef.current - points[0].time) / STEP)));
          const py = yFor(points[idx]?.value ?? 0);
          ctx.strokeStyle = colors.line; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, pad.top + plotH); ctx.stroke(); ctx.setLineDash([]);
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fillStyle = colors.line; ctx.fill(); ctx.strokeStyle = dark ? '#211e27' : '#fff'; ctx.lineWidth = 2; ctx.stroke();
        }
      });
    };
    const observer = new ResizeObserver(draw);
    observer.observe(wrap);
    canvas.addEventListener('chart-redraw', draw);
    draw();
    const timer = window.setInterval(() => {
      const now = Date.now();
      const prev = pointsRef.current[pointsRef.current.length - 1]?.value ?? 36;
      const value = Math.max(8, Math.min(96, prev + (Math.random() - 0.49) * 4));
      pointsRef.current.push({time: now, value});
      const cutoff = now - DAY;
      while (pointsRef.current.length > 0 && pointsRef.current[0].time < cutoff) pointsRef.current.shift();
      if (viewRef.current.end >= now - STEP * 3) viewRef.current.end = now;
      setLive(value);
      draw();
    }, 2500);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      canvas.removeEventListener('chart-redraw', draw);
      cancelAnimationFrame(frame);
    };
  }, [dark]);

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (dragRef.current) {
      const delta = event.clientX - dragRef.current.x;
      const plotW = Math.max(1, rect.width - 64);
      viewRef.current.end = dragRef.current.end - (delta / plotW) * viewRef.current.span;
      setHover(null); hoverRef.current = null;
    } else {
      const x = event.clientX - rect.left - 48;
      const fraction = Math.max(0, Math.min(1, x / Math.max(1, rect.width - 64)));
      const time = viewRef.current.end - viewRef.current.span + fraction * viewRef.current.span;
      const points = pointsRef.current;
      const idx = Math.min(points.length - 1, Math.max(0, Math.round((time - points[0].time) / STEP)));
      const point = points[idx];
      if (point) {hoverRef.current = point.time; setHover({x: event.clientX - rect.left, y: event.clientY - rect.top, point});}
    }
    // A lightweight redraw keeps pointer interactions independent of React rendering.
    event.currentTarget.dispatchEvent(new Event('chart-redraw'));
  };
  const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const view = viewRef.current;
    const nextSpan = Math.max(60_000, Math.min(DAY, view.span * (event.deltaY > 0 ? 1.15 : 0.87)));
    view.end = Date.now() - (Date.now() - view.end) * (nextSpan / view.span);
    view.span = nextSpan;
    event.currentTarget.dispatchEvent(new Event('chart-redraw'));
  };
  const latest = live || 37.4;
  return <section className="chart-card">
    <div className="chart-heading"><div><div className="section-label">ПРОИЗВОДИТЕЛЬНОСТЬ</div><h2>Загрузка CPU</h2><p>Использование процессора за последние 24 часа</p></div>
      <div className="current-value"><span className="live-dot"/><span><strong>{latest.toFixed(1)}<small>%</small></strong><em>Сейчас</em></span></div>
    </div>
    <div className="chart-tools"><div className="legend"><i/>Средняя загрузка</div><div className="chart-hint">Колесо мыши — масштаб · перетаскивание — перемещение</div></div>
    <div className="chart-wrap" ref={wrapRef}>
      <canvas ref={canvasRef} aria-label="Интерактивный график загрузки CPU за последние 24 часа" role="img"
        onPointerMove={onPointerMove} onPointerLeave={(e) => {hoverRef.current = null; setHover(null); e.currentTarget.dispatchEvent(new Event('chart-redraw'));}}
        onPointerDown={(e) => {dragRef.current = {x: e.clientX, end: viewRef.current.end}; e.currentTarget.setPointerCapture(e.pointerId);}}
        onPointerUp={() => {dragRef.current = null;}} onWheel={onWheel}
        onDoubleClick={(e) => {viewRef.current = {span: DAY, end: Date.now()}; e.currentTarget.dispatchEvent(new Event('chart-redraw'));}} />
      {hover && <div className="chart-tooltip" style={{left: Math.min(hover.x + 14, 560), top: Math.max(hover.y - 54, 4)}}><strong>{hover.point.value.toFixed(1)}%</strong><span>{new Date(hover.point.time).toLocaleString('ru-RU', {hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'})}</span></div>}
      <div className="chart-reset" title="Двойной щелчок — показать сутки">24 ч</div>
    </div>
    <div className="chart-foot"><span>Обновляется в реальном времени</span><span><b/> Интервал: 2,9 с · 30 000+ точек</span></div>
  </section>;
}

export function App() {
  const theme = useTheme();
  const dark = theme.startsWith('dark');
  const menuItems = useMemo(() => [['Обзор', '◫'], ['Мониторинг', '⌁'], ['События', '◷'], ['Настройки', '⚙']], []);
  return <main className="dashboard">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">◈</span><span>pulse<span className="brand-light">monitor</span></span></div>
      <div className="workspace-switch"><span className="workspace-icon">N</span><span><strong>Northstar</strong><small>Рабочее пространство</small></span><b>⌄</b></div>
      <div className="nav-caption">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav>{menuItems.map(([label, icon]) => <button key={label} className={label === 'Мониторинг' ? 'nav-item active' : 'nav-item'}><span>{icon}</span>{label}{label === 'События' && <em>3</em>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="status-card"><span className="status-ring">✓</span><span><b>Все системы работают</b><small>Последняя проверка · сейчас</small></span></div><button className="profile"><span className="avatar">AK</span><span><b>Алексей Ким</b><small>Администратор</small></span><span className="more">···</span></button></div>
    </aside>
    <div className="main-area"><header className="topbar"><div className="breadcrumbs"><span>Рабочее пространство</span><b>/</b><strong>Мониторинг</strong></div><div className="top-actions"><span className="live-status"><i/> Все системы в норме</span><button className="icon-button" title="Переключить тему" onClick={() => {document.documentElement.dataset.theme = dark ? 'light' : 'dark'; window.dispatchEvent(new CustomEvent('theme-toggle', {detail: dark ? 'light' : 'dark'}));}}>◐</button><button className="help-button">? <span>Помощь</span></button></div></header>
      <div className="content"><div className="page-title-row"><div><div className="eyebrow">СИСТЕМА / ОБЗОР</div><h1>Мониторинг</h1><p>Следите за состоянием инфраструктуры в реальном времени.</p></div><button className="range-select">◷ <span>Последние 24 часа</span>⌄</button></div>
        <div className="summary-grid"><article className="summary-card"><div className="summary-top"><span>Загрузка CPU</span><span className="summary-icon purple">⌁</span></div><strong>37,4<small>%</small></strong><div className="trend good">↘ 4,2% <span>за последние сутки</span></div><div className="mini-bars">{[30,42,36,52,44,61,48,52,39,63,50,44,58,40,48,35,54,42,37,46].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div></article>
          <article className="summary-card"><div className="summary-top"><span>Память</span><span className="summary-icon blue">▤</span></div><strong>68,2<small>%</small></strong><div className="trend neutral">↗ 1,8% <span>за последние сутки</span></div><div className="progress"><i style={{width:'68.2%'}}/></div><small className="card-footnote">10,9 ГБ из 16 ГБ</small></article>
          <article className="summary-card"><div className="summary-top"><span>Сетевая нагрузка</span><span className="summary-icon green">⇄</span></div><strong>1,24<small> ГБ/с</small></strong><div className="trend good">↗ 8,6% <span>за последние сутки</span></div><div className="network-bars">{[24,42,31,56,44,65,52,38,70,46,60,38,55,76,48,66,43,57,72,54,45,66,39,61].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div></article>
          <article className="summary-card"><div className="summary-top"><span>Активные инстансы</span><span className="summary-icon orange">▦</span></div><strong>24<small> / 24</small></strong><div className="trend good"><i className="tiny-dot"/> Все инстансы активны</div><div className="instance-list"><span>api-prod-01</span><span>api-prod-02</span><span>worker-01</span><b>+21</b></div></article></div>
        <CpuChart />
        <div className="lower-row"><section className="lower-card"><div className="lower-heading"><div><h3>Последние события</h3><p>Недавняя активность системы</p></div><button>Все события →</button></div><div className="event-row"><i className="event-icon green">✓</i><span><b>Резервное копирование завершено</b><small>Ежедневное резервное копирование · storage-01</small></span><time>2 мин назад</time></div><div className="event-row"><i className="event-icon blue">↗</i><span><b>Масштабирование инстанса</b><small>api-prod-02 · добавлен 1 экземпляр</small></span><time>18 мин назад</time></div><div className="event-row"><i className="event-icon purple">⌁</i><span><b>Порог загрузки CPU обновлён</b><small>Уведомления при загрузке выше 85%</small></span><time>1 ч назад</time></div></section>
          <section className="lower-card health-card"><div className="lower-heading"><div><h3>Состояние сервисов</h3><p>Доступность за 30 дней</p></div><span className="uptime">99,98%</span></div><div className="service-row"><span className="service-name"><i className="service-dot"/> API Gateway</span><span className="uptime-bars">{Array.from({length:32},(_,i)=><i key={i} className={i===11?'bar-warn':''}/>)}</span></div><div className="service-row"><span className="service-name"><i className="service-dot"/> Database</span><span className="uptime-bars">{Array.from({length:32},(_,i)=><i key={i}/>)}</span></div><div className="service-row"><span className="service-name"><i className="service-dot"/> Worker Queue</span><span className="uptime-bars">{Array.from({length:32},(_,i)=><i key={i} className={i===24?'bar-warn':''}/>)}</span></div></section></div>
        <footer>© 2024 Pulse Monitor <span>Документация　·　Статус системы</span></footer>
      </div>
    </div>
  </main>;
}
