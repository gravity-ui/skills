import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useElementSize } from '../useElementSize';
import { fmtDayLong, fmtDayShort, fmtInt } from '../format';
import { DataTable } from './DataTable';

export interface LineSeries {
  key: string;
  name: string;
  color: string; // CSS color, usually a var() categorical slot
  values: number[];
}

interface Props {
  caption: string;
  dates: Date[];
  series: LineSeries[];
  view: 'chart' | 'table';
}

const M = { top: 12, right: 56, bottom: 26, left: 44 };
const END_LABEL_MIN_GAP = 14; // px; closer end labels are dropped, values stay in tooltip/table

/** Round axis top and tick step, one of 1/2/5/10 x 10^n. */
export function niceScale(max: number, count = 4): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 1, ticks: [0, 1] };
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v));
  return { top, ticks };
}

export function LineChart({ caption, dates, series, view }: Props) {
  const [ref, { width, height }] = useElementSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const n = dates.length;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = Math.max(0, height - M.top - M.bottom);
  const xStep = n > 1 ? plotW / (n - 1) : 0;
  const max = Math.max(0, ...series.flatMap((s) => s.values));
  const scale = niceScale(max);

  const x = (i: number) => M.left + i * xStep;
  const y = (v: number) => M.top + plotH * (1 - v / scale.top);

  const clampIdx = (i: number) => Math.min(n - 1, Math.max(0, i));

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (n === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    setActive(xStep > 0 ? clampIdx(Math.round((px - M.left) / xStep)) : 0);
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    const cur = active ?? n - 1;
    if (e.key === 'ArrowLeft') setActive(clampIdx(cur - 1));
    else if (e.key === 'ArrowRight') setActive(clampIdx(cur + 1));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(n - 1);
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };

  // Ticks: at most one label per ~84px so dates never collide.
  const maxLabels = Math.max(2, Math.floor(plotW / 84));
  const every = Math.max(1, Math.ceil((n - 1) / (maxLabels - 1)));
  const xTicks: number[] = [];
  for (let i = 0; i < n; i += every) xTicks.push(i);

  // Direct end labels: greedy, highest first, skipping any that would collide.
  const endLabels: { key: string; y: number; text: string }[] = [];
  const ends = series
    .map((s) => ({ key: s.key, y: y(s.values[n - 1] ?? 0), text: fmtInt(s.values[n - 1] ?? 0) }))
    .sort((a, b) => a.y - b.y);
  for (const e of ends) {
    const last = endLabels[endLabels.length - 1];
    if (!last || e.y - last.y >= END_LABEL_MIN_GAP) endLabels.push(e);
  }

  const tableRows = dates
    .map((d, i) => [fmtDayLong(d), ...series.map((s) => fmtInt(s.values[i]))])
    .reverse();

  const tipOnLeft = active !== null && x(active) > width * 0.5;

  return (
    <>
      <ul className="legend" aria-label="Легенда">
        {series.map((s) => (
          <li key={s.key}>
            <span className="legend-key legend-key-line" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
      <div className="line-chart" ref={ref}>
      {view === 'table' ? (
        <DataTable caption={caption} head={['Дата', ...series.map((s) => s.name)]} rows={tableRows} />
      ) : (
        width > 0 &&
        height > 0 && (
          <>
            <svg
              width={width}
              height={height}
              className="lc-svg"
              role="img"
              aria-label={`${caption}. Стрелки влево и вправо переключают дату.`}
              tabIndex={0}
              onPointerMove={onPointerMove}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive((a) => a ?? n - 1)}
              onBlur={() => setActive(null)}
              onKeyDown={onKeyDown}
            >
              {scale.ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={M.left}
                    x2={width - M.right}
                    y1={y(t)}
                    y2={y(t)}
                    className={t === 0 ? 'lc-base' : 'lc-grid'}
                  />
                  <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="lc-tick">
                    {fmtInt(t)}
                  </text>
                </g>
              ))}

              {xTicks.map((i) => (
                <text
                  key={i}
                  x={x(i)}
                  y={height - 6}
                  textAnchor={i === 0 ? 'start' : 'middle'}
                  className="lc-tick"
                >
                  {fmtDayShort(dates[i])}
                </text>
              ))}

              {series.map((s) => (
                <path
                  key={s.key}
                  className="lc-line"
                  style={{ stroke: s.color }}
                  d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')}
                />
              ))}

              {series.map((s) => (
                <circle
                  key={`end-${s.key}`}
                  cx={x(n - 1)}
                  cy={y(s.values[n - 1] ?? 0)}
                  r={4}
                  className="lc-dot"
                  style={{ fill: s.color }}
                />
              ))}

              {endLabels.map((e) => (
                <text key={e.key} x={x(n - 1) + 10} y={e.y} dy="0.32em" className="lc-end">
                  {e.text}
                </text>
              ))}

              {active !== null && (
                <g>
                  <line x1={x(active)} x2={x(active)} y1={M.top} y2={M.top + plotH} className="lc-cross" />
                  {series.map((s) => (
                    <circle
                      key={`hover-${s.key}`}
                      cx={x(active)}
                      cy={y(s.values[active])}
                      r={4}
                      className="lc-dot"
                      style={{ fill: s.color }}
                    />
                  ))}
                </g>
              )}
            </svg>

            {active !== null && (
              <div
                className="tip lc-tip"
                style={{
                  left: tipOnLeft ? x(active) - 12 : x(active) + 12,
                  top: M.top,
                  transform: tipOnLeft ? 'translateX(-100%)' : undefined,
                }}
              >
                <div className="tip-title">{fmtDayLong(dates[active])}</div>
                {series.map((s) => (
                  <div className="tip-row" key={s.key}>
                    <span className="tip-key tip-key-line" style={{ background: s.color }} />
                    <span className="tip-name">{s.name}</span>
                    <strong className="tip-value">{fmtInt(s.values[active])}</strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )
      )}
      </div>
    </>
  );
}
