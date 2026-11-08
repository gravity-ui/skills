import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useThemeType } from '@gravity-ui/uikit';

export interface LinePoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  title: string;
  subtitle?: string;
  data: LinePoint[];
  unit?: string;
  height?: number;
}

/**
 * Series colour: categorical slot 1 of the dataviz reference palette, stepped per theme.
 * Checked with scripts/validate_palette.js against Gravity's own surfaces
 * (#ffffff light, #221d22 dark): both pass the lightness, chroma and contrast gates.
 */
const SERIES_COLOR = { light: '#2a78d6', dark: '#3987e5' } as const;

/** Chrome colours are Gravity tokens, so grid, axes, text and surface follow the active theme. */
const INK = {
  primary: 'var(--g-color-text-primary)',
  secondary: 'var(--g-color-text-secondary)',
  muted: 'var(--g-color-text-hint)',
  hairline: 'var(--g-color-line-generic)',
  surface: 'var(--g-color-base-background)',
  tooltipBg: 'var(--g-color-infographics-tooltip-bg)',
} as const;

const MARGIN = { top: 24, right: 16, bottom: 32, left: 56 };
const FALLBACK_WIDTH = 640;
const X_LABEL_MIN_SPACE = 44; // px reserved per x label before thinning labels

const fmtNum = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });

/** Round, evenly spaced y ticks that cover [min, max]. */
function niceTicks(min: number, max: number, target = 5): number[] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = hi - lo || Math.abs(hi) || 1;
  const raw = span / (target - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const first = Math.floor(lo / step);
  const count = Math.ceil(hi / step) - first;
  return Array.from({ length: count + 1 }, (_, i) => Number(((first + i) * step).toFixed(10)));
}

function useElementWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || fallback);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [fallback]);
  return [ref, width] as const;
}

