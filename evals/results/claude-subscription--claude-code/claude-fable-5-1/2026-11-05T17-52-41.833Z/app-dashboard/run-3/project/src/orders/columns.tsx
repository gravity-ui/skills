import { Label, Text } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';

import { STATUS_META, type Order } from './types';
import { formatDate, formatMoney } from './utils';

export type ColumnId = 'id' | 'customer' | 'status' | 'createdAt' | 'itemsCount' | 'total' | 'payment' | 'city';

export interface ColumnDef {
  id: ColumnId;
  title: string;
  config: Omit<TableColumnConfig<Order>, 'id' | 'name'>;
}

export const COLUMN_DEFS: Record<ColumnId, ColumnDef> = {
  id: {
    id: 'id',
    title: '№ заказа',
    config: {
      width: 110,
      primary: true,
      template: (order) => <span className="orders-table__mono">{order.id}</span>,
    },
  },
  customer: {
    id: 'customer',
    title: 'Клиент',
    config: { width: '100%' },
  },
  status: {
    id: 'status',
    title: 'Статус',
    config: {
      width: 130,
      template: (order) => (
        <Label theme={STATUS_META[order.status].theme} size="s">
          {STATUS_META[order.status].title}
        </Label>
      ),
    },
  },
  createdAt: {
    id: 'createdAt',
    title: 'Дата',
    config: {
      width: 140,
      template: (order) => (
        <Text color="secondary" className="orders-table__mono">
          {formatDate(order.createdAt)}
        </Text>
      ),
    },
  },
  itemsCount: {
    id: 'itemsCount',
    title: 'Товаров',
    config: { width: 80, align: 'end', template: (order) => <span className="orders-table__mono">{order.itemsCount}</span> },
  },
  total: {
    id: 'total',
    title: 'Сумма',
    config: {
      width: 120,
      align: 'end',
      template: (order) => <span className="orders-table__mono">{formatMoney(order.total)}</span>,
    },
  },
  payment: {
    id: 'payment',
    title: 'Оплата',
    config: { width: 200 },
  },
  city: {
    id: 'city',
    title: 'Город',
    config: { width: 150 },
  },
};

export const DEFAULT_COLUMN_ORDER: ColumnId[] = [
  'id',
  'customer',
  'status',
  'createdAt',
  'itemsCount',
  'total',
  'payment',
  'city',
];
