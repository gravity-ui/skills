import {useMemo, useState} from 'react';
import {fmtAxis, niceScale} from '../dashboard/data';
import {useMeasure} from '../dashboard/useMeasure';

export interface BarDatum {
  name: string;
  value: number;
}

interface BarChartProps {
  data: BarDatum[];
  /** single-series color, e.g. var(--s1) */
  color: string;
  formatValue: (v: number) => string;
  ariaLabel: string;
}

const PAD_L = 46;
const PAD_R = 8;
const PAD_T = 18;
const PAD_B = 24;
const MAX_BAR = 24;

/** Top-rounded rect path: 4px rounded data-end, square at the baseline. */
function topRounded(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return [
    `M${x},${y + h}`,
    `L${x},${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    `L${x + w - rr},${y}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `L${x + w},${y + h}`,
    'Z',
  ].join(' ');
}

export function BarChart({data, color, formatValue, ariaLabel}: BarChartProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const W = Math.floor(size.width);
  const H = Math.floor(size.height);

  const model = useMemo(() => {
    if (W < 80 || H < 60 || data.length === 0) return null;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const {lo, hi, ticks} = niceScale(0, Math.max(...data.map((d) => d.value)), 4);
    const slot = plotW / data.length;
    const barW = Math.min(MAX_BAR, slot * 0.55);
    const x = (i: number) => PAD_L + slot * i + (slot - barW) / 2;
    const y = (v: number) => PAD_T + plotH * (1 - (v - lo) / (hi - lo || 1));
    const base = y(lo);
    // thin x labels when slots are too narrow for them to sit side by side
    const longest = Math.max(...data.map((d) => d.name.length));
    const needed = longest * 6.4 + 14;
    const labelStep = Math.max(1, Math.ceil(needed / slot));
    return {plotW, plotH, lo, ticks, slot, barW, x, y, base, labelStep};
  }, [W, H, data]);

  const maxIdx = useMemo(
    () => data.reduce((mi, d, i) => (d.value > data[mi].value ? i : mi), 0),
    [data],
  );

  return (
    <div className="bc" ref={ref}>
      {model && (
        <svg width={W} height={H} role="img" aria-label={ariaLabel} className="bc-svg">
          {model.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={model.y(t)}
                y2={model.y(t)}
                className="chart-gridline"
              />
              <text x={PAD_L - 8} y={model.y(t) + 4} textAnchor="end" className="chart-tick">
                {fmtAxis(t)}
              </text>
            </g>
          ))}
          <line
            x1={PAD_L}
            x2={W - PAD_R}
            y1={model.base}
            y2={model.base}
            className="chart-baseline"
          />
          {data.map((d, i) =>
            i % model.labelStep === 0 ? (
              <text
                key={`xl-${d.name}`}
                x={PAD_L + model.slot * i + model.slot / 2}
                y={H - 6}
                textAnchor="middle"
                className="chart-tick"
              >
                {d.name}
              </text>
            ) : null,
          )}
          {data.map((d, i) => {
            const top = model.y(d.value);
            const h = Math.max(1, model.base - top);
            return (
              <g key={d.name}>
                <path d={topRounded(model.x(i), top, model.barW, h, 4)} fill={color} />
                {/* hover lift: wash toward the surface */}
                {hover === i && (
                  <path
                    d={topRounded(model.x(i), top, model.barW, h, 4)}
                    fill="var(--surface)"
                    opacity={0.28}
                  />
                )}
                {/* selective label: only the extreme carries a number */}
                {i === maxIdx && (
                  <text
                    x={model.x(i) + model.barW / 2}
                    y={top - 6}
                    textAnchor="middle"
                    className="chart-endlabel"
                  >
                    {formatValue(d.value)}
                  </text>
                )}
                {/* hit target: full slot column, much bigger than the mark */}
                <rect
                  x={PAD_L + model.slot * i}
                  y={PAD_T}
                  width={model.slot}
                  height={model.base - PAD_T}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`${d.name}: ${formatValue(d.value)}`}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                />
              </g>
            );
          })}
        </svg>
      )}
      {model && hover !== null && data[hover] && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(
              Math.max(PAD_L + model.slot * hover + model.slot / 2, 76),
              W - 76,
            ),
            top: Math.max(model.y(data[hover].value) - 8, 8),
          }}
          role="status"
        >
          <div className="chart-tooltip-title">{data[hover].name}</div>
          <div className="chart-tooltip-row">
            <span className="chart-tooltip-value">{formatValue(data[hover].value)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
