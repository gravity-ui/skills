import { Label, Table } from '@gravity-ui/uikit';

import { fmt, type Order, type OrderStatus } from '../data';
import { WidgetFrame } from './WidgetFrame';

const STATUS: Record<OrderStatus, { text: string; theme: 'success' | 'warning' | 'danger' }> = {
  paid: { text: 'Оплачен', theme: 'success' },
  pending: { text: 'Ожидает', theme: 'warning' },
  failed: { text: 'Ошибка', theme: 'danger' },
};

export function OrdersWidget({ orders, onRemove }: { orders: Order[]; onRemove?: () => void }) {
  return (
    <WidgetFrame title="Последние заказы" subtitle={`${orders.length} за период`} onRemove={onRemove}>
      <div className="widget__table">
        <Table
          data={orders}
          columns={[
            { id: 'id', name: '№', template: (o) => <span className="mono">{o.id}</span> },
            { id: 'customer', name: 'Клиент', primary: true },
            { id: 'plan', name: 'Тариф' },
            { id: 'amount', name: 'Сумма', align: 'end', template: (o) => <span className="tabular">{fmt.rub(o.amount)}</span> },
            { id: 'date', name: 'Дата', template: (o) => fmt.date(o.date) },
            {
              id: 'status',
              name: 'Статус',
              template: (o) => (
                <Label theme={STATUS[o.status].theme} size="xs">
                  {STATUS[o.status].text}
                </Label>
              ),
            },
          ]}
          width="max"
          getRowDescriptor={(o) => ({ id: o.id })}
        />
      </div>
    </WidgetFrame>
  );
}
