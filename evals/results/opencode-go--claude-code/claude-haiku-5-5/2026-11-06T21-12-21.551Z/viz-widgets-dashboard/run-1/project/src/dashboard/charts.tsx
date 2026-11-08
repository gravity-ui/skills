import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useElementSize } from './useElementSize';
import { axisFormatter, fmt, niceTicks } from './format';

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

export interface Anchor {
  x: number; // viewport px
  y: number; // viewport px
}

/** Floating tooltip in viewport coordinates, so it is never clipped by a card. */
export function Tooltip({ at, children }: { at: Anchor; children: ReactNode }) {
  const flip = at.x > window.innerWidth - 240;
  return (
    <div
      className="tooltip"
      role="tooltip"
      style={{
        left: at.x,
        top: at.y,
        transform: `translate(${flip ? 'calc(-100% - 14px)' : '14px'}, 14px)`,
      }}
    >
      {children}
    </div>
  );
}

export interface Share {
  name: string;
  value: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Plain HTML table: the accessible twin of every chart. */
export function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: { title: string; numeric?: boolean }[];
  rows: string[][];
}) {
  return (
    <table className="data-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.title} scope="col" className={c.numeric ? 'num' : undefined}>
              {c.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => (
              <td key={c} className={columns[c].numeric ? 'num' : undefined}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------------------------------------------------------------------------
// Line chart: two series, crosshair + one tooltip listing every series.
// The emphasised series is the accent hue; context series is de-emphasis gray.
// ---------------------------------------------------------------------------

export interface LineSeries {
  name: string;
  values: number[];
  color: string;
  emphasis: boolean;
}

const LINE_MARGIN = { top: 12, right: 12, bottom: 24, left: 52 };
const LEGEND_HEIGHT = 24;

export function LineChart({ dates, series, label }: { dates: Date[]; series: LineSeries[]; label: string }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<{ i: number; anchor: Anchor } | null>(null);

  const n = dates.length;
  const chartH = Math.max(0, height - LEGEND_HEIGHT);
  const plotW = Math.max(0, width - LINE_MARGIN.left - LINE_MARGIN.right);
  const plotH = Math.max(0, chartH - LINE_MARGIN.top - LINE_MARGIN.bottom);
  const { ticks, max } = niceTicks(Math.max(...series.flatMap((s) => s.values)));
  const fmtAxis = axisFormatter(max);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 80))));
  const ready = width > 0 && plotH > 0 && n > 1;

  const xAt = (i: number) => LINE_MARGIN.left + (i / (n - 1)) * plotW;
  const yAt = (v: number) => LINE_MARGIN.top + plotH - (v / max) * plotH;

  const select = (i: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setActive({
      i,
      anchor: { x: rect.left + xAt(i), y: rect.top + LINE_MARGIN.top },
    });
  };

  const onPointerMove = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || plotW <= 0) return;
    const t = (clientX - rect.left - LINE_MARGIN.left) / plotW;
    select(clamp(Math.round(t * (n - 1)), 0, n - 1));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const current = active?.i ?? n - 1;
    if (e.key === 'ArrowRight') select(clamp(current + 1, 0, n - 1));
    else if (e.key === 'ArrowLeft') select(clamp(current - 1, 0, n - 1));
    else if (e.key === 'Home') select(0);
    else if (e.key === 'End') select(n - 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };

  const ordered = [...series].sort((a, b) => Number(a.emphasis) - Number(b.emphasis));

  return (
    <div ref={ref} className="chart">
      {width > 0 && (
        <>
          <div className="legend" aria-hidden="true">
            {series.map((s) => (
              <span key={s.name} className="legend-item">
                <i className="key-line" style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
          {ready && (
            <svg
              ref={svgRef}
              width={width}
              height={chartH}
              role="img"
              aria-label={label}
              tabIndex={0}
              className="line-svg"
              onPointerMove={(e) => onPointerMove(e.clientX)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => select(n - 1)}
              onBlur={() => setActive(null)}
              onKeyDown={onKeyDown}
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={LINE_MARGIN.left}
                    x2={LINE_MARGIN.left + plotW}
                    y1={yAt(t)}
                    y2={yAt(t)}
                    className={t === 0 ? 'baseline' : 'gridline'}
                  />
                  <text x={LINE_MARGIN.left - 8} y={yAt(t)} dy="0.32em" textAnchor="end" className="axis-text">
                    {fmtAxis(t)}
                  </text>
                </g>
              ))}

              {dates.map((d, i) =>
                i % labelEvery === 0 ? (
                  <text key={i} x={xAt(i)} y={chartH - 6} textAnchor="middle" className="axis-text">
                    {fmt.dayMonth(d)}
                  </text>
                ) : null,
              )}

              {ordered.map((s) => (
                <path
                  key={s.name}
                  d={s.values
                    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`)
                    .join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}

              {active && (
                <>
                  <line
                    x1={xAt(active.i)}
                    x2={xAt(active.i)}
                    y1={LINE_MARGIN.top}
                    y2={LINE_MARGIN.top + plotH}
                    className="crosshair"
                  />
                  {series.map((s) => (
                    <circle
                      key={s.name}
                      cx={xAt(active.i)}
                      cy={yAt(s.values[active.i])}
                      r={4}
                      fill={s.color}
                      className="marker"
                    />
                  ))}
                </>
              )}
            </svg>
          )}
          {active && (
            <Tooltip at={active.anchor}>
              <div className="tt-title">{fmt.dayMonthYear(dates[active.i])}</div>
              {series.map((s) => (
                <div key={s.name} className="tt-row">
                  <i className="key-line" style={{ background: s.color }} />
                  <span className="tt-name">{s.name}</span>
                  <strong className="tt-value">{fmt.count(s.values[active.i])}</strong>
                </div>
              ))}
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ranked horizontal bars: one hue, largest first, value at the bar tip.
// Bars are 20px thick with a 4px rounded data end and a square baseline.
// ---------------------------------------------------------------------------

const VALUE_COLUMN = 84; // px reserved for the value printed past the bar tip

export function BarRanking({ items, label }: { items: Share[]; label: string }) {
  const [hover, setHover] = useState<{ i: number; at: Anchor } | null>(null);
  const max = Math.max(1, ...items.map((item) => item.value));
  const total = items.reduce((sum, item) => sum + item.value, 0);

  const showTooltip = (i: number, at: Anchor) => setHover({ i, at });

  return (
    <div className="bars" role="list" aria-label={label}>
      {items.map((item, i) => (
        <div
          key={item.name}
          role="listitem"
          tabIndex={0}
          className="bar-row"
          data-active={hover?.i === i ? 'true' : undefined}
          onPointerMove={(e) => showTooltip(i, { x: e.clientX, y: e.clientY })}
          onPointerLeave={() => setHover(null)}
          onFocus={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            showTooltip(i, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
          }}
          onBlur={() => setHover(null)}
        >
          <span className="bar-name">{item.name}</span>
          <span className="bar-track">
            <span
              className="bar"
              style={{ width: `calc((100% - ${VALUE_COLUMN}px) * ${item.value / max})` }}
            />
            <span className="bar-value">{fmt.count(item.value)}</span>
          </span>
        </div>
      ))}
      {hover && (
        <Tooltip at={hover.at}>
          <div className="tt-title">{items[hover.i].name}</div>
          <div className="tt-row">
            <strong className="tt-value">{fmt.count(items[hover.i].value)}</strong>
            <span className="tt-name">
              визитов · {fmt.percent(items[hover.i].value / total)} от всех
            </span>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tall segmented bar: one whole split into <= 6 parts. Shares print inside a
// block only when they fit; the legend carries names only.
// ---------------------------------------------------------------------------

export interface Part extends Share {
  color: string;
  ink: string; // label color chosen for contrast on that fill
}

const SEGMENT_GAP = 2;
const LABEL_CHAR_PX = 7.5;
const LABEL_PADDING_PX = 16;

export function SegmentedBar({ parts, label }: { parts: Part[]; label: string }) {
  const [ref, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<{ i: number; at: Anchor } | null>(null);
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  const usable = Math.max(0, width - SEGMENT_GAP * (parts.length - 1));

  return (
    <div ref={ref} className="segmented-wrap">
      {width > 0 && (
        <>
          <div className="segmented" role="list" aria-label={label}>
            {parts.map((p, i) => {
              const share = p.value / total;
              const shareText = `${Math.round(share * 100)}%`;
              const fits = usable * share >= shareText.length * LABEL_CHAR_PX + LABEL_PADDING_PX;
              return (
                <div
                  key={p.name}
                  role="listitem"
                  tabIndex={0}
                  className="segment"
                  aria-label={`${p.name}: ${fmt.count(p.value)}, ${shareText}`}
                  style={{ flexGrow: p.value, background: p.color, color: p.ink }}
                  onPointerMove={(e) => setHover({ i, at: { x: e.clientX, y: e.clientY } })}
                  onPointerLeave={() => setHover(null)}
                  onFocus={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setHover({ i, at: { x: r.left + r.width / 2, y: r.top } });
                  }}
                  onBlur={() => setHover(null)}
                >
                  {fits && <span className="segment-label">{shareText}</span>}
                </div>
              );
            })}
          </div>
          <ul className="segment-legend" aria-hidden="true">
            {parts.map((p) => (
              <li key={p.name}>
                <i className="key-swatch" style={{ background: p.color }} />
                {p.name}
              </li>
            ))}
          </ul>
          {hover && (
            <Tooltip at={hover.at}>
              <div className="tt-title">{parts[hover.i].name}</div>
              <div className="tt-row">
                <strong className="tt-value">{fmt.count(parts[hover.i].value)}</strong>
                <span className="tt-name">
                  визитов · {Math.round((parts[hover.i].value / total) * 100)}%
                </span>
              </div>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sparkline: de-emphasis gray trend, current (last) point in the accent.
// ---------------------------------------------------------------------------

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const pad = 6;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (values.length <= 1 ? 0 : (i / (values.length - 1)) * (width - pad * 2));
  const y = (v: number) => pad + (height - pad * 2) * (1 - (v - min) / span);
  const last = values.length - 1;

  return (
    <div ref={ref} className="sparkline">
      {width > 0 && height > 0 && (
        <svg width={width} height={height} role="img" aria-label={label}>
          <path
            d={values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')}
            fill="none"
            stroke="var(--context)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={x(last)} cy={y(values[last])} r={4} fill="var(--s1)" stroke="var(--surface)" strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}
