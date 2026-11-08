import * as React from 'react';
import { useThemeType } from '@gravity-ui/uikit';

import { CHROME, getSeriesColors } from './chartTheme';
import type { Series } from './data';
import './LineChart.css';

type Props = {
  categories: string[];
  series: Series[];
  formatValue: (n: number) => string;
  /** Высота области построения без полосы оси X. */
  plotHeight?: number;
  ariaLabel: string;
};

const MARGIN = { top: 16, right: 72, bottom: 32, left: 56 };
const LINE_WIDTH = 2;
const MARKER_R = 4;
const RING_WIDTH = 2;
const END_LABEL_MIN_GAP = 14;

function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? pow * 10;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return ticks;
}

function useWidth(ref: React.RefObject<HTMLElement>, fallback = 640) {
  const [width, setWidth] = React.useState(fallback);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(Math.max(240, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

export function LineChart({ categories, series, formatValue, plotHeight = 260, ariaLabel }: Props) {
  const themeType = useThemeType();
  const colors = getSeriesColors(themeType);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const width = useWidth(rootRef);
  const height = plotHeight + MARGIN.top + MARGIN.bottom;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = plotHeight;

  const [active, setActive] = React.useState<number | null>(null);
  const [hoverSeries, setHoverSeries] = React.useState<string | null>(null);

  const n = categories.length;
  const maxValue = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1];

  const x = (i: number) => MARGIN.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2);
  const y = (v: number) => MARGIN.top + innerH - (v / yMax) * innerH;

  const paths = series.map((s) => s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '));

  // Подписи на концах линий: оставляем только те, что не наезжают друг на друга;
  // остальные читаются по легенде и тултипу.
  const endLabels = React.useMemo(() => {
    const ends = series
      .map((s, idx) => ({ idx, value: s.values[n - 1], y: y(s.values[n - 1]) }))
      .sort((a, b) => a.y - b.y);
    const visible = new Set<number>();
    let lastY = -Infinity;
    for (const e of ends) {
      if (e.y - lastY >= END_LABEL_MIN_GAP) {
        visible.add(e.idx);
        lastY = e.y;
      }
    }
    return visible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, n, yMax, innerH]);

  const indexFromClientX = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || n === 0) return null;
    const px = clientX - rect.left - MARGIN.left;
    const i = Math.round((px / innerW) * (n - 1));
    return Math.min(n - 1, Math.max(0, i));
  };

  const onPointerMove = (e: React.PointerEvent) => setActive(indexFromClientX(e.clientX));
  const onPointerLeave = () => setActive(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setActive((cur) => {
        const base = cur ?? (e.key === 'ArrowRight' ? -1 : n);
        const next = base + (e.key === 'ArrowRight' ? 1 : -1);
        return Math.min(n - 1, Math.max(0, next));
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === 'Escape') {
      setActive(null);
    }
  };

  // Тултип: слева от перекрестия у правого края, иначе справа.
  const tooltipStyle: React.CSSProperties | undefined =
    active === null
      ? undefined
      : (() => {
          const cx = x(active);
          const flip = cx > MARGIN.left + innerW * 0.6;
          return {
            transform: `translate(${flip ? 'calc(-100% - 12px)' : '12px'}, 0)`,
            left: cx,
            top: MARGIN.top,
          };
        })();

  const summary = `${ariaLabel}. ${series.map((s) => `${s.name}: от ${formatValue(Math.min(...s.values))} до ${formatValue(Math.max(...s.values))}`).join('; ')}.`;

  return (
    <div className="line-chart">
      <ul className="line-chart__legend" aria-label="Легенда">
        {series.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              className="line-chart__legend-item"
              onPointerEnter={() => setHoverSeries(s.id)}
              onPointerLeave={() => setHoverSeries(null)}
              onFocus={() => setHoverSeries(s.id)}
              onBlur={() => setHoverSeries(null)}
            >
              <span className="line-chart__legend-key" style={{ background: colors[i] }} aria-hidden="true" />
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      <div
        ref={rootRef}
        className="line-chart__plot"
        tabIndex={0}
        role="img"
        aria-label={summary}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onFocus={() => setActive((cur) => cur ?? n - 1)}
      >
        <svg
          className="line-chart__svg"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          onPointerLeave={onPointerLeave}
          aria-hidden="true"
        >
          {/* Сетка и подписи оси Y */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + innerW}
                y1={y(t)}
                y2={y(t)}
                stroke={t === 0 ? CHROME.axis : CHROME.grid}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text className="line-chart__tick" x={MARGIN.left - 8} y={y(t)} dy="0.35em" textAnchor="end">
                {formatValue(t)}
              </text>
            </g>
          ))}

          {/* Подписи оси X */}
          {categories.map((c, i) => (
            <text
              key={c}
              className="line-chart__tick"
              x={x(i)}
              y={MARGIN.top + innerH + 20}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            >
              {c}
            </text>
          ))}

          {/* Перекрестие */}
          {active !== null && (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              stroke={CHROME.crosshair}
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          )}

          {/* Линии */}
          {series.map((s, i) => {
            const dimmed = hoverSeries !== null && hoverSeries !== s.id;
            const last = n - 1;
            return (
              <g key={s.id} className={`line-chart__series${dimmed ? ' line-chart__series_dimmed' : ''}`}>
                <path d={paths[i]} fill="none" stroke={colors[i]} strokeWidth={LINE_WIDTH} strokeLinejoin="round" strokeLinecap="round" />
                {/* Маркер на конце линии с кольцом цвета поверхности */}
                <circle cx={x(last)} cy={y(s.values[last])} r={MARKER_R} fill={colors[i]} stroke={CHROME.surface} strokeWidth={RING_WIDTH} />
                {endLabels.has(i) && (
                  <text className="line-chart__end-label" x={x(last) + 10} y={y(s.values[last])} dy="0.35em">
                    {formatValue(s.values[last])}
                  </text>
                )}
                {/* Маркер в активной точке */}
                {active !== null && active !== last && (
                  <circle cx={x(active)} cy={y(s.values[active])} r={MARKER_R} fill={colors[i]} stroke={CHROME.surface} strokeWidth={RING_WIDTH} />
                )}
              </g>
            );
          })}
        </svg>

        {active !== null && (
          <div className="line-chart__tooltip" style={tooltipStyle} role="status" aria-live="polite">
            <div className="line-chart__tooltip-title">{categories[active]}</div>
            {series.map((s, i) => (
              <div key={s.id} className="line-chart__tooltip-row">
                <span className="line-chart__tooltip-key" style={{ background: colors[i] }} aria-hidden="true" />
                <span className="line-chart__tooltip-name">{s.name}</span>
                <span className="line-chart__tooltip-value">{formatValue(s.values[active])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