export function LineChart({ title, subtitle, data, unit, height = 300 }: LineChartProps) {
  const theme = useThemeType();
  const color = SERIES_COLOR[theme];
  const [wrapRef, width] = useElementWidth(FALLBACK_WIDTH);
  const [active, setActive] = useState<number | null>(null);

  const n = data.length;
  const last = n - 1;
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const plotBottom = MARGIN.top + plotH;

  const ticks = useMemo(() => {
    if (n === 0) return [];
    const values = data.map((d) => d.value);
    return niceTicks(Math.min(...values), Math.max(...values));
  }, [data, n]);

  if (n === 0) {
    return <p style={{ color: INK.secondary, margin: 0 }}>Нет данных для графика</p>;
  }

  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const xAt = (i: number) => MARGIN.left + (n === 1 ? plotW / 2 : (i / last) * plotW);
  const yAt = (v: number) => MARGIN.top + (1 - (v - lo) / (hi - lo)) * plotH;

  const pts = data.map((d, i) => ({ x: xAt(i), y: yAt(d.value) }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${pts[last].x},${plotBottom} L${pts[0].x},${plotBottom} Z`;
  const stride = Math.max(1, Math.ceil((n * X_LABEL_MIN_SPACE) / plotW));

  // Nearest point by x: the crosshair snaps to the X, so the target is the closest column.
  const nearestIndex = (px: number) => {
    if (n === 1) return 0;
    const t = (px - MARGIN.left) / plotW;
    return Math.min(last, Math.max(0, Math.round(t * last)));
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActive(nearestIndex(e.clientX - rect.left));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = active ?? last;
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
        next = cur + 1;
        break;
      case 'ArrowLeft':
        next = cur - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      case 'Escape':
        setActive(null);
        return;
      default:
        return;
    }
    e.preventDefault();
    setActive(Math.min(last, Math.max(0, next)));
  };

  const act = active !== null ? pts[active] : null;
  const flipTooltip = act !== null && act.x > width / 2;
  const fmtValue = (v: number) => (unit ? `${fmtNum.format(v)} ${unit}` : fmtNum.format(v));

  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: INK.primary }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 13, color: INK.secondary, marginTop: 2 }}>{subtitle}</div>
        )}
      </figcaption>

      <div
        ref={wrapRef}
        role="group"
        tabIndex={0}
        aria-label={`${title}: от ${fmtValue(data[0].value)} до ${fmtValue(data[last].value)}`}
        onFocus={() => setActive((a) => a ?? last)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
        style={{ position: 'relative', width: '100%' }}
      >
        <svg
          width={width}
          height={height}
          aria-hidden="true"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          style={{ display: 'block', touchAction: 'pan-y' }}
        >
          {/* Hairline grid and y ticks, one solid step off the surface */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotW}
                y1={yAt(t)}
                y2={yAt(t)}
                strokeWidth={1}
                style={{ stroke: INK.hairline }}
              />
              <text
                x={MARGIN.left - 8}
                y={yAt(t)}
                dy="0.32em"
                textAnchor="end"
                style={{ fill: INK.muted, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
              >
                {fmtNum.format(t)}
              </text>
            </g>
          ))}

          {/* X labels, thinned when crowded */}
          {data.map(
            (d, i) =>
              i % stride === 0 && (
                <text
                  key={`${d.label}-${i}`}
                  x={xAt(i)}
                  y={plotBottom + 20}
                  textAnchor="middle"
                  style={{ fill: INK.muted, fontSize: 12 }}
                >
                  {d.label}
                </text>
              ),
          )}

          {/* Area wash at ~10% and a 2px line with round joins */}
          <path d={areaPath} fill={color} fillOpacity={0.1} />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Direct label on the endpoint */}
          <circle
            cx={pts[last].x}
            cy={pts[last].y}
            r={4}
            fill={color}
            style={{ stroke: INK.surface, strokeWidth: 2 }}
          />
          <text
            x={pts[last].x}
            y={pts[last].y - 12}
            textAnchor="end"
            style={{ fill: INK.primary, fontSize: 13, fontWeight: 600 }}
          >
            {fmtNum.format(data[last].value)}
          </text>

          {/* Hover / focus layer: crosshair and active marker */}
          {act && active !== null && (
            <>
              <line
                x1={act.x}
                x2={act.x}
                y1={MARGIN.top}
                y2={plotBottom}
                strokeWidth={1}
                style={{ stroke: INK.hairline }}
              />
              <circle
                cx={act.x}
                cy={act.y}
                r={5}
                fill={color}
                style={{ stroke: INK.surface, strokeWidth: 2 }}
              />
            </>
          )}
        </svg>

        {act && active !== null && (
          <div
            style={{
              position: 'absolute',
              left: act.x,
              top: act.y,
              transform: flipTooltip
                ? 'translate(calc(-100% - 14px), -50%)'
                : 'translate(14px, -50%)',
              pointerEvents: 'none',
              background: INK.tooltipBg,
              color: INK.primary,
              border: `1px solid ${INK.hairline}`,
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 13,
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            }}
          >
            <div style={{ color: INK.secondary }}>{data[active].label}</div>
            <div style={{ fontWeight: 600 }}>{fmtValue(data[active].value)}</div>
          </div>
        )}
      </div>

      {/* Table twin: every value is reachable without hover */}
      <details style={{ marginTop: 12, fontSize: 13, color: INK.secondary }}>
        <summary style={{ cursor: 'pointer' }}>Таблица значений</summary>
        <table style={{ borderCollapse: 'collapse', marginTop: 8, color: INK.primary }}>
          <thead>
            <tr>
              <th style={cellStyle}>Период</th>
              <th style={{ ...cellStyle, textAlign: 'right' }}>
                {unit ? `Значение, ${unit}` : 'Значение'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i}>
                <td style={cellStyle}>{d.label}</td>
                <td style={{ ...cellStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtNum.format(d.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

const cellStyle = {
  padding: '4px 12px 4px 0',
  borderBottom: `1px solid ${INK.hairline}`,
  textAlign: 'left' as const,
};
