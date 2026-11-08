import type {ChartEngine, EngineInput} from '../engine';
import {formatAxisTime, formatDateTime} from '../format';
import {alignSeries, nearestIndex, niceScale} from '../math';
import {CHART, INK} from '../palette';
import {createTooltip, fillTooltip, placeTooltip} from '../tooltip';

// Линейный график продаж: SVG без внешних зависимостей. Модуль грузится лениво.

const SVG_NS = 'http://www.w3.org/2000/svg';
const PAD = {top: 12, right: 72, bottom: 28, left: 56};
const X_TICKS = 5;
const LABEL_MIN_GAP = 14;

function svgEl(tag: string, attrs: Record<string, string | number>, parent: Element): SVGElement {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  parent.append(node);
  return node;
}

function linePath(
  column: readonly (number | null)[],
  times: readonly number[],
  x: (t: number) => number,
  y: (v: number) => number,
): string {
  let d = '';
  let pen = false;
  for (let k = 0; k < column.length; k++) {
    const v = column[k];
    if (v === null) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${x(times[k]).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
}

export function createEngine(host: HTMLElement, input: EngineInput): ChartEngine {
  const root = document.createElement('div');
  root.className = 'viz-engine';
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('role', 'img');
  svg.classList.add('viz-engine__svg');
  const tip = createTooltip();
  root.append(svg, tip);
  host.append(root);

  let current = input;

  function draw(inp: EngineInput): void {
    current = inp;
    svg.setAttribute('width', String(inp.width));
    svg.setAttribute('height', String(inp.height));
    svg.setAttribute('aria-label', inp.series.map((s) => s.name).join(', '));
    svg.replaceChildren();
    tip.hidden = true;

    const plotW = inp.width - PAD.left - PAD.right;
    const plotH = inp.height - PAD.top - PAD.bottom;
    const {times, columns} = alignSeries(inp.series);
    if (plotW <= 0 || plotH <= 0 || times.length === 0) return;

    const t0 = times[0];
    const t1 = times[times.length - 1];
    const span = t1 - t0;

    let lo = 0;
    let hi = 0;
    for (const column of columns) {
      for (const v of column) {
        if (v === null) continue;
        if (v > hi) hi = v;
        if (v < lo) lo = v;
      }
    }
    const scale = niceScale(lo, hi, 4);
    const x = (t: number) => PAD.left + (span === 0 ? plotW / 2 : ((t - t0) / span) * plotW);
    const y = (v: number) => PAD.top + (1 - (v - scale.lo) / (scale.hi - scale.lo)) * plotH;
    const right = inp.width - PAD.right;
    const bottomY = PAD.top + plotH;

    // Горизонтальные линии — тонкие и нейтральные; нулевая линия чуть темнее.
    for (const tick of scale.ticks) {
      const ty = y(tick);
      svgEl(
        'line',
        {
          x1: PAD.left,
          x2: right,
          y1: ty,
          y2: ty,
          stroke: tick === 0 ? CHART.baseline : CHART.gridline,
          'stroke-width': 1,
          'shape-rendering': 'crispEdges',
        },
        svg,
      );
      svgEl('text', {x: PAD.left - 8, y: ty + 4, 'text-anchor': 'end', fill: INK.muted, 'font-size': 12}, svg)
        .textContent = inp.formatValue(tick);
    }

    for (let k = 0; k < X_TICKS; k++) {
      const t = t0 + (span * k) / (X_TICKS - 1);
      const anchor = k === 0 ? 'start' : k === X_TICKS - 1 ? 'end' : 'middle';
      svgEl(
        'text',
        {x: x(t), y: inp.height - 8, 'text-anchor': anchor, fill: INK.muted, 'font-size': 12},
        svg,
      ).textContent = formatAxisTime(t, span);
    }

    // Серии. Заливка — только для одной серии и только без разрывов.
    inp.series.forEach((_, i) => {
      const column = columns[i];
      const color = inp.colors[i];
      const d = linePath(column, times, x, y);
      if (d === '') return;
      if (inp.series.length === 1 && column.every((v) => v !== null)) {
        const base = y(0);
        svgEl(
          'path',
          {d: `${d}L${x(t1)} ${base}L${x(t0)} ${base}Z`, fill: color, 'fill-opacity': 0.1},
          svg,
        );
      }
      svgEl(
        'path',
        {d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'},
        svg,
      );
    });

    // Подписи значений в конце линий. При пересечении подпись пропускается:
    // идентичность серий всё равно держит легенда.
    const ends = inp.series
      .map((_, i) => {
        const column = columns[i];
        let k = column.length - 1;
        while (k >= 0 && column[k] === null) k--;
        if (k < 0) return null;
        const value = column[k] as number;
        return {i, px: x(times[k]), py: y(value), value};
      })
      .filter((e): e is NonNullable<typeof e> => e !== null)
      .sort((a, b) => a.py - b.py);

    let lastLabelY = -Infinity;
    for (const e of ends) {
      svgEl(
        'circle',
        {cx: e.px, cy: e.py, r: 4, fill: inp.colors[e.i], stroke: CHART.surface, 'stroke-width': 2},
        svg,
      );
      if (e.py - lastLabelY >= LABEL_MIN_GAP) {
        lastLabelY = e.py;
        svgEl(
          'text',
          {x: e.px + 10, y: e.py + 4, fill: INK.primary, 'font-size': 12},
          svg,
        ).textContent = inp.formatValue(e.value);
      }
    }

    // Наведение: вертикальная линейка «ловит» X, подсказка — все серии в этот момент.
    const crosshair = svgEl(
      'line',
      {x1: 0, x2: 0, y1: PAD.top, y2: bottomY, stroke: CHART.crosshair, 'stroke-width': 1, visibility: 'hidden'},
      svg,
    );
    const dots = inp.series.map((_, i) =>
      svgEl(
        'circle',
        {r: 4, fill: inp.colors[i], stroke: CHART.surface, 'stroke-width': 2, visibility: 'hidden'},
        svg,
      ),
    );
    const hitArea = svgEl(
      'rect',
      {x: PAD.left, y: PAD.top, width: plotW, height: plotH, fill: 'transparent'},
      svg,
    );

    const hide = () => {
      crosshair.setAttribute('visibility', 'hidden');
      dots.forEach((d) => d.setAttribute('visibility', 'hidden'));
      tip.hidden = true;
    };

    hitArea.addEventListener('pointermove', (event) => {
      const rect = svg.getBoundingClientRect();
      const px = (event as PointerEvent).clientX - rect.left;
      const tAt = t0 + ((px - PAD.left) / plotW) * span;
      const k = nearestIndex(times, tAt);
      if (k < 0) return hide();

      const tx = x(times[k]);
      crosshair.setAttribute('x1', String(tx));
      crosshair.setAttribute('x2', String(tx));
      crosshair.setAttribute('visibility', 'visible');

      const rows = inp.series.map((s, i) => {
        const v = columns[i][k];
        const dot = dots[i];
        if (v === null) {
          dot.setAttribute('visibility', 'hidden');
        } else {
          dot.setAttribute('cx', String(tx));
          dot.setAttribute('cy', String(y(v)));
          dot.setAttribute('visibility', 'visible');
        }
        return {color: inp.colors[i], name: s.name, value: v === null ? '—' : inp.formatValue(v)};
      });

      fillTooltip(tip, formatDateTime(times[k]), rows);
      tip.hidden = false;
      placeTooltip(tip, tx, PAD.top, inp.width);
    });
    hitArea.addEventListener('pointerleave', hide);
  }

  draw(input);

  return {
    update(next) {
      draw(next);
    },
    destroy() {
      root.remove();
    },
  };
}
