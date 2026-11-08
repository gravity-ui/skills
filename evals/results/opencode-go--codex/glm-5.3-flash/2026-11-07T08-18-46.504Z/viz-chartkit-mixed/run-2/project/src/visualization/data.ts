import type {VisualizationData} from './types';

export const visualizationData: VisualizationData = {
  sales: Array.from({length: 14}, (_, index) => {
    const date = new Date(Date.UTC(2026, 9, index + 1));
    const weeklyGrowth = Math.sin(index / 3) * 18000;
    const trend = index * 12000;

    return {
      date: date.toISOString().slice(0, 10),
      revenue: Math.round(120000 + trend + weeklyGrowth),
      orders: Math.round(220 + index * 18 + Math.sin(index / 2) * 45),
    };
  }),
  monitoring: Array.from({length: 720}, (_, index) => {
    const timestamp = Date.UTC(2026, 10, 7, 10, 0) + index * 1000;
    const loadWave = Math.sin(index / 24) * 18;
    const spike = index % 180 > 170 ? 340 : 0;

    return {
      timestamp,
      responseTimeMs: Math.round(92 + loadWave * 1.4 + spike + Math.sin(index / 7) * 11),
      cpuLoad: Number((48 + loadWave + spike / 12).toFixed(1)),
    };
  }),
};
