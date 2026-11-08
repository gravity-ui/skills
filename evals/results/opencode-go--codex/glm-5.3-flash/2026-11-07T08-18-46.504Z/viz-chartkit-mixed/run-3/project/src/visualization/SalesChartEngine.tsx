import {createLinePath, createScale, formatNumber, formatTimestamp, getChartBounds, type ChartScale} from './chart-utils';
import type {VisualizationEngineProps} from './types';

export default function SalesChartEngine({data, height}: VisualizationEngineProps) {
  const bounds = getChartBounds(data);
  const scale: ChartScale = {
    width: 760,
    height,
    padding: {left: 58, right: 16, top: 18, bottom: 38},
    ...bounds,
  };
  const yTicks = Array.from({length: 5}, (_, index) => bounds.yMin + ((bounds.yMax - bounds.yMin) * index) / 4);
  const xTickCount = 6;
  const xTicks = Array.from({length: xTickCount}, (_, index) => {
    const ratio = index / (xTickCount - 1);
    const timestamp = bounds.xMin + (bounds.xMax - bounds.xMin) * ratio;

    return {timestamp, x: createScale(scale, {timestamp, value: bounds.yMin}).x};
  });

  return (
    <div className="chart-engine">
      <svg
        className="chart-engine__svg"
        viewBox={`0 0 ${scale.width} ${scale.height}`}
        role="img"
        aria-label="Линейный график продаж"
        preserveAspectRatio="xMidYMid meet"
      >
        {yTicks.map((value) => {
          const {y} = createScale(scale, {timestamp: bounds.xMin, value});

          return (
            <g key={value}>
              <line
                className="chart-engine__grid"
                x1={scale.padding.left}
                x2={scale.width - scale.padding.right}
                y1={y}
                y2={y}
              />
              <text className="chart-engine__axis" x={12} y={y + 4}>{formatNumber(value)}</text>
            </g>
          );
        })}
        {xTicks.map((tick) => (
          <text
            key={tick.timestamp}
            className="chart-engine__axis"
            textAnchor={tick.x === scale.padding.left ? 'start' : tick.x === scale.width - scale.padding.right ? 'end' : 'middle'}
            x={tick.x}
            y={scale.height - 12}
          >
            {formatTimestamp(tick.timestamp, 'sparse')}
          </text>
        ))}
        {data.series.map((series) => (
          <path key={series.id} className="chart-engine__line" d={createLinePath(series, scale)} stroke={series.color} />
        ))}
      </svg>
    </div>
  );
}
