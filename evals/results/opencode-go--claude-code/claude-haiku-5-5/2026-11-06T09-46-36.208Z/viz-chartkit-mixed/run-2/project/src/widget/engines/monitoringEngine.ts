import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import type {ChartEngine, EngineInput} from '../engine';
import {formatAxisTime, formatDateTime} from '../format';
import {alignSeries} from '../math';
import {CHART, INK} from '../palette';
import {createTooltip, fillTooltip, placeTooltip} from '../tooltip';

// Плотный временной ряд мониторинга: uPlot рисует на canvas и выдерживает
// десятки тысяч точек на серию. Модуль грузится лениво вместе с uplot.

const Y_AXIS_SIZE = 56;
const DAY_MS = 24 * 60 * 60 * 1000;
const AXIS_FONT = '12px system-ui, -apple-system, "Segoe UI", sans-serif';

export function createEngine(host: HTMLElement, input: EngineInput): ChartEngine {
  const root = document.createElement('div');
  root.className = 'viz-engine';
  host.append(root);

  const tip = createTooltip();
  let plot: uPlot | null = null;
  let identity = '';
  let current = input;

  function spanOf(inp: EngineInput): number {
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of inp.series) {
      const first = s.points[0];
      const last = s.points[s.points.length - 1];
      if (first && first.t < lo) lo = first.t;
      if (last && last.t > hi) hi = last.t;
    }
    return Number.isFinite(lo) && Number.isFinite(hi) ? hi - lo : 0;
  }

  function toData(inp: EngineInput): uPlot.AlignedData {
    const {times, columns} = alignSeries(inp.series);
    // uPlot работает в секундах.
    return [times.map((t) => t / 1000), ...columns] as uPlot.AlignedData;
  }

  // Смена состава серий, цветов или формата подписей требует пересборки plot.
  function identityOf(inp: EngineInput): string {
    const series = inp.series.map((s, i) => `${s.id}|${inp.colors[i]}`).join(';');
    const daily = spanOf(inp) > 2 * DAY_MS ? 'day' : 'time';
    return `${series}#${daily}`;
  }

  function showTooltip(u: uPlot): void {
    const idx = u.cursor.idx;
    const left = u.cursor.left ?? -1;
    if (idx == null || idx < 0 || left < 0) {
      tip.hidden = true;
      return;
    }
    const rows = current.series.map((s, i) => {
      const v = u.data[i + 1][idx];
      return {
        color: current.colors[i],
        name: s.name,
        value: v == null ? '—' : current.formatValue(v),
      };
    });
    fillTooltip(tip, formatDateTime(Number(u.data[0][idx]) * 1000), rows);
    tip.hidden = false;
    placeTooltip(tip, left, 8, u.over.clientWidth);
  }

  function buildPlot(inp: EngineInput): void {
    plot?.destroy();
    plot = null;
    identity = identityOf(inp);
    const data = toData(inp);
    // uPlot не умеет рисовать пустую ось X: без точек просто оставляем пустой контейнер.
    if (data[0].length === 0) return;

    const span = spanOf(inp);
    const options: uPlot.Options = {
      width: inp.width,
      height: inp.height,
      legend: {show: false},
      cursor: {
        drag: {x: false, y: false},
        points: {
          size: 8,
          width: 2,
          stroke: (_u, seriesIdx) => inp.colors[seriesIdx - 1] ?? INK.primary,
          fill: () => CHART.surface,
        },
      },
      scales: {x: {time: true}},
      axes: [
        {
          stroke: INK.muted,
          font: AXIS_FONT,
          grid: {stroke: CHART.gridline, width: 1},
          ticks: {stroke: CHART.baseline, width: 1},
          values: (_u, splits) => splits.map((s) => formatAxisTime(s * 1000, span)),
        },
        {
          stroke: INK.muted,
          font: AXIS_FONT,
          size: Y_AXIS_SIZE,
          grid: {stroke: CHART.gridline, width: 1},
          ticks: {stroke: CHART.baseline, width: 1},
          values: (_u, splits) => splits.map((v) => current.formatValue(v)),
        },
      ],
      series: [
        {},
        ...inp.series.map((_, i) => ({
          stroke: inp.colors[i],
          width: 2,
          points: {show: false},
          spanGaps: false,
        })),
      ],
      hooks: {setCursor: [showTooltip]},
    };

    plot = new uPlot(options, data, root);
    plot.over.append(tip);
  }

  current = input;
  buildPlot(input);

  return {
    update(next) {
      current = next;
      if (!plot || identityOf(next) !== identity) {
        buildPlot(next);
        return;
      }
      plot.setSize({width: next.width, height: next.height});
      plot.setData(toData(next));
    },
    destroy() {
      plot?.destroy();
      plot = null;
      root.remove();
    },
  };
}
