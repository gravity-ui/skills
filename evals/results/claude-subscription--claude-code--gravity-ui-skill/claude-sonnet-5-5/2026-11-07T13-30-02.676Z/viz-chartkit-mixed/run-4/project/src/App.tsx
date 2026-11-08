import React from 'react';
import {Flex} from '@gravity-ui/uikit';

import {SalesMonitoringWidget} from './SalesMonitoringWidget';
import type {TimeSeries} from './SalesMonitoringWidget';

const DAY = 24 * 3600 * 1000;
const MINUTE = 60 * 1000;

function makeSeries(
  id: string,
  name: string,
  count: number,
  step: number,
  start: number,
  base: number,
  amp: number,
  period: number,
): TimeSeries {
  return {
    id,
    name,
    points: Array.from({length: count}, (_, i) => {
      const noise = Math.sin(i * 12.9898 + base) * 0.5;
      return [start + i * step, base + amp * Math.sin((i / period) * Math.PI * 2) + amp * noise] as const;
    }),
  };
}

export function App() {
  const series = React.useMemo(() => {
    const now = Date.now();
    return {
      sales: [
        makeSeries('online', 'Онлайн', 90, DAY, now - 90 * DAY, 1200, 300, 30),
        makeSeries('retail', 'Розница', 90, DAY, now - 90 * DAY, 800, 150, 14),
      ],
      monitoring: [
        makeSeries('cpu', 'CPU, %', 5000, MINUTE, now - 5000 * MINUTE, 55, 20, 600),
        makeSeries('mem', 'Memory, %', 5000, MINUTE, now - 5000 * MINUTE, 70, 8, 1500),
        makeSeries('rps', 'RPS', 5000, MINUTE, now - 5000 * MINUTE, 400, 120, 300),
      ],
    };
  }, []);

  return (
    <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)', maxWidth: 1200}}>
      <SalesMonitoringWidget
        series={series}
        yAxisTitle={{sales: 'Выручка, ₽', monitoring: 'Значение'}}
      />
    </Flex>
  );
}
