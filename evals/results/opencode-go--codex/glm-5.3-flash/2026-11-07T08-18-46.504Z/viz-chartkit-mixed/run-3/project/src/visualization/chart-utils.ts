import type {VisualizationData, VisualizationDataset, VisualizationPoint} from './types';

export interface ChartScale {
  width: number;
  height: number;
  padding: {left: number; right: number; top: number; bottom: number};
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function getChartBounds(data: VisualizationData): {xMin: number; xMax: number; yMin: number; yMax: number} {
  const points = data.series.flatMap((series) => series.points);
  const xValues = points.map((point) => point.timestamp);
  const yValues = points.map((point) => point.value);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const padding = (yMax - yMin) * 0.08 || Math.abs(yMax) * 0.05 || 1;

  return {
    xMin: Math.min(...xValues),
    xMax: Math.max(...xValues),
    yMin: Math.max(0, yMin - padding),
    yMax: yMax + padding,
  };
}

export function createScale(scale: ChartScale, point: VisualizationPoint) {
  const innerWidth = scale.width - scale.padding.left - scale.padding.right;
  const innerHeight = scale.height - scale.padding.top - scale.padding.bottom;
  const xRatio = (point.timestamp - scale.xMin) / (scale.xMax - scale.xMin || 1);
  const yRatio = (point.value - scale.yMin) / (scale.yMax - scale.yMin || 1);

  return {
    x: scale.padding.left + xRatio * innerWidth,
    y: scale.padding.top + innerHeight - yRatio * innerHeight,
  };
}

export function createLinePath(
  series: VisualizationDataset,
  scale: ChartScale,
) {
  return series.points.map((point, index) => {
    const {x, y} = createScale(scale, point);
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1}).format(value);
}

export function formatTimestamp(timestamp: number, mode: 'dense' | 'sparse') {
  const date = new Date(timestamp);
  return mode === 'dense'
    ? date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
    : date.toLocaleDateString('ru-RU', {day: '2-digit', month: 'short'});
}
