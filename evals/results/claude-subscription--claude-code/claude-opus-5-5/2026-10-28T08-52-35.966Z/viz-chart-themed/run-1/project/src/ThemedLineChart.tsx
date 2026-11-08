import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

export interface LineSeries {
  id: string;
  name: string;
  values: number[];
}

export interface ThemedLineChartProps {
  categories: string[];
  series: LineSeries[];
  height?: number;
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  ariaLabel?: string;
}

// Categorical slots in fixed order, stepped separately for each theme type.
// Validated (dataviz validate_palette.js) against Gravity surfaces:
// light #ffffff, dark #221d22, dark-hc #121112.
const SERIES_COLORS: Record<ThemeType, string[]> = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

// Chart chrome comes from Gravity tokens, so it follows the ThemeProvider as-is.
const TOKENS = {
  surface: 'var(--g-color-base-background)',
  float: 'var(--g-color-base-float)',
  textPrimary: 'var(--g-color-text-primary)',
  textSecondary: 'var(--g-color-text-secondary)',
  grid: 'var(--g-color-line-generic)',
  axis: 'var(--g-color-line-generic-accent)',
  border: 'var(--g-color-line-generic-solid)',
};

const MARGIN = { top: 12, right: 112, bottom: 32, left: 56 };
const END_LABEL_MIN_GAP = 16;

function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw)!;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = 0; t <= top + step / 2; t += step) ticks.push(t);
  return ticks;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

const defaultFormat = new Intl.NumberFormat('ru-RU').format;
const defaultTick = new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format;

export function ThemedLineChart({
  categories,
  series,
  height = 320,
  formatValue = defaultFormat,
  formatTick = defaultTick,
  ariaLabel,
}: ThemedLineChartProps) {
  const themeType = useThemeType();
  const palette = SERIES_COLORS[themeType];
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const n = categories.length;

  const ticks = useMemo(
    () => niceTicks(Math.max(...series.flatMap((s) => s.values))),
    [series],
  );
  const yMax = ticks[ticks.length - 1] || 1;

  const x = (i: number) => MARGIN.left + (n > 1 ? (i * plotW) / (n - 1) : plotW / 2);
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;

  // Thin out x labels so they never collide (~48px per label).
  const labelEvery = Math.max(1, Math.ceil((n * 48) / Math.max(plotW, 1)));

  // Direct end labels only when they separate cleanly; otherwise the legend + tooltip carry identity.
  const endYs = series.map((s) => y(s.values[n - 1])).sort((a, b) => a - b);
  const showEndLabels =
    series.length <= 4 && endYs.every((v, i) => i === 0 || v - endYs[i - 1] >= END_LABEL_MIN_GAP);

  const handlePointerMove = (event: PointerEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const index = n > 1 ? Math.round((px / rect.width) * (n - 1)) : 0;
    setActiveIndex(Math.min(n - 1, Math.max(0, index)));
  };

  const handleKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      setActiveIndex((prev) => Math.min(n - 1, Math.max(0, (prev ?? (delta > 0 ? -1 : n)) + delta)));
    } else if (event.key === 'Escape') {
      setActiveIndex(null);
    }
  };

  const tooltipLeft = activeIndex === null ? 0 : x(activeIndex);
  const tooltipFlipped = tooltipLeft > width - 200;

  return (
    <div>
      {series.length >= 2 && (
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 16px',
            margin: '0 0 12px',
            padding: 0,
            listStyle: 'none',
            color: TOKENS.textSecondary,
          }}
        >
          {series.map((s, i) => (
            <li key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="8" aria-hidden>
                <line x1="1" x2="15" y1="4" y2="4" stroke={palette[i]} strokeWidth={2} strokeLinecap="round" />
              </svg>
              {s.name}
            </li>
          ))}
        </ul>
      )}

      <div ref={containerRef} style={{ position: 'relative', width: '100%', height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onBlur={() => setActiveIndex(null)}
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* Gridlines + y ticks */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + plotW}
                  y1={y(t)}
                  y2={y(t)}
                  stroke={t === 0 ? TOKENS.axis : TOKENS.grid}
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
                <text
                  x={MARGIN.left - 8}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize={12}
                  fill={TOKENS.textSecondary}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatTick(t)}
                </text>
              </g>
            ))}

            {/* X labels */}
            {categories.map((c, i) =>
              i % labelEvery === 0 ? (
                <text
                  key={c}
                  x={x(i)}
                  y={MARGIN.top + plotH + 20}
                  textAnchor="middle"
                  fontSize={12}
                  fill={TOKENS.textSecondary}
                >
                  {c}
                </text>
              ) : null,
            )}

            {/* Crosshair */}
            {activeIndex !== null && (
              <line
                x1={x(activeIndex)}
                x2={x(activeIndex)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                stroke={TOKENS.axis}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
            )}

            {/* Lines */}
            {series.map((s, i) => (
              <path
                key={s.id}
                d={s.values.map((v, j) => `${j === 0 ? 'M' : 'L'}${x(j)},${y(v)}`).join('')}
                fill="none"
                stroke={palette[i]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* End markers + direct labels */}
            {series.map((s, i) => {
              const v = s.values[n - 1];
              return (
                <g key={s.id}>
                  <circle cx={x(n - 1)} cy={y(v)} r={4} fill={palette[i]} stroke={TOKENS.surface} strokeWidth={2} />
                  {showEndLabels && (
                    <text x={x(n - 1) + 10} y={y(v)} dy="0.32em" fontSize={12}>
                      <tspan fill={TOKENS.textPrimary} fontWeight={600}>
                        {formatValue(v)}
                      </tspan>
                      <tspan fill={TOKENS.textSecondary}> {s.name}</tspan>
                    </text>
                  )}
                </g>
              );
            })}

            {/* Hover markers */}
            {activeIndex !== null &&
              series.map((s, i) => (
                <circle
                  key={s.id}
                  cx={x(activeIndex)}
                  cy={y(s.values[activeIndex])}
                  r={4}
                  fill={palette[i]}
                  stroke={TOKENS.surface}
                  strokeWidth={2}
                />
              ))}

            {/* Hit area larger than the marks */}
            <rect
              x={MARGIN.left - 8}
              y={0}
              width={plotW + 16}
              height={height}
              fill="transparent"
              onPointerMove={handlePointerMove}
              onPointerLeave={() => setActiveIndex(null)}
            />
          </svg>
        )}

        {activeIndex !== null && (
          <div
            role="status"
            style={{
              position: 'absolute',
              top: MARGIN.top,
              left: tooltipFlipped ? undefined : tooltipLeft + 12,
              right: tooltipFlipped ? width - tooltipLeft + 12 : undefined,
              minWidth: 160,
              padding: '8px 12px',
              background: TOKENS.float,
              color: TOKENS.textPrimary,
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 'var(--g-border-radius-m)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              fontSize: 13,
              lineHeight: '18px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ color: TOKENS.textSecondary, marginBottom: 4 }}>{categories[activeIndex]}</div>
            {series.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  aria-hidden
                  style={{ width: 8, height: 8, borderRadius: '50%', background: palette[i], flexShrink: 0 }}
                />
                <span style={{ color: TOKENS.textSecondary, flexGrow: 1 }}>{s.name}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {formatValue(s.values[activeIndex])}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
