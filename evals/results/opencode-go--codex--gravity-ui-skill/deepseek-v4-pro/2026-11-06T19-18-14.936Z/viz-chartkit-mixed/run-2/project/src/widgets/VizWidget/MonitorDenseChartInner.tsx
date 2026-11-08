import React from 'react';
import Yagr from '@gravity-ui/yagr/react';
import type {MonitorSeries} from './types';

export interface MonitorDenseChartProps {
  timeline: number[];
  series: MonitorSeries[];
}

export const MonitorDenseChartInner: React.FC<MonitorDenseChartProps> = ({timeline, series}) => {
  const config = React.useMemo(
    () => ({
      timeline,
      series: series.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        type: 'line' as const,
        data: s.data,
      })),
      chart: {
        appearance: {
          theme: 'light' as const,
        },
      },
    }),
    [timeline, series],
  );

  return <Yagr id="monitor-dense-chart" config={config} />;
};
