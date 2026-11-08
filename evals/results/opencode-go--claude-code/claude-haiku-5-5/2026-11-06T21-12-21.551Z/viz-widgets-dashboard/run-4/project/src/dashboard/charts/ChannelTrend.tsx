import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CHANNELS, type Day } from '../data';
import { fmt, niceScale } from '../format';
import { useElementSize } from '../useElementSize';
import { ViewSwitch, type ViewMode } from './ViewSwitch';

/** Plot margins in px. The right margin holds the endpoint labels, which must fit inside the card. */
const M = { top: 12, right: 68, bottom: 24, left: 52 };
/** Minimum vertical distance between endpoint labels, so they never stack. */
const LABEL_GAP = 14;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Revenue per channel over time. Each channel keeps its slot color; legend toggles isolate a channel. */
export function ChannelTrend({ days }: { days: Day[] }) {
  const [view, setView] = useState<ViewMode>('chart');
  const [hidden, setHidden] = useState<ReadonlySet<number>>(() => new Set());
  const visible = CHANNELS.map((_, i) => i).filter((i) => !hidden.has(i));

  const toggle = (i: number) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (CHANNELS.length - prev.size > 1) next.add(i); // never hide the last visible channel
      return next;
    });

  return (
    <div className="chart">
      <div className="chart__toolbar">
        <div className="legend" role="group" aria-label="Каналы">
          {CHANNELS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="legend-item"
              aria-pressed={!hidden.has(i)}
              onClick={() => toggle(i)}
            >
              <span className="legend-key" style={{ background: `var(--series-${i + 1})` }} aria-hidden="true" />
              {c.name}
            </button>
          ))}
        </div>
        <span className="chart__unit">₽ в день</span>
        <ViewSwitch view={view} onChange={setView} />
      </div>
      {view === 'chart' ? <LinePlot days={days} visible={visible} /> : <DayTable days={days} />}
    </div>
  );
}

