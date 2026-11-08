import * as React from 'react';
import { Icon, Label, Table, Text, withTableSelection } from '@gravity-ui/uikit';
import type { TableColumnConfig } from '@gravity-ui/uikit';
import { Grip } from '@gravity-ui/icons';

import type { Order } from '../data/orders';
import { PAYMENT_TITLE, STATUS_META } from '../data/orders';
import { formatDate, formatMoney, reorderColumns } from './tableUtils';

export type ColumnId = 'id' | 'customer' | 'city' | 'createdAt' | 'items' | 'amount' | 'payment' | 'status';

export const DEFAULT_COLUMN_ORDER: ColumnId[] = [
  'id',
  'customer',
  'status',
  'createdAt',
  'items',
  'amount',
  'payment',
  'city',
];

interface ColumnDef {
  title: string;
  width?: number;
  align?: TableColumnConfig<Order>['align'];
  template: (order: Order) => React.ReactNode;
}

const COLUMN_DEFS: Record<ColumnId, ColumnDef> = {
  id: {
    title: 'Номер',
    width: 120,
    template: (o) => (
      <Text variant="body-1" color="primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {o.id}
      </Text>
    ),
  },
  customer: {
    title: 'Клиент',
    width: 240,
    template: (o) => (
      <div className="orders__customer">
        <Text variant="body-1">{o.customer}</Text>
        <Text variant="caption-2" color="secondary" ellipsis>
          {o.email}
        </Text>
      </div>
    ),
  },
  status: {
    title: 'Статус',
    width: 140,
    template: (o) => (
      <Label theme={STATUS_META[o.status].theme} size="s">
        {STATUS_META[o.status].title}
      </Label>
    ),
  },
  createdAt: { title: 'Создан', width: 150, template: (o) => formatDate(o.createdAt) },
  items: { title: 'Позиций', width: 100, align: 'end', template: (o) => o.items },
  amount: {
    title: 'Сумма',
    width: 130,
    align: 'end',
    template: (o) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(o.amount)}</span>,
  },
  payment: { title: 'Оплата', width: 110, template: (o) => PAYMENT_TITLE[o.payment] },
  city: { title: 'Город', width: 160, template: (o) => o.city },
};

/* ---------- column drag & drop ---------- */

interface ColumnDragState {
  draggingId: ColumnId | null;
  overId: ColumnId | null;
  onDragStart: (id: ColumnId, e: React.DragEvent) => void;
  onDragOver: (id: ColumnId, e: React.DragEvent) => void;
  onDrop: (id: ColumnId, e: React.DragEvent) => void;
  onDragEnd: () => void;
}

const ColumnDragContext = React.createContext<ColumnDragState | null>(null);

function DraggableHeader({ id, title }: { id: ColumnId; title: string }) {
  const drag = React.useContext(ColumnDragContext);
  if (!drag) return <>{title}</>;
  return (
    <div
      className={`orders__header${drag.draggingId === id ? ' orders__header_dragging' : ''}`}
      draggable
      title="Перетащите, чтобы поменять колонки местами"
      onDragStart={(e) => drag.onDragStart(id, e)}
      onDragOver={(e) => drag.onDragOver(id, e)}
      onDragEnter={(e) => drag.onDragOver(id, e)}
      onDrop={(e) => drag.onDrop(id, e)}
      onDragEnd={drag.onDragEnd}
    >
      <Icon data={Grip} size={12} className="orders__grip" />
      <span>{title}</span>
    </div>
  );
}

export function useColumnOrder(initial: ColumnId[] = DEFAULT_COLUMN_ORDER) {
  const [columnOrder, setColumnOrder] = React.useState<ColumnId[]>(initial);
  const [draggingId, setDraggingId] = React.useState<ColumnId | null>(null);
  const [overId, setOverId] = React.useState<ColumnId | null>(null);

  const dragState = React.useMemo<ColumnDragState>(
    () => ({
      draggingId,
      overId,
      onDragStart: (id, e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
        setDraggingId(id);
      },
      onDragOver: (id, e) => {
        if (!draggingId) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (id !== overId) setOverId(id);
      },
      onDrop: (id, e) => {
        e.preventDefault();
        const from = (e.dataTransfer.getData('text/plain') as ColumnId) || draggingId;
        if (from) setColumnOrder((prev) => reorderColumns(prev, from, id) as ColumnId[]);
        setDraggingId(null);
        setOverId(null);
      },
      onDragEnd: () => {
        setDraggingId(null);
        setOverId(null);
      },
    }),
    [draggingId, overId],
  );

  const columns = React.useMemo<TableColumnConfig<Order>[]>(
    () =>
      columnOrder.map((id) => {
        const def = COLUMN_DEFS[id];
        const mods = [
          overId === id && draggingId !== id ? 'orders__col_over' : '',
          draggingId === id ? 'orders__col_dragging' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return {
          id,
          name: () => <DraggableHeader id={id} title={def.title} />,
          template: def.template,
          width: def.width,
          align: def.align,
          className: mods || undefined,
          primary: id === 'id',
        };
      }),
    [columnOrder, draggingId, overId],
  );

  const reset = React.useCallback(() => setColumnOrder(DEFAULT_COLUMN_ORDER), []);
  const isDefault = columnOrder.join() === DEFAULT_COLUMN_ORDER.join();

  return { columns, columnOrder, dragState, reset, isDefault };
}

/* ---------- table ---------- */

const SelectableTable = withTableSelection<Order>(Table);

interface OrdersTableProps {
  orders: Order[];
  columns: TableColumnConfig<Order>[];
  dragState: ColumnDragState;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  emptyMessage?: string;
}

export function OrdersTable({
  orders,
  columns,
  dragState,
  selectedIds,
  onSelectionChange,
  emptyMessage,
}: OrdersTableProps) {
  const toggleRow = React.useCallback(
    (order: Order) => {
      onSelectionChange(
        selectedIds.includes(order.id) ? selectedIds.filter((id) => id !== order.id) : [...selectedIds, order.id],
      );
    },
    [selectedIds, onSelectionChange],
  );

  return (
    <ColumnDragContext.Provider value={dragState}>
      <SelectableTable
        className="orders__table"
        data={orders}
        columns={columns}
        getRowId="id"
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        onRowClick={toggleRow}
        emptyMessage={emptyMessage ?? 'Заказы не найдены'}
        aria-label="Заказы"
      />
    </ColumnDragContext.Provider>
  );
}
