import {useMemo, useState} from 'react';
import {fmtAxis, niceScale} from '../dashboard/data';
import {useMeasure} from '../dashboard/useMeasure';

export interface LineSeries {
  name: string;
  /** CSS color, e.g. var(--s1) */
  color: string;
  values: number[];
  /** filled area wash under this series */
  area?: boolean;
}

interface LineChartProps {
  xLabels: string[];
  series: LineSeries[];
  formatValue: (v: number) => string;
  ariaLabel: string;
}

const PAD_L = 46;
const PAD_R = 66;
const PAD_T = 12;
const PAD_B = 24;

const clampNum = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function LineChart({xLabels, series, formatValue, ariaLabel}: LineChartProps) {
  const [ref, size] = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const W = Math.floor(size.width);
  const H = Math.floor(size.height);
  const n = xLabels.length;

  const model = useMemo(() => {
    if (W < 80 || H < 60 || n === 0) return null;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const maxV = Math.max(...series.flatMap((s) => s.values), 0);
    const {lo, hi, ticks} = niceScale(0, maxV, 4);
    const x = (i: number) => PAD_L + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));
    const y = (v: number) => PAD_T + plotH * (1 - (v - lo) / (hi - lo || 1));
    const xTickStep = Math.max(1, Math.ceil(n / 8));
    return {plotW, plotH, lo, hi, ticks, x, y, xTickStep};
  }, [W, H, n, series]);

  const tooltipLeft = model && hover !== null ? clampNum(model.x(hover), 86, W - 86) : 0;

  return (
    <div className="lc">
      {series.length > 1 && (
        <div className="lc-legend">
          {series.map((s) => (
            <span className="lc-legend-item" key={s.name}>
              <span className="lc-legend-key" style={{background: s.color}} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <div className="lc-plot" ref={ref}>
        {model && (
          <svg
            width={W}
            height={H}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            className="lc-svg"
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                setHover((h) => {
                  const cur = h ?? (e.key === 'ArrowLeft' ? n : -1);
                  return clampNum(cur + (e.key === 'ArrowRight' ? 1 : -1), 0, n - 1);
                });
              }
              if (e.key === 'Escape') setHover(null);
            }}
            onFocus={() => setHover((h) => h ?? n - 1)}
            onBlur={() => setHover(null)}
          >
            {/* gridlines + y ticks */}
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
            {/* baseline */}
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={model.y(model.lo)}
              y2={model.y(model.lo)}
              className="chart-baseline"
            />
            {/* x ticks */}
            {xLabels.map((label, i) =>
              i % model.xTickStep === 0 ? (
                <text
                  key={label + i}
                  x={model.x(i)}
                  y={H - 6}
                  textAnchor="middle"
                  className="chart-tick"
                >
                  {label}
                </text>
              ) : null,
            )}
            {/* area wash for the first series */}
            {series[0]?.area && (
              <path
                d={`${series[0].values
                  .map((v, i) => `${i === 0 ? 'M' : 'L'}${model.x(i)},${model.y(v)}`)
                  .join(' ')} L${model.x(n - 1)},${model.y(model.lo)} L${model.x(0)},${model.y(
                  model.lo,
                )} Z`}
                fill={series[0].color}
                opacity={0.1}
              />
            )}
            {/* lines */}
            {series.map((s) => (
              <path
                key={s.name}
                d={s.values
                  .map((v, i) => `${i === 0 ? 'M' : 'L'}${model.x(i)},${model.y(v)}`)
                  .join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {/* end dots with surface ring */}
            {series.map((s) => (
              <circle
                key={`end-${s.name}`}
                cx={model.x(n - 1)}
                cy={model.y(s.values[n - 1])}
                r={4}
                fill={s.color}
                stroke="var(--surface)"
                strokeWidth={2}
              />
            ))}
            {/* selective end label: last value of the lead series,
                nudged away when the other series' end dot converges */}
            {series[0] &&
              (() => {
                const yEnd = model.y(series[0].values[n - 1]);
                const otherEnd =
                  series.length > 1 ? model.y(series[1].values[n - 1]) : null;
                const dy =
                  otherEnd !== null && Math.abs(otherEnd - yEnd) < 14
                    ? yEnd <= otherEnd
                      ? -11
                      : 11
                    : 0;
                return (
                  <text
                    x={model.x(n - 1) + 9}
                    y={yEnd + 4 + dy}
                    className="chart-endlabel"
                  >
                    {formatValue(series[0].values[n - 1])}
                  </text>
                );
              })()}
            {/* crosshair */}
            {hover !== null && (
              <g className="lc-crosshair">
                <line
                  x1={model.x(hover)}
                  x2={model.x(hover)}
                  y1={PAD_T}
                  y2={model.y(model.lo)}
                  className="chart-crosshair"
                />
                {series.map((s) => (
                  <circle
                    key={`h-${s.name}`}
                    cx={model.x(hover)}
                    cy={model.y(s.values[hover])}
                    r={4}
                    fill={s.color}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                ))}
              </g>
            )}
            {/* hit overlay: the crosshair finds the X, not the 2px line */}
            <rect
              x={PAD_L}
              y={PAD_T}
              width={model.plotW}
              height={model.plotH}
              fill="transparent"
              onPointerMove={(e) => {
                const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (!rect) return;
                const px = e.clientX - rect.left;
                const i = Math.round(((px - PAD_L) / model.plotW) * (n - 1));
                setHover(clampNum(i, 0, n - 1));
              }}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}
        {model && hover !== null && (
          <div className="chart-tooltip" style={{left: tooltipLeft, top: PAD_T + 4}} role="status">
            <div className="chart-tooltip-title">{xLabels[hover]}</div>
            {series.map((s) => (
              <div className="chart-tooltip-row" key={s.name}>
                <span className="chart-tooltip-key" style={{background: s.color}} />
                <span className="chart-tooltip-name">{s.name}</span>
                <span className="chart-tooltip-value">{formatValue(s.values[hover])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
