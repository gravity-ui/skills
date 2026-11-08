import {useState} from 'react';

import {formatCompact, formatFull, formatPercent, niceTicks} from '../format';
import {useElementSize} from '../hooks';
import {ChartTooltip} from './ChartTooltip';
import {DataTable} from './DataTable';
import type {WidgetView} from './WidgetFrame';

interface BarChartProps {
  title: string;
  items: Array<{name: string; value: number}>;
  unit: string;
  view: WidgetView;
}

const MAX_BAR = 24;
const RIGHT = 56;
const TOP = 4;
const BOTTOM = 20;

/** Rounded data-end (4px) on the right, square at the baseline on the left. */
function barPath(x0: number, y0: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h / 2);
  const x1 = x0 + w;
  const y1 = y0 + h;
  return `M${x0},${y0} H${x1 - r} A${r},${r} 0 0 1 ${x1},${y0 + r} V${y1 - r} A${r},${r} 0 0 1 ${x1 - r},${y1} H${x0} Z`;
}

/** Ranked horizontal bars in one hue; only the extreme is direct-labeled, the rest live in the axis, tooltip and table. */
export function BarChart({title, items, unit, view}: BarChartProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<{index: number; px: number; py: number} | null>(null);
  const total = items.reduce((a, b) => a + b.value, 0);

  if (view === 'table') {
    const rows = items.map((it) => ({name: it.name, value: formatFull(it.value), share: formatPercent(total ? it.value / total : 0)}));
    const columns = [
      {id: 'name', name: 'Страница'},
      {id: 'value', name: unit, align: 'end' as const, className: 'viz-num'},
      {id: 'share', name: 'Доля', align: 'end' as const, className: 'viz-num'},
    ];
    return <DataTable columns={columns} rows={rows} label={`${title}, таблица`} />;
  }

  const {width, height} = size;
  const labelW = Math.min(150, Math.round(width * 0.36));
  const plotW = Math.max(0, width - labelW - RIGHT);
  const plotH = Math.max(0, height - TOP - BOTTOM);
  const n = items.length;
  const rowH = n ? plotH / n : 0;
  const barH = Math.max(2, Math.min(MAX_BAR, rowH - 8));
  const max = Math.max(1, ...items.map((i) => i.value));
  // Fewer ticks on a narrow plot so the labels never collide.
  const ticks = niceTicks(max, Math.max(2, Math.min(4, Math.floor(plotW / 70))));
  const xMax = ticks[ticks.length - 1];
  const x = (v: number) => labelW + (v / xMax) * plotW;
  const maxChars = Math.max(3, Math.floor((labelW - 10) / 6.6));
  const ready = width > 0 && plotH > 0 && n > 0;

  return (
    <div className="viz-chart" ref={ref}>
      {ready ? (
        <svg width={width} height={height} role="img" aria-label={`${title}: ранжированные столбцы, ${n} позиций`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={TOP} y2={TOP + plotH} stroke={t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} />
              <text x={x(t)} y={TOP + plotH + 14} textAnchor={t === 0 ? 'start' : 'middle'} className="viz-axis-text">
                {formatCompact(t)}
              </text>
            </g>
          ))}
          {items.map((it, i) => {
            const y0 = TOP + i * rowH + (rowH - barH) / 2;
            const w = (it.value / xMax) * plotW;
            const name = it.name.length > maxChars ? `${it.name.slice(0, maxChars - 1)}…` : it.name;
            const isHover = hover?.index === i;
            return (
              <g key={it.name}>
                <text x={labelW - 8} y={y0 + barH / 2} dy="0.35em" textAnchor="end" className="viz-label">
                  {name}
                </text>
                <path d={barPath(labelW, y0, w, barH)} fill="var(--viz-s1)" opacity={isHover ? 0.8 : 1} />
                {i === 0 ? (
                  <text x={labelW + w + 6} y={y0 + barH / 2} dy="0.35em" className="viz-label">
                    {formatCompact(it.value)}
                  </text>
                ) : null}
                <rect
                  className="viz-hit"
                  x={0}
                  y={TOP + i * rowH}
                  width={width}
                  height={rowH}
                  tabIndex={0}
                  role="img"
                  aria-label={`${it.name}: ${formatFull(it.value)}`}
                  onPointerMove={(event) => {
                    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (rect) setHover({index: i, px: event.clientX - rect.left, py: event.clientY - rect.top});
                  }}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover({index: i, px: labelW + w, py: y0 + barH / 2})}
                  onBlur={() => setHover(null)}
                />
              </g>
            );
          })}
        </svg>
      ) : null}
      {hover && ready ? (
        <ChartTooltip
          x={hover.px}
          y={hover.py}
          width={width}
          height={height}
          title={items[hover.index].name}
          rows={[
            {name: unit, value: formatFull(items[hover.index].value), color: 'var(--viz-s1)', keyShape: 'rect'},
            {name: 'доля', value: formatPercent(total ? items[hover.index].value / total : 0)},
          ]}
        />
      ) : null}
    </div>
  );
}
