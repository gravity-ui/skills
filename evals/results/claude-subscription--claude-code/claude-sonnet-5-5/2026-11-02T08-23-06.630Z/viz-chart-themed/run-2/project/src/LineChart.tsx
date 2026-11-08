import React from 'react';
import { Button, Text, useThemeType } from '@gravity-ui/uikit';

export type Point = { label: string; value: number };

type Props = {
  title: string;
  subtitle?: string;
  seriesName: string;
  data: Point[];
  height?: number;
};

// Series colour: blue slot 1, stepped separately for each surface.
// Validated with validate_palette.js against Gravity surfaces
// (light #ffffff, dark #221d22): all checks pass (contrast >= 3:1).
const SERIES = { light: '#2a78d6', dark: '#3987e5' } as const;

// Chrome (text, grid, surface) comes from Gravity tokens, so it follows
// whichever theme ThemeProvider currently applies.
const INK_SECONDARY = 'var(--g-color-text-secondary)';
const INK_MUTED = 'var(--g-color-text-hint)';
const GRID = 'var(--g-color-line-generic)';
const SURFACE = 'var(--g-color-base-background)';

const M = { top: 16, right: 56, bottom: 28, left: 44 };

function niceMax(v: number): { max: number; step: number } {
  const rough = v / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const n = rough / pow;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
  return { max: Math.ceil(v / step) * step, step };
}

const fmt = new Intl.NumberFormat('ru-RU');

export function LineChart({ title, subtitle, seriesName, data, height = 280 }: Props) {
  const themeType = useThemeType();
  const color = SERIES[themeType === 'dark' ? 'dark' : 'light'];

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(640);
  const [hover, setHover] = React.useState<number | null>(null);
  const [table, setTable] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [table]);

  const iw = width - M.left - M.right;
  const ih = height - M.top - M.bottom;
  const { max, step } = niceMax(Math.max(...data.map((d) => d.value)));
  const x = (i: number) => M.left + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => M.top + ih - (v / max) * ih;

  const ticks: number[] = [];
  for (let t = 0; t <= max; t += step) ticks.push(t);

  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
  const area = `${path} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const last = data[data.length - 1];

  // Show roughly one x label per 80px.
  const every = Math.max(1, Math.ceil(data.length / Math.floor(iw / 80)));

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width;
    setHover(Math.min(data.length - 1, Math.max(0, Math.round(rel * (data.length - 1)))));
  };

  const hp = hover === null ? null : data[hover];

  return (
    <section
      style={{
        background: SURFACE,
        border: '1px solid var(--g-color-line-generic)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <Text variant="subheader-2" as="h2" style={{ margin: 0 }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="body-1" color="secondary" as="div">
              {subtitle}
            </Text>
          )}
        </div>
        <Button view="flat" size="s" onClick={() => setTable((v) => !v)}>
          {table ? 'График' : 'Таблица'}
        </Button>
      </div>

      {table ? (
        <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 0' }}>
                <Text color="secondary">Период</Text>
              </th>
              <th style={{ textAlign: 'right', padding: '6px 0' }}>
                <Text color="secondary">{seriesName}</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} style={{ borderTop: `1px solid ${GRID}` }}>
                <td style={{ padding: '6px 0' }}>{d.label}</td>
                <td style={{ padding: '6px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmt.format(d.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div ref={wrapRef} style={{ position: 'relative', marginTop: 12 }}>
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${title}: ${seriesName}, от ${data[0].label} до ${last.label}`}
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* gridlines + y ticks */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={M.left}
                  x2={M.left + iw}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={GRID}
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={y(t)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={12}
                  fill={INK_MUTED}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {fmt.format(t)}
                </text>
              </g>
            ))}

            {/* x labels */}
            {data.map(
              (d, i) =>
                i % every === 0 && (
                  <text
                    key={d.label}
                    x={x(i)}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize={12}
                    fill={INK_MUTED}
                  >
                    {d.label}
                  </text>
                ),
            )}

            {/* area wash + line */}
            <path d={area} fill={color} opacity={0.1} />
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* end dot + direct label (text wears ink, not the series colour) */}
            <circle
              cx={x(data.length - 1)}
              cy={y(last.value)}
              r={4}
              fill={color}
              stroke={SURFACE}
              strokeWidth={2}
            />
            <text
              x={x(data.length - 1) + 10}
              y={y(last.value)}
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={600}
              fill="var(--g-color-text-primary)"
            >
              {fmt.format(last.value)}
            </text>

            {/* crosshair */}
            {hp && hover !== null && (
              <g pointerEvents="none">
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={M.top}
                  y2={M.top + ih}
                  stroke="var(--g-color-line-generic-accent)"
                  strokeWidth={1}
                />
                <circle
                  cx={x(hover)}
                  cy={y(hp.value)}
                  r={4}
                  fill={color}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
              </g>
            )}

            {/* hit layer, much larger than the line */}
            <rect
              x={M.left}
              y={M.top}
              width={iw}
              height={ih}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {hp && hover !== null && (
            <div
              role="status"
              style={{
                position: 'absolute',
                top: M.top,
                left: x(hover) + (x(hover) > width / 2 ? -12 : 12),
                transform: x(hover) > width / 2 ? 'translateX(-100%)' : undefined,
                pointerEvents: 'none',
                background: 'var(--g-color-base-float)',
                color: 'var(--g-color-text-primary)',
                border: '1px solid var(--g-color-line-generic)',
                boxShadow: '0 4px 16px var(--g-color-sfx-shadow)',
                borderRadius: 8,
                padding: '8px 10px',
                whiteSpace: 'nowrap',
              }}
            >
              <Text variant="caption-2" color="secondary" as="div">
                {hp.label}
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  aria-hidden
                  style={{ width: 12, height: 2, background: color, borderRadius: 1 }}
                />
                <Text variant="body-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fmt.format(hp.value)}
                </Text>
                <Text variant="body-1" color="secondary">
                  {seriesName}
                </Text>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
