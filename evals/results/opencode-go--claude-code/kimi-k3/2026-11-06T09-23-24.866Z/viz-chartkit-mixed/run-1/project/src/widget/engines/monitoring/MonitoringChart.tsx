import {useEffect, useMemo, useRef, useState} from 'react';

import {ChartTooltip} from '../../ChartTooltip';
import {chrome, seriesColor} from '../../colors';
import {niceScale} from '../../scale';
import type {ChartEngineProps} from '../../types';
import {useMeasure} from '../../useMeasure';
import {usePrefersDark} from '../../usePrefersDark';

const MARGIN = {top: 12, right: 16, bottom: 26, left: 48};
const X_TICKS = 5;

/**
 * Engine: dense monitoring time series (Canvas, thousands of points).
 * Same unified ChartEngineProps contract as the sales engine.
 * Rendering uses per-pixel-column min/max decimation so spikes survive
 * downsampling; hover snaps a crosshair to the nearest timestamp.
 */
export default function MonitoringChart({
  series,
  height = 320,
  formatValue,
  formatTime,
  formatAxis,
  formatTimeAxis,
}: ChartEngineProps) {
  const [wrapRef, {width}] = useMeasure<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dark = usePrefersDark();
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const axis = formatAxis ?? formatValue;
  const timeAxis = formatTimeAxis ?? formatTime;

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const visible = useMemo(() => series.filter((s) => !hidden.has(s.id)), [series, hidden]);

  const model = useMemo(() => {
    const pts = series[0]?.points ?? [];
    if (!pts.length || !plotW || !plotH) return null;
    const maxV = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.v)));
    const {yMax, ticks} = niceScale(maxV);
    const t0 = pts[0].t;
    const t1 = pts[pts.length - 1].t;
    const x = (t: number) => ((t - t0) / (t1 - t0 || 1)) * plotW;
    const y = (v: number) => plotH - (v / yMax) * plotH;
    const xTicks = Array.from({length: X_TICKS}, (_, i) => t0 + ((t1 - t0) * i) / (X_TICKS - 1));
    return {pts, yMax, ticks, x, y, xTicks};
  }, [series, plotW, plotH]);

  // Canvas paint: grid + one batched path per series (column min/max strips).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !model) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(plotW * dpr);
    canvas.height = Math.round(plotH * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const ch = chrome(dark);

    ctx.strokeStyle = ch.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const tv of model.ticks) {
      const gy = Math.round(model.y(tv)) + 0.5;
      ctx.moveTo(0, gy);
      ctx.lineTo(plotW, gy);
    }
    ctx.stroke();

    const columns = Math.max(1, Math.floor(plotW));
    series.forEach((s, si) => {
      if (hidden.has(s.id)) return;
      const n = s.points.length;
      ctx.strokeStyle = seriesColor(si, dark);
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let col = 0; col < columns; col++) {
        const i0 = Math.floor((col * n) / columns);
        const i1 = Math.max(i0 + 1, Math.floor(((col + 1) * n) / columns));
        let lo = Infinity;
        let hi = -Infinity;
        for (let i = i0; i < i1 && i < n; i++) {
          const v = s.points[i].v;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        const px = col + 0.5;
        ctx.moveTo(px, model.y(lo));
        ctx.lineTo(px, model.y(hi));
      }
      ctx.stroke();
    });
  }, [model, series, hidden, dark, plotW, plotH]);

  const toggle = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < series.length - 1) next.add(id); // keep >= 1 visible
      return next;
    });

  const hoverT = hover !== null && model ? model.pts[hover]?.t : undefined;

  return (
    <div>
      {/* legend: >= 2 series → always present; click toggles a series */}
      <div className="ck-legend">
        {series.map((s, si) => (
          <button
            key={s.id}
            type="button"
            className="ck-legend__item"
            aria-pressed={!hidden.has(s.id)}
            data-off={hidden.has(s.id) || undefined}
            onClick={() => toggle(s.id)}
          >
            <span className="ck-legend__key" style={{background: seriesColor(si, dark)}} />
            <span>{s.name}</span>
          </button>
        ))}
      </div>
      <div
        ref={wrapRef}
        className="ck-chart"
        style={{height}}
        onPointerLeave={() => setHover(null)}
      >
        {model && (
          <>
            {/* y axis labels */}
            {model.ticks.map((tv) => (
              <span
                key={tv}
                className="ck-axis-label ck-axis-label--abs"
                style={{top: MARGIN.top + model.y(tv) - 7, left: 0, width: MARGIN.left - 8, textAlign: 'right'}}
              >
                {axis(tv)}
              </span>
            ))}
            {/* x axis labels */}
            {model.xTicks.map((tv, i) => (
              <span
                key={i}
                className="ck-axis-label ck-axis-label--abs"
                style={{
                  bottom: 4,
                  left: MARGIN.left + model.x(tv),
                  transform: i === 0 ? 'none' : i === model.xTicks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                }}
              >
                {timeAxis(tv)}
              </span>
            ))}
            <canvas
              ref={canvasRef}
              style={{position: 'absolute', left: MARGIN.left, top: MARGIN.top, width: plotW, height: plotH}}
            />
            {/* crosshair overlay */}
            <svg
              style={{position: 'absolute', left: MARGIN.left, top: MARGIN.top, pointerEvents: 'none'}}
              width={plotW}
              height={plotH}
            >
              {hover !== null && hoverT !== undefined && (
                <g>
                  <line
                    className="ck-crosshair"
                    x1={model.x(hoverT)}
                    x2={model.x(hoverT)}
                    y1={0}
                    y2={plotH}
                  />
                  {visible.map((s) => (
                    <circle
                      key={s.id}
                      cx={model.x(hoverT)}
                      cy={model.y(s.points[hover]?.v ?? 0)}
                      r={4}
                      fill={seriesColor(series.indexOf(s), dark)}
                      className="ck-ring"
                    />
                  ))}
                </g>
              )}
            </svg>
            {/* hover target */}
            <div
              style={{position: 'absolute', left: MARGIN.left, top: MARGIN.top, width: plotW, height: plotH}}
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const frac = (e.clientX - rect.left) / plotW;
                const idx = Math.round(frac * (model.pts.length - 1));
                setHover(Math.max(0, Math.min(model.pts.length - 1, idx)));
              }}
            />
            {hover !== null && hoverT !== undefined && (
              <ChartTooltip
                x={MARGIN.left + model.x(hoverT)}
                y={MARGIN.top + 8}
                containerWidth={width}
                title={formatTime(hoverT)}
                entries={visible.map((s) => ({
                  color: seriesColor(series.indexOf(s), dark),
                  name: s.name,
                  value: formatValue(s.points[hover]?.v ?? NaN),
                }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
