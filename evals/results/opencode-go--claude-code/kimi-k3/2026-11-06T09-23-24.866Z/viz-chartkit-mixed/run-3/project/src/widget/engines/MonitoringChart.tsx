import * as React from 'react';

import {useElementSize} from '../useElementSize';
import type {EngineProps} from '../types';

/**
 * Canvas-движок плотного временного ряда (режим мониторинга).
 * Тысячи точек: агрегация min/max в пиксельные колонки (полоса + линия среднего),
 * перерисовка через requestAnimationFrame, кроссхеер с тултипом по всем сериям.
 * Загружается лениво — отдельным чанком.
 */

const MARGIN = {top: 10, right: 12, bottom: 24, left: 40};

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm > 5 ? 10 : norm > 2 ? 5 : norm > 1 ? 2 : 1) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return ticks;
}

interface ColumnBucket {
  min: number;
  max: number;
  mean: number;
}

/** Агрегирует равномерный ряд в бакеты по числу пиксельных колонок. */
function bucketize(points: {t: number; v: number}[], columns: number): (ColumnBucket | null)[] {
  const buckets: (ColumnBucket | null)[] = new Array(columns).fill(null);
  if (points.length === 0 || columns <= 0) return buckets;
  const per = points.length / columns;
  for (let c = 0; c < columns; c++) {
    const from = Math.floor(c * per);
    const to = Math.max(from + 1, Math.floor((c + 1) * per));
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let n = 0;
    for (let i = from; i < Math.min(to, points.length); i++) {
      const v = points[i].v;
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
      n++;
    }
    if (n > 0) buckets[c] = {min, max, mean: sum / n};
  }
  return buckets;
}

export default function MonitoringChart({
  series,
  height,
  formatTime,
  formatValue,
  ariaLabel,
  themeKey,
}: EngineProps) {
  const [containerRef, {width}] = useElementSize<HTMLDivElement>();
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = React.useState<number | null>(null); // индекс точки

  const plotW = Math.max(0, Math.floor(width - MARGIN.left - MARGIN.right));
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const pointCount = series[0]?.points.length ?? 0;
  const maxV = Math.max(0, ...series.flatMap((s) => s.points.map((p) => p.v)));
  const ticks = niceTicks(maxV);
  const top = ticks[ticks.length - 1] || 1;

  // Бакеты пересчитываются только при смене данных/геометрии
  const buckets = React.useMemo(
    () => series.map((s) => bucketize(s.points, plotW)),
    [series, plotW],
  );

  /* ── отрисовка ── */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || width === 0 || pointCount === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const css = getComputedStyle(container);
    const color = (slot: number) => css.getPropertyValue(`--series-${slot}`).trim();
    const gridline = css.getPropertyValue('--gridline').trim();
    const baseline = css.getPropertyValue('--baseline').trim();
    const inkMuted = css.getPropertyValue('--text-muted').trim();

    const xOf = (i: number) =>
      MARGIN.left + (pointCount > 1 ? (i / (pointCount - 1)) * plotW : plotW / 2);
    const yOf = (v: number) => MARGIN.top + plotH - (v / top) * plotH;

    ctx.clearRect(0, 0, width, height);

    // сетка + подписи Y (рецессивные, tabular-nums)
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (const tv of ticks) {
      ctx.strokeStyle = tv === 0 ? baseline : gridline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN.left, yOf(tv) + 0.5);
      ctx.lineTo(width - MARGIN.right, yOf(tv) + 0.5);
      ctx.stroke();
      ctx.fillStyle = inkMuted;
      ctx.fillText(tv.toLocaleString('ru-RU'), MARGIN.left - 8, yOf(tv));
    }

    // подписи X — по круглым отметкам времени (час, 2, 3, 4, 6 или 12 ч),
    // крайние подписи прижаты к краям, чтобы не обрезались
    const HOUR = 3_600_000;
    const pts = series[0].points;
    const span = pts[pointCount - 1].t - pts[0].t;
    const stepMs =
      [1, 2, 3, 4, 6, 12, 24].map((h) => h * HOUR).find((s) => span / s <= 6) ?? 24 * HOUR;
    ctx.textBaseline = 'top';
    for (let i = 0; i < pointCount; i++) {
      const dt = pts[i].t - pts[0].t;
      if (dt % stepMs !== 0) continue;
      const atFirst = i === 0;
      const atLast = i >= pointCount - 2;
      ctx.textAlign = atFirst ? 'left' : atLast ? 'right' : 'center';
      ctx.fillStyle = inkMuted;
      ctx.fillText(formatTime(pts[i].t), xOf(i), height - MARGIN.bottom + 6);
    }

    // клип области графика
    ctx.save();
    ctx.beginPath();
    ctx.rect(MARGIN.left, MARGIN.top, plotW, plotH);
    ctx.clip();

    // серии: полоса min→max, затем линия среднего 2px
    series.forEach((s, si) => {
      const cols = buckets[si];
      const c = color(s.colorSlot);

      ctx.globalAlpha = 0.22;
      ctx.fillStyle = c;
      for (let col = 0; col < cols.length; col++) {
        const b = cols[col];
        if (!b) continue;
        const px = MARGIN.left + col;
        ctx.fillRect(px, yOf(b.max), 1, Math.max(1, yOf(b.min) - yOf(b.max)));
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let started = false;
      for (let col = 0; col < cols.length; col++) {
        const b = cols[col];
        if (!b) continue;
        const px = MARGIN.left + col + 0.5;
        const py = yOf(b.mean);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    });

    // кроссхеер
    if (hovered != null) {
      const hx = xOf(hovered);
      ctx.strokeStyle = baseline;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hx + 0.5, MARGIN.top);
      ctx.lineTo(hx + 0.5, MARGIN.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      series.forEach((s) => {
        const p = s.points[hovered];
        if (!p) return;
        ctx.beginPath();
        ctx.arc(hx, yOf(p.v), 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color(s.colorSlot);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = css.getPropertyValue('--surface-1').trim();
        ctx.stroke();
      });
    }
    ctx.restore();
  }, [series, buckets, width, height, plotW, plotH, hovered, themeKey, formatTime, pointCount, top, ticks, containerRef]);

  /* ── наведение ── */
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (pointCount === 0 || plotW === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - MARGIN.left;
    const idx = Math.round((px / plotW) * (pointCount - 1));
    setHovered(Math.max(0, Math.min(pointCount - 1, idx)));
  };

  const hoveredT = hovered != null ? series[0]?.points[hovered]?.t : null;
  const hoverX =
    hovered != null && pointCount > 1
      ? MARGIN.left + (hovered / (pointCount - 1)) * plotW
      : 0;

  return (
    <div
      ref={containerRef}
      className="viz-engine"
      onMouseMove={onMove}
      onMouseLeave={() => setHovered(null)}
    >
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
      {hovered != null && hoveredT != null && (
        <div
          className="viz-tooltip viz-tooltip--below"
          style={{left: Math.max(90, Math.min(width - 90, hoverX)), top: MARGIN.top + 8}}
        >
          <div className="viz-tooltip__title">{formatTime(hoveredT)}</div>
          {series.map((s) => (
            <div className="viz-tooltip__row" key={s.id}>
              <span className="viz-swatch" style={{background: `var(--series-${s.colorSlot})`}} />
              <span className="viz-tooltip__name">{s.name}</span>
              <span className="viz-tooltip__value">{formatValue(s.points[hovered].v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
