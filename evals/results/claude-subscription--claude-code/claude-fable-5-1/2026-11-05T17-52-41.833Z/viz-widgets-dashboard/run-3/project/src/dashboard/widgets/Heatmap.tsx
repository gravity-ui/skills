import {useState} from 'react';

import {formatFull} from '../format';
import {useElementSize} from '../hooks';
import {ChartTooltip} from './ChartTooltip';
import {DataTable} from './DataTable';
import type {WidgetView} from './WidgetFrame';

interface HeatmapProps {
  title: string;
  /** 7 rows (Monday first) × 24 hours */
  activity: number[][];
  view: WidgetView;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const STEPS = 7;
const LEFT = 30;
const TOP = 16;
const LEGEND = 22;
const GAP = 2;

/** Day × hour heatmap on a single-hue sequential ramp, with a scale legend and a table twin. */
export function Heatmap({title, activity, view}: HeatmapProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<{day: number; hour: number; px: number; py: number} | null>(null);
  const max = Math.max(1, ...activity.flat());

  if (view === 'table') {
    const rows = Array.from({length: 24}, (_, hour) => {
      const row: Record<string, string> = {hour: `${hour.toString().padStart(2, '0')}:00`};
      DAYS.forEach((d, day) => {
        row[d] = formatFull(activity[day][hour]);
      });
      return row;
    });
    const columns = [{id: 'hour', name: 'Час'}, ...DAYS.map((d) => ({id: d, name: d, align: 'end' as const, className: 'viz-num'}))];
    return <DataTable columns={columns} rows={rows} label={`${title}, таблица`} />;
  }

  const {width, height} = size;
  const plotW = Math.max(0, width - LEFT);
  const plotH = Math.max(0, height - TOP - LEGEND);
  const cellW = (plotW - GAP * 23) / 24;
  const cellH = (plotH - GAP * 6) / 7;
  const ready = cellW > 2 && cellH > 2;
  const step = (v: number) => Math.min(STEPS - 1, Math.floor((v / max) * STEPS));
  const color = (v: number) => `var(--viz-seq-${step(v) + 1})`;

  const move = (day: number, hour: number) =>
    setHover({day, hour, px: LEFT + hour * (cellW + GAP) + cellW / 2, py: TOP + day * (cellH + GAP) + cellH / 2});

  const onKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    const cur = hover ?? {day: 0, hour: 0};
    const next = {
      ArrowLeft: {day: cur.day, hour: cur.hour - 1},
      ArrowRight: {day: cur.day, hour: cur.hour + 1},
      ArrowUp: {day: cur.day - 1, hour: cur.hour},
      ArrowDown: {day: cur.day + 1, hour: cur.hour},
    }[event.key];
    if (!next) return;
    event.preventDefault();
    move(Math.max(0, Math.min(6, next.day)), Math.max(0, Math.min(23, next.hour)));
  };

  return (
    <div className="viz-chart" ref={ref}>
      {ready ? (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          className="viz-hit"
          aria-label={`${title}: тепловая карта по дням недели и часам, стрелки перемещают выбор`}
          onKeyDown={onKeyDown}
          onFocus={() => move(hover?.day ?? 0, hover?.hour ?? 12)}
          onBlur={() => setHover(null)}
          onPointerLeave={() => setHover(null)}
        >
          {Array.from({length: 24}, (_, hour) =>
            hour % 3 === 0 ? (
              <text key={hour} x={LEFT + hour * (cellW + GAP) + cellW / 2} y={TOP - 5} textAnchor="middle" className="viz-axis-text">
                {hour}
              </text>
            ) : null,
          )}
          {activity.map((row, day) => (
            <g key={day}>
              <text x={LEFT - 8} y={TOP + day * (cellH + GAP) + cellH / 2} dy="0.35em" textAnchor="end" className="viz-axis-text">
                {DAYS[day]}
              </text>
              {row.map((v, hour) => {
                const isHover = hover?.day === day && hover?.hour === hour;
                return (
                  <rect
                    key={hour}
                    x={LEFT + hour * (cellW + GAP)}
                    y={TOP + day * (cellH + GAP)}
                    width={cellW}
                    height={cellH}
                    rx={2}
                    fill={color(v)}
                    stroke={isHover ? 'var(--viz-ink-1)' : 'none'}
                    strokeWidth={1.5}
                    onPointerMove={() => move(day, hour)}
                  >
                    <title>{`${DAYS[day]} ${hour}:00 — ${formatFull(v)}`}</title>
                  </rect>
                );
              })}
            </g>
          ))}
          <g transform={`translate(${LEFT}, ${TOP + plotH + 8})`} aria-hidden="true">
            <text x={0} y={7} dy="0.35em" className="viz-axis-text">
              меньше
            </text>
            {Array.from({length: STEPS}, (_, i) => (
              <rect key={i} x={48 + i * 14} y={1} width={12} height={12} rx={2} fill={`var(--viz-seq-${i + 1})`} />
            ))}
            <text x={48 + STEPS * 14 + 4} y={7} dy="0.35em" className="viz-axis-text">
              больше
            </text>
          </g>
        </svg>
      ) : null}
      {hover && ready ? (
        <ChartTooltip
          x={hover.px}
          y={hover.py}
          width={width}
          height={height}
          title={`${DAYS[hover.day]}, ${hover.hour.toString().padStart(2, '0')}:00–${((hover.hour + 1) % 24).toString().padStart(2, '0')}:00`}
          rows={[{name: 'сессий', value: formatFull(activity[hover.day][hover.hour]), color: color(activity[hover.day][hover.hour]), keyShape: 'rect'}]}
        />
      ) : null}
    </div>
  );
}
