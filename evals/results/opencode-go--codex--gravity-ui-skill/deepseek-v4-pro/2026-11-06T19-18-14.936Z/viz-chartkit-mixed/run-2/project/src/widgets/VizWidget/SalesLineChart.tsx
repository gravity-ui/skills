import React from 'react';
import type {SalesPoint} from './types';

export interface SalesLineChartProps {
  data: SalesPoint[];
}

export const SalesLineChart = React.lazy(() =>
  import('./SalesLineChartInner').then((m) => ({default: m.SalesLineChartInner})),
);
