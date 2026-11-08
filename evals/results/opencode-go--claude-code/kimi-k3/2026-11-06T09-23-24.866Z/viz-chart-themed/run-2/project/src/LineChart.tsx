import React from 'react';

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  /** Value formatter for the tooltip and the direct label. */
  formatValue?: (value: number) => string;
  /** Compact formatter for y-axis ticks (unit lives in the tooltip/label). */
  formatTick?: (value: number) => string;
}

const WIDTH = 720;
const HEIGHT = 320;
const PAD = {top: 16, right: 84, bottom: 32, left: 40};

/** Round a raw step up to 1 / 2 / 2.5 / 5 × 10^n. */
function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  if (norm <= 1) return mag;
  if (norm <= 2) return 2 * mag;
  if (norm <= 2.5) return 2.5 * mag;
  if (norm <= 5) return 5 * mag;
  return 10 * mag;
}

function niceTicks(max: number, count = 4): number[] {
  const step = niceStep(max / count);
  const top = step * Math.ceil(max / step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

/**
 * Single-series line chart drawn with inline SVG.
 *
 * All colors come from Gravity UI theme CSS variables (--g-color-*), so the
 * chart automatically follows the app's current light/dark theme: the line
 * wears the brand token, text wears text tokens, and grid/axes stay recessive
 * on the themed surface.
 */
export function LineChart({
  data,
  formatValue = (v) => String(v),
  formatTick = formatValue,
}: LineChartProps) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const maxValue = Math.max(...data.map((d) => d.value));
  const ticks = niceTicks(maxValue);
  const yTop = ticks[ticks.length - 1] || 1;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH * (1 - v / yTop);

  const points = data.map((d, i) => ({px: x(i), py: y(d.value)}));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.px},${p.py}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].px},${PAD.top + innerH} L${points[0].px},${PAD.top + innerH} Z`;

  const handleMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const stepX = innerW / (data.length - 1);
    const idx = Math.round((viewX - PAD.left) / stepX);
    setHoverIndex(Math.min(data.length - 1, Math.max(0, idx)));
  };

  const hovered = hoverIndex == null ? null : {point: points[hoverIndex], datum: data[hoverIndex]};
  const last = points[points.length - 1];

  return (
    <div style={{position: 'relative', width: '100%'}}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Линейный график"
        style={{display: 'block', width: '100%', height: 'auto'}}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* recessive horizontal grid + y tick labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(t)}
              y2={y(t)}
              style={{stroke: 'var(--g-color-line-generic)'}}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              dy="0.32em"
              textAnchor="end"
              fontSize={12}
              style={{fill: 'var(--g-color-text-secondary)'}}
            >
              {formatTick(t)}
            </text>
          </g>
        ))}

        {/* x axis labels */}
        {data.map((d, i) => (
          <text
            key={d.label}
            x={x(i)}
            y={HEIGHT - PAD.bottom + 20}
            textAnchor="middle"
            fontSize={12}
            style={{fill: 'var(--g-color-text-secondary)'}}
          >
            {d.label}
          </text>
        ))}

        {/* subtle area fill under the line */}
        <path d={areaPath} style={{fill: 'var(--g-color-base-brand)'}} fillOpacity={0.08} />

        {/* the line: 2px, brand token */}
        <path
          d={linePath}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{stroke: 'var(--g-color-base-brand)'}}
        />

        {/* selective direct label: only the last (current) point */}
        <text
          x={last.px + 10}
          y={last.py}
          dy="0.32em"
          fontSize={13}
          fontWeight={600}
          style={{fill: 'var(--g-color-text-primary)'}}
        >
          {formatValue(data[data.length - 1].value)}
        </text>

        {/* hover crosshair + marker (surface ring keeps it readable on the fill) */}
        {hovered && (
          <g pointerEvents="none">
            <line
              x1={hovered.point.px}
              x2={hovered.point.px}
              y1={PAD.top}
              y2={PAD.top + innerH}
              strokeWidth={1}
              strokeDasharray="3 3"
              style={{stroke: 'var(--g-color-line-generic-active)'}}
            />
            <circle
              cx={hovered.point.px}
              cy={hovered.point.py}
              r={5}
              strokeWidth={2}
              style={{
                fill: 'var(--g-color-base-brand)',
                stroke: 'var(--g-color-base-background)',
              }}
            />
          </g>
        )}

        {/* hover hit area */}
        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={handleMove}
        />
      </svg>

      {/* hover tooltip, themed via CSS variables */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: `${(hovered.point.px / WIDTH) * 100}%`,
            top: `${(hovered.point.py / HEIGHT) * 100}%`,
            transform: 'translate(-50%, -120%)',
            pointerEvents: 'none',
            background: 'var(--g-color-base-float)',
            color: 'var(--g-color-text-primary)',
            border: '1px solid var(--g-color-line-generic)',
            borderRadius: 'var(--g-border-radius-m, 6px)',
            boxShadow: 'var(--g-shadow-s)',
            padding: '6px 10px',
            fontSize: 13,
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{color: 'var(--g-color-text-secondary)'}}>{hovered.datum.label}</div>
          <strong>{formatValue(hovered.datum.value)}</strong>
        </div>
      )}
    </div>
  );
}
