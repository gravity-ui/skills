import { useMemo, useState } from 'react';

import { DataTable, Legend } from './chartParts';
import { ChartViewToggle, type ChartView } from './ChartViewToggle';
import { getPeriod } from './data';
import { formatCompact, formatDay, formatInteger } from './format';
import { LineChart } from './LineChart';
import { usePeriod } from './PeriodContext';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

export function TrafficWidget(frame: WidgetProps) {
  const days = usePeriod();
  const [view, setView] = useState<ChartView>('chart');

  const { labels, series } = useMemo(() => {
    const { current } = getPeriod(days);
    return {
      labels: current.map((p) => formatDay(p.date)),
      series: [
        { name: 'Веб', color: 'var(--viz-s1)', values: current.map((p) => p.web) },
        { name: 'Мобильное приложение', color: 'var(--viz-s2)', values: current.map((p) => p.mobile) },
      ],
    };
  }, [days]);

  return (
    <WidgetFrame {...frame} subtitle="Сессии в день" actions={<ChartViewToggle view={view} onChange={setView} />}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>
        <Legend items={series} kind="line" />
        <div style={{ flex: 1, minHeight: 0 }}>
          {view === 'chart' ? (
            <LineChart labels={labels} series={series} format={formatCompact} />
          ) : (
            <DataTable rowHeader="Дата" rows={labels} columns={series} format={formatInteger} />
          )}
        </div>
      </div>
    </WidgetFrame>
  );
}
