import React from 'react';
import { useThemeType } from '@gravity-ui/uikit';
import './ThemedLineChart.css';

export type Series = { name: string; values: number[] };

export type ThemedLineChartProps = {
  title: string;
  /** X-axis labels, one per data point. */
  categories: string[];
  series: Series[];
  height?: number;
  /** Optional value formatter for tooltip / table / axis. */
  format?: (v: number) => string;
};

const M = { top: 12, right: 16, bottom: 28, left: 44 };
const defaultFormat = (v: number) => v.toLocaleString('ru-RU');

function niceTicks(max: number, count = 4): number[] {
  const rough = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? pow * 10;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

export function ThemedLineChart({
  title,
  categories,
  series,
  height = 280,
  format = defaultFormat,
}: ThemedLineChartProps) {
  // The chart colors come from CSS variables scoped by data-theme, so they
  // switch together with the Gravity UI theme (light / dark).
  const themeType = useThemeType();

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(640);
  const [hover, setHover] = React.useState<number | null>(null);
  const [showTable, setShowTable] = React.useState(false);

  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = categories.length;
  const innerW = width - M.left - M.right;
  const innerH = height - M.top - M.bottom;
  const dataMax = Math.max(...series.flatMap((s) => s.values), 1);
  const ticks = niceTicks(dataMax);
  const yMax = ticks[ticks.length - 1];
  const x = (i: number) => M.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v: number) => M.top + innerH - (v / yMax) * innerH;

  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(innerW / 64))));

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(n - 1, Math.max(0, Math.round(rel * (n - 1)))));
  };

  const tipLeft = hover === null ? 0 : x(hover);
  const flip = hover !== null && tipLeft > width * 0.6;

  return (
    <figure className="tlc" data-theme={themeType} ref={wrapRef}>
      <figcaption className="tlc__head">
        <span className="tlc__title">{title}</span>
        <button
          type="button"
          className="tlc__toggle"
          aria-pressed={showTable}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'График' : 'Таблица'}
        </button>
      </figcaption>

      {series.length > 1 && (
        <ul className="tlc__legend">
          {series.map((s, i) => (
            <li key={s.name}>
              <span className="tlc__key" style={{ background: `var(--tlc-series-${i + 1})` }} />
              {s.name}
            </li>
          ))}
        </ul>
      )}

      {showTable ? (
        <div className="tlc__tablewrap" style={{ maxHeight: height }}>
          <table className="tlc__table">
            <thead>
              <tr>
                <th />
                {series.map((s) => (
                  <th key={s.name}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c, i) => (
                <tr key={c}>
                  <th scope="row">{c}</th>
                  {series.map((s) => (
                    <td key={s.name}>{format(s.values[i])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tlc__plot" style={{ height }}>
          <svg width={width} height={height} role="img" aria-label={title}>
            {/* grid + y labels */}
            {ticks.map((t) => (
              <g key={t}>
                <line
                  className={t === 0 ? 'tlc__axis' : 'tlc__grid'}
                  x1={M.left}
                  x2={width - M.right}
                  y1={y(t)}
                  y2={y(t)}
                />
                <text className="tlc__tick" x={M.left - 8} y={y(t)} textAnchor="end" dy="0.32em">
                  {format(t)}
                </text>
              </g>
            ))}
            {categories.map((c, i) =>
              i % labelEvery === 0 ? (
                <text key={c} className="tlc__tick" x={x(i)} y={height - 8} textAnchor="middle">
                  {c}
                </text>
              ) : null,
            )}

            {/* crosshair */}
            {hover !== null && (
              <line className="tlc__cross" x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + innerH} />
            )}

            {/* lines */}
            {series.map((s, si) => (
              <path
                key={s.name}
                className="tlc__line"
                style={{ stroke: `var(--tlc-series-${si + 1})` }}
                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('')}
              />
            ))}

            {/* end dot (always) and hover dots, with surface ring */}
            {series.map((s, si) => {
              const i = hover ?? n - 1;
              return (
                <circle
                  key={s.name}
                  className="tlc__dot"
                  style={{ fill: `var(--tlc-series-${si + 1})` }}
                  cx={x(i)}
                  cy={y(s.values[i])}
                  r={4}
                />
              );
            })}

            {/* hit layer */}
            <rect
              x={M.left}
              y={M.top}
              width={innerW}
              height={innerH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>

          {hover !== null && (
            <div
              className="tlc__tip"
              role="status"
              style={{ left: tipLeft, transform: `translateX(${flip ? 'calc(-100% - 12px)' : '12px'})` }}
            >
              <div className="tlc__tipcat">{categories[hover]}</div>
              {series.map((s, si) => (
                <div className="tlc__tiprow" key={s.name}>
                  <span className="tlc__tipkey" style={{ background: `var(--tlc-series-${si + 1})` }} />
                  <strong>{format(s.values[hover])}</strong>
                  <span className="tlc__tipname">{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
