import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { axisTick, full, pct } from './format';

/* ---------- measuring ---------- */

export function useMeasure(): [
  React.RefObject<HTMLDivElement>,
  { width: number; height: number },
] {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

/* ---------- shared bits ---------- */

export interface LegendItem {
  name: string;
  color: string;
  kind?: 'rect' | 'line';
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="viz-legend">
      {items.map((it) => (
        <span className="viz-legend__item" key={it.name}>
          {it.kind === 'line' ? (
            <svg width={14} height={4} aria-hidden style={{ display: 'block' }}>
              <rect width={14} height={3} y={0.5} rx={1.5} fill={it.color} />
            </svg>
          ) : (
            <span className="viz-legend__swatch" style={{ background: it.color }} aria-hidden />
          )}
          {it.name}
        </span>
      ))}
    </div>
  );
}

export interface TipRow {
  color?: string;
  keyKind?: 'line' | 'rect';
  name: string;
  value: string;
}

export function ChartTip({
  x,
  y,
  plotWidth,
  title,
  rows,
  placement = 'above',
}: {
  x: number;
  y: number;
  plotWidth: number;
  title: string;
  rows: TipRow[];
  placement?: 'above' | 'below';
}) {
  const left = Math.min(Math.max(x, 90), Math.max(90, plotWidth - 90));
  const top = placement === 'above' ? Math.max(y, 56) : Math.min(y, 400);
  return (
    <div
      className={placement === 'above' ? 'viz-tooltip' : 'viz-tooltip viz-tooltip--below'}
      style={{ left, top }}
      role="status"
    >
      <div className="viz-tooltip__title">{title}</div>
      {rows.map((r) => (
        <div className="viz-tooltip__row" key={r.name}>
          {r.color ? (
            <span
              className={r.keyKind === 'rect' ? 'viz-tooltip__key viz-tooltip__key--rect' : 'viz-tooltip__key'}
              style={{ background: r.color }}
              aria-hidden
            />
          ) : null}
          <span className="viz-tooltip__name">{r.name}</span>
          <span className="viz-tooltip__value">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function niceStep(maxV: number, count = 4): number {
  const raw = maxV / count || 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * p;
}

/** Horizontal bar path: square at the baseline (left), 4px rounded data-end (right). */
function barPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, h / 2, Math.max(0, w));
  return `M ${x} ${y} H ${x + w - rr} Q ${x + w} ${y} ${x + w} ${y + rr} V ${y + h - rr} Q ${x + w} ${
    y + h
  } ${x + w - rr} ${y + h} H ${x} Z`;
}

/** Column path: square at the baseline (bottom), 4px rounded data-end (top). */
function colPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, Math.max(0, h));
  return `M ${x} ${y + h} V ${y + rr} Q ${x} ${y} ${x + rr} ${y} H ${x + w - rr} Q ${x + w} ${y} ${
    x + w
  } ${y + rr} V ${y + h} Z`;
}

export interface Series {
  name: string;
  color: string;
  values: number[];
}

/* ---------- Line chart (crosshair + one-tooltip-for-all-series) ---------- */

export function LineChart({
  labels,
  series,
  format,
}: {
  labels: string[];
  series: Series[];
  format: (n: number) => string;
}) {
  const [ref, { width, height }] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const n = labels.length;
  const ML = 44;
  const MR = 56;
  const MT = 10;
  const MB = 24;
  const iw = Math.max(0, width - ML - MR);
  const ih = Math.max(0, height - MT - MB);

  const { yMax, ticks } = useMemo(() => {
    const maxV = Math.max(1, ...series.flatMap((s) => s.values));
    const step = niceStep(maxV * 1.02);
    return { yMax: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => i * step) };
  }, [series]);

  const xTickIdx = useMemo(() => {
    const step = Math.max(1, Math.ceil(n / 6));
    const out: number[] = [];
    for (let i = 0; i < n; i += step) out.push(i);
    if (out.length && out[out.length - 1] !== n - 1) out.push(n - 1);
    return out;
  }, [n]);

  if (n === 0) return <div className="viz-chart" ref={ref} />;

  const x = (i: number) => ML + (n <= 1 ? iw / 2 : (i * iw) / (n - 1));
  const y = (v: number) => MT + ih * (1 - v / yMax);

  /* Selective direct labels: value at each line end — dropped when they collide. */
  const ends = series.map((s) => ({ name: s.name, y: y(s.values[n - 1]), v: s.values[n - 1] }));
  const sortedEnds = [...ends].sort((a, b) => a.y - b.y);
  const endsCollide = sortedEnds.some((e, i) => i > 0 && e.y - sortedEnds[i - 1].y < 14);

  const clampIdx = (i: number) => Math.min(n - 1, Math.max(0, i));
  const onMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHover(clampIdx(Math.round(((e.clientX - rect.left) / Math.max(1, rect.width)) * (n - 1))));
  };
  const onKey = (e: ReactKeyboardEvent<SVGRectElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setHover((h) => clampIdx((h ?? n - 1) - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setHover((h) => clampIdx((h ?? n - 1) + 1));
    }
  };

  return (
    <div className="viz-chart">
      {series.length > 1 ? (
        <Legend items={series.map((s) => ({ name: s.name, color: s.color, kind: 'line' as const }))} />
      ) : null}
      <div className="viz-chart__plot" ref={ref}>
        {width > 0 && height > 0 && (
          <>
            <svg
              width={width}
              height={height}
              role="img"
              aria-label={`Line chart: ${series.map((s) => s.name).join(', ')}`}
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line className="viz-gridline" x1={ML} x2={width - MR} y1={y(t)} y2={y(t)} />
                  <text className="viz-axis-tick" x={ML - 8} y={y(t)} textAnchor="end" dominantBaseline="central">
                    {axisTick(t, yMax)}
                  </text>
                </g>
              ))}
              <line className="viz-baseline" x1={ML} x2={width - MR} y1={MT + ih} y2={MT + ih} />
              {xTickIdx.map((i) => (
                <text key={i} className="viz-axis-tick" x={x(i)} y={height - 8} textAnchor="middle">
                  {labels[i]}
                </text>
              ))}
              {series.map((s) => (
                <path
                  key={s.name}
                  d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ')}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={x(n - 1)}
                  cy={y(s.values[n - 1])}
                  r={4}
                  fill={s.color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                />
              ))}
              {!endsCollide &&
                ends.map((e) => (
                  <text
                    key={e.name}
                    className="viz-end-label"
                    x={x(n - 1) + 10}
                    y={e.y}
                    dominantBaseline="central"
                  >
                    {format(e.v)}
                  </text>
                ))}
              {hover != null && (
                <g pointerEvents="none">
                  <line className="viz-crosshair" x1={x(hover)} x2={x(hover)} y1={MT} y2={MT + ih} />
                  {series.map((s) => (
                    <circle
                      key={s.name}
                      cx={x(hover)}
                      cy={y(s.values[hover])}
                      r={4}
                      fill={s.color}
                      stroke="var(--surface-1)"
                      strokeWidth={2}
                    />
                  ))}
                </g>
              )}
              <rect
                className="viz-overlay"
                x={ML}
                y={MT}
                width={iw}
                height={ih}
                fill="transparent"
                onPointerMove={onMove}
                onPointerLeave={() => setHover(null)}
                tabIndex={0}
                onFocus={() => setHover(n - 1)}
                onBlur={() => setHover(null)}
                onKeyDown={onKey}
                aria-label="Value explorer: use arrow keys to move along the chart"
              />
            </svg>
            {hover != null && (
              <ChartTip
                x={x(hover)}
                y={Math.min(...series.map((s) => y(s.values[hover])))}
                plotWidth={width}
                title={labels[hover]}
                rows={series.map((s) => ({ color: s.color, name: s.name, value: format(s.values[hover]) }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Ranked horizontal bars (one hue) ---------- */

export function HBars({
  data,
  format,
  valueName,
  labelWidth = 104,
}: {
  data: { name: string; value: number }[];
  format: (n: number) => string;
  valueName: string;
  labelWidth?: number;
}) {
  const [ref, { width, height }] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const n = data.length;
  const max = Math.max(1, ...data.map((d) => d.value));
  const valueW = 64;
  const rowH = n ? height / n : 0;
  const barH = Math.min(20, Math.max(8, rowH * 0.45));
  const bw = Math.max(0, width - labelWidth - valueW - 8);
  const w = (v: number) => Math.max(2, (v / max) * bw);

  return (
    <div className="viz-chart">
      <div className="viz-chart__plot" ref={ref}>
        {width > 0 && height > 0 && (
          <>
            <svg width={width} height={height} role="img" aria-label={`Bar chart: ${valueName}`}>
              <line className="viz-baseline" x1={labelWidth} x2={labelWidth} y1={4} y2={height - 4} />
              {data.map((d, i) => {
                const cy = i * rowH + rowH / 2;
                return (
                  <g
                    key={d.name}
                    className="viz-hit"
                    tabIndex={0}
                    role="img"
                    aria-label={`${d.name}: ${format(d.value)}`}
                    onPointerMove={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                  >
                    <rect x={0} y={i * rowH} width={width} height={rowH} fill="transparent" />
                    <text
                      className="viz-bar-label"
                      x={labelWidth - 10}
                      y={cy}
                      textAnchor="end"
                      dominantBaseline="central"
                    >
                      {d.name}
                    </text>
                    <path className="viz-bar" d={barPath(labelWidth, cy - barH / 2, w(d.value), barH, 4)} />
                    <text
                      className="viz-bar-value"
                      x={labelWidth + w(d.value) + 8}
                      y={cy}
                      dominantBaseline="central"
                    >
                      {format(d.value)}
                    </text>
                  </g>
                );
              })}
            </svg>
            {hover != null && (
              <ChartTip
                x={labelWidth + w(data[hover].value)}
                y={hover * rowH + rowH / 2}
                plotWidth={width}
                title={data[hover].name}
                rows={[{ color: 'var(--series-1)', keyKind: 'rect', name: valueName, value: format(data[hover].value) }]}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Stacked columns (categorical, 2px surface gaps) ---------- */

export function StackedColumns({
  labels,
  series,
  format,
}: {
  labels: string[];
  series: Series[];
  format: (n: number) => string;
}) {
  const [ref, { width, height }] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;
  const ML = 40;
  const MR = 8;
  const MT = 8;
  const MB = 24;
  const iw = Math.max(0, width - ML - MR);
  const ih = Math.max(0, height - MT - MB);

  const totals = useMemo(
    () => labels.map((_, i) => series.reduce((s, sr) => s + sr.values[i], 0)),
    [labels, series],
  );
  const { yMax, ticks } = useMemo(() => {
    const step = niceStep(Math.max(1, ...totals) * 1.02);
    return { yMax: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => i * step) };
  }, [totals]);

  if (n === 0) return <div className="viz-chart" ref={ref} />;

  const slot = iw / n;
  const barW = Math.min(24, slot * 0.55);
  const cx = (i: number) => ML + i * slot + slot / 2;
  const y = (v: number) => MT + ih * (1 - v / yMax);
  const every = slot < 60 ? 2 : 1;

  const onMove = (i: number) => () => setHover(i);

  return (
    <div className="viz-chart">
      <Legend items={series.map((s) => ({ name: s.name, color: s.color, kind: 'rect' as const }))} />
      <div className="viz-chart__plot" ref={ref}>
        {width > 0 && height > 0 && (
          <>
            <svg
              width={width}
              height={height}
              role="img"
              aria-label={`Stacked column chart: ${series.map((s) => s.name).join(', ')}`}
            >
              {ticks.map((t) => (
                <g key={t}>
                  <line className="viz-gridline" x1={ML} x2={width - MR} y1={y(t)} y2={y(t)} />
                  <text className="viz-axis-tick" x={ML - 8} y={y(t)} textAnchor="end" dominantBaseline="central">
                    {axisTick(t, yMax)}
                  </text>
                </g>
              ))}
              <line className="viz-baseline" x1={ML} x2={width - MR} y1={MT + ih} y2={MT + ih} />
              {labels.map((_, i) => {
                let cum = 0;
                const topIdx = series.reduce((last, s, si) => (s.values[i] > 0 ? si : last), 0);
                return (
                  <g key={i}>
                    {series.map((s, si) => {
                      const v = s.values[i];
                      const y1 = y(cum + v);
                      const y0 = y(cum);
                      cum += v;
                      if (v <= 0) return null;
                      const top = y1 + (si === topIdx ? 0 : 1);
                      const bottom = si === 0 ? y0 : y0 - 1;
                      const h = Math.max(0, bottom - top);
                      if (h <= 0) return null;
                      const x0 = cx(i) - barW / 2;
                      return si === topIdx ? (
                        <path key={s.name} d={colPath(x0, top, barW, h, 4)} fill={s.color} />
                      ) : (
                        <rect key={s.name} x={x0} y={top} width={barW} height={h} fill={s.color} />
                      );
                    })}
                  </g>
                );
              })}
              {labels.map((lb, i) =>
                i % every === 0 ? (
                  <text key={i} className="viz-axis-tick" x={cx(i)} y={height - 8} textAnchor="middle">
                    {lb}
                  </text>
                ) : null,
              )}
              {labels.map((_, i) => (
                <rect
                  key={i}
                  className="viz-overlay"
                  x={ML + i * slot}
                  y={MT}
                  width={slot}
                  height={ih}
                  fill="transparent"
                  tabIndex={0}
                  onPointerMove={onMove(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${labels[i]}: total ${format(totals[i])}`}
                />
              ))}
            </svg>
            {hover != null && (
              <ChartTip
                x={cx(hover)}
                y={y(totals[hover])}
                plotWidth={width}
                title={labels[hover]}
                rows={[
                  ...series.map((s) => ({
                    color: s.color,
                    keyKind: 'rect' as const,
                    name: s.name,
                    value: format(s.values[hover]),
                  })),
                  { name: 'Total', value: format(totals[hover]) },
                ]}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Tall segmented bar (one whole, <= 6 parts) ---------- */

export interface SegPart {
  name: string;
  value: number;
  color: string;
  darkLabel?: boolean;
}

export function SegmentedBar({
  data,
  format,
}: {
  data: SegPart[];
  format: (n: number) => string;
}) {
  const [ref, { width }] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);
  const total = Math.max(
    1,
    data.reduce((s, d) => s + d.value, 0),
  );
  const GAP = 2;
  const avail = Math.max(0, width - GAP * (data.length - 1));

  let offset = 0;
  const parts = data.map((p) => {
    const share = p.value / total;
    const wpx = share * avail;
    const part = { ...p, share, wpx, x: offset };
    offset += wpx + GAP;
    return part;
  });

  return (
    <div className="viz-chart">
      <div className="viz-chart__plot" ref={ref} style={{ flex: '0 0 auto' }}>
        {width > 0 && (
          <>
            <div
              className="segbar"
              role="img"
              aria-label={`Share of total: ${parts.map((p) => `${p.name} ${pct(p.share)}`).join(', ')}`}
            >
              {parts.map((p, i) => (
                <div
                  key={p.name}
                  className="segbar__part"
                  tabIndex={0}
                  style={{
                    width: p.wpx,
                    background: p.color,
                    color: p.darkLabel ? '#0b0b0b' : '#ffffff',
                  }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${p.name}: ${format(p.value)}, ${pct(p.share)} of total`}
                >
                  {p.wpx >= 44 ? pct(p.share) : null}
                </div>
              ))}
            </div>
            {hover != null && (
              <ChartTip
                x={parts[hover].x + parts[hover].wpx / 2}
                y={28}
                plotWidth={width}
                placement="below"
                title={parts[hover].name}
                rows={[
                  { color: parts[hover].color, keyKind: 'rect', name: 'Sessions', value: format(parts[hover].value) },
                  { name: 'Share', value: pct(parts[hover].share, 1) },
                ]}
              />
            )}
          </>
        )}
      </div>
      <Legend items={data.map((p) => ({ name: p.name, color: p.color }))} />
    </div>
  );
}

/* ---------- Meter (ratio against a limit) ---------- */

export function Meter({ label, value, caption }: { label: string; value: number; caption: string }) {
  const level = value >= 85 ? 'critical' : value >= 70 ? 'warning' : 'ok';
  const fill =
    level === 'ok' ? 'var(--series-1)' : level === 'warning' ? 'var(--warning)' : 'var(--critical)';
  return (
    <div className="meter">
      <div className="meter__head">
        <span className="meter__label">{label}</span>
        <span className="meter__value">{value}%</span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="meter__fill" style={{ width: `${value}%`, background: fill }} />
      </div>
      <span className="meter__caption">{caption}</span>
    </div>
  );
}

/* ---------- Sparkline (de-emphasis hue, current period in accent) ---------- */

export function Sparkline({ values }: { values: number[] }) {
  const [ref, { width, height }] = useMeasure();
  const n = values.length;
  if (n < 2) return <div ref={ref} style={{ height: '100%' }} />;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => pad + (i * Math.max(0, width - 2 * pad)) / (n - 1);
  const y = (v: number) => pad + Math.max(0, height - 2 * pad) * (1 - (v - min) / Math.max(1e-9, max - min));
  const split = n - 3;
  const pt = (i: number) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(values[i]).toFixed(1)}`;
  const basePath = values
    .slice(0, split + 1)
    .map((_, i) => pt(i))
    .join(' ');
  const accentPath = values
    .slice(split)
    .map((_, k) => {
      const i = split + k;
      return `${k === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(values[i]).toFixed(1)}`;
    })
    .join(' ');
  const areaPath = `${accentPath} L${x(n - 1).toFixed(1)},${height - pad} L${x(split).toFixed(1)},${height - pad} Z`;

  return (
    <div ref={ref} style={{ height: '100%' }}>
      {width > 0 && (
        <svg width={width} height={height} aria-hidden>
          <path d={areaPath} fill="var(--series-1)" opacity={0.1} />
          <path
            d={basePath}
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={accentPath}
            fill="none"
            stroke="var(--series-1)"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle
            cx={x(n - 1)}
            cy={y(values[n - 1])}
            r={2.5}
            fill="var(--series-1)"
            stroke="var(--surface-1)"
            strokeWidth={1.5}
          />
        </svg>
      )}
    </div>
  );
}

/* ---------- Table view twin ---------- */

export interface TableCol {
  title: string;
  numeric?: boolean;
}

export function DataTable({ columns, rows }: { columns: TableCol[]; rows: (string | number)[][] }) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.title} className={c.numeric ? 'num' : undefined} scope="col">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={columns[j]?.numeric ? 'num' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { full, pct };
