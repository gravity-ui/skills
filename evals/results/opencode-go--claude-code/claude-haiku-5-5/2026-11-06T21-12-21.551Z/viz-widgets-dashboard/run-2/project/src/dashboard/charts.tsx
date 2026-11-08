import { useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { viz } from './theme';
import { useElementSize } from './useElementSize';

// ---------- formatting ----------

const countFmt = new Intl.NumberFormat('ru-RU');
const compactFmt = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const rubFmt = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const rubCompactFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percentFmt = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 0 });

export const fmt = {
  count: (n: number) => countFmt.format(n),
  compact: (n: number) => compactFmt.format(n),
  rub: (n: number) => rubFmt.format(n),
  rubCompact: (n: number) => rubCompactFmt.format(n),
  percent: (share: number) => percentFmt.format(share),
  /** One decimal, comma separator, e.g. 3,8% (no locale-dependent space). */
  percent1: (share: number) => `${(share * 100).toFixed(1).replace('.', ',')}%`,
};

/** Rounds a max value up to a 1/2/2.5/5/10 step so the axis ends on a clean number. */
function niceMax(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

// ---------- shared pieces ----------

function Tooltip({
  left,
  top,
  flip = false,
  anchor = 'center',
  children,
}: {
  left: number;
  top: number;
  flip?: boolean;
  /** 'center' centers on `top` (bars, segments); 'top' hangs below it (line chart, keeps clear of the legend). */
  anchor?: 'center' | 'top';
  children: ReactNode;
}) {
  const dy = anchor === 'center' ? '-50%' : '0';
  const dx = flip ? 'calc(-100% - 10px)' : '10px';
  return (
    <div className="viz-tooltip" style={{ left, top, transform: `translate(${dx}, ${dy})` }} role="status">
      {children}
    </div>
  );
}

function Legend({ items }: { items: Array<{ name: string; color: string; kind: 'line' | 'rect' }> }) {
  return (
    <ul className="viz-legend">
      {items.map((item) => (
        <li key={item.name}>
          <span className={item.kind === 'line' ? 'viz-key viz-key--line' : 'viz-key viz-key--rect'} style={{ background: item.color }} />
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// ---------- line chart ----------

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

export function LineChart({
  labels,
  series,
  formatValue,
}: {
  labels: string[];
  series: LineSeries[];
  formatValue: (n: number) => string;
}) {
  const [plotRef, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const m = { top: 12, right: 12, bottom: 24, left: 56 };
  const plotW = Math.max(0, width - m.left - m.right);
  const plotH = Math.max(0, height - m.top - m.bottom);
  const n = labels.length;
  const yMax = niceMax(Math.max(...series.flatMap((s) => s.values)));

  const xAt = (i: number) => m.left + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
  const yAt = (v: number) => m.top + plotH - (v / yMax) * plotH;
  const pathFor = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

  const yTicks = [0, 1, 2, 3, 4].map((k) => (k * yMax) / 4);
  const xTickIdx = labels.map((_, i) => i).filter((i) => (i % 7 === 0 && i < n - 4) || i === n - 1);

  const clampIndex = (i: number) => Math.min(n - 1, Math.max(0, i));

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - m.left;
    setHover(clampIndex(Math.round((x / (plotW || 1)) * (n - 1))));
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const current = hover ?? n - 1;
    if (e.key === 'ArrowLeft') setHover(clampIndex(current - 1));
    else if (e.key === 'ArrowRight') setHover(clampIndex(current + 1));
    else if (e.key === 'Escape') setHover(null);
    else return;
    e.preventDefault();
  };

  const onFocus = () => setHover((h) => h ?? n - 1);
  const onBlur = (_e: FocusEvent<SVGSVGElement>) => setHover(null);

  const hoverX = hover === null ? 0 : xAt(hover);

  return (
    <div className="viz-chart">
      <Legend items={series.map((s) => ({ name: s.name, color: s.color, kind: 'line' }))} />
      <div className="viz-plot" ref={plotRef}>
        {width > 0 && height > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`Линейный график: ${series.map((s) => s.name).join(', ')}. Значения — в таблице`}
            tabIndex={0}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={m.left} x2={m.left + plotW} y1={yAt(t)} y2={yAt(t)} stroke={viz.grid} strokeWidth={1} />
                <text x={m.left - 8} y={yAt(t)} textAnchor="end" dominantBaseline="middle" fill={viz.ink.muted} fontSize={12}>
                  {fmt.compact(t)}
                </text>
              </g>
            ))}
            {xTickIdx.map((i) => (
              <text
                key={i}
                x={xAt(i)}
                y={m.top + plotH + 16}
                textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
                fill={viz.ink.muted}
                fontSize={12}
              >
                {labels[i]}
              </text>
            ))}
            <line x1={m.left} x2={m.left + plotW} y1={m.top + plotH} y2={m.top + plotH} stroke={viz.baseline} strokeWidth={1} />

            {series.map((s) => (
              <path key={s.name} d={pathFor(s.values)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}

            {hover !== null && (
              <g>
                <line x1={hoverX} x2={hoverX} y1={m.top} y2={m.top + plotH} stroke={viz.baseline} strokeWidth={1} />
                {series.map((s) => (
                  <circle key={s.name} cx={hoverX} cy={yAt(s.values[hover])} r={4} fill={s.color} stroke={viz.surface} strokeWidth={2} />
                ))}
              </g>
            )}
          </svg>
        )}
        {hover !== null && width > 0 && (
          <Tooltip left={hoverX} top={m.top + 8} flip={hoverX > width / 2} anchor="top">
            <div className="viz-tooltip__caption">{labels[hover]}</div>
            {series.map((s) => (
              <div key={s.name} className="viz-tooltip__row">
                <span className="viz-key viz-key--line" style={{ background: s.color }} />
                <span className="viz-tooltip__value">{formatValue(s.values[hover])}</span>
                <span className="viz-tooltip__name">{s.name}</span>
              </div>
            ))}
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ---------- ranked horizontal bars ----------

export interface BarDatum {
  label: string;
  value: number;
}

/** Bar path with a 4px rounded data end (right) and a square baseline end (left). */
function barPath(x: number, y: number, w: number, h: number, r: number): string {
  return [
    `M${x},${y}`,
    `H${x + w - r}`,
    `A${r},${r} 0 0 1 ${x + w},${y + r}`,
    `V${y + h - r}`,
    `A${r},${r} 0 0 1 ${x + w - r},${y + h}`,
    `H${x}`,
    'Z',
  ].join(' ');
}

export function BarChart({ data, color, formatValue }: { data: BarDatum[]; color: string; formatValue: (n: number) => string }) {
  const [plotRef, { width, height }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const longest = Math.max(0, ...data.map((d) => d.label.length));
  const labelW = Math.min(160, longest * 7.5);
  const m = { top: 4, right: 96, bottom: 4, left: labelW + 12 };
  const plotW = Math.max(0, width - m.left - m.right);
  const plotH = Math.max(0, height - m.top - m.bottom);
  const vMax = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const band = data.length ? plotH / data.length : 0;
  const barH = Math.min(24, band * 0.6);
  const hovered = hover === null ? null : data[hover];

  return (
    <div className="viz-chart">
      <div className="viz-plot" ref={plotRef}>
        {width > 0 && height > 0 && (
          <svg width={width} height={height} role="img" aria-label="Столбчатая диаграмма. Значения — в таблице">
            <line x1={m.left} x2={m.left} y1={m.top} y2={m.top + plotH} stroke={viz.baseline} strokeWidth={1} />
            {data.map((d, i) => {
              const cy = m.top + band * (i + 0.5);
              const w = (d.value / vMax) * plotW;
              const y = cy - barH / 2;
              const dimmed = hover !== null && hover !== i;
              return (
                <g
                  key={d.label}
                  tabIndex={0}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                >
                  {/* hit target spans the whole band, not just the painted bar */}
                  <rect x={0} y={m.top + band * i} width={width} height={band} fill="transparent" />
                  <path d={barPath(m.left, y, w, barH, Math.min(4, barH / 2))} fill={color} opacity={dimmed ? 0.45 : 1} />
                  <text x={m.left - 12} y={cy} textAnchor="end" dominantBaseline="middle" fill={viz.ink.secondary} fontSize={13}>
                    {d.label}
                  </text>
                  <text x={m.left + w + 6} y={cy} dominantBaseline="middle" fill={viz.ink.primary} fontSize={13} fontWeight={600}>
                    {formatValue(d.value)}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        {hovered && width > 0 && (
          <Tooltip
            left={m.left + (hovered.value / vMax) * plotW}
            top={m.top + band * ((hover ?? 0) + 0.5)}
            flip={m.left + (hovered.value / vMax) * plotW > width * 0.7}
          >
            <div className="viz-tooltip__value">{formatValue(hovered.value)}</div>
            <div className="viz-tooltip__name">{hovered.label}</div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ---------- thin segmented bar (one whole, split into parts) ----------

export interface Part {
  name: string;
  value: number;
  color: string;
}

export function SegmentedBar({ parts, formatValue }: { parts: Part[]; formatValue: (n: number) => string }) {
  const [plotRef, { width }] = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const total = parts.reduce((s, p) => s + p.value, 0);
  const gap = 2; // surface gap between touching parts
  const barH = 8;
  const hitH = 24;
  const usable = Math.max(0, width - gap * (parts.length - 1));

  let cursor = 0;
  const segments = parts.map((p) => {
    const w = total ? usable * (p.value / total) : 0;
    const seg = { x: cursor, w };
    cursor += w + gap;
    return seg;
  });

  return (
    <div className="viz-chart viz-chart--segmented">
      <div className="viz-plot viz-plot--segmented" ref={plotRef}>
        {width > 0 && (
          <svg width={width} height={hitH} role="img" aria-label="Доли по сегментам. Значения — в таблице">
            {parts.map((p, i) => {
              const seg = segments[i];
              return (
                <g key={p.name} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}>
                  <rect x={seg.x} y={0} width={seg.w} height={hitH} fill="transparent" />
                  <rect
                    x={seg.x}
                    y={(hitH - barH) / 2}
                    width={seg.w}
                    height={barH}
                    rx={barH / 2}
                    fill={p.color}
                    opacity={hover !== null && hover !== i ? 0.5 : 1}
                  />
                </g>
              );
            })}
          </svg>
        )}
        {hover !== null && width > 0 && (
          <Tooltip left={segments[hover].x + segments[hover].w / 2} top={hitH + 4} flip={false}>
            <div className="viz-tooltip__value">
              {formatValue(parts[hover].value)} · {fmt.percent(parts[hover].value / total)}
            </div>
            <div className="viz-tooltip__name">{parts[hover].name}</div>
          </Tooltip>
        )}
      </div>
      <ul className="viz-legend viz-legend--rows">
        {parts.map((p, i) => (
          <li
            key={p.name}
            className={hover === i ? 'is-active' : undefined}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="viz-key viz-key--rect" style={{ background: p.color }} />
            <span className="viz-legend__name">{p.name}</span>
            <span className="viz-legend__share">{fmt.percent(total ? p.value / total : 0)}</span>
            <span className="viz-legend__amount">{formatValue(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- sparkline (de-emphasis trend, current point in accent) ----------

export function Sparkline({ values }: { values: number[] }) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const pad = 5;

  let body: ReactNode = null;
  if (values.length > 1 && width > 0 && height > 0) {
    const min = Math.min(...values);
    const span = Math.max(...values) - min || 1;
    const x = (i: number) => pad + (i / (values.length - 1)) * (width - 2 * pad);
    const y = (v: number) => pad + (1 - (v - min) / span) * (height - 2 * pad);
    const last = values.length - 1;
    body = (
      <svg width={width} height={height} aria-hidden="true">
        <polyline
          points={values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}
          fill="none"
          stroke={viz.ink.muted}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={x(last)} cy={y(values[last])} r={4} fill={viz.series[0]} stroke={viz.surface} strokeWidth={2} />
      </svg>
    );
  }

  return (
    <div className="viz-spark" ref={ref}>
      {body}
    </div>
  );
}

// ---------- table view (the accessible twin of every chart) ----------

export interface Column {
  label: string;
  numeric?: boolean;
}

export function DataTable({ caption, columns, rows }: { caption: string; columns: Column[]; rows: ReactNode[][] }) {
  return (
    <div className="viz-table-wrap">
      <table className="viz-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} scope="col" className={c.numeric ? 'num' : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r}>
              {cells.map((cell, c) => (
                <td key={c} className={columns[c]?.numeric ? 'num' : undefined}>
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
