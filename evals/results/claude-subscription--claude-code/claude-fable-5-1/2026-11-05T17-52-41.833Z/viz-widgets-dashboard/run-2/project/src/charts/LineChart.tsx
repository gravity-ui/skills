import * as React from 'react';

import { axisFormatter, niceTicks, pickTickIndexes } from './scale';
import { useElementSize } from './useElementSize';

export interface LineSeries {
  name: string;
  values: number[];
  /** CSS-переменная цвета серии, например `var(--viz-series-1)` */
  color: string;
}

export interface LineChartProps {
  labels: string[];
  series: LineSeries[];
  formatValue: (value: number) => string;
  /** Подпись к точке в тултипе (например, полная дата) */
  formatLabel?: (index: number) => string;
}

const BASE_MARGIN = { top: 12, right: 16, bottom: 24, left: 44 };
const CHAR_W = 6.6;

export function LineChart({ labels, series, formatValue, formatLabel }: LineChartProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = React.useState<number | null>(null);

  const n = labels.length;
  const width = size.width;
  // Правое поле зависит от длины подписи на конце линии, чтобы её не обрезало.
  const longestEnd = Math.max(0, ...series.map((s) => formatValue(s.values[s.values.length - 1] ?? 0).length));
  const MARGIN = { ...BASE_MARGIN, right: BASE_MARGIN.right + Math.ceil(longestEnd * CHAR_W) + 8 };
  const height = size.height;
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const maxValue = Math.max(0, ...series.flatMap((s) => s.values));
  const { ticks, max } = niceTicks(maxValue, 4);
  const formatAxis = axisFormatter(max);

  const xAt = (i: number) => MARGIN.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yAt = (v: number) => MARGIN.top + plotH - (v / max) * plotH;

  const paths = series.map((s) => s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' '));

  // Прямые подписи на концах линий только если они не сталкиваются.
  const endLabels = React.useMemo(() => {
    const ends = series.map((s, idx) => ({ idx, y: yAt(s.values[n - 1] ?? 0), value: s.values[n - 1] ?? 0 }));
    const sorted = [...ends].sort((a, b) => a.y - b.y);
    const visible = new Set<number>();
    let lastY = -Infinity;
    for (const end of sorted) {
      if (end.y - lastY >= 14) {
        visible.add(end.idx);
        lastY = end.y;
      }
    }
    return ends.filter((end) => visible.has(end.idx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, n, plotH, max]);

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (n === 0 || plotW <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - MARGIN.left;
    const index = Math.round((x / plotW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, index)));
  };

  const tickIndexes = pickTickIndexes(n, Math.max(2, Math.min(6, Math.floor(plotW / 72))));

  const tooltipLeft = hover === null ? 0 : xAt(hover);
  const flip = hover !== null && tooltipLeft > width * 0.6;

  return (
    <div className="viz-chart" ref={ref}>
      {width > 0 && height > 0 && (
        <svg
          className="viz-svg"
          width={width}
          height={height}
          role="img"
          aria-label={`Линейный график: ${series.map((s) => s.name).join(', ')}`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={MARGIN.left + plotW} y1={yAt(t)} y2={yAt(t)} className={t === 0 ? 'viz-axis' : 'viz-grid'} />
              <text x={MARGIN.left - 8} y={yAt(t)} dy="0.35em" textAnchor="end" className="viz-tick">
                {formatAxis(t)}
              </text>
            </g>
          ))}
          {tickIndexes.map((i) => (
            <text key={i} x={xAt(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="viz-tick">
              {labels[i]}
            </text>
          ))}
          {hover !== null && <line x1={xAt(hover)} x2={xAt(hover)} y1={MARGIN.top} y2={MARGIN.top + plotH} className="viz-crosshair" />}
          {series.map((s, idx) => (
            <path key={s.name} d={paths[idx]} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {series.map((s) => {
            const i = hover ?? n - 1;
            if (i < 0) return null;
            return <circle key={s.name} cx={xAt(i)} cy={yAt(s.values[i])} r={4} fill={s.color} className="viz-dot" />;
          })}
          {hover === null &&
            endLabels.map((end) => (
              <text key={end.idx} x={xAt(n - 1) + 8} y={end.y} dy="0.35em" className="viz-label">
                {formatValue(end.value)}
              </text>
            ))}
        </svg>
      )}
      {hover !== null && (
        <div
          className={`viz-tooltip ${flip ? 'viz-tooltip_left' : ''}`}
          style={{ left: tooltipLeft, top: MARGIN.top }}
          role="status"
        >
          <div className="viz-tooltip__title">{formatLabel ? formatLabel(hover) : labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="viz-tooltip__row">
              <span className="viz-key" style={{ background: s.color }} aria-hidden="true" />
              <span className="viz-tooltip__value">{formatValue(s.values[hover])}</span>
              <span className="viz-tooltip__name">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Legend({ series, shape = 'line' }: { series: { name: string; color: string }[]; shape?: 'line' | 'rect' }) {
  return (
    <ul className="viz-legend" aria-label="Легенда">
      {series.map((s) => (
        <li key={s.name} className="viz-legend__item">
          <span className={`viz-legend__swatch viz-legend__swatch_${shape}`} style={{ background: s.color }} aria-hidden="true" />
          <span>{s.name}</span>
        </li>
      ))}
    </ul>
  );
}
