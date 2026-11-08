import React from 'react';
import type {MonitorSeries} from './types';

export interface MonitorDenseChartProps {
  timeline: number[];
  series: MonitorSeries[];
}

export const MonitorDenseChart = React.lazy(() =>
  import('./MonitorDenseChartInner').then((m) => ({default: m.MonitorDenseChartInner})),
);
