import {useMemo, useRef, useState} from 'react';

import type {Series} from '../data';
import {formatCompact, formatDayMonth, formatFull, formatFullDate, formatShortDate, niceTicks} from '../format';
import {useElementSize} from '../hooks';
import {ChartTooltip} from './ChartTooltip';
import {DataTable} from './DataTable';
import type {WidgetView} from './WidgetFrame';

interface LineChartProps {
  title: string;
  dates: Date[];
  series: Series[];
  view: WidgetView;
}

const MARGIN = {top: 12, right: 68, bottom: 24, left: 48};
const LABEL_GAP = 14;

/** Multi-series line chart: 2px lines, end markers with a surface ring, selective end labels, crosshair tooltip, legend toggle. */
export function LineChart({title, dates, series, view}: LineChartProps) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [ref, size] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverState, setHover] = useState<{index: number; py: number} | null>(null);

  // Color follows the entity: slot by position in the full series list, never by visibility.
  const colored = useMemo(() => series.map((s, i) => ({...s, color: `var(--viz-s${i + 1})`})), [series]);
  const visible = colored.filter((s) => !hidden.has(s.name));
  const n = dates.length;
  const hover = hoverState && hoverState.index < n ? hoverState : null;

  if (view === 'table') {
    const rows = dates.map((d, i) => {
      const row: Record<string, string> = {date: formatShortDate(d)};
      for (const s of series) row[s.name] = formatFull(s.values[i]);
      return row;
    });
    const columns = [
      {id: 'date', name: 'Дата'},
      ...series.map((s) => ({id: s.name, name: s.name, align: 'end' as const, className: 'viz-num'})),
    ];
    return <DataTable columns={columns} rows={rows} label={`${title}, таблица`} />;
  }

  const legendHeight = 24;
  const width = size.width;
  const height = Math.max(0, size.height - legendHeight);
  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const maxValue = Math.max(1, ...visible.flatMap((s) => s.values));
  const ticks = niceTicks(maxValue, 4);
  const yMax = ticks[ticks.length - 1];
  const stepX = n > 1 ? plotW / (n - 1) : 0;
  const x = (i: number) => MARGIN.left + i * stepX;
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  const xTickCount = Math.min(n, Math.max(2, Math.floor(plotW / 90)));
  const xTicks = Array.from({length: xTickCount}, (_, k) => Math.round((k * (n - 1)) / Math.max(1, xTickCount - 1)));

  // End labels: keep only those that do not collide vertically; the legend carries the rest.
  const endLabels = [...visible]
    .map((s) => ({name: s.name, y: y(s.values[n - 1])}))
    .sort((a, b) => a.y - b.y)
    .reduce<Array<{name: string; y: number}>>((acc, item) => {
      const prev = acc[acc.length - 1];
      if (!prev || item.y - prev.y >= LABEL_GAP) acc.push(item);
      return acc;
    }, []);

  const toIndex = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || n < 2) return 0;
    return Math.max(0, Math.min(n - 1, Math.round((clientX - rect.left - MARGIN.left) / stepX)));
  };

  const onPointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({index: toIndex(event.clientX), py: event.clientY - rect.top});
  };

  const onKeyDown = (event: React.KeyboardEvent<SVGRectElement>) => {
    const cur = hover?.index ?? n - 1;
    const next =
      event.key === 'ArrowLeft' ? cur - 1 : event.key === 'ArrowRight' ? cur + 1 : event.key === 'Home' ? 0 : event.key === 'End' ? n - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setHover({index: Math.max(0, Math.min(n - 1, next)), py: MARGIN.top + plotH / 2});
  };

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const ready = width > 0 && plotW > 0 && plotH > 0 && n > 1;

  return (
    <div className="viz-chart" ref={ref}>
      <div className="viz-legend" role="list" aria-label="Серии">
        {colored.map((s) => (
          <button
            key={s.name}
            type="button"
            role="listitem"
            className={`viz-legend__item${hidden.has(s.name) ? ' viz-legend__item_hidden' : ''}`}
            aria-pressed={!hidden.has(s.name)}
            onClick={() => toggle(s.name)}
          >
            <span className="viz-legend__key_line" style={{background: s.color}} />
            {s.name}
          </button>
        ))}
      </div>
      {ready ? (
        <svg ref={svgRef} width={width} height={height} role="img" aria-label={`${title}: линейный график, ${n} дней, ${series.length} серии`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(t)} y2={y(t)} stroke={t === 0 ? 'var(--viz-axis)' : 'var(--viz-grid)'} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.35em" textAnchor="end" className="viz-axis-text">
                {formatCompact(t)}
              </text>
            </g>
          ))}
          {xTicks.map((i) => (
            <text key={i} x={x(i)} y={MARGIN.top + plotH + 16} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="viz-axis-text">
              {formatDayMonth(dates[i])}
            </text>
          ))}
          {visible.map((s) => (
            <path
              key={s.name}
              d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {visible.map((s) => (
            <circle key={s.name} cx={x(n - 1)} cy={y(s.values[n - 1])} r={4} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
          ))}
          {endLabels.map((l) => (
            <text key={l.name} x={x(n - 1) + 10} y={l.y} dy="0.35em" className="viz-label">
              {l.name}
            </text>
          ))}
          {hover ? (
            <g pointerEvents="none">
              <line x1={x(hover.index)} x2={x(hover.index)} y1={MARGIN.top} y2={MARGIN.top + plotH} stroke="var(--viz-axis)" />
              {visible.map((s) => (
                <circle key={s.name} cx={x(hover.index)} cy={y(s.values[hover.index])} r={4} fill={s.color} stroke="var(--viz-surface)" strokeWidth={2} />
              ))}
            </g>
          ) : null}
          <rect
            className="viz-hit"
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            tabIndex={0}
            aria-label="Область графика: стрелки влево и вправо показывают значения по дням"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onKeyDown}
            onFocus={() => setHover({index: n - 1, py: MARGIN.top + plotH / 2})}
            onBlur={() => setHover(null)}
          />
        </svg>
      ) : null}
      {hover && ready ? (
        <ChartTooltip
          x={x(hover.index)}
          y={hover.py + legendHeight}
          width={width}
          height={size.height}
          title={formatFullDate(dates[hover.index])}
          rows={visible.map((s) => ({name: s.name, value: formatFull(s.values[hover.index]), color: s.color, keyShape: 'line'}))}
        />
      ) : null}
    </div>
  );
}
