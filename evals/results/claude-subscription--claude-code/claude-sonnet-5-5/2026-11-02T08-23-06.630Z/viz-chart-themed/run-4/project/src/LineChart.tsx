import React from 'react';
import { useThemeType } from '@gravity-ui/uikit';

export type Point = { label: string; value: number };

type Props = {
  title: string;
  /** Series name, used in tooltip and table view. */
  seriesName: string;
  data: Point[];
  height?: number;
};

// Series color per theme: same hue, stepped for each surface (validated with
// validate_palette.js against Gravity surfaces #ffffff / #221d22).
const SERIES = { light: '#2a78d6', dark: '#3987e5' } as const;

const M = { top: 16, right: 56, bottom: 28, left: 44 };
const W = 720;

function niceMax(v: number) {
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

const fmt = (n: number) => n.toLocaleString('en-US');

export function LineChart({ title, seriesName, data, height = 280 }: Props) {
  // 'light' | 'dark' — also resolves the -hc variants and 'system'.
  const themeType = useThemeType();
  const color = SERIES[themeType];

  const [hover, setHover] = React.useState<number | null>(null);
  const [table, setTable] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const iw = W - M.left - M.right;
  const ih = height - M.top - M.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);

  const x = (i: number) => M.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => M.top + ih - (v / max) * ih;

  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join('');
  const last = data.length - 1;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - M.left) / iw) * (data.length - 1));
    setHover(Math.min(last, Math.max(0, i)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setHover((h) => Math.min(last, (h ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? 1) - 1));
    else if (e.key === 'Escape') setHover(null);
    else return;
    e.preventDefault();
  };

  const labelStep = Math.ceil(data.length / 6);
  const hp = hover === null ? null : data[hover];
  // Flip the tooltip to the left of the crosshair near the right edge.
  const tipLeft = hover !== null && hover > data.length * 0.6;

  return (
    <figure
      className="lc"
      style={{
        // Chrome comes straight from Gravity tokens, so it follows the theme
        // with no JS; only the series color needs the theme type.
        ['--lc-series' as string]: color,
        ['--lc-surface' as string]: 'var(--g-color-base-background)',
        margin: 0,
        padding: 16,
        borderRadius: 8,
        background: 'var(--g-color-base-background)',
        border: '1px solid var(--g-color-line-generic)',
        color: 'var(--g-color-text-primary)',
        maxWidth: W,
        position: 'relative',
      }}
    >
      <figcaption
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}
      >
        <strong style={{ font: 'var(--g-text-subheader-2-font-weight) var(--g-text-subheader-2-font-size)/1.4 var(--g-font-family-sans)' }}>
          {title}
        </strong>
        <button
          type="button"
          onClick={() => setTable((t) => !t)}
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 13,
            color: 'var(--g-color-text-secondary)',
            textDecoration: 'underline',
          }}
        >
          {table ? 'Show chart' : 'Show table'}
        </button>
      </figcaption>

      {table ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: 'var(--g-color-text-secondary)', textAlign: 'left' }}>
              <th style={{ padding: '4px 0', fontWeight: 400 }}>Date</th>
              <th style={{ padding: '4px 0', fontWeight: 400, textAlign: 'right' }}>{seriesName}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} style={{ borderTop: '1px solid var(--g-color-line-generic)' }}>
                <td style={{ padding: '4px 0' }}>{d.label}</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(d.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${height}`}
            width="100%"
            role="img"
            aria-label={`${title}: line chart of ${seriesName}, ${data.length} points, from ${fmt(
              data[0].value,
            )} to ${fmt(data[last].value)}`}
            tabIndex={0}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
            onKeyDown={onKey}
            onBlur={() => setHover(null)}
            style={{ display: 'block', touchAction: 'none', outlineOffset: 2 }}
          >
            {/* Recessive solid hairline grid; the 0 baseline is one step stronger. */}
            {ticks.map((t, i) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={W - M.right}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={i === 0 ? 'var(--g-color-line-generic-active)' : 'var(--g-color-line-generic)'}
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={y(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="var(--g-color-text-secondary)"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt(t)}
                </text>
              </g>
            ))}

            {data.map((d, i) =>
              i % labelStep === 0 || i === last ? (
                <text
                  key={d.label}
                  x={x(i)}
                  y={height - 8}
                  textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'}
                  fontSize={11}
                  fill="var(--g-color-text-secondary)"
                >
                  {d.label}
                </text>
              ) : null,
            )}

            {/* Area wash ~10% + 2px line */}
            <path
              d={`${path}L${x(last)},${y(0)}L${x(0)},${y(0)}Z`}
              fill="var(--lc-series)"
              opacity={0.1}
            />
            <path
              d={path}
              fill="none"
              stroke="var(--lc-series)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* End-dot with a 2px surface ring + selective end label (value in text ink) */}
            <circle
              cx={x(last)}
              cy={y(data[last].value)}
              r={4}
              fill="var(--lc-series)"
              stroke="var(--lc-surface)"
              strokeWidth={2}
            />
            {hover === null && (
              <text
                x={x(last) + 10}
                y={y(data[last].value)}
                dominantBaseline="middle"
                fontSize={12}
                fontWeight={600}
                fill="var(--g-color-text-primary)"
              >
                {fmt(data[last].value)}
              </text>
            )}

            {/* Crosshair snapped to the nearest X */}
            {hover !== null && hp && (
              <g pointerEvents="none">
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={M.top}
                  y2={y(0)}
                  stroke="var(--g-color-line-generic-active)"
                  strokeWidth={1}
                />
                <circle
                  cx={x(hover)}
                  cy={y(hp.value)}
                  r={4}
                  fill="var(--lc-series)"
                  stroke="var(--lc-surface)"
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>

          {hp && hover !== null && (
            <div
              role="status"
              style={{
                position: 'absolute',
                top: 8,
                left: `${(x(hover) / W) * 100}%`,
                transform: `translateX(${tipLeft ? 'calc(-100% - 12px)' : '12px'})`,
                pointerEvents: 'none',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 12,
                whiteSpace: 'nowrap',
                background: 'var(--g-color-base-float)',
                border: '1px solid var(--g-color-line-generic)',
                boxShadow: '0 2px 8px var(--g-color-sfx-shadow)',
              }}
            >
              <div style={{ color: 'var(--g-color-text-secondary)' }}>{hp.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ width: 12, height: 2, background: 'var(--lc-series)', borderRadius: 1 }} />
                <strong style={{ color: 'var(--g-color-text-primary)' }}>{fmt(hp.value)}</strong>
                <span style={{ color: 'var(--g-color-text-secondary)' }}>{seriesName}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
