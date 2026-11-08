import React from 'react';
import { Table, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import type { LineChartData, LineSeries } from './chartData';
import './ThemedLineChart.css';

/**
 * Series colors are Gravity UI palette steps, chosen separately for each theme
 * (the dark set is NOT a flipped light set — it is re-stepped for the dark surface)
 * and validated for CVD separation and >= 3:1 contrast against the theme surface:
 *   light surface #ffffff → blue-650 / orange-650 / purple-650
 *   dark  surface #221d22 → blue-500 / orange-600 / purple-600
 */
const SERIES_PALETTE: Record<ThemeType, string[]> = {
  light: ['#327fc8', '#d36507', '#7947aa'],
  dark: ['#348bdc', '#ce7324', '#9a63d1'],
};

const MARGIN = { top: 16, right: 84, bottom: 32, left: 48 };
const PLOT_HEIGHT = 280;
const END_LABEL_GAP = 16;

interface Props {
  data: LineChartData;
  /** 'chart' renders the SVG; 'table' renders the same data as a Gravity Table. */
  view?: 'chart' | 'table';
}

const formatValue = (value: number) => value.toLocaleString('ru-RU');

/** Evenly spaced "nice" ticks from zero to at least max. */
function niceTicks(max: number, count = 5): number[] {
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  const step = niceResidual * magnitude;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return ticks;
}

function useContainerWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(node.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Push end labels apart when lines converge; each moved label gets a leader line. */
function layoutEndLabels(ys: number[]): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const placed = order.map((o) => o.y);
  for (let k = 1; k < placed.length; k++) {
    if (placed[k] - placed[k - 1] < END_LABEL_GAP) placed[k] = placed[k - 1] + END_LABEL_GAP;
  }
  const result = new Array<number>(ys.length);
  order.forEach((o, k) => {
    result[o.i] = placed[k];
  });
  return result;
}

export function ThemedLineChart({ data, view = 'chart' }: Props) {
  const themeType = useThemeType();
  const palette = SERIES_PALETTE[themeType];
  const colorOf = React.useCallback(
    (series: LineSeries) => palette[data.series.findIndex((s) => s.id === series.id) % palette.length],
    [palette, data.series],
  );

  if (view === 'table') {
    return <DataTable data={data} colorOf={colorOf} />;
  }
  return <LinePlot data={data} colorOf={colorOf} />;
}

interface PlotProps {
  data: LineChartData;
  colorOf: (series: LineSeries) => string;
}

function LinePlot({ data, colorOf }: PlotProps) {
  const [containerRef, width] = useContainerWidth<HTMLDivElement>();
  const [active, setActive] = React.useState<number | null>(null);
  const titleId = React.useId();

  const { categories, series } = data;
  const n = categories.length;
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const height = MARGIN.top + PLOT_HEIGHT + MARGIN.bottom;

  const maxValue = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(maxValue);
  const yMax = ticks[ticks.length - 1];

  const x = (i: number) => MARGIN.left + (n === 1 ? plotWidth / 2 : (plotWidth * i) / (n - 1));
  const y = (v: number) => MARGIN.top + PLOT_HEIGHT - (v / yMax) * PLOT_HEIGHT;

  const endYs = series.map((s) => y(s.values[n - 1]));
  const labelYs = layoutEndLabels(endYs);

  const indexFromClientX = (clientX: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left - MARGIN.left;
    const step = n > 1 ? plotWidth / (n - 1) : plotWidth;
    return Math.min(n - 1, Math.max(0, Math.round(px / step)));
  };

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      setActive((prev) => Math.min(n - 1, Math.max(0, (prev ?? (delta > 0 ? -1 : n)) + delta)));
    } else if (e.key === 'Escape') {
      setActive(null);
    }
  };

  const tooltipLeft = active === null ? 0 : x(active);
  const tooltipOnLeft = active !== null && tooltipLeft > width / 2;

  return (
    <div className="tlc" ref={containerRef}>
      <ul className="tlc__legend" aria-label="Серии">
        {series.map((s) => (
          <li key={s.id} className="tlc__legend-item">
            <span className="tlc__legend-key" style={{ background: colorOf(s) }} aria-hidden="true" />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>

      {width > 0 && (
        <svg
          className="tlc__svg"
          width={width}
          height={height}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
        >
          <title id={titleId}>{`${data.title}. ${data.subtitle}`}</title>

          {/* gridlines + y ticks */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                className={t === 0 ? 'tlc__axis' : 'tlc__grid'}
                x1={MARGIN.left}
                x2={MARGIN.left + plotWidth}
                y1={y(t)}
                y2={y(t)}
              />
              <text className="tlc__tick" x={MARGIN.left - 8} y={y(t)} dy="0.35em" textAnchor="end">
                {formatValue(t)}
              </text>
            </g>
          ))}

          {/* x ticks */}
          {categories.map((c, i) => (
            <text
              key={c}
              className="tlc__tick"
              x={x(i)}
              y={MARGIN.top + PLOT_HEIGHT + 20}
              textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
            >
              {c}
            </text>
          ))}

          {/* crosshair */}
          {active !== null && (
            <line
              className="tlc__crosshair"
              x1={x(active)}
              x2={x(active)}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_HEIGHT}
            />
          )}

          {/* lines */}
          {series.map((s) => (
            <path
              key={s.id}
              className="tlc__line"
              stroke={colorOf(s)}
              d={s.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ')}
            />
          ))}

          {/* end markers + direct labels */}
          {series.map((s, k) => {
            const ex = x(n - 1);
            const ey = endYs[k];
            const ly = labelYs[k];
            const moved = Math.abs(ly - ey) > 0.5;
            return (
              <g key={s.id}>
                {moved && (
                  <line className="tlc__leader" x1={ex + 6} y1={ey} x2={ex + 12} y2={ly} />
                )}
                <circle className="tlc__dot" cx={ex} cy={ey} r={4} fill={colorOf(s)} />
                <text className="tlc__end-label" x={ex + 14} y={ly} dy="0.35em">
                  {`${s.name} ${formatValue(s.values[n - 1])}`}
                </text>
              </g>
            );
          })}

          {/* hover dots */}
          {active !== null &&
            series.map((s) => (
              <circle
                key={s.id}
                className="tlc__dot"
                cx={x(active)}
                cy={y(s.values[active])}
                r={4}
                fill={colorOf(s)}
              />
            ))}

          {/* hit area — the whole plot, so the pointer finds the X, not the 2px line */}
          <rect
            className="tlc__hit"
            x={MARGIN.left - 12}
            y={MARGIN.top - 12}
            width={plotWidth + 24}
            height={PLOT_HEIGHT + 24}
            onPointerMove={(e) => setActive(indexFromClientX(e.clientX, e.currentTarget.ownerSVGElement!))}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}

      {active !== null && (
        <div
          className="tlc__tooltip"
          role="status"
          style={{
            transform: `translate(${tooltipOnLeft ? 'calc(-100% - 12px)' : '12px'}, 0)`,
            left: tooltipLeft,
            top: MARGIN.top + 40,
          }}
        >
          <div className="tlc__tooltip-title">{categories[active]}</div>
          {series.map((s) => (
            <div key={s.id} className="tlc__tooltip-row">
              <span className="tlc__tooltip-key" style={{ background: colorOf(s) }} aria-hidden="true" />
              <span className="tlc__tooltip-value">{formatValue(s.values[active])}</span>
              <span className="tlc__tooltip-name">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Row {
  category: string;
  [seriesId: string]: string | number;
}

function DataTable({ data, colorOf }: PlotProps) {
  const rows: Row[] = data.categories.map((category, i) => {
    const row: Row = { category };
    data.series.forEach((s) => {
      row[s.id] = s.values[i];
    });
    return row;
  });

  const columns = [
    { id: 'category', name: 'Месяц' },
    ...data.series.map((s) => ({
      id: s.id,
      name: () => (
        <span className="tlc__legend-item">
          <span className="tlc__legend-key" style={{ background: colorOf(s) }} aria-hidden="true" />
          {`${s.name}, ${data.unit}`}
        </span>
      ),
      align: 'end' as const,
      template: (row: Row) => <span className="tlc__table-value">{formatValue(row[s.id] as number)}</span>,
    })),
  ];

  return (
    <div className="tlc">
      <Table data={rows} columns={columns} width="max" />
    </div>
  );
}
