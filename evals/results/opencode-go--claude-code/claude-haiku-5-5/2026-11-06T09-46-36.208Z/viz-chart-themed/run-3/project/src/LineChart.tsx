import * as React from 'react';
import { useThemeType } from '@gravity-ui/uikit';

export type Point = { label: string; value: number };

type LineChartProps = {
  title: string;
  subtitle?: string;
  seriesName: string;
  data: Point[];
};

// Series color: categorical slot 1 (blue) from the dataviz reference palette,
// stepped for each theme. Checked against the Gravity chart surfaces:
// light #ffffff (4.42:1), dark #221d22 (4.56:1).
const SERIES_COLOR = { light: '#2a78d6', dark: '#3987e5' } as const;

// Everything else (text, grid, axes, tooltip, surface ring) uses Gravity's own
// CSS variables, which switch with the ThemeProvider theme automatically.
const HEIGHT = 280;
const MARGIN = { top: 16, right: 56, bottom: 32, left: 48 };
const DEFAULT_WIDTH = 640;
const LINE_WIDTH = 2;
const MARK_RADIUS = 5; // 10px diameter, above the 8px minimum
const RING_WIDTH = 2;

const css = {
  title: { margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--g-color-text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--g-color-text-secondary)' },
  axisText: { fill: 'var(--g-color-text-secondary)', fontSize: 12 },
  endLabel: { fill: 'var(--g-color-text-primary)', fontSize: 12, fontWeight: 600 },
  grid: { stroke: 'var(--g-color-line-generic)', strokeWidth: 1 },
  baseline: { stroke: 'var(--g-color-line-generic-accent)', strokeWidth: 1 },
  crosshair: { stroke: 'var(--g-color-line-generic-accent)', strokeWidth: 1 },
  ring: { stroke: 'var(--g-color-base-background)', strokeWidth: RING_WIDTH },
  tooltip: {
    position: 'absolute',
    top: MARGIN.top,
    pointerEvents: 'none',
    minWidth: 120,
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid var(--g-color-line-generic)',
    background: 'var(--g-color-base-float)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    fontSize: 12,
    color: 'var(--g-color-text-secondary)',
  } as React.CSSProperties,
  tooltipValue: { fontSize: 16, fontWeight: 600, color: 'var(--g-color-text-primary)' },
  table: { borderCollapse: 'collapse', fontSize: 13, color: 'var(--g-color-text-primary)' },
  cell: { padding: '4px 12px', borderBottom: '1px solid var(--g-color-line-generic)', textAlign: 'left' },
  num: { padding: '4px 12px', borderBottom: '1px solid var(--g-color-line-generic)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
} satisfies Record<string, React.CSSProperties | Record<string, string | number>>;

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const f = raw / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * pow;
}

/** Round-number ticks from 0 up to a value at or above `max`. */
function niceTicks(max: number, count = 4): number[] {
  const step = niceStep(max / count);
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let k = 0; k * step <= top + step / 2; k++) {
    ticks.push(Number((k * step).toPrecision(12)));
  }
  return ticks;
}

const fmt = (n: number) => n.toLocaleString('ru-RU');

export function LineChart({ title, subtitle, seriesName, data }: LineChartProps) {
  const themeType = useThemeType();
  const color = SERIES_COLOR[themeType];

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(DEFAULT_WIDTH);
  const [active, setActive] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.floor(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = data.length;
  if (n === 0) {
    return <p style={css.subtitle}>Нет данных для отображения.</p>;
  }

  const plotW = Math.max(1, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const baseY = MARGIN.top + plotH;

  const ticks = niceTicks(Math.max(...data.map((d) => d.value)));
  const yMax = ticks[ticks.length - 1];

  const xAt = (i: number) => MARGIN.left + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
  const yAt = (v: number) => MARGIN.top + plotH * (1 - v / yMax);
  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${points[n - 1].x.toFixed(1)},${baseY} L${points[0].x.toFixed(1)},${baseY} Z`;

  const nearestIndex = (px: number) => {
    if (n < 2) return 0;
    const i = Math.round(((px - MARGIN.left) * (n - 1)) / plotW);
    return Math.min(n - 1, Math.max(0, i));
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive(nearestIndex(e.clientX - rect.left));
  };

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    setActive((cur) => {
      if (e.key === 'ArrowRight') return Math.min(n - 1, (cur ?? -1) + 1);
      return Math.max(0, (cur ?? n) - 1);
    });
  };

  const hovered = active !== null ? { ...data[active], ...points[active], i: active } : null;
  const flipTooltip = hovered !== null && hovered.x > width / 2;
  const last = points[n - 1];

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ marginBottom: 12 }}>
        <h2 style={css.title}>{title}</h2>
        {subtitle && <p style={css.subtitle}>{subtitle}</p>}
      </figcaption>

      <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
        <svg
          role="img"
          aria-label={`${title}. ${seriesName}: ${data.map((d) => `${d.label} ${fmt(d.value)}`).join('; ')}`}
          width={width}
          height={HEIGHT}
          tabIndex={0}
          style={{ display: 'block', overflow: 'visible' }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((cur) => cur ?? n - 1)}
          onBlur={() => setActive(null)}
        >
          {/* Horizontal hairline grid + y-axis labels */}
          {ticks.map((t) => {
            const y = Math.round(yAt(t)) + 0.5;
            return (
              <g key={t}>
                {t === 0 ? (
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} style={css.baseline} />
                ) : (
                  <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y} y2={y} style={css.grid} />
                )}
                <text x={MARGIN.left - 8} y={y} dy="0.32em" textAnchor="end" style={css.axisText}>
                  {fmt(t)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={`x-${i}`}
              x={points[i].x}
              y={baseY + 20}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
              style={css.axisText}
            >
              {d.label}
            </text>
          ))}

          {/* Area wash (10%) and line */}
          <path d={areaPath} fill={color} fillOpacity={0.1} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={LINE_WIDTH}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Crosshair */}
          {hovered && (
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={MARGIN.top}
              y2={baseY}
              style={css.crosshair}
            />
          )}

          {/* Endpoint: dot with surface ring, value label in text ink */}
          <circle cx={last.x} cy={last.y} r={MARK_RADIUS} fill={color} style={css.ring} />
          <text x={last.x + 10} y={last.y} dy="0.32em" style={css.endLabel}>
            {fmt(data[n - 1].value)}
          </text>

          {/* Hovered point */}
          {hovered && (
            <circle cx={hovered.x} cy={hovered.y} r={MARK_RADIUS} fill={color} style={css.ring} />
          )}
        </svg>

        {hovered && (
          <div
            style={{
              ...css.tooltip,
              left: flipTooltip ? hovered.x - 12 : hovered.x + 12,
              transform: flipTooltip ? 'translateX(-100%)' : undefined,
            }}
          >
            <div>{hovered.label}</div>
            <div style={css.tooltipValue}>{fmt(hovered.value)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width={12} height={2} aria-hidden="true">
                <line x1={0} x2={12} y1={1} y2={1} stroke={color} strokeWidth={LINE_WIDTH} strokeLinecap="round" />
              </svg>
              <span>{seriesName}</span>
            </div>
          </div>
        )}
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--g-color-text-secondary)' }}>
          Таблица значений
        </summary>
        <table style={{ ...css.table, marginTop: 8 }}>
          <thead>
            <tr>
              <th scope="col" style={css.cell}>Период</th>
              <th scope="col" style={{ ...css.cell, textAlign: 'right' }}>{seriesName}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <th scope="row" style={{ ...css.cell, fontWeight: 400 }}>{d.label}</th>
                <td style={css.num}>{fmt(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
