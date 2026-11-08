import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {EngineProps} from '../../widget/types';
import {nearestIndex, niceTicks} from '../../widget/format';
import {TooltipCard} from '../../widget/TooltipCard';

const MARGIN = {top: 12, right: 16, bottom: 24, left: 44};
const FONT_11 = '11px system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * Canvas-движок для плотного мониторинга: тысячи точек на серию.
 * Рендер — min/max даунсэмплинг по пиксельным колонкам (вертикальный сегмент
 * на колонку сохраняет пики, которые усреднение стирало бы), HiDPI-скейлинг,
 * кроссхейр и тултип — тот же контракт, что у SVG-движка.
 */
export default function MonitoringEngine({
  series,
  height,
  palette,
  yTickFormat,
  xTickFormat,
  tooltipValueFormat,
  tooltipXFormat,
}: EngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const times = useMemo(() => series[0]?.points.map((p) => p.t) ?? [], [series]);

  const geom = useMemo(() => {
    const innerW = Math.max(40, Math.round(width - MARGIN.left - MARGIN.right));
    const innerH = Math.max(40, height - MARGIN.top - MARGIN.bottom);
    const t0 = times[0] ?? 0;
    const t1 = times[times.length - 1] ?? 1;

    let maxV = 0;
    for (const s of series) for (const p of s.points) if (p.v > maxV) maxV = p.v;
    const yTicks = niceTicks(0, maxV, 4);
    const yMax = yTicks[yTicks.length - 1] || 1;

    return {
      innerW,
      innerH,
      t0,
      t1,
      yTicks,
      x: (t: number) => MARGIN.left + (innerW * (t - t0)) / Math.max(1, t1 - t0),
      y: (v: number) => MARGIN.top + innerH - (innerH * v) / yMax,
    };
  }, [series, times, width, height]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || times.length < 2) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, width, height);

    const {innerW, t0, t1, yTicks, x, y} = geom;
    const plotRight = width - MARGIN.right;
    const baselineY = y(0);

    // Сетка + подписи осей: волосяные линии, приглушённые чернила, tabular-nums.
    ctx.font = FONT_11;
    ctx.textBaseline = 'middle';
    for (const tv of yTicks) {
      const yy = Math.round(y(tv)) + 0.5;
      ctx.strokeStyle = palette.gridline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN.left, yy);
      ctx.lineTo(plotRight, yy);
      ctx.stroke();
      ctx.fillStyle = palette.textMuted;
      ctx.textAlign = 'right';
      ctx.fillText(yTickFormat(tv), MARGIN.left - 8, y(tv));
    }
    ctx.strokeStyle = palette.baseline;
    ctx.beginPath();
    ctx.moveTo(MARGIN.left, Math.round(baselineY) + 0.5);
    ctx.lineTo(plotRight, Math.round(baselineY) + 0.5);
    ctx.stroke();

    const nX = Math.max(2, Math.floor(innerW / 110));
    ctx.fillStyle = palette.textMuted;
    ctx.textBaseline = 'top';
    for (let i = 0; i <= nX; i++) {
      const t = t0 + ((t1 - t0) * i) / nX;
      const xx = x(t);
      ctx.textAlign = i === 0 ? 'left' : i === nX ? 'right' : 'center';
      ctx.fillText(xTickFormat(t), xx, height - MARGIN.bottom + 8);
    }

    // Данные: min/max сегмент на пиксельную колонку.
    for (const s of series) {
      const colMin = new Float64Array(innerW).fill(Infinity);
      const colMax = new Float64Array(innerW).fill(-Infinity);
      for (const p of s.points) {
        const col = Math.min(innerW - 1, Math.max(0, Math.floor(x(p.t) - MARGIN.left)));
        if (p.v < colMin[col]) colMin[col] = p.v;
        if (p.v > colMax[col]) colMax[col] = p.v;
      }
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let c = 0; c < innerW; c++) {
        if (colMin[c] === Infinity) continue;
        const xx = MARGIN.left + c + 0.5;
        ctx.moveTo(xx, y(colMax[c]));
        ctx.lineTo(xx, y(colMin[c]));
      }
      ctx.stroke();
    }

    // Кроссхейр поверх данных.
    if (hover !== null && hover < times.length) {
      const t = times[hover];
      const xx = Math.round(x(t)) + 0.5;
      ctx.strokeStyle = palette.baseline;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xx, MARGIN.top);
      ctx.lineTo(xx, baselineY);
      ctx.stroke();
      for (const s of series) {
        const idx = nearestIndex(s.points, t);
        if (idx < 0) continue;
        const p = s.points[idx];
        ctx.beginPath();
        ctx.fillStyle = s.color;
        ctx.strokeStyle = palette.surface;
        ctx.lineWidth = 2;
        ctx.arc(x(p.t), y(p.v), 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [series, times, geom, width, height, palette, hover, yTickFormat, xTickFormat]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const scheduleHover = (idx: number | null) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setHover(idx));
  };

  const updateHoverFromPointer = (clientX: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || times.length < 2) return;
    const px = clientX - rect.left;
    const t = geom.t0 + ((px - MARGIN.left) / geom.innerW) * (geom.t1 - geom.t0);
    const idx = nearestIndex(series[0].points, t);
    scheduleHover(idx >= 0 ? idx : null);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Escape') return;
    e.preventDefault();
    if (e.key === 'Escape') {
      setHover(null);
      return;
    }
    // Шаг клавиш — ~1% диапазона, чтобы по тысячам точек можно было пройти.
    const delta = (e.key === 'ArrowRight' ? 1 : -1) * Math.max(1, Math.round(times.length / 100));
    setHover((h) => {
      const next = (h ?? (delta > 0 ? -delta : times.length)) + delta;
      return Math.min(times.length - 1, Math.max(0, next));
    });
  };

  if (series.length === 0 || times.length < 2) {
    return <div ref={containerRef} style={{height}} />;
  }

  const hoverT = hover !== null && hover < times.length ? times[hover] : null;
  const hoverX = hoverT !== null ? geom.x(hoverT) : 0;

  return (
    <div
      ref={containerRef}
      className="viz-plot__hitbox"
      tabIndex={0}
      role="img"
      aria-label={`Плотный временной ряд: ${series.map((s) => s.name).join(', ')}`}
      onPointerMove={(e) => updateHoverFromPointer(e.clientX)}
      onPointerLeave={() => scheduleHover(null)}
      onKeyDown={onKeyDown}
    >
      <canvas ref={canvasRef} style={{display: 'block'}} />

      {hoverT !== null && (
        <TooltipCard
          left={hoverX}
          top={MARGIN.top}
          side={hoverX > width * 0.6 ? 'left' : 'right'}
          title={tooltipXFormat(hoverT)}
          rows={series.map((s) => {
            const idx = nearestIndex(s.points, hoverT);
            return {
              id: s.id,
              color: s.color,
              name: s.name,
              value: idx >= 0 ? tooltipValueFormat(s.points[idx].v) : '—',
            };
          })}
        />
      )}
    </div>
  );
}
