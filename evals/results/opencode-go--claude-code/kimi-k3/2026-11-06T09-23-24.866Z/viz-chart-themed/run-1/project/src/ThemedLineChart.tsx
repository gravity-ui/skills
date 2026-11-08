import * as React from 'react';

import './ThemedLineChart.css';

export interface LineChartDatum {
  /** Category label on the X axis (e.g. a month). */
  x: string;
  /** Numeric value on the Y axis. */
  y: number;
}

export interface ThemedLineChartProps {
  data: LineChartDatum[];
  /** Names the single series — doubles as the accessible chart name. */
  title: string;
  /** Unit suffix shown in the tooltip / direct label (e.g. "тыс."). */
  unit?: string;
}

const WIDTH = 720;
const HEIGHT = 320;
const MARGIN = {top: 20, right: 64, bottom: 36, left: 48};

const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const TICK_COUNT = 4;

/** Round `rawStep` up to a 1/2/2.5/5/10 × 10^n "nice" step. */
function niceStep(rawStep: number): number {
  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const fraction = rawStep / power;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return niceFraction * power;
}

function formatValue(value: number): string {
  return value.toLocaleString('ru-RU', {maximumFractionDigits: 1});
}

export function ThemedLineChart({data, title, unit = ''}: ThemedLineChartProps) {
  const [hoverIndex, setHoverIndex] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const count = data.length;
  const maxValue = Math.max(...data.map((d) => d.y), 0);
  const step = niceStep(maxValue / TICK_COUNT || 1);
  const yMax = step * TICK_COUNT;

  const xAt = (index: number) => MARGIN.left + (PLOT_WIDTH * index) / (count - 1);
  const yAt = (value: number) => MARGIN.top + PLOT_HEIGHT * (1 - value / yMax);

  const ticks = Array.from({length: TICK_COUNT + 1}, (_, i) => i * step);
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(d.y)}`).join(' ');

  const lastIndex = count - 1;

  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = (svgX - MARGIN.left) / PLOT_WIDTH;
    const index = Math.round(ratio * (count - 1));
    setHoverIndex(Math.max(0, Math.min(count - 1, index)));
  };

  const hovered = hoverIndex === null ? null : data[hoverIndex];
  const tooltipPlacement =
    hoverIndex === null ? '' : hoverIndex < 2 ? 'start' : hoverIndex > count - 3 ? 'end' : '';

  return (
    <div className="themed-line-chart">
      <svg
        ref={svgRef}
        className="themed-line-chart__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}: линейный график, ${count} точек`}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Recessive horizontal gridlines */}
        {ticks.map((tick) => (
          <line
            key={`grid-${tick}`}
            className="themed-line-chart__grid"
            x1={MARGIN.left}
            x2={WIDTH - MARGIN.right}
            y1={yAt(tick)}
            y2={yAt(tick)}
          />
        ))}

        {/* Baseline axis */}
        <line
          className="themed-line-chart__axis"
          x1={MARGIN.left}
          x2={WIDTH - MARGIN.right}
          y1={yAt(0)}
          y2={yAt(0)}
        />

        {/* Y tick labels */}
        {ticks.map((tick) => (
          <text
            key={`ytick-${tick}`}
            className="themed-line-chart__tick"
            x={MARGIN.left - 10}
            y={yAt(tick) + 4}
            textAnchor="end"
          >
            {formatValue(tick)}
          </text>
        ))}

        {/* X tick labels */}
        {data.map((d, i) => (
          <text
            key={`xtick-${d.x}`}
            className="themed-line-chart__tick"
            x={xAt(i)}
            y={HEIGHT - 10}
            textAnchor="middle"
          >
            {d.x}
          </text>
        ))}

        {/* The series line */}
        <path className="themed-line-chart__line" d={linePath} />

        {/* Selective direct label: only the last value */}
        <text
          className="themed-line-chart__last-value"
          x={xAt(lastIndex) + 10}
          y={yAt(data[lastIndex].y) + 4}
        >
          {formatValue(data[lastIndex].y)}
          {unit ? ` ${unit}` : ''}
        </text>

        {/* Hover layer: crosshair + marker */}
        {hoverIndex !== null && hovered && (
          <g>
            <line
              className="themed-line-chart__crosshair"
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={MARGIN.top}
              y2={yAt(0)}
            />
            <circle
              className="themed-line-chart__hover-marker"
              cx={xAt(hoverIndex)}
              cy={yAt(hovered.y)}
              r={5}
            />
          </g>
        )}

        {/* Full-plot hover target (bigger than any mark) */}
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={PLOT_WIDTH}
          height={PLOT_HEIGHT}
          fill="transparent"
          onMouseMove={handleMouseMove}
        />
      </svg>

      {hoverIndex !== null && hovered && (
        <div
          className={`themed-line-chart__tooltip${
            tooltipPlacement ? ` themed-line-chart__tooltip--${tooltipPlacement}` : ''
          }`}
          style={{
            left: `${(xAt(hoverIndex) / WIDTH) * 100}%`,
            top: `${(yAt(hovered.y) / HEIGHT) * 100}%`,
          }}
        >
          <div className="themed-line-chart__tooltip-label">{hovered.x}</div>
          <div className="themed-line-chart__tooltip-value">
            {formatValue(hovered.y)}
            {unit ? ` ${unit}` : ''}
          </div>
        </div>
      )}

      <details className="themed-line-chart__table-toggle">
        <summary>Данные таблицей</summary>
        <table className="themed-line-chart__table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th>
                {title}
                {unit ? `, ${unit}` : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={`row-${d.x}`}>
                <td>{d.x}</td>
                <td>{formatValue(d.y)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
