import { useState } from 'react';

import { BarChart } from './BarChart';
import { DataTable } from './chartParts';
import { ChartViewToggle, type ChartView } from './ChartViewToggle';
import { ORDERS_BY_REGION } from './data';
import { formatInteger } from './format';
import { WidgetFrame } from './WidgetFrame';
import type { WidgetProps } from './types';

export function OrdersWidget(frame: WidgetProps) {
  const [view, setView] = useState<ChartView>('chart');
  return (
    <WidgetFrame {...frame} subtitle="Заказы за 30 дней" actions={<ChartViewToggle view={view} onChange={setView} />}>
      {view === 'chart' ? (
        <BarChart items={ORDERS_BY_REGION} color="var(--viz-s1)" format={formatInteger} />
      ) : (
        <DataTable
          rowHeader="Регион"
          rows={ORDERS_BY_REGION.map((r) => r.name)}
          columns={[{ name: 'Заказы', values: ORDERS_BY_REGION.map((r) => r.value) }]}
          format={formatInteger}
        />
      )}
    </WidgetFrame>
  );
}
