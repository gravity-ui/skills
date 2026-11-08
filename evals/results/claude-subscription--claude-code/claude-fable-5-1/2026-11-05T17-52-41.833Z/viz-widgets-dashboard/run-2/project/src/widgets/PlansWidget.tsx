import { Table } from '@gravity-ui/uikit';

import { Legend } from '../charts/LineChart';
import { SegmentedBar, type Segment } from '../charts/SegmentedBar';
import { fmt, type Plan } from '../data';
import { WidgetFrame } from './WidgetFrame';

/** Цвет закреплён за тарифом, а не за позицией. */
const PLAN_COLORS: Record<string, { color: string; ink: 'light' | 'dark' }> = {
  Start: { color: 'var(--viz-series-1)', ink: 'light' },
  Pro: { color: 'var(--viz-series-2)', ink: 'light' },
  Business: { color: 'var(--viz-series-3)', ink: 'light' },
  Enterprise: { color: 'var(--viz-series-4)', ink: 'dark' },
};

export function PlansWidget({ plans, onRemove }: { plans: Plan[]; onRemove?: () => void }) {
  const total = plans.reduce((s, p) => s + p.value, 0) || 1;
  const segments: Segment[] = plans.map((p) => ({ name: p.name, value: p.value, ...PLAN_COLORS[p.name] }));
  const tableView = (
    <Table
      data={plans.map((p) => ({ name: p.name, value: fmt.number(p.value), share: fmt.percent(p.value / total) }))}
      columns={[
        { id: 'name', name: 'Тариф' },
        { id: 'value', name: 'Клиентов', align: 'end' },
        { id: 'share', name: 'Доля', align: 'end' },
      ]}
      width="max"
    />
  );
  return (
    <WidgetFrame title="Тарифы" subtitle={`${fmt.number(total)} активных клиентов`} tableView={tableView} onRemove={onRemove}>
      <div className="plans">
        <SegmentedBar segments={segments} formatShare={(share) => fmt.percent(share)} />
        <Legend series={segments} shape="rect" />
      </div>
    </WidgetFrame>
  );
}
