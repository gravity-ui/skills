import React from 'react';
import { Button, useThemeType } from '@gravity-ui/uikit';

import './LineChart.css';

export interface LineSeries {
  name: string;
  values: number[];
}

export interface LineChartProps {
  title: string;
  subtitle?: string;
  categories: string[];
  series: LineSeries[]; // max 3 — validated palette slots
  height?: number;
}

const MARGIN = { top: 12, right: 88, bottom: 28, left: 44 };
const SERIES_VARS = ['--lc-series-1', '--lc-series-2', '--lc-series-3'];
const fmt = new Intl.NumberFormat('ru-RU');

function niceMax(max: number) {
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const f = max / exp;
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return step * exp;
}

export function LineChart({ title, subtitle, categories, series, height = 320 }: LineChartProps) {
  // Follows the app theme: 'light' | 'dark' (hc variants map to their base).
  const themeType = useThemeType();

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(640);
  const [active, setActive] = React.useState<number | null>(null);
  const [showTable, setShowTable] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [showTable]);

  const n = categories.length;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const yMax = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const yTicks = [0, 1, 2, 3, 4].map((i) => (yMax / 4) * i);
  const x = (i: number) => MARGIN.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => MARGIN.top + innerH - (v / yMax) * innerH;

  // Direct labels only when end points don't collide; legend + tooltip carry the rest.
  const endYs = series.map((s) => y(s.values[n - 1]));
  const labelFits = (idx: number) => endYs.every((ey, j) => j === idx || Math.abs(ey - endYs[idx]) >= 16);

  const pickIndex = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left - MARGIN.left;
    return Math.min(n - 1, Math.max(0, Math.round((px / innerW) * (n - 1))));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else if (e.key === 'Escape') setActive(null);
    else return;
    e.preventDefault();
  };

  const tooltipLeft =
    active === null ? 0 : x(active) > width / 2 ? x(active) - 12 : x(active) + 12;
  const tooltipFlip = active !== null && x(active) > width / 2;

  return (
    <div className="line-chart" data-theme={themeType}>
      <div className="line-chart__header">
        <div>
          <h3 className="line-chart__title">{title}</h3>
          {subtitle && <p className="line-chart__subtitle">{subtitle}</p>}
        </div>
        <Button view="outlined" size="s" onClick={() => setShowTable((v) => !v)}>
          {showTable ? 'График' : 'Таблица'}
        </Button>
      </div>

      <ul className="line-chart__legend" aria-label="Легенда">
        {series.map((s, i) => (
          <li key={s.name}>
            <span className="line-chart__key" style={{ color: `var(${SERIES_VARS[i]})` }} />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>

      <div ref={wrapRef} className="line-chart__plot">
        {showTable ? (
          <table className="line-chart__table">
            <thead>
              <tr>
                <th scope="col" />
                {series.map((s) => (
                  <th key={s.name} scope="col">
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c}>
                  <td>{c}</td>
                  {series.map((s) => (
                    <td key={s.name}>{fmt.format(s.values[i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              role="img"
              aria-label={`${title}. Стрелки влево и вправо — перемещение по точкам.`}
              tabIndex={0}
              onKeyDown={onKeyDown}
              onBlur={() => setActive(null)}
              onPointerMove={(e) => setActive(pickIndex(e.clientX, e.currentTarget.getBoundingClientRect()))}
              onPointerLeave={() => setActive(null)}
            >
              {yTicks.map((t) => (
                <g key={t}>
                  {t > 0 && (
                    <line className="line-chart__grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} />
                  )}
                  <text className="line-chart__tick" x={MARGIN.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle">
                    {fmt.format(t)}
                  </text>
                </g>
              ))}
              <line
                className="line-chart__baseline"
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(0)}
                y2={y(0)}
              />

              {categories.map((c, i) => {
                // thin out x labels so they never overlap
                const every = Math.ceil(n / Math.max(1, Math.floor(innerW / 56)));
                return i % every === 0 ? (
                  <text key={c} className="line-chart__tick" x={x(i)} y={height - 8} textAnchor="middle">
                    {c}
                  </text>
                ) : null;
              })}

              {active !== null && (
                <line className="line-chart__crosshair" x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={y(0)} />
              )}

              {series.map((s, si) => (
                <path
                  key={s.name}
                  className="line-chart__line"
                  stroke={`var(${SERIES_VARS[si]})`}
                  d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')}
                />
              ))}

              {series.map((s, si) => {
                const i = active ?? n - 1;
                return (
                  <circle
                    key={s.name}
                    className="line-chart__dot"
                    cx={x(i)}
                    cy={y(s.values[i])}
                    r={5}
                    fill={`var(${SERIES_VARS[si]})`}
                  />
                );
              })}

              {series.map(
                (s, si) =>
                  labelFits(si) && (
                    <text
                      key={s.name}
                      className="line-chart__end-label"
                      x={x(n - 1) + 12}
                      y={endYs[si]}
                      dominantBaseline="middle"
                    >
                      {fmt.format(s.values[n - 1])}
                    </text>
                  ),
              )}
            </svg>

            {active !== null && (
              <div
                className="line-chart__tooltip"
                role="status"
                style={{
                  left: tooltipLeft,
                  transform: tooltipFlip ? 'translateX(-100%)' : undefined,
                }}
              >
                <div className="line-chart__tooltip-title">{categories[active]}</div>
                {series.map((s, si) => (
                  <div key={s.name} className="line-chart__tooltip-row">
                    <span className="line-chart__key" style={{ color: `var(${SERIES_VARS[si]})` }} />
                    <span className="line-chart__tooltip-name">{s.name}</span>
                    <span className="line-chart__tooltip-value">{fmt.format(s.values[active])}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
