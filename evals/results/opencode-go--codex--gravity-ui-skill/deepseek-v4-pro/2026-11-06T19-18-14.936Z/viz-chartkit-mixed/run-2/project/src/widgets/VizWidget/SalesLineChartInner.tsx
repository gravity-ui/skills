import React from 'react';
import {Chart} from '@gravity-ui/charts';
import type {SalesPoint} from './types';

export interface SalesLineChartProps {
  data: SalesPoint[];
}

export const SalesLineChartInner: React.FC<SalesLineChartProps> = ({data}) => {
  const chartData = {
    series: {
      data: [
        {
          type: 'line' as const,
          name: 'Продажи',
          data: data.map((p) => ({x: p.x, y: p.y})),
        },
      ],
    },
  };

  return <Chart data={chartData} />;
};
