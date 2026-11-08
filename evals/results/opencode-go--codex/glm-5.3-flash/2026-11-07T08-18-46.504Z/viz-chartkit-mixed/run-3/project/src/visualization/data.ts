import type {VisualizationData, VisualizationMode} from './types';

const salesDayMs = 24 * 60 * 60 * 1000;
const monitoringPointMs = 60 * 1000;

const generateSeries = (
  count: number,
  stepMs: number,
  valueAt: (index: number) => number,
) => Array.from({length: count}, (_, index) => ({
  timestamp: Date.now() - (count - 1 - index) * stepMs,
  value: valueAt(index),
}));

export const visualizationData: Record<VisualizationMode, VisualizationData> = {
  sales: {
    unit: '₽',
    series: [
      {
        id: 'online',
        label: 'Онлайн',
        color: '#2f81f7',
        points: generateSeries(30, salesDayMs, (index) => 220_000 + Math.sin(index / 4) * 38_000 + index * 1_400),
      },
      {
        id: 'offline',
        label: 'Офлайн',
        color: '#8b5cf6',
        points: generateSeries(30, salesDayMs, (index) => 160_000 + Math.cos(index / 3) * 27_000),
      },
    ],
  },
  monitoring: {
    unit: 'ms',
    series: [
      {
        id: 'p95',
        label: 'p95',
        color: '#f5523d',
        points: generateSeries(720, monitoringPointMs, (index) => 86 + Math.sin(index / 7) * 12 + (index % 97 === 0 ? 42 : index % 31 === 0 ? 18 : 0)),
      },
      {
        id: 'p99',
        label: 'p99',
        color: '#f0b132',
        points: generateSeries(720, monitoringPointMs, (index) => 108 + Math.sin(index / 11) * 15 + (index % 113 === 0 ? 54 : index % 37 === 0 ? 23 : 0)),
      },
    ],
  },
};
