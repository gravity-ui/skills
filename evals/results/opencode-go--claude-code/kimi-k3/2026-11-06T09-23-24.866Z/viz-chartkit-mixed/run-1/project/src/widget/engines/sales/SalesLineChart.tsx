import {useMemo, useState} from 'react';

import {ChartTooltip} from '../../ChartTooltip';
import {seriesColor} from '../../colors';
import {niceScale} from '../../scale';
import type {ChartEngineProps} from '../../types';
import {useMeasure} from '../../useMeasure';
import {usePrefersDark} from '../../usePrefersDark';

const MARGIN = {top: 16, right: 84, bottom: 28, left: 64};

/**
 * Engine: regular sales line chart (SVG, tens of points).
 * Implements the unified ChartEngineProps contract.
 */
export default function SalesLineChart({
  series,
  height = 320,
  formatValue,
  formatTime,
  formatAxis,
  formatTimeAxis,
}: ChartEngineProps) {
  const [wrapRef, {width}] = useMeasure<HTMLDivElement>();
  const dark = usePrefersDark();
  const [hover, setHover] = useState<number | null>(null);
  const axis = formatAxis ?? formatValue;
  const timeAxis = formatTimeAxis ?? formatTime;

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const model = useMemo(() => {
    const pts = series[0]?.points ?? [];
    if (!pts.length || !plotW || !plotH) return null;
    const maxV = Math.max(0, ...series.flatMap((s) => s.points.map((p) => p.v)));
    const {yMax, ticks} = niceScale(maxV);
    const stepX = pts.length > 1 ? plotW / (pts.length - 1) : 0;
    const x = (i: number) => MARGIN.left + i * stepX;
    const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
    const area = `${line}L${x(pts.length - 1).toFixed(1)},${(MARGIN.top + plotH).toFixed(1)}L${MARGIN.left.toFixed(1)},${(MARGIN.top + plotH).toFixed(1)}Z`;
    // Thin x labels out when the plot gets narrow.
    const labelEvery = Math.max(1, Math.ceil((pts.length * 40) / plotW));
    return {pts, ticks, x, y, line, area, labelEvery, stepX};
  }, [series, plotW, plotH]);

  const color = seriesColor(0, dark);

  return (
    <div
      ref={wrapRef}
      className="ck-chart"
      style={{height}}
      onPointerLeave={() => setHover(null)}
    >
      {model && (
        <svg width={width} height={height} role="img" aria-label="Линейный график продаж">
          {/* recessive hairline grid */}
          {model.ticks.map((tv) => (
            <g key={tv}>
              <line
                className="ck-grid"
                x1={MARGIN.left}
                x2={MARGIN.left + plotW}
                y1={model.y(tv)}
                y2={model.y(tv)}
              />
              <text className="ck-axis-label" x={MARGIN.left - 8} y={model.y(tv) + 4} textAnchor="end">
                {axis(tv)}
              </text>
            </g>
          ))}
          {/* baseline */}
          <line
            className="ck-baseline"
            x1={MARGIN.left}
            x2={MARGIN.left + plotW}
            y1={MARGIN.top + plotH}
            y2={MARGIN.top + plotH}
          />
          {/* x labels */}
          {model.pts.map((p, i) =>
            i % model.labelEvery === 0 ? (
              <text
                key={p.t}
                className="ck-axis-label"
                x={model.x(i)}
                y={height - 8}
                textAnchor="middle"
              >
                {timeAxis(p.t)}
              </text>
            ) : null,
          )}
          {/* area wash + 2px line */}
          <path d={model.area} fill={color} opacity={0.1} />
          <path d={model.line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* end dot (surface ring) + selective direct label on the last point */}
          <circle
            cx={model.x(model.pts.length - 1)}
            cy={model.y(model.pts[model.pts.length - 1].v)}
            r={4}
            fill={color}
            className="ck-ring"
          />
          <text
            className="ck-value-label"
            x={model.x(model.pts.length - 1) + 10}
            y={model.y(model.pts[model.pts.length - 1].v) + 4}
          >
            {formatValue(model.pts[model.pts.length - 1].v)}
          </text>
          {/* crosshair */}
          {hover !== null && (
            <g>
              <line
                className="ck-crosshair"
                x1={model.x(hover)}
                x2={model.x(hover)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
              />
              {series.map((s, si) => (
                <circle
                  key={s.id}
                  cx={model.x(hover)}
                  cy={model.y(s.points[hover]?.v ?? 0)}
                  r={4}
                  fill={seriesColor(si, dark)}
                  className="ck-ring"
                />
              ))}
            </g>
          )}
          {/* full-width hover target: the crosshair finds the X */}
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={plotH}
            fill="transparent"
            onPointerMove={(e) => {
              const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
              const mx = e.clientX - rect.left - MARGIN.left;
              const idx = Math.round(mx / model.stepX);
              setHover(Math.max(0, Math.min(model.pts.length - 1, idx)));
            }}
          />
        </svg>
      )}
      {model && hover !== null && (
        <ChartTooltip
          x={model.x(hover)}
          y={model.y(model.pts[hover].v)}
          containerWidth={width}
          title={formatTime(model.pts[hover].t)}
          entries={series.map((s, si) => ({
            color: seriesColor(si, dark),
            name: s.name,
            value: formatValue(s.points[hover]?.v ?? NaN),
          }))}
        />
      )}
    </div>
  );
}
