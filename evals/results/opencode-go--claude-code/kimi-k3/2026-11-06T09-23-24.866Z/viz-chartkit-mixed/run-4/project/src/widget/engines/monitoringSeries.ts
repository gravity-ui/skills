/**
 * Движок «мониторинг»: плотный временной ряд на Canvas.
 * Тысячи точек — применяется min-max декимация по пиксельным колонкам,
 * поэтому выбросы не теряются. Загружается лениво при первом выборе
 * режима monitoring.
 */

import type {ChartEngine, EngineContext, EngineView} from '../types';
import {niceScale} from '../format';

const MARGIN = {top: 12, right: 16, bottom: 26, left: 52};
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const LINE_W = 2;
const DOT_R = 3.5;
const RING = 2;

/** Min/max диапазон значений values[i0..i1] (включительно). Чистая функция — тестируется. */
export function computeColumnRanges(
  values: number[],
  i0: number,
  i1: number,
): {min: number; max: number} | null {
  const lo = Math.max(0, Math.min(i0, i1));
  const hi = Math.min(values.length - 1, Math.max(i0, i1));
  if (lo > hi || values.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (let i = lo; i <= hi; i++) {
    const v = values[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return {min, max};
}

interface Scales {
  x: (i: number) => number;
  y: (v: number) => number;
  plotW: number;
  plotH: number;
}

export function createEngine(ctx: EngineContext): ChartEngine {
  const base = document.createElement('canvas');
  const top = document.createElement('canvas');
  for (const c of [base, top]) {
    c.style.position = 'absolute';
    c.style.inset = '0';
    c.style.width = '100%';
    c.style.height = '100%';
  }
  top.style.cursor = 'crosshair';
  ctx.plotEl.appendChild(base);
  ctx.plotEl.appendChild(top);

  const baseCtx = base.getContext('2d');
  const topCtx = top.getContext('2d');

  let view: EngineView | null = null;
  let scales: Scales | null = null;
  let cursor: number | null = null;

  function sizeCanvas(c: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null {
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    const c2d = c.getContext('2d');
    if (c2d) c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c2d;
  }

  function renderBase(): void {
    if (!view || !baseCtx) return;
    const {width, height, times, series, colors, tokens} = view;
    const n = times.length;
    sizeCanvas(base, width, height);
    baseCtx.clearRect(0, 0, width, height);
    if (n < 2 || width < 120 || height < 80) return;

    const plotW = width - MARGIN.left - MARGIN.right;
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const globalMax = Math.max(...series.flatMap((s) => s.values));
    const {domainMax, ticks} = niceScale(globalMax, 5);
    const x = (i: number): number => MARGIN.left + (i / (n - 1)) * plotW;
    const y = (v: number): number => MARGIN.top + plotH * (1 - v / domainMax);
    scales = {x, y, plotW, plotH};

    const g = baseCtx;
    // Сетка: сплошные hairline, приглушённые
    g.font = `11px ${FONT}`;
    g.textAlign = 'right';
    g.textBaseline = 'middle';
    g.lineWidth = 1;
    for (const t of ticks) {
      const gy = Math.round(y(t)) + 0.5;
      g.strokeStyle = t === 0 ? tokens.baseline : tokens.gridline;
      g.beginPath();
      g.moveTo(MARGIN.left, gy);
      g.lineTo(MARGIN.left + plotW, gy);
      g.stroke();
      g.fillStyle = tokens.textMuted;
      g.fillText(view.formatYTick(t), MARGIN.left - 8, y(t));
    }
    // Ось X
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const xStep = Math.max(1, Math.ceil((n - 1) / 7));
    for (let i = 0; i < n; i += xStep) {
      g.fillStyle = tokens.textMuted;
      g.fillText(view.formatXTick(times[i]), x(i), height - 8);
    }

    // Ряды: полилиния, либо min-max декимация по колонкам при плотности > 1 точки/px
    series.forEach((s, si) => {
      g.strokeStyle = colors[si];
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (n <= plotW) {
        g.lineWidth = LINE_W;
        g.beginPath();
        for (let i = 0; i < n; i++) {
          if (i === 0) g.moveTo(x(i), y(s.values[i]));
          else g.lineTo(x(i), y(s.values[i]));
        }
        g.stroke();
      } else {
        // На каждую пиксельную колонку — вертикальный сегмент min..max:
        // конверт сохраняет выбросы, которые усреднение бы стёрло.
        g.lineWidth = 1;
        g.beginPath();
        for (let col = 0; col < plotW; col++) {
          const i0 = Math.floor((col / plotW) * (n - 1));
          const i1 = Math.ceil(((col + 1) / plotW) * (n - 1));
          const r = computeColumnRanges(s.values, i0, i1);
          if (!r) continue;
          const px = MARGIN.left + col + 0.5;
          g.moveTo(px, y(r.max));
          g.lineTo(px, y(r.min));
        }
        g.stroke();
      }
    });
  }

  function drawCursor(): void {
    if (!topCtx || !view) return;
    sizeCanvas(top, view.width, view.height);
    topCtx.clearRect(0, 0, view.width, view.height);
    if (cursor === null || !scales) return;
    const cur = cursor;
    const {series, colors, tokens} = view;
    const {x, y, plotH} = scales;
    const cx = x(cur);
    topCtx.strokeStyle = tokens.baseline;
    topCtx.lineWidth = 1;
    topCtx.beginPath();
    topCtx.moveTo(Math.round(cx) + 0.5, MARGIN.top);
    topCtx.lineTo(Math.round(cx) + 0.5, MARGIN.top + plotH);
    topCtx.stroke();
    series.forEach((s, si) => {
      topCtx.beginPath();
      topCtx.arc(cx, y(s.values[cur]), DOT_R, 0, Math.PI * 2);
      topCtx.fillStyle = colors[si];
      topCtx.fill();
      topCtx.lineWidth = RING;
      topCtx.strokeStyle = tokens.surface;
      topCtx.stroke();
    });
  }

  function getAnchor(index: number): {x: number; y: number} {
    if (!view || !scales) return {x: 0, y: 0};
    const ys = view.series.map((s) => scales!.y(s.values[index]));
    return {x: scales.x(index), y: Math.min(...ys)};
  }

  top.addEventListener('pointermove', (ev) => {
    if (!view || !scales) return;
    const rect = top.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const n = view.times.length;
    const i = Math.min(
      n - 1,
      Math.max(0, Math.round(((mx - MARGIN.left) / scales.plotW) * (n - 1))),
    );
    cursor = i;
    drawCursor();
    const a = getAnchor(i);
    ctx.onHover({index: i, x: a.x, y: a.y});
  });
  top.addEventListener('pointerleave', () => {
    cursor = null;
    drawCursor();
    ctx.onHover(null);
  });

  return {
    update(next: EngineView): void {
      view = next;
      renderBase();
      drawCursor();
    },
    resize(width: number, height: number): void {
      if (!view) return;
      view = {...view, width, height};
      renderBase();
      drawCursor();
    },
    setCursor(index: number | null): void {
      cursor = index;
      drawCursor();
    },
    getAnchor,
    destroy(): void {
      base.remove();
      top.remove();
    },
  };
}
