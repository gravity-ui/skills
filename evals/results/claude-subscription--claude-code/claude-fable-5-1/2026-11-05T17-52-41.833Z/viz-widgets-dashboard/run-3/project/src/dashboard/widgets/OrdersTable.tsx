import {Icon, Label, Table} from '@gravity-ui/uikit';
import type {TableColumnConfig} from '@gravity-ui/uikit';

import type {OrderRow} from '../data';
import {formatMoney, formatShortDate} from '../format';
import {CheckIcon, EllipsisIcon, TrashIcon} from '../icons';

const STATUS: Record<OrderRow['status'], {text: string; theme: 'success' | 'info' | 'danger'; icon: typeof CheckIcon}> = {
  paid: {text: 'Оплачен', theme: 'success', icon: CheckIcon},
  processing: {text: 'В обработке', theme: 'info', icon: EllipsisIcon},
  cancelled: {text: 'Отменён', theme: 'danger', icon: TrashIcon},
};

const columns: TableColumnConfig<OrderRow>[] = [
  {id: 'id', name: 'Заказ', template: (row) => row.id},
  {id: 'customer', name: 'Клиент', template: (row) => row.customer},
  {id: 'amount', name: 'Сумма', align: 'end', className: 'viz-num', template: (row) => formatMoney(row.amount)},
  {
    id: 'status',
    name: 'Статус',
    template: (row) => {
      const s = STATUS[row.status];
      return (
        <Label theme={s.theme} size="xs" icon={<Icon data={s.icon} size={12} />}>
          {s.text}
        </Label>
      );
    },
  },
  {id: 'date', name: 'Дата', align: 'end', className: 'viz-num', template: (row) => formatShortDate(row.date)},
];

/** Plain data widget on top of the Gravity UI table. Status is icon + label, never color alone. */
export function OrdersTable({orders}: {orders: OrderRow[]}) {
  return (
    <div className="viz-table" role="region" aria-label="Последние заказы" tabIndex={0}>
      <Table data={orders} columns={columns} width="max" getRowDescriptor={(row) => ({id: row.id})} />
    </div>
  );
}
