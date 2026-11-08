/**
 * Движок «продажи»: обычный линейный график на SVG.
 * Немного точек — важны аккуратные метки, концевые значения и чёткая геометрия.
 * Загружается лениво (динамический import) при первом выборе режима sales.
 */

import type {ChartEngine, EngineContext, EngineView} from '../types';
import {niceScale} from '../format';

const NS = 'http://www.w3.org/2000/svg';
const MARGIN = {top: 16, right: 88, bottom: 30, left: 56};
const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
const LINE_W = 2;
const DOT_R = 4; // >= 8px маркер
const RING = 2; // кольцо в цвет поверхности
const LABEL_GAP = 15; // мин. вертикальный зазор между концевыми подписями

interface Scales {
  x: (i: number) => number;
  y: (v: number) => number;
  plotW: number;
  plotH: number;
}

function svgEl(name: string, attrs: Record<string, string>, parent?: Element): SVGElement {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

function textEl(
  parent: Element,
  attrs: Record<string, string>,
  text: string,
): SVGTextElement {
  const node = document.createElementNS(NS, 'text');
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  node.setAttribute('font-family', FONT);
  node.textContent = text; // подписи — недоверенные данные, только textContent
  parent.appendChild(node);
  return node as SVGTextElement;
}

export function createEngine(ctx: EngineContext): ChartEngine {
  const svg = document.createElementNS(NS, 'svg') as SVGSVGElement;
  svg.style.display = 'block';
  svg.setAttribute('role', 'presentation');
  ctx.plotEl.appendChild(svg);

  let view: EngineView | null = null;
  let scales: Scales | null = null;
  let cursor: number | null = null;
  let cursorLayer: SVGGElement | null = null;

  function render(): void {
    if (!view) return;
    const {width, height, times, series, colors, tokens, formatYTick, formatXTick, formatPoint} =
      view;
    const n = times.length;
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.replaceChildren();
    if (n < 2 || width < 120 || height < 80) return;

    const plotW = width - MARGIN.left - MARGIN.right;
    const plotH = height - MARGIN.top - MARGIN.bottom;
    const globalMax = Math.max(...series.flatMap((s) => s.values));
    const {domainMax, ticks} = niceScale(globalMax, 5);
    const x = (i: number): number => MARGIN.left + (i / (n - 1)) * plotW;
    const y = (v: number): number => MARGIN.top + plotH * (1 - v / domainMax);
    scales = {x, y, plotW, plotH};

    // Сетка и ось Y: сплошные hairline, приглушённые
    for (const t of ticks) {
      const gy = Math.round(y(t)) + 0.5;
      svgEl('line', {
        x1: String(MARGIN.left),
        x2: String(MARGIN.left + plotW),
        y1: String(gy),
        y2: String(gy),
        stroke: t === 0 ? tokens.baseline : tokens.gridline,
        'stroke-width': '1',
      }, svg);
      textEl(svg, {
        x: String(MARGIN.left - 8),
        y: String(y(t) + 4),
        'text-anchor': 'end',
        'font-size': '11',
        fill: tokens.textMuted,
      }, formatYTick(t));
    }

    // Ось X: подписи дат
    const xStep = Math.max(1, Math.ceil((n - 1) / 6));
    for (let i = 0; i < n; i += xStep) {
      textEl(svg, {
        x: String(x(i)),
        y: String(height - 8),
        'text-anchor': 'middle',
        'font-size': '11',
        fill: tokens.textMuted,
      }, formatXTick(times[i]));
    }

    // Ряды: линии 2px со скруглёнными стыками
    series.forEach((s, si) => {
      const d = s.values
        .map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`)
        .join('');
      svgEl('path', {
        d,
        fill: 'none',
        stroke: colors[si],
        'stroke-width': String(LINE_W),
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      }, svg);
    });

    // Концевые маркеры (с кольцом поверхности) и выборочные подписи концов
    const ends = series.map((s, si) => ({
      si,
      cx: x(n - 1),
      cy: y(s.values[n - 1]),
      label: formatPoint(s.values[n - 1]),
    }));
    for (const e of ends) {
      svgEl('circle', {
        cx: String(e.cx),
        cy: String(e.cy),
        r: String(DOT_R),
        fill: colors[e.si],
        stroke: tokens.surface,
        'stroke-width': String(RING),
      }, svg);
    }
    // Подписываем концы, только если подписи не наезжают друг на друга:
    // наехавшие остаются в тултипе и табличном виде (подписи выборочны).
    const sorted = [...ends].sort((a, b) => a.cy - b.cy);
    const keep = new Set<number>();
    let lastY = -Infinity;
    for (const e of sorted) {
      if (e.cy - lastY >= LABEL_GAP) {
        keep.add(e.si);
        lastY = e.cy;
      }
    }
    for (const e of ends) {
      if (!keep.has(e.si)) continue;
      const label = textEl(svg, {
        x: String(e.cx + DOT_R + RING + 6),
        y: String(e.cy + 4),
        'font-size': '11',
        'font-weight': '600',
        fill: tokens.textPrimary, // текст — в чернильных токенах, не в цвете ряда
      }, e.label);
      label.setAttribute('text-anchor', 'start');
    }

    // Слой перекрестия поверх данных
    cursorLayer = document.createElementNS(NS, 'g') as SVGGElement;
    svg.appendChild(cursorLayer);

    // Хит-слой: вся область построения, перекрестие само находит X
    const hit = svgEl('rect', {
      x: String(MARGIN.left),
      y: String(MARGIN.top),
      width: String(plotW),
      height: String(plotH),
      fill: 'transparent',
    }, svg) as SVGRectElement;
    hit.style.cursor = 'crosshair';
    hit.addEventListener('pointermove', (ev) => {
      const rect = svg.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const i = Math.min(n - 1, Math.max(0, Math.round(((mx - MARGIN.left) / plotW) * (n - 1))));
      cursor = i;
      drawCursor();
      const a = getAnchor(i);
      ctx.onHover({index: i, x: a.x, y: a.y});
    });
    hit.addEventListener('pointerleave', () => {
      cursor = null;
      drawCursor();
      ctx.onHover(null);
    });

    drawCursor();
  }

  function drawCursor(): void {
    const layer = cursorLayer;
    if (!layer) return;
    layer.replaceChildren();
    if (cursor === null || !view || !scales) return;
    const cur = cursor;
    const {series, colors, tokens} = view;
    const {x, y, plotH} = scales;
    const cx = x(cur);
    svgEl('line', {
      x1: String(cx),
      x2: String(cx),
      y1: String(MARGIN.top),
      y2: String(MARGIN.top + plotH),
      stroke: tokens.baseline,
      'stroke-width': '1',
    }, layer);
    series.forEach((s, si) => {
      svgEl('circle', {
        cx: String(cx),
        cy: String(y(s.values[cur])),
        r: String(DOT_R),
        fill: colors[si],
        stroke: tokens.surface,
        'stroke-width': String(RING),
      }, layer);
    });
  }

  function getAnchor(index: number): {x: number; y: number} {
    if (!view || !scales) return {x: 0, y: 0};
    const ys = view.series.map((s) => scales!.y(s.values[index]));
    return {x: scales.x(index), y: Math.min(...ys)};
  }

  return {
    update(next: EngineView): void {
      view = next;
      render();
    },
    resize(width: number, height: number): void {
      if (!view) return;
      view = {...view, width, height};
      render();
    },
    setCursor(index: number | null): void {
      cursor = index;
      drawCursor();
    },
    getAnchor,
    destroy(): void {
      svg.remove();
    },
  };
}
