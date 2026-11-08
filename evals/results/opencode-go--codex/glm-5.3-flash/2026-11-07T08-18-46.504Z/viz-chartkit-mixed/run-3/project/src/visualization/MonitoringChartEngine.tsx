import {createLinePath, createScale, formatTimestamp, getChartBounds, type ChartScale} from './chart-utils';
import type {VisualizationEngineProps} from './types';

export default function MonitoringChartEngine({data, height}: VisualizationEngineProps) {
  const bounds = getChartBounds(data);
  const scale: ChartScale = {
    width: 760,
    height,
    padding: {left: 46, right: 10, top: 10, bottom: 26},
    ...bounds,
  };
  const firstSeries = data.series[0];
  const areaPaths = data.series.map((series) => {
    const linePath = createLinePath(series, scale);
    const firstPoint = createScale(scale, series.points[0]);
    const lastPoint = createScale(scale, series.points[series.points.length - 1]);

    return `${linePath} L${lastPoint.x.toFixed(2)},${scale.height - scale.padding.bottom} L${firstPoint.x.toFixed(2)},${scale.height - scale.padding.bottom} Z`;
  });
  const xTickCount = 7;
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
        aria-label="Плотный временной ряд мониторинга"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.series.map((series, index) => (
          <g key={series.id}>
            <path
              className="chart-engine__area"
              d={areaPaths[index]}
              stroke="none"
              fill={series.color}
            />
            <path className="chart-engine__line" d={createLinePath(series, scale)} stroke={series.color} />
          </g>
        ))}
        {firstSeries && (
          <>
            <line
              className="chart-engine__baseline"
              x1={scale.padding.left}
              x2={scale.width - scale.padding.right}
              y1={scale.height - scale.padding.bottom}
              y2={scale.height - scale.padding.bottom}
            />
            {xTicks.map((tick) => (
              <text
                key={tick.timestamp}
                className="chart-engine__axis"
                textAnchor={tick.x === scale.padding.left ? 'start' : tick.x === scale.width - scale.padding.right ? 'end' : 'middle'}
                x={tick.x}
                y={scale.height - 8}
              >
                {formatTimestamp(tick.timestamp, 'dense')}
              </text>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
