import { Table } from '@gravity-ui/uikit';

import { Legend, LineChart } from '../charts/LineChart';
import { fmt, type RevenueSeries } from '../data';
import { WidgetFrame } from './WidgetFrame';

const SERIES_COLORS = ['var(--viz-series-1)', 'var(--viz-series-2)'];

export function RevenueWidget({ revenue, weekly, onRemove }: { revenue: RevenueSeries; weekly: boolean; onRemove?: () => void }) {
  const series = [
    { name: 'Новые подписки', values: revenue.newRevenue, color: SERIES_COLORS[0] },
    { name: 'Продления', values: revenue.renewals, color: SERIES_COLORS[1] },
  ];
  const labels = revenue.points.map((p) => p.label);

  const rows = revenue.points.map((p, i) => ({
    period: weekly ? `Неделя с ${p.label}` : p.label,
    fresh: fmt.rub(revenue.newRevenue[i]),
    renew: fmt.rub(revenue.renewals[i]),
  }));

  const tableView = (
    <Table
      data={rows}
      columns={[
        { id: 'period', name: 'Период' },
        { id: 'fresh', name: 'Новые подписки', align: 'end' },
        { id: 'renew', name: 'Продления', align: 'end' },
      ]}
      width="max"
    />
  );

  return (
    <WidgetFrame
      title="Выручка"
      subtitle={weekly ? 'по неделям, ₽' : 'по дням, ₽'}
      tableView={tableView}
      onRemove={onRemove}
      toolbar={<Legend series={series} shape="line" />}
    >
      <LineChart labels={labels} series={series} formatValue={fmt.compactRub} formatLabel={(i) => (weekly ? `Неделя с ${labels[i]}` : labels[i])} />
    </WidgetFrame>
  );
}
