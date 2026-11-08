import { useMemo, useState } from 'react';
import { useSize } from './useSize';
import type { DayPoint } from '../data';

export interface LineSeries {
  name: string;
  color: string; // CSS var, напр. 'var(--viz-series-1)'
  points: DayPoint[];
}

const PAD = { top: 10, right: 8, bottom: 22, left: 40 };

function niceCeil(v: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * pow;
}

export function LineChart({ series }: { series: LineSeries[] }) {
  const [plotRef, { width, height }] = useSize<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const n = series[0]?.points.length ?? 0;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = Math.max(0, height - PAD.top - PAD.bottom);

  const maxV = useMemo(() => {
    let m = 0;
    for (const s of series) for (const p of s.points) m = Math.max(m, p.value);
    return niceCeil(m * 1.05);
  }, [series]);

  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / maxV) * innerH;

  const yTicks = useMemo(() => {
    const t: number[] = [];
    for (let k = 0; k <= 4; k++) t.push((maxV / 4) * k);
    return t;
  }, [maxV]);

  const xTicks = useMemo(() => {
    if (!n) return [];
    const idx = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
    return [...new Set(idx)];
  }, [n]);

  const paths = useMemo(
    () =>
      series.map((s) =>
        s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' '),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [series, innerW, innerH, maxV],
  );

  const ready = width >= 80 && height >= 60;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const px = e.clientX - rect.left - PAD.left;
    const i = Math.round((px / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const hoverDay = hover !== null ? series[0]?.points[hover] : null;
  const showEndLabels =
    series.length === 2 &&
    Math.abs(y(series[0].points[n - 1].value) - y(series[1].points[n - 1].value)) >= 20;

  return (
    <div className="viz-chart">
      <div className="viz-chart__plot" ref={plotRef}>
        {ready && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={series.map((s) => s.name).join(', ')}
          onPointerLeave={() => setHover(null)}
        >
          {/* горизонтальные линии сетки и тики Y */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? 'var(--viz-baseline)' : 'var(--viz-gridline)'}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={y(t) + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--viz-muted)"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t >= 10000 ? `${Math.round(t / 1000)}K` : t}
              </text>
            </g>
          ))}
          {/* тики X */}
          {xTicks.map((i) => (
            <text
              key={i}
              x={x(i)}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="var(--viz-muted)"
            >
              {series[0].points[i].label}
            </text>
          ))}
          {/* линии серий */}
          {series.map((s, si) => (
            <g key={s.name}>
              <path
                d={paths[si]}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* конечная точка: маркер >= 8px с 2px кольцом в цвет поверхности */}
              <circle
                cx={x(n - 1)}
                cy={y(s.points[n - 1].value)}
                r={4}
                fill={s.color}
                stroke="var(--viz-surface)"
                strokeWidth={2}
              />
              {showEndLabels && (
                <text
                  x={x(n - 1)}
                  y={y(s.points[n - 1].value) - 9}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--viz-text)"
                >
                  {s.points[n - 1].value}
                </text>
              )}
            </g>
          ))}
          {/* перекрестие */}
          {hover !== null && hoverDay && (
            <g pointerEvents="none">
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={PAD.top}
                y2={PAD.top + innerH}
                stroke="var(--viz-baseline)"
                strokeWidth={1}
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={x(hover)}
                  cy={y(s.points[hover].value)}
                  r={4}
                  fill={s.color}
                  stroke="var(--viz-surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
          {/* широкая прозрачная зона наведения */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={onMove}
          />
        </svg>
        )}
        {ready && hover !== null && hoverDay && (
          <div
            className="viz-chart__tooltip"
            style={{
              left: Math.max(70, Math.min(width - 70, x(hover))),
              top: 0,
            }}
          >
            <div className="viz-chart__tooltip-title">{hoverDay.label}</div>
            {series.map((s) => (
              <div className="viz-chart__tooltip-row" key={s.name}>
                <span className="viz-chart__tooltip-key" style={{ background: s.color }} />
                <span className="viz-chart__tooltip-name">{s.name}</span>
                <span className="viz-chart__tooltip-value">{s.points[hover].value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {series.length >= 2 && (
        <div className="viz-legend">
          {series.map((s) => (
            <span className="viz-legend__item" key={s.name}>
              <span className="viz-legend__key-line" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
