import { Table } from '@gravity-ui/uikit';

import { BarChart } from '../charts/BarChart';
import { fmt, type Channel } from '../data';
import { WidgetFrame } from './WidgetFrame';

export function ChannelsWidget({ channels, onRemove }: { channels: Channel[]; onRemove?: () => void }) {
  const total = channels.reduce((s, c) => s + c.value, 0) || 1;
  const tableView = (
    <Table
      data={channels.map((c) => ({ name: c.name, value: fmt.number(c.value), share: fmt.percent(c.value / total) }))}
      columns={[
        { id: 'name', name: 'Канал' },
        { id: 'value', name: 'Регистрации', align: 'end' },
        { id: 'share', name: 'Доля', align: 'end' },
      ]}
      width="max"
    />
  );
  return (
    <WidgetFrame title="Регистрации по каналам" subtitle="за период, по убыванию" tableView={tableView} onRemove={onRemove}>
      <BarChart data={channels} formatValue={fmt.number} />
    </WidgetFrame>
  );
}