function LinePlot({ days, visible }: { days: Day[]; visible: number[] }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  /** Index of the day under the pointer or keyboard focus. */
  const [hover, setHover] = useState<number | null>(null);

  const n = days.length;
  const last = n - 1;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = Math.max(0, height - M.top - M.bottom);
  const maxValue = Math.max(0, ...days.flatMap((d) => visible.map((c) => d.channels[c])));
  const { step, top } = niceScale(maxValue);

  const xAt = (k: number) => M.left + (n > 1 ? (k / last) * plotW : plotW / 2);
  const yAt = (v: number) => M.top + plotH - (v / top) * plotH;
  const ticks = [0, 1, 2, 3, 4].map((i) => i * step);
  const xTicks = n > 1 ? [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * last)) : [0];

  const indexAt = (e: PointerEvent<HTMLDivElement>) => {
    if (plotW <= 0 || n < 2) return 0;
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left - M.left;
    return clamp(Math.round((px / plotW) * last), 0, last);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = hover ?? last;
    let next: number | null = null;
    if (e.key === 'ArrowLeft') next = cur - 1;
    else if (e.key === 'ArrowRight') next = cur + 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    if (next === null) return;
    e.preventDefault();
    setHover(clamp(next, 0, last));
  };

  // Endpoint labels: drop any that would sit closer than LABEL_GAP to the one above.
  let lastLabelY = -Infinity;
  const endLabels = visible
    .map((c) => ({ c, y: yAt(days[last].channels[c]) }))
    .sort((a, b) => a.y - b.y)
    .filter((l) => {
      if (l.y - lastLabelY < LABEL_GAP) return false;
      lastLabelY = l.y;
      return true;
    });

  const hoverDay = hover === null ? null : days[hover];
  const hx = hover === null ? 0 : xAt(hover);
  const flip = hx > width * 0.6;
  const hoverTotal = hoverDay ? visible.reduce((s, c) => s + hoverDay.channels[c], 0) : 0;

  return (
    <div
      ref={ref}
      className="plot"
      tabIndex={0}
      role="group"
      aria-label="График выручки по каналам по дням. Стрелки влево и вправо показывают значения дня."
      onPointerMove={(e) => setHover(indexAt(e))}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
      onFocus={() => setHover(last)}
      onBlur={() => setHover(null)}
    >
      {width > 0 && height > 0 && (
        <svg width={width} height={height} aria-hidden="true">
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={M.left + plotW}
                y1={yAt(t)}
                y2={yAt(t)}
                strokeWidth={1}
                style={{ stroke: t === 0 ? 'var(--baseline)' : 'var(--grid)' }}
              />
              <text x={M.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle" className="axis-text">
                {fmt.axis(t, top)}
              </text>
            </g>
          ))}

          {xTicks.map((k) => (
            <text
              key={k}
              x={xAt(k)}
              y={M.top + plotH + 16}
              textAnchor={k === 0 ? 'start' : k === last ? 'end' : 'middle'}
              className="axis-text"
            >
              {fmt.shortDate(days[k].date)}
            </text>
          ))}

          {visible.map((c) => (
            <path
              key={c}
              d={days.map((d, k) => `${k ? 'L' : 'M'}${xAt(k).toFixed(1)} ${yAt(d.channels[c]).toFixed(1)}`).join(' ')}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ stroke: `var(--series-${c + 1})` }}
            />
          ))}

          {hover !== null && (
            <line
              x1={hx}
              x2={hx}
              y1={M.top}
              y2={M.top + plotH}
              strokeWidth={1}
              style={{ stroke: 'var(--baseline)' }}
            />
          )}

          {visible.map((c) => (
            <circle
              key={`end-${c}`}
              cx={xAt(last)}
              cy={yAt(days[last].channels[c])}
              r={4}
              strokeWidth={2}
              style={{ fill: `var(--series-${c + 1})`, stroke: 'var(--surface-1)' }}
            />
          ))}

          {hoverDay &&
            visible.map((c) => (
              <circle
                key={`hover-${c}`}
                cx={hx}
                cy={yAt(hoverDay.channels[c])}
                r={4}
                strokeWidth={2}
                style={{ fill: `var(--series-${c + 1})`, stroke: 'var(--surface-1)' }}
              />
            ))}

          {endLabels.map(({ c, y }) => (
            <text key={`label-${c}`} x={xAt(last) + 8} y={y} dominantBaseline="middle" className="value-label">
              {fmt.countShort(days[last].channels[c])}
            </text>
          ))}
        </svg>
      )}

      {hoverDay && (
        <div
          className="viz-tooltip"
          style={{ left: hx + (flip ? -12 : 12), top: M.top, transform: flip ? 'translateX(-100%)' : undefined }}
        >
          <div className="viz-tooltip__title">{fmt.longDate(hoverDay.date)}</div>
          {[...visible]
            .sort((a, b) => hoverDay.channels[b] - hoverDay.channels[a])
            .map((c) => (
              <div key={c} className="viz-tooltip__row">
                <span className="viz-tooltip__key" style={{ background: `var(--series-${c + 1})` }} />
                <span className="viz-tooltip__name">{CHANNELS[c].name}</span>
                <strong className="viz-tooltip__value">{fmt.moneyFull(hoverDay.channels[c])}</strong>
              </div>
            ))}
          {visible.length > 1 && (
            <div className="viz-tooltip__row viz-tooltip__total">
              <span className="viz-tooltip__key" />
              <span className="viz-tooltip__name">Итого</span>
              <strong className="viz-tooltip__value">{fmt.moneyFull(hoverTotal)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayTable({ days }: { days: Day[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table" aria-label="Выручка по каналам по дням">
        <thead>
          <tr>
            <th scope="col">Дата</th>
            {CHANNELS.map((c) => (
              <th key={c.id} scope="col" className="num">
                {c.name}
              </th>
            ))}
            <th scope="col" className="num">
              Итого
            </th>
          </tr>
        </thead>
        <tbody>
          {[...days].reverse().map((d) => (
            <tr key={d.date.getTime()}>
              <td>{fmt.shortDate(d.date)}</td>
              {d.channels.map((v, i) => (
                <td key={CHANNELS[i].id} className="num">
                  {fmt.moneyFull(v)}
                </td>
              ))}
              <td className="num">{fmt.moneyFull(d.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
