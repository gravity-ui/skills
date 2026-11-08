import React from 'react';
import {Chart} from '@gravity-ui/charts';

interface SalesChartProps {
  height?: number;
}

const salesData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Sales',
        data: [
          {x: 1704067200000, y: 1200},
          {x: 1706745600000, y: 1900},
          {x: 1709251200000, y: 1500},
          {x: 1711929600000, y: 2100},
          {x: 1714521600000, y: 1800},
          {x: 1717200000000, y: 2400},
          {x: 1719792000000, y: 2200},
          {x: 1722470400000, y: 2600},
          {x: 1725148800000, y: 2900},
          {x: 1727740800000, y: 3100},
          {x: 1730419200000, y: 2800},
          {x: 1733011200000, y: 3400},
        ],
      },
    ],
  },
};

export function SalesChart({height = 400}: SalesChartProps) {
  return (
    <div style={{height}}>
      <Chart data={salesData} />
    </div>
  );
}
